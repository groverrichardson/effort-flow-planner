import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { NoteContext, NoteContextType } from '@/context/NoteContext';
import { TaskContext, TaskContextType } from '@/context/TaskContext';
import TaskDetail from './TaskDetail'; // Assuming TaskDetail is in the same directory or correct path
import { Task, Note, Person, Tag } from '@/types'; // Adjust path as needed
import { vi } from 'vitest';

// Mock dependencies
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...(actual as object),
    useNavigate: () => mockNavigate,
  };
});

// Use vi.hoisted to ensure mockToast is available for the hoisted mock factory
const { mockToast } = vi.hoisted(() => {
  return { mockToast: vi.fn() };
});

vi.mock('@/components/ui/use-toast', () => ({
  toast: mockToast,
}));

const getMockTask = (): Task => ({
  id: 'task-1',
  title: 'Test Task', // Changed from name to title
  description: 'Task Description',
  // status: 'todo', // Status is not in the Task interface, 'completed' boolean is used instead
  priority: 'normal', // Changed from 'medium' to 'normal'
  dueDate: new Date(),
  dueDateType: 'on', // Added missing required field
  effortLevel: 1, // Added missing required field
  completed: false, // Added missing required field
  completedDate: null,
  // targetDeadline and goLiveDate are optional or can be null
  targetDeadline: null,
  goLiveDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  tags: [], 
  people: [], 
  dependencies: [],
  recurrenceRuleId: null,
});

const getMockNotes = (): Note[] => ([
  {
    id: 'note-1',
    name: 'Note 1 for Task 1',
    body: 'Body of note 1',
    taggedTaskIds: ['task-1'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'note-2',
    name: 'Note 2 for Task 1',
    body: 'Body of note 2',
    taggedTaskIds: ['task-1', 'task-2'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'note-3',
    name: 'Note for another task',
    body: 'Body of note 3',
    taggedTaskIds: ['task-3'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);

const mockUntagNoteFromTask = vi.fn();

const renderTaskDetail = (task: Task, notes: Note[], untagFn = mockUntagNoteFromTask) => {
  const noteContextValue: Partial<NoteContextType> = {
    notes: notes,
    loading: false,
    getNoteById: async (id) => notes.find(n => n.id === id) || null,
    updateNote: async (note) => note, 
    untagNoteFromTask: untagFn,
    fetchNotes: async () => {},
    addNote: vi.fn(),
    deleteNote: vi.fn(),
  };

  const taskContextValue: Partial<TaskContextType> = {
    tasks: [task],
    loading: false,
    addTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => { console.log('addTask mock called', taskData); },
    updateTask: (updatedTask: Task) => { console.log('updateTask mock called', updatedTask); },
    deleteTask: (taskId: string) => { console.log('deleteTask mock called', taskId); },
    completeTask: (taskId: string) => { console.log('completeTask mock called', taskId); },
    people: [],
    tags: [],
    addPerson: async (name: string): Promise<Person> => ({ id: `person-${Math.random()}`, name }),
    updatePerson: (person: Person) => { console.log('updatePerson mock called', person); },
    deletePerson: (personId: string) => { console.log('deletePerson mock called', personId); },
    addTag: async (name: string): Promise<Tag> => ({ id: `tag-${Math.random()}`, name }),
    updateTag: (tag: Tag) => { console.log('updateTag mock called', tag); },
    deleteTag: (tagId: string) => { console.log('deleteTag mock called', tagId); },
    getTodaysCompletedTasks: () => [],
    getRecurrenceRuleById: (id: string) => undefined, 
  };

  return render(
    <BrowserRouter>
      <TaskContext.Provider value={taskContextValue as TaskContextType}>
        <NoteContext.Provider value={noteContextValue as NoteContextType}>
          <TaskDetail task={task} onEdit={() => {}} />
        </NoteContext.Provider>
      </TaskContext.Provider>
    </BrowserRouter>
  );
};

describe('TaskDetail Component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('Renders task details correctly', () => {
    const task = getMockTask();
    const notes = getMockNotes(); 
    renderTaskDetail(task, notes);

    expect(screen.getByText(task.title)).toBeInTheDocument();
    expect(screen.getByText(task.description!)).toBeInTheDocument();
  });

  it('Renders notes associated with the task', () => {
    const task = getMockTask();
    const notes = getMockNotes();
    renderTaskDetail(task, notes);
    const expectedTaskNotes = notes.filter(note => note.taggedTaskIds.includes(task.id));
    expect(expectedTaskNotes.length).toBe(2); 

    expectedTaskNotes.forEach(note => {
      const untagButton = screen.getByRole('button', { name: `Untag note ${note.name} from this task` });
      expect(untagButton).toBeInTheDocument();
      expect(untagButton).toHaveAttribute('id', `task-${task.id}-untag-note-${note.id}-button`);
    });
  });

  it('calls untagNoteFromTask with correct parameters when untag button is clicked', async () => {
    const task = getMockTask();
    const notes = getMockNotes();
    const noteToUntag = notes.find(n => n.id === 'note-1')!;
    const localMockUntagFn = vi.fn().mockResolvedValueOnce({ ...noteToUntag, taggedTaskIds: [] }); 

    renderTaskDetail(task, notes, localMockUntagFn);

    const untagButton = screen.getByRole('button', { name: `Untag note ${noteToUntag.name} from this task` });
    fireEvent.click(untagButton);

    await waitFor(() => {
      expect(localMockUntagFn).toHaveBeenCalledTimes(1);
      expect(localMockUntagFn).toHaveBeenCalledWith(noteToUntag.id, task.id);
    });
  });

  it('visually removes the note from the list after successful untagging', async () => {
    const task = getMockTask();
    const notes = getMockNotes();
    const noteToUntag = notes.find(n => n.id === 'note-1')!;
    const untagFn = vi.fn().mockImplementation(async (noteId: string, taskId: string) => {
      const updatedNote = { ...noteToUntag, taggedTaskIds: noteToUntag.taggedTaskIds.filter(id => id !== taskId) };
      const updatedNotes = notes.map(n => n.id === noteId ? updatedNote : n);
      return updatedNote;
    });

    const { rerender } = renderTaskDetail(task, notes, untagFn);
    expect(screen.getByText(noteToUntag.name)).toBeInTheDocument();

    const untagButton = screen.getByRole('button', { name: `Untag note ${noteToUntag.name} from this task` });
    fireEvent.click(untagButton);

    await waitFor(() => {
      expect(untagFn).toHaveBeenCalledWith(noteToUntag.id, task.id);
    });

    const notesAfterUntag = notes.map(n => 
      n.id === noteToUntag.id ? { ...n, taggedTaskIds: [] } : n
    );
    
    const newNoteContextValue: Partial<NoteContextType> = {
        notes: notesAfterUntag,
        loading: false,
        getNoteById: async (id) => notesAfterUntag.find(n => n.id === id) || null,
        updateNote: async (note) => note,
        untagNoteFromTask: untagFn,
        fetchNotes: async () => {},
        addNote: vi.fn(),
        deleteNote: vi.fn(),
      };

    const newTaskContextValue: Partial<TaskContextType> = {
        tasks: [task], 
        loading: false,
        addTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => { console.log('addTask mock called', taskData); },
        updateTask: (updatedTask: Task) => { console.log('updateTask mock called', updatedTask); },
        deleteTask: (taskId: string) => { console.log('deleteTask mock called', taskId); },
        completeTask: (taskId: string) => { console.log('completeTask mock called', taskId); },
        people: [],
        tags: [],
        addPerson: async (name: string): Promise<Person> => ({ id: `person-${Math.random()}`, name }),
        updatePerson: (person: Person) => { console.log('updatePerson mock called', person); },
        deletePerson: (personId: string) => { console.log('deletePerson mock called', personId); },
        addTag: async (name: string): Promise<Tag> => ({ id: `tag-${Math.random()}`, name }),
        updateTag: (tag: Tag) => { console.log('updateTag mock called', tag); },
        deleteTag: (tagId: string) => { console.log('deleteTag mock called', tagId); },
        getTodaysCompletedTasks: () => [],
        getRecurrenceRuleById: (id: string) => undefined,
      };

    rerender(
        <BrowserRouter>
          <TaskContext.Provider value={newTaskContextValue as TaskContextType}>
            <NoteContext.Provider value={newNoteContextValue as NoteContextType}>
              <TaskDetail task={task} onEdit={() => {}} /> 
            </NoteContext.Provider>
          </TaskContext.Provider>
        </BrowserRouter>
      );

    await waitFor(() => {
        expect(screen.queryByText(noteToUntag.name)).not.toBeInTheDocument(); 
    });

    const note2 = notes.find(n => n.id === 'note-2');
    expect(screen.getByText(note2!.name)).toBeInTheDocument();

    expect(screen.queryByText('No notes for this task yet.')).not.toBeInTheDocument();
    expect(screen.queryByRole('listitem', { name: /Note 1 for Task 1/i })).not.toBeInTheDocument();
    expect(screen.getByText('Note 2 for Task 1')).toBeInTheDocument(); // Check for the text directly
  });

  it('does not call untagNoteFromTask if task ID is missing, as no untag button is available', () => { 
    const taskWithoutId = { ...getMockTask(), id: '' }; 
    const notes = getMockNotes();
    const localMockUntagFn = vi.fn(); // Use a local mock for this specific test
    renderTaskDetail(taskWithoutId, notes, localMockUntagFn);

    // Verify that no notes are displayed for this task with an empty ID
    expect(screen.getByText('No notes for this task yet.')).toBeInTheDocument();

    // Verify that the untag button for 'Note 1 for Task 1' is not present
    const noteNameThatShouldNotBeRendered = notes.find(n => n.id === 'note-1')?.name;
    if (noteNameThatShouldNotBeRendered) {
      expect(screen.queryByRole('button', { name: `Untag note ${noteNameThatShouldNotBeRendered} from this task` })).not.toBeInTheDocument();
    }

    // Because no relevant untag button was rendered (and thus not clicked),
    // untagNoteFromTask (from context, which is localMockUntagFn here) should not have been called.
    expect(localMockUntagFn).not.toHaveBeenCalled();

    // Also, the toast for "Task context is missing" should not have been shown via this path,
    // as the handleUntagNote function (which shows it) would not be invoked.
    expect(mockToast).not.toHaveBeenCalledWith(expect.objectContaining({
      description: "Task context is missing."
    }));
  });

  it('handles failure from untagNoteFromTask gracefully (e.g., error toast shown by context)', async () => {
    const task = getMockTask();
    const notes = getMockNotes();
    const noteToUntag = notes.find(n => n.id === 'note-1')!;
    // Use a local mock for this specific test to simulate failure
    const localMockUntagFailureFn = vi.fn().mockResolvedValueOnce(null);

    renderTaskDetail(task, notes, localMockUntagFailureFn);

    const untagButton = screen.getByRole('button', { name: `Untag note ${noteToUntag.name} from this task` });
    fireEvent.click(untagButton);

    await waitFor(() => {
      expect(localMockUntagFailureFn).toHaveBeenCalledWith(noteToUntag.id, task.id);
      // The toast for failure is called within the context's untagNoteFromTask function.
      // We've already tested that untagNoteFromTask is called.
      // If we wanted to be more specific, we'd check mockToast was called by the context, 
      // but that's an integration detail of the context itself.
    });

    // Note should still be visible as the untag failed
    expect(screen.getByText(noteToUntag.name)).toBeInTheDocument();
  });

});
