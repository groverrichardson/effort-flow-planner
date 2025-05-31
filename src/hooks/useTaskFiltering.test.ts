import { renderHook, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useTaskFiltering, UseTaskFilteringProps } from './useTaskFiltering';
import { Task, Priority, TaskStatus, EffortLevel, DueDateType, Tag, Person } from '@/types';

// --- Mock Data ---
const now = new Date();
const todayStr = now.toISOString().split('T')[0]; // For consistent date string comparisons if needed
const yesterday = new Date(now.getTime() - 86400000);
const dayBeforeYesterday = new Date(now.getTime() - 172800000);

const mockTags: { [key: string]: Tag } = {
  frontend: { id: 'tag-fe', name: 'Frontend', color: 'blue' },
  backend: { id: 'tag-be', name: 'Backend', color: 'green' },
  urgent: { id: 'tag-urgent', name: 'UrgentSearch', color: 'red' },
  design: { id: 'tag-design', name: 'Design', color: 'purple' },
  infra: { id: 'tag-infra', name: 'Infrastructure', color: 'orange' },
};

const mockPeople: { [key: string]: Person } = {
  alice: { id: 'person-alice', name: 'Alice' },
  bob: { id: 'person-bob', name: 'Bob' },
};

const mockTasks: Task[] = [
  // Active Tasks
  {
    id: '1', title: 'Active Task 1', description: 'Description for task 1',
    status: TaskStatus.PENDING, priority: Priority.HIGH,
    dueDate: now, dueDateType: 'on', targetDeadline: null, goLiveDate: null,
    effortLevel: EffortLevel.M, completed: false, completedDate: null,
    tags: [], people: [], dependencies: [],
    createdAt: now, updatedAt: now,
    is_archived: false, userId: 'test-user-1'
  },
  {
    id: '2', title: 'Active Task 2 (search-keyword)', description: 'This task has a keyword',
    status: TaskStatus.PENDING, priority: Priority.NORMAL, // Was MEDIUM
    dueDate: now, dueDateType: 'on', targetDeadline: null, goLiveDate: null,
    effortLevel: EffortLevel.S, completed: false, completedDate: null,
    tags: [], people: [], dependencies: [],
    createdAt: now, updatedAt: now,
    is_archived: false, userId: 'test-user-1'
  },
  {
    id: '3', title: 'Active Task 3 for Today', description: 'Today task',
    status: TaskStatus.PENDING, priority: Priority.LOW,
    dueDate: now, dueDateType: 'by', targetDeadline: null, goLiveDate: null,
    effortLevel: EffortLevel.L, completed: false, completedDate: null,
    tags: [], people: [], dependencies: [],
    createdAt: now, updatedAt: now,
    is_archived: false, userId: 'test-user-1'
  },

  // Completed Tasks (for today)
  {
    id: '4', title: 'Completed Task 1', description: 'Completed today',
    status: TaskStatus.COMPLETED, priority: Priority.HIGH,
    dueDate: null, dueDateType: 'on', targetDeadline: null, goLiveDate: null,
    effortLevel: EffortLevel.XS, completed: true, completedDate: now,
    tags: [], people: [], dependencies: [],
    createdAt: yesterday, updatedAt: now, // created yesterday
    is_archived: false, userId: 'test-user-1'
  },

  // Archived Tasks
  {
    id: '5', title: 'Archived Task 1', description: 'Old archived task',
    status: TaskStatus.PENDING, priority: Priority.NORMAL, // Was MEDIUM
    dueDate: null, dueDateType: 'on', targetDeadline: null, goLiveDate: null,
    effortLevel: EffortLevel.M, completed: false, completedDate: null,
    tags: [], people: [], dependencies: [],
    createdAt: dayBeforeYesterday, updatedAt: yesterday, // archived yesterday
    is_archived: true, userId: 'test-user-1'
  },
  {
    id: '6', title: 'Archived Task 2 (search-keyword)', description: 'Archived with keyword',
    status: TaskStatus.COMPLETED, priority: Priority.LOW,
    dueDate: null, dueDateType: 'on', targetDeadline: null, goLiveDate: null,
    effortLevel: EffortLevel.XL, completed: true, completedDate: yesterday, // completed yesterday
    tags: [], people: [], dependencies: [],
    createdAt: dayBeforeYesterday, updatedAt: yesterday,
    is_archived: true, userId: 'test-user-1'
  },

  // Another active task for today
  {
    id: '7', title: 'Active Task 4 for Today', description: 'Another today task',
    status: TaskStatus.IN_PROGRESS, priority: Priority.HIGH,
    dueDate: now, dueDateType: 'on', targetDeadline: null, goLiveDate: null,
    effortLevel: EffortLevel.M, completed: false, completedDate: null,
    tags: [], people: [], dependencies: [],
    createdAt: now, updatedAt: now,
    is_archived: false, userId: 'test-user-1'
  },
  // Additional tasks for comprehensive search testing
  {
    id: '8', title: 'UniqueTitleKeywordOnly', description: 'Generic description here',
    status: TaskStatus.PENDING, priority: Priority.NORMAL,
    dueDate: new Date(now.getTime() + 86400000), dueDateType: 'on', targetDeadline: null, goLiveDate: null,
    effortLevel: EffortLevel.M, completed: false, completedDate: null,
    tags: [mockTags.frontend], people: [mockPeople.alice],
    dependencies: [], createdAt: now, updatedAt: now, is_archived: false, userId: 'test-user-1'
  },
  {
    id: '9', title: 'Another Standard Task', description: 'UniqueDescriptionKeywordOnly here',
    status: TaskStatus.IN_PROGRESS, priority: Priority.LOW,
    dueDate: new Date(now.getTime() + 2 * 86400000), dueDateType: 'by', targetDeadline: null, goLiveDate: null,
    effortLevel: EffortLevel.L, completed: false, completedDate: null,
    tags: [mockTags.backend], people: [mockPeople.bob],
    dependencies: [], createdAt: now, updatedAt: now, is_archived: false, userId: 'test-user-1'
  },
  {
    id: '10', title: 'CaseTest For Search', description: 'Testing case sensitivity with CaSeKeYwOrD',
    status: TaskStatus.PENDING, priority: Priority.HIGH,
    dueDate: null, dueDateType: 'on', targetDeadline: null, goLiveDate: null,
    effortLevel: EffortLevel.S, completed: false, completedDate: null,
    tags: [mockTags.urgent], people: [],
    dependencies: [], createdAt: now, updatedAt: now, is_archived: false, userId: 'test-user-1'
  },
  {
    id: '11', title: 'Task with Frontend Tag', description: 'This task is related to frontend work.',
    status: TaskStatus.PENDING, priority: Priority.NORMAL,
    dueDate: now, dueDateType: 'on', targetDeadline: null, goLiveDate: null,
    effortLevel: EffortLevel.M, completed: false, completedDate: null,
    tags: [mockTags.frontend, mockTags.design], people: [mockPeople.alice],
    dependencies: [], createdAt: now, updatedAt: now, is_archived: false, userId: 'test-user-1'
  },
  {
    id: '12', title: 'High Priority Searchable', description: 'A high priority task for search tests.',
    status: TaskStatus.PENDING, priority: Priority.HIGH,
    dueDate: new Date(now.getTime() + 3 * 86400000), dueDateType: 'on', targetDeadline: null, goLiveDate: null,
    effortLevel: EffortLevel.XL, completed: false, completedDate: null,
    tags: [mockTags.infra], people: [mockPeople.bob],
    dependencies: [], createdAt: now, updatedAt: now, is_archived: false, userId: 'test-user-1'
  },
  {
    id: '13', title: 'Completed Keyword Task', description: 'This completed task has KeywordInCompleted.',
    status: TaskStatus.COMPLETED, priority: Priority.NORMAL,
    dueDate: yesterday, dueDateType: 'on', targetDeadline: null, goLiveDate: null,
    effortLevel: EffortLevel.M, completed: true, completedDate: now,
    tags: [mockTags.design], people: [],
    dependencies: [], createdAt: yesterday, updatedAt: now, is_archived: false, userId: 'test-user-1'
  },
  {
    id: '14', title: 'Archived Keyword Task', description: 'This archived task also has KeywordInArchivedExtra.',
    status: TaskStatus.PENDING, priority: Priority.LOW,
    dueDate: dayBeforeYesterday, dueDateType: 'on', targetDeadline: null, goLiveDate: null,
    effortLevel: EffortLevel.S, completed: false, completedDate: null,
    tags: [mockTags.backend], people: [],
    dependencies: [], createdAt: dayBeforeYesterday, updatedAt: yesterday, is_archived: true, userId: 'test-user-1'
  },
  {
    id: '15', title: 'Today Task with Keyword', description: 'A task for today containing KeywordInToday.',
    status: TaskStatus.IN_PROGRESS, priority: Priority.HIGH,
    dueDate: now, dueDateType: 'by', targetDeadline: null, goLiveDate: null,
    effortLevel: EffortLevel.L, completed: false, completedDate: null,
    tags: [mockTags.frontend, mockTags.urgent], people: [mockPeople.alice],
    dependencies: [], createdAt: now, updatedAt: now, is_archived: false, userId: 'test-user-1'
  }
];

const mockGetTodaysCompletedTasks = vi.fn(() => mockTasks.filter(t => t.completed && !t.is_archived));
const mockGetArchivedTasks = vi.fn(() => mockTasks.filter(t => t.is_archived));

const defaultProps: UseTaskFilteringProps = {
  tasks: mockTasks,
  getTodaysCompletedTasks: mockGetTodaysCompletedTasks,
  getArchivedTasks: mockGetArchivedTasks,
  searchTerm: '',
};

describe('useTaskFiltering Hook', () => {
  // Helper to get task IDs from a list of tasks
const getTaskIds = (tasks: Task[]) => tasks.map(t => t.id).sort();

describe('useTaskFiltering', () => {
  beforeEach(() => {
    // Reset mocks before each test if they are stateful or have call counts
    mockGetTodaysCompletedTasks.mockClear();
    mockGetArchivedTasks.mockClear();
  });

  it('should initialize with active, non-archived tasks', () => {
    const { result } = renderHook(() => useTaskFiltering(defaultProps));
    const expectedActive = mockTasks.filter(t => !t.completed && !t.is_archived);
    expect(getTaskIds(result.current.filteredTasks)).toEqual(getTaskIds(expectedActive));
    expect(result.current.viewingArchived).toBe(false);
    expect(result.current.viewingCompleted).toBe(false);
    expect(result.current.showTodaysTasks).toBe(false);
  });

  // --- View Toggling Tests ---
  it('should toggle archived view', () => {
    const { result } = renderHook(() => useTaskFiltering(defaultProps));
    
    // Show archived
    act(() => {
      result.current.handleShowArchived();
    });
    expect(result.current.viewingArchived).toBe(true);
    expect(getTaskIds(result.current.filteredTasks)).toEqual(getTaskIds(mockGetArchivedTasks()));
    
    // Toggle back to active
    act(() => {
      result.current.handleShowArchived();
    });
    expect(result.current.viewingArchived).toBe(false);
    const expectedActive = mockTasks.filter(t => !t.completed && !t.is_archived);
    expect(getTaskIds(result.current.filteredTasks)).toEqual(getTaskIds(expectedActive));
  });

  it('should toggle completed view', () => {
    const { result } = renderHook(() => useTaskFiltering(defaultProps));
    
    act(() => {
      result.current.handleShowCompleted();
    });
    expect(result.current.viewingCompleted).toBe(true);
    expect(getTaskIds(result.current.filteredTasks)).toEqual(getTaskIds(mockGetTodaysCompletedTasks()));
    
    act(() => {
      result.current.handleShowCompleted();
    });
    expect(result.current.viewingCompleted).toBe(false);
    const expectedActive = mockTasks.filter(t => !t.completed && !t.is_archived);
    expect(getTaskIds(result.current.filteredTasks)).toEqual(getTaskIds(expectedActive));
  });

  it('should toggle today\'s tasks view', () => {
    const { result } = renderHook(() => useTaskFiltering(defaultProps));
    const expectedTodays = mockTasks.filter(t => !t.completed && !t.is_archived && t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString());

    act(() => {
      result.current.handleShowToday();
    });
    expect(result.current.showTodaysTasks).toBe(true);
    expect(getTaskIds(result.current.filteredTasks)).toEqual(getTaskIds(expectedTodays));
    
    act(() => {
      result.current.handleShowToday();
    });
    expect(result.current.showTodaysTasks).toBe(false);
    const expectedActive = mockTasks.filter(t => !t.completed && !t.is_archived);
    expect(getTaskIds(result.current.filteredTasks)).toEqual(getTaskIds(expectedActive));
  });

  it('handleShowAllActive should reset to active tasks view', () => {
    const { result } = renderHook(() => useTaskFiltering(defaultProps));
    
    act(() => { // Go to archived view first
      result.current.handleShowArchived();
    });
    expect(result.current.viewingArchived).toBe(true);

    act(() => { // Then call show all active
      result.current.handleShowAllActive();
    });
    expect(result.current.viewingArchived).toBe(false);
    expect(result.current.viewingCompleted).toBe(false);
    expect(result.current.showTodaysTasks).toBe(false);
    const expectedActive = mockTasks.filter(t => !t.completed && !t.is_archived);
    expect(getTaskIds(result.current.filteredTasks)).toEqual(getTaskIds(expectedActive));
  });

  // --- Enhanced Search Term Tests ---
  describe('Search Term Functionality', () => {
    it('should initialize with props.searchTerm and filter accordingly', () => {
      const initialProps = { ...defaultProps, searchTerm: 'UniqueTitleKeyword' };
      const { result } = renderHook(() => useTaskFiltering(initialProps));
      expect(result.current.searchTerm).toBe('UniqueTitleKeyword');
      expect(result.current.filteredTasks.map(t => t.id)).toEqual(['8']);
    });

    it('should update searchTerm and filteredTasks when setSearchTerm is called', () => {
      const { result } = renderHook(() => useTaskFiltering(defaultProps));
      act(() => {
        result.current.setSearchTerm('UniqueDescriptionKeyword');
      });
      expect(result.current.searchTerm).toBe('UniqueDescriptionKeyword');
      expect(result.current.filteredTasks.map(t => t.id)).toEqual(['9']);
    });

    it('should be case-insensitive', () => {
      const { result } = renderHook(() => useTaskFiltering(defaultProps));
      act(() => {
        result.current.setSearchTerm('casekeyword'); // Lowercase search for 'CaSeKeYwOrD'
      });
      expect(result.current.filteredTasks.map(t => t.id)).toEqual(['10']);
    });

    it('should find tasks by tag name', () => {
      const { result } = renderHook(() => useTaskFiltering(defaultProps));
      act(() => {
        result.current.setSearchTerm('Frontend'); // Search by tag name
      });
      // Tasks 8, 11, 15 have 'Frontend' tag or related keywords in title/desc
      // The search logic ORs title, desc, and tag names.
      // Task 8: 'UniqueTitleKeywordOnly', tags: [mockTags.frontend]
      // Task 11: 'Task with Frontend Tag', tags: [mockTags.frontend, mockTags.design]
      // Task 15: 'Today Task with Keyword', tags: [mockTags.frontend, mockTags.urgent]
      // Task 2: 'Active Task 2 (search-keyword)' - might match 'frontend' if 'frontend' is a keyword in its desc. Assuming not for this test.
      // Task 1: 'Active Task 1' - might match 'frontend' if 'frontend' is a keyword in its desc. Assuming not for this test.
      // Let's be specific: search for tag 'UrgentSearch'
      act(() => {
        result.current.setSearchTerm('UrgentSearch');
      });
      expect(result.current.filteredTasks.map(t => t.id).sort()).toEqual(['10', '15'].sort());
    });

    it('should return no results if search term does not match', () => {
      const { result } = renderHook(() => useTaskFiltering(defaultProps));
      act(() => {
        result.current.setSearchTerm('NonExistentTermZZZ');
      });
      expect(result.current.filteredTasks).toEqual([]);
    });

    it('should show all active tasks if search term is empty', () => {
      const initialProps = { ...defaultProps, searchTerm: 'initial' };
      const { result } = renderHook(() => useTaskFiltering(initialProps));
      act(() => {
        result.current.setSearchTerm('');
      });
      const expectedActive = mockTasks.filter(t => !t.completed && !t.is_archived);
      expect(result.current.filteredTasks.map(t => t.id).sort()).toEqual(expectedActive.map(t => t.id).sort());
    });

    // Search with different views
    it('should filter by search term in COMPLETED view', () => {
      const { result } = renderHook(() => useTaskFiltering(defaultProps));
      act(() => result.current.handleShowCompleted());
      act(() => result.current.setSearchTerm('KeywordInCompleted'));
      expect(result.current.filteredTasks.map(t => t.id)).toEqual(['13']);
    });

    it('should filter by search term in TODAY view', () => {
      const { result } = renderHook(() => useTaskFiltering(defaultProps));
      act(() => result.current.handleShowToday());
      act(() => result.current.setSearchTerm('KeywordInToday'));
      // Task 15: 'Today Task with Keyword', dueDate: now
      // Task 7: 'Active Task 4 for Today', dueDate: now
      // Task 3: 'Active Task 3 for Today', dueDate: now
      // Task 1: 'Active Task 1', dueDate: now
      // Only task 15 has 'KeywordInToday' in its description
      const expectedTodaySearched = mockTasks.filter(task =>
        task.id === '15' &&
        !task.completed && !task.is_archived &&
        ((task.dueDate && new Date(task.dueDate).toDateString() === now.toDateString()) ||
         (task.goLiveDate && new Date(task.goLiveDate).toDateString() === now.toDateString()) ||
         (task.targetDeadline && new Date(task.targetDeadline).toDateString() === now.toDateString()))
      );
      expect(result.current.filteredTasks.map(t => t.id).sort()).toEqual(expectedTodaySearched.map(t => t.id).sort());
    });

    it('should filter by search term in ARCHIVED view (extended)', () => {
      const { result } = renderHook(() => useTaskFiltering(defaultProps));
      act(() => result.current.handleShowArchived());
      act(() => result.current.setSearchTerm('KeywordInArchivedExtra'));
      expect(result.current.filteredTasks.map(t => t.id)).toEqual(['14']);
    });

    // Search with other filters
    it('should filter by search term AND priority', () => {
      const { result } = renderHook(() => useTaskFiltering(defaultProps));
      act(() => result.current.handleTogglePriority(Priority.HIGH));
      act(() => result.current.setSearchTerm('High Priority Searchable')); // Task 12
      expect(result.current.filteredTasks.map(t => t.id)).toEqual(['12']);

      act(() => result.current.setSearchTerm('NoMatch'));
      expect(result.current.filteredTasks).toEqual([]);
    });

    it('should filter by search term AND tag (by name in search)', () => {
      const { result } = renderHook(() => useTaskFiltering(defaultProps));
      // Select 'Frontend' tag via its name in search term
      act(() => result.current.setSearchTerm('Frontend'));
      // Then apply another filter, e.g., priority, to see combined effect
      // For this test, just checking search by tag name is enough as per previous tag test.
      // Tasks with 'Frontend' tag: 8, 11, 15. Task 11 also has 'Design'.
      // Task 8: 'UniqueTitleKeywordOnly', tags: [mockTags.frontend]
      // Task 11: 'Task with Frontend Tag', tags: [mockTags.frontend, mockTags.design]
      // Task 15: 'Today Task with Keyword', tags: [mockTags.frontend, mockTags.urgent]
      const expected = ['8', '11', '15'];
      expect(result.current.filteredTasks.map(t => t.id).sort()).toEqual(expected.sort());
    });
  });

  // --- Existing Search Term Tests (can be refactored or removed if redundant) ---
  it('should filter by search term in active view', () => {
    const propsWithSearch = { ...defaultProps, searchTerm: 'keyword' };
    const { result } = renderHook(() => useTaskFiltering(propsWithSearch));
    const expectedSearchedActive = mockTasks.filter(t => 
      !t.completed && 
      !t.is_archived && 
      (t.title.toLowerCase().includes('keyword') || 
       (t.description && t.description.toLowerCase().includes('keyword')) ||
       t.title.toLowerCase().includes('searchkeyword') || // cater for variations like 'search-keyword' or 'SearchKeyword'
       (t.description && t.description.toLowerCase().includes('searchkeyword'))
      )
    );
    // Tasks 2, 8, 9, 10, 15 should match 'keyword' or 'searchkeyword' in title/description and be active
    expect(getTaskIds(result.current.filteredTasks).sort()).toEqual(getTaskIds(expectedSearchedActive).sort());
  });

  it('should filter by search term in archived view', async () => {
    // Define archivedTasks locally for this test case, derived from mockTasks
    const archivedTasks: Task[] = mockTasks.filter(t => t.is_archived);
    // Ensure we are referencing the correct task for the assertion.
    // mockTasks[5] is 'Archived Task 2 (search-keyword)' with id '6'.
    // If archivedTasks is filtered from mockTasks, this would be archivedTasks[1].
    const expectedArchivedTaskWithKeyword = archivedTasks.find(t => t.id === '6');
    if (!expectedArchivedTaskWithKeyword) {
      throw new Error("Test setup error: Expected archived task with ID '6' not found.");
    }

    const initialPropsForMount: UseTaskFilteringProps = {
      tasks: mockTasks, 
      getArchivedTasks: () => archivedTasks, // Use locally defined archivedTasks
      getTodaysCompletedTasks: () => [], 
      searchTerm: '', 
    };

    const propsForRerenderWithSearch: UseTaskFilteringProps = {
      ...initialPropsForMount, 
      searchTerm: 'keyword', 
    };

    const { result, rerender } = renderHook(
        (props: UseTaskFilteringProps) => useTaskFiltering(props),
        { initialProps: initialPropsForMount }
    );


    act(() => {
        rerender(propsForRerenderWithSearch);
    });
    
    await waitFor(() => {
        expect(result.current.searchTerm).toBe('keyword'); 
        expect(result.current.propsSearchTerm).toBe('keyword'); 
    });

    act(() => {
      result.current.handleShowArchived();
    });

    // Task '6' title: 'Archived Task 2 (search-keyword)'
    // Task '14' description: 'This archived task also has a SearchKeyword.'
    // Both should match 'keyword' and be archived.
    const expectedSearchedArchivedTasksResult = archivedTasks.filter(t => 
      t.id === '6' || t.id === '14'
    );

    await waitFor(() => {
      expect(getTaskIds(result.current.filteredTasks).sort()).toEqual(getTaskIds(expectedSearchedArchivedTasksResult).sort());
    });
  });

  // --- Other Filters Tests ---
  it('should filter by priority in active view and bypass for archived view', () => {
    const { result, rerender } = renderHook((props: UseTaskFilteringProps) => useTaskFiltering(props), { initialProps: defaultProps });
    
    // Toggle HIGH priority
    act(() => {
      result.current.handleTogglePriority(Priority.HIGH);
    });
    const expectedHighPriorityActive = mockTasks.filter(t => !t.completed && !t.is_archived && t.priority === Priority.HIGH);
    expect(getTaskIds(result.current.filteredTasks)).toEqual(getTaskIds(expectedHighPriorityActive));

    // Switch to archived view
    act(() => {
      result.current.handleShowArchived();
    });
    // Priority filter should be bypassed for archived tasks
    expect(getTaskIds(result.current.filteredTasks)).toEqual(getTaskIds(mockGetArchivedTasks()));

    // Switch back to active view - priority filter should still be active
    act(() => {
      result.current.handleShowAllActive(); // or handleShowArchived again
    });
     expect(getTaskIds(result.current.filteredTasks)).toEqual(getTaskIds(expectedHighPriorityActive));

    // Clear filters
    act(() => {
      result.current.clearAllFilters();
    });
    const expectedActive = mockTasks.filter(t => !t.completed && !t.is_archived);
    expect(getTaskIds(result.current.filteredTasks)).toEqual(getTaskIds(expectedActive));
  });
});
});
