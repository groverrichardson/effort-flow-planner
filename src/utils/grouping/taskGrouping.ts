import { startOfDay, endOfDay, isToday, isTomorrow, isThisWeek, isThisMonth, 
  differenceInCalendarDays, addDays, format, isPast } from 'date-fns';
import { Task, TaskStatus } from '../../types';

/**
 * Defines the possible date groups for tasks
 */
export enum DateGroup {
  OVERDUE = 'Overdue',
  TODAY = 'Today',
  TOMORROW = 'Tomorrow',
  THIS_WEEK = 'This Week',
  NEXT_WEEK = 'Next Week',
  THIS_MONTH = 'This Month',
  FUTURE = 'Future',
  NO_DATE = 'No Date'
}

/**
 * Interface for a group of tasks
 */
export interface TaskGroup {
  id: string;
  title: string;
  tasks: Task[];
}

/**
 * Determines which date group a task belongs to based on its targetDeadline or dueDate
 * Priority is given to targetDeadline if it exists
 * 
 * @param task The task to categorize
 * @returns The DateGroup enum value representing the task's group
 */
export const determineTaskDateGroup = (task: Task): DateGroup => {
  // Use targetDeadline if it exists, otherwise use dueDate
  const taskDate = task.targetDeadline || task.dueDate;
  
  // If no date exists, return NO_DATE group
  if (!taskDate) {
    return DateGroup.NO_DATE;
  }
  
  const today = new Date();
  const taskDateObj = new Date(taskDate);
  
  // Check if the task is overdue (past due date and not completed)
  if (isPast(taskDateObj) && 
      taskDateObj < startOfDay(today) && 
      task.status !== TaskStatus.COMPLETED) {
    return DateGroup.OVERDUE;
  }
  
  // Today
  if (isToday(taskDateObj)) {
    return DateGroup.TODAY;
  }
  
  // Tomorrow
  if (isTomorrow(taskDateObj)) {
    return DateGroup.TOMORROW;
  }
  
  // This week (excludes today and tomorrow which are already handled)
  if (isThisWeek(taskDateObj, { weekStartsOn: 1 }) && 
      !isToday(taskDateObj) && 
      !isTomorrow(taskDateObj)) {
    return DateGroup.THIS_WEEK;
  }
  
  // Next week
  const nextWeekStart = addDays(today, 7 - today.getDay());
  const nextWeekEnd = addDays(nextWeekStart, 7);
  if (taskDateObj >= nextWeekStart && taskDateObj < nextWeekEnd) {
    return DateGroup.NEXT_WEEK;
  }
  
  // This month (excludes this week and next week)
  if (isThisMonth(taskDateObj) && 
      !isThisWeek(taskDateObj) && 
      !(taskDateObj >= nextWeekStart && taskDateObj < nextWeekEnd)) {
    return DateGroup.THIS_MONTH;
  }
  
  // Future (anything beyond this month)
  return DateGroup.FUTURE;
};

/**
 * Groups an array of tasks by their date categories
 * 
 * @param tasks Array of tasks to group
 * @returns An array of TaskGroup objects, each containing tasks that belong to the same date group
 */
export const groupTasksByDate = (tasks: Task[]): TaskGroup[] => {
  // Initialize groups
  const groupMap: Record<string, TaskGroup> = {
    [DateGroup.OVERDUE]: { id: DateGroup.OVERDUE, title: DateGroup.OVERDUE, tasks: [] },
    [DateGroup.TODAY]: { id: DateGroup.TODAY, title: DateGroup.TODAY, tasks: [] },
    [DateGroup.TOMORROW]: { id: DateGroup.TOMORROW, title: DateGroup.TOMORROW, tasks: [] },
    [DateGroup.THIS_WEEK]: { id: DateGroup.THIS_WEEK, title: DateGroup.THIS_WEEK, tasks: [] },
    [DateGroup.NEXT_WEEK]: { id: DateGroup.NEXT_WEEK, title: DateGroup.NEXT_WEEK, tasks: [] },
    [DateGroup.THIS_MONTH]: { id: DateGroup.THIS_MONTH, title: DateGroup.THIS_MONTH, tasks: [] },
    [DateGroup.FUTURE]: { id: DateGroup.FUTURE, title: DateGroup.FUTURE, tasks: [] },
    [DateGroup.NO_DATE]: { id: DateGroup.NO_DATE, title: DateGroup.NO_DATE, tasks: [] },
  };
  
  // Assign tasks to appropriate groups
  tasks.forEach((task) => {
    const group = determineTaskDateGroup(task);
    groupMap[group].tasks.push(task);
  });
  
  // Convert to array and filter out empty groups
  return Object.values(groupMap)
    .filter((group) => group.tasks.length > 0)
    .sort((a, b) => {
      // Custom sort order for groups
      const groupOrder = [
        DateGroup.OVERDUE,
        DateGroup.TODAY,
        DateGroup.TOMORROW,
        DateGroup.THIS_WEEK,
        DateGroup.NEXT_WEEK,
        DateGroup.THIS_MONTH,
        DateGroup.FUTURE,
        DateGroup.NO_DATE
      ];
      
      return groupOrder.indexOf(a.id as DateGroup) - groupOrder.indexOf(b.id as DateGroup);
    });
};

/**
 * Gets a formatted date string for display
 * 
 * @param date The date to format
 * @returns A formatted date string (e.g., "Jun 5, 2025")
 */
export const getFormattedDate = (date: Date | null): string => {
  if (!date) return '';
  return format(new Date(date), 'MMM d, yyyy');
};

/**
 * Formats the group title with additional information
 * 
 * @param group The date group
 * @param tasks The tasks in the group
 * @returns A formatted title with count (e.g., "Today (5)")
 */
export const formatGroupTitle = (group: DateGroup, tasks: Task[]): string => {
  return `${group} (${tasks.length})`;
};

/**
 * Determines if task dates are properly formatted for comparison
 * 
 * @param task The task to check
 * @returns Boolean indicating if the task has properly formatted dates
 */
export const hasValidDateFormat = (task: Task): boolean => {
  if (!task.dueDate && !task.targetDeadline) return true; // No date is valid
  
  try {
    if (task.dueDate) {
      new Date(task.dueDate).toISOString();
    }
    if (task.targetDeadline) {
      new Date(task.targetDeadline).toISOString();
    }
    return true;
  } catch (e) {
    return false;
  }
};
