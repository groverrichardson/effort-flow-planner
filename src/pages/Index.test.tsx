import React from 'react';
import { render, screen, fireEvent, act, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Index from './Index'; // Adjust path as necessary
// import { TaskContext } from '@/context/TaskContext'; // No longer directly using Provider
import * as useMobileHook from '@/hooks/use-mobile'; // Adjust path
import * as useTaskFilteringHook from '@/hooks/useTaskFiltering'; // Adjust path
import { Task, TaskStatus, Person, Priority, DueDateType, EffortLevel } from '@/types'; // Import necessary types
import { isToday, isPast } from 'date-fns';

// Global afterEach for the entire test file
afterEach(() => {
  vi.restoreAllMocks();
});

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
vi.mock('@/components/TaskList', () => {
    // Simplified Task type for mock props to avoid import issues inside vi.mock factory
    interface MockTask {
        id: string;
        title: string;
        [key: string]: any; // Allow other properties to match the full Task type if needed
    }

    interface MockTaskListProps {
        tasks?: MockTask[];
        filteredTasks?: MockTask[]; // Added to support the prop name used in Index.tsx
        onTaskItemClick?: (task: MockTask) => void; // The actual component expects a full Task
        dataTestId?: string;
        title?: string;
        placeholder?: React.ReactNode;
        header?: React.ReactNode;
    }

    return {
        default: (props: MockTaskListProps) => {
            const consoleLogPrefix = '[TEST MOCK TASKLIST]';
            const {
                filteredTasks,
                tasks: tasksDirect,
                onTaskItemClick,
                dataTestId, // This is the crucial prop for the outer div
                title,
                placeholder,
                header
            } = props;

            const tasks = filteredTasks !== undefined ? filteredTasks : tasksDirect;
            const isOwedToOthersInstance = dataTestId === 'owed-to-others-task-list';

            // Logging for the "Owed to Others" instance
            if (isOwedToOthersInstance) {
                // Avoid stringifying functions in props for cleaner logs
                const loggableProps = { ...props, onTaskItemClick: props.onTaskItemClick ? 'function' : undefined };
                console.log(`${consoleLogPrefix} [${dataTestId}] PROPS:`, JSON.stringify(loggableProps, null, 2));
                console.log(`${consoleLogPrefix} [${dataTestId}] Effective 'tasks' for logic:`, JSON.stringify(tasks));
            }

            let content: React.ReactNode;

            if (isOwedToOthersInstance) {
                const taskToDisplay = tasks && tasks.find(t => t.id === 'task-nav-test');
                if (taskToDisplay) {
                    console.log(`${consoleLogPrefix} [${dataTestId}] Rendering specific button for task: ${taskToDisplay.id}`);
                    content = (
                        <div role="list">
                            <div role="listitem">
                                <button
                                    data-testid={`task-button-${taskToDisplay.id}`}
                                    onClick={() => {
                                        console.log(`${consoleLogPrefix} [${dataTestId}] Specific task button clicked: ${taskToDisplay.title}`);
                                        if (onTaskItemClick) {
                                            onTaskItemClick(taskToDisplay as MockTask);
                                        }
                                    }}
                                >
                                    {taskToDisplay.title}
                                </button>
                            </div>
                        </div>
                    );
                } else {
                    console.log(`${consoleLogPrefix} [${dataTestId}] Task 'task-nav-test' not found or tasks empty. Rendering placeholder.`);
                    content = <>{placeholder || 'No tasks owed to others available.'}</>;
                }
            } else {
                // Generic rendering for other TaskList instances
                if (tasks && tasks.length > 0) {
                    console.log(`${consoleLogPrefix} [${dataTestId || 'generic'}] Rendering generic list. Count: ${tasks.length}`);
                    content = (
                        <>
                            {title && <p>{title}</p>}
                            {header}
                            <div role="list">
                                {tasks.map((task, index) => (
                                    <div role="listitem" key={task.id || index}>
                                        <button
                                            data-testid={`task-button-${task.id}`}
                                            onClick={() => onTaskItemClick && onTaskItemClick(task as MockTask)}
                                        >
                                            {task.title}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </>
                    );
                } else {
                    console.log(`${consoleLogPrefix} [${dataTestId || 'generic'}] Tasks empty. Rendering placeholder.`);
                    content = <>{placeholder || 'No tasks available (generic mock)'}</>;
                }
            }

            // The root element of the mock always uses the dataTestId from props
            return (
                <div data-testid={dataTestId} title={title}>
                    {content}
                </div>
            );
        },
    };
});
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

// Default data for the mocked useTaskContext
const mockTaskContextData = {
    tasks: [] as Task[], // Ensure tasks is typed correctly for dynamic assignment
    tags: [] as any[],
    people: [] as Person[],
    loading: false,
    error: null,
    addTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    getTaskById: vi.fn((id: string) => mockTaskContextData.tasks.find(t => t.id === id) || null),
    addTag: vi.fn(),
    updateTag: vi.fn(),
    deleteTag: vi.fn(),
    addPerson: vi.fn(),
    updatePerson: vi.fn(),
    deletePerson: vi.fn(),
    getTodaysCompletedTasks: vi.fn(() => []),
    getArchivedTasks: vi.fn(() => []),
    toggleTaskArchiveStatus: vi.fn(),
    fetchTasks: vi.fn(),
    fetchTags: vi.fn(),
    fetchPeople: vi.fn(),
};

// Mock the useTaskContext hook
vi.mock('@/context/TaskContext', () => ({
    useTaskContext: () => mockTaskContextData,
}));

// Common mock data for tests
const FAKE_TODAY_DATE = new Date('2024-07-15T10:00:00.000Z');
const person1: Person = { id: 'p1', name: 'Person One', avatar_url: 'http://example.com/avatar.jpg' };

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
    createdAt: new Date('2025-06-01T02:06:43.396Z'), // Consistent ISO string
    updatedAt: new Date('2025-06-01T02:06:43.396Z'), // Consistent ISO string
    is_archived: false,
    userId: 'user1',
    // recurrenceRuleId: null, // Optional: Add if consistently needed
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
    propsSearchTerm: '', // Added to match expected type
    setSearchTerm: vi.fn(), // General search term update
    // Specific task lists - these would typically be derived from context tasks + filters
    todaysTasks: [], 
    activeTasks: [],
    completedTasks: [],
    archivedTasks: [],
    filteredTasks: [], // This is the main list the component uses after filtering
    activeFilterCount: 0,
    archivedTasksCount: 0,
    completedTasksCount: 0,
    todaysTasksCount: 0,
    getTaskById: vi.fn((taskId: string) => mockTaskContextData.tasks.find(t => t.id === taskId)),
    currentView: 'active',
    handleShowAllActive: vi.fn(),
    handleShowToday: vi.fn(),
    handleShowCompleted: vi.fn(),
    handleShowArchived: vi.fn(),
    handleSetSearchTerm: vi.fn(), // If different from setSearchTerm
    setCurrentView: vi.fn(),
    filteredTasksOwedToOthers: [], // Added default
};

// Helper to get the mobile quick task container
const getMobileInputContainer = () => screen.queryByTestId('mobile-quick-task-container');

// Helper function to render Index with specific tasks for testing
const renderIndexWithTasks = (tasks: Task[]) => {
    mockTaskContextData.tasks = tasks; // Set tasks for useTaskContext mock

    // For the 'Owed to Others' section, it specifically uses 'owedToOthersTasks'
    // from the useTaskFiltering hook. We need to ensure this is populated correctly.
    const taskForOwedSection = tasks.find(t => 
        t.id === 'task-nav-test' && 
        t.people && t.people.length > 0 && 
        t.dueDate && new Date(t.dueDate) <= FAKE_TODAY_DATE && // FAKE_TODAY_DATE is in scope here
        t.status !== TaskStatus.COMPLETED
    );

    mockUseTaskFiltering.mockReturnValue({
        ...mockUseTaskFilteringReturnValue,
        // Provide a generic filteredTasks. Index.tsx calculates owedToOthersTasks itself.
        filteredTasks: tasks, 
        // tasksFromCtx (set by mockTaskContextData.tasks = tasks) is used by Index.tsx to derive owedToOthersTasks.
        searchTerm: '',
        viewingCompleted: false,
        viewingArchived: false,
    });
    
    return render(
        <MemoryRouter>
            <Index />
        </MemoryRouter>
    );
};

describe('Dashboard Layout and Sections', () => {
    console.log('[DESCRIBE - Dashboard Layout] Entered.');
    const FAKE_TODAY_ISO = '2024-07-15T10:00:00.000Z';
    const FAKE_TODAY_DATE = new Date(FAKE_TODAY_ISO);

    let baseMockTaskForDescribe: Task;

    beforeEach(() => {
        console.log('[BEFORE EACH - Dashboard Layout] Starting...');
        vi.useFakeTimers();
        vi.setSystemTime(FAKE_TODAY_DATE);
        // Ensure all required Task properties are present for baseMockTaskForDescribe
        baseMockTaskForDescribe = { 
            ...baseMockTask, // Spread the properties from the Omit<...> typed baseMockTask
            id: 'describe-block-base-task', // Provide the ID
            // Provide default values for the properties that were Omitted from baseMockTask
            title: 'Default Title for Describe Block Task', 
            status: TaskStatus.PENDING,
            dueDate: FAKE_TODAY_DATE,
            people: [person1], // Default to person1 or an empty array as appropriate
        }; 
        mockUseTaskFiltering.mockReturnValue(mockUseTaskFilteringReturnValue);
        mockUseIsMobile.mockReturnValue(false);
        console.log('[BEFORE EACH - Dashboard Layout] Finished.');
    });

    afterEach(() => {
        console.log('[AFTER EACH - Dashboard Layout] Starting...');
        vi.clearAllMocks(); 
        vi.useRealTimers();
        console.log('[AFTER EACH - Dashboard Layout] Finished.');
    });

    it('renders new section titles and placeholders correctly', () => {
        const { container } = renderIndexWithTasks([]);
        // Suggestions Section
        expect(screen.getByText('Suggestions for Next Steps')).toBeInTheDocument();
        expect(screen.getByText(/Future home of intelligent task suggestions/)).toBeInTheDocument();

        // Owed to Others Section
        expect(screen.getByText('Owed to Others (Due Today or Past Due)')).toBeInTheDocument(); // Check title
        const owedSectionForLayoutTest = container.querySelector('#owed-to-others-section');
        expect(owedSectionForLayoutTest).toBeInTheDocument();
        if (!owedSectionForLayoutTest) throw new Error("'#owed-to-others-section' not found.");
        if (!(owedSectionForLayoutTest instanceof HTMLElement)) {
            throw new Error("owedSectionForLayoutTest is not an HTMLElement, cannot use 'within'.");
        }
        // Using queryByTestId for the placeholder within the specific section
        const owedPlaceholder = within(owedSectionForLayoutTest).queryByTestId('owed-to-others-placeholder');
        expect(owedPlaceholder).toBeInTheDocument();
        expect(owedPlaceholder).toHaveTextContent("No tasks owed to others are due today or past due."); // Check placeholder

        // All My Tasks Section
        expect(screen.getByText('All My Tasks')).toBeInTheDocument(); // Check title
        // Simulate clicking the 'All My Tasks' tab/button if it controls visibility of its placeholder
        // This depends on how the 'All My Tasks' section reveals its content/placeholder
        // For now, assuming the placeholder is directly visible or becomes visible after some interaction
        // If 'All My Tasks' is a tab that needs clicking to show content:
        const allTasksButton = screen.getByRole('button', { name: /All My Tasks/i }); // Adjust selector if needed
        fireEvent.click(allTasksButton);
        // Check for the placeholder within the 'All My Tasks' section after interaction
    describe('"Owed to Others (Due Today or Past Due)" section logic', () => {
        beforeEach(() => {
            vi.useFakeTimers();
            vi.setSystemTime(FAKE_TODAY_DATE);

            vi.clearAllMocks();
            mockUseIsMobile.mockReturnValue(false);

            mockUseTaskFiltering.mockImplementation((props) => {
                const actualTasks = props.tasks || [];
                const activeTasks = actualTasks.filter(task => !task.completed && !task.is_archived);
                const owedToOthersTasksFiltered = activeTasks.filter(task => {
                    const isOwedToOther = task.people && task.people.length > 0;
                    if (!isOwedToOther) return false;
                    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
                    const isDueTodayOrPastDate = dueDate && (isToday(dueDate) || isPast(dueDate));
                    return isDueTodayOrPastDate;
                });
                return {
                    ...mockUseTaskFilteringReturnValue,
                    activeTasks: activeTasks,
                    filteredTasks: activeTasks, 
                    filteredTasksOwedToOthers: owedToOthersTasksFiltered,
                    searchTerm: props.searchTerm || '',
                };
            });
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        const person1: Person = { id: 'p1', name: 'Person One' };

        it('displays tasks that are due today or past due and involve people', async () => {
            const owedTaskDueToday: Task = { ...baseMockTaskForDescribe, id: 'owed-due-today', title: 'Owed Task Due Today', dueDate: FAKE_TODAY_DATE, people: [person1], status: TaskStatus.PENDING };
            const owedTaskPastDue: Task = { ...baseMockTaskForDescribe, id: 'owed-past-due', title: 'Owed Task Past Due', dueDate: new Date(FAKE_TODAY_DATE.getTime() - 2 * 24 * 60 * 60 * 1000), people: [person1], status: TaskStatus.PENDING };
            const owedTaskFuture: Task = { ...baseMockTaskForDescribe, id: 'owed-future', title: 'Owed Task Future', dueDate: new Date(FAKE_TODAY_DATE.getTime() + 2 * 24 * 60 * 60 * 1000), people: [person1], status: TaskStatus.PENDING };
            const taskNotOwed: Task = { ...baseMockTaskForDescribe, id: 'not-owed', title: 'Not Owed Task Due Today', dueDate: FAKE_TODAY_DATE, people: [], status: TaskStatus.PENDING };
            const taskOwedCompleted: Task = { ...baseMockTaskForDescribe, id: 'owed-completed', title: 'Owed Task Completed Today', dueDate: FAKE_TODAY_DATE, people: [person1], completed: true, status: TaskStatus.COMPLETED };
            
            renderIndexWithTasks([owedTaskDueToday, owedTaskPastDue, owedTaskFuture, taskNotOwed, taskOwedCompleted]);

            const expandButton = screen.getByRole('button', { name: /Owed to Others/i });
            if (expandButton.getAttribute('aria-expanded') === 'false') {
                fireEvent.click(expandButton);
            }

            const owedToOthersList = screen.getByTestId('owed-to-others-task-list');
            expect(within(owedToOthersList).getByText(owedTaskDueToday.title)).toBeInTheDocument();
            expect(within(owedToOthersList).getByText(owedTaskPastDue.title)).toBeInTheDocument();
            expect(within(owedToOthersList).queryByText(owedTaskFuture.title)).not.toBeInTheDocument();
            expect(within(owedToOthersList).queryByText(taskNotOwed.title)).not.toBeInTheDocument();
            expect(within(owedToOthersList).queryByText(taskOwedCompleted.title)).not.toBeInTheDocument();
        });

        it('displays placeholder when task list is empty', () => {
            renderIndexWithTasks([]);

            const expandButton = screen.getByRole('button', { name: /Owed to Others/i });
            if (expandButton.getAttribute('aria-expanded') === 'false') {
                fireEvent.click(expandButton);
            }

            const owedToOthersList = screen.queryByTestId('owed-to-others-task-list');
            const placeholder = screen.getByTestId('owed-to-others-placeholder');

            expect(owedToOthersList).not.toBeInTheDocument();
            expect(placeholder).toBeInTheDocument();
            expect(placeholder).toHaveTextContent("No tasks owed to others are due today or past due.");
        });

        it('displays placeholder when no tasks match criteria', () => {
            const taskWithoutPeople: Task = { ...baseMockTaskForDescribe, id: 'no-people-task', title: 'Task Without People Due Today', dueDate: FAKE_TODAY_DATE, people: [], status: TaskStatus.PENDING };
            const taskFutureDate: Task = { ...baseMockTaskForDescribe, id: 'future-date-task', title: 'Task Future Date With People', dueDate: new Date(FAKE_TODAY_DATE.getTime() + 2 * 24 * 60 * 60 * 1000), people: [person1], status: TaskStatus.PENDING };
            
            renderIndexWithTasks([taskWithoutPeople, taskFutureDate]);

            const expandButton = screen.getByRole('button', { name: /Owed to Others/i });
            if (expandButton.getAttribute('aria-expanded') === 'false') {
                fireEvent.click(expandButton);
            }

            const owedToOthersList = screen.queryByTestId('owed-to-others-task-list');
            const placeholder = screen.getByTestId('owed-to-others-placeholder');

            expect(owedToOthersList).not.toBeInTheDocument();
            expect(placeholder).toBeInTheDocument();
            expect(placeholder).toHaveTextContent("No tasks owed to others are due today or past due.");
        });

        it('navigates on task click from "Owed to Others" list', async () => {
            const taskToClick: Task = { ...baseMockTaskForDescribe, id: 'task-nav-test', title: 'Click Me Owed Task', status: TaskStatus.PENDING, dueDate: FAKE_TODAY_DATE, people: [person1] };
            renderIndexWithTasks([taskToClick]);

            const expandButton = screen.getByRole('button', { name: /Owed to Others/i });
            if (expandButton.getAttribute('aria-expanded') === 'false') {
                fireEvent.click(expandButton);
            }

            const owedToOthersList = screen.getByTestId('owed-to-others-task-list');
            expect(owedToOthersList).toBeInTheDocument();

            const taskButton = within(owedToOthersList).getByTestId(`task-button-${taskToClick.id}`);
            expect(taskButton).toBeInTheDocument();

            fireEvent.click(taskButton);

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith(`/tasks/${taskToClick.id}`);
            }, { timeout: 5000 });
        });
    });
    });
});

describe('Dialog Interactions', () => {
    const renderComponent = () => {
        // Reset tasks to default for general dialog tests, or set specific if needed
        mockTaskContextData.tasks = []; // Or some default set of tasks for dialog interactions
        // mockTaskContextValue remains as the base for other non-task specific values if needed by other mocks
        return render(
            <MemoryRouter>
                <Index />
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
