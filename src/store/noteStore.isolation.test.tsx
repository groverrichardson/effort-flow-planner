import { describe, test, expect, vi } from 'vitest';
import { useNoteStore } from '@/store/noteStore'; // The module we are trying to mock and test

// MINIMAL VI.MOCK TEST FOR @/store/noteStore
vi.mock('@/store/noteStore', () => {
  console.log('[MINIMAL MOCK TEST - ISOLATION] Factory for @/store/noteStore EXECUTED!');
  return {
    useNoteStore: vi.fn(() => ({
      fetchNotes: vi.fn(() => {
        console.log('[MINIMAL MOCK TEST - ISOLATION] fetchNotes CALLED');
        return Promise.resolve([]);
      }),
      getNoteById: vi.fn(),
      addNote: vi.fn(),
      updateNote: vi.fn(),
      deleteNote: vi.fn(),
      fetchNotesByTaskId: vi.fn(),
      notes: [],
    })),
  };
});

describe('useNoteStore Mocking Isolation Test', () => {
  test('should use the mocked useNoteStore and call fetchNotes', () => {
    console.log('[ISOLATION TEST] Running test case...');
    const store = useNoteStore();
    expect(store.fetchNotes).toBeDefined();
    try {
      store.fetchNotes(); // This should call the mocked version
      // If fetchNotes is undefined here, the mock is not working
      expect(true).toBe(true); // If it doesn't throw, it's a good sign
    } catch (e) {
      console.error('[ISOLATION TEST] Error calling fetchNotes:', e);
      expect(e).toBeUndefined(); // Force failure if it throws
    }
    console.log('[ISOLATION TEST] fetchNotes was called (or at least existed).');
  });
});
