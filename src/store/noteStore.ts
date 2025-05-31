import { create } from 'zustand';
import { Note } from '../types/note';
import { Task } from '@/types'; // Assuming you'll need Task type for linking
import { NoteService } from '@/services/NoteService'; // Added for backend calls

interface NoteState {
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Note;
  updateNote: (noteId: string, updates: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteNote: (noteId: string) => void;
  getNoteById: (noteId: string) => Note | undefined;
  getNotesByTaskId: (taskId: string) => Note[];
  // Function to tag an existing note to an additional task
  addTagToNote: (noteId: string, taskId: string) => void;
  // Function to remove a tag from a note
  removeTagFromNote: (noteId: string, taskId: string) => Promise<void>; // Now async
  deleteMultipleNotes: (noteIds: string[]) => void;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],

  addNote: (noteData) => {
    const newNote: Note = {
      ...noteData,
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      taggedTaskIds: noteData.taggedTaskIds || [], // Ensure taggedTaskIds is initialized
    };
    set((state) => ({ notes: [...state.notes, newNote] }));
    return newNote;
  },

  updateNote: (noteId, updates) => {
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === noteId ? { ...note, ...updates, updatedAt: new Date() } : note
      ),
    }));
  },

  deleteNote: (noteId) => {
    set((state) => ({ notes: state.notes.filter((note) => note.id !== noteId) }));
  },

  deleteMultipleNotes: (noteIds) => {
    set((state) => ({
      notes: state.notes.filter((note) => !noteIds.includes(note.id)),
    }));
  },

  getNoteById: (noteId) => {
    return get().notes.find((note) => note.id === noteId);
  },

  getNotesByTaskId: (taskId) => {
    return get().notes.filter((note) => note.taggedTaskIds.includes(taskId));
  },

  addTagToNote: (noteId, taskId) => {
    set((state) => ({
      notes: state.notes.map((note) => {
        if (note.id === noteId && !note.taggedTaskIds.includes(taskId)) {
          return {
            ...note,
            taggedTaskIds: [...note.taggedTaskIds, taskId],
            updatedAt: new Date(),
          };
        }
        return note;
      }),
    }));
  },

  removeTagFromNote: async (noteId, taskId) => {
    const currentNote = get().getNoteById(noteId);

    if (!currentNote) {
      console.error(`[noteStore] Note with ID ${noteId} not found in store for untagging.`);
      // Optionally throw an error or display a toast to the user
      throw new Error(`Note with ID ${noteId} not found.`);
    }

    const updatedTaggedTaskIds = currentNote.taggedTaskIds.filter((id) => id !== taskId);

    // If the task ID wasn't in the list, no actual change is needed.
    if (updatedTaggedTaskIds.length === currentNote.taggedTaskIds.length) {
      console.log(`[noteStore] Task ID ${taskId} was not tagged to note ${noteId}. No update needed.`);
      return; // No change, so no need to call service or update state
    }

    const noteToUpdate: Note = {
      ...currentNote,
      taggedTaskIds: updatedTaggedTaskIds,
      updatedAt: new Date(), // Ensure updatedAt is fresh for the update operation
    };

    try {
      const updatedNoteFromService = await NoteService.updateNote(noteToUpdate);

      if (updatedNoteFromService) {
        // Update the store with the note returned from the service (most up-to-date)
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === noteId ? updatedNoteFromService : n
          ),
        }));
      } else {
        // This case might indicate an issue where the service call was 'successful' (no error thrown)
        // but didn't return the expected updated note (e.g., update affected 0 rows on DB).
        console.error(`[noteStore] NoteService.updateNote for note ${noteId} did not return an updated note.`);
        // Consider re-fetching or specific error handling if this state is critical
        throw new Error('Failed to update note on the server.');
      }
    } catch (error) {
      console.error(`[noteStore] Error calling NoteService.updateNote for note ${noteId} to remove task ${taskId}:`, error);
      // Rethrow the error so the calling component (e.g., TaskForm) can catch it and show a toast
      throw error;
    }
  },
}));

// Example usage (optional, for demonstration or testing):
// const { notes, addNote, getNotesByTaskId } = useNoteStore.getState();
// const newNote = addNote({ name: 'My First Note', body: 'This is the content.', taggedTaskIds: ['task-1'] });
// const notesForTask1 = getNotesByTaskId('task-1');
// console.log(newNote, notesForTask1);
