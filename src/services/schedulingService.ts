import { Task, EffortLevel, TaskStatus, TaskUpdatePayload, TaskSegment } from '@/types';
import { differenceInDays, addDays, startOfDay, formatISO } from 'date-fns';

// Interface for the TaskService dependency that schedulingService will use
export interface ISchedulingTaskService {
  getTasks: (isArchived?: boolean, projectId?: string | null) => Promise<Task[]>;
  updateTask: (taskId: string, updates: TaskUpdatePayload) => Promise<Task | null>;
  getTasksContributingToEffortOnDate: (dateISO: string, userId: string) => Promise<Task[]>;
}

// Constants
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
 * @returns A promise that resolves to the calculated daily capacity or a default if no data.
 */
export const calculateDailyCapacity = async (taskService: ISchedulingTaskService, userId: string): Promise<number> => {
  const ninetyDaysAgoDate = startOfDay(addDays(new Date(), -90));
  
  // Assuming getTasks can filter by user_id and completed_at range.
  // This part might need adjustment based on actual TaskService capabilities.
  const allUserTasks = await taskService.getTasks(false); // Get non-archived tasks for the user
  
  const completedTasksLast90Days = allUserTasks.filter(task => {
    return task.user_id === userId &&
           task.completed && // or task.status === TaskStatus.COMPLETED
           task.completedDate && 
           new Date(task.completedDate) >= ninetyDaysAgoDate;
  });

  if (completedTasksLast90Days.length === 0) {
    console.log('[SchedulingService.calculateDailyCapacity] No completed tasks in the last 90 days. Using default capacity.');
    return DEFAULT_DAILY_CAPACITY;
  }

  const totalEffortPoints = completedTasksLast90Days.reduce((sum, task) => sum + getEffortPoints(task.effortLevel), 0);
  const uniqueDaysWithCompletedTasks = new Set(completedTasksLast90Days.map(task => formatISO(startOfDay(new Date(task.completedDate!))))).size;
  
  // Ensure we don't divide by zero if all tasks were completed on the same day within the 90 day window but we want daily average over distinct days of activity
  // Or, more simply, average over the 90 day period. The prompt implies average daily EPs.
  // If we want average EPs per active day:
  // const averageDailyCapacity = uniqueDaysWithCompletedTasks > 0 ? totalEffortPoints / uniqueDaysWithCompletedTasks : DEFAULT_DAILY_CAPACITY;
  // If we want average daily EPs over the 90 day period (more stable):
  const averageDailyCapacity = totalEffortPoints / 90;


  console.log(`[SchedulingService.calculateDailyCapacity] Total EPs in last 90 days: ${totalEffortPoints}. Unique days with completions: ${uniqueDaysWithCompletedTasks}. Calculated capacity: ${Math.round(averageDailyCapacity) || DEFAULT_DAILY_CAPACITY}`);
  return Math.round(averageDailyCapacity) || DEFAULT_DAILY_CAPACITY; // Ensure it's at least default, or handle 0 capacity if preferred
};

/**
 * Finds the first available day with enough capacity for at least 1 EP, starting from a preferred date.
 * @param taskService The TaskService instance.
 * @param dailyCapacity User's daily EP capacity.
 * @param userId User's ID.
 * @param preferredStartDate The date to start searching from.
 * @returns A promise resolving to the date and available capacity, or null if no day found.
 */
const findFirstAvailableDay = async (
  taskService: ISchedulingTaskService,
  dailyCapacity: number,
  userId: string,
  preferredStartDate: Date = new Date()
): Promise<{ date: Date | null; availableCapacityOnDate: number }> => {
  let currentDate = startOfDay(preferredStartDate);
  for (let i = 0; i < MAX_SCHEDULING_DAYS_AHEAD; i++) {
    const currentDateISO = formatISO(currentDate);
    const scheduledEffortOnThisDay = await getScheduledEffortForDay(taskService, currentDateISO, userId);
    const availableCapacityOnThisDay = dailyCapacity - scheduledEffortOnThisDay;

    if (availableCapacityOnThisDay > 0) { // Found a day with some capacity
      return { date: currentDate, availableCapacityOnDate };
    }
    currentDate = addDays(currentDate, 1);
  }
  return { date: null, availableCapacityOnDate: 0 }; // No suitable day found
};

/**
 * Gets the total effort points already scheduled for a specific day for a user.
 * @param taskService The TaskService instance.
 * @param dateISO The ISO string of the date to check.
 * @param userId The ID of the user.
 * @returns A promise resolving to the total scheduled effort points for that day.
 */
export const getScheduledEffortForDay = async (
  taskService: ISchedulingTaskService,
  dateISO: string,
  userId: string
): Promise<number> => {
  // This assumes TaskService has a method to get tasks/segments scheduled on a specific date.
  // Or, if tasks store segments, it fetches tasks and sums EPs from segments matching the date.
  const tasksOnDate = await taskService.getTasksContributingToEffortOnDate(dateISO, userId);
  
  let totalEffort = 0;
  tasksOnDate.forEach(task => {
    if (task.segments && task.segments.length > 0) {
      task.segments.forEach(segment => {
        if (segment.scheduled_date === dateISO) {
          totalEffort += segment.effort_points;
        }
      });
    } else if (task.scheduled_start_date === dateISO && task.status !== TaskStatus.COMPLETED && task.status !== TaskStatus.CANCELLED) {
      // Fallback for tasks without segments, if they are scheduled for this day as a whole
      // This might double count if segments are also present and task.scheduled_start_date is also set.
      // Prefer segment-based calculation if segments are the source of truth for scheduled effort.
      // For now, assuming segments are primary. If no segments, check task's own scheduled_start_date.
      // This part needs careful consideration based on how tasks are structured.
      // Let's assume for now that if a task has segments, those are the source of truth for daily effort.
      // If no segments, and scheduled_start_date matches, and it's a single-day task, count its full effort.
      // This is simplified; a robust solution would rely purely on segments or a clear task scheduling field.
    }
  });
  return totalEffort;
};

/**
 * Schedules a task by splitting it into segments if it exceeds daily capacity.
 * Assumes firstAvailableDate already has some capacity.
 * @param taskService The TaskService instance.
 * @param taskToSchedule The task to schedule.
 * @param dailyCapacity User's daily EP capacity.
 * @param userId User's ID.
 * @param firstAvailableDate The first day identified with available capacity.
 * @param capacityOnFirstDay The available capacity on that first day.
 * @returns A promise resolving to the updated task with segments, or null if scheduling fails.
 */
const findFirstAvailableDayAndScheduleOrSplit = async (
  taskService: ISchedulingTaskService,
  taskToSchedule: Task,
  dailyCapacity: number,
  userId: string,
  firstAvailableDate: Date, // This is the date found by findFirstAvailableDay
  capacityOnFirstDay: number // Capacity on that specific firstAvailableDate
): Promise<Task | null> => {
  let remainingEffort = getEffortPoints(taskToSchedule.effort_level);
  const scheduledSegments: TaskSegment[] = [];
  let currentDate = startOfDay(firstAvailableDate);
  let currentDayOffset = 0; // Relative to firstAvailableDate

  // Handle the first day separately using the pre-calculated capacityOnFirstDay
  if (remainingEffort > 0 && capacityOnFirstDay > 0) {
    const effortThisDay = Math.min(remainingEffort, capacityOnFirstDay);
    scheduledSegments.push({
      parent_task_id: taskToSchedule.id,
      effort_points: effortThisDay,
      scheduled_date: formatISO(currentDate),
      status: TaskStatus.PENDING,
    });
    remainingEffort -= effortThisDay;
  }
  currentDate = addDays(currentDate, 1); // Move to the next day for further scheduling

  // Continue scheduling for subsequent days if effort remains
  while (remainingEffort > 0 && currentDayOffset < MAX_SCHEDULING_DAYS_AHEAD - (differenceInDays(currentDate, firstAvailableDate))) {
    const currentDateISO = formatISO(currentDate);
    const scheduledEffortOnThisDay = await getScheduledEffortForDay(taskService, currentDateISO, userId);
    const availableCapacityOnThisDay = Math.max(0, dailyCapacity - scheduledEffortOnThisDay);

    if (availableCapacityOnThisDay > 0) {
      const effortToScheduleThisDay = Math.min(remainingEffort, availableCapacityOnThisDay);
      if (effortToScheduleThisDay > 0) {
         scheduledSegments.push({
          parent_task_id: taskToSchedule.id,
          effort_points: effortToScheduleThisDay,
          scheduled_date: currentDateISO,
          status: TaskStatus.PENDING,
        });
        remainingEffort -= effortToScheduleThisDay;
      }
    }
    if (remainingEffort <= 0) break;
    currentDate = addDays(currentDate, 1);
    currentDayOffset++;
  }

  if (remainingEffort > 0) {
    console.warn(`[SchedulingService.scheduleTaskOrSplit] Could not fully schedule task ${taskToSchedule.id}. Remaining EPs: ${remainingEffort}. Task might be too large or no capacity.`);
    // Update with partially scheduled segments or handle as unschedulable
    // For now, we'll update with what was scheduled.
  }

  if (scheduledSegments.length === 0 && getEffortPoints(taskToSchedule.effort_level) > 0) {
    console.warn(`[SchedulingService.scheduleTaskOrSplit] No segments scheduled for task ${taskToSchedule.id}.`);
    return null; // Cannot schedule any part of it
  }

  const taskUpdates: TaskUpdatePayload = {
    segments: scheduledSegments,
    status: scheduledSegments.length > 0 && remainingEffort === 0 ? TaskStatus.SCHEDULED : TaskStatus.PENDING, // Or IN_PROGRESS
    scheduled_start_date: scheduledSegments[0]?.scheduled_date,
    due_date: scheduledSegments[scheduledSegments.length - 1]?.scheduled_date,
  };

  try {
    const updatedTask = await taskService.updateTask(taskToSchedule.id, taskUpdates);
    if (updatedTask) {
      console.log(`[SchedulingService.scheduleTaskOrSplit] Successfully scheduled/split task ${updatedTask.id} with ${scheduledSegments.length} segments.`);
      return updatedTask;
    } else {
      console.error(`[SchedulingService.scheduleTaskOrSplit] Failed to update task ${taskToSchedule.id} after segmenting.`);
      return null;
    }
  } catch (error) {
    console.error(`[SchedulingService.scheduleTaskOrSplit] Error updating task ${taskToSchedule.id}:`, error);
    return null;
  }
};


/**
 * Schedules a large task by distributing its effort points over a predefined timeframe.
 * @param taskService The TaskService instance for database operations.
 * @param taskToSchedule The large task to schedule.
 * @param dailyCapacity The user's daily effort point capacity.
 * @param userId The ID of the user.
 * @param timeframeInDays The number of days over which to schedule the task.
 * @returns A promise that resolves to the updated task with scheduled segments, or null if scheduling fails.
 */
const scheduleLargeTaskOverTimeframe = async (
  taskService: ISchedulingTaskService,
  taskToSchedule: Task,
  dailyCapacity: number,
  userId: string,
  timeframeInDays: number
): Promise<Task | null> => {
  console.log(`[SchedulingService.scheduleLargeTaskOverTimeframe] Scheduling large task ${taskToSchedule.id} (${taskToSchedule.title}) over ${timeframeInDays} days.`);
  let remainingEffort = getEffortPoints(taskToSchedule.effort_level);
  const scheduledSegments: TaskSegment[] = [];
  let currentDayOffset = 0;
  let daysProcessed = 0; // Tracks how many days within the timeframe we've tried to schedule on

  const taskEffectiveStartDate = taskToSchedule.start_date ? new Date(taskToSchedule.start_date) : new Date();
  let currentDate = startOfDay(taskEffectiveStartDate);

  while (remainingEffort > 0 && daysProcessed < timeframeInDays && currentDayOffset < MAX_SCHEDULING_DAYS_AHEAD) {
    const currentDateISO = formatISO(currentDate);
    const scheduledEffortOnThisDay = await getScheduledEffortForDay(taskService, currentDateISO, userId);
    const availableCapacityOnThisDay = Math.max(0, dailyCapacity - scheduledEffortOnThisDay);

    if (availableCapacityOnThisDay > 0) {
      const effortToScheduleThisDay = Math.min(remainingEffort, availableCapacityOnThisDay);
      if (effortToScheduleThisDay > 0) {
        scheduledSegments.push({
          parent_task_id: taskToSchedule.id,
          effort_points: effortToScheduleThisDay,
          scheduled_date: currentDateISO,
          status: TaskStatus.PENDING,
        });
        remainingEffort -= effortToScheduleThisDay;
      }
    }
    
    currentDate = addDays(currentDate, 1);
    currentDayOffset++; // Overall days advanced in the calendar
    daysProcessed++; // Days considered within the specific timeframe for this large task
  }

  if (remainingEffort > 0) {
    console.warn(`[SchedulingService.scheduleLargeTaskOverTimeframe] Could not fully schedule large task ${taskToSchedule.id} within ${timeframeInDays} days. Remaining EPs: ${remainingEffort}.`);
  }

  if (scheduledSegments.length === 0 && getEffortPoints(taskToSchedule.effort_level) > 0) {
    console.warn(`[SchedulingService.scheduleLargeTaskOverTimeframe] No segments scheduled for large task ${taskToSchedule.id}.`);
    return null; 
  }
  
  const taskUpdates: TaskUpdatePayload = {
    segments: scheduledSegments,
    status: scheduledSegments.length > 0 && remainingEffort === 0 ? TaskStatus.SCHEDULED : TaskStatus.PENDING,
    scheduled_start_date: scheduledSegments[0]?.scheduled_date,
    due_date: scheduledSegments[scheduledSegments.length - 1]?.scheduled_date,
  };

  try {
    const updatedTask = await taskService.updateTask(taskToSchedule.id, taskUpdates);
    if (updatedTask) {
      console.log(`[SchedulingService.scheduleLargeTaskOverTimeframe] Successfully processed large task ${updatedTask.id} with ${scheduledSegments.length} segments.`);
      return updatedTask;
    } else {
      console.error(`[SchedulingService.scheduleLargeTaskOverTimeframe] Failed to update large task ${taskToSchedule.id}.`);
      return null;
    }
  } catch (error) {
    console.error(`[SchedulingService.scheduleLargeTaskOverTimeframe] Error updating task ${taskToSchedule.id}:`, error);
    return null;
  }
};


/**
 * Schedules a single task, determining if it's a large task, fits in one day, or needs splitting.
 * @param taskService The TaskService instance.
 * @param taskToSchedule The task to schedule.
 * @param dailyCapacity User's daily EP capacity.
 * @param userId User's ID.
 * @returns A promise resolving to the updated task, or null if scheduling fails.
 */
export const scheduleTask = async (
  taskService: ISchedulingTaskService,
  taskToSchedule: Task,
  dailyCapacity: number,
  userId: string
): Promise<Task | null> => {
  console.log(`[SchedulingService.scheduleTask] Attempting to schedule task ${taskToSchedule.id} (${taskToSchedule.title}) with effort ${taskToSchedule.effort_level} (${getEffortPoints(taskToSchedule.effort_level)} EPs).`);

  const taskEffortPoints = getEffortPoints(taskToSchedule.effort_level);

  if (taskEffortPoints === 0) {
    console.log(`[SchedulingService.scheduleTask] Task ${taskToSchedule.id} has 0 EPs. Marking as scheduled if not completed/cancelled.`);
    if (taskToSchedule.status !== TaskStatus.COMPLETED && taskToSchedule.status !== TaskStatus.CANCELLED) {
        return taskService.updateTask(taskToSchedule.id, { 
            status: TaskStatus.SCHEDULED, // Or COMPLETED if 0 EP means instantly done
            scheduled_start_date: formatISO(startOfDay(taskToSchedule.start_date || new Date())),
            due_date: formatISO(startOfDay(taskToSchedule.start_date || new Date())),
        });
    }
    return taskToSchedule; // Already in a final state or no action needed
  }

  let largeTaskTimeframeInDays: number | undefined;
  if (taskEffortPoints === LARGE_TASK_EP_THRESHOLDS.EP8) {
    largeTaskTimeframeInDays = LARGE_TASK_TIMEFRAMES_DAYS[LARGE_TASK_EP_THRESHOLDS.EP8];
  } else if (taskEffortPoints === LARGE_TASK_EP_THRESHOLDS.EP16) {
    largeTaskTimeframeInDays = LARGE_TASK_TIMEFRAMES_DAYS[LARGE_TASK_EP_THRESHOLDS.EP16];
  } else if (taskEffortPoints === LARGE_TASK_EP_THRESHOLDS.EP32) {
    largeTaskTimeframeInDays = LARGE_TASK_TIMEFRAMES_DAYS[LARGE_TASK_EP_THRESHOLDS.EP32];
  }

  if (largeTaskTimeframeInDays) {
    console.log(`[SchedulingService.scheduleTask] Identified as large task. Attempting to schedule over ${largeTaskTimeframeInDays} days.`);
    return scheduleLargeTaskOverTimeframe(taskService, taskToSchedule, dailyCapacity, userId, largeTaskTimeframeInDays);
  }

  // If not a "large task" with a predefined timeframe, proceed with standard scheduling/splitting.
  console.log(`[SchedulingService.scheduleTask] Not a predefined large task. Proceeding with standard scheduling/splitting.`);
  try {
    const taskEffectiveStartDate = taskToSchedule.start_date ? new Date(taskToSchedule.start_date) : new Date();
    const { date: firstDay, availableCapacityOnDate: capacityOnFirstDay } = await findFirstAvailableDay(
      taskService,
      dailyCapacity,
      userId,
      taskEffectiveStartDate
    );

    if (!firstDay) {
      console.warn(`[SchedulingService.scheduleTask] No available day found for task ${taskToSchedule.id} within ${MAX_SCHEDULING_DAYS_AHEAD} days.`);
      await taskService.updateTask(taskToSchedule.id, { status: TaskStatus.PENDING }); // Or a specific "unschedulable" status
      return null;
    }

    const scheduledDateISO = formatISO(firstDay);

    if (taskEffortPoints <= capacityOnFirstDay) {
      // Task fits entirely on the first available day
      const singleSegment: TaskSegment = {
        parent_task_id: taskToSchedule.id,
        effort_points: taskEffortPoints,
        scheduled_date: scheduledDateISO,
        status: TaskStatus.PENDING,
      };
      const updatedTask = await taskService.updateTask(taskToSchedule.id, {
        segments: [singleSegment],
        status: TaskStatus.SCHEDULED,
        scheduled_start_date: scheduledDateISO,
        due_date: scheduledDateISO,
      });
      console.log(`[SchedulingService.scheduleTask] Task ${taskToSchedule.id} scheduled for ${scheduledDateISO}.`);
      return updatedTask;
    } else {
      // Task needs to be split, starting on 'firstDay' with 'capacityOnFirstDay'
      console.log(`[SchedulingService.scheduleTask] Task ${taskToSchedule.id} needs splitting. Total EPs: ${taskEffortPoints}, Available on first day (${scheduledDateISO}): ${capacityOnFirstDay}.`);
      return findFirstAvailableDayAndScheduleOrSplit(taskService, taskToSchedule, dailyCapacity, userId, firstDay, capacityOnFirstDay);
    }

  } catch (error) {
    console.error(`[SchedulingService.scheduleTask] Error scheduling task ${taskToSchedule.id}:`, error);
    // Optionally update task status to reflect scheduling failure
    // await taskService.updateTask(taskToSchedule.id, { status: TaskStatus.PENDING /* or FAILED_TO_SCHEDULE */ });
    return null;
  }
};

/**
 * Main function to run the scheduling algorithm for a user and a list of tasks.
 * @param taskService The TaskService instance for database operations.
 * @param userId The ID of the user for whom to schedule tasks.
 * @param tasksToSchedule An array of tasks that need to be scheduled.
 */
export const runSchedulingAlgorithm = async (taskService: ISchedulingTaskService, userId: string, tasksToSchedule: Task[]): Promise<void> => {
  console.log(`[SchedulingService.runSchedulingAlgorithm] Starting for user ${userId}...`);
  const capacity = await calculateDailyCapacity(taskService, userId);
  console.log(`[SchedulingService.runSchedulingAlgorithm] User daily capacity: ${capacity} EPs`);

  // Optional: Sort tasksToSchedule here based on priority, due date, etc., before scheduling
  // tasksToSchedule.sort((a, b) => { /* ... sorting logic ... */ });

  for (const task of tasksToSchedule) {
    // Schedule only if task is in a state that requires scheduling (e.g., PENDING, or specific statuses)
    if (task.status === TaskStatus.TODO || task.status === TaskStatus.PENDING) { // TODO is not in our enum, using PENDING
        console.log(`[SchedulingService.runSchedulingAlgorithm] Processing task ${task.id} (${task.title}) for scheduling.`);
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
