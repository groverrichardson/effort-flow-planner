import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { Priority, TaskStatus, EffortLevel, DueDateType, Task } from '../../src/types';
import { Note } from '../../src/types/note';
import { Database } from '../../src/types/supabase';
import fs from 'fs';
import path from 'path';
// Import shared auth constants
import {
  AUTH_FILE_PATH,
  checkAuthFile,
  verifyEnvironmentVariables
} from './authConstants';

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

/**
 * TestDataSeeder - Utility to seed test data for UI tests
 * 
 * This utility creates test tasks in the Supabase database for UI testing.
 * It reuses the authentication from Playwright's storageState to ensure tasks
 * are created for the test user account.
 */

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

// Auth file path is now imported from authConstants.ts

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
      // Verify environment variables first
      const envStatus = verifyEnvironmentVariables();
      if (!envStatus.valid) {
        console.error('====== ENVIRONMENT VARIABLE ERROR ======');
        console.error(envStatus.message);
        console.error('Please check your .env file or environment configuration');
        console.error('========================================');
        throw new Error(`TestDataSeeder: ${envStatus.message}`);
      }

      // Check auth file status
      const authFileStatus = checkAuthFile();
      if (!authFileStatus.exists || !authFileStatus.valid) {
        console.error('====== AUTHENTICATION FILE ERROR ======');
        console.error(authFileStatus.message);
        console.error(`Auth file path: ${AUTH_FILE_PATH}`);
        console.error('Run Playwright global setup first: npx playwright test --global-setup');
        console.error('========================================');
        throw new Error(`TestDataSeeder: ${authFileStatus.message}`);
      }

      // Read the auth file
      const authFileContent = fs.readFileSync(AUTH_FILE_PATH, 'utf-8');
      const storageState = JSON.parse(authFileContent);

      console.log(`TestDataSeeder: Auth file loaded successfully from ${AUTH_FILE_PATH}`);
      
      // Extract the Supabase session from the storage state
      const supabaseOrigin = storageState.origins.find(origin => {
        return origin.localStorage.some(item => item.name.includes('auth-token'));
      });

      if (!supabaseOrigin) {
        console.error('====== SUPABASE TOKEN ERROR ======');
        console.error('Could not find Supabase auth token in storage state.');
        console.error('Origins in storage state:', storageState.origins.map(o => o.origin));
        console.error('====================================');
        throw new Error('TestDataSeeder: Could not find Supabase auth token in storage state.');
      }

      const supabaseAuthItem = supabaseOrigin.localStorage.find(item => item.name.includes('auth-token'));

      if (!supabaseAuthItem) {
        console.error('====== SUPABASE TOKEN ERROR ======');
        console.error('Could not find Supabase auth token item.');
        console.error('Available localStorage items:', supabaseOrigin.localStorage.map(i => i.name));
        console.error('====================================');
        throw new Error('TestDataSeeder: Could not find Supabase auth token item.');
      }

      console.log('TestDataSeeder: Successfully found auth token in storage state');
      const parsedToken = JSON.parse(supabaseAuthItem.value);

      // Check if the token might be expired
      const tokenExpiry = new Date(parsedToken.expires_at * 1000);
      const now = new Date();
      if (tokenExpiry <= now) {
        console.warn('====== TOKEN EXPIRY WARNING ======');
        console.warn('Supabase token appears to be expired. Will attempt refresh.');
        console.warn(`Expired at: ${tokenExpiry.toISOString()}`);
        console.warn('==================================');
      }

      // Set up the supabase client with the session
      const { error, data } = await this.supabase.auth.setSession({
        access_token: parsedToken.access_token,
        refresh_token: parsedToken.refresh_token,
      });

      if (error) {
        console.error('====== SESSION ERROR ======');
        console.error(`Failed to set session: ${error.message}`);
        console.error('Running with test user credentials instead of stored token may help.');
        console.error('============================');
        throw new Error(`TestDataSeeder: Failed to set session: ${error.message}`);
      }
      
      if (!data.user) {
        console.error('====== USER ERROR ======');
        console.error('Auth session exists but no user data found!');
        console.error('============================');
        throw new Error(`TestDataSeeder: Auth session exists but no user data found!`);
      }

      this.userId = data.user.id;
      this.initialized = true;
      console.log(`TestDataSeeder initialized for user: ${this.userId}`);
    } catch (error) {
      console.error('TestDataSeeder initialization failed:', error);
      throw error;
    }
  }
  
  /**
   * Create a basic test task with minimal required fields
   */
  /**
   * Check if auth token needs refreshing and refresh it if needed
   */
  async refreshAuthTokenIfNeeded(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
      return;
    }

    try {
      // Get current session
      const { data: sessionData } = await this.supabase.auth.getSession();
      const session = sessionData?.session;

      if (!session) {
        console.warn('No active session found, attempting to restore from auth file');
        await this.initialize();
        return;
      }

      // Check if token is about to expire
      // Refresh if less than 30 minutes remaining
      const expiresAt = session.expires_at;
      if (expiresAt) {
        const expiryDate = new Date(expiresAt * 1000);
        const now = new Date();
        const timeToExpiry = expiryDate.getTime() - now.getTime();
        const thirtyMinutesInMs = 30 * 60 * 1000;

        if (timeToExpiry < thirtyMinutesInMs) {
          console.log('Auth token expires soon, refreshing...');
          const { error } = await this.supabase.auth.refreshSession();
          
          if (error) {
            console.error('Error refreshing auth token:', error.message);
            throw new Error(`Failed to refresh authentication token: ${error.message}`);
          } else {
            console.log('Auth token successfully refreshed');
          }
        }
      }
    } catch (error) {
      console.error('Error in refreshAuthTokenIfNeeded:', error);
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
    
    await this.refreshAuthTokenIfNeeded();
    
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
  }
  
  async createRichTask(options: RichTaskOptions): Promise<Task | null> {
    await this.initialize();
    await this.refreshAuthTokenIfNeeded();
    
    if (!this.userId) {
      throw new Error('User ID not found. Make sure to initialize the seeder first.');
    }
    
    // Helper functions for random values
    const getRandomString = (length: number): string => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      return Array.from({length}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    };
    
    const getRandomPriority = (): Priority => {
      const priorities = [Priority.LOW, Priority.NORMAL, Priority.HIGH];
      return priorities[Math.floor(Math.random() * priorities.length)];
    };
    
    const getRandomStatus = (): TaskStatus => {
      const statuses = [TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.DONE];
      return statuses[Math.floor(Math.random() * statuses.length)];
    };
    
    const getRandomEffortLevel = (): EffortLevel => {
      const efforts = [EffortLevel.XS, EffortLevel.S, EffortLevel.M, EffortLevel.L, EffortLevel.XL];
      return efforts[Math.floor(Math.random() * efforts.length)];
    };
    
    const getRandomDueDateType = (): DueDateType => {
      const types = [DueDateType.NONE, DueDateType.DEADLINE, DueDateType.TARGET];
      return types[Math.floor(Math.random() * types.length)];
    };
    
    const getRandomFutureDate = (): Date => {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + Math.floor(Math.random() * 30) + 1); // 1-30 days in the future
      return futureDate;
    };
  
    const taskTitle = options.title || `${TEST_TASK_PREFIX}${getRandomString(8)}`;
    const due_date = options.dueDate ? options.dueDate.toISOString() : getRandomFutureDate().toISOString();
  
    // Generate a task with random properties
    const newTask = {
      title: taskTitle,
      description: options.description || `Description for ${taskTitle}`,
      priority: options.priority || getRandomPriority(),
      status: options.status || getRandomStatus(),
      effort_level: options.effortLevel || getRandomEffortLevel(),
      due_date,
      due_date_type: options.dueDateType || getRandomDueDateType(),
      is_archived: false,
      user_id: this.userId,
    };
    
    // Create the task
    const { data, error } = await this.supabase
      .from('tasks')
      .insert(newTask)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating test task:', error);
      return null;
    }
    
    const task = data;
    
    if (!task || !task.id) {
      console.error('No valid task data returned from insert operation');
      return null;
    }
    
    // If tags are specified, create tag connections
    if (options.tags && options.tags.length > 0) {
      const tagConnections = options.tags.map(tagId => ({
        task_id: task.id,
        tag_id: tagId,
        user_id: this.userId as string // Type assertion to fix TypeScript error
      }));
      
      const { error: tagError } = await this.supabase
        .from('task_tags')
        .insert(tagConnections);
      
      if (tagError) {
        console.error('Error connecting tags to task:', tagError);
      }
    }
    
    return task;
  }

// ... (rest of the code remains the same)

  /**
   * Creates test tags for use in tasks
   * @param count Number of tags to create
   * @returns Array of created tag IDs
   */
  async createTestTags(count: number = 3): Promise<string[]> {
    await this.initialize();
    await this.refreshAuthTokenIfNeeded();
    
    const tagIds: string[] = [];
    
    // Ensure we have a userId
    if (!this.userId) {
    console.error('User ID is missing when creating test tags');
    return tagIds;
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
  /**
   * Create multiple notes efficiently in a batch
   * @param count Number of notes to create
   * @param options Custom options for the notes
   * @returns Array of created notes
   */
  async createMultipleNotes(count = 1, options?: RichNoteOptions): Promise<Note[]> {
    await this.initialize();
    await this.refreshAuthTokenIfNeeded();
    
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
  /**
   * Create a task with linked notes in one operation
   * @param options Configuration options for task and notes
   * @returns Object containing the created task and its linked notes
   */
  async createTaskWithNotes(options: TaskWithNotesOptions): Promise<{task: Task | null; notes: Note[]}> {
    await this.initialize();
    await this.refreshAuthTokenIfNeeded();
    
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

  /**
   * Refreshes the authentication token if needed
   * This helps overcome token expiration issues
   * @returns True if refresh was successful or not needed, false if it failed
   */
  async refreshAuthTokenIfNeeded(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting current session:', error.message);
        return false;
      }
      
      if (!data.session) {
        console.warn('No active session found, attempting to refresh');
        // Try to refresh using refresh token from auth file
        const authFileStatus = checkAuthFile();
        if (!authFileStatus.exists || !authFileStatus.valid) {
          return false;
        }
        
        const authFileContent = fs.readFileSync(AUTH_FILE_PATH, 'utf-8');
        const storageState = JSON.parse(authFileContent);
        
        const supabaseOrigin = storageState.origins.find((origin: any) => 
          origin.localStorage?.some((item: any) => item.name.includes('auth-token'))
        );
        
        if (!supabaseOrigin) return false;
        
        const authItem = supabaseOrigin.localStorage.find((item: any) => 
          item.name.includes('auth-token')
        );
        
        if (!authItem) return false;
        
        const parsedToken = JSON.parse(authItem.value);
        
        const refreshResult = await this.supabase.auth.setSession({
          access_token: parsedToken.access_token,
          refresh_token: parsedToken.refresh_token,
        });
        
        return !refreshResult.error;
      }
      
      // Check if token will expire soon (within 5 minutes)
      const expiresAt = data.session?.expires_at ? new Date(data.session.expires_at * 1000) : null;
      const now = new Date();
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
      
      if (expiresAt && expiresAt < fiveMinutesFromNow) {
        console.log('Session token expires soon, refreshing...');
        const { error: refreshError } = await this.supabase.auth.refreshSession();
        if (refreshError) {
          console.error('Failed to refresh session:', refreshError.message);
          return false;
        }
        console.log('Session refreshed successfully');
      }
      
      return true;
    } catch (error) {
      console.error('Error in refreshAuthTokenIfNeeded:', error);
      return false;
    }
  }

  async cleanupTestTasks(): Promise<void> {
    try {
      await this.initialize();
      
      // Refresh token if needed before cleanup
      await this.refreshAuthTokenIfNeeded();
      
      // Get all test tasks created by this utility
      const { data: tasks, error: taskError } = await this.supabase
        .from('tasks')
        .select('id')
        .like('title', `%${TEST_TASK_PREFIX}%`);

      if (taskError) {
        console.error('Error fetching test tasks for cleanup:', taskError);
        return;
      }

      // Get all test notes created by this utility
      const { data: notes, error: noteError } = await this.supabase
        .from('notes')
        .select('id')
        .like('name', `%${TEST_NOTE_PREFIX}%`);

      if (noteError) {
        console.error('Error fetching test notes for cleanup:', noteError);
        return;
      }

      // Delete test task tags
      if (tasks && tasks.length > 0) {
        const { error: deleteTagsError } = await this.supabase
          .from('task_tags')
          .delete()
          .in('task_id', tasks.map(task => task.id));

        if (deleteTagsError) {
          console.error('Error deleting test task tags:', deleteTagsError);
        }

        // Delete test tasks
        const { error: deleteTasksError } = await this.supabase
          .from('tasks')
          .delete()
          .in('id', tasks.map(task => task.id));

        if (deleteTasksError) {
          console.error('Error deleting test tasks:', deleteTasksError);
        } else {
          console.log(`Cleaned up ${tasks.length} test tasks`);
        }
      }

      // Delete test notes
      if (notes && notes.length > 0) {
        const { error: deleteNotesError } = await this.supabase
          .from('notes')
          .delete()
          .in('id', notes.map(note => note.id));

        if (deleteNotesError) {
          console.error('Error deleting test notes:', deleteNotesError);
        } else {
          console.log(`Cleaned up ${notes.length} test notes`);
        }
      }
    } catch (error) {
      console.error('Error during test data cleanup:', error);
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
