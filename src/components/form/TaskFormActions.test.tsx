import { render, screen, fireEvent } from '@testing-library/react';
import TaskFormActions from './TaskFormActions';
import { vi } from 'vitest';

describe('TaskFormActions', () => {
  const mockOnCancel = vi.fn();
  const mockOnArchive = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    // Reset mocks before each test
    mockOnCancel.mockClear();
    mockOnArchive.mockClear();
    mockOnDelete.mockClear();
  });

  it('renders Save and Cancel buttons when not editing', () => {
    render(<TaskFormActions isEditing={false} onCancel={mockOnCancel} />);
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('renders Update, Cancel, Archive, and Delete buttons when editing and all handlers are provided', () => {
    render(
      <TaskFormActions
        isEditing={true}
        onCancel={mockOnCancel}
        onArchive={mockOnArchive}
        onDelete={mockOnDelete}
      />
    );
    expect(screen.getByRole('button', { name: /update task/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /archive/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('calls onCancel when Cancel button is clicked (when not editing)', () => {
    render(<TaskFormActions isEditing={false} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when Close button is clicked (when editing)', () => {
    render(
      <TaskFormActions
        isEditing={true}
        onCancel={mockOnCancel}
        onArchive={mockOnArchive}
        onDelete={mockOnDelete}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onArchive when Archive button is clicked', () => {
    render(
      <TaskFormActions
        isEditing={true}
        onCancel={mockOnCancel}
        onArchive={mockOnArchive}
        onDelete={mockOnDelete}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /archive/i }));
    expect(mockOnArchive).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when Delete button is clicked', () => {
    render(
      <TaskFormActions
        isEditing={true}
        onCancel={mockOnCancel}
        onArchive={mockOnArchive}
        onDelete={mockOnDelete}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it('does not render Archive button if onArchive is not provided', () => {
    render(<TaskFormActions isEditing={true} onCancel={mockOnCancel} onDelete={mockOnDelete} />);
    expect(screen.queryByRole('button', { name: /archive/i })).not.toBeInTheDocument();
  });

  it('does not render Delete button if onDelete is not provided', () => {
    render(<TaskFormActions isEditing={true} onCancel={mockOnCancel} onArchive={mockOnArchive} />);
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });

  it('Archive and Delete buttons are not present if not editing, even if handlers are provided', () => {
    render(
      <TaskFormActions
        isEditing={false}
        onCancel={mockOnCancel}
        onArchive={mockOnArchive}
        onDelete={mockOnDelete}
      />
    );
    expect(screen.queryByRole('button', { name: /archive/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });

   it('renders Archive button with unique ID when provided', () => {
    render(
      <TaskFormActions
        isEditing={true}
        onCancel={mockOnCancel}
        onArchive={mockOnArchive}
      />
    );
    const archiveButton = screen.getByRole('button', { name: /archive/i });
    expect(archiveButton).toHaveAttribute('id', 'task-form-archive-button');
  });

  it('renders Delete button with unique ID when provided', () => {
    render(
      <TaskFormActions
        isEditing={true}
        onCancel={mockOnCancel}
        onDelete={mockOnDelete}
      />
    );
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toHaveAttribute('id', 'task-form-delete-button');
  });

});
