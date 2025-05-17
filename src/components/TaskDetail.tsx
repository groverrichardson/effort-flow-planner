
import { useState } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { Task, Group, Person } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import GroupForm from './GroupForm';
import PersonForm from './PersonForm';
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
  onEdit?: () => void;
  onClose?: () => void;
}

const TaskDetail = ({ task, onEdit, onClose }: TaskDetailProps) => {
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
      <div>
        <h3 className="text-xl font-bold mb-2">{task.title}</h3>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {renderPriorityBadge(task.priority)}
          {renderEffortChip(task.effortLevel)}
          {task.completed && (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              Completed
            </Badge>
          )}
        </div>
        <p className="text-gray-600 whitespace-pre-wrap">{task.description || "No description"}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {task.dueDate && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={16} />
              <span className="text-sm font-medium">Due Date</span>
            </div>
            <p className="text-sm">{format(new Date(task.dueDate), 'PPP')}</p>
          </div>
        )}

        {task.targetDeadline && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={16} />
              <span className="text-sm font-medium">Target Deadline</span>
            </div>
            <p className="text-sm">{format(new Date(task.targetDeadline), 'PPP')}</p>
          </div>
        )}

        {task.goLiveDate && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={16} />
              <span className="text-sm font-medium">Go-Live Date</span>
            </div>
            <p className="text-sm">{format(new Date(task.goLiveDate), 'PPP')}</p>
          </div>
        )}
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Groups/Areas</h4>
        <div className="flex flex-wrap gap-2 mb-2">
          {task.groups.length > 0 ? (
            task.groups.map(group => (
              <Badge key={group.id} variant="outline" className="group-tag flex items-center gap-1">
                {group.name}
                <button 
                  onClick={() => handleEditGroup(group)} 
                  className="ml-1 rounded-full hover:bg-secondary h-4 w-4 flex items-center justify-center"
                >
                  <Edit size={10} />
                </button>
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No groups assigned</p>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">People</h4>
        <div className="flex flex-wrap gap-2 mb-2">
          {task.people.length > 0 ? (
            task.people.map(person => (
              <Badge key={person.id} variant="outline" className="people-tag flex items-center gap-1">
                {person.name}
                <button 
                  onClick={() => handleEditPerson(person)} 
                  className="ml-1 rounded-full hover:bg-secondary h-4 w-4 flex items-center justify-center"
                >
                  <Edit size={10} />
                </button>
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No people assigned</p>
          )}
        </div>
      </div>

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
          
          {onEdit && (
            <Button 
              size="sm"
              onClick={onEdit}
            >
              <Edit size={16} className="mr-1" />
              Edit
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
