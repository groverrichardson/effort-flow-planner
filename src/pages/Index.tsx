import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import TaskList from '@/components/TaskList';
import QuickTaskInput from '@/components/quick-task/QuickTaskInput';
import PageHeader from '@/components/headers/PageHeader';
import { Button } from '@/components/ui/button'; // Added Button import
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
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
function IndexPage() {
    const { addNote } = useNoteStore(); // Get addNote from the store
    const navigate = useNavigate(); // Add useNavigate hook
    const [createTaskOpen, setCreateTaskOpen] = useState(false);
    const [manageDialogOpen, setManageDialogOpen] = useState(false);
    const [bulkImportOpen, setBulkImportOpen] = useState(false);
    const [manageActiveTab, setManageActiveTab] = useState<'tags' | 'people'>(
        'tags'
    );
    const isMobile = useIsMobile();
    const [isQuickInputActive, setIsQuickInputActive] = useState(false); // New state for FAB

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
    const [isAllTasksExpanded, setIsAllTasksExpanded] = useState(false);
    const [isOwedToOthersExpanded, setIsOwedToOthersExpanded] = useState(true); // Default to expanded

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
        archivedTasks, 
        filteredTasks,
        // todaysTasks was already destructured above, remove duplicate
    } = useTaskFiltering({
        tasks: tasksFromCtx, // Ensure useTaskFiltering uses the tasks from context
        getTodaysCompletedTasks,
        getArchivedTasks: getArchivedTasks, // Pass the getArchivedTasks function from context
        searchTerm: searchTerm, // Pass the searchTerm state to the hook
    }); // Added getArchivedTasks and searchTerm

    const owedToOthersTasks = useMemo(() => {
        if (!tasksFromCtx) {
        console.log('[owedToOthersTasks] tasksFromCtx is null/undefined');
        return [];
    }
        const today = new Date();
    console.log('[owedToOthersTasks] Initial today:', today.toISOString());
        today.setHours(0, 0, 0, 0);
    console.log('[owedToOthersTasks] Normalized today (start of day):', today.toISOString()); // Start of today

        console.log('[owedToOthersTasks] Filtering tasksFromCtx count:', tasksFromCtx.length);
    return tasksFromCtx.filter(task => {
        console.log(`[owedToOthersTasks] Checking task: ${task.id} - ${task.title}`);
            const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        console.log(`[owedToOthersTasks] Task ${task.id} - Original dueDate: ${task.dueDate}, Parsed dueDate: ${dueDate?.toISOString()}`);
            if (dueDate) {
                dueDate.setHours(0,0,0,0);
            console.log(`[owedToOthersTasks] Task ${task.id} - Normalized dueDate: ${dueDate?.toISOString()}`); // Normalize dueDate to start of day for comparison
            }
            const hasPeople = task.people && task.people.length > 0;
            const isPastOrDueToday = dueDate && dueDate.getTime() <= today.getTime();
            const notCompleted = task.status !== TaskStatus.COMPLETED;
            console.log(`[owedToOthersTasks] Task ${task.id} - Conditions: hasPeople=${hasPeople}, isPastOrDueToday=${isPastOrDueToday} (dueDate: ${dueDate?.getTime()}, today: ${today.getTime()}), notCompleted=${notCompleted}`);
            return (
                hasPeople &&
                isPastOrDueToday &&
                notCompleted
            );
        });
    }, [tasksFromCtx]);

    const handleOpenDetailedView = (task: Task) => {
        console.log(`[Index.tsx handleOpenDetailedView] Received task: ${task?.title}, ID: ${task?.id}`);
        setDetailedTask(task);
        if (task && task.id) {
            navigate(`/tasks/${task.id}`);
        } else {
            console.error('[IndexPage handleOpenDetailedView] Task or task.id is undefined, cannot navigate. Task:', task);
        }
    };

    const handleCloseDetailedView = () => {
        setDetailedTask(null);
    };

    const handleDeleteFromDetailedView = (taskId: string) => {
        deleteTask(taskId);
        setDetailedTask(null); // Close detailed view after deletion
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

    const handleManageTags = useCallback(() => {
        setManageActiveTab('tags');
        setManageDialogOpen(true);
    }, [setManageActiveTab, setManageDialogOpen]);

    const handleManagePeople = useCallback(() => {
        setManageActiveTab('people');
        setManageDialogOpen(true);
    }, [setManageActiveTab, setManageDialogOpen]);

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
            archivedCount: archivedTasks.length,
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
            archivedTasks, // Header related states and counts
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
    console.log('[Index PRE-RETURN] owedToOthersTasks:', JSON.stringify(owedToOthersTasks, null, 2));

    return (
        <div className="flex h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50">
            {/* Main content area */}
            <div
                className="flex-grow overflow-y-auto pb-16 md:pb-0"
            >
                <div className="container max-w-4xl mx-auto p-0 md:p-4">
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

                        {/* Section 2: Owed to Others */}
                        <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg shadow" id="owed-to-others-section">
                            <button 
                                type="button"
                                className="flex items-center justify-between w-full text-xl font-semibold mb-3 text-gray-800 dark:text-slate-100 focus:outline-none"
                                onClick={() => setIsOwedToOthersExpanded(!isOwedToOthersExpanded)}
                                aria-expanded={isOwedToOthersExpanded}
                                aria-controls="owed-to-others-content"
                                id="owed-to-others-header-button"
                            >
                                <span id="owed-to-others-header">Owed to Others (Due Today or Past Due)</span>
                                {isOwedToOthersExpanded ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
                            </button>
                            {isOwedToOthersExpanded && (
                                <div id="owed-to-others-content">
                                    {/* Log OwedToOthersTasks state before rendering the list or placeholder */}
                                    {(() => {
                                        console.log('[Index OWED_TO_OTHERS_SECTION] owedToOthersTasks (inside JSX):', JSON.stringify(owedToOthersTasks, null, 2));
                                        return null;
                                    })()}

                                    {owedToOthersTasks.length > 0 ? (
                                        <TaskList
                                            onTaskItemClick={handleOpenDetailedView}
                                            filteredTasks={owedToOthersTasks} // Pass the filtered 'owed to others' tasks
                                            isBulkEditing={isBulkEditing}
                                            onToggleBulkEdit={handleToggleBulkEdit}
                                            viewingCompleted={false} // This section shows active tasks
                                            showTodaysTasks={true} // This section focuses on today/past due
                                            dataTestId="owed-to-others-task-list" // Corrected prop name
                                        />
                                    ) : (
                                        <p 
                                            className="text-gray-600 dark:text-slate-300" 
                                            id="owed-to-others-placeholder-message" // Existing ID, kept for consistency if used elsewhere
                                            data-testid="owed-to-others-placeholder" // Add the missing data-testid
                                        >
                                            No tasks owed to others are due today or past due.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Section 3: All my tasks */}
                        <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg shadow" id="all-tasks-section">
                            <button 
                                type="button"
                                className="flex items-center justify-between w-full text-xl font-semibold mb-3 text-gray-800 dark:text-slate-100 focus:outline-none"
                                onClick={() => setIsAllTasksExpanded(!isAllTasksExpanded)}
                                aria-expanded={isAllTasksExpanded}
                                aria-controls="all-tasks-content"
                                id="all-tasks-header-button"
                            >
                                <span id="all-tasks-header">All My Tasks</span>
                                {isAllTasksExpanded ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
                            </button>
                            {isAllTasksExpanded && (
                                <div id="all-tasks-content">
                                    {filteredTasks.length > 0 ? (
                                        <TaskList
                                            onTaskItemClick={handleOpenDetailedView}
                                            filteredTasks={filteredTasks} // These are 'allTasks' from the useTaskFiltering hook
                                            isBulkEditing={isBulkEditing}
                                            onToggleBulkEdit={handleToggleBulkEdit} // Use the correct handler
                                            viewingCompleted={viewingCompleted}
                                            showTodaysTasks={false} // This section shows all tasks
                                            placeholder={<p className="text-gray-600 dark:text-slate-300" id="all-tasks-placeholder">No tasks available. Add some tasks or adjust your filters!</p>}
                                            dataTestId="all-my-tasks-list" // Added for testability
                                        />
                                    ) : (
                                        <p className="text-gray-600 dark:text-slate-300" id="all-tasks-placeholder-message" data-testid="all-tasks-placeholder">
                                            No tasks available. Add some tasks or adjust your filters!
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div> {/* Closing tag for 'mt-6 space-y-6' sections wrapper div (from L260) */}
                    {isMobile && isQuickInputActive && (
                        <QuickTaskInput onClose={() => setIsQuickInputActive(false)} />
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
                {/* Floating Action Button for Quick Task Input on Mobile */} 
                {isMobile && (
                    <Button
                        onClick={() => setIsQuickInputActive(true)}
                        className="fixed bottom-20 md:bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90 text-primary-foreground"
                        size="icon"
                        aria-label="Add Quick Task"
                        id="mobile-quick-add-fab"
                    >
                        <Plus className="h-7 w-7" />
                    </Button>
                )}
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

export default IndexPage;
