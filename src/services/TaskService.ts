import { formatISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/supabase';
import { calculateDailyCapacity, scheduleTask, runSchedulingAlgorithm } from './schedulingService';
import {
    Task,
    Tag,
    Person,
    Priority,
    EffortLevel,
    DueDateType,
    RecurrenceRule,
    RecurrenceFrequency,
    TaskStatus,
    TaskCreationPayload,
    TaskUpdatePayload,
} from '@/types';
import {
    addDays,
    addWeeks,
    addMonths,
    addYears,
    getDay,
    setDate,
    getMonth,
    endOfMonth,
    getDate,
    setMonth,
} from 'date-fns';

export interface GetTasksFilters {
    userId?: string; // Will be fetched if not provided
    projectId?: string | null;
    status?: TaskStatus;
    isArchived?: boolean; // Default will be false if not specified by caller
    completedAfter?: string; // ISO date string (inclusive)
    completedBefore?: string; // ISO date string (inclusive)
}

// DB specific types (representing raw Supabase responses)
interface DbRecurrenceRule {
    id: string;
    task_id?: string; // Can be null if it's a template or not yet associated
    user_id: string;
    frequency: RecurrenceFrequency;
    interval: number;
    days_of_week?: number[] | null;
    day_of_month?: number | null;
    month_of_year?: number | null;
    repeat_only_on_completion?: boolean | null;
    end_condition_type?: 'never' | 'onDate' | 'afterOccurrences' | null;
    end_date?: string | null; // ISO date string from DB
    count?: number | null;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
}

// Assuming Tag and Person types from '@/types' are suitable for DB representation of a tag/person itself
interface DbTag extends Tag {}
interface DbPerson extends Person {}

interface DbTaskTagLink {
    task_id: string;
    tag_id: string;
    tags: DbTag; // The nested tag object from the join
}

interface DbTaskPersonLink {
    task_id: string;
    person_id: string;
    people: DbPerson; // The nested person object from the join
}

interface DbTask {
    id: string;
    user_id: string;
    title: string;
    description?: string | null;
    status: TaskStatus;
    priority: Priority;
    due_date?: string | null; // ISO date string
    due_date_type?: DueDateType | null;
    target_deadline?: string | null; // ISO date string
    go_live_date?: string | null; // ISO date string
    effort_level: EffortLevel;
    completed_date?: string | null; // ISO date string
    scheduled_start_date?: string | null; // ISO date string
    dependencies?: string[] | null; // Assuming array of task IDs
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
    original_scheduled_date?: string | null; // ISO date string
    recurrence_rule_id?: string | null;
    is_recurring_instance?: boolean | null;
    original_recurring_task_id?: string | null;
    is_archived: boolean;

    // Optional nested objects based on SELECT queries
    task_recurrence_rules?: DbRecurrenceRule | DbRecurrenceRule[] | null; // Can be single or array depending on query
    task_tags?: DbTaskTagLink[];
    task_people?: DbTaskPersonLink[];
}

// Helper function to map DB recurrence rule to frontend type
const mapDbRecurrenceRuleToRecurrenceRule = (
    dbRule: DbRecurrenceRule | null | undefined
): RecurrenceRule | null => {
    if (!dbRule) return null;
    return {
        id: dbRule.id,
        frequency: dbRule.frequency,
        interval: dbRule.interval,
        daysOfWeek: dbRule.days_of_week,
        dayOfMonth: dbRule.day_of_month,
        monthOfYear: dbRule.month_of_year,
        repeatOnlyOnCompletion: dbRule.repeat_only_on_completion,
        endConditionType: dbRule.end_condition_type,
        endDate: dbRule.end_date ? new Date(dbRule.end_date) : null,
        count: dbRule.count, // Added count as it was missing in the original snippet but used in RecurrenceRule type
    };
};

// Helper function to map DB task to frontend Task type
const mapDbTaskToTask = (
    dbTask: DbTask,
    recurrenceRule?: RecurrenceRule | null,
    tags?: Tag[],
    people?: Person[]
): Task => {
    return {
        id: dbTask.id,
        title: dbTask.title,
        description: dbTask.description,
        status: dbTask.status as TaskStatus,
        priority: dbTask.priority as Priority,
        dueDate: dbTask.due_date ? new Date(dbTask.due_date) : null,
        dueDateType: dbTask.due_date_type as DueDateType,
        targetDeadline: dbTask.target_deadline
            ? new Date(dbTask.target_deadline)
            : null,
        goLiveDate: dbTask.go_live_date ? new Date(dbTask.go_live_date) : null,
        effortLevel: dbTask.effort_level as EffortLevel,
        completed: dbTask.completed_date ? true : false,
        completedDate: dbTask.completed_date
            ? new Date(dbTask.completed_date)
            : null,
        scheduled_start_date: dbTask.scheduled_start_date
            ? new Date(dbTask.scheduled_start_date)
            : null,
        tags:
            tags ||
            (dbTask.task_tags ? dbTask.task_tags.map((tt) => tt.tags) : []),
        people:
            people ||
            (dbTask.task_people
                ? dbTask.task_people.map((tp) => tp.people)
                : []),
        dependencies: dbTask.dependencies || [],
        createdAt: new Date(dbTask.created_at),
        updatedAt: new Date(dbTask.updated_at),
        originalScheduledDate: dbTask.original_scheduled_date
            ? new Date(dbTask.original_scheduled_date)
            : null,
        recurrenceRuleId: dbTask.recurrence_rule_id,
        recurrenceRule:
            recurrenceRule ||
            (dbTask.task_recurrence_rules
                ? mapDbRecurrenceRuleToRecurrenceRule(
                      Array.isArray(dbTask.task_recurrence_rules)
                          ? dbTask.task_recurrence_rules[0]
                          : dbTask.task_recurrence_rules
                  )
                : undefined),
        isRecurringInstance: dbTask.is_recurring_instance,
        originalRecurringTaskId: dbTask.original_recurring_task_id,
        is_archived: dbTask.is_archived,
        userId: dbTask.user_id,
    };
};

export const TaskService = {
  /**
   * Gets all tasks that are not completed or archived (i.e., schedulable)
   * @param userId The user ID
   * @returns Promise with array of tasks
   */
  async getAllSchedulableTasks(userId: string): Promise<Task[]> {
    console.log(`[TaskService.getAllSchedulableTasks] Getting all schedulable tasks for user ${userId}`);
    if (!userId) {
      const errorMsg = 'User ID is required to get schedulable tasks';
      console.error(`[TaskService.getAllSchedulableTasks] ${errorMsg}`);
      throw new Error(errorMsg);
    }

    try {
      return await this.getTasks({
        userId,
        isArchived: false,
        status: undefined // This will get ALL statuses except COMPLETED due to the filter below
      }).then(tasks => tasks.filter(task => task.status !== TaskStatus.COMPLETED));
    } catch (error) {
      console.error(`[TaskService.getAllSchedulableTasks] Error getting schedulable tasks:`, error);
      throw new Error(`Failed to get schedulable tasks: ${(error as Error).message}`);
    }
  },
    // Method to get the current user ID, can be expanded or moved as needed
    async getCurrentUserId(): Promise<string | null> {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        console.log(
            '[TaskService.getCurrentUserId] User authenticated:',
            user?.id
        );
        return user?.id || null;
    },

    async getOccurrenceCount(originalTaskId: string): Promise<number> {
        console.log(
            '[TaskService.getOccurrenceCount] Getting occurrence count for task:',
            originalTaskId
        );
        const { count, error } = await supabase
            .from('tasks')
            .select('id', { count: 'exact', head: true })
            .or(
                `id.eq.${originalTaskId},original_recurring_task_id.eq.${originalTaskId}`
            );
        console.log(
            '[TaskService.getOccurrenceCount] Occurrence count response:',
            count,
            error
        );
        if (error) {
            console.error('Error fetching occurrence count:', error);
            return Infinity; // Return a high number to prevent further recurrences on error
        }
        return count || 0;
    },

    async calculateNextDueDate(
        currentDueDate: Date,
        rule: RecurrenceRule,
        originalTaskId: string
    ): Promise<Date | null> {
        console.log(
            '[TaskService.calculateNextDueDate] Calculating next due date for task:',
            originalTaskId,
            'with rule:',
            rule
        );
        if (!currentDueDate || !rule) return null;

        if (
            rule.endConditionType === 'afterOccurrences' &&
            rule.count &&
            rule.count > 0
        ) {
            const occurrences = await this.getOccurrenceCount(originalTaskId);
            console.log(
                '[TaskService.calculateNextDueDate] Occurrences:',
                occurrences
            );
            if (occurrences >= rule.count) {
                return null;
            }
        }

        let nextDate = new Date(currentDueDate);
        const interval = rule.interval > 0 ? rule.interval : 1;

        switch (rule.frequency) {
            case 'daily':
                nextDate = addDays(nextDate, interval);
                break;
            case 'weekly':
                if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
                    let candidateDate = new Date(nextDate);
                    candidateDate = addWeeks(candidateDate, interval - 1);
                    let attempts = 0;
                    while (attempts < 7 * interval + 7) {
                        candidateDate = addDays(candidateDate, 1);
                        if (rule.daysOfWeek.includes(getDay(candidateDate))) {
                            if (candidateDate > currentDueDate) {
                                nextDate = candidateDate;
                                break;
                            }
                        }
                        attempts++;
                    }
                    if (attempts >= 7 * interval + 7) return null;
                } else {
                    nextDate = addWeeks(nextDate, interval);
                }
                break;
            case 'monthly': {
                let monthCandidate = addMonths(
                    new Date(currentDueDate),
                    interval
                );
                if (rule.dayOfMonth) {
                    if (rule.dayOfMonth > 0) {
                        const potentialDate = setDate(
                            monthCandidate,
                            rule.dayOfMonth
                        );
                        if (
                            getMonth(potentialDate) !== getMonth(monthCandidate)
                        ) {
                            nextDate = endOfMonth(monthCandidate);
                        } else {
                            nextDate = potentialDate;
                        }
                    } else {
                        const lastDay = endOfMonth(monthCandidate);
                        nextDate = addDays(lastDay, rule.dayOfMonth + 1);
                    }
                } else {
                    nextDate = monthCandidate;
                }
                if (nextDate <= currentDueDate) {
                    monthCandidate = addMonths(nextDate, interval);
                    if (rule.dayOfMonth) {
                        if (rule.dayOfMonth > 0) {
                            const potentialDate = setDate(
                                monthCandidate,
                                rule.dayOfMonth
                            );
                            if (
                                getMonth(potentialDate) !==
                                getMonth(monthCandidate)
                            )
                                nextDate = endOfMonth(monthCandidate);
                            else nextDate = potentialDate;
                        } else {
                            nextDate = addDays(
                                endOfMonth(monthCandidate),
                                rule.dayOfMonth + 1
                            );
                        }
                    } else {
                        nextDate = monthCandidate;
                    }
                }
                break;
            }
            case 'yearly': {
                let yearCandidate = addYears(
                    new Date(currentDueDate),
                    interval
                );
                if (rule.monthOfYear && rule.dayOfMonth) {
                    const targetMonth = rule.monthOfYear - 1;
                    const potentialDate = setDate(
                        setMonth(yearCandidate, targetMonth),
                        rule.dayOfMonth
                    );
                    if (
                        getMonth(potentialDate) !== targetMonth ||
                        getDate(potentialDate) !== rule.dayOfMonth
                    ) {
                        nextDate = endOfMonth(
                            setMonth(yearCandidate, targetMonth)
                        );
                    } else {
                        nextDate = potentialDate;
                    }
                } else {
                    nextDate = yearCandidate;
                }
                if (nextDate <= currentDueDate) {
                    yearCandidate = addYears(nextDate, interval);
                    if (rule.monthOfYear && rule.dayOfMonth) {
                        const targetMonth = rule.monthOfYear - 1;
                        const potentialDate = setDate(
                            setMonth(yearCandidate, targetMonth),
                            rule.dayOfMonth
                        );
                        if (
                            getMonth(potentialDate) !== targetMonth ||
                            getDate(potentialDate) !== rule.dayOfMonth
                        )
                            nextDate = endOfMonth(
                                setMonth(yearCandidate, targetMonth)
                            );
                        else nextDate = potentialDate;
                    } else {
                        nextDate = yearCandidate;
                    }
                }
                break;
            }
            default:
                return null;
        }

        if (rule.endConditionType === 'onDate' && rule.endDate) {
            if (nextDate > rule.endDate) {
                return null;
            }
        }

        if (nextDate <= currentDueDate) {
            console.warn(
                'Calculated nextDueDate is not after currentDueDate. Attempting fallback.',
                { currentDueDate, nextDate, rule }
            );
            switch (rule.frequency) {
                case 'daily':
                    nextDate = addDays(nextDate, 1);
                    break;
                case 'weekly':
                    nextDate = addWeeks(nextDate, 1);
                    break;
                case 'monthly':
                    nextDate = addMonths(nextDate, 1);
                    break;
                case 'yearly':
                    nextDate = addYears(nextDate, 1);
                    break;
            }
            if (
                rule.endConditionType === 'onDate' &&
                rule.endDate &&
                nextDate > rule.endDate
            )
                return null;
        }

        if (nextDate <= currentDueDate) return null;
        return nextDate;
    },

    async getRecurrenceRuleById(
        ruleId: string
    ): Promise<RecurrenceRule | null> {
        console.log(
            '[TaskService.getRecurrenceRuleById] Getting recurrence rule by ID:',
            ruleId
        );
        const { data: rawData, error } = await supabase
            .from('recurrence_rules' as any)
            .select('*')
            .eq('id', ruleId)
            .single();
        console.log(
            '[TaskService.getRecurrenceRuleById] Recurrence rule response:',
            rawData,
            error
        );
        const data = rawData as any;
        if (error) {
            console.error('Error fetching recurrence rule:', error);
            return null;
        }
        if (!data) return null;
        return {
            id: data.id,
            frequency: data.frequency as RecurrenceFrequency,
            interval: data.interval,
            daysOfWeek: data.days_of_week,
            dayOfMonth: data.day_of_month,
            monthOfYear: data.month_of_year,
            repeatOnlyOnCompletion: data.repeat_only_on_completion,
            endConditionType: data.end_condition_type as
                | 'never'
                | 'onDate'
                | 'afterOccurrences',
            endDate: data.end_date ? new Date(data.end_date) : null,
            count: data.count,
        } as RecurrenceRule;
    },

    // Tasks
    async getTasks(filters: GetTasksFilters = {}): Promise<Task[]> {
        let userIdToUse = filters.userId;
        if (!userIdToUse) {
            const { data: user, error: userError } = await supabase.auth.getUser();
            if (userError || !user?.user) {
                console.error(
                    '[TaskService.getTasks] User not found or error fetching user (and no userId provided in filters):',
                    userError
                );
                return [];
            }
            userIdToUse = user.user.id;
        }

        console.log(
            `[TaskService.getTasks] Fetching tasks for user ${userIdToUse} with filters: ${JSON.stringify(filters)}`
        );

        // Prepare parameters for the RPC call
        const rpcParams: any = {
            p_user_id: userIdToUse,
            // Default isArchived to false if not specified, otherwise use the provided value
            p_include_archived: filters.isArchived === undefined ? false : filters.isArchived,
        };

        if (filters.projectId !== undefined) {
            rpcParams.p_project_id = filters.projectId;
        }
        if (filters.status) {
            rpcParams.p_status = filters.status;
        }
        if (filters.completedAfter) {
            rpcParams.p_completed_after = filters.completedAfter;
        }
        if (filters.completedBefore) {
            rpcParams.p_completed_before = filters.completedBefore;
        }

        try {
            const { data: rpcData, error: rpcError } = await supabase.rpc(
                'get_tasks_with_relations_for_user',
                rpcParams
            );

            if (rpcError) {
                console.error(
                    `[TaskService.getTasks] RPC error fetching tasks for user ${userIdToUse}:`,
                    rpcError
                );
                throw new Error(`Failed to fetch tasks: ${rpcError.message}`);
            }

            if (!rpcData || !Array.isArray(rpcData)) {
                console.warn(
                    `[TaskService.getTasks] No tasks found or unexpected data format for user ${userIdToUse} via RPC.`
                );
                return [];
            }

            return rpcData.map((dbTask) => {
                const recurrenceRule = dbTask.task_recurrence_rules
                    ? mapDbRecurrenceRuleToRecurrenceRule(
                          Array.isArray(dbTask.task_recurrence_rules)
                              ? dbTask.task_recurrence_rules[0]
                              : dbTask.task_recurrence_rules
                      )
                    : null;
                const tags =
                    dbTask.task_tags
                        ?.map((tt: any) => tt.tags as Tag)
                        .filter(Boolean) || [];
                const people =
                    dbTask.task_people
                        ?.map((tp: any) => tp.people as Person)
                        .filter(Boolean) || [];
                return mapDbTaskToTask(
                    dbTask as DbTask,
                    recurrenceRule,
                    tags,
                    people
                );
            });
        } catch (error) {
            console.error(
                `[TaskService.getTasks] Unexpected error fetching tasks for user ${userIdToUse}:`,
                error
            );
            if (
                error instanceof Error &&
                error.message.startsWith('Failed to fetch tasks:')
            ) {
                throw error;
            }
            throw new Error(
                `Failed to fetch tasks: ${(error as Error).message}`
            );
        }
    },

    async getTasksContributingToEffortOnDate(targetDate: string, userId: string): Promise<Task[]> {
        try {
            // Query for PENDING tasks scheduled on the targetDate
            const { data: pendingTasksData, error: pendingError } = await supabase
                .from('tasks')
                .select(`
                    *,
                    task_recurrence_rules(*),
                    task_tags(tags(*)),
                    task_people(people(*))
                `)
                .eq('user_id', userId)
                .eq('status', TaskStatus.PENDING)
                .eq('is_archived', false)
                .eq('scheduled_start_date', targetDate);

            if (pendingError) {
                console.error('[TaskService.getTasksContributingToEffortOnDate] Error fetching PENDING tasks:', pendingError);
                throw pendingError;
            }

            // Query for IN_PROGRESS tasks active on the targetDate
            const { data: inProgressTasksData, error: inProgressError } = await supabase
                .from('tasks')
                .select(`
                    *,
                    task_recurrence_rules(*),
                    task_tags(tags(*)),
                    task_people(people(*))
                `)
                .eq('user_id', userId)
                .eq('status', TaskStatus.IN_PROGRESS)
                .eq('is_archived', false)
                .lte('scheduled_start_date', targetDate)
                .gte('scheduled_completion_date', targetDate);

            if (inProgressError) {
                console.error('[TaskService.getTasksContributingToEffortOnDate] Error fetching IN_PROGRESS tasks:', inProgressError);
                throw inProgressError;
            }

            const combinedDbTasks = [
                ...(pendingTasksData || []),
                ...(inProgressTasksData || [])
            ];

            // Deduplicate tasks: although status-based queries should prevent direct overlap,
            // this ensures safety if a task somehow matched both (e.g., data inconsistency)
            const uniqueDbTasks = Array.from(new Map(combinedDbTasks.map(task => [task.id, task])).values());

            return uniqueDbTasks.map(dbTask => {
                const recurrenceRule = dbTask.task_recurrence_rules
                    ? mapDbRecurrenceRuleToRecurrenceRule(
                        Array.isArray(dbTask.task_recurrence_rules)
                            ? dbTask.task_recurrence_rules[0]
                            : dbTask.task_recurrence_rules
                      )
                    : null;
                const tags = dbTask.task_tags?.map((tt: any) => tt.tags as Tag).filter(Boolean) || [];
                const people = dbTask.task_people?.map((tp: any) => tp.people as Person).filter(Boolean) || [];
                return mapDbTaskToTask(dbTask as DbTask, recurrenceRule, tags, people);
            });

        } catch (error) {
            console.error('[TaskService.getTasksContributingToEffortOnDate] Unexpected error:', error);
            throw new Error('Failed to fetch tasks contributing to effort on date.');
        }
    },

    async getTags(): Promise<Tag[]> {
        const userId = await this.getCurrentUserId();
        if (!userId) {
            console.warn('[TaskService.getTags] User not authenticated. Returning empty array.');
            return [];
        }

        console.log(`[TaskService.getTags] Fetching tags for user ${userId}`);
        try {
            const { data, error } = await supabase
                .from('tags')
                .select('*')
                .eq('user_id', userId);

            if (error) {
                console.error(`[TaskService.getTags] Error fetching tags for user ${userId}:`, error);
                throw new Error(`Failed to fetch tags: ${error.message}`);
            }

            console.log(`[TaskService.getTags] Fetched ${data?.length || 0} tags for user ${userId}.`);
            return (data as Tag[]) || [];
        } catch (error) {
            console.error(`[TaskService.getTags] Unexpected error fetching tags for user ${userId}:`, error);
            if (error instanceof Error && error.message.startsWith('Failed to fetch tags')) {
                throw error;
            }
            throw new Error(`An unexpected error occurred while fetching tags: ${(error as Error).message}`);
        }
    },

    async getPeople(): Promise<Person[]> {
        const userId = await this.getCurrentUserId();
        if (!userId) {
            console.warn('[TaskService.getPeople] User not authenticated. Returning empty array.');
            return [];
        }

        console.log(`[TaskService.getPeople] Fetching people for user ${userId}`);
        try {
            const { data, error } = await supabase
                .from('people')
                .select('*')
                .eq('user_id', userId);

            if (error) {
                console.error(`[TaskService.getPeople] Error fetching people for user ${userId}:`, error);
                throw new Error(`Failed to fetch people: ${error.message}`);
            }
            console.log(`[TaskService.getPeople] Fetched ${data?.length || 0} people for user ${userId}.`);
            return (data as Person[]) || [];
        } catch (error) {
            console.error(`[TaskService.getPeople] Unexpected error fetching people for user ${userId}:`, error);
            if (error instanceof Error && error.message.startsWith('Failed to fetch people')) {
                throw error;
            }
            throw new Error(`An unexpected error occurred while fetching people: ${(error as Error).message}`);
        }
    },

    async getTagsForTask(taskId: string, userId?: string): Promise<Tag[]> {
        console.log(
            '[TaskService.getTagsForTask] Getting tags for task:',
            taskId,
            'with user ID:',
            userId
        );
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            console.error(
                'User not authenticated, cannot fetch tags for task.'
            );
            return [];
        }
        const { data, error } = await supabase
            .from('task_tags')
            .select('tags(*)') // Select all columns from the related 'tags' table
            .eq('task_id', taskId)
            .eq('user_id', userId || user.id)
            .order('name', { referencedTable: 'tags' });
        console.log('[TaskService.getTagsForTask] Tags response:', data, error);
        if (error) {
            console.error('Error fetching tags for task:', error);
            return [];
        }
        // The 'data' will be an array of objects like { tags: Tag }, so we need to map it
        // Ensure that item.tags is not null or undefined before accessing properties
        return data
            ? (data
                  .map((item: any) => item.tags)
                  .filter(
                      (tag) =>
                          tag &&
                          typeof tag === 'object' &&
                          'id' in tag &&
                          'name' in tag
                  ) as Tag[])
            : [];
    },

    async getPeopleForTask(taskId: string, userId?: string): Promise<Person[]> {
        console.log(
            `[TaskService.getPeopleForTask] Fetching people for task ${taskId}, user ${userId}`
        );
        const { data: authData, error: authError } =
            await supabase.auth.getUser();
        if (authError || !authData.user) {
            console.error(
                '[TaskService.getPeopleForTask] User not authenticated:',
                authError
            );
            return [];
        }
        const currentUserId = userId || authData.user.id;
        // Attempting to refresh linter state

        const { data, error } = await supabase
            .from('task_people')
            .select('people(*)')
            .eq('task_id', taskId)
            .eq('user_id', currentUserId);

        if (error) {
            console.error(
                `[TaskService.getPeopleForTask] Error fetching people for task ${taskId}:`,
                error
            );
            return [];
        }

        const people = data
            ?.map((item: DbTaskPersonLink) => item.people)
            .filter(Boolean) as Person[];
        console.log(
            `[TaskService.getPeopleForTask] People for task ${taskId}:`,
            people
        );
        return people;
    },

    async createTask(
    taskInput: Omit<
    Task,
    | 'id'
    | 'createdAt'
    | 'updatedAt'
    | 'userId'
    | 'is_archived'
    | 'recurrenceRule'
        // Add scheduled_start_date here if it's not part of the Omit and should be optional/handled
    > & {
    recurrenceRule?: Omit<
    RecurrenceRule,
        'id' | 'taskId' | 'userId' | 'createdAt' | 'updatedAt'
        >;
        // Ensure scheduled_start_date is part of taskInput if it's expected
    }
): Promise<Task> {
    console.log(
        '[TaskService.createTask] Called with input:',
        JSON.stringify(taskInput)
    );
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();
    console.log(
    '[TaskService.createTask] supabase.auth.getUser response - user:',
    user ? user.id : 'null',
        'error:',
        userError
    );

    if (userError || !user) {
    console.error(
        '[TaskService.createTask] User not authenticated or error fetching user:',
        userError
        );
        throw new Error('User not authenticated');
    }

    const { tags, people, recurrenceRule, ...mainTaskInput } = taskInput;
    console.log(
        '[TaskService.createTask] mainTaskInput after destructuring:',
        JSON.stringify(mainTaskInput)
    );
    console.log('[TaskService.createTask] tags:', tags);
    console.log('[TaskService.createTask] people:', people);
    console.log('[TaskService.createTask] recurrenceRule:', recurrenceRule);

    const dbTaskPayload: Database['public']['Tables']['tasks']['Insert'] = {
    user_id: user.id,
    title: mainTaskInput.title,
    description: mainTaskInput.description,
    status: mainTaskInput.status ?? TaskStatus.PENDING,
    priority: mainTaskInput.priority ?? Priority.NORMAL,
    due_date: mainTaskInput.dueDate
        ? formatISO(new Date(mainTaskInput.dueDate)) // Using formatISO
        : null,
    due_date_type: mainTaskInput.dueDateType,
    target_deadline: mainTaskInput.targetDeadline
        ? formatISO(new Date(mainTaskInput.targetDeadline)) // Using formatISO
    : null,
    go_live_date: mainTaskInput.goLiveDate
        ? formatISO(new Date(mainTaskInput.goLiveDate)) // Using formatISO
        : null,
    effort_level: mainTaskInput.effortLevel ?? EffortLevel.M,
    completed_date: mainTaskInput.completedDate
        ? formatISO(new Date(mainTaskInput.completedDate)) // Using formatISO
        : null,
    // Ensure scheduled_start_date is handled from mainTaskInput
    scheduled_start_date: mainTaskInput.scheduled_start_date
        ? formatISO(new Date(mainTaskInput.scheduled_start_date))
        : null,
    dependencies: mainTaskInput.dependencies,
    original_scheduled_date: mainTaskInput.originalScheduledDate
            ? formatISO(new Date(mainTaskInput.originalScheduledDate)) // Using formatISO
            : null,
        is_recurring_instance: mainTaskInput.isRecurringInstance ?? false,
    originalRecurringTaskId: mainTaskInput.originalRecurringTaskId,
    is_archived: false,
        // recurrence_rule_id will be set later if a rule is created
    };

    console.log(
    '[TaskService.createTask] About to call supabase.from("tasks").insert with payload:',
    JSON.stringify(dbTaskPayload)
    );
    const { data: createdTaskData, error: taskError } = await supabase
    .from('tasks')
    .insert(dbTaskPayload)
    .select()
    .single<DbTask>();

    if (taskError) {
    console.error('Error creating task in Supabase:', taskError);
    throw new Error(
            `Error creating task in Supabase: ${taskError?.message}`
        );
    }
    if (!createdTaskData) {
        console.error('Task creation failed silently.');
    throw new Error('Task creation failed silently.');
    }
    console.log('[TaskService.createTask] Task created successfully.');

    let createdRecurrenceRuleId: string | null = null;
    if (recurrenceRule && createdTaskData.id) {
    console.log(
    '[TaskService.createTask] About to call supabase.from("task_recurrence_rules").insert'
    );
    const dbRecurrenceRuleData: Omit<
    DbRecurrenceRule,
        'id' | 'created_at' | 'updated_at' | 'task_id'
    > & { task_id: string; interval: number } = {
    ...recurrenceRule,
    task_id: createdTaskData.id,
    user_id: user.id,
    interval: recurrenceRule.interval ?? 1, // Default interval to 1 if not provided
    };
        const { data: recurrenceData, error: recurrenceError } =
        await supabase
        .from('task_recurrence_rules')
    .insert(dbRecurrenceRuleData)
    .select()
        .single<DbRecurrenceRule>();

    if (recurrenceError) {
    console.error(
        'Error creating recurrence rule:',
        recurrenceError
    );
    // Optionally, decide if you want to roll back task creation or just log and continue
        } else if (recurrenceData) {
            createdRecurrenceRuleId = recurrenceData.id;
            // Update the main task with the recurrence rule ID
            const { error: updateTaskError } = await supabase
                .from('tasks')
                .update({ recurrence_rule_id: createdRecurrenceRuleId })
                .eq('id', createdTaskData.id); // Ensure you target the correct task

            if (updateTaskError) {
                console.error(
                    'Error updating task with recurrence rule ID:',
                    updateTaskError
                );
                // Handle this error, perhaps log it or throw if critical
            } else {
                // Update the createdTaskData in memory if needed, or re-fetch
                createdTaskData.recurrence_rule_id = createdRecurrenceRuleId;
            }
        }
    }
    // ... rest of the function (tag/people handling, mapDbTaskToTask call)
    // Ensure the mapDbTaskToTask call receives the potentially updated createdTaskData

    // Handle tags
    const createdTags: Tag[] = [];
    if (tags && tags.length > 0) {
        for (const tag of tags) {
            let tagId = typeof tag === 'string' ? tag : tag.id;
            if (typeof tag === 'object' && !tag.id) {
                // If it's a new tag object without an ID, create it
                const { data: newTag, error: newTagError } = await supabase
                    .from('tags')
                    .insert({ name: tag.name, user_id: user.id })
                    .select()
                    .single();
                if (newTagError || !newTag) {
                    console.error('Error creating new tag:', newTagError);
                    continue; // Skip this tag
                }
                tagId = newTag.id;
                createdTags.push(newTag as Tag);
            } else if (typeof tag === 'object' && tag.id) {
                 createdTags.push(tag); // Existing tag object
            } else {
                // It's a tag ID, fetch it to include in the returned task
                const { data: existingTag, error: fetchTagError } = await supabase
                    .from('tags')
                    .select('*')
                    .eq('id', tagId)
                    .single();
                if (!fetchTagError && existingTag) {
                    createdTags.push(existingTag as Tag);
                }
            }

            // Link tag to task
            if (tagId) { // Ensure tagId is valid before linking
                const { error: linkError } = await supabase
                    .from('task_tags')
                    .insert({ task_id: createdTaskData.id, tag_id: tagId });
                if (linkError) {
                    console.error('Error linking tag to task:', linkError);
                }
            }
        }
    }

    // Handle people (similar logic to tags if needed, or simpler if just IDs)
    const associatedPeople: Person[] = [];
    if (people && people.length > 0) {
        for (const person of people) {
             let personId = typeof person === 'string' ? person : person.id;
             if (typeof person === 'object' && !person.id) {
                const { data: newPerson, error: newPersonError } = await supabase
                    .from('people')
                    .insert({ name: person.name, user_id: user.id }) // Assuming 'name' is the primary field
                    .select()
                    .single();
                if (newPersonError || !newPerson) {
                    console.error('Error creating new person:', newPersonError);
                    continue;
                }
                personId = newPerson.id;
                associatedPeople.push(newPerson as Person);
            } else if (typeof person === 'object' && person.id) {
                associatedPeople.push(person);
            } else {
                 const { data: existingPerson, error: fetchPersonError } = await supabase
                    .from('people')
                    .select('*')
                    .eq('id', personId)
                    .single();
                if (!fetchPersonError && existingPerson) {
                    associatedPeople.push(existingPerson as Person);
                }
            }

            if (personId) { // Ensure personId is valid before linking
                const { error: linkError } = await supabase
                    .from('task_people')
                    .insert({
                        task_id: createdTaskData.id,
                        person_id: personId,
                        person_name: person.name, // Added person_name
                    });
                if (linkError) {
                    console.error('Error linking person to task:', linkError);
                }
            }
        }
    }
    
    // Fetch the full recurrence rule if it was created to pass to mapDbTaskToTask
    let finalRecurrenceRule: RecurrenceRule | null = null;
    if (createdRecurrenceRuleId) {
        const {data: ruleData, error: ruleError} = await supabase
            .from('task_recurrence_rules')
            .select('*')
            .eq('id', createdRecurrenceRuleId)
            .single<DbRecurrenceRule>();
        if (!ruleError && ruleData) {
            finalRecurrenceRule = mapDbRecurrenceRuleToRecurrenceRule(ruleData);
        }
    }
    
    // After task creation, run the scheduling algorithm for all schedulable tasks
    try {
        // Get all schedulable tasks (not completed and not archived)
        console.log(`[TaskService.createTask] Getting all schedulable tasks for user ${user.id}`);
        const { data: allTasksData, error: allTasksError } = await supabase
            .from('tasks')
            .select(`
                *,
                task_recurrence_rules(*),
                task_tags(tags(*)),
                task_people(people(*))
            `)
            .eq('user_id', user.id)
            .eq('is_archived', false)
            .neq('status', TaskStatus.COMPLETED);
        
        if (allTasksError) {
            console.error('[TaskService.createTask] Error fetching schedulable tasks:', allTasksError);
            throw new Error(`Failed to fetch schedulable tasks: ${allTasksError.message}`);
        }
        
        if (!allTasksData || allTasksData.length === 0) {
            console.log('[TaskService.createTask] No schedulable tasks found');
            return mapDbTaskToTask(createdTaskData, finalRecurrenceRule, createdTags, associatedPeople);
        }
        
        // Map DB tasks to frontend Task objects
        const schedulableTasks = allTasksData.map(dbTask => {
            const recurrenceRule = dbTask.task_recurrence_rules ? 
                mapDbRecurrenceRuleToRecurrenceRule(
                    Array.isArray(dbTask.task_recurrence_rules) 
                        ? dbTask.task_recurrence_rules[0] 
                        : dbTask.task_recurrence_rules
                ) : null;
            const tags = dbTask.task_tags?.map((tt: any) => tt.tags).filter(Boolean) || [];
            const people = dbTask.task_people?.map((tp: any) => tp.people).filter(Boolean) || [];
            return mapDbTaskToTask(dbTask, recurrenceRule, tags, people);
        });
        
        console.log(`[TaskService.createTask] Running scheduling algorithm on ${schedulableTasks.length} schedulable tasks`);
        
        // Run the scheduling algorithm on all tasks
        await runSchedulingAlgorithm(schedulableTasks, user.id);
        console.log(`[TaskService.createTask] Scheduling completed successfully`);
    } catch (schedulingError) {
        // Log the error but don't fail the task creation
        console.error(`[TaskService.createTask] Error during scheduling after task creation:`, schedulingError);
    }

    return mapDbTaskToTask(createdTaskData, finalRecurrenceRule, createdTags, associatedPeople);
    }, // End of createTask method

    async updateTask(
        taskId: string,
        updates: TaskUpdatePayload
    ): Promise<Task> {
        console.log(
            `[TaskService.updateTask] Called for taskId: ${taskId} with updates:`,
            JSON.stringify(updates, null, 2)
        );
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error(
                '[TaskService.updateTask] User not authenticated:',
                userError
            );
            throw new Error('User not authenticated');
        }
        console.log('[TaskService.updateTask] User authenticated:', user.id);

        const { tags, people, recurrenceRule, ...mainTaskUpdates } = updates;

        const taskChangesForSupabase: Database['public']['Tables']['tasks']['Update'] =
            {
                updated_at: formatISO(new Date()),
            };

        // Populate taskChangesForSupabase using mainTaskUpdates for snake_case conversion and clarity
        if (mainTaskUpdates.title !== undefined)
            taskChangesForSupabase.title = mainTaskUpdates.title;
        if (mainTaskUpdates.description !== undefined)
            taskChangesForSupabase.description = mainTaskUpdates.description;
        if (mainTaskUpdates.status !== undefined)
            taskChangesForSupabase.status = mainTaskUpdates.status;
        if (mainTaskUpdates.priority !== undefined)
            taskChangesForSupabase.priority = mainTaskUpdates.priority;
        if (mainTaskUpdates.dueDate !== undefined)
            taskChangesForSupabase.due_date = mainTaskUpdates.dueDate
                ? formatISO(new Date(mainTaskUpdates.dueDate))
                : null;
        if (mainTaskUpdates.dueDateType !== undefined)
            taskChangesForSupabase.due_date_type = mainTaskUpdates.dueDateType;
        if (mainTaskUpdates.targetDeadline !== undefined)
            taskChangesForSupabase.target_deadline =
                mainTaskUpdates.targetDeadline
                    ? formatISO(new Date(mainTaskUpdates.targetDeadline))
                    : null;
        if (mainTaskUpdates.goLiveDate !== undefined)
            taskChangesForSupabase.go_live_date = mainTaskUpdates.goLiveDate
                ? formatISO(new Date(mainTaskUpdates.goLiveDate))
                : null;
        if (mainTaskUpdates.effortLevel !== undefined)
            taskChangesForSupabase.effort_level = mainTaskUpdates.effortLevel;
        if (mainTaskUpdates.completed !== undefined) {
            taskChangesForSupabase.completed_date = mainTaskUpdates.completed
                ? mainTaskUpdates.completedDate
                ? formatISO(new Date(mainTaskUpdates.completedDate))
                    : formatISO(new Date())
                : null;
        } else if (mainTaskUpdates.completedDate !== undefined) {
            // Only consider if 'completed' is not set
            taskChangesForSupabase.completed_date =
                mainTaskUpdates.completedDate
                ? formatISO(new Date(mainTaskUpdates.completedDate))
                    : null;
        }
        if (mainTaskUpdates.dependencies !== undefined)
            taskChangesForSupabase.dependencies = mainTaskUpdates.dependencies;
            if (mainTaskUpdates.scheduled_start_date !== undefined) { // Added this block
        taskChangesForSupabase.scheduled_start_date = mainTaskUpdates.scheduled_start_date
            ? formatISO(new Date(mainTaskUpdates.scheduled_start_date))
            : null;
    }
    if (mainTaskUpdates.originalScheduledDate !== undefined)
            taskChangesForSupabase.original_scheduled_date =
                mainTaskUpdates.originalScheduledDate
                ? formatISO(new Date(
                mainTaskUpdates.originalScheduledDate
                ))
                    : null;
        if (mainTaskUpdates.isRecurringInstance !== undefined)
            taskChangesForSupabase.is_recurring_instance =
                mainTaskUpdates.isRecurringInstance;
        if (mainTaskUpdates.originalRecurringTaskId !== undefined)
        taskChangesForSupabase.originalRecurringTaskId = // Corrected: use originalRecurringTaskId from mainTaskUpdates
        mainTaskUpdates.originalRecurringTaskId;
        // recurrence_rule_id is handled by manageRecurrenceRuleForUpdate
        // is_archived is handled by archiveTask/unarchiveTask

        console.log(
            '[TaskService.updateTask] Updating task with payload:',
            JSON.stringify(taskChangesForSupabase)
        );

        console.log(
            `[TaskService.updateTask DB_CALL_BEGIN] Attempting to update main task details for taskId: ${taskId}. Updates:`,
            JSON.stringify(taskChangesForSupabase)
        );

        let updatedTaskDataFromDb: DbTask | null = null;
        let mainTaskError: any = null;
        let dbResponseForLog: any = null; // For logging the whole response

        try {
            const dbResponse = await supabase
                .from('tasks')
                .update(taskChangesForSupabase)
                .eq('id', taskId)
                .select() // Ensure this matches the actual code, e.g., .select() or .select('*')
                .single<DbTask>();

            dbResponseForLog = dbResponse; // Capture for logging
            if (dbResponse) {
                updatedTaskDataFromDb = dbResponse.data;
                mainTaskError = dbResponse.error;
            } else {
                console.error(
                    '[TaskService.updateTask DB_CALL_UNEXPECTED] supabase.single() returned null/undefined directly.'
                );
                mainTaskError = {
                    message:
                        'Supabase single() call returned unexpected null/undefined response.',
                };
            }
        } catch (e: any) {
            console.error(
                '[TaskService.updateTask DB_CALL_EXCEPTION] Exception during main task update DB call:',
                e,
                e.stack
            );
            mainTaskError = e; // Assign the exception to mainTaskError to be handled by subsequent logic
        }

        console.log(
            '[TaskService.updateTask DB_CALL_COMPLETE] Raw Response:',
            JSON.stringify(dbResponseForLog)
        );
        console.log(
            '[TaskService.updateTask DB_CALL_COMPLETE] Parsed: updatedTaskDataFromDb:',
            JSON.stringify(updatedTaskDataFromDb),
            'mainTaskError:',
            JSON.stringify(mainTaskError)
        );

        if (mainTaskError) {
            console.error(
                '[TaskService.updateTask] Error updating main task details:',
                mainTaskError
            );
            throw new Error(
                `Failed to update task details: ${mainTaskError?.message}`
            );
        }
        if (!updatedTaskDataFromDb) {
            console.error(
                '[TaskService.updateTask] Condition (!updatedTaskData) is TRUE. updatedTaskData:',
                updatedTaskDataFromDb
            );
            console.error('No data returned after task update');
            throw new Error('No data returned after task update');
        }
        console.log(
            `[TaskService.updateTask] Task ${taskId} main fields updated successfully.`
        );

        // 2. Handle Recurrence Rule
        if (recurrenceRule !== undefined) {
            // ... (rest of the code remains the same)
        }

        // 3. Handle Tags
        if (tags !== undefined) {
            console.log(
                `[TaskService.updateTask] Updating tags for task ${taskId}:`,
                tags
            );
            const { error: deleteTagsError } = await supabase
                .from('task_tags')
                .delete()
                .eq('task_id', taskId);

            if (deleteTagsError) {
                console.error(
                    `[TaskService.updateTask] Error deleting existing tags for task ${taskId}:`,
                    deleteTagsError
                );
                throw new Error(
                    `Failed to update task tags: Error clearing old tags. ${deleteTagsError.message}`
                );
            }

            if (tags.length > 0) {
                const tagUpsertPromises = tags.map((tag) => {
                    if (typeof tag === 'string') {
                        return supabase
                            .from('tags')
                            .upsert(
                                { name: tag, user_id: user.id },
                                {
                                    onConflict: 'name, user_id',
                                    ignoreDuplicates: false,
                                }
                            )
                            .select()
                            .single();
                    } else {
                        return supabase
                            .from('tags')
                            .upsert(
                                { name: tag.name, user_id: user.id },
                                {
                                    onConflict: 'name, user_id',
                                    ignoreDuplicates: false,
                                }
                            )
                            .select()
                            .single();
                    }
                });
                const upsertedTagsResults = await Promise.all(
                    tagUpsertPromises
                );

                const newTagLinks: {
                    task_id: string;
                    tag_id: string;
                    user_id: string;

                }[] = [];
                for (const result of upsertedTagsResults) {
                    if (result.error || !result.data) {
                        console.error(
                            '[TaskService.updateTask] Error upserting tag:',
                            result.error
                        );
                        throw new Error(
                            `Failed to update task tags: Error upserting tag. ${result.error?.message}`
                        );
                    }
                    newTagLinks.push({
                        task_id: taskId,
                        tag_id: (result.data as DbTag).id,
                        user_id: user.id,
                    });
                }

                if (newTagLinks.length > 0) {
                    const { error: insertTaskTagsError } = await supabase
                        .from('task_tags')
                        .insert(newTagLinks);
                    if (insertTaskTagsError) {
                        console.error(
                            `[TaskService.updateTask] Error inserting new task_tags for task ${taskId}:`,
                            insertTaskTagsError
                        );
                        throw new Error(
                            `Failed to update task tags: Failed to insert tags. ${insertTaskTagsError.message}`
                        );
                    }
                }
            }
            console.log(
                `[TaskService.updateTask] Tags updated successfully for task ${taskId}.`
            );
        }

        // 4. Handle People
        if (people !== undefined) {
            console.log(
                `[TaskService.updateTask] Updating people for task ${taskId}:`,
                people
            );
            const { error: deletePeopleError } = await supabase
                .from('task_people')
                .delete()
                .eq('task_id', taskId)
                .eq('user_id', user.id);

            if (deletePeopleError) {
                console.error(
                    `[TaskService.updateTask] Error deleting existing people for task ${taskId}:`,
                    deletePeopleError
                );
                throw new Error(
                    `Failed to update task people: Error clearing old people. ${deletePeopleError.message}`
                );
            }

            if (people.length > 0) {
                const personUpsertPromises = people.map((person) => {
                    if (typeof person === 'string') {
                        return supabase
                            .from('people')
                            .upsert(
                                { name: person, user_id: user.id },
                                {
                                    onConflict: 'name, user_id',
                                    ignoreDuplicates: false,
                                }
                            )
                            .select()
                            .single();
                    } else {
                        return supabase
                            .from('people')
                            .upsert(
                                { name: person.name, user_id: user.id },
                                {
                                    onConflict: 'name, user_id',
                                    ignoreDuplicates: false,
                                }
                            )
                            .select()
                            .single();
                    }
                });
                const upsertedPeopleResults = await Promise.all(
                    personUpsertPromises
                );

                const newPeopleLinks: {
                    task_id: string;
                    person_id: string;
                    user_id: string;
                    person_name: string;
                }[] = [];
                upsertedPeopleResults.forEach((result, index) => {
                    if (result.error || !result.data) {
                        console.error(
                            '[TaskService.updateTask] Error upserting person:',
                            result.error
                        );
                        throw new Error(
                            `Failed to update task people: Error upserting person. ${result.error?.message}`
                        );
                    }
                    const originalPersonInput = people[index]; // Get the original input
                    const personName = typeof originalPersonInput === 'string' ? originalPersonInput : originalPersonInput.name;
                    newPeopleLinks.push({
                        task_id: taskId,
                        person_id: (result.data as DbPerson).id,
                        user_id: user.id,
                        person_name: personName // Added person_name from original input
                    });
                });

                if (newPeopleLinks.length > 0) {
                    const { error: insertTaskPeopleError } = await supabase
                        .from('task_people')
                        .insert(newPeopleLinks);
                    if (insertTaskPeopleError) {
                        console.error(
                            `[TaskService.updateTask] Error inserting new task_people for task ${taskId}:`,
                            insertTaskPeopleError
                        );
                        throw new Error(
                            `Failed to update task people: Failed to insert people. ${insertTaskPeopleError.message}`
                        );
                    }
                }
            }
            console.log(
                `[TaskService.updateTask] People updated successfully for task ${taskId}.`
            );
        }

        // 5. Fetch the updated task with all its relations to return
        console.log(
            `[TaskService.updateTask] Attempting to call get_task_with_relations for task ID: ${taskId}`
        );
        const { data: finalTaskData, error: finalFetchError } = await supabase
            .from('tasks')
            .select(
                `
                *,
                task_recurrence_rules!recurrenceRuleId (*),
                task_tags (tags (*)),
                task_people (people (*))
                `
            )
            .eq('id', taskId)
            .eq('user_id', user.id)
            .single<DbTask>();

        if (finalFetchError) {
            console.error(
                `[TaskService.updateTask] Error fetching final updated task ${taskId}:`,
                finalFetchError
            );
            throw new Error(
                `Error fetching updated task with details via RPC: ${finalFetchError?.message}`
            );
        }
        if (!finalTaskData) {
            console.warn(
                '[TaskService.updateTask] Updated task data not found via RPC.'
            );
            throw new Error('Updated task data not found via RPC.');
        }

        const fetchedRecurrenceRule = finalTaskData.task_recurrence_rules
            ? mapDbRecurrenceRuleToRecurrenceRule(
                  Array.isArray(finalTaskData.task_recurrence_rules)
                      ? finalTaskData.task_recurrence_rules[0]
                      : finalTaskData.task_recurrence_rules
              )
            : null;
        const fetchedTags =
            finalTaskData.task_tags
                ?.map((tt) => tt.tags as Tag)
                .filter(Boolean) || [];
        const fetchedPeople =
            finalTaskData.task_people
                ?.map((tp) => tp.people as Person)
                .filter(Boolean) || [];

        console.log(
            '[TaskService.updateTask] Task details retrieved for mapping:',
            JSON.stringify({ recurrenceRule: fetchedRecurrenceRule, tags: fetchedTags.length, people: fetchedPeople.length })
        );

        // Run scheduling algorithm on all schedulable tasks
        try {
            console.log('[TaskService.updateTask] Fetching all schedulable tasks for scheduling algorithm');
            const { data: schedulableTasks, error: fetchError } = await supabase
                .from('tasks')
                .select(`
                    *,
                    task_recurrence_rules (*),
                    task_tags (tags (*)),
                    task_people (people (*))
                `)
                .eq('user_id', user.id)
                .eq('is_archived', false)
                .not('completed_date', 'is', null)
                .not('status', 'eq', 'completed');

            if (fetchError) {
                console.error('[TaskService.updateTask] Error fetching schedulable tasks:', fetchError);
            } else if (schedulableTasks) {
                console.log(`[TaskService.updateTask] Found ${schedulableTasks.length} schedulable tasks for scheduling algorithm`);
                
                // Map DB tasks to frontend Task objects for the scheduling algorithm
                const frontendTasks = schedulableTasks.map((dbTask) => {
                    const recurrenceRule = dbTask.task_recurrence_rules
                        ? mapDbRecurrenceRuleToRecurrenceRule(
                            Array.isArray(dbTask.task_recurrence_rules)
                                ? dbTask.task_recurrence_rules[0]
                                : dbTask.task_recurrence_rules
                        )
                        : null;
                    const tags =
                        dbTask.task_tags
                            ?.map((tt: any) => tt.tags as Tag)
                            .filter(Boolean) || [];
                    const people =
                        dbTask.task_people
                            ?.map((tp: any) => tp.people as Person)
                            .filter(Boolean) || [];

                    return mapDbTaskToTask(dbTask, recurrenceRule, tags, people);
                });

                // Run scheduling algorithm
                try {
                    console.log('[TaskService.updateTask] Running scheduling algorithm');
                    await runSchedulingAlgorithm(frontendTasks);
                    console.log('[TaskService.updateTask] Scheduling algorithm completed successfully');
                } catch (schedulingError) {
                    console.error('[TaskService.updateTask] Error running scheduling algorithm:', schedulingError);
                    // Don't throw here, allow the task update to succeed even if scheduling fails
                }
            }
        } catch (error) {
            console.error('[TaskService.updateTask] Error in scheduling process:', error);
            // Don't throw here, allow the task update to succeed even if scheduling process fails
        }

        return mapDbTaskToTask(finalTaskData, fetchedRecurrenceRule, fetchedTags, fetchedPeople);
    },

    async getTaskById(taskId: string): Promise<Task> {
        console.log(`[TaskService.getTaskById] Called for task ID: ${taskId}`);
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error('[TaskService.getTaskById] User not authenticated:', userError);
            throw new Error('User not authenticated');
        }

        try {
            const { data: rpcData, error: rpcError } = await supabase
                .from('tasks')
                .select(`
                    *,
                    task_recurrence_rules (*),
                    task_tags (tags (*)),
                    task_people (people (*))
                `)
                .eq('id', taskId)
                .eq('user_id', user.id)
                .single();

            if (rpcError) {
                console.error(`[TaskService.getTaskById] Error fetching task ${taskId}:`, rpcError);
                throw new Error(`Failed to fetch task: ${rpcError.message}`);
            }

            const dbTask = rpcData as DbTask;

            if (!dbTask) {
                console.warn(`[TaskService.getTaskById] No task data after RPC call for ID ${taskId}.`);
                throw new Error('Task not found');
            }

            const recurrenceRule = dbTask.task_recurrence_rules
                ? mapDbRecurrenceRuleToRecurrenceRule(
                    Array.isArray(dbTask.task_recurrence_rules)
                        ? dbTask.task_recurrence_rules[0]
                        : dbTask.task_recurrence_rules
                )
                : null;
            const tags =
                dbTask.task_tags
                    ?.map((tt: any) => tt.tags as Tag)
                    .filter(Boolean) || [];
            const people =
                dbTask.task_people
                    ?.map((tp: any) => tp.people as Person)
                    .filter(Boolean) || [];

            return mapDbTaskToTask(dbTask, recurrenceRule, tags, people);
        } catch (error) {
            console.error(
                `[TaskService.getTaskById] Unexpected error fetching task ${taskId}:`,
                error
            );
            if (
                error instanceof Error &&
                error.message.startsWith('Failed to fetch task')
            ) {
                throw error;
            }
            throw new Error(
                `Failed to fetch task ${taskId}: ${(error as Error).message}`
            );
        }
    },

    async deleteTask(taskId: string): Promise<void> {
        console.log(
            `[TaskService.deleteTask] Attempting to delete task ${taskId}`
        );
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
            console.error(
                '[TaskService.deleteTask] User not authenticated or error fetching user:',
                userError
            );
            throw new Error('User not authenticated');
        }
        const userId = user.id;

        try {
            const { error: rpcError } = await supabase.rpc(
                'delete_task_and_relations',
                {
                    p_task_id: taskId,
                    p_user_id: userId,
                }
            );

            if (rpcError) {
                console.error(
                    `[TaskService.deleteTask] Error deleting task ${taskId} via RPC:`,
                    rpcError
                );
                throw new Error(
                    `Failed to delete task ${taskId}: ${rpcError.message}`
                );
            }

            // After deleting task, run scheduling algorithm on all remaining tasks
            try {
                console.log('[TaskService.deleteTask] Running scheduling algorithm after task deletion');
                
                // Get all non-archived, non-completed tasks for scheduling
                const { data: schedulableTasks } = await supabase
                    .from('tasks')
                    .select(
                        `
                        *,
                        task_recurrence_rules (*),
                        task_tags (tags (*)),
                        task_people (people (*))
                        `
                    )
                    .eq('user_id', userId)
                    .eq('is_archived', false)
                    .neq('status', TaskStatus.COMPLETED);

                if (schedulableTasks && schedulableTasks.length > 0) {
                    console.log(`[TaskService.deleteTask] Found ${schedulableTasks.length} schedulable tasks`);
                    
                    // Map the DB tasks to the front-end Task type for the scheduling algorithm
                    const tasksForScheduling = schedulableTasks.map((dbTask) => {
                        const taskRules = dbTask.task_recurrence_rules || [];
                        const taskTags = dbTask.task_tags ? dbTask.task_tags.map(t => t.tags) : [];
                        const taskPeople = dbTask.task_people ? dbTask.task_people.map(p => p.people) : [];
                        return mapDbTaskToTask(dbTask, taskRules[0] || null, taskTags, taskPeople);
                    });

                    // Run the scheduling algorithm
                    try {
                        await runSchedulingAlgorithm(tasksForScheduling);
                        console.log('[TaskService.deleteTask] Scheduling algorithm completed successfully');
                    } catch (schedulingError) {
                        console.error('[TaskService.deleteTask] Error running scheduling algorithm:', schedulingError);
                        // Don't throw here, we still want to complete the delete operation
                    }
                } else {
                    console.log('[TaskService.deleteTask] No schedulable tasks found, skipping scheduling');
                }
            } catch (schedulingQueryError) {
                console.error('[TaskService.deleteTask] Error fetching tasks for scheduling:', schedulingQueryError);
                // Don't throw here, we still want to complete the delete operation
            }

            console.log(
                `[TaskService.deleteTask] Task ${taskId} and its relations deleted successfully for user ${userId}.`
            );
        } catch (error) {
            console.error(
                `[TaskService.deleteTask] Unexpected error during deletion of task ${taskId}:`,
                error
            );
            if (
                error instanceof Error &&
                (error.message.startsWith('Failed to delete task') ||
                    error.message === 'User not authenticated')
            ) {
                throw error; // Re-throw known errors
            }
            throw new Error(
                `An unexpected error occurred while deleting task ${taskId}: ${
                    (error as Error).message
                }`
            );
        }
    },

    async archiveTask(taskId: string): Promise<Task> {
        // console.log(`[TaskService.archiveTask] Attempting to archive task ${taskId}`);
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error(
                '[TaskService.archiveTask] User not authenticated or error fetching user:',
                userError
            );
            throw new Error('User not authenticated');
        }
        const userId = user.id;
        console.log(
            `[TaskService.archiveTask] User ${userId} authenticated. Proceeding to archive task ${taskId}.`
        );
        
        try {
            const { data: updatedTaskData, error: updateError } = await supabase
                .from('tasks')
                .update({ is_archived: true })
                .eq('id', taskId)
                .eq('user_id', userId)
                .select(
                    `
                    *,
                    task_recurrence_rules (*),
                    task_tags (tags (*)),
                    task_people (people (*))
                    `
                )
                .single();

            if (updateError || !updatedTaskData) {
                console.error(
                    `[TaskService.archiveTask] Error archiving task ${taskId}:`,
                    updateError
                );
                throw new Error('Task not found or failed to archive');
            }

            const recurrenceRule = updatedTaskData.task_recurrence_rules
                ? mapDbRecurrenceRuleToRecurrenceRule(
                      Array.isArray(updatedTaskData.task_recurrence_rules)
                          ? updatedTaskData.task_recurrence_rules[0]
                          : updatedTaskData.task_recurrence_rules
                  )
                : null;
            const tags =
                updatedTaskData.task_tags
                    ?.map((tt: any) => tt.tags as Tag)
                    .filter(Boolean) || [];
            const people =
                updatedTaskData.task_people
                    ?.map((tp: any) => tp.people as Person)
                    .filter(Boolean) || [];

            console.log(
                `[TaskService.archiveTask] Task ${taskId} archived successfully.`
            );
            
            // After archiving task, run scheduling algorithm on all non-archived tasks
            try {
                console.log('[TaskService.archiveTask] Running scheduling algorithm after task archive');
                
                // Get all non-archived, non-completed tasks for scheduling
                const { data: schedulableTasks } = await supabase
                    .from('tasks')
                    .select(
                        `
                        *,
                        task_recurrence_rules (*),
                        task_tags (tags (*)),
                        task_people (people (*))
                        `
                    )
                    .eq('user_id', userId)
                    .eq('is_archived', false)
                    .neq('status', TaskStatus.COMPLETED);

                if (schedulableTasks && schedulableTasks.length > 0) {
                    console.log(`[TaskService.archiveTask] Found ${schedulableTasks.length} schedulable tasks`);
                    
                    // Map the DB tasks to the front-end Task type for the scheduling algorithm
                    const tasksForScheduling = schedulableTasks.map((dbTask) => {
                        const taskRules = dbTask.task_recurrence_rules || [];
                        const taskTags = dbTask.task_tags ? dbTask.task_tags.map(t => t.tags) : [];
                        const taskPeople = dbTask.task_people ? dbTask.task_people.map(p => p.people) : [];
                        return mapDbTaskToTask(dbTask, taskRules[0] || null, taskTags, taskPeople);
                    });

                    // Run the scheduling algorithm
                    try {
                        await runSchedulingAlgorithm(tasksForScheduling);
                        console.log('[TaskService.archiveTask] Scheduling algorithm completed successfully');
                    } catch (schedulingError) {
                        console.error('[TaskService.archiveTask] Error running scheduling algorithm:', schedulingError);
                        // Don't throw here, we still want to return the archived task
                    }
                } else {
                    console.log('[TaskService.archiveTask] No schedulable tasks found, skipping scheduling');
                }
            } catch (schedulingQueryError) {
                console.error('[TaskService.archiveTask] Error fetching tasks for scheduling:', schedulingQueryError);
                // Don't throw here, we still want to return the archived task
            }
            
            return mapDbTaskToTask(
                updatedTaskData,
                recurrenceRule,
                tags,
                people
            );
        } catch (error) {
            console.error(
                `[TaskService.archiveTask] Unexpected error during archiving task ${taskId}:`,
                error
            );
            if (
                error instanceof Error &&
                (error.message.startsWith('Failed to archive task') ||
                    error.message === 'User not authenticated' ||
                    error.message === 'Task not found or failed to archive')
            ) {
                throw error; // Re-throw known errors
            }
            // Fallback for other unexpected errors
            throw new Error(
                `Unexpected error in archiveTask for task ${taskId}: ${
                    (error as Error).message
                }`
            );
        } // Closes catch block
    }, // Closes archiveTask method and adds comma

    async unarchiveTask(taskId: string): Promise<Task> {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
            console.error(
                '[TaskService.unarchiveTask] User not authenticated or error fetching user:',
                userError
            );
            throw new Error('User not authenticated');
        }
        const userId = user.id;

        console.log(
            `[TaskService.unarchiveTask] Unarchiving task ${taskId} for user ${userId}`
        );
        try {
            const { data: updatedTaskData, error: updateError } = await supabase
                .from('tasks')
                .update({
                    is_archived: false,
                    updated_at: formatISO(new Date()),
                })
                .eq('id', taskId)
                .eq('user_id', userId)
                .select(
                    `
          *,
          task_recurrence_rules (*),
          task_tags (tags (*)),
          task_people (people (*))
        `
                )
                .single<DbTask>();

            if (updateError) {
                console.error(
                    `[TaskService.unarchiveTask] Error unarchiving task ${taskId}:`,
                    updateError
                );
                throw new Error(
                    `Failed to unarchive task ${taskId}: ${updateError.message}`
                );
            }

            if (!updatedTaskData) {
                console.warn(
                    `[TaskService.unarchiveTask] Task ${taskId} not found or not updated.`
                );
                throw new Error('Task not found or failed to unarchive');
            }

            const recurrenceRule = updatedTaskData.task_recurrence_rules
                ? mapDbRecurrenceRuleToRecurrenceRule(
                      Array.isArray(updatedTaskData.task_recurrence_rules)
                          ? updatedTaskData.task_recurrence_rules[0]
                          : updatedTaskData.task_recurrence_rules
                  )
                : null;
            const tags =
                updatedTaskData.task_tags
                    ?.map((tt: any) => tt.tags as Tag)
                    .filter(Boolean) || [];
            const people =
                updatedTaskData.task_people
                    ?.map((tp: any) => tp.people as Person)
                    .filter(Boolean) || [];

            console.log(
                `[TaskService.unarchiveTask] Task ${taskId} unarchived successfully.`
            );
            return mapDbTaskToTask(
                updatedTaskData,
                recurrenceRule,
                tags,
                people
            );
        } catch (error) {
            console.error(
                `[TaskService.unarchiveTask] Unexpected error during unarchiving task ${taskId}:`,
                error
            );
            if (
                error instanceof Error &&
                (error.message.startsWith('Failed to unarchive task') ||
                    error.message === 'User not authenticated' ||
                    error.message === 'Task not found or failed to unarchive')
            ) {
                throw error; // Re-throw known errors
            }
            // Fallback for other unexpected errors
            throw new Error(
                `An unexpected error occurred while unarchiving task ${taskId}: ${
                    (error as Error).message
                }`
            );
        }
    },

    async getTasksContributingToEffortOnDate(dateISO: string, userId: string): Promise<Task[]> {
        if (!userId) {
            console.error('[TaskService.getTasksContributingToEffortOnDate] User ID is required.');
            throw new Error('User ID is required');
        }
        if (!dateISO) {
            console.error('[TaskService.getTasksContributingToEffortOnDate] Date ISO string is required.');
            throw new Error('Date ISO string is required');
        }

        console.log(`[TaskService.getTasksContributingToEffortOnDate] Fetching tasks for user ${userId} on date ${dateISO}`);

        try {
            const { data: dbTasks, error } = await supabase
                .from('tasks')
                .select(`
                    *,
                    task_recurrence_rules(*),
                    task_tags!inner(tags(*)),
                    task_people!inner(people(*))
                `)
                .eq('user_id', userId)
                .lte('scheduled_start_date', dateISO) // Task starts on or before this date
                .gte('scheduled_completion_date', dateISO) // Task ends on or after this date
                .neq('status', TaskStatus.COMPLETED) // Not completed
                .eq('is_archived', false); // Not archived

            if (error) {
                console.error(`[TaskService.getTasksContributingToEffortOnDate] Supabase error fetching tasks for ${dateISO}:`, error);
                throw error;
            }

            if (!dbTasks) {
                console.log(`[TaskService.getTasksContributingToEffortOnDate] No tasks found for user ${userId} on date ${dateISO}.`);
                return [];
            }
            
            console.log(`[TaskService.getTasksContributingToEffortOnDate] Found ${dbTasks.length} tasks for user ${userId} on date ${dateISO}.`);

            return dbTasks.map(dbTask => {
                const recurrenceRule = dbTask.task_recurrence_rules 
                    ? mapDbRecurrenceRuleToRecurrenceRule(
                        Array.isArray(dbTask.task_recurrence_rules) 
                            ? dbTask.task_recurrence_rules[0] 
                            : dbTask.task_recurrence_rules
                    ) 
                    : null;
                const tags = dbTask.task_tags?.map((tt: any) => tt.tags as Tag).filter(Boolean) || [];
                const people = dbTask.task_people?.map((tp: any) => tp.people as Person).filter(Boolean) || [];
                return mapDbTaskToTask(dbTask, recurrenceRule, tags, people);
            });

        } catch (error) {
            console.error(`[TaskService.getTasksContributingToEffortOnDate] Unexpected error:`, error);
            if (error instanceof Error && error.message.includes('Supabase error')) {
                throw error;
            }
            throw new Error(`An unexpected error occurred while fetching tasks contributing to effort on ${dateISO}.`);
        }
    },
}; // End of TaskService object

export default TaskService;
