
import { useState } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { Task, Tag, Person } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import GroupForm from './GroupForm';
import PersonForm from './PersonForm';
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
  const { updateTask, deleteTask } = useTaskContext();
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [personModalOpen, setPersonModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setTagModalOpen(true);
  };

  const handleCloseTagModal = () => {
    setTagModalOpen(false);
  };

  const handleEditPerson = (person: Person) => {
    setEditingPerson(person);
    setPersonModalOpen(true);
  };

  const handleClosePersonModal = () => {
    setPersonModalOpen(false);
  };

  const handleDelete = () => {
    deleteTask(task.id);
    toast({ title: "Success", description: "Task deleted successfully" });
    if (onClose) onClose();
  };

  const handleEditClick = () => {
    if (onEdit) onEdit();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Title</h3>
        <p>{task.title}</p>
        
        {task.description && (
          <>
            <h3 className="text-lg font-medium">Description</h3>
            <p className="whitespace-pre-wrap">{task.description}</p>
          </>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium">Priority</h3>
            <p className="capitalize">{task.priority}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Effort</h3>
            <p>{task.effortLevel}</p>
          </div>
        </div>

        {(task.dueDate || task.targetDeadline || task.goLiveDate) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {task.dueDate && (
              <div>
                <h3 className="text-sm font-medium">Due Date</h3>
                <p>{new Date(task.dueDate).toLocaleDateString()}</p>
              </div>
            )}
            {task.targetDeadline && (
              <div>
                <h3 className="text-sm font-medium">Target Deadline</h3>
                <p>{new Date(task.targetDeadline).toLocaleDateString()}</p>
              </div>
            )}
            {task.goLiveDate && (
              <div>
                <h3 className="text-sm font-medium">Go-Live Date</h3>
                <p>{new Date(task.goLiveDate).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        )}

        {task.tags.length > 0 && (
          <div>
            <h3 className="text-sm font-medium">Tags</h3>
            <div className="flex flex-wrap gap-1 mt-1">
              {task.tags.map(tag => (
                <span 
                  key={tag.id} 
                  className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {task.people.length > 0 && (
          <div>
            <h3 className="text-sm font-medium">People</h3>
            <div className="flex flex-wrap gap-1 mt-1">
              {task.people.map(person => (
                <span 
                  key={person.id} 
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                >
                  {person.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">Delete Task</Button>
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
        <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        <Button size="sm" onClick={handleEditClick}>Edit Task</Button>
      </div>

      <Dialog open={tagModalOpen} onOpenChange={setTagModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
          </DialogHeader>
          <GroupForm 
            group={editingTag} 
            onSave={handleCloseTagModal}
            onCancel={handleCloseTagModal} 
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
            onSave={handleClosePersonModal}
            onCancel={handleClosePersonModal} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskDetail;
