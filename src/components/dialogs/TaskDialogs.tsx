
import { useState } from 'react';
import { Task } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  return (
    <>
      <Dialog open={!!detailTask} onOpenChange={() => onCloseDetail()}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
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

      <Dialog open={!!editTask} onOpenChange={() => onCloseEdit()}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editTask && (
            <TaskForm 
              task={editTask} 
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
