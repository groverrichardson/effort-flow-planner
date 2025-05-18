
import { useState, useEffect, useRef } from 'react';
import TaskList from '@/components/TaskList';
import QuickTaskInput from '@/components/quick-task/QuickTaskInput';
import PageHeader from '@/components/headers/PageHeader';
import CreateTaskDialog from '@/components/dialogs/CreateTaskDialog';
import ManageDialog from '@/components/dialogs/ManageDialog';
import BulkImportDialog from '@/components/dialogs/BulkImportDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTaskContext } from '@/context/TaskContext';
import { useTaskFiltering } from '@/hooks/useTaskFiltering';

const Index = () => {
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [manageActiveTab, setManageActiveTab] = useState<'tags' | 'people'>('tags');
  const [showMobileInput, setShowMobileInput] = useState(true);
  const prevScrollY = useRef(0);
  const isMobile = useIsMobile();
  
  const { tasks, tags, people, getTodaysCompletedTasks } = useTaskContext();
  
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
    handleShowAllActive,
    handleShowToday,
    handleShowCompleted,
  } = useTaskFiltering({ tasks, getTodaysCompletedTasks });
  
  // Mobile quick task input scrolling behavior
  useEffect(() => {
    // Only add scroll listener on mobile
    if (!isMobile) return;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Show input when scrolling up, hide when scrolling down
      setShowMobileInput(prevScrollY.current > currentScrollY || currentScrollY < 10);
      prevScrollY.current = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);
  
  const handleManageTags = () => {
    setManageActiveTab('tags');
    setManageDialogOpen(true);
  };
  
  const handleManagePeople = () => {
    setManageActiveTab('people');
    setManageDialogOpen(true);
  };
  
  // Filter props for mobile menu only
  const filterProps = {
    selectedTags,
    selectedPeople,
    selectedPriorities,
    filterByDueDate,
    filterByGoLive,
    onToggleTag: handleToggleTag,
    onTogglePerson: handleTogglePerson,
    onTogglePriority: handleTogglePriority,
    onSetFilterByDueDate: setFilterByDueDate,
    onSetFilterByGoLive: setFilterByGoLive,
    onResetFilters: clearAllFilters,
    onCreateTask: () => setCreateTaskOpen(true),
    onBulkImport: () => setBulkImportOpen(true),
    viewingCompleted,
    showTodaysTasks,
    onShowAllActive: handleShowAllActive,
    onShowToday: handleShowToday,
    onShowCompleted: handleShowCompleted,
    tags: tags || [],
    people: people || []
  };
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 pb-20 md:pb-8 relative">
      <PageHeader 
        onCreateTaskClick={() => setCreateTaskOpen(true)}
        onManageTagsClick={handleManageTags}
        onManagePeopleClick={handleManagePeople}
        onBulkImportClick={() => setBulkImportOpen(true)}
        filterProps={filterProps}
      />

      {/* Quick task input shows at the top on desktop */}
      {!isMobile && <QuickTaskInput />}

      {/* Task list */}
      <div className="mb-6 md:mb-0">
        <TaskList />
      </div>

      {/* Quick task input shows at the bottom on mobile - sticky with transition */}
      {isMobile && (
        <div 
          className={`fixed bottom-0 left-0 right-0 p-4 bg-background z-50 border-t
                     transition-all duration-300 transform
                     ${showMobileInput ? 'translate-y-0' : 'translate-y-full'}`}
        >
          <QuickTaskInput />
        </div>
      )}

      {/* Create Task Dialog */}
      <CreateTaskDialog 
        open={createTaskOpen} 
        onOpenChange={setCreateTaskOpen} 
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
    </div>
  );
};

export default Index;
