
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TaskForm from '@/components/TaskForm';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateTaskDialog = ({ open, onOpenChange }: CreateTaskDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <TaskForm onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskDialog;
