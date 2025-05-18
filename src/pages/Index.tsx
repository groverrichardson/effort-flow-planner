
import { useState } from 'react';
import TaskList from '@/components/TaskList';
import QuickTaskInput from '@/components/quick-task/QuickTaskInput';
import PageHeader from '@/components/headers/PageHeader';
import CreateTaskDialog from '@/components/dialogs/CreateTaskDialog';
import ManageDialog from '@/components/dialogs/ManageDialog';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [manageActiveTab, setManageActiveTab] = useState<'tags' | 'people'>('tags');
  const isMobile = useIsMobile();
  
  const handleManageTags = () => {
    setManageActiveTab('tags');
    setManageDialogOpen(true);
  };
  
  const handleManagePeople = () => {
    setManageActiveTab('people');
    setManageDialogOpen(true);
  };
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 pb-20 md:pb-8 relative">
      <div className="flex justify-center mb-8">
        <img 
          src="/lovable-uploads/df8e6029-f2da-4281-bd02-198de6b96226.png" 
          alt="Do Next Logo" 
          className="h-12"
        />
      </div>
      
      <PageHeader 
        onCreateTaskClick={() => setCreateTaskOpen(true)}
        onManageTagsClick={handleManageTags}
        onManagePeopleClick={handleManagePeople}
      />

      {/* Quick task input shows at the top on desktop */}
      {!isMobile && <QuickTaskInput />}

      {/* Task list */}
      <div className="mb-6 md:mb-0">
        <TaskList />
      </div>

      {/* Quick task input shows at the bottom on mobile - sticky */}
      {isMobile && <QuickTaskInput />}

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
    </div>
  );
};

export default Index;
