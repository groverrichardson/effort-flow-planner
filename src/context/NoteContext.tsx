import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { Note } from '@/types/note';
import { NoteService } from '@/services/NoteService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import { useNoteStore } from '@/store/noteStore';

export interface NoteContextType {
  notes: Note[];
  getNoteById: (noteId: string) => Promise<Note | null>;
  addNote: (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Note | null>;
  updateNote: (note: Note) => Promise<Note | null>;
  deleteNote: (noteId: string) => Promise<void>;
  untagNoteFromTask: (noteId: string, taskId: string) => Promise<Note | null>;
  loading: boolean;
  fetchNotes: () => Promise<void>; // Explicit function to refresh notes
}

export const NoteContext = createContext<NoteContextType | undefined>(undefined);

export function NoteProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchNotes = useCallback(async () => {
    if (user) {
      setLoading(true);
      try {
        const notesData = await NoteService.getNotes();
        setNotes(notesData);
        useNoteStore.setState({ notes: notesData });
      } catch (error) {
        console.error('Error loading notes:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your notes. Please try refreshing the page.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    } else {
      setNotes([]);
        useNoteStore.setState({ notes: [] });
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const getNoteById = useCallback(async (noteId: string): Promise<Note | null> => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive' });
      return null;
    }
    // Rely on NoteService as the primary source for fetching a specific note.
    // The main `fetchNotes` useEffect populates the `notes` array for general listing.
    
    setLoading(true); // Context's loading state
    try {
      const note = await NoteService.getNoteById(noteId); // Mocked service call in tests
      if (note) {
        // Update the central notes list. Use functional update to avoid needing `notes` in deps.
        setNotes(prevNotes => {
          const existingNoteIndex = prevNotes.findIndex(n => n.id === note.id);
          if (existingNoteIndex !== -1) {
            // Update existing note
            const updatedNotes = [...prevNotes];
            updatedNotes[existingNoteIndex] = note;
            return updatedNotes;
          } else {
            // Add new note
            return [note, ...prevNotes];
          }
        });
        // Also update Zustand store
        useNoteStore.setState(state => {
            const existingNoteIndex = state.notes.findIndex(n => n.id === note.id);
            if (existingNoteIndex !== -1) {
                const updatedNotes = [...state.notes];
                updatedNotes[existingNoteIndex] = note;
                return { notes: updatedNotes };
            } else {
                return { notes: [note, ...state.notes] };
            }
        });
      }
      return note;
    } catch (error) {
      console.error(`Error fetching note ${noteId}:`, error);
      toast({ title: 'Error', description: 'Failed to fetch note details.', variant: 'destructive' });
      return null;
    } finally {
      setLoading(false); // Context's loading state
    }
  }, [user, setLoading, setNotes]);

  const addNote = useCallback(async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note | null> => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in to create notes.', variant: 'destructive' });
      return null;
    }
    setLoading(true);
    try {
      const newNote = await NoteService.createNote(noteData);
      if (newNote) {
        setNotes(prev => [newNote, ...prev]);
        // Also update the Zustand store
        useNoteStore.setState(state => ({ notes: [newNote, ...state.notes] }));
        toast({ title: 'Success', description: 'Note created successfully.' });
        return newNote;
      }
      return null;
    } catch (error) {
      console.error('Error adding note:', error);
      toast({ title: 'Error', description: 'Failed to create note.', variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateNote = useCallback(async (updatedNoteData: Note): Promise<Note | null> => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in to update notes.', variant: 'destructive' });
      return null;
    }
    setLoading(true);
    try {
      const updatedNote = await NoteService.updateNote(updatedNoteData);
      if (updatedNote) {
        setNotes(prev => prev.map(note => (note.id === updatedNote.id ? updatedNote : note)));
        // Also update the Zustand store
        useNoteStore.setState(state => ({ notes: state.notes.map(note => (note.id === updatedNote.id ? updatedNote : note)) }));
        toast({ title: 'Success', description: 'Note updated successfully.' });
        return updatedNote;
      }
      return null;
    } catch (error) {
      console.error('Error updating note:', error);
      toast({ title: 'Error', description: 'Failed to update note.', variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteNote = useCallback(async (noteId: string) => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in to delete notes.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await NoteService.deleteNote(noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
        // Also update the Zustand store
        useNoteStore.setState(state => ({ notes: state.notes.filter(note => note.id !== noteId) }));
      toast({ title: 'Success', description: 'Note deleted successfully.' });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({ title: 'Error', description: 'Failed to delete note.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const untagNoteFromTask = useCallback(async (noteId: string, taskId: string): Promise<Note | null> => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive' });
      return null;
    }
    // setLoading(true); // updateNote and getNoteById handle their own loading states
    try {
      const noteToUpdate = await getNoteById(noteId); // This uses the one from context which is already a useCallback
      if (!noteToUpdate) {
        toast({ title: 'Error', description: 'Note not found for untagging.', variant: 'destructive' });
        return null;
      }

      const updatedTaggedTaskIds = noteToUpdate.taggedTaskIds.filter(id => id !== taskId);

      if (updatedTaggedTaskIds.length === noteToUpdate.taggedTaskIds.length) {
        // Task ID was not found in the array, so no update is needed.
        // Optionally, inform the user, or just return the note as is.
        toast({ title: 'Info', description: 'This note is not currently tagged with the specified task.', variant: 'default' });
        return noteToUpdate; 
      }

      const noteWithUntaggedTask = { 
        ...noteToUpdate, 
        taggedTaskIds: updatedTaggedTaskIds,
        updatedAt: new Date() // Explicitly set updatedAt for the change
      };
      
      // Use the existing updateNote function (from context, already a useCallback) to save the changes
      const updatedNote = await updateNote(noteWithUntaggedTask);
      // updateNote already handles setNotes, Zustand update, and toast on success/failure
      if (updatedNote) {
        toast({ title: 'Success', description: 'Note untagged from task.' });
      } // updateNote will show its own error toast if it fails
      return updatedNote;

    } catch (error) {
      console.error(`Error untagging task ${taskId} from note ${noteId}:`, error);
      // Avoid double-toasting if updateNote already toasted an error.
      // However, if the error is from getNoteById or other logic here, a toast is good.
      if (!(error instanceof Error && error.message.includes('updateNote failed'))) { // Example check
        toast({ title: 'Error', description: 'An unexpected error occurred while untagging the note.', variant: 'destructive' });
      }
      return null;
    } finally {
      // setLoading(false); // updateNote and getNoteById manage their own loading states.
    }
  }, [user, getNoteById, updateNote]);

  const contextValue = useMemo(() => ({
    notes,
    getNoteById,
    addNote,
    updateNote,
    deleteNote,
    untagNoteFromTask,
    loading,
    fetchNotes,
  }), [
    notes,
    getNoteById,
    addNote,
    updateNote,
    deleteNote,
    untagNoteFromTask,
    loading,
    fetchNotes
  ]);

  return (
    <NoteContext.Provider value={contextValue}>
      {children}
    </NoteContext.Provider>
  );
}

export const useNoteContext = () => {
  const context = useContext(NoteContext);
  if (context === undefined) {
    throw new Error('useNoteContext must be used within a NoteProvider');
  }
  return context;
};
