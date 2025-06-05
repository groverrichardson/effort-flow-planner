import { describe, it, expect } from 'vitest';
import { 
  DateGroup, 
  determineTaskDateGroup, 
  groupTasksByDate,
  hasValidDateFormat
} from './taskGrouping';
import { addDays, subDays, startOfWeek, addWeeks, addMonths } from 'date-fns';
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
  const thisWeek = addDays(today, 3); // A few days from now, same week
  const nextWeek = addDays(startOfWeek(addWeeks(today, 1), { weekStartsOn: 1 }), 2); // Middle of next week
  const thisMonth = addDays(today, 20); // Later this month
  const futureDate = addMonths(today, 2); // Two months from now

  it('should categorize a task with no dates as NO_DATE', () => {
    const task = createTestTask(null, null);
    expect(determineTaskDateGroup(task)).toBe(DateGroup.NO_DATE);
  });

  it('should categorize a task due today as TODAY', () => {
    const task = createTestTask(today, null);
    expect(determineTaskDateGroup(task)).toBe(DateGroup.TODAY);
  });

  it('should categorize a task due tomorrow as TOMORROW', () => {
    const task = createTestTask(tomorrow, null);
    expect(determineTaskDateGroup(task)).toBe(DateGroup.TOMORROW);
  });

  it('should categorize an overdue task as OVERDUE', () => {
    const task = createTestTask(yesterday, null);
    expect(determineTaskDateGroup(task)).toBe(DateGroup.OVERDUE);
  });

  it('should not categorize completed tasks as OVERDUE even if due date is past', () => {
    const task = createTestTask(yesterday, null, TaskStatus.COMPLETED);
    expect(determineTaskDateGroup(task)).not.toBe(DateGroup.OVERDUE);
  });

  it('should categorize a task due later this week as THIS_WEEK', () => {
    const task = createTestTask(thisWeek, null);
    expect(determineTaskDateGroup(task)).toBe(DateGroup.THIS_WEEK);
  });

  it('should categorize a task due next week as NEXT_WEEK', () => {
    const task = createTestTask(nextWeek, null);
    expect(determineTaskDateGroup(task)).toBe(DateGroup.NEXT_WEEK);
  });

  it('should categorize a task due later this month as THIS_MONTH', () => {
    const task = createTestTask(thisMonth, null);
    expect(determineTaskDateGroup(task)).toBe(DateGroup.THIS_MONTH);
  });

  it('should categorize a task due in the distant future as FUTURE', () => {
    const task = createTestTask(futureDate, null);
    expect(determineTaskDateGroup(task)).toBe(DateGroup.FUTURE);
  });

  it('should use target_deadline when due_date is not available', () => {
    const task = createTestTask(null, today);
    expect(determineTaskDateGroup(task)).toBe(DateGroup.TODAY);
  });

  it('should prioritize due_date over target_deadline', () => {
    const task = createTestTask(tomorrow, today);
    expect(determineTaskDateGroup(task)).toBe(DateGroup.TOMORROW); // Due date is tomorrow
  });
});

describe('groupTasksByDate', () => {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const yesterday = subDays(today, 1);

  it('should group tasks by their respective date groups', () => {
    const tasks = [
      createTestTask(today, null),       // Today
      createTestTask(tomorrow, null),    // Tomorrow
      createTestTask(yesterday, null),   // Overdue
      createTestTask(null, null),        // No date
      createTestTask(today, null)        // Another for Today
    ];

    const groupedTasks = groupTasksByDate(tasks);
    
    // Should have 4 groups: OVERDUE, TODAY, TOMORROW, NO_DATE
    expect(groupedTasks.length).toBe(4);
    
    // Verify group order
    expect(groupedTasks[0].id).toBe(DateGroup.OVERDUE);
    expect(groupedTasks[1].id).toBe(DateGroup.TODAY);
    expect(groupedTasks[2].id).toBe(DateGroup.TOMORROW);
    expect(groupedTasks[3].id).toBe(DateGroup.NO_DATE);
    
    // Verify task counts in each group
    expect(groupedTasks[0].tasks.length).toBe(1); // 1 overdue
    expect(groupedTasks[1].tasks.length).toBe(2); // 2 today
    expect(groupedTasks[2].tasks.length).toBe(1); // 1 tomorrow
    expect(groupedTasks[3].tasks.length).toBe(1); // 1 no date
  });

  it('should filter out empty groups', () => {
    const tasks = [
      createTestTask(today, null),   // Only Today tasks
      createTestTask(today, null)
    ];

    const groupedTasks = groupTasksByDate(tasks);
    
    // Should only have 1 group: TODAY
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
    };
    
    expect(hasValidDateFormat(invalidTask as Task)).toBe(false);
  });
});
