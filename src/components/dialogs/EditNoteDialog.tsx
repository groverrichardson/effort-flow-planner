import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import NoteForm from '@/components/forms/NoteForm';
import { Note } from '@/types';
import { useNoteStore } from '@/store/noteStore'; // Assuming you use Zustand for notes
import { Button } from '@/components/ui/button';

interface EditNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteId: string | null;
  onSuccess?: () => void; // Optional: Callback on successful save
}

const EditNoteDialog: React.FC<EditNoteDialogProps> = ({ open, onOpenChange, noteId, onSuccess }) => {
  const { getNoteById, updateNote } = useNoteStore();
  const [currentNote, setCurrentNote] = useState<Note | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (noteId && open) {
      setIsLoading(true);
      setError(null);
      const note = getNoteById(noteId);
      if (note) {
        setCurrentNote(note);
      } else {
        setError('Note not found.');
        // console.error(`Note with ID ${noteId} not found.`);
        // Optionally close dialog or show error
      }
      setIsLoading(false);
    } else if (!open) {
      // Reset when dialog is closed
      setCurrentNote(undefined);
      setError(null);
    }
  }, [noteId, open, getNoteById]);

  const handleNoteSubmit = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!currentNote || !currentNote.id) {
      setError('Cannot save note: Current note context is missing.');
      return;
    }
    setIsLoading(true);
    try {
      await updateNote(currentNote.id, noteData);
      setIsLoading(false);
      onOpenChange(false); // Close dialog
      if (onSuccess) {
        onSuccess(); // Call success callback if provided
      }
    } catch (err) {
      setIsLoading(false);
      setError('Failed to save note. Please try again.');
      // console.error('Failed to update note:', err);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogTitle className="sr-only" id="edit-note-dialog-sr-title">Edit Note</DialogTitle>
        <DialogHeader>
          <div className="text-lg font-semibold leading-none tracking-tight" id="edit-note-dialog-visible-title">Edit Note</div>
          <DialogDescription id="edit-note-dialog-description">
            Update the details of your note below.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading && <p id="edit-note-loading-message">Loading note...</p>}
        {error && <p className="text-red-500" id="edit-note-error-message">Error: {error}</p>}
        
        {currentNote && !isLoading && !error && (
          <NoteForm 
            existingNote={currentNote} 
            onSubmit={handleNoteSubmit} 
            onCancel={handleCancel} 
          />
        )}

        {!currentNote && !isLoading && !error && noteId && (
            <p id="edit-note-not-found-message">Note with ID '{noteId}' could not be loaded or found.</p>
        )}

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={handleCancel} id="edit-note-cancel-button">Cancel</Button>
          </DialogClose>
          <Button 
            type="submit" 
            form="note-form" // Assuming NoteForm has id="note-form"
            disabled={isLoading || !currentNote} 
            id="edit-note-save-button"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditNoteDialog;
