import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import TaskList from '@/components/TaskList';
import QuickTaskInput from '@/components/quick-task/QuickTaskInput';
import PageHeader from '@/components/headers/PageHeader';
import Sidebar from '@/components/Sidebar'; // Import the new Sidebar
import CreateTaskDialog from '@/components/dialogs/CreateTaskDialog';
import ManageDialog from '@/components/dialogs/ManageDialog';
import BulkImportDialog from '@/components/dialogs/BulkImportDialog';

import { useIsMobile } from '@/hooks/use-mobile';
import { useTaskContext } from '@/context/TaskContext';
import { useTaskFiltering } from '@/hooks/useTaskFiltering';
import { useNoteStore } from '@/store/noteStore'; // Import useNoteStore
import { useNavigate } from 'react-router-dom';
import TaskDialogs from '@/components/dialogs/TaskDialogs';
import { Task, TaskStatus, Note } from '@/types'; // Import Task and Note types
import UpcomingTasks from '@/components/UpcomingTasks';
import TaskListHeader from '@/components/headers/TaskListHeader'; // Import TaskListHeader
const Index = () => {
    const { addNote } = useNoteStore(); // Get addNote from the store
    const navigate = useNavigate(); // Add useNavigate hook
    const [createTaskOpen, setCreateTaskOpen] = useState(false);
    const [manageDialogOpen, setManageDialogOpen] = useState(false);
    const [bulkImportOpen, setBulkImportOpen] = useState(false);
    const [manageActiveTab, setManageActiveTab] = useState<'tags' | 'people'>(
        'tags'
    );
    const [showMobileInput, setShowMobileInput] = useState(true);
    const prevScrollY = useRef(0);
    const isMobile = useIsMobile();
    const scrollableContainerRef = useRef<HTMLDivElement>(null);

    // MOVED/MODIFIED LOG FROM PREVIOUS ATTEMPT - GENERAL STATE IN INDEX
    const taskContextValue = useTaskContext();
    console.log('[[INDEX_COMPONENT_ROOT]] Raw taskContextValue:', taskContextValue);
    const { tasks: tasksFromCtx, tags, people, getTodaysCompletedTasks, getArchivedTasks, deleteTask } = taskContextValue;
    console.log('[[INDEX_COMPONENT_ROOT]] isMobile:', isMobile, 'Tasks from context (tasksFromCtx):', tasksFromCtx ? tasksFromCtx.length : 'undefined/empty', JSON.stringify(tasksFromCtx?.map(t => t.id)));

    const toggleSidebar = useCallback(() => {
        setIsSidebarOpen((prev) => !prev);
    }, []);

    const handleToggleBulkEdit = useCallback(() => {
        setIsBulkEditing((prev) => !prev);
    }, []);
    const [detailedTask, setDetailedTask] = useState<Task | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isBulkEditing, setIsBulkEditing] = useState(false); // Added for bulk edit mode
    const [searchTerm, setSearchTerm] = useState(''); // Add searchTerm state

    // tasksFromCtx is now used directly, original useTaskContext() call for 'tasks' is covered by the log above.
    // console.log('[[INDEX_PAGE_LOG]] RECEIVED tasks from useTaskContext():', tasks ? tasks.length : 'undefined/empty', JSON.stringify(tasks?.map(t => t.id))); // This log is now redundant due to the one above.
    console.log(
        '[Index] getArchivedTasks from context:',
        getArchivedTasks && getArchivedTasks()
    ); // DEBUG

    // Get filter functions for mobile menu
    const {
        selectedPriorities,
        selectedTags,
        selectedPeople,
        filterByDueDate,
        filterByGoLive,
        handleTogglePriority,
        handleToggleTag,
        handleTogglePerson,
        setFilterByDueDate,
        setFilterByGoLive,
        clearAllFilters,
        viewingCompleted,
        showTodaysTasks,
        todaysTasks, // Destructure the array of today's tasks
        completedTasks, // Destructure the array of completed tasks
        handleShowAllActive,
        handleShowToday,
        handleShowCompleted,
        viewingArchived, // Added
        handleShowArchived, // Added
        archivedTasksCount, // Added
        filteredTasks,
        // todaysTasks was already destructured above, remove duplicate
    } = useTaskFiltering({
        tasks: tasksFromCtx, // Ensure useTaskFiltering uses the tasks from context
        getTodaysCompletedTasks,
        getArchivedTasks: getArchivedTasks, // Pass the getArchivedTasks function from context
        searchTerm: searchTerm, // Pass the searchTerm state to the hook
    }); // Added getArchivedTasks and searchTerm
    console.log(
        '[Index] From useTaskFiltering - viewingArchived:',
        viewingArchived,
        'archivedTasksCount:',
        archivedTasksCount
    ); // DEBUG

    // Mobile quick task input scrolling behavior
    // Removed handleSetFilterByGoLiveBoolean adapter, assuming filterByGoLive from hook is boolean
    const owedToOthersTasks = useMemo(() => {
        const isDateTodayOrPastHelper = (dateInput: Date | string | null | undefined): boolean => {
            if (!dateInput) return false;

            let taskDate: Date;

            if (typeof dateInput === 'string') {
                const datePart = dateInput.split('T')[0];
                const parts = datePart.split('-');
                if (parts.length !== 3) return false;
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
                const day = parseInt(parts[2], 10);
                taskDate = new Date(year, month, day);
                if (isNaN(taskDate.getTime())) return false; // Check if parsing was valid
            } else if (dateInput instanceof Date) {
                // Create a new Date object at midnight for accurate date-only comparison
                taskDate = new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate());
                if (isNaN(taskDate.getTime())) return false; // Should not happen for valid Date
            } else {
                return false; // Should not be reached with current types, but good for safety
            }
            
            const currentDate = new Date();
            const todayAtMidnight = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

            // Check if the task date is on or before today (midnight)
            return taskDate.getTime() <= todayAtMidnight.getTime();
        };

        return (tasksFromCtx || [])
            .filter(task =>
                task.status !== TaskStatus.COMPLETED &&
                isDateTodayOrPastHelper(task.dueDate) &&
                task.people && task.people.length > 0
            )
            .sort((a, b) => {
                // Optional: Sort by title for consistent ordering
                return (a.title || '').localeCompare(b.title || '');
            });
    }, [tasksFromCtx]);

    const handleOpenDetailedView = (task: Task) => {
        // setDetailedTask(task); // No longer setting state for a modal
        navigate(`/tasks/${task.id}`); // Navigate to the TaskDetailPage
    };

    const handleCloseDetailedView = () => {
        setDetailedTask(null);
    };

    const handleDeleteFromDetailedView = (taskId: string) => {
        deleteTask(taskId); // deleteTask from context
        setDetailedTask(null);
        // TaskDialogs might show its own toast, or add one here if needed
    };

    useEffect(() => {
        const scrollableElement = scrollableContainerRef.current;

        if (!isMobile || !scrollableElement) {
            // If not mobile, or the scrollable element isn't available yet, ensure input is conceptually visible for non-mobile
            // or reset scroll tracking if element disappears.
            if (!isMobile) setShowMobileInput(true); // Ensure desktop always shows if it were to use this state
            prevScrollY.current = 0;
            return;
        }

        const handleScroll = () => {
            const currentScrollY = scrollableElement.scrollTop;
            const SCROLL_THRESHOLD_FOR_REAPPEAR = 50;

            setShowMobileInput((prevIsVisible) => {
                let nextVisibleState = prevIsVisible;
                if (currentScrollY < 10) {
                    // At the very top, always show
                    nextVisibleState = true;
                } else if (currentScrollY > prevScrollY.current) {
                    // Scrolling Down
                    nextVisibleState = false;
                } else if (currentScrollY < prevScrollY.current) {
                    // Scrolling Up
                    nextVisibleState = true; // Show as soon as scrolling up starts
                }
                // If currentScrollY === prevScrollY.current (no change), nextVisibleState remains prevIsVisible
                return nextVisibleState;
            });
            prevScrollY.current = currentScrollY;
        };

        // Initial call to set state based on current scroll position
        handleScroll();

        scrollableElement.addEventListener('scroll', handleScroll, {
            passive: true,
        });

        return () => {
            // Check scrollableElement again in cleanup in case it's gone by then
            if (scrollableContainerRef.current) {
                scrollableContainerRef.current.removeEventListener(
                    'scroll',
                    handleScroll
                );
            }
        };
    }, [isMobile]); // Rerun when isMobile changes; ref.current availability handled inside.

    const handleManageTags = useCallback(() => {
        setManageActiveTab('tags');
        setManageDialogOpen(true);
    }, [setManageActiveTab, setManageDialogOpen]);

    const handleManagePeople = () => {
        setManageActiveTab('people');
        setManageDialogOpen(true);
    };

    const openCreateTaskDialog = useCallback(() => {
        setCreateTaskOpen(true);
    }, [setCreateTaskOpen]);

    const openCreateNoteDialog = useCallback(
        (taskId?: string) => {
            console.log(
                `[Index.tsx -> openCreateNoteDialog] Received taskId: ${taskId}, type: ${typeof taskId}`
            );
            if (taskId) {
                navigate(`/tasks/${taskId}/notes/new`);
            } else {
                // If no taskId, navigate to the general new note page, originating from home ('/')
                console.log(
                    '[Index.tsx -> openCreateNoteDialog] Navigating to general note creation: /notes/new, from: /'
                );
                navigate('/notes/new', { state: { from: '/' } });
            }
        },
        [navigate]
    );

    const handleOpenCreateNoteDialogForTask = openCreateNoteDialog;

    const openBulkImportDialog = useCallback(() => {
        setBulkImportOpen(true);
    }, [setBulkImportOpen]);

    // Props for Sidebar, memoized for stability
    const filterProps = useMemo(
        () => ({
            // Search related
            searchTerm,
            onSearchTermChange: setSearchTerm,
            // Create actions
            onCreateTaskClick: openCreateTaskDialog,
            onCreateNoteClick: openCreateNoteDialog,
            // Header related
            viewingCompleted,
            showTodaysTasks,
            todaysCount: todaysTasks.length, // Corrected to use length of todaysTasks array
            completedCount: completedTasks.length,
            viewingArchived,
            archivedCount: archivedTasksCount,
            onShowAllActive: handleShowAllActive,
            onShowToday: handleShowToday,
            onShowCompleted: handleShowCompleted,
            onShowArchived: handleShowArchived,
            // Filter related
            selectedTags,
            selectedPeople,
            selectedPriorities,
            filterByDueDate,
            filterByGoLive, // Pass boolean directly from useTaskFiltering
            onToggleTag: handleToggleTag,
            onTogglePerson: handleTogglePerson,
            onTogglePriority: handleTogglePriority,
            onSetFilterByDueDate: setFilterByDueDate,
            onSetFilterByGoLive: setFilterByGoLive, // Pass setter directly from useTaskFiltering
            onResetFilters: clearAllFilters,
            tags,
            people,
        }),
        [
            searchTerm,
            setSearchTerm,
            openCreateTaskDialog,
            openCreateNoteDialog, // Search and create actions
            viewingCompleted,
            showTodaysTasks,
            todaysTasks,
            completedTasks,
            viewingArchived,
            archivedTasksCount, // Header related states and counts
            handleShowAllActive,
            handleShowToday,
            handleShowCompleted,
            handleShowArchived, // Header actions
            selectedTags,
            selectedPeople,
            selectedPriorities,
            filterByDueDate,
            filterByGoLive, // Filter states (filterByGoLive is now direct state)
            handleToggleTag,
            handleTogglePerson,
            handleTogglePriority,
            setFilterByDueDate,
            setFilterByGoLive,
            clearAllFilters, // Filter actions (setFilterByGoLive is now direct setter)
            tags,
            people, // Context data for filters
        ]
    );
    console.log('[Index] filterProps for TaskListControls:', filterProps); // DEBUG

    return (
        <div className="flex h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50">
            {/* Main content area */}
            <div
                className="flex-grow overflow-y-auto"
                ref={scrollableContainerRef}
            >
                <div className="container px-2 md:px-6 md:max-w-4xl md:mx-auto py-8 pb-20 md:pb-8 relative">
                    <PageHeader
                        onCreateTaskClick={openCreateTaskDialog}
                        onManageTagsClick={handleManageTags}
                        onManagePeopleClick={handleManagePeople}
                        onBulkImportClick={openBulkImportDialog}
                        filterProps={filterProps} // Pass all filter props for mobile menu
                        isBulkEditing={isBulkEditing}
                        onToggleBulkEdit={handleToggleBulkEdit}
                        allTasks={tasksFromCtx || []} // Pass all tasks to PageHeader for search modal trigger
                    />

                    {/* Quick task input shows at the top on desktop */}
                    {!isMobile && <QuickTaskInput />}

                    {/* Reorganized content area with three sections */}
                    <div className="mt-6 space-y-6" data-component-name="Index-Reorganized-Sections-Wrapper">
                        {/* Section 1: Suggestions for what to work on next */}
                        <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg shadow" id="suggestions-section">
                            <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-slate-100" id="suggestions-header">
                                Suggestions for Next Steps
                            </h2>
                            <p className="text-gray-600 dark:text-slate-300" id="suggestions-placeholder">
                                Future home of intelligent task suggestions. For now, consider what's most important or time-sensitive!
                            </p>
                        </div>

                        {/* Section 2: Items due today involving tagged people */}
                        <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg shadow" id="owed-to-others-section">
                            <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-slate-100" id="owed-to-others-header">
                                Owed to Others (Due Today or Past Due)
                            </h2>
                        {owedToOthersTasks.length > 0 ? (
                            <ul className="space-y-2" id="owed-to-others-list">
                                {owedToOthersTasks.map(task => (
                                    <li
                                        key={task.id}
                                        onClick={() => handleOpenDetailedView(task)}
                                        className="p-3 bg-white dark:bg-slate-700/50 rounded-md shadow-sm hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer transition-colors duration-150 ease-in-out"
                                        id={`owed-task-item-${task.id}`}
                                        role="button"
                                        tabIndex={0}
                                        onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenDetailedView(task); }}
                                        aria-label={`View task: ${task.title}`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-gray-800 dark:text-slate-100 truncate" title={task.title}>{task.title}</span>
                                            {/* You could add a small 'Due Today' badge here if desired */}
                                        </div>
                                        {task.people && task.people.length > 0 && (
                                            <div className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                                                With: {task.people.map(p => p.name).join(', ')}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-600 dark:text-slate-300" id="owed-to-others-empty-placeholder">
                                No tasks owed to others are due today or past due.
                            </p>
                        )}
                        </div>

                        {/* Section 3: All my tasks */}
                        <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg shadow" id="all-tasks-section">
                            <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-slate-100" id="all-tasks-header">
                                All My Tasks
                            </h2>
                            <TaskList
                                onTaskItemClick={handleOpenDetailedView}
                                filteredTasks={filteredTasks}
                                isBulkEditing={isBulkEditing}
                                onToggleBulkEdit={handleToggleBulkEdit}
                                viewingCompleted={viewingCompleted}
                                showTodaysTasks={showTodaysTasks}
                            />
                        </div>
                    </div>

                    {/* Quick task input shows at the bottom on mobile - sticky with transition */}
                    {isMobile && (
                        <div
                            data-testid="mobile-quick-task-container"
                            className={`fixed bottom-0 left-0 right-0 pt-0 px-4 pb-4 bg-background z-50 border-t
                            transition-all duration-300 transform
                            ${
                                showMobileInput
                                    ? 'translate-y-0'
                                    : 'translate-y-full'
                            }`}
                        >
                            <QuickTaskInput />
                        </div>
                    )}

                    {/* Create Task Dialog */}
                    <CreateTaskDialog
                        open={createTaskOpen}
                        onOpenChange={setCreateTaskOpen}
                    />
                    <TaskDialogs
                        editTask={detailedTask}
                        onCloseEdit={handleCloseDetailedView}
                        onDeleteTask={handleDeleteFromDetailedView}
                        onOpenCreateNoteDialog={handleOpenCreateNoteDialogForTask}
                    />
                    {/* Manage Tags/People Dialog */}
                    <ManageDialog
                        open={manageDialogOpen}
                        onOpenChange={setManageDialogOpen}
                        defaultTab={manageActiveTab}
                    />
                    {/* Bulk Import Dialog */}
                    <BulkImportDialog
                        open={bulkImportOpen}
                        onOpenChange={setBulkImportOpen}
                    />
                </div> {/* Closing tag for 'container max-w-4xl mx-auto ...' div */}
            </div> {/* Closing tag for 'flex-grow overflow-y-auto' div */}

            {/* Sidebar rendered after main content to appear on the right */}
            {!isMobile && (
                <>
                    {console.log('[[INDEX_SIDEBAR_BLOCK]] Entered desktop sidebar rendering block. Passing tasks:', tasksFromCtx ? tasksFromCtx.length : 'undefined/empty', JSON.stringify(tasksFromCtx?.map(t => t.id)))}
                    <Sidebar
                        filterControls={filterProps}
                        isOpen={isSidebarOpen}
                        onToggle={toggleSidebar}
                        onManageTagsClick={handleManageTags}
                        onManagePeopleClick={handleManagePeople}
                        onBulkImportClick={openBulkImportDialog}
                        isBulkEditing={isBulkEditing}
                        onToggleBulkEdit={handleToggleBulkEdit}
                        allTasks={tasksFromCtx} // Pass all tasks to the Sidebar for the search modal
                    />
                </>
            )}
        </div> /* Closing tag for 'flex h-screen' div */
    );
};

export default Index;
