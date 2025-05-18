
import { useState, useEffect } from 'react';
import { Task } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TaskForm from '../TaskForm';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface TaskDialogsProps {
  editTask: Task | null;
  onCloseEdit: () => void;
  onDeleteTask: (taskId: string) => void;
}

const TaskDialogs = ({
  editTask,
  onCloseEdit,
  onDeleteTask
}: TaskDialogsProps) => {
  // Keep a local reference to the task being edited to prevent stale data
  const [currentEditTask, setCurrentEditTask] = useState<Task | null>(null);
  const isMobile = useIsMobile();
  
  // Update the local task reference whenever editTask changes
  useEffect(() => {
    if (editTask) {
      setCurrentEditTask({...editTask});
    } else {
      setCurrentEditTask(null);
    }
  }, [editTask]);

  const handleDelete = () => {
    if (currentEditTask) {
      onDeleteTask(currentEditTask.id);
      toast({ 
        title: "Task deleted", 
        description: `"${currentEditTask.title}" has been removed` 
      });
      onCloseEdit();
    }
  };

  return (
    <>
      <Dialog open={!!editTask} onOpenChange={(open) => !open && onCloseEdit()}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader className={isMobile ? "text-left" : ""}>
            <DialogTitle className={isMobile ? "text-left" : ""}>Edit Task</DialogTitle>
            <DialogDescription className={isMobile ? "text-left" : ""}>
              Make changes to your task
            </DialogDescription>
          </DialogHeader>
          {currentEditTask && (
            <>
              <TaskForm 
                task={currentEditTask} 
                onSuccess={onCloseEdit} 
                onCancel={onCloseEdit} 
              />
              <div className="mt-4 border-t pt-4">
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Task
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskDialogs;
