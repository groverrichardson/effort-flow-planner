import { Task, EffortLevel, TaskStatus, TaskUpdatePayload, TaskSegment, Priority } from '@/types';
import { GetTasksFilters } from './TaskService';
import { differenceInDays, addDays, startOfDay, formatISO } from 'date-fns';

// Interface for the TaskService dependency that schedulingService will use
export interface ISchedulingTaskService {
  getTasks: (filters: GetTasksFilters) => Promise<Task[]>;
  updateTask: (taskId: string, updates: TaskUpdatePayload) => Promise<Task | null>;
  getTasksContributingToEffortOnDate: (dateISO: string, userId: string) => Promise<Task[]>;
}

// Constants
const PRIORITY_ORDER_MAP: Record<Priority, number> = {
  [Priority.HIGH]: 1,
  [Priority.NORMAL]: 2,
  [Priority.LOW]: 3,
  [Priority.LOWEST]: 4,
};
const MAX_SCHEDULING_DAYS_AHEAD = 365;
const DEFAULT_DAILY_CAPACITY = 8; // Default if no tasks completed in 90 days

const LARGE_TASK_EP_THRESHOLDS = {
  EP8: 8,
  EP16: 16,
  EP32: 32,
};

const LARGE_TASK_TIMEFRAMES_DAYS = {
  [LARGE_TASK_EP_THRESHOLDS.EP8]: 7,
  [LARGE_TASK_EP_THRESHOLDS.EP16]: 14,
  [LARGE_TASK_EP_THRESHOLDS.EP32]: 28,
};


/**
 * Maps EffortLevel enum directly to its numeric point value.
 * @param effortLevel The effort level enum.
 * @returns The numeric effort points.
 */
export const getEffortPoints = (effortLevel: EffortLevel): number => {
  switch (effortLevel) {
    case EffortLevel.NONE: return 0;
    case EffortLevel.XS: return 1;
    case EffortLevel.S: return 2;
    case EffortLevel.M: return 4;
    case EffortLevel.L: return 8;
    case EffortLevel.XL: return 16;
    case EffortLevel.XXL: return 32;
    case EffortLevel.XXXL: return 64; // Assuming XXXL is 64 based on pattern
    default:
      console.warn(`[SchedulingService.getEffortPoints] Unknown effort level: ${effortLevel}`);
      return 0;
  }
};

/**
 * Calculates the user's average daily effort point (EP) capacity based on completed tasks
 * over the last 90 days, excluding archived tasks.
 * @param taskService The TaskService instance for database operations.
 * @param userId The ID of the user.
 * @returns A promise that resolves to the calculated daily capacity or a default value.
 */
export const calculateDailyCapacity = async (
  taskService: ISchedulingTaskService,
  userId: string
): Promise<number> => {
  console.log(`[SchedulingService.calculateDailyCapacity] Calculating for user ${userId}`);
  const today = startOfDay(new Date());
  const ninetyDaysAgo = startOfDay(addDays(today, -90));

  const filters: GetTasksFilters = {
    userId: userId,
    isArchived: false,
    status: TaskStatus.COMPLETED,
    completedAfter: formatISO(ninetyDaysAgo),
    completedBefore: formatISO(today),
  };

  try {
    console.log('[SchedulingService.calculateDailyCapacity] Fetching tasks with filters:', JSON.stringify(filters));
    const completedTasks = await taskService.getTasks(filters);

    if (completedTasks.length === 0) {
      console.log('[SchedulingService.calculateDailyCapacity] No completed tasks in the last 90 days matching criteria. Using default capacity.');
      return DEFAULT_DAILY_CAPACITY;
    }

    const totalEffortPoints = completedTasks.reduce((sum, task) => {
      // Ensure effortLevel is valid before calling getEffortPoints
      return sum + (task.effortLevel ? getEffortPoints(task.effortLevel) : 0);
    }, 0);
    
    const uniqueCompletionDays = new Set(
        completedTasks.map(task => task.completedDate ? formatISO(startOfDay(new Date(task.completedDate))) : '')
                      .filter(dateStr => dateStr !== '') // Filter out empty strings from tasks without completedDate
    ).size;

    if (uniqueCompletionDays === 0) {
        console.log('[SchedulingService.calculateDailyCapacity] No unique completion days found, though tasks exist. Using default capacity.');
        return DEFAULT_DAILY_CAPACITY;
    }

    const averageDailyEffort = totalEffortPoints / uniqueCompletionDays;
    console.log(`[SchedulingService.calculateDailyCapacity] Total EPs: ${totalEffortPoints}, Unique Days: ${uniqueCompletionDays}, Avg Daily EPs: ${averageDailyEffort.toFixed(2)}`);
    
    return Math.max(1, Math.round(averageDailyEffort)); // Ensure at least 1 EP capacity if there was activity

  } catch (error) {
    console.error('[SchedulingService.calculateDailyCapacity] Error calculating daily capacity:', error);
    console.warn('[SchedulingService.calculateDailyCapacity] Falling back to default capacity due to error.');
    return DEFAULT_DAILY_CAPACITY;
  }
};


/**
 * Gets the total scheduled effort points for a specific day for a user.
 * This includes effort from tasks directly scheduled on that day and segments of larger tasks.
 * @param taskService The TaskService instance.
 * @param dateISO The ISO string of the day to check.
 * @param userId The ID of the user.
 * @returns A promise that resolves to the total effort points scheduled for that day.
 */
export const getScheduledEffortForDay = async (
    taskService: ISchedulingTaskService,
    dateISO: string,
    userId: string
  ): Promise<number> => {
    console.log(`[DEBUG] getScheduledEffortForDay called with dateISO: ${dateISO}, userId: ${userId}`);
    try {
      const tasksOnDate = await taskService.getTasksContributingToEffortOnDate(dateISO, userId);
      console.log(`[DEBUG] tasksOnDate from service:`, JSON.stringify(tasksOnDate, null, 2));
      let totalEffort = 0;
  
      tasksOnDate.forEach(task => {
        console.log(`[DEBUG] Processing task: ${task.id}, user_id: ${task.user_id}`);
        if (task.user_id === userId) {
          console.log(`[DEBUG] Task ${task.id} belongs to user ${userId}.`);
          if (task.segments && task.segments.length > 0) {
            console.log(`[DEBUG] Task ${task.id} has ${task.segments.length} segments.`);
            task.segments.forEach(segment => {
              console.log(`[DEBUG] Processing segment:`, JSON.stringify(segment, null, 2));
              const segmentScheduledDateStr = segment.scheduled_date;
              if (segmentScheduledDateStr) {
                const parsedSegmentScheduledDate = new Date(segmentScheduledDateStr);
                const startOfSegmentDay = startOfDay(parsedSegmentScheduledDate);
                const formattedStartOfSegmentDayISO = startOfSegmentDay.toISOString();
                
                const targetDate = new Date(dateISO);
                const startOfTargetDay = startOfDay(targetDate);
                const formattedStartOfTargetDayISO = startOfTargetDay.toISOString();

                console.log(`[DEBUG] Segment scheduled_date (raw): ${segmentScheduledDateStr}`);
                console.log(`[DEBUG] Target dateISO (func arg): ${dateISO}`);
                console.log(`[DEBUG] Formatted segment scheduled_date for comparison (ISO): ${formattedStartOfSegmentDayISO}`);
                console.log(`[DEBUG] Formatted target dateISO for comparison (ISO): ${formattedStartOfTargetDayISO}`);
                
                const datesMatch = formattedStartOfSegmentDayISO === formattedStartOfTargetDayISO;
                console.log(`[DEBUG] Segment dates match: ${datesMatch}`);

                if (datesMatch) {
                  totalEffort += segment.effort_points;
                  console.log(`[DEBUG] Added ${segment.effort_points} EP from segment. Current totalEffort: ${totalEffort}`);
                }
              } else {
                console.log(`[DEBUG] Segment has no scheduled_date.`);
              }
            });
          } else if (task.scheduled_start_date) {
            console.log(`[DEBUG] Task ${task.id} is non-segmented. Checking scheduled_start_date: ${task.scheduled_start_date}`);
            const taskScheduledStartDate = new Date(task.scheduled_start_date);
            const startOfTaskScheduledDay = startOfDay(taskScheduledStartDate);
            const formattedStartOfTaskScheduledDayISO = startOfTaskScheduledDay.toISOString();

            const targetDate = new Date(dateISO);
            const startOfTargetDay = startOfDay(targetDate);
            const formattedStartOfTargetDayISO = startOfTargetDay.toISOString();
            
            console.log(`[DEBUG] Formatted task scheduled_start_date for comparison (ISO): ${formattedStartOfTaskScheduledDayISO}`);
            console.log(`[DEBUG] Formatted target dateISO for comparison (ISO): ${formattedStartOfTargetDayISO}`);

            const datesMatch = formattedStartOfTaskScheduledDayISO === formattedStartOfTargetDayISO;
            console.log(`[DEBUG] Non-segmented task dates match: ${datesMatch}`);

            if (datesMatch) {
              const effortPoints = getEffortPoints(task.effortLevel);
              totalEffort += effortPoints;
              console.log(`[DEBUG] Added ${effortPoints} EP from non-segmented task. Current totalEffort: ${totalEffort}`);
            }
          } else {
            console.log(`[DEBUG] Task ${task.id} has no segments and no scheduled_start_date.`);
          }
        } else {
          console.log(`[DEBUG] Task ${task.id} does NOT belong to user ${userId}. Skipping.`);
        }
      });
      console.log(`[DEBUG] Final totalEffort for ${dateISO}, user ${userId}: ${totalEffort} EP`);
      return totalEffort;
    } catch (error) {
      console.error(`[DEBUG] Error in getScheduledEffortForDay for ${dateISO}, user ${userId}:`, error);
      return 0; // Assume no effort if error occurs
    }
  };

/**
 * Finds the first available day for a task, considering daily capacity and task's own start date.
 * @param taskService The TaskService instance.
 * @param task The task to schedule.
 * @param dailyCapacity The user's daily effort capacity.
 * @param userId The ID of the user.
 * @returns A promise that resolves to the ISO string of the first available day or null if none found within limits.
 */
const findFirstAvailableDay = async (
  taskService: ISchedulingTaskService,
  task: Task,
  dailyCapacity: number,
  userId: string
): Promise<string | null> => {
  let currentDate = task.scheduled_start_date && task.scheduled_start_date.trim() !== '' ? startOfDay(new Date(task.scheduled_start_date)) : startOfDay(new Date());
  const taskEffort = getEffortPoints(task.effortLevel);

  for (let i = 0; i < MAX_SCHEDULING_DAYS_AHEAD; i++) {
    const scheduledEffortToday = await getScheduledEffortForDay(taskService, formatISO(currentDate), userId);
    if (dailyCapacity - scheduledEffortToday >= taskEffort) {
      return formatISO(currentDate);
    }
    currentDate = addDays(currentDate, 1);
  }
  console.warn(`[SchedulingService.findFirstAvailableDay] No available day found for task ${task.id} within ${MAX_SCHEDULING_DAYS_AHEAD} days.`);
  return null;
};

/**
 * Schedules a large task by breaking it into segments over a defined timeframe.
 * Tries to fill capacity day by day, starting from the task's preferred start date (or today).
 * If the task cannot be fully scheduled within its ideal timeframe, it will be partially scheduled,
 * and its status will be set to PENDING.
 * @param taskService The TaskService instance.
 * @param task The large task to schedule (must have effort > dailyCapacity).
 * @param dailyCapacity The user's daily effort capacity.
 * @param userId The ID of the user.
 * @returns A promise that resolves to an object containing the generated segments and the task's new status.
 *          Returns null or empty segments if the task cannot be scheduled at all.
 */
const scheduleLargeTaskOverTimeframe = async (
  taskService: ISchedulingTaskService,
  task: Task,
  dailyCapacity: number,
  userId: string
): Promise<{ segments: TaskSegment[]; status: TaskStatus; effective_due_date?: string } | null> => {
  const taskEffort = getEffortPoints(task.effortLevel);
  let remainingEffort = taskEffort;
  const segments: TaskSegment[] = [];
  
  let timeframeDays:
    | typeof LARGE_TASK_TIMEFRAMES_DAYS[typeof LARGE_TASK_EP_THRESHOLDS.EP8]
    | typeof LARGE_TASK_TIMEFRAMES_DAYS[typeof LARGE_TASK_EP_THRESHOLDS.EP16]
    | typeof LARGE_TASK_TIMEFRAMES_DAYS[typeof LARGE_TASK_EP_THRESHOLDS.EP32]
    | number; // Fallback type

  if (taskEffort <= LARGE_TASK_EP_THRESHOLDS.EP8) timeframeDays = LARGE_TASK_TIMEFRAMES_DAYS[LARGE_TASK_EP_THRESHOLDS.EP8];
  else if (taskEffort <= LARGE_TASK_EP_THRESHOLDS.EP16) timeframeDays = LARGE_TASK_TIMEFRAMES_DAYS[LARGE_TASK_EP_THRESHOLDS.EP16];
  else timeframeDays = LARGE_TASK_TIMEFRAMES_DAYS[LARGE_TASK_EP_THRESHOLDS.EP32]; 
  // For tasks > 32 EP, we might need a more dynamic timeframe or cap it.
  // For now, tasks > 32 EP will use the 32 EP timeframe (28 days).
  if (taskEffort > LARGE_TASK_EP_THRESHOLDS.EP32) {
    console.warn(`[SchedulingService.scheduleLargeTaskOverTimeframe] Task ${task.id} with ${taskEffort} EP exceeds max defined large task threshold. Using ${LARGE_TASK_TIMEFRAMES_DAYS[LARGE_TASK_EP_THRESHOLDS.EP32]} day timeframe.`);
    // Potentially adjust timeframeDays dynamically for very large tasks, e.g., Math.ceil(taskEffort / (dailyCapacity * 0.5)) to spread more thinly
    // For now, it defaults to the largest defined timeframe (28 days)
  }

  let currentDate = task.scheduled_start_date ? startOfDay(new Date(task.scheduled_start_date)) : startOfDay(new Date());
  const endDateLimit = addDays(currentDate, timeframeDays -1); // -1 because timeframe includes start day

  console.log(`[SchedulingService.scheduleLargeTaskOverTimeframe] Scheduling large task ${task.id} (${taskEffort} EP) from ${formatISO(currentDate)} up to ${formatISO(endDateLimit)} (timeframe: ${timeframeDays} days).`);

  let daysScheduled = 0;
  while (remainingEffort > 0 && currentDate <= endDateLimit && daysScheduled < MAX_SCHEDULING_DAYS_AHEAD) {
    const scheduledEffortOnCurrentDate = await getScheduledEffortForDay(taskService, formatISO(currentDate), userId);
    const availableCapacityToday = dailyCapacity - scheduledEffortOnCurrentDate;

    if (availableCapacityToday > 0) {
      const effortForThisSegment = Math.min(remainingEffort, availableCapacityToday, dailyCapacity); // Cap segment at daily capacity too
      
      if (effortForThisSegment > 0) {
        segments.push({
          parent_task_id: task.id,
          effort_points: effortForThisSegment,
          scheduled_date: formatISO(currentDate),
          status: TaskStatus.PENDING, // Individual segments are pending until worked on
        });
        remainingEffort -= effortForThisSegment;
        console.log(`[SchedulingService.scheduleLargeTaskOverTimeframe] Scheduled segment for ${task.id} on ${formatISO(currentDate)} for ${effortForThisSegment} EP. Remaining: ${remainingEffort} EP.`);
      }
    }
    currentDate = addDays(currentDate, 1);
    daysScheduled++;
  }

  if (segments.length === 0) {
    console.warn(`[SchedulingService.scheduleLargeTaskOverTimeframe] No segments scheduled for large task ${task.id} within its timeframe. Returning null.`);
    return null;
  }

  const newStatus = remainingEffort === 0 ? TaskStatus.SCHEDULED : TaskStatus.PENDING;
  if (newStatus === TaskStatus.PENDING && remainingEffort > 0) {
    console.warn(`[SchedulingService.scheduleLargeTaskOverTimeframe] Task ${task.id} could not be fully scheduled. ${remainingEffort} EP remaining. Status set to PENDING.`);
  }
  
  console.log(`[SchedulingService.scheduleLargeTaskOverTimeframe] Finished segmenting for ${task.id}. Total segments: ${segments.length}, Final status: ${newStatus}`);
  if (newStatus === TaskStatus.PENDING && remainingEffort > 0) {
    return { segments, status: newStatus, effective_due_date: formatISO(endDateLimit) };
  }
  return { segments, status: newStatus };
};


/**
 * Schedules a single task. If the task is small (fits within daily capacity),
 * it finds the first available day. If large, it delegates to scheduleLargeTaskOverTimeframe.
 * Updates the task in the database with new schedule information.
 * @param taskService The TaskService instance.
 * @param task The task to schedule.
 * @param dailyCapacity The user's daily effort capacity.
 * @param userId The ID of the user.
 * @returns A promise that resolves to the updated task or null if scheduling failed.
 */
export const scheduleTask = async (
  taskService: ISchedulingTaskService,
  task: Task,
  dailyCapacity: number,
  userId: string
): Promise<Task | null> => {
  console.log(`[SchedulingService.scheduleTask] Attempting to schedule task ${task.id} (${task.title}) with effort ${task.effortLevel} EP. Daily capacity: ${dailyCapacity} EP.`);
  const taskEffort = getEffortPoints(task.effortLevel);

  // If taskEffort is 0, it will be scheduled on the first available day by the logic below.
  // console.log(`[SchedulingService.scheduleTask] Task ${task.id} has ${taskEffort} EP. Proceeding with scheduling.`);

  // Ensure task has a start date for scheduling, default to today if not set
  // This was: task.scheduled_start_date ? startOfDay(new Date(task.scheduled_start_date)) : startOfDay(new Date());
  // We should respect task.scheduled_start_date if it exists for the findFirstAvailableDay logic.

  if (taskEffort <= dailyCapacity) {
    // Small task, schedule on a single day
    console.log(`[SchedulingService.scheduleTask] Task ${task.id} is small (${taskEffort} EP). Finding first available day.`);
    const availableDay = await findFirstAvailableDay(taskService, task, dailyCapacity, userId);
    if (availableDay) {
      console.log(`[SchedulingService.scheduleTask] Scheduling small task ${task.id} on ${availableDay}.`);
      const updatePayload: TaskUpdatePayload = {
        scheduled_start_date: availableDay,
        due_date: availableDay, // For small tasks, due date can be same as scheduled date
        status: TaskStatus.SCHEDULED,
      };
      if (taskEffort > 0) { // For small tasks with actual effort, create a segment.
        updatePayload.segments = [{
          parent_task_id: task.id,
          effort_points: taskEffort,
          scheduled_date: availableDay,
          status: TaskStatus.PENDING, // Segments are PENDING until task fully scheduled
        }];
      }
      const updatedTask = await taskService.updateTask(task.id, updatePayload);
      console.log(`[SchedulingService.scheduleTask] Updated small task ${task.id} in DB:`, updatedTask);
      return updatedTask;
    } else {
      console.warn(`[SchedulingService.scheduleTask] Could not find an available day for small task ${task.id}. Setting status to PENDING and returning null.`);
      if (task.status !== TaskStatus.PENDING) {
        await taskService.updateTask(task.id, { status: TaskStatus.PENDING });
      }
      return null; // Ensure null is returned as per test expectation
    }
  } else {
    // This is a large task, needs to be segmented
    console.log(`[SchedulingService.scheduleTask] Task ${task.id} is large (${taskEffort} EP). Attempting to schedule over timeframe.`);
    const schedulingResult = await scheduleLargeTaskOverTimeframe(
      taskService,
      task,
      dailyCapacity,
      userId
    );

    if (schedulingResult && schedulingResult.segments.length > 0) { 
      console.log(`[SchedulingService.scheduleTask] Large task ${task.id} successfully segmented. Segments:`, schedulingResult.segments);
      const updates: TaskUpdatePayload = {
        segments: schedulingResult.segments,
        status: schedulingResult.status,
        scheduled_start_date: schedulingResult.segments[0]?.scheduled_date ? formatISO(startOfDay(new Date(schedulingResult.segments[0].scheduled_date))) : task.scheduled_start_date,
      };

      if (schedulingResult.status === TaskStatus.PENDING && schedulingResult.effective_due_date) {
        updates.due_date = schedulingResult.effective_due_date;
      } else if (schedulingResult.status === TaskStatus.SCHEDULED && schedulingResult.segments && schedulingResult.segments.length > 0) {
        // For fully scheduled large tasks, set due_date to the date of the last segment
        const lastSegment = schedulingResult.segments[schedulingResult.segments.length - 1];
        updates.due_date = lastSegment.scheduled_date;
      }

      const updatedTask = await taskService.updateTask(task.id, updates);
      console.log(`[SchedulingService.scheduleTask] Updated large task ${task.id} in DB:`, updatedTask);
      return updatedTask;
    } else { 
      console.warn(`[SchedulingService.scheduleTask] Could not schedule large task ${task.id}. No segments were created or task could not be scheduled. Returning null.`);
      return null; 
    }
  }
  // Fallback, though ideally all paths above should return.
  return null;
};



/**
 * Sorts tasks for scheduling based on due date, target deadline, priority, and creation date.
 * Test failures indicate the following effective sort order:
 * - Due Date: ascending, nulls first.
 * - Target Deadline: ascending, nulls first.
 * - Priority: High > Normal > Low > Lowest (achieved by sorting PRIORITY_ORDER_MAP values ascending).
 * - Creation Date: ascending, nulls last.
 * @param tasks Array of tasks to sort.
 * @returns A new array of sorted tasks.
 */
const compareDates = (dateStrA: string | null | undefined, dateStrB: string | null | undefined, nullsFirst: boolean): number => {
  // Handle null or undefined inputs first
  const aIsNull = dateStrA === null || dateStrA === undefined;
  const bIsNull = dateStrB === null || dateStrB === undefined;

  if (aIsNull && bIsNull) return 0;
  if (aIsNull) return nullsFirst ? -1 : 1;
  if (bIsNull) return nullsFirst ? 1 : -1;

  // At this point, dateStrA and dateStrB are non-null strings.
  const dateA = new Date(dateStrA!); // Use non-null assertion
  const dateB = new Date(dateStrB!); // Use non-null assertion

  // Check for invalid dates that might result from parsing non-null strings
  const aIsInvalid = isNaN(dateA.getTime());
  const bIsInvalid = isNaN(dateB.getTime());

  if (aIsInvalid && bIsInvalid) return 0;
  // Treat invalid dates as equivalent to null for sorting order
  if (aIsInvalid) return nullsFirst ? -1 : 1;
  if (bIsInvalid) return nullsFirst ? 1 : -1;

  // Both are valid dates
  if (dateA.getTime() < dateB.getTime()) return -1;
  if (dateA.getTime() > dateB.getTime()) return 1;
  return 0;
};

export const sortTasksForScheduling = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    // Helper to get ISO string or null
    const getISODateString = (dateField: Date | string | null | undefined): string | null => {
      if (!dateField) return null;
      if (dateField instanceof Date) return dateField.toISOString();
      // Assuming it's already an ISO string if not a Date object and not null/undefined
      if (typeof dateField === 'string') return dateField;
      // Fallback for unexpected types
      console.warn(`[SchedulingService.sortTasksForScheduling] Unexpected date field type: ${typeof dateField}`, dateField);
      return null;
    };

    // 1. Due Date (ascending, non-nulls first as per memory/test expectation)
    let diff = compareDates(getISODateString(a.dueDate), getISODateString(b.dueDate), false); // false for nullsFirst means non-nulls first
    if (diff !== 0) return diff;

    // 2. Target Deadline (ascending, non-nulls first as per memory/test expectation)
    diff = compareDates(getISODateString(a.targetDeadline), getISODateString(b.targetDeadline), false); // false for nullsFirst means non-nulls first
    if (diff !== 0) return diff;

    // 3. Priority (High > Normal > Low > Lowest)
    const priorityA = PRIORITY_ORDER_MAP[a.priority || Priority.NORMAL];
    const priorityB = PRIORITY_ORDER_MAP[b.priority || Priority.NORMAL];
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // 4. Creation Date (ascending, nulls last)
    diff = compareDates(getISODateString(a.createdAt), getISODateString(b.createdAt), false); // false for nullsLast
    return diff;
  });
};

/**
 * Main algorithm to run the scheduling process for a user.
 * Fetches unscheduled tasks, calculates daily capacity, sorts tasks, and schedules them.
 * @param taskService The TaskService instance.
 * @param userId The ID of the user for whom to run scheduling.
 */
export const runSchedulingAlgorithm = async (
  taskService: ISchedulingTaskService,
  userId: string,
  tasksToSchedule: Task[] // Pass in the tasks that need scheduling
): Promise<void> => {
  console.log(`[SchedulingService.runSchedulingAlgorithm] Starting for user ${userId}...`);
  const capacity = await calculateDailyCapacity(taskService, userId);
  console.log(`[SchedulingService.runSchedulingAlgorithm] User daily capacity: ${capacity} EPs`);

  const sortedTasksToSchedule = sortTasksForScheduling(tasksToSchedule);

  for (const task of sortedTasksToSchedule) {
    // Schedule only if task is in a state that requires scheduling (e.g., PENDING, or specific statuses)
    if (task.status === TaskStatus.PENDING) {
        console.log(`[SchedulingService.runSchedulingAlgorithm] Processing task ${task.id} (${task.title}) for scheduling as its status is PENDING.`);
        await scheduleTask(taskService, task, capacity, userId);
    } else {
        console.log(`[SchedulingService.runSchedulingAlgorithm] Skipping task ${task.id} (${task.title}) as its status is ${task.status}.`);
    }
  }
  console.log('[SchedulingService.runSchedulingAlgorithm] Finished.');
};

// TODO:
// 1. Refine `calculateDailyCapacity`: Ensure TaskService.getTasks can filter by user_id, completed status, and completedDate range.
// 2. Refine `getScheduledEffortForDay`: Ensure TaskService.getTasksContributingToEffortOnDate accurately reflects effort from segments.
//    If tasks don't have segments, this function needs a reliable way to determine their daily effort contribution.
// 3. Add comprehensive unit tests for all exported functions, especially `scheduleLargeTaskOverTimeframe` and the modified `scheduleTask`,
//    using a mocked taskService. Test various scenarios:
//      - Large task fitting perfectly.
//      - Large task when some days in timeframe are full/partial.
//      - Large task that cannot be fully scheduled in timeframe.
//      - Interaction with already scheduled tasks.
// 4. Review `TaskStatus.TODO` usage in `runSchedulingAlgorithm` as it's not in the `TaskStatus` enum.
// 5. Consider how `task.start_date` influences scheduling. Currently, `findFirstAvailableDay` and `scheduleLargeTaskOverTimeframe` use it as a preferred start.
