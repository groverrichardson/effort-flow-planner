/// <reference types="vitest/globals" />
import {
    render,
    screen,
    fireEvent,
    within,
    waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; // Added for router context
import userEvent from '@testing-library/user-event';
// import '@testing-library/jest-dom'; // Removed, as it's in setupTests.ts
import TaskForm from './TaskForm';
import { vi } from 'vitest';
import {
    Task,
    RecurrenceFrequency,
    RecurrenceRule,
    Tag,
    Person,
    Priority,
    EffortLevel,
    TaskStatus,
    DueDateType,
} from '../types'; // Adjusted path for types
import type { Mock } from 'vitest';
import { TaskContextType } from '@/context/TaskContext'; // Import TaskContextType for mock typing
import { useTaskContext } from '@/context/TaskContext'; // Import the hook to be mocked
import { Note } from '../types'; // Import Note type for mocking

// Define mockNoteForTaskForm at the top, after imports
const mockNoteForTaskForm: Note = {
    id: 'note-linked-1',
    name: 'Linked Test Note',
    body: 'This is a linked test note body.',
    taggedTaskIds: ['task-with-linked-notes'],
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'mock-user-id',
    is_archived: false, // Add required field from Note type
};

// Mock dependencies
vi.mock('@/components/ui/use-toast', () => ({
    useToast: () => ({
        toast: vi.fn(),
    }),
}));

// Mock useTaskContext
// The actual mock implementation will be configured in the setup function for each test.
// Erroneous block removed. mockNoteForTaskForm is now defined correctly after imports.

vi.mock('@/context/TaskContext', () => ({
    useTaskContext: vi.fn(),
}));

// Simple mock declaration, we'll override specific implementations in the tests
vi.mock('@/store/noteStore');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ pathname: '/', state: {}, search: '', hash: '' }), // Added mock for useLocation
    };
});

// Define a stable object for the note store mock to return
const stableMockNoteStoreValue = {
    notes: [mockNoteForTaskForm], // Provide the mock note for TaskForm to find
    getNoteById: vi.fn((noteId: string) =>
        noteId === mockNoteForTaskForm.id ? mockNoteForTaskForm : undefined
    ),
    // TaskForm uses notes from useNoteStore and filters them by task.id via taggedTaskIds
    // So, the mock store should return notes that would be filtered correctly.
    // The current mock for 'notes: [mockNoteForTaskForm]' in useNoteStore should work if
    // TaskForm correctly filters by checking if task.id is in note.taggedTaskIds.
    // Mock other store functions if TaskForm starts using them
    addNote: vi.fn(),
    updateNote: vi.fn(),
    deleteNote: vi.fn(),
    fetchNotesByTaskId: vi.fn(),
};

vi.mock('@/store/noteStore', () => ({
    useNoteStore: vi.fn(() => stableMockNoteStoreValue),
}));

const mockAddTask = vi.fn();
const mockUpdateTask = vi.fn();
const mockDeleteTask = vi.fn();
const mockCompleteTask = vi.fn();
const mockAddTag = vi
    .fn()
    .mockResolvedValue({ id: 'new-tag', name: 'New Tag' } as Tag);
const mockUpdateTag = vi.fn();
const mockDeleteTag = vi.fn();
const mockAddPerson = vi
    .fn()
    .mockResolvedValue({ id: 'new-person', name: 'New Person' } as Person);
const mockUpdatePerson = vi.fn();
const mockDeletePerson = vi.fn();
const mockGetTodaysCompletedTasks = vi.fn().mockReturnValue([]);

let mockTasks: Task[] = [];
let mockTags: Tag[] = [];
let mockPeople: Person[] = [];
let mockRecurrenceRules: RecurrenceRule[] = []; // Added for mock recurrence rules

const mockOnSubmit = vi.fn().mockResolvedValue(undefined); // Renamed from mockOnSuccess and made async
const mockOnCancel = vi.fn();
const mockOpenCreateNoteDialogForTask = vi.fn(); // Mock for the new prop

const defaultProps = {
    onSubmit: mockOnSubmit, // Updated from onSuccess
    onCancel: mockOnCancel,
    onOpenCreateNoteDialogForTask: mockOpenCreateNoteDialogForTask, // Add to default props
};

// Helper to reset mocks and props before each test
const setup = async (
    props?: Partial<
        typeof defaultProps & {
            task?: Task;
            recurrenceRules?: RecurrenceRule[];
        }
    >,
    customMocks?: {
        noteStore?: Partial<
            ReturnType<typeof import('@/store/noteStore').useNoteStore>
        >;
    }
) => {
    vi.clearAllMocks();
    // Reset tasks, tags, people or set specific mock data for a test
    mockTasks = props?.task ? [props.task] : [];
    mockTags = [];
    mockPeople = [];
    mockRecurrenceRules = props?.recurrenceRules || []; // Initialize mock recurrence rules

    const mockContextValue: TaskContextType & {
        getTaskById: (id: string) => Task | undefined;
        getDependenciesForTask: (id: string) => Task[];
        getDependentsForTask: (id: string) => Task[];
        // getRecurrenceRuleById is part of TaskContextType and will be provided in the object below
    } = {
        tasks: mockTasks,
        tags: mockTags,
        people: mockPeople,
        recurrenceRules: mockRecurrenceRules, // Added missing recurrenceRules property
        addTask: mockAddTask,
        // updateTask: mockUpdateTask, // Removed first duplicate instance
        deleteTask: mockDeleteTask,
        completeTask: mockCompleteTask,
        addTag: mockAddTag,
        updateTask: mockUpdateTask, // Fixed: was incorrectly named updateTag - This is the one to keep
        deleteTag: mockDeleteTag,
        addPerson: mockAddPerson,
        updatePerson: mockUpdatePerson,
        deletePerson: mockDeletePerson,
        getTodaysCompletedTasks: mockGetTodaysCompletedTasks,
        loading: false,
        archiveTask: vi.fn().mockResolvedValue(undefined), // Added missing mock
        getArchivedTasks: vi.fn().mockResolvedValue([]), // Added missing mock
        // Functions TaskForm expects that might not be directly on TaskContextType
        // but are usually derived or provided by the full context implementation.
        getTaskById: (id: string) => mockTasks.find((t) => t.id === id),
        getRecurrenceRuleById: (id: string) =>
            mockRecurrenceRules.find((r) => r.id === id),
        getDependenciesForTask: (taskId: string) => {
            const currentTask = mockTasks.find((t) => t.id === taskId);
            return currentTask
                ? (currentTask.dependencies
                      .map((depId) => mockTasks.find((t) => t.id === depId))
                      .filter(Boolean) as Task[])
                : [];
        },
        getDependentsForTask: (taskId: string) => {
            return mockTasks.filter((t) => t.dependencies.includes(taskId));
        },
        // Add other methods from TaskContextType as vi.fn() if not covered by global mocks
        // e.g., if TaskContextType defines specific add/update/delete for recurrence rules:
        // addRecurrenceRule: vi.fn(),
        // updateRecurrenceRule: vi.fn(),
    };

    (useTaskContext as Mock).mockReturnValue(mockContextValue);

    // Create a real mock for useNoteStore with all needed functions
    const mockFetchNotes = vi.fn().mockResolvedValue([]);
    const defaultNoteStore = {
        notes: [],
        fetchNotes: mockFetchNotes,
        fetchNotesForTask: vi.fn().mockResolvedValue([]),
        getNoteById: vi.fn(),
        addNote: vi.fn(),
        updateNote: vi.fn(),
        deleteNote: vi.fn(),
        fetchNotesByTaskId: vi.fn().mockResolvedValue([]),
        linkNoteToTask: vi.fn().mockResolvedValue(true),
        unlinkNoteFromTask: vi.fn().mockResolvedValue(true),
    };

    // Merge in any custom mocks
    const mockNoteStore = {
        ...defaultNoteStore,
        ...(customMocks?.noteStore || {}),
    };

    // Import and mock the useNoteStore directly
    const noteStoreModule = await import('@/store/noteStore');
    vi.spyOn(noteStoreModule, 'useNoteStore').mockImplementation(
        () => mockNoteStore
    );

    return render(
        <MemoryRouter>
            <TaskForm {...defaultProps} {...props} />
        </MemoryRouter>
    );
};

describe('TaskForm', () => {
    it('renders correctly for a new task', async () => {
        await setup();
        expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
        // Assuming the submit button for new task has a unique ID or accessible name
        expect(
            screen.getByRole('button', { name: /create task/i })
        ).toBeInTheDocument();
    });

    it('renders correctly when editing an existing task', async () => {
        const mockTask: Task = {
            id: 'task-1',
            title: 'Existing Task Title',
            description: 'Existing task description.',
            priority: Priority.NORMAL,
            dueDate: null,
            dueDateType: DueDateType.ON,
            targetDeadline: null,
            goLiveDate: null,
            effortLevel: 1,
            status: TaskStatus.PENDING,
            scheduledDate: null,
            userId: 'test-user-id',
            completed: false,
            completedDate: null,
            tags: [],
            people: [],
            dependencies: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        mockTasks = [mockTask]; // Make sure the task store can find this task if needed by TaskForm
        await setup({ task: mockTask });
        expect(
            screen.getByDisplayValue('Existing Task Title')
        ).toBeInTheDocument();
        // Assuming the submit button for editing task has a unique ID or accessible name
        expect(
            screen.getByRole('button', { name: /update task/i })
        ).toBeInTheDocument();
    });

    describe('Recurrence UI', () => {
        const mockTaskWithRecurrenceBase: Omit<
            Task,
            'recurrenceRule' | 'id' | 'title'
        > = {
            priority: Priority.NORMAL,
            effortLevel: EffortLevel.M,
            status: TaskStatus.PENDING,
            userId: 'test-user-id',
            targetDeadline: null,
            goLiveDate: null,
            completed: false,
            dueDate: null,
            dueDateType: DueDateType.NONE,
            scheduledDate: null,
            completedDate: null,
            description: 'A recurring task description.',
            people: [],
            tags: [],
            dependencies: [],
            is_archived: false,
            createdAt: new Date('2023-01-01T10:00:00Z'),
            updatedAt: new Date('2023-01-01T10:00:00Z'),
        };
        it('does not show specific recurrence detail inputs when "Repeats" is "Never" (default)', async () => {
            await setup();
            // Check for elements that should NOT be there
            expect(screen.queryByLabelText(/every/i)).not.toBeInTheDocument(); // For "Every X days/weeks/months/years"
            expect(
                screen.queryByRole('button', { name: /mon/i })
            ).not.toBeInTheDocument(); // Example weekly day button
            // Using unique IDs provided in TaskForm.tsx
            expect(
                screen.queryByTestId('recurrence-daily-interval-input')
            ).not.toBeInTheDocument();
            expect(
                screen.queryByTestId('recurrence-weekly-interval-input')
            ).not.toBeInTheDocument();
            expect(
                screen.queryByTestId('recurrence-monthly-interval-input')
            ).not.toBeInTheDocument();
            expect(
                screen.queryByTestId('recurrence-yearly-interval-input')
            ).not.toBeInTheDocument();
            expect(
                screen.queryByTestId('recurrence-monthly-day-select-trigger')
            ).not.toBeInTheDocument();
            expect(
                screen.queryByTestId('recurrence-yearly-month-select-trigger')
            ).not.toBeInTheDocument();
            expect(
                screen.queryByTestId('recurrence-yearly-day-select-trigger')
            ).not.toBeInTheDocument();
            expect(
                screen.queryByTestId('ends-condition-type-select-trigger')
            ).not.toBeInTheDocument(); // End condition section should also be hidden
        });

        it('shows daily recurrence options and hides others when "Repeats" is changed to "Daily"', async () => {
            const user = userEvent.setup();
            await setup();

            // Open the "Repeats" select dropdown
            const repeatsSelectTrigger = screen.getByTestId(
                'recurrence-frequency-select-trigger'
            );
            await user.click(repeatsSelectTrigger);

            // Wait for the options container (listbox) to appear
            const listbox = await screen.findByRole('listbox');

            // Find the "Daily" option by its data-testid
            // getByTestId is synchronous, it assumes the element is already there.
            // Since we awaited the listbox, the items should be rendered.
            const dailyOption = await screen.findByTestId('select-item-daily');
            await user.click(dailyOption);

            // Check that Daily options are visible
            await waitFor(async () => {
                expect(
                    screen.getByTestId('recurrence-interval-input')
                ).toBeInTheDocument();
            });
            expect(screen.getByLabelText(/every/i)).toBeInTheDocument(); // "Every X days"
            expect(
                screen.getByTestId('recurrence-interval-input').closest('div')
                    ?.textContent
            ).toMatch(/days?/);

            // Check that other frequency-specific options are NOT visible
            expect(
                screen.queryByTestId('recurrence-weekly-interval-input')
            ).not.toBeInTheDocument();
            expect(
                screen.queryByRole('button', { name: /mon/i })
            ).not.toBeInTheDocument();
            expect(
                screen.queryByTestId('recurrence-monthly-interval-input')
            ).not.toBeInTheDocument();
            expect(
                screen.queryByTestId('recurrence-yearly-interval-input')
            ).not.toBeInTheDocument();

            // End condition section should now be visible
            expect(
                screen.getByTestId('ends-condition-type-select-trigger')
            ).toBeInTheDocument();
        });

        it('hides "Repeat only after completion" checkbox when "Repeats" is "Never"', async () => {
            await setup();
            expect(
                screen.queryByTestId('repeat-only-on-completion-checkbox')
            ).not.toBeInTheDocument();
        });

        it('shows "Repeat only after completion" checkbox when a recurrence frequency is selected', async () => {
            const user = userEvent.setup();
            await setup();

            const repeatsSelectTrigger = screen.getByTestId(
                'recurrence-frequency-select-trigger'
            );
            await user.click(repeatsSelectTrigger);
            const dailyOption = await screen.findByTestId('select-item-daily');
            await user.click(dailyOption);

            expect(
                await screen.findByTestId('repeat-only-on-completion-checkbox')
            ).toBeInTheDocument();
        });

        it('toggles "Repeat only after completion" checkbox state on click', async () => {
            const user = userEvent.setup();
            await setup();

            const repeatsSelectTrigger = screen.getByTestId(
                'recurrence-frequency-select-trigger'
            );
            await user.click(repeatsSelectTrigger);
            const dailyOption = await screen.findByTestId('select-item-daily');
            await user.click(dailyOption);

            const checkbox = await screen.findByTestId(
                'repeat-only-on-completion-checkbox'
            );
            expect(checkbox).not.toBeChecked();

            await user.click(checkbox);
            expect(checkbox).toBeChecked();

            await user.click(checkbox);
            expect(checkbox).not.toBeChecked();
        });

        it('initializes "Repeat only after completion" checkbox as checked when editing task with repeatOnlyOnCompletion true', async () => {
            const mockRuleTrue: RecurrenceRule = {
                id: 'roc-rule-true',
                frequency: RecurrenceFrequency.DAILY, // Using the enum
                interval: 1, // Added interval as it's usually part of RecurrenceRule
                repeatOnlyOnCompletion: true,
            };
            const taskToUse: Task = {
                ...mockTaskWithRecurrenceBase,
                id: 'task-recur-roc-true',
                title: 'Recurring ROC True Task',
                recurrenceRule: mockRuleTrue,
            };
            await setup({ task: taskToUse, recurrenceRules: [mockRuleTrue] });

            expect(
                await screen.findByTestId('repeat-only-on-completion-checkbox')
            ).toBeInTheDocument();
            await waitFor(() => {
                expect(
                    screen.getByTestId('repeat-only-on-completion-checkbox')
                ).toBeChecked();
            });
        });

        it('initializes "Repeat only after completion" checkbox as unchecked when editing task with repeatOnlyOnCompletion false', async () => {
            const mockRuleFalse: RecurrenceRule = {
                id: 'roc-rule-false',
                frequency: RecurrenceFrequency.WEEKLY, // Using enum
                interval: 1, // Added interval
                repeatOnlyOnCompletion: false,
            };
            const taskToUse: Task = {
                ...mockTaskWithRecurrenceBase,
                id: 'task-recur-roc-false',
                title: 'Recurring ROC False Task',
                recurrenceRule: mockRuleFalse,
            };
            await setup({ task: taskToUse, recurrenceRules: [mockRuleFalse] });

            expect(
                await screen.findByTestId('repeat-only-on-completion-checkbox')
            ).toBeInTheDocument();
            expect(
                screen.getByTestId('repeat-only-on-completion-checkbox')
            ).not.toBeChecked();
        });

        // TODO: Add similar tests for Weekly, Monthly, Yearly, and switching back to Never.
        // TODO: Add tests for state updates based on interactions.
        // TODO: Add tests for handleSubmit logic regarding recurrence.
    });

    describe('Linked Notes Section', () => {
        it('navigates to the correct note edit page when "Edit Note" button is clicked', async () => {
            const user = userEvent.setup();

            const mockTaskWithNotes: Task = {
                id: 'task-with-linked-notes', // Matches mockNoteForTaskForm.taggedTaskIds
                title: 'Task with Linked Notes',
                description:
                    'This task has linked notes displayed in TaskForm.',
                priority: Priority.NORMAL,
                dueDate: null,
                dueDateType: DueDateType.ON,
                targetDeadline: null,
                goLiveDate: null,
                effortLevel: 1,
                status: TaskStatus.PENDING,
                scheduledDate: null,
                userId: 'test-user-id',
                completed: false,
                completedDate: null,
                tags: [],
                people: [],
                dependencies: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                // TaskForm gets notes from useNoteStore, not directly from task.notes prop
            };

            // Create custom note store mock that returns our mockNoteForTaskForm
            const customNoteStoreMock = {
                notes: [mockNoteForTaskForm],
                fetchNotesForTask: vi.fn().mockImplementation((taskId) => {
                    return Promise.resolve(
                        taskId === 'task-with-linked-notes'
                            ? [mockNoteForTaskForm]
                            : []
                    );
                }),
                getNoteById: vi.fn().mockImplementation((id) => {
                    return id === mockNoteForTaskForm.id
                        ? mockNoteForTaskForm
                        : null;
                }),
                fetchNotesByTaskId: vi.fn().mockImplementation((taskId) => {
                    return Promise.resolve(
                        taskId === 'task-with-linked-notes'
                            ? [mockNoteForTaskForm]
                            : []
                    );
                }),
            };

            await setup(
                { task: mockTaskWithNotes },
                { noteStore: customNoteStoreMock }
            );

            // Wait for the note and its edit button to appear
            const editNoteButton = await screen.findByRole('button', {
                name: /Edit/i,
            });
            expect(editNoteButton).toBeInTheDocument();

            await user.click(editNoteButton);

            expect(mockNavigate).toHaveBeenCalledWith(
                `/notes/${mockNoteForTaskForm.id}`,
                {
                    state: {
                        from: '/',
                        fromTaskForm: true,
                        taskIdForNote: mockTaskWithNotes.id,
                    },
                }
            );
        });

        it('navigates to the new note page for the current task when "Add Note" button is clicked', async () => {
            const user = userEvent.setup();
            const mockTask: Task = {
                id: 'task-for-new-note',
                title: 'Task for New Note',
                description: '',
                priority: Priority.NORMAL,
                dueDate: null,
                dueDateType: DueDateType.ON,
                targetDeadline: null,
                goLiveDate: null,
                effortLevel: 1,
                status: TaskStatus.PENDING,
                scheduledDate: null,
                userId: 'test-user-id',
                completed: false,
                completedDate: null,
                tags: [],
                people: [],
                dependencies: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await setup({ task: mockTask }); // Render TaskForm with this task

            // Button has ID 'task-form-create-link-note-button' and text "Create & Link New Note"
            const addNoteButton = screen.getByRole('button', {
                name: /Create & Link New Note/i,
            });
            // Or more specifically: const addNoteButton = screen.getByTestId('task-form-create-link-note-button');
            expect(addNoteButton).toBeInTheDocument();

            await user.click(addNoteButton);

            expect(mockOpenCreateNoteDialogForTask).toHaveBeenCalledWith(
                mockTask.id
            );
        });
    });
});
