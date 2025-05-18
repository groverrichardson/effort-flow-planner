
import { useState } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { Task, Tag, Person } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from '@/components/ui/use-toast';

interface TaskDetailProps {
  task: Task;
  onClose?: () => void;
  onEdit?: () => void;
}

const TaskDetail = ({ task, onClose, onEdit }: TaskDetailProps) => {
  const { updateTask, deleteTask, updateTag, updatePerson } = useTaskContext();
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [personModalOpen, setPersonModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setTagModalOpen(true);
  };

  const handleUpdateTag = (name: string) => {
    if (editingTag) {
      const updatedTag = { ...editingTag, name };
      updateTag(updatedTag);
      toast({ title: "Success", description: "Tag updated successfully" });
      setTagModalOpen(false);
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
      
      <div className="flex justify-end">
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="gap-1">
              <Trash size={16} />
              Delete Task
            </Button>
          </AlertDialogTrigger>
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

      <Dialog open={tagModalOpen} onOpenChange={setTagModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
          </DialogHeader>
          <GroupForm 
            group={editingTag} 
            onSave={handleUpdateTag}
            onCancel={() => setTagModalOpen(false)} 
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
    </div>
  );
};

export default TaskDetail;
