import { Task } from '@/types';

// Defines the structure for a Note object
export interface Note {
  id: string; // Unique identifier for the note
  name: string; // Title or name of the note
  body: string; // Main content of the note
  createdAt: Date; // Timestamp of when the note was created
  updatedAt: Date; // Timestamp of when the note was last updated
  taggedTaskIds: string[]; // Array of Task IDs linked to this note
  userId: string; // Identifier of the user who owns the note
  is_archived: boolean; // Whether the note is archived
}

// Represents a Note with its associated Task objects fully populated
// Useful for displaying notes with their linked tasks' details
export interface NoteWithTasks extends Omit<Note, 'taggedTaskIds'> {
  taggedTasks: Task[];
}
