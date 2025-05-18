
import { useState, useEffect } from 'react';
import { Task } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TaskForm from '../TaskForm';
import { useIsMobile } from '@/hooks/use-mobile';

interface TaskDialogsProps {
  editTask: Task | null;
  onCloseEdit: () => void;
}

const TaskDialogs = ({
  editTask,
  onCloseEdit
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
            <TaskForm 
              task={currentEditTask} 
              onSuccess={onCloseEdit} 
              onCancel={onCloseEdit} 
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskDialogs;
