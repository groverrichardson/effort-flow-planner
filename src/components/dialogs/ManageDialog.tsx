
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tag, Users } from 'lucide-react';
import ManageTags from '@/components/manage/ManageTags';
import ManagePeople from '@/components/manage/ManagePeople';

interface ManageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'tags' | 'people';
}

const ManageDialog = ({ open, onOpenChange, defaultTab = 'tags' }: ManageDialogProps) => {
  const [activeTab, setActiveTab] = useState<'tags' | 'people'>(defaultTab);

  useEffect(() => {
    // Sync activeTab with defaultTab prop when it changes
    // This ensures the correct tab is shown if the dialog is re-opened with a different default
    setActiveTab(defaultTab);
  }, [defaultTab]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        {/* Added sr-only DialogTitle for accessibility compliance */}
        <DialogTitle className="sr-only">Manage</DialogTitle>
        <DialogHeader>
          {/* Changed original DialogTitle to a div, styles preserved */}
          <div className="text-lg font-semibold leading-none tracking-tight">Manage</div>
          <DialogDescription>
            Manage your tags and people for tasks
          </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'tags' | 'people')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tags" className="flex items-center gap-1">
              <Tag size={16} />
              <span>Tags/Areas</span>
            </TabsTrigger>
            <TabsTrigger value="people" className="flex items-center gap-1">
              <Users size={16} />
              <span>People</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tags" className="mt-4">
            <ManageTags />
          </TabsContent>
          
          <TabsContent value="people" className="mt-4">
            <ManagePeople />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ManageDialog;
