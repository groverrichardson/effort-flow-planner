
import { useState } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { Task, Group, Person } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import GroupForm from './GroupForm';
import PersonForm from './PersonForm';
import TaskForm from './TaskForm';
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
  onEdit?: () => void; // Added onEdit prop to the interface
}

const TaskDetail = ({ task, onClose, onEdit }: TaskDetailProps) => {
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
    if (onEdit) onEdit();
  };

  return (
    <div className="space-y-4">
      {/* Task form is directly embedded */}
      <TaskForm 
        task={task} 
        onSuccess={handleTaskUpdate}
        onCancel={onClose}
      />

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
