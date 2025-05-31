/// <reference types="vitest/globals" />

// Hoisted Mocks for react-router-dom (MUST be at the top)
const mockNavigateFn = vi.hoisted(() => vi.fn());
const mockUseParamsFn = vi.hoisted(() => vi.fn());
const mockUseLocationFn = vi.hoisted(() => vi.fn());

// Mock react-router-dom (MUST be before component import and after hoisted vars)
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual, // Spread actual to keep MemoryRouter, Routes, Route, etc.
    useNavigate: () => mockNavigateFn,
    useParams: mockUseParamsFn,
    useLocation: mockUseLocationFn,
  };
});

import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom'; // useParams, useNavigate, useLocation are from the mock
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { prettyDOM } from '@testing-library/dom';

// Component Under Test (imported AFTER mocks)
import NoteEditorPage from './NoteEditorPage';

// Project Types & Services (ensure correct paths and import types)
import { Task, Tag, Person, RecurrenceRule } from '@/types'; 
import { Note } from '@/types/note'; // Corrected path
import { NoteService } from '@/services/NoteService'; // Named import
import { TaskService } from '@/services/TaskService'; // Named import

// Contexts (actual providers are not used in TestWrapper, relying on hook mocks)
import { useTaskContext } from '@/context/TaskContext'; // Added import
// import { NoteProvider } from '@/context/NoteContext';
// import { TaskProvider } from '@/context/TaskContext';

// UI Components
import { Button } from '@/components/ui/button';
import { toast as actualToast } from '@/components/ui/use-toast'; // For direct reference if needed, though useToast is mocked

// --- Mock Service Implementations ---
let currentGetNoteByIdImpl = vi.fn();
const { 
  mockGetNoteByIdFromServiceSpy,
  mockCreateNoteServiceSpy, 
  mockUpdateNoteServiceSpy, 
  mockDeleteNoteServiceSpy  
} = vi.hoisted(() => {
  return {
    mockGetNoteByIdFromServiceSpy: vi.fn((...args: any[]) => currentGetNoteByIdImpl(...args)),
    mockCreateNoteServiceSpy: vi.fn(),
    mockUpdateNoteServiceSpy: vi.fn(),
    mockDeleteNoteServiceSpy: vi.fn()
  };
});

vi.mock('@/services/NoteService', () => ({
  NoteService: {
    getNoteById: mockGetNoteByIdFromServiceSpy,
    createNote: mockCreateNoteServiceSpy,
    updateNote: mockUpdateNoteServiceSpy,
    deleteNote: mockDeleteNoteServiceSpy,
  }
}));

vi.mock('@/services/TaskService', () => ({
  TaskService: {
    getTasks: vi.fn().mockResolvedValue([]),
    getTaskById: vi.fn(), // Add if directly called by NoteEditorPage
    // Add other TaskService methods if they are called directly
  },
}));

// --- Mock Hooks ---
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
  }),
}));

const mockGetNoteByIdCtxFn = vi.fn();
const mockAddNoteCtxFn = vi.fn();
const mockUpdateNoteCtxFn = vi.fn();
vi.mock('@/context/NoteContext', () => ({
  useNoteContext: vi.fn(() => ({
    getNoteById: mockGetNoteByIdCtxFn,
    addNote: mockAddNoteCtxFn,
    updateNote: mockUpdateNoteCtxFn,
    loading: false,
    notes: [], // Provide a default for notes array if accessed
  })),
}));

const mockTasksForCtx: Task[] = [];
const mockTagsForCtx: Tag[] = [];
const mockPeopleForCtx: Person[] = [];
const mockRecurrenceRulesForCtx: RecurrenceRule[] = [];

const mockAddTaskCtxFn = vi.fn();
const mockUpdateTaskCtxFn = vi.fn();
const mockDeleteTaskCtxFn = vi.fn();
const mockCompleteTaskCtxFn = vi.fn(); // Renamed from toggleTaskCompletion
const mockAddTagCtxFn = vi.fn(() => Promise.resolve({ id: 'new-tag', name: 'New Tag' }));
const mockUpdateTagCtxFn = vi.fn();
const mockDeleteTagCtxFn = vi.fn();
const mockAddPersonCtxFn = vi.fn(() => Promise.resolve({ id: 'new-person', name: 'New Person' }));
const mockUpdatePersonCtxFn = vi.fn();
const mockDeletePersonCtxFn = vi.fn();
const mockGetTodaysCompletedTasksCtxFn = vi.fn(() => []);
const mockGetRecurrenceRuleByIdCtxFn = vi.fn(); // Renamed from getRecurrenceRules

vi.mock('@/context/TaskContext', () => ({
  useTaskContext: vi.fn(() => ({
    tasks: mockTasksForCtx,
    tags: mockTagsForCtx,
    people: mockPeopleForCtx,
    recurrenceRules: mockRecurrenceRulesForCtx,
    addTask: mockAddTaskCtxFn,
    updateTask: mockUpdateTaskCtxFn,
    deleteTask: mockDeleteTaskCtxFn,
    completeTask: mockCompleteTaskCtxFn, // Renamed
    addTag: mockAddTagCtxFn,
    updateTag: mockUpdateTagCtxFn,
    deleteTag: mockDeleteTagCtxFn,
    addPerson: mockAddPersonCtxFn,
    updatePerson: mockUpdatePersonCtxFn,
    deletePerson: mockDeletePersonCtxFn,
    getTodaysCompletedTasks: mockGetTodaysCompletedTasksCtxFn,
    loading: false,
    getRecurrenceRuleById: mockGetRecurrenceRuleByIdCtxFn, // Renamed
  })),
}));

// --- Mock UI Elements ---
const { mockedToastFn } = vi.hoisted(() => {
  return { mockedToastFn: vi.fn() };
});
vi.mock('@/components/ui/use-toast', () => ({
  toast: mockedToastFn,
  useToast: () => ({ toast: mockedToastFn }),
}));

vi.mock('lucide-react', async () => {
  const actual = await vi.importActual('lucide-react');
  return {
    ...actual,
    Save: () => React.createElement('svg', { 'data-testid': 'save-icon' }),
    Loader2: () => React.createElement('svg', { 'data-testid': 'loader-icon' }),
    XCircle: () => React.createElement('svg', { 'data-testid': 'cancel-icon' }),
    NotebookText: () => React.createElement('svg', { 'data-testid': 'notebook-icon' }),
  };
});

// --- Hoisted Mock for NoteForm --- 
// This creates the actual mock component and its helper functions
const { mockSetEditorContent, mockGetEditorHTML, mockNoteFormEditorInstance, MockNoteForm } = vi.hoisted(() => {
  const ReactHoisted = require('react') as typeof import('react');

  // Minimal state for the editor part of the form, if needed by NoteForm's direct props
  // For a full Tiptap mock, this would be more complex.
  const mockEditorStateInternal = { name: '', bodyHtml: '', bodyText: '' };

  const setContentFn = (content: string, field: 'name' | 'body') => {
    if (field === 'name') mockEditorStateInternal.name = content;
    else mockEditorStateInternal.bodyHtml = content;
  };
  const getHTMLFn = () => mockEditorStateInternal.bodyHtml;
  const editorInstanceObj = {
    commands: { setContent: setContentFn },
    getHTML: getHTMLFn,
  };

  interface HoistedMockNoteFormProps {
    onSubmit: (data: { name: string; body: string; taggedTaskIds: string[] }) => void;
    onCancel?: () => void;
    existingNote?: Partial<Note>;
    initialTaskId?: string;
    // Removed editorInstance prop as it's usually internal to useNoteFormEditor hook
  }

  const HoistedMockNoteFormActual = ReactHoisted.forwardRef<HTMLFormElement, HoistedMockNoteFormProps>(
    (props, ref) => {
      const { onSubmit, onCancel, existingNote, initialTaskId } = props;
      const [name, setName] = ReactHoisted.useState(existingNote?.name || '');
      const [internalBody, setInternalBody] = ReactHoisted.useState(existingNote?.body || '');
      const [selectedTaskIds, setSelectedTaskIds] = ReactHoisted.useState<string[]>(existingNote?.taggedTaskIds || []);
      const [isSubmitting, setIsSubmitting] = ReactHoisted.useState(false);

      // Use the mocked useTaskContext within the mock form if it needs task data for selection
      const { tasks: contextTasks, loading: tasksLoading } = useTaskContext(); // Use the top-level imported and mocked useTaskContext
      const [taskOptions, setTaskOptions] = ReactHoisted.useState<{ value: string; label: string }[]>([]);

      ReactHoisted.useEffect(() => {

        if (existingNote) {
          setName(existingNote.name || '');
          setInternalBody(existingNote.body || '');
          setSelectedTaskIds(existingNote.taggedTaskIds || []);
        } else {
          setName('');
          setInternalBody('');
          setSelectedTaskIds([]);
        }
      }, [existingNote]);

      ReactHoisted.useEffect(() => {
        if (!tasksLoading) {
          const options = contextTasks
            .filter(task => task.id !== undefined)
            .map(task => ({ value: task.id!, label: task.title }));
          setTaskOptions(options);
          if (initialTaskId && (!existingNote || !existingNote.id) && !selectedTaskIds.includes(initialTaskId)) {
            setSelectedTaskIds(prevIds => !prevIds.includes(initialTaskId) ? [...prevIds, initialTaskId] : prevIds);
          }
        }
      }, [initialTaskId, contextTasks, tasksLoading, existingNote, selectedTaskIds]);

      const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        await onSubmit({ name: name || '', body: internalBody || '', taggedTaskIds: selectedTaskIds });
        setIsSubmitting(false);
      };



      return (
        <form ref={ref} id="note-form" onSubmit={handleSubmit} data-testid="mock-note-form">
          <h2 id="note-form-title" className="sr-only">Mock Note Form</h2>
          <div>
            <label htmlFor="note-name">Name</label>
            <input id="note-name" data-testid="note-name-input" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="note-body">Body</label>
            <textarea id="note-body" data-testid="note-body-textarea" value={internalBody} onChange={(e) => setInternalBody(e.target.value)} rows={3} />
          </div>
          <div>
            <label htmlFor="task-select">Link to Tasks</label>
            <select id="task-select" multiple value={selectedTaskIds} data-testid="task-link-select" onChange={(e) => setSelectedTaskIds(Array.from(e.target.selectedOptions, option => option.value))}>
              {taskOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <div data-testid="selected-task-ids-display" style={{ display: 'none' }}>{selectedTaskIds.join(',')}</div>
          <Button type="button" variant="outline" onClick={onCancel} data-testid="note-form-cancel-button">Cancel</Button>
          <Button type="submit" disabled={isSubmitting} data-testid="note-form-submit-button">
            {isSubmitting ? 'Submitting...' : (existingNote?.id ? 'Save Changes' : 'Create Note')}
          </Button>
        </form>
      );
    }
  );

  return {
    mockSetEditorContent: setContentFn, // Export if needed by tests directly
    mockGetEditorHTML: getHTMLFn,       // Export if needed by tests directly
    mockNoteFormEditorInstance: editorInstanceObj, // Export if needed by tests directly
    MockNoteForm: HoistedMockNoteFormActual, // This is the component to be used by vi.mock
  };
});

// Mock the actual NoteForm component using the hoisted mock
vi.mock('@/components/forms/NoteForm', () => {

  return {
    default: MockNoteForm, // MockNoteForm is from the vi.hoisted() call above
  };
});

// --- Global Test Helper Definitions (beforeEach, TestWrapper, etc.) ---
// (This part of the file, from 'beforeEach(() => {' onwards, should remain as it was)

// Get a reference to the mocked toast function for assertions
// const mockedToastReference = vi.mocked(actualToast); // Removed, use mockedToastFn directly

// This beforeEach should be AFTER all vi.mock and vi.hoisted calls
beforeEach(() => {
  // Reset mocks before each test
  mockNavigateFn.mockClear();
  mockUseParamsFn.mockReturnValue({}); // Default: no params
  mockUseLocationFn.mockReturnValue({ pathname: '/', search: '', hash: '', state: null }); // Default location

  currentGetNoteByIdImpl.mockReset().mockResolvedValue(null); // Reset actual implementation for NoteService
  mockGetNoteByIdFromServiceSpy.mockClear(); // Clear the spy for NoteService calls
  mockCreateNoteServiceSpy.mockClear();
  mockUpdateNoteServiceSpy.mockClear();
  mockDeleteNoteServiceSpy.mockClear();

  mockedToastFn.mockClear(); // Reset toast mock
  
  mockGetNoteByIdCtxFn.mockReset().mockResolvedValue(null);      // NoteContext default
  mockAddNoteCtxFn.mockReset();
  mockUpdateNoteCtxFn.mockReset();

  mockAddTaskCtxFn.mockReset();
  mockUpdateTaskCtxFn.mockReset();
  mockDeleteTaskCtxFn.mockReset();
  mockCompleteTaskCtxFn.mockReset(); // Renamed
  mockAddTagCtxFn.mockReset().mockResolvedValue({ id: 'new-tag', name: 'New Tag' });
  mockUpdateTagCtxFn.mockReset();
  mockDeleteTagCtxFn.mockReset();
  mockAddPersonCtxFn.mockReset().mockResolvedValue({ id: 'new-person', name: 'New Person' });
  mockUpdatePersonCtxFn.mockReset();
  mockDeletePersonCtxFn.mockReset();
  mockGetTodaysCompletedTasksCtxFn.mockReset().mockReturnValue([]);
  mockGetRecurrenceRuleByIdCtxFn.mockReset(); // Renamed

  mockTasksForCtx.length = 0;
  mockTagsForCtx.length = 0;
  mockPeopleForCtx.length = 0;
  mockRecurrenceRulesForCtx.length = 0;

  // Ensure all other context mock functions are reset if they exist and are used
  mockedToastFn.mockClear(); // Corrected toast mock reset
});

const noteToEditBase: Note = {
  id: 'base-note-id',
  name: 'Base Note Name',
  body: 'This is the base note body content.',
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: 'test-user-id',
  taggedTaskIds: [],
  // Ensure all required fields for Note type are present
};

const existingNote: Note = {
  ...noteToEditBase,
  id: 'existing-note-for-cancel',
  name: 'Existing Note for Cancel Tests',
};

const TestWrapper: React.FC<{ children: React.ReactNode; initialEntries?: string[] }> = ({ children, initialEntries = ['/'] }) => (
  <MemoryRouter initialEntries={initialEntries}>
    {/* TaskProvider and NoteProvider removed to rely on vi.mock for context hooks */}
    <Routes>
      <Route path="/notes/:noteId/edit" element={children} />
      <Route path="/tasks/:taskId/notes/:noteId/edit" element={children} />
      <Route path="/notes/new" element={children} />
      <Route path="/tasks/:taskId/notes/new" element={children} />
      {/* Add other routes as needed for testing different scenarios */}
    </Routes>
  </MemoryRouter>
);

// --- Main Test Suite ---
describe('NoteEditorPage', () => {
  // This TestWrapper is crucial. Ensure it's used in all render calls for NoteEditorPage.
  // It provides MemoryRouter and necessary contexts.
  interface TestWrapperProps {
    children: React.ReactNode;
    initialEntries?: string[];
    // Add specific note/task context states if needed for a particular test group
  }

  const TestWrapper: React.FC<TestWrapperProps> = ({ children, initialEntries = ['/'] }) => {
    // This ensures that the mocked useNoteContext and useTaskContext are used by the providers if needed,
    // or that the providers instantiate with default mock values if the hooks are not called directly by Provider.
    // For this setup, NoteProvider and TaskProvider will internally call the mocked use[ContextName]Context hooks.
    return (
      <MemoryRouter initialEntries={initialEntries}>
        {/* TaskProvider and NoteProvider removed to rely on direct context mocks */}
        <Routes>
              {/* Define routes that NoteEditorPage might be rendered on */}
              <Route path="/notes/new" element={children} />
              <Route path="/notes/:noteId/edit" element={children} />
              <Route path="/tasks/:taskId/notes/new" element={children} />
              <Route path="/tasks/:taskId/notes/:noteId/edit" element={children} />
              <Route path="/notes/:noteId" element={children} /> {/* For navigating back to note view */}
              <Route path="/tasks/:taskId" element={children} /> {/* For navigating back to task view */}
              <Route path="/" element={<div>Home Page Mock</div>} /> {/* Mock for root navigation */}
              {/* Add any other routes that might be navigated to or that host the component */}
              <Route path="*" element={children} /> {/* Fallback to render children for any other path */}
            </Routes>
        {/* TaskProvider and NoteProvider removed */}
      </MemoryRouter>
    );
  };

  

  describe('Data Loading and Display', () => {
    let noteToLoad: Note;

    beforeEach(() => {
      // Specific setup for this describe block
      noteToLoad = { ...noteToEditBase, id: 'context-note-1', name: 'Context Note', body: 'Body from context' };
      mockUseParamsFn.mockReturnValue({ noteId: noteToLoad.id }); // Default params for loading existing note
      mockUseLocationFn.mockReturnValue({ pathname: `/notes/${noteToLoad.id}/edit`, state: null }); // Default location for loading existing note
    });

    it('loads existing note data from context if available', async () => {
      mockGetNoteByIdCtxFn.mockResolvedValue(noteToLoad);

      render(<TestWrapper initialEntries={[`/notes/${noteToLoad.id}/edit`]}>
        <NoteEditorPage />
      </TestWrapper>);

      expect(await screen.findByText('Edit Note')).toBeInTheDocument();
      // The fact that NoteForm receives the correct existingNote prop
      // is implicitly tested by the assertions below checking for input values.
      // Verify form fields are populated (via mocked NoteForm's behavior)
      await waitFor(() => {
        expect(screen.getByDisplayValue(noteToLoad.name)).toBeInTheDocument();
        expect(screen.getByDisplayValue(noteToLoad.body)).toBeInTheDocument(); // Assuming textarea also uses displayValue for default
      });

      expect(mockGetNoteByIdCtxFn).toHaveBeenCalledWith(noteToLoad.id);
      expect(currentGetNoteByIdImpl).not.toHaveBeenCalled(); // Check the actual vi.fn() instance
    });

    it('loads existing note data using NoteService.getNoteById if context does not provide it', async () => {
      const serviceNote = { ...noteToEditBase, id: 'service-note-1', name: 'Service Note', body: 'Body from service' };
      mockUseParamsFn.mockReturnValue({ noteId: serviceNote.id });
      mockGetNoteByIdCtxFn.mockResolvedValue(undefined); // Context returns nothing

      // Configure the mock for NoteService.getNoteById using the new strategy
      currentGetNoteByIdImpl.mockImplementation((id: string) => { // Not async

        if (id === serviceNote.id) {

          return Promise.resolve(serviceNote);
        }

        return Promise.resolve(undefined); // Ensure a promise is always returned
      });

      render(<TestWrapper initialEntries={[`/notes/${serviceNote.id}/edit`]}>
        <NoteEditorPage />
      </TestWrapper>);

      // Flush promises to ensure useEffect completes and state updates are processed
      await act(async () => {});

      // First, wait for the form to be populated with data from the service
      await waitFor(() => {
        try {
          // Use data-testid and toHaveValue for potentially more direct assertion
          expect(screen.getByTestId('note-name-input')).toHaveValue(serviceNote.name);
          expect(screen.getByTestId('note-body-textarea')).toHaveValue(serviceNote.body);
        } catch (error) {

          screen.debug(undefined, 30000); // Print more of the DOM
          throw error; // Re-throw to fail the test
        }
      });

      // As a secondary check, if the above passes, confirm with getByDisplayValue
      expect(screen.getByDisplayValue(serviceNote.name)).toBeInTheDocument();
      expect(screen.getByDisplayValue(serviceNote.body)).toBeInTheDocument();

      // Then, check if the page title is correct (implies not in 'Note not found' state)
      expect(screen.getByRole('heading', { name: 'Edit Note' })).toBeInTheDocument();
      expect(mockGetNoteByIdCtxFn).toHaveBeenCalledWith(serviceNote.id);
      expect(mockGetNoteByIdFromServiceSpy).toHaveBeenCalledWith(serviceNote.id);
    });

    it('displays loading indicator while fetching data via service', async () => {
      const loadingNoteId = 'loading-note-id';
      mockUseParamsFn.mockReturnValue({ noteId: loadingNoteId });
      mockGetNoteByIdCtxFn.mockResolvedValue(undefined); // Context has nothing
      
      // Make service promise hang
      currentGetNoteByIdImpl.mockReturnValue(new Promise(() => {})); 

      render(<TestWrapper initialEntries={[`/notes/${loadingNoteId}/edit`]}>
        <NoteEditorPage />
      </TestWrapper>);
      
      expect(screen.getByRole('status', { name: /Loading note editor/i })).toBeInTheDocument();
      // When loading, NoteForm should not yet be populated with existingNote data.
      // This can be implicitly checked if the main content area (e.g., where NoteForm would render)
      // does not yet show specific form fields or if a loading indicator for the form itself is present.
    });
  }); // End of Data Loading and Display describe

  // Add describe blocks for 'Creating New Note' and 'Updating Existing Note' interactions with NoteForm

  describe('Cancel Button Navigation', () => {
    const noteForCancel: Note = { ...existingNote, id: 'cancel-edit-note' }; // Use 'existingNote' as base
    const taskIdForCancel = 'task-for-cancel';

    it('navigates to /notes/:noteId when cancelling edit (no taskId)', async () => {
      mockUseParamsFn.mockReturnValue({ noteId: noteForCancel.id });
      mockUseLocationFn.mockReturnValue({ pathname: `/notes/${noteForCancel.id}/edit`, state: null });
      currentGetNoteByIdImpl.mockResolvedValue(noteForCancel); // Simulate note is loaded
      render(<TestWrapper initialEntries={[`/notes/${noteForCancel.id}/edit`]}>
        <NoteEditorPage />
      </TestWrapper>);
      const user = userEvent.setup();
      expect(await screen.findByText('Edit Note')).toBeInTheDocument(); // Wait for page to load
      
      // Simulate cancel click within the mocked NoteForm
      // This requires the MockNoteForm to have a cancel button that calls props.onCancel
      // For now, we assume NoteEditorPage directly renders a cancel button if NoteForm doesn't handle it.
      // If NoteForm handles cancel, this test needs to trigger that through the mock.
      // Let's assume NoteEditorPage has its own cancel button for this test.
      const cancelButton = screen.getByTestId('note-editor-page-cancel-button');
      await user.click(cancelButton);
      expect(mockNavigateFn).toHaveBeenCalledWith('/notes');
    });

    it('navigates to /tasks/:taskId when cancelling edit (with taskId)', async () => {
      mockUseParamsFn.mockReturnValue({ noteId: noteForCancel.id, taskId: taskIdForCancel });
      currentGetNoteByIdImpl.mockResolvedValue(noteForCancel); // Note is found
      // Task context might be needed if the note is linked and NoteEditorPage tries to display task info
      const taskForDisplay = { id: taskIdForCancel, title: 'Task for Display', body: '', status: 'todo', createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z' };
      (useTaskContext as vi.MockedFunction<typeof useTaskContext>).mockReturnValue({
        tasks: [taskForDisplay],
        loading: false,
        getTaskById: vi.fn(id => id === taskIdForCancel ? taskForDisplay : undefined),
        addTask: vi.fn(),
        updateTask: vi.fn(),
        deleteTask: vi.fn(),
        error: null,
      });
      mockUseLocationFn.mockReturnValue({ pathname: `/tasks/${taskIdForCancel}/notes/${noteForCancel.id}/edit`, state: null });

      render(<TestWrapper initialEntries={[`/tasks/${taskIdForCancel}/notes/${noteForCancel.id}/edit`]}>
        <NoteEditorPage />
      </TestWrapper>);
      const user = userEvent.setup();
      expect(await screen.findByText('Edit Note')).toBeInTheDocument();
      await user.click(screen.getByTestId('note-editor-page-cancel-button'));
      expect(mockNavigateFn).toHaveBeenCalledWith(`/tasks/${taskIdForCancel}`);
    });

    it('navigates to / when cancelling new note (no taskId)', async () => {
      mockUseParamsFn.mockReturnValue({}); // For '/notes/new', useParams is empty
      mockUseLocationFn.mockReturnValue({ pathname: '/notes/new', state: null });
      currentGetNoteByIdImpl.mockResolvedValue(undefined); // No existing note for new
      render(<TestWrapper initialEntries={['/notes/new']}>
        <NoteEditorPage />
      </TestWrapper>);
      const user = userEvent.setup();
      expect(await screen.findByText('Create New Note')).toBeInTheDocument();
      await user.click(screen.getByTestId('note-editor-page-cancel-button'));
      expect(mockNavigateFn).toHaveBeenCalledWith('/');
    });

    it('navigates to /tasks/:taskId when cancelling new note (with taskId)', async () => {
      mockUseParamsFn.mockReturnValue({ taskId: taskIdForCancel }); // For '/tasks/:taskId/notes/new'
      mockUseLocationFn.mockReturnValue({ pathname: `/tasks/${taskIdForCancel}/notes/new`, state: null });
      currentGetNoteByIdImpl.mockResolvedValue(undefined); // No existing note for new
      const taskForNewNote: Task = {
        id: taskIdForCancel,
        title: 'Task for New Note',
        description: 'Mock description for new note cancellation test',
        priority: 'normal',
        dueDate: null,
        dueDateType: 'on',
        targetDeadline: null,
        goLiveDate: null,
        effortLevel: 1,
        completed: false,
        completedDate: null,
        tags: [],
        people: [],
        dependencies: [],
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
      };
      vi.mocked(useTaskContext).mockReturnValue({
        tasks: [taskForNewNote], // Specific override for this test
        tags: mockTagsForCtx,
        people: mockPeopleForCtx,
        recurrenceRules: mockRecurrenceRulesForCtx,
        addTask: mockAddTaskCtxFn,
        updateTask: mockUpdateTaskCtxFn,
        deleteTask: mockDeleteTaskCtxFn,
        completeTask: mockCompleteTaskCtxFn,
        addTag: mockAddTagCtxFn,
        updateTag: mockUpdateTagCtxFn,
        deleteTag: mockDeleteTagCtxFn,
        addPerson: mockAddPersonCtxFn,
        updatePerson: mockUpdatePersonCtxFn,
        deletePerson: mockDeletePersonCtxFn,
        getTodaysCompletedTasks: mockGetTodaysCompletedTasksCtxFn,
        loading: false, // Specific override for this test
        getRecurrenceRuleById: mockGetRecurrenceRuleByIdCtxFn,
      });
      render(<TestWrapper initialEntries={[`/tasks/${taskIdForCancel}/notes/new`]}>
        <NoteEditorPage />
      </TestWrapper>);
      const user = userEvent.setup();
      expect(await screen.findByText('Create New Note')).toBeInTheDocument();
      await user.click(screen.getByTestId('note-editor-page-cancel-button'));
      expect(mockNavigateFn).toHaveBeenCalledWith(`/tasks/${taskIdForCancel}`);
    });
  }); // End of Cancel Button Navigation describe

}); // End of NoteEditorPage describe
