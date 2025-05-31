import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Input } from '@/components/ui/input'; // Added
import TaskFilters from '@/components/filters/TaskFilters'; // Added
import TaskListHeader from '@/components/headers/TaskListHeader'; // Added
import {
    ChevronLeft,
    ChevronRight,
    Tags,
    Users,
    Upload,
    Edit,
    X,
    NotebookText,
    Search,
    PlusCircle,
} from 'lucide-react'; // Added Search, PlusCircle
import { Link } from 'react-router-dom'; // Import Link for navigation
import { Tag, Person, Priority, Task } from '@/types'; // Added types for props
import FullScreenSearchModal from './FullScreenSearchModal'; // Import the new modal

// Define a more comprehensive props type for the controls
interface TaskControlProps {
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    onCreateTaskClick: () => void;
    onCreateNoteClick: () => void;
    // Props for TaskListHeader
    viewingCompleted: boolean;
    showTodaysTasks: boolean;
    todaysCount: number;
    completedCount: number;
    viewingArchived: boolean;
    archivedCount: number;
    onShowAllActive: () => void;
    onShowToday: () => void; // Assuming this exists or will be added to filterProps in Index.tsx
    onShowCompleted: () => void;
    onShowArchived: () => void;
    // Props for TaskFilters
    selectedTags: string[];
    selectedPeople: string[];
    selectedPriorities: Priority[];
    filterByDueDate: string | null;
    filterByGoLive: boolean; // Corrected to boolean
    onToggleTag: (tagId: string) => void;
    onTogglePerson: (personId: string) => void;
    onTogglePriority: (priority: Priority) => void;
    onSetFilterByDueDate: (date: string | null) => void;
    onSetFilterByGoLive: (value: boolean) => void; // Corrected to boolean
    onResetFilters: () => void;
    tags: Tag[];
    people: Person[];
    // Potentially other props if TaskListControls had more
}

interface SidebarProps {
    filterControls: TaskControlProps; // Use the new comprehensive type
    isOpen: boolean;
    onToggle: () => void;
    onManageTagsClick: () => void;
    onManagePeopleClick: () => void;
    onBulkImportClick: () => void;
    isBulkEditing: boolean; // Added for bulk edit state
    onToggleBulkEdit: () => void; // Added for toggling bulk edit
    isMobileSheetView?: boolean; // Added for mobile sheet full-width behavior
    allTasks: Task[]; // Add allTasks prop for the search modal
}

const Sidebar: React.FC<SidebarProps> = ({
    filterControls,
    isOpen,
    onToggle,
    onManageTagsClick,
    onManagePeopleClick,
    onBulkImportClick,
    isBulkEditing, // Added
    onToggleBulkEdit, // Added
    isMobileSheetView = false, // Added, default to false
    allTasks, // Destructure allTasks
}) => {
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    console.log('[Sidebar Props Check] isMobileSheetView:', isMobileSheetView, 'isOpen:', isOpen);
    console.log('[Sidebar Props Check] allTasks received:', allTasks ? allTasks.length : 'undefined/empty', JSON.stringify(allTasks?.map(t => t.id))); // ADDED LOG
    // const isMobile = useIsMobile(); // No longer needed here as it will be controlled by parent for mobile sheet usage

    // Destructure all necessary props from filterControls
    const {
        searchTerm,
        onSearchTermChange,
        onCreateTaskClick,
        onCreateNoteClick,
        viewingCompleted,
        showTodaysTasks,
        todaysCount,
        completedCount,
        viewingArchived,
        archivedCount,
        onShowAllActive,
        onShowToday,
        onShowCompleted,
        onShowArchived,
        selectedTags,
        selectedPeople,
        selectedPriorities,
        filterByDueDate,
        filterByGoLive,
        onToggleTag,
        onTogglePerson,
        onTogglePriority,
        onSetFilterByDueDate,
        onSetFilterByGoLive,
        onResetFilters,
        tags,
        people,
    } = filterControls;

    return (<>
        <div
            className={`relative h-full bg-gray-200 dark:bg-slate-800 dark:text-slate-200 transition-all duration-300 ease-in-out
                  ${isMobileSheetView ? 'w-full' : isOpen ? 'w-72' : 'w-16'}`}>
            <Button
                variant="ghost"
                onClick={onToggle}
                className="absolute top-8 left-0 transform -translate-x-1/2 rounded-full h-8 w-8 p-0 flex items-center justify-center bg-gray-200 dark:bg-slate-700 hover:bg-accent dark:hover:bg-slate-600 z-10 hidden lg:flex">
                {isOpen ? (
                    <ChevronRight className="h-4 w-4" />
                ) : (
                    <ChevronLeft className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle sidebar</span>
            </Button>

            <div
                className={`${isMobileSheetView ? 'p-2' : isOpen ? 'p-4' : 'p-0'} overflow-y-auto h-full ${isMobileSheetView ? 'w-full' : isOpen ? 'w-64' : 'opacity-0 hidden w-0'}`}>
                {/* Task Controls Section */}
                <div className="space-y-4 mb-6 pb-4 border-b border-gray-300 dark:border-slate-700">
                    <h3
                        className="text-sm font-semibold text-gray-600 dark:text-slate-400"
                        id="sidebar-controls-heading">
                        Controls
                    </h3>
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="sidebar-search-input"
                            placeholder="Search tasks..."
                            className="pl-8 w-full"
                            value={searchTerm}
                            readOnly={isMobileSheetView} // Make readOnly if in mobile sheet view
                            onChange={(e) => {
                                if (!isMobileSheetView) { // Only allow direct typing if not in mobile sheet view
                                    onSearchTermChange(e.target.value);
                                }
                            }}
                            onClick={() => {
                                if (isMobileSheetView) { // Open modal on click if in mobile sheet view
                                    setIsSearchModalOpen(true);
                                }
                            }}
                        />
                    </div>
                    <Button
                        onClick={onCreateTaskClick}
                        size="sm"
                        className="w-full justify-start gap-1"
                        id="sidebar-new-task-button">
                        <PlusCircle className="h-4 w-4" /> New Task
                    </Button>
                    <Button
                        onClick={onCreateNoteClick}
                        size="sm"
                        className="w-full justify-start gap-1"
                        id="sidebar-new-note-button">
                        <PlusCircle className="h-4 w-4" /> New Note
                    </Button>

                    <div className="space-y-2 pt-2">
                        <h4
                            className="text-xs font-semibold text-gray-500 dark:text-slate-500"
                            id="sidebar-view-options-heading">
                            View Options
                        </h4>
                        <TaskListHeader
                            viewingCompleted={viewingCompleted}
                            showTodaysTasks={showTodaysTasks} // This prop might be named differently or implicitly handled by onShowToday
                            todaysCount={todaysCount}
                            completedCount={completedCount}
                            viewingArchived={viewingArchived}
                            archivedCount={archivedCount}
                            onShowAllActive={onShowAllActive}
                            onShowToday={onShowToday} // Ensure this is passed correctly from Index.tsx's filterProps
                            onShowCompleted={onShowCompleted}
                            onShowArchived={onShowArchived}
                        />
                    </div>

                    <div className="space-y-2 pt-2">
                        <h4
                            className="text-xs font-semibold text-gray-500 dark:text-slate-500"
                            id="sidebar-filter-options-heading">
                            Filters
                        </h4>
                        <TaskFilters
                            selectedTags={selectedTags}
                            selectedPeople={selectedPeople}
                            selectedPriorities={selectedPriorities}
                            filterByDueDate={filterByDueDate}
                            filterByGoLive={filterByGoLive}
                            onToggleTag={onToggleTag}
                            onTogglePerson={onTogglePerson}
                            onTogglePriority={onTogglePriority}
                            onSetFilterByDueDate={onSetFilterByDueDate}
                            onSetFilterByGoLive={onSetFilterByGoLive}
                            onResetFilters={onResetFilters}
                            tags={tags}
                            people={people}
                            // Assuming TaskFilters is for desktop, so no isMobile prop needed here
                            // If it needs to adapt, additional props might be required.
                        />
                    </div>
                </div>

                {/* Management Buttons */}
                <div className="pt-4 space-y-2">
                    {/* If MobileFilters was the only thing providing top margin/padding, adjust 'mt-4' or 'pt-4' as needed */}
                    {/* If MobileFilters was NOT the first element, or its removal doesn't affect layout, the existing div structure is fine.*/}
                    <Button
                        variant={isBulkEditing ? 'destructive' : 'outline'}
                        size="sm"
                        className="w-full gap-1 justify-start"
                        onClick={onToggleBulkEdit}
                        id="sidebar-bulk-edit-button">
                        {isBulkEditing ? (
                            <>
                                <X className="h-4 w-4 mr-1" />
                                Exit Bulk Edit
                            </>
                        ) : (
                            <>
                                <Edit className="h-4 w-4 mr-1" />
                                Bulk Edit
                            </>
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1 justify-start"
                        onClick={onManageTagsClick}
                        id="sidebar-manage-tags-button">
                        <Tags className="h-4 w-4" />
                        Manage Tags
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1 justify-start"
                        onClick={onManagePeopleClick}
                        id="sidebar-manage-people-button">
                        <Users className="h-4 w-4" />
                        Manage People
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1 justify-start"
                        onClick={onBulkImportClick}
                        id="sidebar-bulk-import-button">
                        <Upload className="h-4 w-4" />
                        Import CSV
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1 justify-start"
                        asChild // Use asChild to make Button behave like Link
                        id="sidebar-all-notes-button">
                        <Link to="/notes">
                            <NotebookText className="h-4 w-4 mr-1" />
                            All Notes
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Optional footer can remain or be removed if not needed */}
            {/* <div className="p-4 border-t border-border">
          <p className="text-sm text-muted-foreground">Sidebar Footer (optional)</p>
        </div> */}
        </div>
            <FullScreenSearchModal
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                tasks={allTasks} 
            />
    </>);
};

export default Sidebar;
