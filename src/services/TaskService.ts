import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/supabase'; // Added import
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
    async getTasks(includeArchived = false): Promise<Task[]> {
        const { data: user, error: userError } = await supabase.auth.getUser();
        if (userError || !user?.user) {
            console.error(
                '[TaskService.getTasks] User not found or error fetching user:',
                userError
            );
            return [];
        }
        const userId = user.user.id;

        console.log(
            `[TaskService.getTasks] Fetching tasks for user ${userId}, includeArchived: ${includeArchived}`
        );
        try {
            const { data: rpcData, error: rpcError } = await supabase.rpc(
                'get_tasks_with_relations_for_user',
                {
                    p_user_id: userId,
                    p_include_archived: includeArchived, // Assuming this parameter exists in the RPC
                }
            );

            if (rpcError) {
                console.error(
                    `[TaskService.getTasks] RPC error fetching tasks for user ${userId}:`,
                    rpcError
                );
                throw new Error(`Failed to fetch tasks: ${rpcError.message}`);
            }

            if (!rpcData || !Array.isArray(rpcData)) {
                console.warn(
                    `[TaskService.getTasks] No tasks found or unexpected data format for user ${userId} via RPC.`
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
                `[TaskService.getTasks] Unexpected error fetching tasks for user ${userId}:`,
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
        > & {
            recurrenceRule?: Omit<
                RecurrenceRule,
                'id' | 'taskId' | 'userId' | 'createdAt' | 'updatedAt'
            >;
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
                ? new Date(mainTaskInput.dueDate).toISOString()
                : null,
            due_date_type: mainTaskInput.dueDateType,
            target_deadline: mainTaskInput.targetDeadline
                ? new Date(mainTaskInput.targetDeadline).toISOString()
                : null,
            go_live_date: mainTaskInput.goLiveDate
                ? new Date(mainTaskInput.goLiveDate).toISOString()
                : null,
            effort_level: mainTaskInput.effortLevel ?? EffortLevel.M,
            completed_date: mainTaskInput.completedDate
                ? new Date(mainTaskInput.completedDate).toISOString()
                : null,
            dependencies: mainTaskInput.dependencies,
            original_scheduled_date: mainTaskInput.originalScheduledDate
                ? new Date(mainTaskInput.originalScheduledDate).toISOString()
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
                    .eq('id', createdTaskData.id);
                if (updateTaskError) {
                    console.error(
                        'Error updating task with recurrence_rule_id:',
                        updateTaskError
                    );
                }
            }
        }
        // TODO: Properly map createdTaskData and associate tags/people before returning.
        // Map the created task (and its related entities) to the Task type
        const finalRecurrenceRule =
            createdRecurrenceRuleId && recurrenceRule
                ? mapDbRecurrenceRuleToRecurrenceRule({
                      ...recurrenceRule,
                      id: createdRecurrenceRuleId,
                      task_id: createdTaskData.id,
                      user_id: user.id,
                      created_at: new Date().toISOString(), // Approximate, DB will have actual
                      updated_at: new Date().toISOString(), // Approximate
                      // Ensure all DbRecurrenceRule fields are present if needed by mapDbRecurrenceRuleToRecurrenceRule
                      frequency: recurrenceRule.frequency,
                      interval: recurrenceRule.interval ?? 1,
                  })
                : null;

        const taskTags = tags
            ? await this.getTagsForTask(createdTaskData.id, user.id)
            : [];
        const taskPeople = people
            ? await this.getPeopleForTask(createdTaskData.id, user.id)
            : [];

        // Update createdTaskData with the recurrence_rule_id if it was set
        if (createdRecurrenceRuleId) {
            createdTaskData.recurrence_rule_id = createdRecurrenceRuleId;
        }

        return mapDbTaskToTask(
            createdTaskData,
            finalRecurrenceRule,
            taskTags,
            taskPeople
        );
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
                updated_at: new Date().toISOString(),
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
                ? new Date(mainTaskUpdates.dueDate).toISOString()
                : null;
        if (mainTaskUpdates.dueDateType !== undefined)
            taskChangesForSupabase.due_date_type = mainTaskUpdates.dueDateType;
        if (mainTaskUpdates.targetDeadline !== undefined)
            taskChangesForSupabase.target_deadline =
                mainTaskUpdates.targetDeadline
                    ? new Date(mainTaskUpdates.targetDeadline).toISOString()
                    : null;
        if (mainTaskUpdates.goLiveDate !== undefined)
            taskChangesForSupabase.go_live_date = mainTaskUpdates.goLiveDate
                ? new Date(mainTaskUpdates.goLiveDate).toISOString()
                : null;
        if (mainTaskUpdates.effortLevel !== undefined)
            taskChangesForSupabase.effort_level = mainTaskUpdates.effortLevel;
        if (mainTaskUpdates.completed !== undefined) {
            taskChangesForSupabase.completed_date = mainTaskUpdates.completed
                ? mainTaskUpdates.completedDate
                    ? new Date(mainTaskUpdates.completedDate).toISOString()
                    : new Date().toISOString()
                : null;
        } else if (mainTaskUpdates.completedDate !== undefined) {
            // Only consider if 'completed' is not set
            taskChangesForSupabase.completed_date =
                mainTaskUpdates.completedDate
                    ? new Date(mainTaskUpdates.completedDate).toISOString()
                    : null;
        }
        if (mainTaskUpdates.dependencies !== undefined)
            taskChangesForSupabase.dependencies = mainTaskUpdates.dependencies;
        if (mainTaskUpdates.originalScheduledDate !== undefined)
            taskChangesForSupabase.original_scheduled_date =
                mainTaskUpdates.originalScheduledDate
                    ? new Date(
                          mainTaskUpdates.originalScheduledDate
                      ).toISOString()
                    : null;
        if (mainTaskUpdates.isRecurringInstance !== undefined)
            taskChangesForSupabase.is_recurring_instance =
                mainTaskUpdates.isRecurringInstance;
        if (mainTaskUpdates.originalRecurringTaskId !== undefined)
            taskChangesForSupabase.originalRecurringTaskId =
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
                }[] = [];
                for (const result of upsertedPeopleResults) {
                    if (result.error || !result.data) {
                        console.error(
                            '[TaskService.updateTask] Error upserting person:',
                            result.error
                        );
                        throw new Error(
                            `Failed to update task people: Error upserting person. ${result.error?.message}`
                        );
                    }
                    newPeopleLinks.push({
                        task_id: taskId,
                        person_id: (result.data as DbPerson).id,
                        user_id: user.id,
                    });
                }

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
            `[TaskService.updateTask] Successfully updated and fetched task ${taskId}.`
        );
        return mapDbTaskToTask(
            finalTaskData,
            fetchedRecurrenceRule,
            fetchedTags,
            fetchedPeople
        );
    }, // End of updateTask method

    async getTaskById(taskId: string): Promise<Task> {
        const { data: user, error: userError } = await supabase.auth.getUser();
        if (userError || !user?.user) {
            console.error(
                '[TaskService.getTaskById] User not found or error fetching user:',
                userError
            );
            throw new Error('User not authenticated');
        }
        // const userId = user.user.id; // Not explicitly used if p_task_id is globally unique and RLS handles access

        console.log(`[TaskService.getTaskById] Fetching task ${taskId}`);
        try {
            const { data: rpcData, error: rpcError } = await supabase.rpc(
                'get_task_with_relations',
                {
                    p_task_id: taskId,
                }
            );

            if (rpcError) {
                console.error(
                    `[TaskService.getTaskById] RPC error fetching task ${taskId}:`,
                    rpcError
                );
                throw new Error(
                    `Failed to fetch task ${taskId}: ${rpcError.message}`
                );
            }

            if (!rpcData) {
                console.warn(
                    `[TaskService.getTaskById] No task found with ID ${taskId} via RPC.`
                );
                throw new Error('Task not found');
            }

            const dbTask = Array.isArray(rpcData)
                ? (rpcData[0] as DbTask)
                : (rpcData as DbTask);

            if (!dbTask) {
                console.warn(
                    `[TaskService.getTaskById] No task data after RPC call for ID ${taskId}.`
                );
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
                .update({
                    is_archived: true,
                    updated_at: new Date().toISOString(),
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
                    `[TaskService.archiveTask] Error archiving task ${taskId}:`,
                    updateError
                );
                throw new Error(
                    `Failed to archive task ${taskId}: ${updateError.message}`
                );
            }

            if (!updatedTaskData) {
                console.warn(
                    `[TaskService.archiveTask] Task ${taskId} not found or not updated.`
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
                    updated_at: new Date().toISOString(),
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
}; // End of TaskService object

export default TaskService;
