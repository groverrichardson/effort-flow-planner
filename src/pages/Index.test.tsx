import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Index from './Index'; // Adjust path as necessary
import { TaskContext } from '@/context/TaskContext'; // Adjust path
import * as useMobileHook from '@/hooks/use-mobile'; // Adjust path
import * as useTaskFilteringHook from '@/hooks/useTaskFiltering'; // Adjust path

// Mock child components to simplify testing
vi.mock('@/components/TaskList', () => ({ default: () => <div data-testid="mock-task-list">TaskList</div> }));
vi.mock('@/components/quick-task/QuickTaskInput', () => ({ default: () => <div data-testid="mock-quick-task-input">QuickTaskInput</div> }));
vi.mock('@/components/headers/PageHeader', () => ({ default: () => <div data-testid="mock-page-header">PageHeader</div> }));
vi.mock('@/components/Sidebar', () => ({ default: () => <div data-testid="mock-sidebar">Sidebar</div> }));
vi.mock('@/components/dialogs/CreateTaskDialog', () => ({ default: () => <div data-testid="mock-create-task-dialog">CreateTaskDialog</div> }));
vi.mock('@/components/dialogs/ManageDialog', () => ({ default: () => <div data-testid="mock-manage-dialog">ManageDialog</div> }));
vi.mock('@/components/dialogs/BulkImportDialog', () => ({ default: () => <div data-testid="mock-bulk-import-dialog">BulkImportDialog</div> }));
vi.mock('@/components/dialogs/TaskDialogs', () => ({ default: () => <div data-testid="mock-task-dialogs">TaskDialogs</div> }));
vi.mock('@/components/UpcomingTasks', () => ({ default: () => <div data-testid="mock-upcoming-tasks">UpcomingTasks</div> }));
vi.mock('@/components/headers/TaskListHeader', () => ({ default: () => <div data-testid="mock-task-list-header">TaskListHeader</div> }));


// Mock hooks
const mockUseIsMobile = vi.spyOn(useMobileHook, 'useIsMobile');
const mockUseTaskFiltering = vi.spyOn(useTaskFilteringHook, 'useTaskFiltering');

const mockTaskContextValue = {
    tasks: [],
    tags: [],
    people: [],
    getTodaysCompletedTasks: vi.fn(() => []),
    addTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    addTag: vi.fn(),
    updateTag: vi.fn(),
    deleteTag: vi.fn(),
    addPerson: vi.fn(),
    updatePerson: vi.fn(),
    deletePerson: vi.fn(),
    bulkImportTasks: vi.fn(),
};

const mockUseTaskFilteringReturnValue = {
    selectedPriorities: [],
    selectedTags: [],
    selectedPeople: [],
    filterByDueDate: null,
    filterByGoLive: null,
    handleTogglePriority: vi.fn(),
    handleToggleTag: vi.fn(),
    handleTogglePerson: vi.fn(),
    setFilterByDueDate: vi.fn(),
    setFilterByGoLive: vi.fn(),
    clearAllFilters: vi.fn(),
    viewingCompleted: false,
    showTodaysTasks: false,
    todaysTasks: [],
    completedTasks: [],
    handleShowAllActive: vi.fn(),
    handleShowToday: vi.fn(),
    handleShowCompleted: vi.fn(),
    filteredTasks: [],
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
