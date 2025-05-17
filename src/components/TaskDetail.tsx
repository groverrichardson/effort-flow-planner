
import { useState } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { Task, Group, Person } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import GroupForm from './GroupForm';
import PersonForm from './PersonForm';
import TaskForm from './TaskForm';
import { Calendar, Edit, Trash } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from '@/components/ui/use-toast';

interface TaskDetailProps {
  task: Task;
  onClose?: () => void;
}

const TaskDetail = ({ task, onClose }: TaskDetailProps) => {
  const { updateTask, deleteTask, updateGroup, updatePerson } = useTaskContext();
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [personModalOpen, setPersonModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setGroupModalOpen(true);
  };

  const handleUpdateGroup = (name: string) => {
    if (editingGroup) {
      const updatedGroup = { ...editingGroup, name };
      updateGroup(updatedGroup);
      toast({ title: "Success", description: "Group updated successfully" });
      setGroupModalOpen(false);
    }
  };

  const handleEditPerson = (person: Person) => {
    setEditingPerson(person);
    setPersonModalOpen(true);
  };

  const handleUpdatePerson = (name: string) => {
    if (editingPerson) {
      const updatedPerson = { ...editingPerson, name };
      updatePerson(updatedPerson);
      toast({ title: "Success", description: "Person updated successfully" });
      setPersonModalOpen(false);
    }
  };

  const handleDelete = () => {
    deleteTask(task.id);
    toast({ title: "Success", description: "Task deleted successfully" });
    setDeleteDialogOpen(false);
    if (onClose) onClose();
  };

  const handleTaskUpdate = () => {
    toast({ title: "Success", description: "Task updated successfully" });
  };

  const renderPriorityBadge = (priority: string) => {
    let className = '';
    switch (priority) {
      case 'high': className = 'priority-high'; break;
      case 'normal': className = 'priority-normal'; break;
      case 'low': className = 'priority-low'; break;
      case 'lowest': className = 'priority-lowest'; break;
    }
    
    return (
      <span className={`priority-badge ${className}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const renderEffortChip = (effort: number) => {
    return (
      <span className={`effort-chip effort-${effort}`}>{effort}</span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Task form is now directly embedded */}
      <TaskForm 
        task={task} 
        onSuccess={handleTaskUpdate}
      />

      <div className="border-t pt-4 mt-6 flex justify-between">
        <Button 
          variant="destructive" 
          size="sm"
          onClick={() => setDeleteDialogOpen(true)}
        >
          <Trash size={16} className="mr-1" />
          Delete
        </Button>
        
        <div className="flex gap-2">
          {onClose && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onClose}
            >
              Close
            </Button>
          )}
        </div>
      </div>

      <Dialog open={groupModalOpen} onOpenChange={setGroupModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
          </DialogHeader>
          <GroupForm 
            group={editingGroup} 
            onSave={handleUpdateGroup}
            onCancel={() => setGroupModalOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={personModalOpen} onOpenChange={setPersonModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Person</DialogTitle>
          </DialogHeader>
          <PersonForm 
            person={editingPerson} 
            onSave={handleUpdatePerson}
            onCancel={() => setPersonModalOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TaskDetail;
