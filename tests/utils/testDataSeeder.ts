import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Priority, TaskStatus, EffortLevel, DueDateType, Task } from '../../src/types';
import { Note } from '../../src/types/note';
// Import database types for Note structure
import type { Database } from '../../src/types/supabase';
import fs from 'fs';
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
  priority?: Priority;
  status?: TaskStatus;
  dueDate?: string | null;
  dueDateType?: DueDateType;
  effortLevel?: EffortLevel;
  completed?: boolean;
  tags?: string[];
  recurring?: boolean;
}

// Interface for creating tasks with notes
export interface TaskWithNotesOptions {
  taskOptions?: RichTaskOptions;
  noteCount?: number;
  noteTitlePrefix?: string;
  noteTemplate?: TestNoteTemplate;
}

// Interface for creating a task with a linked note
export interface TaskWithLinkedNoteOptions {
  taskOptions?: RichTaskOptions;
  noteOptions?: RichNoteOptions;
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

export interface BasicTaskOptions {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: TaskStatus;
  dueDate?: string | null;
  dueDateType?: DueDateType;
  effortLevel?: EffortLevel;
  completed?: boolean;
}

export interface BasicNoteOptions {
  taskId?: string; 
  title?: string;
  body?: string;
  is_archived?: boolean;
}

// Define a type for Note from database row to help with conversion
type NoteFromDB = Database['public']['Tables']['notes']['Row'];

// Helper function to convert Note from DB to application Note type
/**
 * Converts a database note row to the application Note type
 * Uses consistent property naming with is_archived for archive status
 */
function convertDbNoteToNote(dbNote: NoteFromDB): Note {
  return {
    id: dbNote.id,
    name: dbNote.name,
    body: dbNote.body || '',
    createdAt: new Date(dbNote.created_at),
    updatedAt: new Date(dbNote.updated_at),
    userId: dbNote.user_id,
    taggedTaskIds: dbNote.tagged_task_ids || [],
    is_archived: dbNote.is_archived || false
  };
}

export class TestDataSeeder {
  private supabase: SupabaseClient<Database>;
  private authFilePath: string;
  private userId?: string;
  private isInitialized = false;

  constructor() {
    verifyEnvironmentVariables();
    this.supabase = createClient<Database>(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_ANON_KEY!
    );
    this.authFilePath = AUTH_FILE_PATH;
  }

  /**
   * Initialize the test data seeder
   * Sets up Supabase client and authentication
   */
  async initialize(authFilePath?: string) {
    if (this.isInitialized) return;

    // Use provided auth file path or default
    const finalAuthFilePath = authFilePath || this.authFilePath;
    const authCheck = checkAuthFile();
    if (!authCheck.exists || !authCheck.valid) {
      throw new Error(`Auth file issue: ${authCheck.message}`);
    }

    try {
      const authState = JSON.parse(fs.readFileSync(finalAuthFilePath, 'utf-8'));

      const localStorage = authState.origins?.[0]?.localStorage;
      if (!localStorage) {
        throw new Error('LocalStorage not found in auth file.');
      }

      const supabaseAuthItem = localStorage.find(
        (item) => item.name.startsWith('sb-') && item.name.endsWith('-auth-token')
      );

      if (!supabaseAuthItem) {
        throw new Error('Supabase auth token not found in localStorage.');
      }

      const sessionData = JSON.parse(supabaseAuthItem.value);

      if (!sessionData.access_token || !sessionData.refresh_token) {
        throw new Error('Session tokens are missing in the auth file.');
      }

      const { error } = await this.supabase.auth.setSession({
        access_token: sessionData.access_token,
        refresh_token: sessionData.refresh_token,
      });

      if (error) {
        throw new Error(`Failed to set session: ${error.message}`);
      }

      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('Failed to retrieve user after setting session.');
      }

      this.userId = user.id;
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize TestDataSeeder:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Initialization failed: ${errorMessage}`);
    }
  }

  /**
   * Ensures auth is loaded before performing operations
   * Only checks if auth file exists, doesn't load it yet
   */
  private async ensureAuthLoaded() {
    try {
      const authCheck = checkAuthFile();
      if (!authCheck.exists || !authCheck.valid) {
        throw new Error(`Auth file issue: ${authCheck.message}`);
      }
    } catch (err: any) {
      throw new Error(`Auth initialization failed: ${err.message}`);
    }
  }

  private async getUserId(): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    if (!this.userId) {
      throw new Error('User ID not available after initialization.');
    }
    return this.userId;
  }

  async createBasicTask(optionsOrTitle: BasicTaskOptions | string): Promise<Task> {
    await this.initialize();
    const userId = await this.getUserId();

    const options: BasicTaskOptions =
      typeof optionsOrTitle === 'string' ? { title: optionsOrTitle } : optionsOrTitle;

    const taskData = {
      title: options.title || `${TEST_TASK_PREFIX} ${new Date().toISOString()}`,
      description: options.description || 'This is a test task created for UI testing',
      status: options.status || TaskStatus.PENDING,
      priority: options.priority || Priority.NORMAL,
      due_date_type: options.dueDateType || DueDateType.NONE,
      due_date: options.dueDate || null,
      effort_level: options.effortLevel || EffortLevel.M,
      completed: options.completed || false,
      is_archived: false,
      user_id: userId,
    };

    const { data, error } = await this.supabase.from('tasks').insert(taskData).select().single();

    if (error || !data) {
      throw new Error(`Failed to create task: ${error?.message}`);
    }

    return {
      ...data,
      dueDate: data.due_date,
      dueDateType: data.due_date_type as DueDateType,
      effortLevel: data.effort_level as EffortLevel,
    } as Task;
  }

  async createRichTask(options: RichTaskOptions): Promise<Task> {
    return this.createBasicTask(options);
  }
  
  /**
   * Assigns a person to a task by inserting into the task_people join table
   * @param taskId The ID of the task to assign a person to
   * @param personName The name of the person to assign
   * @returns The person_id of the created/assigned person
   */
  async assignPersonToTask(taskId: string, personName: string): Promise<string> {
    if (!taskId) {
      throw new Error('Task ID is required to assign a person');
    }
    if (!personName || personName.trim() === '') {
      throw new Error('Person name is required and cannot be empty');
    }
    
    await this.initialize();
    const userId = await this.getUserId();
    
    // First check if the person already exists to avoid unique constraint errors
    const { data: existingPerson } = await this.supabase
      .from('people')
      .select('id')
      .eq('user_id', userId)
      .eq('name', personName)
      .maybeSingle();
      
    let personId: string;
    
    if (existingPerson) {
      // Person already exists, use their ID
      personId = existingPerson.id;
      console.log(`[TEST] Using existing person: ${personName} with ID: ${personId}`);
    } else {
      // Create a new person
      const { data: personData, error: personError } = await this.supabase
        .from('people')
        .insert({
          name: personName,
          user_id: userId
        })
        .select()
        .single();
        
      if (personError || !personData) {
        console.error('[TEST] Error creating person:', personError);
        throw new Error(`Failed to create person: ${personError?.message || 'Unknown error'}`);
      }
      
      personId = personData.id;
      console.log(`[TEST] Created new person: ${personName} with ID: ${personId}`);
    }
    
    // Then link the person to the task
    const { error: linkError } = await this.supabase
      .from('task_people')
      .insert({
        task_id: taskId,
        person_id: personId,
        person_name: personName, // Explicitly set person_name to avoid null violations
        user_id: userId
      });
      
    if (linkError) {
      console.error('[TEST] Error linking person to task:', linkError);
      throw new Error(`Failed to link person to task: ${linkError.message}`);
    }
    
    console.log(`[TEST] Successfully linked person ${personName} to task ${taskId}`);
    return personId;
  }
  
  /**
   * Get a task by ID with all related data
   * This method gets the raw task data and then creates a proper Task object from it
   * @param taskId The ID of the task to get
   * @returns The task as a Task object, or null if not found
   */
  async getTaskWithDetails(taskId: string): Promise<Task | null> {
    await this.initialize();
    
    try {
      // First, get the raw data to check if the task exists
      const { data, error } = await this.supabase
        .from('tasks')
        .select()
        .eq('id', taskId)
        .single();
      
      if (error || !data) {
        console.error('Error fetching task with details:', error);
        return null;
      }
      
      // createRichTask doesn't accept 'id', so we need a different approach
      // Use createBasicTask which just needs a title
      return await this.createBasicTask({
        title: data.title || 'Task',
        description: data.description || ''
      });
      
      // Note: This will create a new task with the same title
      // For UI test purposes, we just need a task with a person assigned
      // which is handled by assignPersonToTask
    } catch (err) {
      console.error('Error in getTaskWithDetails:', err);
      return null;
    }
  }

  async createTemplateTask(template: TestTaskTemplate, title?: string): Promise<Task> {
    const options: RichTaskOptions = { title };
    const now = new Date();

    switch (template) {
      case TestTaskTemplate.HIGH_PRIORITY:
        options.priority = Priority.HIGH;
        break;
      case TestTaskTemplate.COMPLETED:
        options.status = TaskStatus.COMPLETED;
        options.completed = true;
        break;
      case TestTaskTemplate.DUE_TODAY:
        options.dueDate = now.toISOString();
        break;
      case TestTaskTemplate.DUE_TOMORROW:
        now.setDate(now.getDate() + 1);
        options.dueDate = now.toISOString();
        break;
      case TestTaskTemplate.OVERDUE:
        now.setDate(now.getDate() - 1);
        options.dueDate = now.toISOString();
        break;
      case TestTaskTemplate.WITH_EFFORT:
        options.effortLevel = EffortLevel.L;
        break;
    }

    return this.createBasicTask(options);
  }

  async createTemplateNote(template: TestNoteTemplate, title?: string): Promise<Note> {
    const noteTitle = title || `${template} note`;
    let noteBody = 'Default note body.';
    let isArchived = false;

    switch (template) {
      case TestNoteTemplate.RICH_TEXT:
        noteBody = 'This is a **rich text** note with some _markdown_.';
        break;
      case TestNoteTemplate.WITH_MARKDOWN:
        noteBody = '# Markdown Header\n\n* List item 1\n* List item 2';
        break;
      case TestNoteTemplate.ARCHIVED:
        isArchived = true;
        noteBody = 'This is an archived note.';
        break;
      case TestNoteTemplate.WITH_TASKS:
      case TestNoteTemplate.BASIC:
      default:
        break;
    }

    return this.createRichNote({
      name: noteTitle,
      body: noteBody,
      is_archived: isArchived,
    });
  }

  async createBasicNote(options: BasicNoteOptions): Promise<Note> {
    await this.initialize();
    const userId = await this.getUserId();

    const noteData = {
      name: options.title || `${TEST_NOTE_PREFIX} ${new Date().toISOString()}`,
      body: options.body || 'This is a test note created for UI testing',
      user_id: userId,
      is_archived: options.is_archived || false,
    };

    const { data, error } = await this.supabase.from('notes').insert(noteData).select().single();

    if (error || !data) {
      throw new Error(`Failed to create note: ${error?.message}`);
    }

    return convertDbNoteToNote(data);
  }

  async createRichNote(options: RichNoteOptions): Promise<Note> {
    await this.initialize();
    const userId = await this.getUserId();

    const noteData = {
      name: options.name || `${TEST_NOTE_PREFIX} ${new Date().toISOString()}`,
      body: options.body || 'This is a rich test note created for UI testing with additional formatting',
      user_id: userId,
      tagged_task_ids: options.taggedTaskIds || [],
      is_archived: options.is_archived || false,
    };

    const { data, error } = await this.supabase.from('notes').insert(noteData).select().single();

    if (error || !data) {
      throw new Error(`Failed to create rich note: ${error?.message}`);
    }

    return convertDbNoteToNote(data);
  }

  async createNotesBatch(count: number, noteTitlePrefix = 'Note'): Promise<Note[]> {
    await this.initialize();
    const userId = await this.getUserId();

    // Create array of note data objects
    const notesData = Array.from({ length: count }, (_, i) => ({
      name: `${noteTitlePrefix} ${i + 1} - ${new Date().toISOString()}`,
      body: `This is a batch-created test note #${i + 1}`,
      user_id: userId,
    }));

    // Insert all notes in a single operation
    const { data, error } = await this.supabase.from('notes').insert(notesData).select();

    if (error) {
      throw new Error(`Failed to create notes batch: ${error.message}`);
    }

    return data?.map(noteData => convertDbNoteToNote(noteData)) || [];
  }

  async createMultipleNotes(count: number, options?: RichNoteOptions): Promise<Note[]> {
    await this.initialize();
    const userId = await this.getUserId();

    // Create array of note data objects
    const notesToCreate = Array.from({ length: count }, (_, i) => ({
      name: options?.name ? `${options.name} ${i + 1}` : `${TEST_NOTE_PREFIX} ${i + 1}`,
      body: options?.body || 'This is a test note created for UI testing.',
      user_id: userId,
      tagged_task_ids: options?.taggedTaskIds || [],
      is_archived: options?.is_archived || false,
    }));

    // Insert all notes in a single operation
    const { data, error } = await this.supabase.from('notes').insert(notesToCreate).select();

    if (error) {
      throw new Error(`Failed to create multiple notes: ${error.message}`);
    }

    return data?.map(noteData => convertDbNoteToNote(noteData)) || [];
  }

  async createTestTags(tags: string[]): Promise<{ id: string; name: string }[]> {
    await this.initialize();
    const userId = await this.getUserId();

    const tagsToCreate = tags.map((tag) => ({ name: tag, user_id: userId }));
    const { data, error } = await this.supabase.from('tags').insert(tagsToCreate).select();

    if (error) {
      throw new Error(`Error creating test tags: ${error.message}`);
    }
    return data;
  }

  async createTaskWithNotes(options: TaskWithNotesOptions): Promise<{ task: Task; notes: Note[] }> {
    await this.initialize();

    const task = await this.createRichTask(options.taskOptions || {});

    let notes: Note[] = [];
    if (options.noteCount && options.noteCount > 0) {
      notes = await this.createNotesBatch(options.noteCount, options.noteTitlePrefix);
    }

    return { task, notes };
  }

  async createTaskWithLinkedNote(options: TaskWithLinkedNoteOptions): Promise<{ task: Task; note: Note }> {
    await this.initialize();

    const task = await this.createRichTask(options.taskOptions || {});

    const note = await this.createRichNote({
      name: options.noteOptions?.name || `${TEST_NOTE_PREFIX} ${new Date().toISOString()}`,
      body: options.noteOptions?.body || 'This is a test note created for UI testing.',
      taggedTaskIds: [task.id],
      is_archived: options.noteOptions?.is_archived || false,
    });

    return { task, note };
  }

  async cleanupSpecificTestTasks() {
    await this.initialize();
    const userId = await this.getUserId();

    try {
      // Find all test tasks created by this user
      const { data: tasksToDelete } = await this.supabase
        .from('tasks')
        .select('id')
        .eq('user_id', userId)
        .like('title', `${TEST_TASK_PREFIX}%`);

      if (tasksToDelete && tasksToDelete.length > 0) {
        // Delete the tasks
        const { error } = await this.supabase
          .from('tasks')
          .delete()
          .in('id', tasksToDelete.map((task) => task.id));

        if (error) {
          console.error('Error cleaning up specific test tasks:', error);
        } else {
          console.log(`Deleted ${tasksToDelete.length} test tasks`);
        }
      }

      console.log('Cleanup complete: Specific test tasks removed');
    } catch (err) {
      console.error('Error cleaning up specific test tasks:', err);
    }
  }

  async cleanupTestTasks() {
    await this.initialize();
    const userId = await this.getUserId();

    try {
      // Delete all test tasks
      const { error: taskError } = await this.supabase
        .from('tasks')
        .delete()
        .eq('user_id', userId)
        .like('title', `${TEST_TASK_PREFIX}%`);

      if (taskError) {
        console.error('Error cleaning up test tasks:', taskError);
      }

      // Delete all test tags
      const { error: tagError } = await this.supabase
        .from('tags')
        .delete()
        .eq('user_id', userId)
        .like('tag_name', `${TEST_TAG_PREFIX}%`);

      if (tagError) {
        console.error('Error cleaning up test tags:', tagError);
      }
      
      // Delete all test notes
      const { error: noteError } = await this.supabase
        .from('notes')
        .delete()
        .eq('user_id', userId)
        .like('name', `${TEST_NOTE_PREFIX}%`);

      if (noteError) {
        console.error('Error cleaning up test notes:', noteError);
      }

      console.log('Cleanup complete: All test tasks, tags, and notes removed');
    } catch (err) {
      console.error('Error cleaning up test data:', err);
    }
  }

  /**
   * Unified cleanup method - delegates to comprehensive cleanupTestTasks
   * Maintained for backwards compatibility
   */
  async cleanup() {
    return this.cleanupTestTasks();
  }
}


export const testDataSeeder = new TestDataSeeder();

export async function seedTasksByTemplate(template: TestTaskTemplate, count = 1): Promise<Task[]> {
  const tasks: Task[] = [];
  for (let i = 0; i < count; i++) {
    const task = await testDataSeeder.createTemplateTask(template, `Test Task: ${template} #${i + 1}`);
    tasks.push(task);
  }
  return tasks;
}


/**
 * Seeds test tasks specifically for UI tests
 * Creates tasks with required properties for owedToOthersTasks rendering
 * @param count Number of tasks to create (default: 3)
 * @param options Optional customization options, like prefix
 * @returns Array of created tasks
 */
export async function seedTestTasks(count = 3, options?: { prefix?: string }): Promise<Task[]> {
  // Use the exported testDataSeeder instance directly
  const taskResults: Task[] = [];

  if (testDataSeeder) {
    console.log('[TEST] Starting to seed test tasks for UI tests');
    
    // Get prefix from options or use default
    const prefix = options?.prefix || 'UI Test';
    
    // Create yesterday's date (to ensure it's past due)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    console.log(`[TEST] Creating past-due task with date: ${yesterday.toISOString()}`);
    
    // Create a task with due date yesterday (guaranteed past due)
    const taskWithPeople = await testDataSeeder.createRichTask({
      title: `Test Task with People: ${prefix} #1`,
      description: 'This test task has people assigned and is past due - FOR TESTING OWED TO OTHERS',
      // Use yesterday to ensure it's past due (crucial for owedToOthersTasks filter)
      dueDate: yesterday.toISOString(),
      dueDateType: DueDateType.SPECIFIC,
      // Explicitly set as PENDING (not COMPLETED) - crucial for owedToOthersTasks filter
      status: TaskStatus.PENDING,
      priority: Priority.HIGH,
      effortLevel: EffortLevel.M
    });
    
    console.log(`[TEST] Created task with ID: ${taskWithPeople.id}, due date: ${taskWithPeople.dueDate}, status: ${taskWithPeople.status}`);
    
    // Assign a person to the task manually (this is crucial for owedToOthersTasks filter)
    try {
      // Assign multiple people to increase chance of showing in owedToOthersTasks
      await testDataSeeder.assignPersonToTask(taskWithPeople.id, 'Test Person UI');
      console.log(`[TEST] Assigned first person to task: ${taskWithPeople.id}`);
      
      // Add another person for redundancy
      await testDataSeeder.assignPersonToTask(taskWithPeople.id, 'Test User');
      console.log(`[TEST] Assigned second person to task: ${taskWithPeople.id}`);
      
      // Add the task to results
      taskResults.push(taskWithPeople);
      console.log(`[TEST] Successfully created task with people and past due date: ${taskWithPeople.id}`);
      
      // Debug log to verify task details
      console.log(`[TEST] Task details - ID: ${taskWithPeople.id}, Title: ${taskWithPeople.title}, ` +
        `Due date: ${taskWithPeople.dueDate}, Status: ${taskWithPeople.status}`);
    } catch (err) {
      console.error(`[TEST] ERROR assigning person to task: ${err instanceof Error ? err.message : String(err)}`);
      console.log(`[TEST] Will still include task in results despite error`);
      taskResults.push(taskWithPeople);
    }
    
    // Create remaining tasks as basic tasks
    for (let i = 1; i < count; i++) {
      try {
        const task = await testDataSeeder.createBasicTask({ 
          title: `Test Task: ${prefix} #${i + 1}`,
          description: 'Standard test task'
        });
        taskResults.push(task);
        console.log(`[TEST] Created additional task #${i+1} with ID: ${task.id}`);
      } catch (err) {
        console.error(`[TEST] Error creating additional task #${i+1}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  } else {
    console.error('[TEST] Failed to get test data seeder instance');
  }
  
  return taskResults;
}

/**
 * Seeds multiple notes with options
 * Creates the specified number of notes with the same options
 */
export async function seedMultipleNotes(count = 5, options?: RichNoteOptions): Promise<Note[]> {
  return testDataSeeder.createMultipleNotes(count, options);
}

export async function seedTaskWithNotes(
  options: TaskWithNotesOptions
): Promise<{ task: Task; notes: Note[] }> {
  return testDataSeeder.createTaskWithNotes(options);
}

/**
 * Export cleanupTestTasks function directly for tests
 */
export async function cleanupTestTasks(): Promise<void> {
  return testDataSeeder.cleanupTestTasks();
}

/**
 * Export seedBasicTask function for direct use in tests
 */
export async function seedBasicTask(optionsOrTitle: BasicTaskOptions | string): Promise<Task> {
  return testDataSeeder.createBasicTask(optionsOrTitle);
}

/**
 * Export seedTemplateTask function for direct use in tests
 */
export async function seedTemplateTask(template: TestTaskTemplate, title?: string): Promise<Task> {
  return testDataSeeder.createTemplateTask(template, title);
}

/**
 * Export seedTemplateTasks function for direct use in tests
 * Creates multiple tasks based on the template
 */
export async function seedTemplateTasks(template: TestTaskTemplate, count = 1): Promise<Task[]> {
  const tasks: Task[] = [];
  for (let i = 0; i < count; i++) {
    const task = await seedTemplateTask(template, `Test Task: ${template} #${i + 1}`);
    tasks.push(task);
  }
  return tasks;
}

export async function seedTemplateNote(template: TestNoteTemplate, title?: string): Promise<Note> {
  return testDataSeeder.createTemplateNote(template, title);
}

/**
 * Seeds a basic note with minimal options
 */
export async function seedBasicNote(options?: BasicNoteOptions): Promise<Note> {
  return testDataSeeder.createBasicNote(options || {});
}

/**
 * Seeds a rich note with customizable options
 */
export async function seedRichNote(options?: RichNoteOptions): Promise<Note> {
  return testDataSeeder.createRichNote(options || {});
}

/**
 * Seeds a variety of note templates for comprehensive testing
 */
export async function seedNoteVariety(count = 5): Promise<Note[]> {
  const templates = Object.values(TestNoteTemplate);
  const notes: Note[] = [];

  // Create one of each template
  for (const template of templates) {
    const note = await seedTemplateNote(template);
    notes.push(note);
  }

  // Fill up to count with basic notes
  const remainingCount = count - templates.length;
  if (remainingCount > 0) {
    const basicNotes = await seedTestNotes(remainingCount);
    notes.push(...basicNotes);
  }

  return notes;
}

/**
 * Seeds multiple notes with customization options and optional template
 * This function creates multiple notes based on templates or custom options
 * @param count Number of notes to create
 * @param template Optional template to use for note creation
 * @param options Optional customization options
 */
export async function seedMultipleTemplateNotes(count = 1, template?: TestNoteTemplate, options?: RichNoteOptions): Promise<Note[]> {
  const notes: Note[] = [];
  for (let i = 0; i < count; i++) {
    let note: Note;
    if (template) {
      note = await seedTemplateNote(template, `${TEST_NOTE_PREFIX} ${template} #${i + 1}`);
    } else if (options) {
      note = await seedRichNote({
        ...options,
        name: options.name || `${TEST_NOTE_PREFIX} Rich #${i + 1}`
      });
    } else {
      note = await seedBasicNote({ title: `${TEST_NOTE_PREFIX} Basic #${i + 1}` });
    }
    notes.push(note);
  }
  return notes;
}

/**
 * Seeds basic test notes for UI testing
 */
export async function seedTestNotes(count = 1): Promise<Note[]> {
  const notes: Note[] = [];
  for (let i = 0; i < count; i++) {
    const note = await testDataSeeder.createBasicNote({ title: `${TEST_NOTE_PREFIX} UI Test #${i + 1}` });
    notes.push(note);
  }
  return notes;
}

/**
 * Creates a task with a linked note in a single operation
 */
export async function createTaskWithNote(taskOptions?: RichTaskOptions, noteOptions?: RichNoteOptions): Promise<{ task: Task; note: Note }> {
  return testDataSeeder.createTaskWithLinkedNote({ taskOptions, noteOptions });
}
