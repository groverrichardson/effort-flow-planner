import { render, screen, fireEvent, act, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Index from './Index'; // Adjust path as necessary
import { TaskContext } from '@/context/TaskContext'; // Adjust path
import * as useMobileHook from '@/hooks/use-mobile'; // Adjust path
import * as useTaskFilteringHook from '@/hooks/useTaskFiltering'; // Adjust path
import { Task, TaskStatus, Person, Priority, DueDateType, EffortLevel } from '@/types'; // Import necessary types

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock child components to simplify testing
vi.mock('@/components/TaskList', () => ({ default: () => <div data-testid="mock-task-list">TaskList</div> }));
vi.mock('@/components/quick-task/QuickTaskInput', () => ({ default: () => <div data-testid="mock-quick-task-input">QuickTaskInput</div> }));
vi.mock('@/components/headers/PageHeader', () => ({
    default: ({ onBulkImportClick }: { onBulkImportClick?: () => void; [key: string]: any }) => (
        <div data-testid="mock-page-header">
            {onBulkImportClick && (
                <button onClick={onBulkImportClick}>
                    Bulk Import
                </button>
            )}
        </div>
    ),
}));
vi.mock('@/components/Sidebar', () => ({ default: () => <div data-testid="mock-sidebar">Sidebar</div> }));
vi.mock('@/components/dialogs/CreateTaskDialog', () => ({ default: () => <div data-testid="mock-create-task-dialog">CreateTaskDialog</div> }));
vi.mock('@/components/dialogs/ManageDialog', () => ({ default: () => <div data-testid="mock-manage-dialog">ManageDialog</div> }));
vi.mock('@/components/dialogs/BulkImportDialog', () => ({
    default: ({ open }: { open?: boolean; [key: string]: any }) => {
        if (!open) {
            return null; 
        }
        return (
            <div data-testid="mock-bulk-import-dialog">
                <h2 role="heading" aria-level={2}>Bulk Import Tasks</h2>
            </div>
        );
    },
}));
vi.mock('@/components/dialogs/TaskDialogs', () => ({
    default: ({ onOpenCreateNoteDialog }: { onOpenCreateNoteDialog?: (taskId: string) => void; [key: string]: any }) => (
        <div data-testid="mock-task-dialogs">
            {onOpenCreateNoteDialog && (
                <button onClick={() => onOpenCreateNoteDialog('test-task-id-123')}>
                    Add Note to Task
                </button>
            )}
        </div>
    ),
}));
// vi.mock('@/components/UpcomingTasks', () => ({ default: () => <div data-testid="mock-upcoming-tasks">UpcomingTasks</div> })); // Removed as UpcomingTasks is no longer directly in Index
vi.mock('@/components/headers/TaskListHeader', () => ({ default: () => <div data-testid="mock-task-list-header">TaskListHeader</div> }));


// Mock hooks
const mockUseIsMobile = vi.spyOn(useMobileHook, 'useIsMobile');
const mockUseTaskFiltering = vi.spyOn(useTaskFilteringHook, 'useTaskFiltering');

const mockTaskContextValue = {
    tasks: [],
    tags: [],
    people: [],
    recurrenceRules: [], // Added
    getTodaysCompletedTasks: vi.fn(() => []),
    addTask: vi.fn(),
    updateTask: vi.fn(),
    archiveTask: vi.fn(), // Added
    deleteTask: vi.fn(), // For hard deletion
    completeTask: vi.fn(), // Added
    addTag: vi.fn(() => Promise.resolve({ id: 't1', name: 'New Tag' })),
    // updateTag: vi.fn(), // Removed
    deleteTag: vi.fn(),
    addPerson: vi.fn(() => Promise.resolve({ id: 'p1', name: 'New Person' })),
    updatePerson: vi.fn(),
    deletePerson: vi.fn(),
    // bulkImportTasks: vi.fn(), // Removed
    getArchivedTasks: vi.fn(() => []), // Added
    loading: false, // Added
    getRecurrenceRuleById: vi.fn(), // Added
    getTaskById: vi.fn(), // Added
};

const mockUseTaskFilteringReturnValue = {
    selectedPriorities: [],
    selectedTags: [],
    selectedPeople: [],
    filterByDueDate: 'all',
    filterByGoLive: false,
    handleTogglePriority: vi.fn(),
    handleToggleTag: vi.fn(),
    handleTogglePerson: vi.fn(),
    setFilterByDueDate: vi.fn(),
    setFilterByGoLive: vi.fn(),
    clearAllFilters: vi.fn(),
    viewingCompleted: false,
    showTodaysTasks: false,
    viewingArchived: false,
    searchTerm: '',
    propsSearchTerm: '',
    setSearchTerm: vi.fn(),
    todaysTasks: [],
    activeTasks: [],
    completedTasks: [],
    archivedTasks: [],
    filteredTasks: [],
    activeFilterCount: 0,
    archivedTasksCount: 0,
    completedTasksCount: 0,
    todaysTasksCount: 0,
    getTaskById: vi.fn(), // Added
    currentView: 'active', // Added
    handleShowAllActive: vi.fn(),
    handleShowToday: vi.fn(),
    handleShowCompleted: vi.fn(),
    handleShowArchived: vi.fn(),
    handleSetSearchTerm: vi.fn(),
    setCurrentView: vi.fn(),
};

// Helper to get the mobile quick task container
const getMobileInputContainer = () => screen.queryByTestId('mobile-quick-task-container');

describe('Index Page - Mobile Quick Task Input Scroll Behavior', () => {
    beforeEach(() => {
        // Mock useIsMobile to return true for mobile tests
        mockUseIsMobile.mockReturnValue(true);
        mockUseTaskFiltering.mockReturnValue(mockUseTaskFilteringReturnValue);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    const renderComponent = () => {
        return render(
            <MemoryRouter>
                <TaskContext.Provider value={mockTaskContextValue}>
                    <Index />
                </TaskContext.Provider>
            </MemoryRouter>
        );
    };
    
    it('should show the input on initial load (mobile)', () => {
        renderComponent();
        const inputContainer = getMobileInputContainer();
        expect(inputContainer).toBeInTheDocument();
        expect(inputContainer).toHaveClass('translate-y-0'); // Visible
    });

    it('should hide the input when scrolling down (mobile)', () => {
        const { container } = renderComponent();
        const actualScrollableDiv = container.querySelector('.flex-grow.overflow-y-auto') as HTMLElement;
        expect(actualScrollableDiv).toBeInTheDocument();

        act(() => {
          fireEvent.scroll(actualScrollableDiv, { target: { scrollTop: 200 } });
        });

        const inputContainer = getMobileInputContainer();
        expect(inputContainer).toHaveClass('translate-y-full'); // Hidden
    });

    it('should show the input when scrolling up after scrolling down (mobile)', () => {
        const { container } = renderComponent();
        const actualScrollableDiv = container.querySelector('.flex-grow.overflow-y-auto') as HTMLElement;
        expect(actualScrollableDiv).toBeInTheDocument();

        // Scroll down first
        act(() => {
          fireEvent.scroll(actualScrollableDiv, { target: { scrollTop: 200 } });
        });
        let inputContainer = getMobileInputContainer();
        expect(inputContainer).toHaveClass('translate-y-full'); // Hidden

        // Scroll up
        act(() => {
          fireEvent.scroll(actualScrollableDiv, { target: { scrollTop: 100 } });
        });
        inputContainer = getMobileInputContainer();
        expect(inputContainer).toHaveClass('translate-y-0'); // Visible
    });

    it('should show the input if scrolled to the very top (mobile)', () => {
        const { container } = renderComponent();
        const actualScrollableDiv = container.querySelector('.flex-grow.overflow-y-auto') as HTMLElement;
        expect(actualScrollableDiv).toBeInTheDocument();

        // Scroll down
         act(() => {
          fireEvent.scroll(actualScrollableDiv, { target: { scrollTop: 200 } });
        });
        let inputContainer = getMobileInputContainer();
        expect(inputContainer).toHaveClass('translate-y-full'); // Hidden

        // Scroll to very top
        act(() => {
          fireEvent.scroll(actualScrollableDiv, { target: { scrollTop: 5 } });
        });
        inputContainer = getMobileInputContainer();
        expect(inputContainer).toHaveClass('translate-y-0'); // Visible
    });

    it('should not render mobile quick task input if not on mobile', () => {
        mockUseIsMobile.mockReturnValue(false); // Desktop view
        renderComponent();
        expect(getMobileInputContainer()).not.toBeInTheDocument();
    });
});

describe('Dashboard Layout and Sections', () => {
    const FAKE_TODAY_ISO = '2024-07-15T10:00:00.000Z';
    const FAKE_TODAY_DATE = new Date(FAKE_TODAY_ISO);

    const baseMockTask: Omit<Task, 'id' | 'title' | 'status' | 'dueDate' | 'people'> = {
        description: 'Test Description',
        priority: Priority.NORMAL,
        dueDateType: DueDateType.ON,
        targetDeadline: null,
        goLiveDate: null,
        effortLevel: EffortLevel.M,
        completed: false,
        completedDate: null,
        tags: [],
        dependencies: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        is_archived: false,
        userId: 'user1',
    };

    beforeEach(() => {
        mockUseIsMobile.mockReturnValue(false); // Default to desktop for these tests
        mockUseTaskFiltering.mockReturnValue(mockUseTaskFilteringReturnValue);
        vi.useFakeTimers();
        vi.setSystemTime(FAKE_TODAY_DATE);
        mockTaskContextValue.tasks = []; // Reset tasks for each test
        mockNavigate.mockClear(); // Clear navigate mock
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    const renderIndexWithTasks = (tasks: Task[]) => {
        mockTaskContextValue.tasks = tasks;
        return render(
            <MemoryRouter>
                <TaskContext.Provider value={{ ...mockTaskContextValue, tasks }}>
                    <Index />
                </TaskContext.Provider>
            </MemoryRouter>
        );
    };

    it('renders new section titles and placeholders correctly', () => {
        const { container } = renderIndexWithTasks([]);
        // Suggestions Section
        expect(screen.getByText('Suggestions for Next Steps')).toBeInTheDocument();
        expect(screen.getByText(/Future home of intelligent task suggestions/)).toBeInTheDocument();
        
        // Owed to Others Section
        const owedToOthersSection = container.querySelector<HTMLElement>('#owed-to-others-section');
        expect(owedToOthersSection).toBeInTheDocument();
        if (!owedToOthersSection) throw new Error("'#owed-to-others-section' not found.");
        expect(within(owedToOthersSection).getByText('Owed to Others (Due Today or Past Due)')).toBeInTheDocument(); // Check title within section
        expect(within(owedToOthersSection).getByText("No tasks owed to others are due today or past due.")).toBeInTheDocument(); // Check placeholder within section

        // All My Tasks Section
        expect(screen.getByText('All My Tasks')).toBeInTheDocument(); // Check title
        expect(screen.getByTestId('mock-task-list')).toBeInTheDocument(); // Check that the main task list (mocked) is rendered
    });

    describe('"Owed to Others (Due Today or Past Due)" section logic', () => {
        const person1: Person = { id: 'p1', name: 'Person One' };
        const tasksForOwedSection: Task[] = [
            { ...baseMockTask, id: 'task1', title: 'Owed Task - Due Today', status: TaskStatus.PENDING, dueDate: FAKE_TODAY_DATE, people: [person1] },
            { ...baseMockTask, id: 'task2', title: 'Owed Task - Past Due', status: TaskStatus.IN_PROGRESS, dueDate: new Date('2024-07-14T10:00:00.000Z'), people: [person1] },
            { ...baseMockTask, id: 'task3', title: 'Future Task', status: TaskStatus.PENDING, dueDate: new Date('2024-07-16T10:00:00.000Z'), people: [person1] },
            { ...baseMockTask, id: 'task4', title: 'Due Today - No People', status: TaskStatus.PENDING, dueDate: FAKE_TODAY_DATE, people: [] },
            { ...baseMockTask, id: 'task5', title: 'Due Today - Completed', status: TaskStatus.COMPLETED, dueDate: FAKE_TODAY_DATE, people: [person1] },
        ];

        it('displays tasks that are due today or past due and involve people', () => {
            const { container } = renderIndexWithTasks(tasksForOwedSection);
            const owedToOthersSection = container.querySelector<HTMLElement>('#owed-to-others-section');
            expect(owedToOthersSection).toBeInTheDocument();
            if (!owedToOthersSection) throw new Error("'#owed-to-others-section' not found.");

            // The list itself should now be present because there are tasks
            const owedToListElement = within(owedToOthersSection).queryByRole('list'); // More semantic query for <ul>
            expect(owedToListElement).toBeInTheDocument();
            if (!owedToListElement) throw new Error("Task list (ul) not found within #owed-to-others-section when tasks are expected.");

            // Verify tasks that should be in the list are present within this specific list
            expect(within(owedToListElement).getByText('Owed Task - Due Today')).toBeInTheDocument();
            expect(within(owedToListElement).getByText('Owed Task - Past Due')).toBeInTheDocument();

            // Verify tasks that should NOT be in this specific list are absent from it
            expect(within(owedToListElement).queryByText('Future Task')).toBeNull();
            expect(within(owedToListElement).queryByText('Due Today - No People')).toBeNull();
            expect(within(owedToListElement).queryByText('Due Today - Completed')).toBeNull();

            // Verify placeholder is NOT shown when tasks are present in this list (check within the broader section)
            expect(within(owedToOthersSection).queryByText("No tasks owed to others are due today or past due.")).toBeNull();
        });

        it('displays placeholder when task list is empty', () => {
            const { container } = renderIndexWithTasks([]);
            const owedToOthersSection = container.querySelector<HTMLElement>('#owed-to-others-section');
            expect(owedToOthersSection).toBeInTheDocument();
            if (!owedToOthersSection) throw new Error("'#owed-to-others-section' not found.");

            // List (ul) should not be present
            expect(within(owedToOthersSection).queryByRole('list')).toBeNull();
            // Placeholder should be present
            expect(within(owedToOthersSection).getByText("No tasks owed to others are due today or past due.")).toBeInTheDocument();
        });

        it('displays placeholder when no tasks match criteria', () => {
            const nonMatchingTasks: Task[] = [
                { ...baseMockTask, id: 'task6', title: 'Future Task Only', status: TaskStatus.PENDING, dueDate: new Date('2024-07-16T10:00:00.000Z'), people: [person1] },
            ];
            const { container } = renderIndexWithTasks(nonMatchingTasks);
            const owedToOthersSection = container.querySelector<HTMLElement>('#owed-to-others-section');
            expect(owedToOthersSection).toBeInTheDocument();
            if (!owedToOthersSection) throw new Error("'#owed-to-others-section' not found.");

            // List (ul) should not be present
            expect(within(owedToOthersSection).queryByRole('list')).toBeNull();
            // Placeholder should be present
            expect(within(owedToOthersSection).getByText("No tasks owed to others are due today or past due.")).toBeInTheDocument();
        });

        it('navigates on task click from "Owed to Others" list', () => {
            const taskToClick: Task = { ...baseMockTask, id: 'task-nav-test', title: 'Click Me Owed Task', status: TaskStatus.PENDING, dueDate: FAKE_TODAY_DATE, people: [person1] };
            renderIndexWithTasks([taskToClick]);

            const taskItem = screen.getByText('Click Me Owed Task');
            expect(taskItem).toBeInTheDocument();
            fireEvent.click(taskItem);
            expect(mockNavigate).toHaveBeenCalledWith(`/tasks/${taskToClick.id}`);
        });
    });
});

describe('Dialog Interactions', () => {
    const renderComponent = () => {
        // Use a default mockTaskContextValue, can be overridden if a test needs specific tasks
        return render(
            <MemoryRouter>
                <TaskContext.Provider value={mockTaskContextValue}>
                    <Index />
                </TaskContext.Provider>
            </MemoryRouter>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseIsMobile.mockReturnValue(false); // Default to desktop for these tests
    });

    it('opens Bulk Import dialog when PageHeader bulk import action is triggered', async () => {
        renderComponent(); // Renders Index with its PageHeader

        // Attempt to find the bulk import button. This may need adjustment based on PageHeader's actual markup.
        const bulkImportButton = screen.getByRole('button', { name: /bulk import/i });
        expect(bulkImportButton).toBeInTheDocument();

        fireEvent.click(bulkImportButton);

        // Check if the BulkImportDialog is rendered, e.g., by its title.
        expect(await screen.findByRole('heading', { name: /Bulk Import Tasks/i, level: 2 })).toBeInTheDocument();
    });

    // Note: Testing for openCreateNoteDialog (with taskId) is complex from Index.test.tsx
    // as it involves simulating TaskDialogs interactions. This is better suited for TaskDialogs.test.tsx.
    // A test for openCreateNoteDialog (no taskId) would be added here if a direct UI trigger
    // from the Index page (e.g., a general 'Create Note' button in PageHeader) is implemented.

    it('navigates to create note page for a specific task when triggered via TaskDialogs', () => {
        renderComponent(); // Renders Index, which includes the mocked TaskDialogs

        // Find the button within our mocked TaskDialogs
        const addNoteButton = screen.getByRole('button', { name: /Add Note to Task/i });
        expect(addNoteButton).toBeInTheDocument();

        fireEvent.click(addNoteButton);

        // Assert that navigate was called correctly by openCreateNoteDialog
        expect(mockNavigate).toHaveBeenCalledWith('/tasks/test-task-id-123/notes/new');
    });
});
