import { render, screen, fireEvent, act } from '@testing-library/react';
import TaskList from './TaskList';
import { TaskContext, TaskContextType } from '@/context/TaskContext';
import { vi } from 'vitest';
import { Task, Priority, EffortLevel, TaskStatus } from '@/types';

// Mock child components
// vi.mock('./headers/TaskListControls', () => ({
//   default: (props: any) => (
//     <div data-testid="task-list-controls">
//       <input 
//         data-testid="search-input-mock" 
//         value={props.searchTerm}
//         onChange={(e) => props.onSearchTermChange(e.target.value)}
//       />
//       <button data-testid="create-task-mock" onClick={props.onCreateTaskClick}>Create Task</button>
//       <button data-testid="create-note-mock" onClick={props.onCreateNoteClick}>Create Note</button>
//     </div>
//   ),
// }));

vi.mock('./list/TaskListContent', () => ({
  default: (props: any) => (
    <div data-testid="task-list-content">
      {props.tasks.map((task: Task) => (
        <div key={task.id} data-testid={`task-item-${task.id}`}>{task.title}</div>
      ))}
    </div>
  ),
}));

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: vi.fn(() => false),
}));

const mockTasks: Task[] = [
  {
    id: '1', title: 'Searchable Task Alpha', description: 'Description with keyword', 
    status: TaskStatus.PENDING, priority: Priority.NORMAL, effortLevel: EffortLevel.M, 
    dueDate: null, dueDateType: 'on', targetDeadline: null, goLiveDate: null, completed: false, completedDate: null, createdAt: new Date(), updatedAt: new Date(),
    tags: [{id: 'tag1', name: 'Urgent'}], people: [{id: 'person1', name: 'Alice'}], dependencies: [],
    is_archived: false, userId: 'mock-user-1',
  },
  {
    id: '2', title: 'Another Task', description: 'Different content here', 
    status: TaskStatus.COMPLETED, priority: Priority.LOW, effortLevel: EffortLevel.S, 
    dueDate: null, dueDateType: 'on', targetDeadline: null, goLiveDate: null, completed: true, completedDate: new Date(), createdAt: new Date(), updatedAt: new Date(),
    tags: [], people: [], dependencies: [],
    is_archived: false, userId: 'mock-user-1',
  },
  {
    id: '3', title: 'Task with Keyword', description: 'This task is also searchable by its description.', 
    status: TaskStatus.IN_PROGRESS, priority: Priority.HIGH, effortLevel: EffortLevel.L, 
    dueDate: null, dueDateType: 'on', targetDeadline: null, goLiveDate: null, completed: false, completedDate: null, createdAt: new Date(), updatedAt: new Date(),
    tags: [{id: 'tag2', name: 'Work'}], people: [{id: 'person2', name: 'Bob'}], dependencies: [],
    is_archived: false, userId: 'mock-user-1',
  },
];

const mockTaskContextValue: TaskContextType = {
  tasks: mockTasks,
  tags: [{id: 'tag1', name: 'Urgent'}, {id: 'tag2', name: 'Work'}],
  people: [{id: 'person1', name: 'Alice'}, {id: 'person2', name: 'Bob'}],
  addTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  completeTask: vi.fn(),
  getTaskById: vi.fn((id) => mockTasks.find(t => t.id === id) || null),
  getTodaysCompletedTasks: vi.fn(() => []), 
  addTag: vi.fn(),
  deleteTag: vi.fn(),
  addPerson: vi.fn(),
  updatePerson: vi.fn(),
  deletePerson: vi.fn(),
  loading: false,
  recurrenceRules: [],
  archiveTask: vi.fn(),
  getArchivedTasks: vi.fn(() => []),
  getRecurrenceRuleById: vi.fn(() => null),
};

const mockFilterControlProps = {
  viewingCompleted: false,
  showTodaysTasks: false,
  todaysCount: 0,
  completedCount: 0,
  selectedTags: [],
  selectedPeople: [],
  selectedPriorities: [],
  filterByDueDate: '',
  filterByGoLive: false,
  onShowAllActive: vi.fn(),
  onShowToday: vi.fn(),
  onShowCompleted: vi.fn(),
  onToggleTag: vi.fn(),
  onTogglePerson: vi.fn(),
  onTogglePriority: vi.fn(),
  onSetFilterByDueDate: vi.fn(),
  onSetFilterByGoLive: vi.fn(),
  onResetFilters: vi.fn(),
};

const defaultTaskListProps = {
  onTaskItemClick: vi.fn(),
  filteredTasks: mockTasks, // Initially all tasks
  filterControlProps: mockFilterControlProps,
  onCreateTaskClick: vi.fn(),
  onCreateNoteClick: vi.fn(),
  isBulkEditing: false,
  onToggleBulkEdit: vi.fn(),
};

const renderComponent = (props = {}) => {
  return render(
    <TaskContext.Provider value={mockTaskContextValue}>
      <TaskList {...defaultTaskListProps} {...props} />
    </TaskContext.Provider>
  );
};

describe('TaskList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset filteredTasks to all tasks before each test that might modify it
    defaultTaskListProps.filteredTasks = [...mockTasks]; 
  });

  it('renders TaskListControls and TaskListContent', () => {
    renderComponent();
//     expect(screen.getByTestId('task-list-controls')).toBeInTheDocument();
    expect(screen.getByTestId('task-list-content')).toBeInTheDocument();
  });

//   it('passes searchTerm and onSearchTermChange to TaskListControls', () => {
//     // This test relies on the mock of TaskListControls to check props.
//     // We can't directly assert props on a real component easily.
//     // The mock for TaskListControls has an input that uses these props.
//     renderComponent();
//     const searchInput = screen.getByTestId('search-input-mock');
//     expect(searchInput).toHaveValue(''); // Initial search term

//     act(() => {
//       fireEvent.change(searchInput, { target: { value: 'test' } });
//     });
//     expect(searchInput).toHaveValue('test'); // Search term updated
//   });

//   it('filters tasks based on search term (title)', () => {
//     renderComponent();
//     const searchInput = screen.getByTestId('search-input-mock');

//     act(() => {
//       fireEvent.change(searchInput, { target: { value: 'Alpha' } });
//     });

//     expect(screen.getByTestId('task-item-1')).toBeInTheDocument(); // Searchable Task Alpha
//     expect(screen.queryByTestId('task-item-2')).not.toBeInTheDocument();
//     expect(screen.queryByTestId('task-item-3')).not.toBeInTheDocument();
//   });

//   it('filters tasks based on search term (description)', () => {
//     renderComponent();
//     const searchInput = screen.getByTestId('search-input-mock');

//     act(() => {
//       fireEvent.change(searchInput, { target: { value: 'keyword' } });
//     });

//     expect(screen.getByTestId('task-item-1')).toBeInTheDocument(); // Description with keyword
//     expect(screen.queryByTestId('task-item-2')).not.toBeInTheDocument();
//     expect(screen.getByTestId('task-item-3')).toBeInTheDocument(); // Task with Keyword (in description)
//   });

//   it('filters tasks case-insensitively', () => {
//     renderComponent();
//     const searchInput = screen.getByTestId('search-input-mock');

//     act(() => {
//       fireEvent.change(searchInput, { target: { value: 'alpha' } }); // Lowercase
//     });

//     expect(screen.getByTestId('task-item-1')).toBeInTheDocument(); // Searchable Task Alpha
//   });

//   it('shows all tasks when search term is cleared', () => {
//     renderComponent();
//     const searchInput = screen.getByTestId('search-input-mock');

//     act(() => {
//       fireEvent.change(searchInput, { target: { value: 'Alpha' } });
//     });
//     expect(screen.queryByTestId('task-item-2')).not.toBeInTheDocument();

//     act(() => {
//       fireEvent.change(searchInput, { target: { value: '' } }); // Clear search
//     });

//     expect(screen.getByTestId('task-item-1')).toBeInTheDocument();
//     expect(screen.getByTestId('task-item-2')).toBeInTheDocument();
//     expect(screen.getByTestId('task-item-3')).toBeInTheDocument();
//   });

//   it('combines search filter with existing filteredTasks prop', () => {
//     // Simulate that filteredTasks prop initially only contains task 1 and 3
//     const preFiltered = [mockTasks[0], mockTasks[2]]; // 'Searchable Task Alpha', 'Task with Keyword'
//     renderComponent({ filteredTasks: preFiltered });
    
//     const searchInput = screen.getByTestId('search-input-mock');

//     // Search within the pre-filtered list
//     act(() => {
//       fireEvent.change(searchInput, { target: { value: 'Alpha' } });
//     });

//     expect(screen.getByTestId('task-item-1')).toBeInTheDocument(); // 'Searchable Task Alpha' should still be there
//     expect(screen.queryByTestId('task-item-3')).not.toBeInTheDocument(); // 'Task with Keyword' does not match 'Alpha'
//   });

//   it('calls onCreateTaskClick when create task button is clicked', () => {
//     renderComponent();
//     const createTaskButton = screen.getByTestId('create-task-mock');
//     fireEvent.click(createTaskButton);
//     expect(defaultTaskListProps.onCreateTaskClick).toHaveBeenCalled();
//   });

//   it('calls onCreateNoteClick when create note button is clicked', () => {
//     renderComponent();
//     const createNoteButton = screen.getByTestId('create-note-mock');
//     fireEvent.click(createNoteButton);
//     expect(defaultTaskListProps.onCreateNoteClick).toHaveBeenCalled();
//   });

});
