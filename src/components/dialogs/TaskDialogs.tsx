import { useState, useEffect } from 'react';
import { Task } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TaskDetail from '../TaskDetail';
import TaskForm from '../TaskForm';

interface TaskDialogsProps {
  detailTask: Task | null;
  editTask: Task | null;
  onCloseDetail: () => void;
  onCloseEdit: () => void;
  onEditClick: (task: Task) => void;
}

const TaskDialogs = ({
  detailTask,
  editTask,
  onCloseDetail,
  onCloseEdit,
  onEditClick
}: TaskDialogsProps) => {
  // Keep a local reference to the task being edited to prevent stale data
  const [currentEditTask, setCurrentEditTask] = useState<Task | null>(null);
  
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
      <Dialog open={!!detailTask} onOpenChange={(open) => !open && onCloseDetail()}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
            <DialogDescription>
              View and manage your task
            </DialogDescription>
          </DialogHeader>
          {detailTask && (
            <TaskDetail 
              task={detailTask} 
              onClose={onCloseDetail}
              onEdit={() => onEditClick(detailTask)} 
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTask} onOpenChange={(open) => !open && onCloseEdit()}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
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
