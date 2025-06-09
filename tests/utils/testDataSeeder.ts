import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Priority, TaskStatus, EffortLevel, DueDateType, Task } from '../../src/types';
import { Note } from '../../src/types/note';
import { Database } from '../../src/types/supabase';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Constants for test data generation
const TEST_TAG_PREFIX = 'test_tag_';
const TEST_PERSON_PREFIX = 'test_person_';
const TEST_TASK_PREFIX = 'Test Task:';
const TEST_NOTE_PREFIX = 'Test Note:';

// Task data templates for different scenarios
export enum TestTaskTemplate {
  BASIC = 'basic',
  HIGH_PRIORITY = 'high_priority',
  COMPLETED = 'completed',
  DUE_TODAY = 'due_today',
  DUE_TOMORROW = 'due_tomorrow',
  OVERDUE = 'overdue',
  WITH_TAGS = 'with_tags',
  WITH_EFFORT = 'with_effort',
}

// Interface for creating rich test tasks
export interface RichTaskOptions {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: Date | null;
  dueDateType?: DueDateType;
  effortLevel?: EffortLevel;
  completed?: boolean;
  tags?: string[];
}

// Note data templates for different scenarios
export enum TestNoteTemplate {
  BASIC = 'basic',
  RICH_TEXT = 'rich_text',
  WITH_TASKS = 'with_tasks',
  ARCHIVED = 'archived',
  WITH_MARKDOWN = 'with_markdown',
}

// Interface for creating rich test notes
export interface RichNoteOptions {
  name?: string;
  body?: string;
  taggedTaskIds?: string[];
  is_archived?: boolean;
}

// Mixed data creation options
export interface TaskWithNotesOptions {
  taskOptions: RichTaskOptions;
  noteCount?: number;
  noteTemplate?: TestNoteTemplate;
  customNoteOptions?: RichNoteOptions;
}

// Generate a random date between two dates
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Convert import.meta.url to path for ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to Playwright auth state file
const AUTH_FILE_PATH = path.join(
  __dirname,
  '..',
  '..',
  'playwright',
  '.auth',
  'user.json'
);

/**
 * TestDataSeeder - Utility to seed test data for UI tests
 * 
 * This utility creates test tasks in the Supabase database for UI testing.
 * It reuses the authentication from Playwright's storageState to ensure tasks
 * are created for the test user account.
 */
export class TestDataSeeder {
  private supabase: SupabaseClient<Database>;
  private userId: string | undefined;
  private initialized = false;

  /**
   * Create a TestDataSeeder instance
   * @param supabaseClient Optional custom Supabase client for testing
   */
  constructor(supabaseClient?: SupabaseClient<Database>) {
    if (supabaseClient) {
      // Use the provided client (for testing)
      this.supabase = supabaseClient;
    } else {
      // Create a client using environment variables
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase URL and Anon Key must be provided in environment variables');
      }
      
      this.supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
    }
  }

  /**
   * Initialize the seeder by loading the existing authenticated session from Playwright
   * This must be called before any seeding operations
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Check if the auth file exists
      if (!fs.existsSync(AUTH_FILE_PATH)) {
        throw new Error(`Authentication state file not found at ${AUTH_FILE_PATH}. Run Playwright global setup first.`);
      }

      // Read the auth file
      const authFileContent = fs.readFileSync(AUTH_FILE_PATH, 'utf-8');
      const storageState = JSON.parse(authFileContent);

      // Extract the Supabase session from the storage state
      const supabaseOrigin = storageState.origins.find(origin => {
        return origin.origin.includes('supabase') || origin.localStorage?.some(item => item.name.includes('supabase'));
      });

      if (!supabaseOrigin) {
        throw new Error('Could not find Supabase origin in storage state');
      }

      // Find the Supabase session in localStorage
      const supabaseSessionItem = supabaseOrigin.localStorage?.find(item => item.name.includes('auth-token'));
      
      if (!supabaseSessionItem) {
        throw new Error('Could not find Supabase session in storage state');
      }

      // Parse the session
      const session = JSON.parse(supabaseSessionItem.value);

      // Set the session in the Supabase client
      await this.supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });

      // Get the user ID
      const { data, error } = await this.supabase.auth.getUser();
      
      if (error || !data.user) {
        throw new Error(`Failed to get user: ${error?.message || 'User not found'}`);
      }

      this.userId = data.user.id;
      this.initialized = true;

      console.log('TestDataSeeder initialized for user ID:', this.userId);
    } catch (error) {
      console.error('Failed to initialize TestDataSeeder:', error);
      throw error;
    }
  }
  
  /**
   * Create a basic test task with minimal required fields
   */
  async createBasicTask(title?: string): Promise<Task> {
    if (!this.initialized || !this.userId) {
      await this.initialize();
    }
    
    const taskData = {
      title: title || `${TEST_TASK_PREFIX} ${new Date().toISOString()}`,
      description: 'This is a test task created for UI testing',
      status: TaskStatus.PENDING,
      priority: Priority.NORMAL,
      due_date_type: DueDateType.NONE,
      due_date: null,
      target_deadline: null,
      scheduled_date: null,
      go_live_date: null,
      effort_level: EffortLevel.M,
      completed: false,
      completed_date: null,
      is_archived: false,
      user_id: this.userId,
    };
    
    return this.createTask(taskData);
  }
  
  /**
   * Create a rich test task with custom options
   */
  async createRichTask(options: RichTaskOptions): Promise<Task> {
    if (!this.initialized || !this.userId) {
      await this.initialize();
    }
    
    const timestamp = new Date().toISOString();
    
    // Base task data with defaults
    const taskData: any = {
      title: options.title || `${TEST_TASK_PREFIX} Rich Task ${timestamp}`,
      description: options.description || 'This is a rich test task with custom options',
      status: options.status || TaskStatus.PENDING,
      priority: options.priority || Priority.NORMAL,
      due_date_type: options.dueDateType || DueDateType.NONE,
      due_date: options.dueDate || null,
      target_deadline: null,
      scheduled_date: null,
      go_live_date: null,
      effort_level: options.effortLevel || EffortLevel.M,
      completed: options.completed || false,
      completed_date: options.completed ? new Date() : null,
      is_archived: false,
      user_id: this.userId,
    };
    
    // Create the task
    const task = await this.createTask(taskData);
    
    // Add tags if provided
    if (options.tags && options.tags.length > 0) {
      await this.addTagsToTask(task.id, options.tags);
    }
    
    return task;
  }
  
  /**
   * Create a task using a predefined template
   */
  async createTemplateTask(template: TestTaskTemplate, customTitle?: string): Promise<Task> {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const title = customTitle || `${TEST_TASK_PREFIX} ${template} ${now.toISOString()}`;
    
    switch (template) {
      case TestTaskTemplate.HIGH_PRIORITY:
        return this.createRichTask({
          title,
          priority: Priority.HIGH,
          description: 'High priority test task',
        });
        
      case TestTaskTemplate.COMPLETED:
        return this.createRichTask({
          title,
          completed: true,
          status: TaskStatus.COMPLETED,
          description: 'Completed test task',
        });
        
      case TestTaskTemplate.DUE_TODAY:
        return this.createRichTask({
          title,
          dueDate: now,
          dueDateType: DueDateType.SPECIFIC,
          description: 'Test task due today',
        });
        
      case TestTaskTemplate.DUE_TOMORROW:
        return this.createRichTask({
          title,
          dueDate: tomorrow,
          dueDateType: DueDateType.SPECIFIC,
          description: 'Test task due tomorrow',
        });
        
      case TestTaskTemplate.OVERDUE:
        return this.createRichTask({
          title,
          dueDate: yesterday,
          dueDateType: DueDateType.SPECIFIC,
          description: 'Overdue test task',
        });
        
      case TestTaskTemplate.WITH_TAGS:
        return this.createRichTask({
          title,
          tags: ['test-tag-1', 'test-tag-2', 'test-tag-3'],
          description: 'Test task with tags',
        });
        
      case TestTaskTemplate.WITH_EFFORT:
        return this.createRichTask({
          title,
          effortLevel: EffortLevel.XL,
          description: 'Test task with high effort level',
        });
        
      case TestTaskTemplate.BASIC:
      default:
        return this.createBasicTask(title);
    }
  }
  
  /**
   * Base method to create a task and handle errors
   */
  private async createTask(taskData: any): Promise<Task> {
    const { data, error } = await this.supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create test task: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('No data returned after creating test task');
    }
    
    // Convert database record to Task type
    // Note: This is a simplified version - in a real implementation
    // we would map all fields correctly and include relationships
    // Ensure user_id is not null - if somehow it is, use the authenticated user's ID
    if (!data.user_id) {
      console.warn('Task data has null user_id, using authenticated user ID instead');
      if (!this.userId) {
        throw new Error('Cannot create task: both database user_id and authenticated user ID are null');
      }
    }
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status as TaskStatus,
      priority: data.priority as Priority,
      dueDate: data.due_date ? new Date(data.due_date) : null,
      dueDateType: data.due_date_type as DueDateType,
      targetDeadline: data.target_deadline ? new Date(data.target_deadline) : null,
      scheduledDate: data.scheduled_date ? new Date(data.scheduled_date) : null,
      goLiveDate: data.go_live_date ? new Date(data.go_live_date) : null,
      effortLevel: data.effort_level as EffortLevel,
      completed: data.completed,
      completedDate: data.completed_date ? new Date(data.completed_date) : null,
      tags: [], // We'll implement this in Phase 2
      people: [], // We'll implement this in Phase 2
      dependencies: [], // We'll implement this in Phase 2
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      is_archived: data.is_archived || false,
      userId: (data.user_id || this.userId)!,
    };
  }
  
  /**
   * Add tags to a task
   */
  private async addTagsToTask(taskId: string, tagNames: string[]): Promise<void> {
    if (!this.initialized || !this.userId) {
      await this.initialize();
    }
    
    try {
      // First, create the tags if they don't exist
      for (const tagName of tagNames) {
        // Check if tag exists
        const { data: existingTags } = await this.supabase
          .from('tags')
          .select('id')
          .eq('name', tagName)
          .eq('user_id', this.userId);
        
        let tagId: string;
        
        if (!existingTags || existingTags.length === 0) {
          // Create the tag
          const { data: newTag, error: tagError } = await this.supabase
            .from('tags')
            .insert({ name: tagName, user_id: this.userId })
            .select('id')
            .single();
          
          if (tagError || !newTag) {
            throw new Error(`Failed to create tag ${tagName}: ${tagError?.message || 'No data returned'}`);
          }
          
          tagId = newTag.id;
        } else {
          tagId = existingTags[0].id;
        }
        
        // Link tag to task
        const { error: linkError } = await this.supabase
          .from('task_tags')
          .insert({ 
            task_id: taskId, 
            tag_id: tagId, 
            user_id: this.userId,
            tag_name: tagName  // Adding the tag name field
          });
        
        if (linkError) {
          throw new Error(`Failed to link tag ${tagName} to task: ${linkError.message}`);
        }
      }
    } catch (error) {
      console.error('Error adding tags to task:', error);
      throw error;
    }
  }
  
  /**
   * Delete all test tasks created by the seeder
   * Should be called after tests to clean up
   */
  /**
   * Create a basic note with minimal required fields
   * @param name Optional custom name for the note (default is generated)
   * @returns The created note object
   */
  async createBasicNote(name?: string): Promise<Note> {
    if (!this.initialized || !this.userId) {
      await this.initialize();
    }
    
    const noteName = name || `${TEST_NOTE_PREFIX} Basic Note ${new Date().toISOString().substring(0, 19)}`;
    const noteBody = 'This is a test note body created by the test data seeder.';
    
    try {
      return await this.createNote({
        name: noteName,
        body: noteBody,
        taggedTaskIds: [],
        userId: this.userId,
        is_archived: false
      });
    } catch (error) {
      console.error('Failed to create basic note:', error);
      throw error;
    }
  }
  
  /**
   * Create a rich note with custom options
   * @param options Configuration options for the note
   * @returns The created note object
   */
  async createRichNote(options: RichNoteOptions): Promise<Note> {
    if (!this.initialized || !this.userId) {
      await this.initialize();
    }
    
    const name = options.name || `${TEST_NOTE_PREFIX} Rich Note ${new Date().toISOString().substring(0, 19)}`;
    const body = options.body || 'This is a rich test note with custom options.';
    
    try {
      return await this.createNote({
        name,
        body,
        taggedTaskIds: options.taggedTaskIds || [],
        userId: this.userId,
        is_archived: options.is_archived || false
      });
    } catch (error) {
      console.error('Failed to create rich note:', error);
      throw error;
    }
  }
  
  /**
   * Create a note using a predefined template
   * @param template The template type to use
   * @param customName Optional custom name for the note
   * @returns The created note object
   */
  async createTemplateNote(template: TestNoteTemplate, customName?: string): Promise<Note> {
    if (!this.initialized || !this.userId) {
      await this.initialize();
    }
    
    let noteOptions: RichNoteOptions = {};
    const timestamp = new Date().toISOString().substring(0, 19);
    
    switch (template) {
      case TestNoteTemplate.BASIC:
        noteOptions = {
          name: customName || `${TEST_NOTE_PREFIX} Basic Template ${timestamp}`,
          body: 'This is a basic test note created from a template.',
        };
        break;
        
      case TestNoteTemplate.RICH_TEXT:
        noteOptions = {
          name: customName || `${TEST_NOTE_PREFIX} Rich Text ${timestamp}`,
          body: '<h1>Rich Text Note</h1><p>This note contains <strong>rich text</strong> with <em>formatting</em>.</p><ul><li>List item 1</li><li>List item 2</li></ul>',
        };
        break;
        
      case TestNoteTemplate.WITH_MARKDOWN:
        noteOptions = {
          name: customName || `${TEST_NOTE_PREFIX} Markdown ${timestamp}`,
          body: '# Markdown Note\n\nThis is a **markdown** formatted note.\n\n- Item 1\n- Item 2\n\n```\ncode block\n```',
        };
        break;
        
      case TestNoteTemplate.ARCHIVED:
        noteOptions = {
          name: customName || `${TEST_NOTE_PREFIX} Archived ${timestamp}`,
          body: 'This note has been archived.',
          is_archived: true,
        };
        break;
        
      case TestNoteTemplate.WITH_TASKS:
        // Create a task first, then link it
        try {
          const linkedTask = await this.createBasicTask(`${TEST_TASK_PREFIX} Linked to Note ${timestamp}`);
          
          noteOptions = {
            name: customName || `${TEST_NOTE_PREFIX} With Tasks ${timestamp}`,
            body: `This note is linked to task ID: ${linkedTask.id}`,
            taggedTaskIds: [linkedTask.id],
          };
        } catch (error) {
          console.error('Error creating linked task for note template:', error);
          throw error;
        }
        break;
        
      default:
        throw new Error(`Unknown note template type: ${template}`);
    }
    
    return this.createRichNote(noteOptions);
  }
  
  /**
   * Base method to create a note and handle errors
   * @param noteData The note data to be created
   * @returns The created note object
   */
  private async createNote(noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    // Ensure we're initialized and have user context
    await this.initialize();

    if (!this.userId) {
      throw new Error('User ID not found. Make sure to initialize the seeder first.');
    }

    try {
      const { name, body, taggedTaskIds, is_archived } = noteData;
      
      const { data, error } = await this.supabase
        .from('notes')
        .insert({
          name,
          body,
          user_id: this.userId,
          tagged_task_ids: taggedTaskIds || [],
          is_archived: is_archived || false,
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to create note: ${error.message}`);
      }
      
      if (!data) {
        throw new Error('Failed to create note: No data returned');
      }
      
      const note: Note = {
        id: data.id,
        name: data.name,
        body: data.body,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        taggedTaskIds: data.tagged_task_ids || [],
        userId: data.user_id,
        is_archived: data.is_archived || false,
      };
      
      return note;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }

  /**
   * Create multiple notes efficiently in a batch
   * @param count Number of notes to create
   * @param options Custom options for the notes
   * @returns Array of created notes
   */
  async createMultipleNotes(count = 1, options?: RichNoteOptions): Promise<Note[]> {
    await this.initialize();
    
    if (!this.userId) {
      throw new Error('User ID not found. Make sure to initialize the seeder first.');
    }
    
    try {
      const notes: Note[] = [];
      const noteInserts = [];
      
      // Prepare batch inserts for better performance
      for (let i = 0; i < count; i++) {
        const name = options?.name || `${TEST_NOTE_PREFIX} Batch Note #${i+1}`;
        const body = options?.body || `This is test note #${i+1} created for automated testing.`;
        
        noteInserts.push({
          name,
          body, 
          user_id: this.userId,
          tagged_task_ids: options?.taggedTaskIds || [],
          is_archived: options?.is_archived || false,
        });
      }
      
      // Insert all notes in a single operation for efficiency
      const { data, error } = await this.supabase
        .from('notes')
        .insert(noteInserts)
        .select();
      
      if (error) {
        throw new Error(`Failed to create batch notes: ${error.message}`);
      }
      
      // Map returned data to Note objects
      if (data) {
        for (const item of data) {
          notes.push({
            id: item.id,
            name: item.name,
            body: item.body,
            createdAt: new Date(item.created_at),
            updatedAt: new Date(item.updated_at),
            taggedTaskIds: item.tagged_task_ids || [],
            userId: item.user_id,
            is_archived: item.is_archived || false,
          });
        }
      }
      
      return notes;
    } catch (error) {
      console.error('Error creating multiple notes:', error);
      throw error;
    }
  }

  /**
   * Create a task with linked notes in one operation
   * @param options Configuration options for task and notes
   * @returns Object containing the created task and its linked notes
   */
  async createTaskWithNotes(options: TaskWithNotesOptions): Promise<{task: Task; notes: Note[]}> {
    await this.initialize();
    
    if (!this.userId) {
      throw new Error('User ID not found. Make sure to initialize the seeder first.');
    }
    
    try {
      // First create the task
      const task = await this.createRichTask(options.taskOptions);
      
      // Then create notes linked to that task
      const noteCount = options.noteCount || 1;
      const notes: Note[] = [];
      
      if (options.noteTemplate) {
        // Create notes using the specified template
        for (let i = 0; i < noteCount; i++) {
          const noteName = `${TEST_NOTE_PREFIX} For ${task.title} #${i+1}`;
          const noteOptions: RichNoteOptions = {
            ...options.customNoteOptions,
            name: noteName,
            taggedTaskIds: [task.id],
          };
          
          if (options.noteTemplate === TestNoteTemplate.BASIC) {
            notes.push(await this.createBasicNote(noteName));
          } else {
            const templatedNote = await this.createTemplateNote(options.noteTemplate, noteName);
            // Update the tagged task IDs to link to our task
            const updatedNote = await this.supabase
              .from('notes')
              .update({ tagged_task_ids: [task.id] })
              .eq('id', templatedNote.id)
              .select()
              .single();
              
            if (updatedNote.data) {
              notes.push({
                id: updatedNote.data.id,
                name: updatedNote.data.name,
                body: updatedNote.data.body,
                createdAt: new Date(updatedNote.data.created_at),
                updatedAt: new Date(updatedNote.data.updated_at),
                taggedTaskIds: updatedNote.data.tagged_task_ids || [],
                userId: updatedNote.data.user_id,
                is_archived: updatedNote.data.is_archived || false,
              });
            }
          }
        }
      } else if (options.customNoteOptions) {
        // Create notes with custom options
        for (let i = 0; i < noteCount; i++) {
          const noteOptions = {
            ...options.customNoteOptions,
            name: options.customNoteOptions.name || `${TEST_NOTE_PREFIX} For ${task.title} #${i+1}`,
            taggedTaskIds: [...(options.customNoteOptions.taggedTaskIds || []), task.id],
          };
          notes.push(await this.createRichNote(noteOptions));
        }
      } else {
        // Create basic notes linked to the task
        notes.push(...await this.createMultipleNotes(noteCount, { 
          taggedTaskIds: [task.id],
          name: `${TEST_NOTE_PREFIX} For ${task.title}` 
        }));
      }
      
      return { task, notes };
    } catch (error) {
      console.error('Error creating task with notes:', error);
      throw error;
    }
  }

  async cleanupTestTasks(): Promise<void> {
    // Ensure we're initialized and have user context
    await this.initialize();

    if (!this.userId) {
      throw new Error('User ID not found. Make sure to initialize the seeder first.');
    }

    try {
      // Clean up test tasks
      const { error } = await this.supabase
        .from('tasks')
        .delete()
        .like('title', `${TEST_TASK_PREFIX}%`);
      
      if (error) {
        console.error(`Error cleaning up test tasks: ${error.message}`);
      }
      
      // Clean up any test tags
      const { error: tagError } = await this.supabase
        .from('tags')
        .delete()
        .like('name', 'test-tag-%');
      
      if (tagError) {
        console.error(`Error cleaning up test tags: ${tagError.message}`);
      }
      
      // Clean up test notes
      const { error: noteError } = await this.supabase
        .from('notes')
        .delete()
        .like('name', `${TEST_NOTE_PREFIX}%`);
      
      if (noteError) {
        console.error(`Error cleaning up test notes: ${noteError.message}`);
      }
      
      console.log('Test tasks, tags, and notes cleaned up successfully');
    } catch (error) {
      console.error('Failed to clean up test data:', error);
      throw error;
    }
  }

}

// Export a singleton instance for use in tests
export const testDataSeeder = new TestDataSeeder();

// Helper function for easier use in tests
export async function seedBasicTask(title?: string): Promise<Task> {
  return testDataSeeder.createBasicTask(title);
}

/**
 * Create a basic test note
 * @param name Optional custom note name
 */
export async function seedBasicNote(name?: string): Promise<Note> {
  return testDataSeeder.createBasicNote(name);
}

/**
 * Clean up all test tasks - use in afterAll() test hooks
 */
export async function cleanupTestTasks(): Promise<void> {
  return testDataSeeder.cleanupTestTasks();
}

/**
 * Create a rich test task with custom options
 */
export async function seedRichTask(options: RichTaskOptions): Promise<Task> {
  return testDataSeeder.createRichTask(options);
}

/**
 * Create a rich test note with custom options
 */
export async function seedRichNote(options: RichNoteOptions): Promise<Note> {
  return testDataSeeder.createRichNote(options);
}

/**
 * Create a note from a predefined template
 */
export async function seedTemplateNote(template: TestNoteTemplate, customName?: string): Promise<Note> {
  return testDataSeeder.createTemplateNote(template, customName);
}

/**
 * Create multiple notes from a template
 */
export async function seedTemplateNotes(template: TestNoteTemplate, count = 1): Promise<Note[]> {
  await testDataSeeder.initialize();
  
  const notes: Note[] = [];
  for (let i = 0; i < count; i++) {
    const note = await testDataSeeder.createTemplateNote(template, `${TEST_NOTE_PREFIX} ${template} #${i + 1}`);
    notes.push(note);
  }
  
  return notes;
}

/**
 * Use this in Playwright tests to seed notes
 * Example usage:
 * 
 * import { test } from '@playwright/test';
 * import { seedTestNotes } from './utils/testDataSeeder';
 * 
 * test.beforeEach(async () => {
 *   await seedTestNotes(3); // Creates 3 test notes
 * });
 */
export async function seedTestNotes(count = 1): Promise<Note[]> {
  await testDataSeeder.initialize();
  
  const notes: Note[] = [];
  for (let i = 0; i < count; i++) {
    const note = await testDataSeeder.createBasicNote(`${TEST_NOTE_PREFIX} UI Test #${i + 1}`);
    notes.push(note);
  }
  
  return notes;
}

/**
 * Create a task from a predefined template
 */
export async function seedTemplateTask(template: TestTaskTemplate, customTitle?: string): Promise<Task> {
  return testDataSeeder.createTemplateTask(template, customTitle);
}

/**
 * Create multiple tasks from a template
 */
export async function seedTemplateTasks(template: TestTaskTemplate, count = 1): Promise<Task[]> {
  await testDataSeeder.initialize();
  
  const tasks: Task[] = [];
  for (let i = 0; i < count; i++) {
    const task = await testDataSeeder.createTemplateTask(template, `Test Task: ${template} #${i + 1}`);
    tasks.push(task);
  }
  
  return tasks;
}

/**
 * Use this in Playwright tests to seed tasks
 * Example usage:
 * 
 * import { test } from '@playwright/test';
 * import { seedTestTasks } from './utils/testDataSeeder';
 * 
 * test.beforeEach(async () => {
 *   await seedTestTasks(3); // Creates 3 test tasks
 * });
 */
export async function seedTestTasks(count = 1): Promise<Task[]> {
  await testDataSeeder.initialize();
  
  const tasks: Task[] = [];
  for (let i = 0; i < count; i++) {
    const task = await testDataSeeder.createBasicTask(`Test Task: UI Test #${i + 1}`);
    tasks.push(task);
  }
  
  return tasks;
}

/**
 * Create multiple notes in a single batch operation for better performance
 * Example usage:
 * 
 * import { test } from '@playwright/test';
 * import { seedMultipleNotes } from './utils/testDataSeeder';
 * 
 * test.beforeEach(async () => {
 *   await seedMultipleNotes(10); // Creates 10 notes efficiently in one batch
 * });
 */
export async function seedMultipleNotes(count = 5, options?: RichNoteOptions): Promise<Note[]> {
  await testDataSeeder.initialize();
  return testDataSeeder.createMultipleNotes(count, options);
}

/**
 * Create a task with linked notes in one operation
 * This is useful for testing task-note relationships
 * 
 * Example usage:
 * 
 * import { test } from '@playwright/test';
 * import { seedTaskWithNotes, TestNoteTemplate } from './utils/testDataSeeder';
 * 
 * test.beforeEach(async () => {
 *   // Create a high priority task with 3 markdown notes linked to it
 *   await seedTaskWithNotes({
 *     taskOptions: { priority: Priority.HIGH },
 *     noteCount: 3,
 *     noteTemplate: TestNoteTemplate.WITH_MARKDOWN
 *   });
 * });
 */
export async function seedTaskWithNotes(options: TaskWithNotesOptions): Promise<{task: Task; notes: Note[]}> {
  await testDataSeeder.initialize();
  return testDataSeeder.createTaskWithNotes(options);
}
