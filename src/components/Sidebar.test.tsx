import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import Sidebar from './Sidebar';
import { MobileFiltersProps } from '@/components/filters/components/MobileFilterSection';

// Mock the useAuth hook
const mockSignOut = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    signOut: mockSignOut,
    user: { email: 'test@example.com' },
    session: { access_token: 'mock-token' },
    loading: false,
  }),
}));

// Mock lucide-react icons
vi.mock('lucide-react', async () => ({
  ...await vi.importActual('lucide-react'), // Import and retain default behavior
  ChevronLeft: () => <svg data-testid="chevron-left-icon" />,
  ChevronRight: () => <svg data-testid="chevron-right-icon" />,
  Tags: () => <svg data-testid="tags-icon" />,
  Users: () => <svg data-testid="users-icon" />,
  Upload: () => <svg data-testid="upload-icon" />,
  Edit: () => <svg data-testid="edit-icon" />,
  X: () => <svg data-testid="x-icon" />,
  NotebookText: () => <svg data-testid="notebook-text-icon" />,
  LogOut: () => <svg data-testid="logout-icon" />,
}));

// Mock useIsMobile hook
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: vi.fn(() => false),
}));

const mockFilterControls: MobileFiltersProps = {
  selectedTags: [],
  selectedPeople: [],
  selectedPriorities: [],
  filterByDueDate: '',
  filterByGoLive: false, // Corrected to boolean
  onToggleTag: vi.fn(),
  onTogglePerson: vi.fn(),
  onTogglePriority: vi.fn(),
  onSetFilterByDueDate: vi.fn(),
  onSetFilterByGoLive: vi.fn(),
  onResetFilters: vi.fn(),
  tags: [],
  people: [],
  viewingCompleted: false,
  showTodaysTasks: false,
  onShowAllActive: vi.fn(),
  onShowToday: vi.fn(),
  onShowCompleted: vi.fn(),
  // todaysCount: 0, // Removed, not in MobileFiltersProps
  // completedCount: 0, // Removed, not in MobileFiltersProps
};

describe('Sidebar', () => {
  const mockOnToggle = vi.fn();
  const mockOnManageTagsClick = vi.fn();
  const mockOnManagePeopleClick = vi.fn();
  const mockOnBulkImportClick = vi.fn();
  const mockOnToggleBulkEdit = vi.fn();

  const defaultProps = {
    filterControls: mockFilterControls,
    isOpen: true,
    onToggle: mockOnToggle,
    onManageTagsClick: mockOnManageTagsClick,
    onManagePeopleClick: mockOnManagePeopleClick,
    onBulkImportClick: mockOnBulkImportClick,
    isBulkEditing: false,
    onToggleBulkEdit: mockOnToggleBulkEdit,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Bulk Edit button', () => {
    render(<MemoryRouter><Sidebar {...defaultProps} /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /Bulk Edit/i })).toBeInTheDocument();
    expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
  });

  it('calls onToggleBulkEdit when the Bulk Edit button is clicked', () => {
    render(<MemoryRouter><Sidebar {...defaultProps} /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /Bulk Edit/i }));
    expect(mockOnToggleBulkEdit).toHaveBeenCalledTimes(1);
  });

  it('displays "Exit Bulk Edit" and X icon when isBulkEditing is true', () => {
    render(<MemoryRouter><Sidebar {...defaultProps} isBulkEditing={true} /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /Exit Bulk Edit/i })).toBeInTheDocument();
    expect(screen.getByTestId('x-icon')).toBeInTheDocument();
  });

  it('calls onToggleBulkEdit when the "Exit Bulk Edit" button is clicked', () => {
    render(<MemoryRouter><Sidebar {...defaultProps} isBulkEditing={true} /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /Exit Bulk Edit/i }));
    expect(mockOnToggleBulkEdit).toHaveBeenCalledTimes(1);
  });

  // Test for other buttons to ensure they are still present and functional
  it('renders management buttons and calls their respective handlers', () => {
    render(<MemoryRouter><Sidebar {...defaultProps} /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /Manage Tags/i }));
    expect(mockOnManageTagsClick).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Manage People/i }));
    expect(mockOnManagePeopleClick).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Import CSV/i }));
    expect(mockOnBulkImportClick).toHaveBeenCalledTimes(1);
  });

   it('renders toggle button and calls onToggle when clicked', () => {
    render(<MemoryRouter><Sidebar {...defaultProps} /></MemoryRouter>);
    // The toggle button is identified by its sr-only text
    const toggleButton = screen.getByRole('button', { name: /Toggle sidebar/i });
    expect(toggleButton).toBeInTheDocument();
    fireEvent.click(toggleButton);
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it('renders the "All Notes" button and navigates to /notes on click', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Sidebar {...defaultProps} />} />
          <Route path="/notes" element={<div>All Notes Page Mock</div>} />
        </Routes>
      </MemoryRouter>
    );

    const allNotesButton = screen.getByRole('link', { name: /All Notes/i });
    expect(allNotesButton).toBeInTheDocument();
    expect(allNotesButton).toHaveAttribute('href', '/notes');
    expect(screen.getByTestId('notebook-text-icon')).toBeInTheDocument();

    fireEvent.click(allNotesButton);
    expect(screen.getByText('All Notes Page Mock')).toBeInTheDocument();
  });

  it('renders the sign out button with correct styling and icon', () => {
    render(<MemoryRouter><Sidebar {...defaultProps} /></MemoryRouter>);
    
    const signOutButton = screen.getByRole('button', { name: /Sign Out/i });
    expect(signOutButton).toBeInTheDocument();
    expect(signOutButton).toHaveAttribute('id', 'sidebar-sign-out-button');
    
    // Check for the LogOut icon
    expect(screen.getByTestId('logout-icon')).toBeInTheDocument();
    
    // Check for red styling classes (indicating danger/sign out styling)
    expect(signOutButton).toHaveClass('border-red-200', 'text-red-600');
  });

  it('calls signOut function when sign out button is clicked', async () => {
    render(<MemoryRouter><Sidebar {...defaultProps} /></MemoryRouter>);
    
    const signOutButton = screen.getByRole('button', { name: /Sign Out/i });
    fireEvent.click(signOutButton);
    
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('handles sign out errors gracefully', async () => {
    // Mock console.error to avoid noise in test output
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Make signOut throw an error
    mockSignOut.mockRejectedValueOnce(new Error('Sign out failed'));
    
    render(<MemoryRouter><Sidebar {...defaultProps} /></MemoryRouter>);
    
    const signOutButton = screen.getByRole('button', { name: /Sign Out/i });
    fireEvent.click(signOutButton);
    
    // Wait for the async operation to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Sign out error:', expect.any(Error));
    
    consoleErrorSpy.mockRestore();
  });
});
