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
const DEFAULT_DAILY_CAPACITY = 8;

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
    case EffortLevel.XXXL: return 64;
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
  const ninetyDaysAgo = formatISO(startOfDay(addDays(new Date(), -90)));
  const allUserTasks = await taskService.getTasks(false); // Get non-archived tasks
  
  const completedTasksLast90Days = allUserTasks.filter(task => {
    return task.user_id === userId &&
           task.status === TaskStatus.COMPLETED &&
           task.completed_at &&
           new Date(task.completed_at) >= new Date(ninetyDaysAgo);
  });

  if (completedTasksLast90Days.length === 0) {
    return DEFAULT_DAILY_CAPACITY;
  }

  const areDatesEqual = (date1: Date, date2: Date): boolean => {
      return startOfDay(date1).getTime() === startOfDay(date2).getTime();
  };

  let totalEffortPoints = 0;
  const distinctCompletionDays = new Set<string>();

  completedTasksLast90Days.forEach(task => {
    totalEffortPoints += getEffortPoints(task.effortLevel);
    if (task.completed_at) {
      distinctCompletionDays.add(formatISO(startOfDay(new Date(task.completed_at))));
    }
  });

  if (distinctCompletionDays.size === 0) {
    return DEFAULT_DAILY_CAPACITY;
  }
  
  const averageCapacity = totalEffortPoints / distinctCompletionDays.size;
  return Math.round(averageCapacity > 0 ? averageCapacity : DEFAULT_DAILY_CAPACITY);
};


/**
 * Calculates total effort points scheduled for a given day using optimized task fetching.
 * @param taskService The TaskService instance for database operations.
 * @param date The date to check.
 * @param userId The ID of the user.
 * @returns A promise that resolves to the total EPs scheduled for that day.
 */
export const getScheduledEffortForDay = async (taskService: ISchedulingTaskService, date: Date, userId: string): Promise<number> => {
  const targetDayISO = formatISO(startOfDay(date));
  const contributingTasks = await taskService.getTasksContributingToEffortOnDate(targetDayISO, userId);
  
  let scheduledEPs = 0;

  for (const task of contributingTasks) {
    if (!task.id || !task.effortLevel) { 
      console.warn(`[SchedulingService.getScheduledEffortForDay] Skipping task with missing id or effortLevel: ${task.id}`);
      continue;
    }

    const taskEffortPoints = getEffortPoints(task.effortLevel);

    if (task.status === TaskStatus.PENDING) {
      scheduledEPs += taskEffortPoints;
    } else if (task.status === TaskStatus.IN_PROGRESS) {
      if (task.scheduled_start_date && task.scheduled_completion_date) {
        const startDate = startOfDay(new Date(task.scheduled_start_date));
        const completionDate = startOfDay(new Date(task.scheduled_completion_date));
        const durationDays = differenceInDays(completionDate, startDate) + 1;

        if (durationDays > 0) {
          scheduledEPs += taskEffortPoints / durationDays;
        } else if (durationDays === 1) {
          scheduledEPs += taskEffortPoints; 
        }
      } else {
        console.warn(`[SchedulingService.getScheduledEffortForDay] IN_PROGRESS task ${task.id} missing scheduled dates.`);
      }
    }
  }
  return Math.round(scheduledEPs);
};

/**
 * Schedules a single task based on available daily capacity.
 * It finds the earliest possible start date and splits the task across days if needed.
 * @param taskService The TaskService instance for database operations.
 * @param taskToSchedule The task to schedule.
 * @param dailyCapacityEP The user's daily effort point capacity.
 * @param userId The ID of the user.
 * @param maxSchedulingDaysAhead The maximum number of days into the future to attempt scheduling.
 * @returns A promise that resolves to the updated task with scheduling info, or null if scheduling failed.
 */
export const scheduleTask = async (
  taskService: ISchedulingTaskService,
  taskToSchedule: Task,
  dailyCapacityEP: number,
  userId: string,
  maxSchedulingDaysAhead: number = MAX_SCHEDULING_DAYS_AHEAD
): Promise<Task | null> => {
  console.log(`[SchedulingService.scheduleTask] Attempting to schedule task: ${taskToSchedule?.id} with effort ${taskToSchedule?.effortLevel}, current status: ${taskToSchedule?.status}`);
  console.log(`[SchedulingService.scheduleTask] Attempting to schedule task: ${taskToSchedule.id}, Effort: ${taskToSchedule.effortLevel}, Capacity: ${dailyCapacityEP} EPs/day`);

  if (!taskToSchedule || !taskToSchedule.id || taskToSchedule.effortLevel === undefined) {
    console.error('[SchedulingService.scheduleTask] Invalid task object received:', taskToSchedule);
    return null;
  }

  const taskEffortPoints = getEffortPoints(taskToSchedule.effortLevel);
  console.log(`[SchedulingService.scheduleTask] Task ID: ${taskToSchedule.id}, Calculated taskEffortPoints: ${taskEffortPoints}`);
  if (taskEffortPoints === 0) {
    console.log(`[SchedulingService.scheduleTask] Task ${taskToSchedule.id} has 0 effort. Scheduling for today.`);
    console.log(`[SchedulingService.scheduleTask] Entering 0-effort update for task: ${taskToSchedule.id}`);
    try {
        // await taskService.getTasksContributingToEffortOnDate(formatISO(startOfDay(new Date())), userId);

        const updatePayload: TaskUpdatePayload = {
            scheduled_start_date: formatISO(startOfDay(new Date())),
            scheduled_completion_date: formatISO(startOfDay(new Date())),
            status: TaskStatus.PENDING,
        };
        console.log(`[SchedulingService.scheduleTask] Updating zero-effort task ${taskToSchedule.id} with payload:`, updatePayload);
        console.log(`[SchedulingService.scheduleTask] Updating zero-effort task ${taskToSchedule.id} with payload:`, JSON.stringify(updatePayload, null, 2));
      const updatedTask = await taskService.updateTask(taskToSchedule.id, updatePayload);
        return updatedTask;
    } catch (error) {
        console.error(`[SchedulingService.scheduleTask] Error updating zero-effort task ${taskToSchedule.id}:`, error);
        return null;
    }
  }

  let currentDay = startOfDay(new Date());
  let daysChecked = 0;
  const taskSegments: TaskSegment[] = [];
  let remainingEffortForTask = taskEffortPoints;

  while (remainingEffortForTask > 0 && daysChecked < maxSchedulingDaysAhead) {
    const scheduledEffortOnCurrentDay = await getScheduledEffortForDay(taskService, currentDay, userId);
    const availableCapacityOnCurrentDay = dailyCapacityEP - scheduledEffortOnCurrentDay;
    
    console.log(`[SchedulingService.scheduleTask] Day ${daysChecked + 1} (${formatISO(currentDay)}): Scheduled EPs: ${scheduledEffortOnCurrentDay}, Available EPs: ${availableCapacityOnCurrentDay}`);

    if (availableCapacityOnCurrentDay > 0) {
      const effortToScheduleThisDay = Math.min(remainingEffortForTask, availableCapacityOnCurrentDay);
      taskSegments.push({
        date: currentDay,
        effortPoints: effortToScheduleThisDay,
      });
      remainingEffortForTask -= effortToScheduleThisDay;
      console.log(`[SchedulingService.scheduleTask] Scheduled ${effortToScheduleThisDay} EPs for task ${taskToSchedule.id} on ${formatISO(currentDay)}. Remaining effort: ${remainingEffortForTask}`);
    }

    if (remainingEffortForTask <= 0) {
      break;
    }

    currentDay = addDays(currentDay, 1);
    daysChecked++;
  }

  if (remainingEffortForTask > 0) {
    console.log(`[SchedulingService.scheduleTask] Could not fully schedule task ${taskToSchedule.id} within ${maxSchedulingDaysAhead} days. Remaining effort: ${remainingEffortForTask}`);
    return null;
  }

  try {
    if (taskSegments.length > 0) {
      const firstSegmentDate = taskSegments[0].date;
      const lastSegmentDate = taskSegments[taskSegments.length - 1].date;
      
      const areDatesEqual = (date1: Date, date2: Date): boolean => {
          return startOfDay(date1).getTime() === startOfDay(date2).getTime();
      };
      const newStatus = areDatesEqual(firstSegmentDate, lastSegmentDate) ? TaskStatus.PENDING : TaskStatus.IN_PROGRESS;

      const updatePayload: TaskUpdatePayload = {
        scheduled_start_date: formatISO(startOfDay(firstSegmentDate)),
        scheduled_completion_date: formatISO(startOfDay(lastSegmentDate)),
        status: newStatus,
      };
      
      console.log(`[SchedulingService.scheduleTask] Updating task ${taskToSchedule.id} with payload:`, updatePayload);
      const updatedTask = await taskService.updateTask(taskToSchedule.id, updatePayload);
      return updatedTask;
    } else {
      console.log(`[SchedulingService.scheduleTask] Could not find any time to schedule task ${taskToSchedule.id} (segments empty).`);
      return null;
    }
  } catch (error) {
    console.error(`[SchedulingService.scheduleTask] Error scheduling task ${taskToSchedule.id}:`, error);
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

  for (const task of tasksToSchedule) {
    if (task.status === TaskStatus.TODO || task.status === TaskStatus.PENDING) {
        console.log(`[SchedulingService.runSchedulingAlgorithm] Processing task ${task.id} (${task.title}) for scheduling.`);
        await scheduleTask(taskService, task, capacity, userId);
    } else {
        console.log(`[SchedulingService.runSchedulingAlgorithm] Skipping task ${task.id} (${task.title}) as its status is ${task.status}.`);
    }
  }
  console.log('[SchedulingService.runSchedulingAlgorithm] Finished.');
};

// TODO:
// 1. Refine `calculateDailyCapacity` with actual TaskService methods for fetching completed/archived tasks.
//    - TaskService.getTasks needs to reliably filter by completed_at range and is_archived.
//    - TaskService.getTasks needs to be user-specific or accept userId.
// 2. Refine `getScheduledEffortForDay` with actual TaskService methods for fetching tasks by `scheduled_start_date`.
//    - TaskService.getTasksContributingToEffortOnDate should be robust.
// 3. Add comprehensive unit tests for all exported functions using the injected mock taskService.
// 4. Ensure ISchedulingTaskService is exported if it's to be used by test files directly for mock creation. (Done)
