/// <reference types="vitest/globals" />
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import TaskDetailPage from './TaskDetailPage';
import { useTaskContext } from '@/context/TaskContext';
import { useNoteContext } from '@/context/NoteContext';
import { useToast } from '@/components/ui/use-toast';
import { Task } from '@/types';

// Mock dependencies
vi.mock('@/context/TaskContext');
vi.mock('@/context/NoteContext');

// Mock TaskForm to simplify testing TaskDetailPage's responsibility (switching views)
// We'll assume TaskForm itself is tested separately.
let capturedOnSubmit: ((taskData: Task | Partial<Task>) => Promise<void>) | undefined;
let capturedOnOpenCreateNoteDialog: ((taskId: string) => void) | undefined;
vi.mock('@/components/TaskForm', () => ({
  default: (props: { task?: Task, onSubmit: (taskData: Task | Partial<Task>) => Promise<void>, onCancel?: () => void, onDelete?: () => void, onOpenCreateNoteDialogForTask?: (taskId: string) => void }) => {
    capturedOnSubmit = props.onSubmit; // Capture the onSubmit prop
    return (
      <div data-testid="mock-task-form">
        <h2>Mock Task Form</h2>
        {props.task && <p>Editing: {props.task.title}</p>}
        {/* Simulate a save button that would trigger onSubmit internally in a real form */}
        <button onClick={() => props.onSubmit(props.task || {})} data-testid="mock-task-form-save-button">Mock Save</button>
        <button onClick={props.onCancel} data-testid="mock-task-form-cancel-button">Cancel</button>
        {props.onDelete && <button onClick={props.onDelete} data-testid="mock-task-form-delete-button">Mock Delete</button>}
        {props.onOpenCreateNoteDialogForTask && props.task && <button onClick={() => props.onOpenCreateNoteDialogForTask!(props.task!.id)} data-testid="mock-task-form-add-note-button">Mock Add Note</button>}
      </div>
    );
  },
}));

// The factory now defines and returns the spy directly for use-toast.
vi.mock('@/components/ui/use-toast', () => {
  const mockToastExportSpy = vi.fn();
  return {
    useToast: vi.fn(() => ({ // Mock for the useToast hook
      toast: mockToastExportSpy as vi.SpyInstance, // Can be a different spy or mockToastExportSpy if needed
    })),
    toast: mockToastExportSpy, // This is the spy for the named 'toast' export
  };
});

import { toast as actualMockedToastFn } from '@/components/ui/use-toast';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useParams: vi.fn(),
    // useNavigate will use the actual implementation from 'actual'
  };
});

// const mockNavigate = vi.fn(); // Removed

const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Test Task 1',
    description: 'Description for task 1',
    priority: 'normal', // Changed from 'medium'
    dueDate: new Date(), // Changed from toISOString()
    completed: false,
    // recurring: null, // recurring is not a direct property of Task, it's part of RecurrenceRule
    effortLevel: 2, // Changed from effort to effortLevel to match Task type
    dueDateType: 'on', // Added to satisfy Task type
    targetDeadline: null, // Added to satisfy Task type
    goLiveDate: null, // Added to satisfy Task type
    completedDate: null, // Added to satisfy Task type
    tags: [],
    people: [], // Changed from assignedTo to people to match Task type
    dependencies: [],
    // subtasks: [], // subtasks is not a direct property of Task
    // notes: [], // notes is not a direct property of Task
    createdAt: new Date(), // Changed from toISOString()
    updatedAt: new Date(), // Changed from toISOString()
    // userId: 'user-123', // Removed as it's not in Task type
  },
];

const TestWrapper: React.FC<{ initialEntries: string[]; children: React.ReactNode }> = ({ initialEntries, children }) => {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/tasks/:taskId" element={children} />
        <Route path="/" element={<div>Home Page Mock</div>} />
        {/* Added route for task-specific new note page */}
        <Route path="/tasks/:taskId/notes/new" element={<div>New Note for Task Page Mock</div>} /> 
        <Route path="/notes/new" element={<div>New Note Page Mock</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('TaskDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // (useNavigate as vi.Mock).mockReturnValue(mockNavigate); // Removed
  });

  it('displays loading state initially', () => {
    (useParams as vi.Mock).mockReturnValue({ taskId: 'task-1' });
    (useTaskContext as vi.Mock).mockReturnValue({
      tasks: [],
      loading: true,
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
    });

    const { container } = render(
      <TestWrapper initialEntries={['/tasks/task-1']}>
        <TaskDetailPage />
      </TestWrapper>
    );
    expect(screen.getByText(/Loading task details.../i)).toBeInTheDocument();
    expect(container.querySelector('#task-detail-loading')).toBeInTheDocument();
  });

  it('renders task form with task details when task is found', async () => {
    (useParams as vi.Mock).mockReturnValue({ taskId: 'task-1' });
    (useTaskContext as vi.Mock).mockReturnValue({
      tasks: mockTasks,
      loading: false,
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
    });
    (useNoteContext as vi.Mock).mockReturnValue({
      notes: [],
      loading: false,
      addNote: vi.fn(),
      updateNote: vi.fn(),
      deleteNote: vi.fn(),
      getNotesForTask: vi.fn().mockResolvedValue([]),
    });

    const { container } = render(
      <TestWrapper initialEntries={['/tasks/task-1']}>
        <TaskDetailPage />
      </TestWrapper>
    );

    // Wait for the task title to appear (TaskDetailPage fetches task in useEffect)
    // Since isEditing is now false initially, TaskDetail should be rendered.
    // We expect to find the title and description from TaskDetail.
    // Note: TaskDetail itself might be auto-mocked by Vitest if not unmocked.
    // For now, we'll check for the main page container and the title which is part of TaskDetailPage's direct render.
    await waitFor(() => expect(container.querySelector('#task-detail-page-task-1')).toBeInTheDocument());
    expect(container.querySelector('#task-detail-title-task-1')).toHaveTextContent('Test Task 1');
    // Add a check for TaskDetail component presence if possible, or specific content from it
    // For example, if TaskDetail renders a specific data-testid:
    // expect(screen.getByTestId('task-detail-component-task-1')).toBeInTheDocument();
    // Or check for the description text if TaskDetail renders it directly and is not mocked away:
    // await screen.findByText('Description for task 1');
  });

  it('displays "Task Not Found" when task does not exist', async () => {
    (useParams as vi.Mock).mockReturnValue({ taskId: 'task-nonexistent' });
    (useTaskContext as vi.Mock).mockReturnValue({
      tasks: mockTasks, // Provide some tasks, but not the one being looked for
      loading: false,
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
    });

    render(
      <TestWrapper initialEntries={['/tasks/task-nonexistent']}>
        <TaskDetailPage />
      </TestWrapper>
    );

    await screen.findByText(/Task Not Found/i);
    expect(screen.getByRole('heading', { name: /Task Not Found/i })).toBeInTheDocument(); // More accessible query
    expect(screen.getByText(/The task you are looking for does not exist or could not be loaded./i)).toBeInTheDocument();
  });

    it('navigates to task list when "Cancel" button is clicked', async () => {
    const mockTask = mockTasks[0];
    (useParams as vi.Mock).mockReturnValue({ taskId: mockTask.id });
    (useTaskContext as vi.Mock).mockReturnValue({
      tasks: [mockTask],
      loading: false,
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      getTaskById: (id: string) => mockTasks.find(t => t.id === id),
    });
    (useNoteContext as vi.Mock).mockReturnValue({
      notes: [],
      loading: false,
      addNote: vi.fn(),
      updateNote: vi.fn(),
      deleteNote: vi.fn(),
      getNotesForTask: vi.fn().mockResolvedValue([]),
    });

    render(
      <TestWrapper initialEntries={['/', `/tasks/${mockTask.id}`]}>
        <TaskDetailPage />
      </TestWrapper>
    );

    await screen.findByTestId('mock-task-form'); // Ensure TaskForm is rendered

    // Now, click the cancel button in the mocked TaskForm
    const cancelButton = screen.getByTestId('mock-task-form-cancel-button');
    fireEvent.click(cancelButton);

    await screen.findByText('Home Page Mock');
  });

  it('handles successful save from TaskForm and navigates', async () => {
    const mockTask = mockTasks[0];
    (useParams as vi.Mock).mockReturnValue({ taskId: mockTask.id });
    const mockUpdateTask = vi.fn().mockResolvedValue(mockTask); // Mock updateTask if needed for other tests
    (useTaskContext as vi.Mock).mockReturnValue({
      tasks: [mockTask],
      loading: false,
      updateTask: mockUpdateTask,
      deleteTask: vi.fn(),
      getTaskById: (id: string) => mockTasks.find(t => t.id === id),
    });
    (useNoteContext as vi.Mock).mockReturnValue({
      notes: [],
      loading: false,
      addNote: vi.fn(),
      updateNote: vi.fn(),
      deleteNote: vi.fn(),
      getNotesForTask: vi.fn().mockResolvedValue([]),
    });

    render(
      <TestWrapper initialEntries={['/', `/tasks/${mockTask.id}`]}>
        <TaskDetailPage />
      </TestWrapper>
    );

    await screen.findByTestId('mock-task-form'); // Ensure TaskForm is rendered

    // Now, click the "Mock Save" button in the mocked TaskForm
    const saveButton = screen.getByTestId('mock-task-form-save-button');
    fireEvent.click(saveButton);

    // Assert that updateTask was called with the task data
    await waitFor(() => {
      // The mock TaskForm calls onSubmit(task), which is mockTask in this context.
      // TaskDetailPage's handleSaveTask then calls updateTask with this data.
      expect(mockUpdateTask).toHaveBeenCalledWith(expect.objectContaining({ id: mockTask.id }));
    });

    // Assert that navigate was called
    await waitFor(async () => {
      // After navigation, the home page mock content should be visible
      expect(await screen.findByText('Home Page Mock')).toBeInTheDocument();
    });
    // Also ensure the form is no longer visible, indicating navigation occurred to navigation
    // This assumes navigation to '/' (or another route) occurs and TestWrapper updates.
    // If navigate(-1) from '/tasks/:taskId' leads to '/', and '/' renders something else.
    await waitFor(() => {
      expect(screen.queryByTestId('mock-task-form')).not.toBeInTheDocument();
    });
  });

    it('navigates to "/" when the back button on "Task Not Found" screen is clicked', async () => {
      (useParams as vi.Mock).mockReturnValue({ taskId: 'non-existent-task-id' });
      (useTaskContext as vi.Mock).mockReturnValue({
        tasks: mockTasks, // Provide some tasks, but the one we're looking for won't be there
        getTaskById: (id: string) => undefined, // Simulate task not found
      });

      render(
        <TestWrapper initialEntries={[`/tasks/non-existent-task-id`]}>
          <TaskDetailPage />
        </TestWrapper>
      );

      await screen.findByText('Task Not Found'); // Ensure not found screen is rendered
      
      // The back button on the 'Task Not Found' screen
      // It also has 'Go back to previous page' as aria-label, but we can be more specific with ID if needed
      const backButtonNotFoundScreen = screen.getByRole('button', { name: /go back to previous page/i });
      fireEvent.click(backButtonNotFoundScreen);

      expect(await screen.findByText('Home Page Mock')).toBeInTheDocument();
    });
});
