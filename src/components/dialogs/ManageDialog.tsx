
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage</DialogTitle>
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
