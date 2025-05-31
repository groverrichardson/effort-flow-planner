// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import FullScreenSearchModal from './FullScreenSearchModal';
import { Task, TaskStatus, EffortLevel, Priority, DueDateType, Person } from '@/types';
import Fuse from 'fuse.js';

// JSDOM Mocks for Tiptap/Prosemirror (and potentially other libraries)
if (typeof window !== 'undefined' && window.document && !window.document.createRange) {
  window.document.createRange = () => {
    const range = new Range();
    range.getBoundingClientRect = vi.fn(() => ({ x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, bottom: 0, right: 0, toJSON: () => ({}) }));
    range.getClientRects = vi.fn(() => ({ item: () => null, length: 0, [Symbol.iterator]: vi.fn(), toJSON: () => [] }));
    return range;
  };
}
if (typeof window !== 'undefined' && window.document && typeof window.document.createRange === 'function') {
  const originalCreateRange = window.document.createRange.bind(window.document);
  window.document.createRange = () => {
    const range = originalCreateRange();
    if (typeof range.getBoundingClientRect !== 'function') {
      range.getBoundingClientRect = vi.fn(() => ({ x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, bottom: 0, right: 0, toJSON: () => ({}) }));
    }
    if (typeof range.getClientRects !== 'function') {
      range.getClientRects = vi.fn(() => ({ item: () => null, length: 0, [Symbol.iterator]: vi.fn(), toJSON: () => [] }));
    }
    return range;
  };
}
if (typeof document !== 'undefined' && typeof document.elementFromPoint !== 'function') {
  document.elementFromPoint = vi.fn(() => null);
}

// Mock react-router-dom
const mockNavigateFn = vi.fn(); // Define the spy here
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigateFn, // useNavigate hook returns our specific mock function
  };
});

// Mock Fuse.js
const mockSearch = vi.fn();
vi.mock('fuse.js', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      search: mockSearch,
    })),
  };
});

const mockTasks: Task[] = [
  { id: '1', title: 'Test Task 1', description: 'Description for task 1', effortLevel: EffortLevel.XS, status: TaskStatus.PENDING, priority: Priority.HIGH, dueDate: null, dueDateType: 'on', targetDeadline: null, goLiveDate: null, completed: false, completedDate: null, createdAt: new Date(), updatedAt: new Date(), userId: 'user1', isRecurringInstance: false, is_archived: false, tags: [{id: 'tag1', name: 'Urgent'}], people: [], dependencies: [] },
  { id: '2', title: 'Another Example Task 2', description: 'Description for task 2', effortLevel: EffortLevel.S, status: TaskStatus.IN_PROGRESS, priority: Priority.NORMAL, dueDate: new Date(), dueDateType: 'by', targetDeadline: null, goLiveDate: null, completed: false, completedDate: null, createdAt: new Date(), updatedAt: new Date(), userId: 'user1', isRecurringInstance: false, is_archived: false, tags: [{id: 'tag2', name: 'Work'}], people: [], dependencies: [] },
  { id: '3', title: 'Final Task Item 3', description: 'Description for task 3', effortLevel: EffortLevel.M, status: TaskStatus.COMPLETED, priority: Priority.LOW, dueDate: null, dueDateType: 'on', targetDeadline: null, goLiveDate: null, completed: true, completedDate: new Date(), createdAt: new Date(), updatedAt: new Date(), userId: 'user1', isRecurringInstance: false, is_archived: false, tags: [], people: [], dependencies: [] },
];

interface TestWrapperProps {
  children: React.ReactNode;
}

const TestWrapper: React.FC<TestWrapperProps> = ({ children }) => {
  return <MemoryRouter>{children}</MemoryRouter>;
};

describe('FullScreenSearchModal', () => {
  let mockOnClose: () => void;

  beforeEach(() => {
    mockOnClose = vi.fn();
    mockNavigateFn.mockClear(); // Clear the correct spy
    mockSearch.mockClear();
    // Default mock search to return all items if query is empty, or specific items otherwise
    mockSearch.mockImplementation((query: string) => {
      if (!query) return mockTasks.map(task => ({ item: task }));
      const lowerQuery = query.toLowerCase();
      return mockTasks.filter(task => task.title.toLowerCase().includes(lowerQuery)).map(task => ({ item: task }));
    });
  });

  test('renders nothing when isOpen is false', () => {
    render(
      <FullScreenSearchModal isOpen={false} onClose={mockOnClose} tasks={mockTasks} />,
      { wrapper: TestWrapper }
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(); // Using a generic role that might apply
    expect(screen.queryByTestId('fullscreen-search-modal')).not.toBeInTheDocument();
  });

  test('renders correctly when isOpen is true', () => {
    render(
      <FullScreenSearchModal isOpen={true} onClose={mockOnClose} tasks={mockTasks} />,
      { wrapper: TestWrapper }
    );
    expect(document.getElementById('fullscreen-search-modal')).toBeInTheDocument(); // Query by ID
    expect(screen.getByPlaceholderText('Search tasks, notes, tags...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  test('calls onClose when cancel button is clicked', () => {
    render(
      <FullScreenSearchModal isOpen={true} onClose={mockOnClose} tasks={mockTasks} />,
      { wrapper: TestWrapper }
    );
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('updates search query on input change and focuses input', async () => {
    render(
      <FullScreenSearchModal isOpen={true} onClose={mockOnClose} tasks={mockTasks} />,
      { wrapper: TestWrapper }
    );
    const searchInput = screen.getByPlaceholderText('Search tasks, notes, tags...') as HTMLInputElement;
    expect(searchInput).toHaveFocus();

    fireEvent.change(searchInput, { target: { value: 'Test' } });
    expect(searchInput.value).toBe('Test');
  });

  test('displays all tasks initially when search query is empty', () => {
    render(
      <FullScreenSearchModal isOpen={true} onClose={mockOnClose} tasks={mockTasks} />,
      { wrapper: TestWrapper }
    );
    mockTasks.forEach(task => {
      expect(screen.getByText(task.title)).toBeInTheDocument();
    });
  });

  test('filters tasks based on search query', async () => {
    mockSearch.mockImplementation((query: string) => {
      if (query === 'Test Task 1') return [{ item: mockTasks[0] }];
      return [];
    });

    render(
      <FullScreenSearchModal isOpen={true} onClose={mockOnClose} tasks={mockTasks} />,
      { wrapper: TestWrapper }
    );
    const searchInput = screen.getByPlaceholderText('Search tasks, notes, tags...');
    fireEvent.change(searchInput, { target: { value: 'Test Task 1' } });

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });
    expect(screen.queryByText('Another Example Task 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Final Task Item 3')).not.toBeInTheDocument();
  });

  test('shows "no results" message when search yields no results', async () => {
    mockSearch.mockReturnValue([]);
    render(
      <FullScreenSearchModal isOpen={true} onClose={mockOnClose} tasks={mockTasks} />,
      { wrapper: TestWrapper }
    );
    const searchInput = screen.getByPlaceholderText('Search tasks, notes, tags...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.getByText(/no results found for "nonexistent"/i)).toBeInTheDocument();
    });
  });

  test('navigates to task detail and closes modal on task click', async () => {
    const taskToClick = mockTasks[0];
    mockSearch.mockImplementation((query: string) => {
      if (!query) return mockTasks.map(task => ({ item: task })); // Ensure task is shown initially
      return [];
    });

    render(
      <FullScreenSearchModal isOpen={true} onClose={mockOnClose} tasks={mockTasks} />,
      { wrapper: TestWrapper }
    );

    // Ensure the task is rendered before clicking
    await waitFor(() => {
        expect(screen.getByText(taskToClick.title)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(taskToClick.title));

    expect(mockNavigateFn).toHaveBeenCalledWith(`/tasks/${taskToClick.id}`); // Assert against the correct spy
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('resets search query and focuses input when modal re-opens', () => {
    const { rerender } = render(
      <FullScreenSearchModal isOpen={false} onClose={mockOnClose} tasks={mockTasks} />,
      { wrapper: TestWrapper }
    );

    // Open the modal
    rerender(
      <FullScreenSearchModal isOpen={true} onClose={mockOnClose} tasks={mockTasks} />
    );

    const searchInput = screen.getByPlaceholderText('Search tasks, notes, tags...') as HTMLInputElement;
    expect(searchInput.value).toBe('');
    expect(searchInput).toHaveFocus();
  });

});
