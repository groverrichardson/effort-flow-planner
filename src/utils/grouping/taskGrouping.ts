import { startOfDay, isToday, isTomorrow, isThisWeek, isThisMonth, 
  addDays, format, isPast, startOfWeek, addWeeks } from 'date-fns';
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
 * Determines which date group a task belongs to based on its targetDeadline.
 * 
 * @param task The task to categorize
 * @returns The DateGroup enum value representing the task's group
 */
export const determineTaskDateGroup = (task: Task): DateGroup => {
  const taskDateForGrouping = task.targetDeadline;
  
  if (!taskDateForGrouping) {
    return DateGroup.NO_DATE;
  }
  
  const today = startOfDay(new Date()); // Use startOfDay for consistent comparisons
  const taskDateObj = startOfDay(new Date(taskDateForGrouping!)); // Ensure we compare day-to-day
  
  if (task.status !== TaskStatus.COMPLETED && isPast(taskDateObj) && taskDateObj < today) {
    return DateGroup.OVERDUE;
  }
  
  if (isToday(taskDateObj)) {
    return DateGroup.TODAY;
  }
  
  if (isTomorrow(taskDateObj)) {
    return DateGroup.TOMORROW;
  }
  
  // isThisWeek checks if the date is within the current week (Mon-Sun by default with weekStartsOn:1)
  // and it's not Today or Tomorrow (already handled)
  if (isThisWeek(taskDateObj, { weekStartsOn: 1 })) {
    return DateGroup.THIS_WEEK;
  }
  
  // Next week (Mon-Sun of the following week)
  const startOfNextCalendarWeek = startOfWeek(addWeeks(today, 1), { weekStartsOn: 1 });
  const endOfNextCalendarWeek = addDays(startOfNextCalendarWeek, 6);

  if (taskDateObj >= startOfNextCalendarWeek && taskDateObj <= endOfNextCalendarWeek) {
    return DateGroup.NEXT_WEEK;
  }
  
  // This month (if it hasn't fallen into Overdue, Today, Tomorrow, This Week, or Next Week)
  if (isThisMonth(taskDateObj)) {
    return DateGroup.THIS_MONTH;
  }
  
  // If none of the above, it's in the future (beyond this month)
  return DateGroup.FUTURE;
};

/**
 * Groups tasks by their date categories.
 * 
 * @param tasks Array of tasks to group
 * @returns Array of TaskGroup objects, sorted and with empty groups filtered out
 */
export const groupTasksByDate = (tasks: Task[]): TaskGroup[] => {
  const groupMap: Record<DateGroup, TaskGroup> = {
    [DateGroup.OVERDUE]: { id: DateGroup.OVERDUE, title: DateGroup.OVERDUE, tasks: [] },
    [DateGroup.TODAY]: { id: DateGroup.TODAY, title: DateGroup.TODAY, tasks: [] },
    [DateGroup.TOMORROW]: { id: DateGroup.TOMORROW, title: DateGroup.TOMORROW, tasks: [] },
    [DateGroup.THIS_WEEK]: { id: DateGroup.THIS_WEEK, title: DateGroup.THIS_WEEK, tasks: [] },
    [DateGroup.NEXT_WEEK]: { id: DateGroup.NEXT_WEEK, title: DateGroup.NEXT_WEEK, tasks: [] },
    [DateGroup.THIS_MONTH]: { id: DateGroup.THIS_MONTH, title: DateGroup.THIS_MONTH, tasks: [] },
    [DateGroup.FUTURE]: { id: DateGroup.FUTURE, title: DateGroup.FUTURE, tasks: [] },
    [DateGroup.NO_DATE]: { id: DateGroup.NO_DATE, title: DateGroup.NO_DATE, tasks: [] },
  };
  
  tasks.forEach((task) => {
    if (hasValidDateFormat(task)) { // Only group tasks with valid dates or no dates
      const group = determineTaskDateGroup(task);
      groupMap[group].tasks.push(task);
    } else {
      // Optionally handle tasks with invalid date formats, e.g., add to a specific group or log
      console.warn(`Task with ID ${task.id} has an invalid date format and was not grouped.`);
    }
  });
  
  return Object.values(groupMap)
    .filter((group) => group.tasks.length > 0)
    .sort((a, b) => {
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
 * Gets a formatted date string for display.
 * 
 * @param date The date to format
 * @returns A formatted date string (e.g., "Jun 5, 2025") or empty string for null date
 */
export const getFormattedDate = (date: Date | string | null): string => {
  if (!date) return '';
  try {
    return format(new Date(date), 'MMM d, yyyy');
  } catch (e) {
    return 'Invalid Date';
  }
};

/**
 * Formats the group title with additional information like task count.
 * 
 * @param group The date group enum value
 * @param tasks The tasks in the group
 * @returns A formatted title string (e.g., "Today (5)")
 */
export const formatGroupTitle = (group: DateGroup, tasks: Task[]): string => {
  return `${group} (${tasks.length})`;
};

/**
 * Determines if task dates (targetDeadline or dueDate) are in a valid format that can be parsed by new Date().
 * 
 * @param task The task to check
 * @returns Boolean indicating if the task has properly formatted dates or no dates.
 */
export const hasValidDateFormat = (task: Task): boolean => {
  const checkDateValidity = (date: string | Date | null | undefined): boolean => {
    if (date === null || date === undefined) return true; // No date is valid
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return false; // Invalid date parsed
      // Optional: Check if it's a reasonable date, e.g., not year 0001, but usually isNaN is enough for basic check
      return true;
    } catch (e) {
      return false;
    }
  };

  return checkDateValidity(task.targetDeadline) && checkDateValidity(task.dueDate);
};
