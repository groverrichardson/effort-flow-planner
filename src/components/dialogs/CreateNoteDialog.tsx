import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import NoteForm from '../forms/NoteForm'; // Corrected import
import { Note } from '@/types/note';

interface CreateNoteDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCreateNote: (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialTaskId?: string; // To pre-select a task when creating a note from a task
  // We might add an existingNote prop later if we want to use this dialog for editing
  // existingNote?: Note;
}

const CreateNoteDialog: React.FC<CreateNoteDialogProps> = ({ isOpen, onOpenChange, onCreateNote, initialTaskId }) => {
  const isEditing = false; // For now, only new notes. Will be based on existingNote prop later.
  const title = isEditing ? 'Edit Note' : 'Create New Note';
  const description = isEditing ? 'Update the details of your note below.' : 'Fill in the details below to create a new note.';

  const handleSubmit = (formData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    onCreateNote(formData);
    onOpenChange(false); // Close dialog on submit
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {/* DialogTrigger is usually handled by the parent component that controls this dialog */}
      <DialogContent className="sm:max-w-[425px]" id="create-note-dialog-content">
        <DialogTitle className="sr-only" id="create-note-dialog-sr-title">{title}</DialogTitle>
        <DialogHeader>
          <div className="text-lg font-semibold leading-none tracking-tight" id="create-note-dialog-visible-title">{title}</div>
          <DialogDescription id="create-note-dialog-description">
            {description}
          </DialogDescription>
        </DialogHeader>
        <NoteForm onSubmit={handleSubmit} initialTaskId={initialTaskId} /> {/* existingNote can be added later for editing */}
        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" id="cancel-create-note-button">Cancel</Button>
          </DialogClose>
          <Button type="submit" form="note-form" id="submit-create-note-button">
            {isEditing ? 'Save Changes' : 'Create Note'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNoteDialog;
