import { vi, describe, it, expect, beforeEach, afterEach, Mocked } from 'vitest';
vi.mock('@/services/TaskService');

import {
  getEffortPoints,
  calculateDailyCapacity,
  getScheduledEffortForDay,
  scheduleTask,
  sortTasksForScheduling, // <-- Import the new function
  ISchedulingTaskService // Import the interface
} from './schedulingService';

import type { Task, TaskSegment, TaskUpdatePayload, Tag, Person } from '../types';
import { TaskStatus, Priority, EffortLevel } from '../types'; // <-- Add Priority, DueDateType (DueDateType removed as it's replaced by string literals for scheduledDateType)
import { addDays, formatISO, startOfDay, startOfToday, parseISO, format, isSameDay } from 'date-fns';

// Create a mock TaskService implementation using the interface
const mockTaskService: Mocked<ISchedulingTaskService> = {
  getTasks: vi.fn(),
  updateTask: vi.fn(),
  getTasksContributingToEffortOnDate: vi.fn(),
};

// Default daily capacity from the service, can be overridden in tests
const DEFAULT_DAILY_CAPACITY_FROM_SERVICE = 8;
const MOCK_USER_ID = 'test-user-id';


const createMockTask = (overrides: Partial<Task> & { id: string }): Task => {
  const now = new Date();
  const defaultEffortLevel = overrides.effortLevel || EffortLevel.M;

  // Define the default structure of a Task, matching the Task interface
  const defaultTaskData: Omit<Task, 'id' | 'title'> = {
    description: 'A test task',
    status: TaskStatus.PENDING,
    priority: Priority.NORMAL,
    // No direct 'effort' property on Task, only 'effortLevel'
    effortLevel: defaultEffortLevel,
    segments: [] as TaskSegment[],
    targetDeadline: null,
    scheduledDateType: 'none', // Replaces dueDateType
    originalScheduledDate: null as Date | null, // Added missing property (it IS on Task interface)
    goLiveDate: null,
    completed: false, // Added missing property
    completedDate: null,
    createdAt: now,
    updatedAt: now,
    tags: [] as Tag[], // Assuming Task uses Tag[] not string[] based on interface
    people: [] as Person[], // Assuming Task uses Person[] not string[]
    // parentTaskId is not a direct property of Task, it's for subtasks relation
    // subTasks is not a direct property of Task, it's for relations
    isRecurringInstance: false,
    recurrenceRuleId: undefined, // Optional property
    recurrenceRule: undefined, // Optional property
    // linkedNoteIds is not a direct property of Task
    is_archived: false,
    userId: MOCK_USER_ID,
    dependencies: [] as string[],
    originalRecurringTaskId: undefined, // Optional property
    // projectId and assigneeId are not on the Task interface from types/index.ts
  };

  let taskInProgress = {
    ...defaultTaskData,
    id: overrides.id,
    title: overrides.title || `Test Task ${overrides.id}`,
    ...overrides,
  } as Task;

  // Ensure date fields are Date objects if they came as strings from overrides
  const dateFields: (keyof Task)[] = [
    'dueDate', 'targetDeadline', 'goLiveDate', 'completedDate',
    'createdAt', 'updatedAt'
  ];

  for (const field of dateFields) {
    const value = taskInProgress[field];
    if (typeof value === 'string') {
      (taskInProgress as any)[field] = parseISO(value);
    }
  }
  // The spread '...overrides' above should have correctly set effortLevel if it was provided in overrides.
  // The previous if/else block here was problematic for EffortLevel.NONE (0).

  return taskInProgress;
};

describe('SchedulingService', () => {
  console.log('[TEST LOG] --- SchedulingService describe block START ---');

  beforeEach(() => {
    console.log('[TEST LOG] beforeEach in SchedulingService describe');
    vi.resetAllMocks();
    vi.useFakeTimers(); // Added this line
    // Set a fixed system time for all tests in this describe block
    const initialMockDate = new Date(2024, 5, 1); // June 1, 2024
    vi.setSystemTime(initialMockDate);
    mockTaskService.updateTask.mockImplementation(async (taskId, updates) => {
      // Basic mock: return a task object that includes the updates
      // You might want to fetch the original task mock if needed for more complex scenarios
      return { ...createMockTask({ id: taskId }), ...updates } as Task;
    });
  });


  afterEach(() => {
    console.log('[TEST LOG] afterEach in SchedulingService describe');
    vi.runOnlyPendingTimers(); // Ensure all pending fake timers are executed
    vi.useRealTimers(); // Restore real timers after each test
  });

  describe('scheduleTask', () => {
    console.log('[TEST LOG] --- scheduleTask describe block ---');
    const MOCK_DAILY_CAPACITY = 8;

    beforeEach(() => {
      // Ensure mocks are reset for each test
      mockTaskService.updateTask.mockReset();
      mockTaskService.getTasksContributingToEffortOnDate.mockReset();

      // Default mock for updateTask: accepts snake_case/string payload (TaskUpdatePayload),
      // returns camelCase/Date Task (Task interface)
      mockTaskService.updateTask.mockImplementation(async (taskId, updates: TaskUpdatePayload) => {
        console.log(`[Simplified Mock updateTask] Called with taskId: ${taskId}, updates:`, JSON.stringify(updates, null, 2));
        // Return a very minimal task, the key is to check what the spy was called with
        return {
          id: taskId,
          title: 'Mocked Task',
          status: updates.status || TaskStatus.PENDING, // Reflect received status or default
          effortLevel: EffortLevel.NONE, // Default, not derived from updates for this simple mock
          segments: updates.segments || [],
          // Add other minimal required fields for Task type
          description: '',
          priority: Priority.NORMAL,
          targetDeadline: null,
          scheduledDateType: 'none',
          originalScheduledDate: null,
          goLiveDate: null,
          completed: false,
          completedDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: [],
          people: [],
          dependencies: [],
          userId: MOCK_USER_ID,
          is_archived: false,
          isRecurringInstance: false,
        } as Task;
      });

      // Default mock for getTasksContributingToEffortOnDate to return 0 effort
      mockTaskService.getTasksContributingToEffortOnDate.mockResolvedValue([]);
    });

    it('should set a zero-effort task to PENDING with null scheduling fields', async () => {
      const taskToScheduleData = {
        id: 'task-zero-effort',
        effortLevel: EffortLevel.NONE, // Corrected from ZERO
        targetDeadline: null,
      };
      const taskToSchedule = createMockTask(taskToScheduleData);
      // DEBUG: Log taskToSchedule for zero-effort test
      console.log('[Test Zero Effort] taskToSchedule input:', JSON.stringify(taskToSchedule, null, 2));

      // taskToSchedule IS the zero-effort task defined above.
      const result = await scheduleTask(mockTaskService, taskToSchedule, MOCK_DAILY_CAPACITY, MOCK_USER_ID);

      expect(result).not.toBeNull();
      // Assertions for a zero-effort task's returned Task object (camelCase, Date objects where applicable)
      expect(result?.status).toBe(TaskStatus.PENDING);
      expect(result?.segments).toEqual([]);
      expect(result?.originalScheduledDate).toBeNull();
      expect(result?.targetDeadline).toBeNull();
      // targetDeadline should be preserved if it was set on the input taskToSchedule
      // createMockTask ensures taskToSchedule.targetDeadline is Date | null
      if (taskToSchedule.targetDeadline) {
        expect(result?.targetDeadline).toEqual(taskToSchedule.targetDeadline);
      } else {
        expect(result?.targetDeadline).toBeNull();
      }
      expect(result?.completed).toBe(false);

      // Assertions on the payload sent to mockTaskService.updateTask (snake_case, string dates where applicable)
      expect(mockTaskService.updateTask).toHaveBeenCalledTimes(1);
      const expectedPayload: TaskUpdatePayload = {
        status: TaskStatus.PENDING,
        segments: [],
        scheduled_start_date: null,
        scheduled_completion_date: null,
        targetDeadline: null,
        completed: false,
      };
      expect(mockTaskService.updateTask).toHaveBeenCalledWith(taskToSchedule.id, expectedPayload);
    });

  });

  describe('calculateDailyCapacity', () => {
    console.log('[TEST LOG] --- calculateDailyCapacity describe block ---');
    const MOCK_SYSTEM_TIME = '2024-06-01T10:00:00.000Z';

    beforeEach(() => {
      // Fake timers are active from the outer describe block
      vi.setSystemTime(new Date(MOCK_SYSTEM_TIME)); // Set a fixed system time for these tests
      mockTaskService.getTasks.mockReset();
    });

    afterEach(() => {
      // Restore system time to the one set by the outer describe block
      // This ensures other test suites within SchedulingService that rely on initialMockDate are not affected
      const initialMockDateOuter = new Date(2024, 5, 1); // June 1, 2024
      vi.setSystemTime(initialMockDateOuter);
    });

    const getExpectedFilters = () => {
      const today = new Date(); // Will use MOCK_SYSTEM_TIME
      const ninetyDaysAgo = startOfDay(addDays(today, -90));
      const startOfToday = startOfDay(today);
      return {
        userId: MOCK_USER_ID,
        isArchived: false,
        status: TaskStatus.COMPLETED,
        completedAfter: formatISO(ninetyDaysAgo),
        completedBefore: formatISO(startOfToday),
      };
    };

    it('should return default capacity if no tasks completed in last 90 days', async () => {
      const expectedFilters = getExpectedFilters();
      mockTaskService.getTasks.mockResolvedValueOnce([]);
      const capacity = await calculateDailyCapacity(mockTaskService, MOCK_USER_ID);
      expect(capacity).toBe(DEFAULT_DAILY_CAPACITY_FROM_SERVICE);
      expect(mockTaskService.getTasks).toHaveBeenCalledWith({
        userId: MOCK_USER_ID,
        isArchived: false,
        status: TaskStatus.COMPLETED,
        completedAfter: expect.any(String),
        completedBefore: expect.any(String),
      });
    });

  });

  describe('scheduleTask', () => {
    console.log('[TEST LOG] --- scheduleTask (standard) describe block ---');
    let dailyCapacity: number;
    let today: Date;

    beforeEach(() => {
      dailyCapacity = DEFAULT_DAILY_CAPACITY_FROM_SERVICE; // 8 EPs
      today = startOfDay(new Date(2024, 5, 10)); // June 10, 2024, Monday - general 'today' for tests in this block
      vi.setSystemTime(today);
      mockTaskService.updateTask.mockReset(); // Ensure this mock doesn't leak

      // General mock for updateTask, can be overridden in specific tests if needed
      mockTaskService.updateTask.mockImplementation(async (taskId: string, updates: TaskUpdatePayload): Promise<Task | null> => {
        console.log(`[Mock updateTask] Received for ${taskId}:`, JSON.stringify(updates, null, 2));
        const currentTaskState = createMockTask({ id: taskId }); // Base with ID
        const updatedProps: Partial<Task> = {};

        if (updates.status !== undefined) updatedProps.status = updates.status;
        if (updates.completed !== undefined) updatedProps.completed = updates.completed;
        if (updates.segments !== undefined) updatedProps.segments = updates.segments as TaskSegment[]; // Cast if necessary
        if (updates.effortLevel !== undefined) updatedProps.effortLevel = updates.effortLevel;

        if (updates.scheduled_start_date !== undefined) {
          updatedProps.originalScheduledDate = updates.scheduled_start_date
            ? (typeof updates.scheduled_start_date === 'string' ? parseISO(updates.scheduled_start_date) : updates.scheduled_start_date)
            : null;
        }
        if (updates.targetDeadline !== undefined) {
          updatedProps.targetDeadline = updates.targetDeadline
            ? (typeof updates.targetDeadline === 'string' ? parseISO(updates.targetDeadline) : updates.targetDeadline)
            : null;
        }
        if (updates.targetDeadline !== undefined) {
          updatedProps.targetDeadline = updates.targetDeadline
            ? (typeof updates.targetDeadline === 'string' ? parseISO(updates.targetDeadline) : updates.targetDeadline)
            : null;
        }
        // Add other properties from TaskUpdatePayload (TaskCore) as needed by the mock
        // For example, if scheduled_completion_date from payload needs to map to something in Task model for mock return

        const mergedTask = { ...currentTaskState, ...updatedProps } as Task;
        console.log(`[Mock updateTask] Constructed updatedProps for ${taskId}:`, JSON.stringify(updatedProps, null, 2));
        console.log(`[Mock updateTask] Returning mergedTask for ${taskId}:`, JSON.stringify(mergedTask, null, 2));
        return mergedTask;
      });
      mockTaskService.getTasksContributingToEffortOnDate.mockResolvedValue([]);
    });

    it('should schedule a task that fits entirely on the first available day', async () => {
      const taskToSchedule = createMockTask({ 
        id: 'task-fits', 
        effortLevel: EffortLevel.M, // 4 EPs
        targetDeadline: null, // Explicitly null for this test if not set
        targetDeadline: null // Explicitly null initially
      }); 
      const specificTestDate = startOfDay(new Date('2024-06-10T00:00:00.000Z'));
      vi.setSystemTime(specificTestDate); // Set system time specifically for this test's date context

      const expectedScheduledDate = specificTestDate; // Date object
      const expectedScheduledDateString = formatISO(expectedScheduledDate); // String for payload

      // No need to redefine mockTaskService.updateTask here if the general one in beforeEach is sufficient
      // or if its behavior for this specific test matches the general mock.

      const result = await scheduleTask(mockTaskService, taskToSchedule, dailyCapacity, MOCK_USER_ID);

      expect(result).not.toBeNull();
      expect(mockTaskService.updateTask).toHaveBeenCalledWith(taskToSchedule.id, {
        status: TaskStatus.SCHEDULED,
        scheduled_start_date: expectedScheduledDateString,
        scheduled_completion_date: expectedScheduledDateString, // Service sets this
        targetDeadline: expectedScheduledDateString, // Payload should contain ISO string
        targetDeadline: null, // Assuming taskToSchedule.targetDeadline was null
        completed: false,
        segments: [{
          parent_task_id: 'task-fits',
          effort_points: 4,
          scheduled_date: expectedScheduledDateString,
          status: TaskStatus.SCHEDULED,
        }],
      });
      expect(mockTaskService.getTasksContributingToEffortOnDate).toHaveBeenCalledWith(
          formatISO(expectedScheduledDate), // Expect an ISO string, matching the actual call
          taskToSchedule.userId
        );

  });

  }); // Closes describe('scheduleTask', ...) 

/*
  describe('sortTasksForScheduling', () => {
    const baseTaskDefaults: Partial<Task> = {
      description: 'Test desc for sorting',
      status: TaskStatus.PENDING,
      effortLevel: EffortLevel.M,
      updatedAt: new Date('2023-01-01T10:00:00.000Z'), // Fixed default date
      createdAt: new Date('2023-01-01T09:00:00.000Z'), // Fixed default date
      userId: MOCK_USER_ID,
      is_archived: false,
      completed: false,
      completedDate: null,
      // projectId: 'project-sort-test', // Removed, not in Task interface
      // assigneeId: null, // Removed, not in Task interface
      dependencies: [],
      tags: [],
      people: [],
      recurrenceRuleId: null,
      originalScheduledDate: null,
      isRecurringInstance: false,
      originalRecurringTaskId: null,
      segments: [],
      // estimatedDurationMinutes: 60, // Removed, not in Task interface
      scheduledDateType: 'none',
      priority: Priority.NORMAL,
      targetDeadline: null,
      goLiveDate: null,
    };

    type CreateTaskSortOverrides = {
      priority?: Priority;
      effortLevel?: EffortLevel;
      targetDeadline?: string | Date | null;
      scheduledDateType?: string;
      createdAt?: string | Date | null;
      updatedAt?: string | Date | null; // Allow overriding updatedAt for specific tests
    };

    const createTaskForSort = (
      id: string,
      overrides: CreateTaskSortOverrides = {}
    ): Task => {
      const now = new Date(); // Fallback for createdAt/updatedAt if not specified

      const parsedDueDate = overrides.dueDate
        ? (typeof overrides.dueDate === 'string' ? parseISO(overrides.dueDate) : overrides.dueDate)
        : baseTaskDefaults.dueDate;

      const parsedTargetDeadline = overrides.targetDeadline
        ? (typeof overrides.targetDeadline === 'string' ? parseISO(overrides.targetDeadline) : overrides.targetDeadline)
        : baseTaskDefaults.targetDeadline;

      const createdAtInput = overrides.createdAt || baseTaskDefaults.createdAt || now;
      const parsedCreatedAt = typeof createdAtInput === 'string' ? parseISO(createdAtInput) : createdAtInput;

      const updatedAtInput = overrides.updatedAt || baseTaskDefaults.updatedAt || now;
      const parsedUpdatedAt = typeof updatedAtInput === 'string' ? parseISO(updatedAtInput) : updatedAtInput;

      // Construct the task by starting with defaults, then applying specific and overridden values.
      const task: Task = {
        // Ensure all properties from baseTaskDefaults are included
        ...baseTaskDefaults,

        // Mandatory properties for a Task, or those always generated/overridden
        id,
        title: `Task ${id}`,

        // Apply parsed and specific override values
        priority: overrides.priority !== undefined ? overrides.priority : baseTaskDefaults.priority!,
        effortLevel: overrides.effortLevel !== undefined ? overrides.effortLevel : baseTaskDefaults.effortLevel!,
        dueDate: parsedDueDate,
        targetDeadline: parsedTargetDeadline,
        createdAt: parsedCreatedAt,
        updatedAt: parsedUpdatedAt,

        // Ensure other non-nullable Task fields have values if not in baseTaskDefaults or overrides
        // Most should be covered by baseTaskDefaults being Partial<Task> and then spreading it.
        // However, explicitly ensure critical ones if baseTaskDefaults might miss them.
        status: baseTaskDefaults.status || TaskStatus.PENDING,
        userId: baseTaskDefaults.userId || MOCK_USER_ID,
        is_archived: baseTaskDefaults.is_archived !== undefined ? baseTaskDefaults.is_archived : false,
        completed: baseTaskDefaults.completed !== undefined ? baseTaskDefaults.completed : false,
        dueDateType: baseTaskDefaults.dueDateType || DueDateType.NONE,
        // These should ideally come from baseTaskDefaults or be explicitly set if required and not optional
        description: baseTaskDefaults.description || '',
        completedDate: baseTaskDefaults.completedDate === undefined ? null : baseTaskDefaults.completedDate,
        // projectId: baseTaskDefaults.projectId === undefined ? null : baseTaskDefaults.projectId, // Removed
        // assigneeId: baseTaskDefaults.assigneeId === undefined ? null : baseTaskDefaults.assigneeId, // Removed
        dependencies: baseTaskDefaults.dependencies || [],
        tags: baseTaskDefaults.tags || [],
        people: baseTaskDefaults.people || [],
        recurrenceRuleId: baseTaskDefaults.recurrenceRuleId === undefined ? null : baseTaskDefaults.recurrenceRuleId,
        originalScheduledDate: baseTaskDefaults.originalScheduledDate === undefined ? null : baseTaskDefaults.originalScheduledDate,
        isRecurringInstance: baseTaskDefaults.isRecurringInstance !== undefined ? baseTaskDefaults.isRecurringInstance : false,
        originalRecurringTaskId: baseTaskDefaults.originalRecurringTaskId === undefined ? null : baseTaskDefaults.originalRecurringTaskId,
        segments: baseTaskDefaults.segments || [],
        // estimatedDurationMinutes: baseTaskDefaults.estimatedDurationMinutes === undefined ? null : baseTaskDefaults.estimatedDurationMinutes, // Removed
        goLiveDate: baseTaskDefaults.goLiveDate === undefined ? null : baseTaskDefaults.goLiveDate,
      };

      return task;
    };

  it('should return an empty array if no tasks are provided', () => {
    expect(sortTasksForScheduling([])).toEqual([]);
  });

  it('should correctly sort tasks primarily by targetDeadline (ascending, non-nulls first)', () => {
    const task1 = createTaskForSort('1', { targetDeadline: '2024-01-05T00:00:00.000Z' });
    const task2 = createTaskForSort('2', { targetDeadline: '2024-01-01T00:00:00.000Z' });
    const task3 = createTaskForSort('3', { targetDeadline: null });
    const task4 = createTaskForSort('4', { targetDeadline: '2024-01-03T00:00:00.000Z' });
    const tasks = [task1, task2, task3, task4];
    const sorted = sortTasksForScheduling(tasks);
    expect(sorted.map(t => t.id)).toEqual(['2', '4', '1', '3']);
  });

  it('should sort by targetDeadline (ascending, nulls first)', () => {
    const task1 = createTaskForSort('1', { targetDeadline: '2024-01-10T00:00:00.000Z' });
    const task2 = createTaskForSort('2', { targetDeadline: '2024-01-05T00:00:00.000Z' });
    const task3 = createTaskForSort('3', { dueDate: '2024-01-01T00:00:00.000Z', targetDeadline: null });
    const task4 = createTaskForSort('4', { dueDate: null, targetDeadline: '2024-01-08T00:00:00.000Z' });
    const task5 = createTaskForSort('5', { dueDate: null, targetDeadline: null });
    const tasks = [task1, task2, task3, task4, task5];
    const sorted = sortTasksForScheduling(tasks);
    // Expected: 2 (2024-01-01, 2024-01-05), 1 (2024-01-01, 2024-01-10), 3 (2024-01-01, null), then 4 (null, 2024-01-08), 5 (null, null)
    expect(sorted.map(t => t.id)).toEqual(['2', '1', '3', '4', '5']);
  });

  it('should sort by priority (HIGH > NORMAL > LOW > LOWEST) if dates are equal or null', () => {
    const task1 = createTaskForSort('1', { priority: Priority.LOW });
    const task2 = createTaskForSort('2', { priority: Priority.HIGH });
    const task3 = createTaskForSort('3', { priority: Priority.NORMAL });
    const task4 = createTaskForSort('4', { priority: Priority.LOWEST });
    const tasks = [task1, task2, task3, task4];
    const sorted = sortTasksForScheduling(tasks);
    expect(sorted.map(t => t.id)).toEqual(['2', '3', '1', '4']);
  });

  it('should sort by createdAt (ascending, nulls last) as a final tie-breaker', () => {
    const date1 = '2024-01-01T10:00:00.000Z';
    const date2 = '2024-01-01T12:00:00.000Z';
    const date3 = '2024-01-01T08:00:00.000Z';
    const task1 = createTaskForSort('1', { priority: Priority.NORMAL, createdAt: date1 });
    const task2 = createTaskForSort('2', { priority: Priority.NORMAL, createdAt: date2 });
    const task3 = createTaskForSort('3', { priority: Priority.NORMAL, createdAt: date3 });
    const task4 = createTaskForSort('4', { priority: Priority.NORMAL, createdAt: null });

    const tasks = [task1, task2, task3, task4];
    const sorted = sortTasksForScheduling(tasks);
    // Expected: 3 (earliest), 1, 2 (latest), 4 (null createdAt is last)
    expect(sorted.map(t => t.id)).toEqual(['3', '1', '2', '4']);
  });

  it('should handle a mix of all sorting criteria correctly', () => {
    const tasks = [
      createTaskForSort('T1-LateDue-HighPrio', { targetDeadline: '2024-01-10T00:00:00.000Z', priority: Priority.HIGH, createdAt: '2023-12-01T00:00:00.000Z' }),
      createTaskForSort('T2-EarlyDue-LowPrio', { targetDeadline: '2024-01-05T00:00:00.000Z', priority: Priority.LOW, createdAt: '2023-12-02T00:00:00.000Z' }),
      createTaskForSort('T3-NoDue-HighPrio',   { targetDeadline: null, priority: Priority.HIGH, createdAt: '2023-12-03T00:00:00.000Z' }),
      createTaskForSort('T4-EarlyDue-HighPrio-Older', { targetDeadline: '2024-01-05T00:00:00.000Z', priority: Priority.HIGH, createdAt: '2023-11-01T00:00:00.000Z' }),
      createTaskForSort('T5-NoDue-NormalPrio', { targetDeadline: null, priority: Priority.NORMAL, createdAt: '2023-12-04T00:00:00.000Z' }),
      createTaskForSort('T6-LateDue-HighPrio-Newer', { targetDeadline: '2024-01-10T00:00:00.000Z', priority: Priority.HIGH, createdAt: '2023-12-05T00:00:00.000Z' }),
      createTaskForSort('T7-NoDue-NoTarget-HighPrio', { targetDeadline: null, priority: Priority.HIGH, createdAt: '2023-12-01T00:00:00.000Z' }),
      createTaskForSort('T8-NoDue-EarlyTarget-NormalPrio', { targetDeadline: '2024-01-02T00:00:00.000Z', priority: Priority.NORMAL, createdAt: '2023-12-02T00:00:00.000Z' }),
    ];
    const sorted = sortTasksForScheduling(tasks);
    // Expected Order (manual trace based on rules):
    // 1. No scheduled date group (T3, T5, T7, T8) - sorted by target deadline, then priority, then createdAt
    //    T7 (null, HIGH, 2023-12-01)
    //    T3 (null, HIGH, 2023-12-03)
    //    T8 (2024-01-02, NORMAL, 2023-12-02)
    //    T5 (null, NORMAL, 2023-12-04)
    // 2. Scheduled date 2024-01-05 group (T2, T4) - sorted by priority, then createdAt
    //    T4 (2024-01-05, HIGH, 2023-11-01)
    //    T2 (2024-01-05, LOW, 2023-12-02)
    // 3. Scheduled date 2024-01-10 group (T1, T6) - sorted by priority, then createdAt
    //    T1 (2024-01-10, HIGH, 2023-12-01)
    //    T6 (2024-01-10, HIGH, 2023-12-05)
    expect(sorted.map(t => t.id)).toEqual([
      'T4-EarlyDue-HighPrio-Older',
      'T2-EarlyDue-LowPrio',
      'T1-LateDue-HighPrio',
      'T6-LateDue-HighPrio-Newer',
      'T8-NoDue-EarlyTarget-NormalPrio',
      'T7-NoDue-NoTarget-HighPrio',
      'T3-NoDue-HighPrio',
      'T5-NoDue-NormalPrio',
    ]);
  });

  it('should maintain relative order of tasks with identical sorting criteria (stability check)', () => {
    // Note: Array.sort() is not guaranteed to be stable in all JS environments for all engines,
    // but for identical items, their order shouldn't change relative to each other.
    const commonDate = '2024-01-01T00:00:00.000Z';
    const taskA = createTaskForSort('A', { priority: Priority.NORMAL, createdAt: commonDate });
    const taskB = createTaskForSort('B', { priority: Priority.NORMAL, createdAt: commonDate });
    const taskC = createTaskForSort('C', { priority: Priority.NORMAL, createdAt: commonDate });
    const tasks = [taskA, taskB, taskC];
    const sorted = sortTasksForScheduling(tasks);
    expect(sorted.map(t => t.id)).toEqual(['A', 'B', 'C']);

    const tasksReverse = [taskC, taskB, taskA];
    const sortedReverse = sortTasksForScheduling(tasksReverse);
    expect(sortedReverse.map(t => t.id)).toEqual(['C', 'B', 'A']);
  }); // Corrected: Removed erroneous comment closer
});
*/

// --- End of Tests for sortTasksForScheduling --- 

}); // Added to close the main 'describe('SchedulingService Tests', ...)' block
