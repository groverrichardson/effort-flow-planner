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
import { Task, Note } from '@/types'; // Import Task and Note types
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
            {' '}
            {/* Main flex container */}
            {/* Main content area */}
            <div
                className="flex-grow overflow-y-auto"
                ref={scrollableContainerRef}>
                {' '}
                {/* Main content area, THIS is likely the scrollable part */}
                <div className="container px-2 md:px-6 md:max-w-4xl md:mx-auto py-8 pb-20 md:pb-8 relative">
                    <PageHeader
                        onCreateTaskClick={openCreateTaskDialog}
                        onManageTagsClick={handleManageTags}
                        onManagePeopleClick={handleManagePeople}
                        onBulkImportClick={openBulkImportDialog}
                        filterProps={filterProps}
                        isBulkEditing={isBulkEditing} // Added
                        onToggleBulkEdit={handleToggleBulkEdit} // Added
                        allTasks={tasksFromCtx || []} // Pass all tasks to PageHeader
                    />
                    {/* Quick task input shows at the top on desktop */}
                    {!isMobile && <QuickTaskInput />}
                    {/* Wrapper for UpcomingTasks and TaskList */}
                    <div className="mt-6 space-y-6 bg-white dark:bg-slate-800 rounded-lg">
                        <UpcomingTasks
                            tasks={tasksFromCtx}
                            onTaskClick={handleOpenDetailedView}
                        />

                        {/* TaskListControls was here, now removed. Sidebar will handle controls. */}

                        {/* Task list */}
                        <div className="mt-6 md:mt-0">
                            <TaskList
                                onTaskItemClick={handleOpenDetailedView}
                                filteredTasks={filteredTasks}
                                // filterControlProps, onCreateTaskClick, and onCreateNoteClick are removed as controls are in Sidebar
                                isBulkEditing={isBulkEditing}
                                onToggleBulkEdit={handleToggleBulkEdit}
                                viewingCompleted={viewingCompleted} // Pass directly from hook
                                showTodaysTasks={showTodaysTasks} // Pass directly from hook
                            />
                        </div>
                    </div>{' '}
                    {/* END of new white section wrapper */}
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
                            }`}>
                            <QuickTaskInput />
                        </div>
                    )}
                    {/* Create Task Dialog */}
                    <CreateTaskDialog
                        open={createTaskOpen}
                        onOpenChange={setCreateTaskOpen}
                    />
                    <TaskDialogs
                        editTask={detailedTask} // Changed from editingTask to detailedTask based on context
                        onCloseEdit={handleCloseDetailedView} // Changed from handleCloseEditDialog
                        onDeleteTask={handleDeleteFromDetailedView} // Changed from handleDeleteTask
                        onOpenCreateNoteDialog={
                            handleOpenCreateNoteDialogForTask
                        } // Pass handler for task-specific note
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
                </div>{' '}
                {/* Closing tag for 'container max-w-4xl mx-auto ...' div */}
            </div>{' '}
            {/* Closing tag for 'flex-grow overflow-y-auto' div */}
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
                    isBulkEditing={isBulkEditing} // Added
                    onToggleBulkEdit={handleToggleBulkEdit} // Added
                    allTasks={tasksFromCtx} // Pass all tasks to the Sidebar for the search modal
                />
                </>
            )}
        </div> /* Closing tag for 'flex h-screen' div */
    );
};

export default Index;
