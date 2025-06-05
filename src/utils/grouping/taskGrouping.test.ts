import { describe, it, expect } from 'vitest';
import { 
  DateGroup, 
  determineTaskDateGroup, 
  groupTasksByDate,
  hasValidDateFormat
} from './taskGrouping';
import { addDays, subDays, startOfWeek, addWeeks, addMonths, isThisWeek, isToday, isTomorrow, isThisMonth, startOfDay } from 'date-fns';
import { Task, TaskStatus, Priority, EffortLevel, DueDateType } from '../../types';

// Helper function to create a test task with dates
const createTestTask = (
  dueDate: Date | null = null, 
  targetDeadline: Date | null = null, 
  status: TaskStatus = TaskStatus.PENDING
): Task => {
  return {
    id: '123',
    title: 'Test Task',
    description: 'Task description',
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate,
    targetDeadline,
    status,
    userId: 'user123',
    is_archived: false,
    priority: Priority.NORMAL,
    dueDateType: DueDateType.NONE,
    goLiveDate: null,
    effortLevel: EffortLevel.M,
    completed: status === TaskStatus.COMPLETED,
    completedDate: status === TaskStatus.COMPLETED ? new Date() : null,
    tags: [],
    people: [],
    dependencies: []
  };
};

describe('determineTaskDateGroup', () => {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const yesterday = subDays(today, 1);

  // Helper to get a date for "This Week" that isn't today or tomorrow
  const getThisWeekDate = () => {
    let date = addDays(today, 2); // Start with day after tomorrow
    for (let i = 0; i < 7; i++) { // Iterate a few days to find a suitable one
        date = addDays(today, 2 + i);
        if (isThisWeek(date, { weekStartsOn: 1 }) && !isToday(date) && !isTomorrow(date)) {
            return date;
        }
    }
    return addDays(startOfWeek(today, { weekStartsOn: 1 }), 3); // e.g., Wednesday of current week
  };
  const thisWeekDate = getThisWeekDate();

  const nextWeekDate = addDays(startOfWeek(addWeeks(today, 1), { weekStartsOn: 1 }), 2); // Middle of next week

  // Helper to get a date for "This Month" that isn't today, tomorrow, this week or next week
  const getThisMonthDate = () => {
    // Calculate the start and end of next week to exclude those dates
    const startOfNextCalendarWeek = startOfWeek(addWeeks(today, 1), { weekStartsOn: 1 });
    const endOfNextCalendarWeek = addDays(startOfNextCalendarWeek, 6);
    
    for (let i = 16; i < 28; i++) { // Start checking from after next week
        const date = addDays(today, i);
        const dateObj = startOfDay(date);
        
        // Check if the date is still in this month but after next week
        if (isThisMonth(dateObj) && 
            !isToday(dateObj) && 
            !isTomorrow(dateObj) && 
            !isThisWeek(dateObj, { weekStartsOn: 1 }) && 
            !(dateObj >= startOfNextCalendarWeek && dateObj <= endOfNextCalendarWeek)) {
            return date;
        }
    }
    
    // If we're at the end of the month and can't find a suitable date,
    // use a date in the 3rd week (should be this month but after next week)
    const fallbackDate = addDays(startOfWeek(addWeeks(today, 2), { weekStartsOn: 1 }), 3);
    return fallbackDate;
  };
  const thisMonthDate = getThisMonthDate();
  
  const futureDate = addMonths(today, 2); // Two months from now

  it('should categorize a task with no target_deadline as NO_DATE, regardless of due_date', () => {
    const taskWithNoDates = createTestTask(null, null);
    expect(determineTaskDateGroup(taskWithNoDates)).toBe(DateGroup.NO_DATE);

    const taskWithOnlyDueDate = createTestTask(today, null); // Has dueDate, but no targetDeadline
    expect(determineTaskDateGroup(taskWithOnlyDueDate)).toBe(DateGroup.NO_DATE);
  });

  it('should use target_deadline for grouping when present, ignoring due_date', () => {
    const taskTargetToday = createTestTask(tomorrow, today); // dueDate is tomorrow, targetDeadline is today
    expect(determineTaskDateGroup(taskTargetToday)).toBe(DateGroup.TODAY);
  });
  
  it('should categorize a task with target_deadline today as TODAY', () => {
    const task = createTestTask(null, today);
    expect(determineTaskDateGroup(task)).toBe(DateGroup.TODAY);
  });

  it('should categorize a task with target_deadline tomorrow as TOMORROW', () => {
    const task = createTestTask(null, tomorrow);
    expect(determineTaskDateGroup(task)).toBe(DateGroup.TOMORROW);
  });

  it('should categorize a task with a past, non-completed target_deadline as OVERDUE', () => {
    const task = createTestTask(null, yesterday, TaskStatus.PENDING);
    expect(determineTaskDateGroup(task)).toBe(DateGroup.OVERDUE);
  });

  it('should NOT categorize a completed task with a past target_deadline as OVERDUE', () => {
    const completedTaskPastTarget = createTestTask(null, yesterday, TaskStatus.COMPLETED);
    expect(determineTaskDateGroup(completedTaskPastTarget)).not.toBe(DateGroup.OVERDUE);
    
    if (isThisWeek(yesterday, { weekStartsOn: 1 }) && !isToday(yesterday) && !isTomorrow(yesterday)) {
         expect(determineTaskDateGroup(completedTaskPastTarget)).toBe(DateGroup.THIS_WEEK);
    }
  });

  it('should categorize a task with target_deadline this week (not today/tomorrow) as THIS_WEEK', () => {
    const task = createTestTask(null, thisWeekDate);
    expect(determineTaskDateGroup(task)).toBe(DateGroup.THIS_WEEK);
  });

  it('should categorize a task with target_deadline next week as NEXT_WEEK', () => {
    const task = createTestTask(null, nextWeekDate);
    expect(determineTaskDateGroup(task)).toBe(DateGroup.NEXT_WEEK);
  });

  it('should categorize a task with target_deadline this month (not today/tomorrow/this week) as THIS_MONTH', () => {
    const task = createTestTask(null, thisMonthDate);
    expect(determineTaskDateGroup(task)).toBe(DateGroup.THIS_MONTH);
  });

  it('should categorize a task with target_deadline in the future (beyond this month) as FUTURE', () => {
    const task = createTestTask(null, futureDate);
    expect(determineTaskDateGroup(task)).toBe(DateGroup.FUTURE);
  });
});

// Original groupTasksByDate tests - these will likely need updates next
describe('groupTasksByDate', () => {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const yesterday = subDays(today, 1);

  it('should group tasks correctly by date groups', () => {
    const tasks = [
      createTestTask(yesterday, null), // Will be NO_DATE
      createTestTask(today, null),     // Will be NO_DATE
      createTestTask(today, today),    // TODAY (targetDeadline)
      createTestTask(tomorrow, null),  // Will be NO_DATE
      createTestTask(null, null),      // NO_DATE
      createTestTask(null, yesterday)  // OVERDUE (targetDeadline)
    ];

    const groupedTasks = groupTasksByDate(tasks);

    // Expected groups based on new logic (targetDeadline only)
    // NO_DATE (4 tasks: yesterday/null, today/null, tomorrow/null, null/null)
    // TODAY (1 task: today/today)
    // OVERDUE (1 task: null/yesterday)
    
    // The order is OVERDUE, TODAY, ..., NO_DATE
    expect(groupedTasks.length).toBe(3);
    expect(groupedTasks.find(g => g.id === DateGroup.OVERDUE)?.tasks.length).toBe(1);
    expect(groupedTasks.find(g => g.id === DateGroup.TODAY)?.tasks.length).toBe(1);
    expect(groupedTasks.find(g => g.id === DateGroup.NO_DATE)?.tasks.length).toBe(4);
  });

  it('should correctly order the groups', () => {
    const tasks = [
      createTestTask(null, addDays(today, 10)), // THIS_MONTH or FUTURE (targetDeadline)
      createTestTask(null, today),               // TODAY (targetDeadline)
      createTestTask(null, tomorrow),            // TOMORROW (targetDeadline)
      createTestTask(null, yesterday),           // OVERDUE (targetDeadline)
      createTestTask(null, null)                 // NO_DATE
    ];
    const groupedTasks = groupTasksByDate(tasks);
    
    // Expected order: OVERDUE, TODAY, TOMORROW, (THIS_WEEK/NEXT_WEEK/THIS_MONTH/FUTURE), NO_DATE
    const groupIds = groupedTasks.map(g => g.id);
    expect(groupIds[0]).toBe(DateGroup.OVERDUE);
    expect(groupIds[1]).toBe(DateGroup.TODAY);
    expect(groupIds[2]).toBe(DateGroup.TOMORROW);
    // The next group depends on what addDays(today, 10) is classified as
    // For simplicity, we'll check the last one is NO_DATE if others exist
    if (groupIds.length > 4) { // Ensure there are enough groups to check the last one meaningfully
        expect(groupIds[groupIds.length -1]).toBe(DateGroup.NO_DATE);
    }
  });

  it('should filter out empty groups', () => {
    const tasks = [
      createTestTask(null, today),   // Only TODAY tasks (targetDeadline)
      createTestTask(null, today)
    ];

    const groupedTasks = groupTasksByDate(tasks);
    
    expect(groupedTasks.length).toBe(1);
    expect(groupedTasks[0].id).toBe(DateGroup.TODAY);
  });

  it('should handle empty tasks array', () => {
    const groupedTasks = groupTasksByDate([]);
    expect(groupedTasks.length).toBe(0);
  });
});

describe('hasValidDateFormat', () => {
  it('should return true for tasks with valid date formats', () => {
    const task = createTestTask(new Date(), new Date());
    expect(hasValidDateFormat(task)).toBe(true);
  });

  it('should return true for tasks with no dates', () => {
    const task = createTestTask(null, null);
    expect(hasValidDateFormat(task)).toBe(true);
  });

  it('should return true for tasks with one valid date', () => {
    const task1 = createTestTask(new Date(), null);
    const task2 = createTestTask(null, new Date());
    
    expect(hasValidDateFormat(task1)).toBe(true);
    expect(hasValidDateFormat(task2)).toBe(true);
  });

  it('should return false for tasks with invalid date formats', () => {
    const invalidTask = {
      ...createTestTask(),
      dueDate: new Date('invalid-date')
    } as unknown as Task; // Cast to unknown first for type safety if structure is very different
    
    expect(hasValidDateFormat(invalidTask)).toBe(false);
  });
});
