
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TaskForm from '@/components/TaskForm';
import { Task } from '@/types'; // Import Task type

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskToEdit?: Task; // New prop
}

const CreateTaskDialog = ({ open, onOpenChange, taskToEdit }: CreateTaskDialogProps) => {
  const isEditing = !!taskToEdit;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        {/* Added sr-only DialogTitle for accessibility compliance */}
        <DialogTitle className="sr-only">
          {isEditing ? 'Edit Task' : 'Create New Task'}
        </DialogTitle>
        <DialogHeader>
          {/* Changed original DialogTitle to a div, styles preserved */}
          <div className="text-lg font-semibold leading-none tracking-tight">
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </div>
          <DialogDescription>
            {isEditing ? 'Update the details of your task below.' : 'Fill in the details below to create a new task.'}
          </DialogDescription>
        </DialogHeader>
        <TaskForm 
          task={taskToEdit} // Pass taskToEdit to TaskForm
          onSuccess={() => onOpenChange(false)} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskDialog;
