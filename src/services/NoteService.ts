import { supabase } from '@/integrations/supabase/client';
import { Note } from '@/types/note';

// Define a type for the raw note object from Supabase
// This helps in explicitly mapping DB columns to our Note type
interface SupabaseNote {
  id: string;
  name: string;
  body: string;
  created_at: string; // Supabase typically returns ISO strings for timestamps
  updated_at: string;
  user_id: string;
  tagged_task_ids?: string[]; // Assuming this column exists and is an array of UUIDs/strings
  is_archived: boolean;
}

const mapSupabaseToNote = (dbNote: SupabaseNote): Note => ({
  id: dbNote.id,
  name: dbNote.name,
  body: dbNote.body,
  createdAt: new Date(dbNote.created_at),
  updatedAt: new Date(dbNote.updated_at),
  taggedTaskIds: dbNote.tagged_task_ids || [],
  is_archived: dbNote.is_archived,
  userId: dbNote.user_id,
});

export const NoteService = {
  async getNotes(includeArchived = false): Promise<Note[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('User not authenticated, cannot fetch notes.');
      return [];
    }

    let query = supabase
      .from('notes') // This string must match your Supabase table name
      .select('*')
      .eq('user_id', user.id);

    if (!includeArchived) {
      query = query.eq('is_archived', false);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching notes:', error);
      // Check if error is due to 'notes' table not found (e.g., error.message.includes('relation "notes" does not exist'))
      // If so, this indicates a schema mismatch or the table needs to be created/typed.
      return [];
    }
    // Explicitly cast 'data' to SupabaseNote[] if Supabase types are not fully resolved
    const dbNotes = data as SupabaseNote[] || [];
    return dbNotes.map(mapSupabaseToNote);
  },

  async getNoteById(noteId: string): Promise<Note | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('User not authenticated, cannot fetch note.');
      return null;
    }

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching note by ID:', error);
      return null;
    }
    const dbNote = data as SupabaseNote | null;
    return dbNote ? mapSupabaseToNote(dbNote) : null;
  },

  async createNote(noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated, cannot create note.');
      throw new Error('User not authenticated');
    }

    const { name, body, taggedTaskIds } = noteData;
    const dbPayload = {
      name,
      body,
      user_id: user.id,
      tagged_task_ids: taggedTaskIds || [],
      // created_at and updated_at are usually handled by DB defaults (e.g. now())
    };

    const { data, error } = await supabase
      .from('notes')
      .insert(dbPayload)
      .select()
      .single();

    if (error) {
      console.error('Error creating note:', error);
      throw error;
    }
    const dbNote = data as SupabaseNote | null;
    return dbNote ? mapSupabaseToNote(dbNote) : null;
  },

  async updateNote(note: Note): Promise<Note | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated, cannot update note.');
      throw new Error('User not authenticated');
    }

    const { id, name, body, taggedTaskIds } = note;
    const dbPayload = {
      name,
      body,
      tagged_task_ids: taggedTaskIds || [],
      updated_at: new Date().toISOString(), // Explicitly set updated_at for updates
    };

    const { data, error } = await supabase
      .from('notes')
      .update(dbPayload)
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns the note
      .select()
      .single();

    if (error) {
      console.error('Error updating note:', error);
      throw error;
    }
    const dbNote = data as SupabaseNote | null;
    return dbNote ? mapSupabaseToNote(dbNote) : null;
  },

  async archiveNote(noteId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated, cannot archive note.');
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('notes')
      .update({ is_archived: true, updated_at: new Date().toISOString() })
      .eq('id', noteId)
      .eq('user_id', user.id); // Ensure user owns the note

    if (error) {
      console.error('Error archiving note:', error);
      throw error;
    }
  },
};
