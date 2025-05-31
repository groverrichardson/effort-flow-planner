
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
import { useNavigate } from 'react-router-dom';
import { useNoteContext } from '@/context/NoteContext';
import { Trash2 } from 'lucide-react';

interface TaskDetailProps {
  task: Task;
  onClose?: () => void;
  onEdit?: () => void;
  onDelete?: () => void; // Add onDelete prop
}

const TaskDetail = ({ task, onClose, onEdit, onDelete }: TaskDetailProps) => {
  const { updateTask, deleteTask } = useTaskContext();
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [personModalOpen, setPersonModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const navigate = useNavigate();
  const { notes: allNotes, loading: notesLoading, untagNoteFromTask } = useNoteContext();

  const taskNotes = allNotes.filter(note => note.taggedTaskIds.includes(task.id));

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setTagModalOpen(true);
  };

  const handleCloseTagModal = () => {
    setEditingTag(null);
    setTagModalOpen(false);
  };

  const handleEditPerson = (person: Person) => {
    setEditingPerson(person);
    setPersonModalOpen(true);
  };

  const handleClosePersonModal = () => {
    setEditingPerson(null);
    setPersonModalOpen(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(); // Call the parent's delete handler
    } else {
      // Fallback if onDelete is not provided (though TaskDetailPage should always provide it)
      console.warn("TaskDetail: onDelete prop not provided. Using local delete and close.");
      deleteTask(task.id); // deleteTask from useTaskContext()
      toast({ title: "Task Deleted (Local)", description: `Task "${task.title}" has been deleted.` });
      if (onClose) onClose();
    }
  };

  const handleEditClick = () => {
    if (onEdit) onEdit();
  };

  const handleUntagNote = async (noteId: string) => {
    if (!task || !task.id) {
      toast({ title: "Error", description: "Task context is missing.", variant: "destructive" });
      return;
    }
    const updatedNote = await untagNoteFromTask(noteId, task.id);
    if (updatedNote) {
      // The context should trigger a re-render of components consuming 'notes'
      // No direct state update needed here for taskNotes as it's derived from allNotes
    } else {
      // Error toast is handled by untagNoteFromTask in context
    }
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
                  className="bg-primary/10 text-primary dark:bg-slate-700 dark:text-slate-200 text-xs px-2 py-1 rounded-full"
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
                  className="bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100 text-xs px-2 py-1 rounded-full"
                >
                  {person.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notes Section */}
      <div className="space-y-2 pt-4 border-t" id={`task-${task.id}-notes-section`}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium" id={`task-${task.id}-notes-header`}>Notes</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(`/tasks/${task.id}/notes/new`)}
            id={`task-${task.id}-add-note-button`}
          >
            Add Note
          </Button>
        </div>
        {notesLoading ? (
          <p id={`task-${task.id}-notes-loading`}>Loading notes...</p>
        ) : taskNotes.length > 0 ? (
          <ul className="space-y-2" id={`task-${task.id}-notes-list`}>
            {taskNotes.map(note => (
              <li key={note.id} className="p-3 border rounded-lg shadow-sm bg-card flex justify-between items-center hover:shadow-md transition-shadow duration-200" id={`task-${task.id}-note-${note.id}-item`}>
                <span className="text-card-foreground font-medium">{note.name}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate(`/notes/${note.id}/edit`, { state: { from: `/tasks/${task.id}` } })} 
                  id={`task-${task.id}-edit-note-${note.id}-button`}
                  aria-label={`Edit note ${note.name}`}
                >
                  Edit
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleUntagNote(note.id)} 
                  id={`task-${task.id}-untag-note-${note.id}-button`}
                  aria-label={`Untag note ${note.name} from this task`}
                  className="ml-2 text-destructive hover:text-destructive/80"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p id={`task-${task.id}-no-notes-message`} className="text-muted-foreground">No notes for this task yet.</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">Delete Task</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            {/* Added sr-only AlertDialogTitle for accessibility compliance */}
            <AlertDialogTitle className="sr-only">Confirm Task Deletion</AlertDialogTitle>
            <AlertDialogHeader>
              {/* Changed original AlertDialogTitle to a div, styles preserved */}
              <div className="text-lg font-semibold leading-none tracking-tight">Are you sure?</div>
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
          {/* Added sr-only DialogTitle for accessibility compliance */}
          <DialogTitle className="sr-only">Edit Tag Details</DialogTitle>
          <DialogHeader>
            {/* Changed original DialogTitle to a div, styles preserved */}
            <div className="text-lg font-semibold leading-none tracking-tight">Edit Tag</div>
          </DialogHeader>
          {editingTag && (
            <GroupForm 
              group={editingTag} 
              onSave={handleCloseTagModal}
              onCancel={handleCloseTagModal} 
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={personModalOpen} onOpenChange={setPersonModalOpen}>
        <DialogContent>
          {/* Added sr-only DialogTitle for accessibility compliance */}
          <DialogTitle className="sr-only">Edit Person Details</DialogTitle>
          <DialogHeader>
            {/* Changed original DialogTitle to a div, styles preserved */}
            <div className="text-lg font-semibold leading-none tracking-tight">Edit Person</div>
          </DialogHeader>
          {editingPerson && (
            <PersonForm 
              person={editingPerson} 
              onSave={handleClosePersonModal}
              onCancel={handleClosePersonModal} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskDetail;
