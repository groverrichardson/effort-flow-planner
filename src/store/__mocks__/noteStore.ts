import { vi } from 'vitest';
import type { Note } from '@/types'; // Assuming Note type is needed

// You might need a more specific mock note if your tests depend on its content
const mockNoteForTaskFormManual: Note = {
  id: 'note-manual-mock-1',
  name: 'Manually Mocked Note',
  body: 'This is a body from the manual mock.',
  taggedTaskIds: ['task-123'],
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: 'mock-user-id-manual',
  is_archived: false,
};

console.log('[TEST DEBUG] Manual mock src/store/__mocks__/noteStore.ts - EXECUTED');

const mockFetchNotesFn = vi.fn(() => {
  console.log('[TEST DEBUG] Manual mock: fetchNotes CALLED');
  return Promise.resolve([mockNoteForTaskFormManual]);
});

const mockGetNoteByIdFn = vi.fn((noteId: string) => {
  console.log(`[TEST DEBUG] Manual mock: getNoteById CALLED with ${noteId}`);
  if (noteId === mockNoteForTaskFormManual.id) {
    return mockNoteForTaskFormManual;
  }
  return undefined;
});

const useNoteStore = vi.fn(() => {
  console.log('[TEST DEBUG] Manual mock: useNoteStore hook CALLED');
  return {
    notes: [mockNoteForTaskFormManual],
    fetchNotes: mockFetchNotesFn,
    getNoteById: mockGetNoteByIdFn,
    addNote: vi.fn(() => Promise.resolve()),
    updateNote: vi.fn(() => Promise.resolve()),
    deleteNote: vi.fn(() => Promise.resolve()),
    fetchNotesByTaskId: vi.fn(() => Promise.resolve([mockNoteForTaskFormManual])),
  };
});

export { useNoteStore };
