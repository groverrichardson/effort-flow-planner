import { Task, EffortLevel, TaskStatus } from '@/types';
import TaskService from './TaskService';
import { differenceInDays, addDays, startOfDay, endOfDay, formatISO } from 'date-fns';

// Placeholder for daily capacity - to be refined in calculateDailyCapacity
const DEFAULT_DAILY_CAPACITY = 8; // Example: 8 EPs

/**
 * Maps EffortLevel enum directly to its numeric point value.
 * This is straightforward as the enum values are already the points.
 * @param effortLevel The effort level enum.
 * @returns The numeric effort points.
 */
export const getEffortPoints = (effortLevel: EffortLevel): number => {
  return effortLevel as number;
};

/**
 * Calculates the user's average daily effort point (EP) capacity based on completed tasks.
 * Fetches tasks completed in the last 90 days (excluding archived).
 * @param userId The ID of the user.
 * @returns A promise that resolves to the average daily EPs.
 */
export const calculateDailyCapacity = async (userId: string): Promise<number> => {
  try {
    const ninetyDaysAgo = addDays(new Date(), -90);
    
    // Fetch all tasks including archived ones, then filter client-side
    // TODO: Update TaskService to support more granular filtering
    const tasks = await TaskService.getTasks(false);

    // Filter tasks completed in the last 90 days client-side if not possible server-side fully
    const recentCompletedTasks = tasks.filter(task => 
      task.completedDate && 
      differenceInDays(new Date(), task.completedDate) <= 90 &&
      !task.is_archived
    );

    if (recentCompletedTasks.length === 0) {
      return DEFAULT_DAILY_CAPACITY; 
    }

    const totalEPs = recentCompletedTasks.reduce((sum, task) => sum + getEffortPoints(task.effortLevel), 0);
    const uniqueDaysWithCompletedTasks = new Set(recentCompletedTasks.map(task => task.completedDate?.toDateString())).size;
    
    if (uniqueDaysWithCompletedTasks === 0) return DEFAULT_DAILY_CAPACITY;

    return totalEPs / Math.max(1, uniqueDaysWithCompletedTasks); 

  } catch (error) {
    console.error('[SchedulingService.calculateDailyCapacity] Error:', error);
    return DEFAULT_DAILY_CAPACITY; // Fallback on error
  }
};

/**
 * Gets the total scheduled effort points (EPs) for a specific day.
 * @param date The date to check.
 * @param userId The ID of the user.
 * @returns A promise that resolves to the total EPs scheduled for that day.
 */
export const getScheduledEffortForDay = async (date: Date, userId: string): Promise<number> => {
  try {
    const dayStart = startOfDay(date);
    // const dayEnd = endOfDay(date); // Not strictly needed if querying by 'date' type column

    // We need a way to query tasks where scheduled_start_date = specific date.
    // TaskService.getTasks might need enhancement or a new method like getTasksScheduledOnDate.
    // Fetch all tasks including archived ones, then filter client-side
    // TODO: Update TaskService to support more granular filtering
    const tasks = await TaskService.getTasks(false);
    
    // Client-side filter until TaskService method is robust for scheduled_start_date
    const tasksForDay = tasks.filter(task => 
        task.scheduled_start_date && 
        startOfDay(task.scheduled_start_date).getTime() === dayStart.getTime()
    );

    return tasksForDay.reduce((sum, task) => sum + getEffortPoints(task.effortLevel), 0);
  } catch (error) {
    console.error('[SchedulingService.getScheduledEffortForDay] Error:', error);
    return 0; // Assume no effort if error occurs
  }
};

/**
 * Finds the first available day for a new task based on daily capacity.
 * @param newTask The task to schedule (only needs effortLevel).
 * @param dailyCapacity The user's daily effort point capacity.
 * @param userId The ID of the user.
 * @returns A promise that resolves to the first available date, or null if not found within a reasonable range.
 */
export const findFirstAvailableDayForTask = async (
  newTask: Pick<Task, 'effortLevel'>, 
  dailyCapacity: number,
  userId: string
): Promise<Date | null> => {
  try {
    let currentDate = startOfDay(new Date()); // Start from today
    const taskEPs = getEffortPoints(newTask.effortLevel);

    for (let i = 0; i < 90; i++) { // Check for the next 90 days
      const scheduledEPsThisDay = await getScheduledEffortForDay(currentDate, userId);
      if (dailyCapacity - scheduledEPsThisDay >= taskEPs) {
        return currentDate;
      }
      currentDate = addDays(currentDate, 1);
    }
    console.warn(`[SchedulingService.findFirstAvailableDayForTask] No available day found for task within 90 days.`);
    return null; 
  } catch (error) {
    console.error('[SchedulingService.findFirstAvailableDayForTask] Error:', error);
    return null;
  }
};

/**
 * Schedules a task by finding the first available day and updating its scheduled_start_date.
 * @param taskToSchedule The task object to schedule (must have an id and effortLevel).
 * @param dailyCapacity The user's daily effort point capacity.
 * @param userId The ID of the user.
 * @returns A promise that resolves to the updated task with scheduled_start_date, or null if scheduling failed.
 */
export const scheduleTask = async (
  taskToSchedule: Task,
  dailyCapacity: number,
  userId: string
): Promise<Task | null> => {
  try {
    if (!taskToSchedule.id) {
        console.error('[SchedulingService.scheduleTask] Task ID is required to update.');
        return null;
    }
    const availableDate = await findFirstAvailableDayForTask(taskToSchedule, dailyCapacity, userId);

    if (availableDate) {
      const updatedTask = await TaskService.updateTask(taskToSchedule.id, {
        scheduled_start_date: formatISO(availableDate, { representation: 'date' }),
      });
      return updatedTask;
    } else {
      console.log(`[SchedulingService.scheduleTask] Could not find an available day to schedule task ${taskToSchedule.id}.`);
      return null; 
    }
  } catch (error) {
    console.error(`[SchedulingService.scheduleTask] Error scheduling task ${taskToSchedule.id}:`, error);
    return null;
  }
};

export const runSchedulingAlgorithm = async (userId: string, tasksToSchedule: Task[]): Promise<void> => {
  console.log(`[SchedulingService.runSchedulingAlgorithm] Starting for user ${userId}...`);
  const capacity = await calculateDailyCapacity(userId);
  console.log(`[SchedulingService.runSchedulingAlgorithm] User daily capacity: ${capacity} EPs`);

  // Consider sorting tasksToSchedule here based on priority, due_date etc.
  // For example: tasksToSchedule.sort((a, b) => /* sort logic */);

  for (const task of tasksToSchedule) {
    await scheduleTask(task, capacity, userId);
  }
  console.log('[SchedulingService.runSchedulingAlgorithm] Finished.');
};

// TODO:
// 1. Refine `calculateDailyCapacity` with actual TaskService methods for fetching completed/archived tasks.
//    - TaskService.getTasks needs to reliably filter by completed_at range and is_archived.
// 2. Refine `getScheduledEffortForDay` with actual TaskService methods for fetching tasks by `scheduled_start_date`.
//    - TaskService.getTasks needs to reliably filter by an exact scheduled_start_date.
//    - This might involve adding new specific methods to TaskService if general getTasks is not sufficient.
// 3. Add comprehensive unit tests for all exported functions.
