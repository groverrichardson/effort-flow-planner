import { vi, describe, it, expect, beforeEach, afterEach, Mock } from 'vitest';
import { useNoteStore } from './noteStore';
import { NoteService } from '@/services/NoteService';
import { Note } from '@/types';

// Mock NoteService
vi.mock('@/services/NoteService', () => ({
  NoteService: {
    updateNote: vi.fn(),
    // Mock other NoteService methods if they are ever called directly by the store
    // For now, only updateNote is directly relevant to removeTagFromNote
  },
}));

const initialNotes: Note[] = [
  {
    id: 'note-1',
    userId: 'test-user-id',
    name: 'Test Note 1',
    body: 'Body 1',
    taggedTaskIds: ['task-1', 'task-2'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'note-2',
    userId: 'test-user-id',
    name: 'Test Note 2',
    body: 'Body 2',
    taggedTaskIds: ['task-2', 'task-3'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'note-3',
    userId: 'test-user-id',
    name: 'Test Note 3',
    body: 'Body 3',
    taggedTaskIds: [], // No tasks initially
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('useNoteStore - removeTagFromNote', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useNoteStore.setState(state => ({ ...state, notes: JSON.parse(JSON.stringify(initialNotes)) })); // Use functional update to ensure merge and preserve actions
    // Clear mock call history
    vi.clearAllMocks();
  });

  it('should successfully untag a task and update the note via NoteService', async () => {
    const noteIdToUpdate = 'note-1';
    const taskIdToRemove = 'task-1';
    const expectedUpdatedTaggedTaskIds = ['task-2'];

    const originalNote = initialNotes.find(n => n.id === noteIdToUpdate)!;
    const mockUpdatedNote: Note = {
      ...originalNote,
      userId: 'test-user-id', // Added missing userId
      taggedTaskIds: expectedUpdatedTaggedTaskIds,
      updatedAt: new Date(), // Service would return a new updatedAt
    };

    (NoteService.updateNote as Mock).mockResolvedValue(mockUpdatedNote);

    await useNoteStore.getState().removeTagFromNote(noteIdToUpdate, taskIdToRemove);

    expect(NoteService.updateNote).toHaveBeenCalledTimes(1);
    expect(NoteService.updateNote).toHaveBeenCalledWith(
      expect.objectContaining({
        id: noteIdToUpdate,
        taggedTaskIds: expectedUpdatedTaggedTaskIds,
      })
    );

    const storeNote = useNoteStore.getState().getNoteById(noteIdToUpdate);
    expect(storeNote).toBeDefined();
    expect(storeNote?.taggedTaskIds).toEqual(expectedUpdatedTaggedTaskIds);
    // Check if the store's note matches the one returned by the mocked service
    expect(storeNote?.updatedAt).toEqual(mockUpdatedNote.updatedAt); 
  });

  it('should not call NoteService.updateNote if the task ID is not tagged to the note', async () => {
    const noteIdToUpdate = 'note-1';
    const taskIdToRemove = 'task-nonexistent';

    await useNoteStore.getState().removeTagFromNote(noteIdToUpdate, taskIdToRemove);

    expect(NoteService.updateNote).not.toHaveBeenCalled();
    const storeNote = useNoteStore.getState().getNoteById(noteIdToUpdate);
    expect(storeNote?.taggedTaskIds).toEqual(initialNotes.find(n => n.id === noteIdToUpdate)?.taggedTaskIds);
  });

  it('should throw an error if the note to untag is not found in the store', async () => {
    const noteIdToUpdate = 'note-nonexistent';
    const taskIdToRemove = 'task-1';

    await expect(
      useNoteStore.getState().removeTagFromNote(noteIdToUpdate, taskIdToRemove)
    ).rejects.toThrow(`Note with ID ${noteIdToUpdate} not found.`);
    expect(NoteService.updateNote).not.toHaveBeenCalled();
  });

  it('should propagate an error if NoteService.updateNote fails', async () => {
    const noteIdToUpdate = 'note-1';
    const taskIdToRemove = 'task-1';
    const errorMessage = 'Supabase network error';

    (NoteService.updateNote as Mock).mockRejectedValue(new Error(errorMessage));

    await expect(
      useNoteStore.getState().removeTagFromNote(noteIdToUpdate, taskIdToRemove)
    ).rejects.toThrow(errorMessage);

    expect(NoteService.updateNote).toHaveBeenCalledTimes(1);
    // Ensure local store state is not changed if service call fails
    const storeNote = useNoteStore.getState().getNoteById(noteIdToUpdate);
    expect(storeNote?.taggedTaskIds).toEqual(initialNotes.find(n => n.id === noteIdToUpdate)?.taggedTaskIds);
  });

  it('should throw an error if NoteService.updateNote returns null/undefined (update failed)', async () => {
    const noteIdToUpdate = 'note-1';
    const taskIdToRemove = 'task-1';

    (NoteService.updateNote as Mock).mockResolvedValue(null);

    await expect(
      useNoteStore.getState().removeTagFromNote(noteIdToUpdate, taskIdToRemove)
    ).rejects.toThrow('Failed to update note on the server.');

    expect(NoteService.updateNote).toHaveBeenCalledTimes(1);
    const storeNote = useNoteStore.getState().getNoteById(noteIdToUpdate);
    expect(storeNote?.taggedTaskIds).toEqual(initialNotes.find(n => n.id === noteIdToUpdate)?.taggedTaskIds);
  });
});
