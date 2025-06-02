
// Add this TaskSegment definition
export interface TaskSegment {
  id?: string; // Optional: if segments are stored as separate entities with their own IDs
  parent_task_id: string; // ID of the original task this segment belongs to
  effort_points: number; // Effort points allocated to this segment
  scheduled_date: string; // ISO date string for when this segment is scheduled
  status: TaskStatus; // Status of this segment (e.g., PENDING, IN_PROGRESS, COMPLETED)
  // Optional: Add user_id, created_at, updated_at if segments are first-class DB entities
  // user_id?: string;
  // created_at?: string;
  // updated_at?: string;
}

export enum Priority {
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low',
  LOWEST = 'lowest',
}

export enum EffortLevel {
  NONE = 0,
  XS = 1,
  S = 2,
  M = 4,
  L = 8,
  XL = 16,
  XXL = 32,
  XXXL = 64,
}

export enum DueDateType {
  ON = 'on',
  BY = 'by',
  SPECIFIC = 'on', // Alias for ON, used in tests
  NONE = 'none'    // For tasks with no specific due date type
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DEFERRED = 'DEFERRED',
}

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurrenceRule {
  id: string; // Unique ID for the recurrence rule
  frequency: RecurrenceFrequency;
  interval?: number; // e.g., repeats every 'interval' 'frequency'. Defaults to 1.
  daysOfWeek?: number[]; // For 'weekly': 0 for Sunday, 1 for Monday, ..., 6 for Saturday.
  dayOfMonth?: number; // For 'monthly': 1-31. For 'yearly': 1-31.
  monthOfYear?: number; // For 'yearly': 0 for January, ..., 11 for December.
  repeatOnlyOnCompletion?: boolean; // Task repeats only after the previous instance is completed
  endConditionType?: 'never' | 'onDate' | 'afterOccurrences';
  endDate?: string | Date | null; // Can be stored as ISO string or Date object
  count?: number | null; // Number of occurrences
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface Person {
  id: string;
  name: string;
  avatar_url?: string | null;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: Date | null;
  dueDateType: DueDateType;
  targetDeadline: Date | null;
  goLiveDate: Date | null;
  effortLevel: EffortLevel;
  completed: boolean;
  completedDate: Date | null;
  tags: Tag[];
  people: Person[];
  dependencies: string[];
  createdAt: Date;
  updatedAt: Date;
  originalScheduledDate?: Date | null; // The date this instance was scheduled to occur based on the rule
  is_archived?: boolean; // Assuming this was added from memory
  segments?: TaskSegment[]; // <-- ADDED
  recurrenceRuleId?: string; // Link to a RecurrenceRule
  recurrenceRule?: RecurrenceRule; // Full recurrence rule object, if fetched
  isRecurringInstance?: boolean; // True if this task is an instance of a recurring series
  originalRecurringTaskId?: string; // If it's an instance, ID of the "template" task
  is_archived: boolean; // Whether the task is archived
  userId: string; // Identifier of the user who owns the task
}

// Core fields for a task, used for both creation and updates
export interface TaskCore {
  title?: string;
  description?: string;
  status: TaskStatus;
  priority?: Priority;
  dueDate?: Date | string | null; // Allow string for API flexibility, convert to Date in service
  dueDateType?: DueDateType;
  targetDeadline?: Date | string | null;
  goLiveDate?: Date | string | null;
  effortLevel?: EffortLevel;
  completed: boolean;
  completedDate?: Date | string | null;
  is_archived?: boolean;
  // Relationships - IDs or full objects can be passed for creation/update
  tags?: (string | Tag)[]; // Array of tag IDs or Tag objects
  people?: (string | Person)[]; // Array of person IDs or Person objects
  dependencies?: string[]; // Array of task IDs
  recurrenceRuleId?: string | null;
  originalScheduledDate?: Date | string | null;
  isRecurringInstance?: boolean;
  originalRecurringTaskId?: string | null;
  scheduled_start_date?: Date | string | null;
  segments?: TaskSegment[]; // <-- ADDED
  recurrenceRule?: RecurrenceRule | Omit<RecurrenceRule, 'id' | 'taskId' | 'userId' | 'createdAt' | 'updatedAt'> | null;
}

// Payload for creating a new task. Some fields are mandatory.
export interface TaskCreationPayload extends TaskCore {
  title: string; 
  description: string;
  // Ensure all fields required by 'Task' (and not omitted by createTask) are present
  priority: Priority;
  dueDate: Date | null;
  dueDateType: DueDateType;
  targetDeadline: Date | null;
  goLiveDate: Date | null;
  effortLevel: EffortLevel;
  completedDate: Date | null;
  tags: Tag[];
  people: Person[];
  dependencies: string[];
  // userId will be set by the service based on the authenticated user
}

// Payload for updating an existing task. All fields are optional.
export type TaskUpdatePayload = TaskCore;

// For backward compatibility
export type Group = Tag;

// Interface for the structured data returned by natural language parsing functions
export interface ParsedTaskDetails {
  title: string;
  description?: string;
  dueDate?: Date | null;
  priority?: Priority | null;
  effortLevel?: EffortLevel | null;
  peopleNames?: string[];
  tagNames?: string[];
  originalDatePhrase?: string | null;
  goLiveDate?: Date | null; // Added to support traditional parser output
}

// Note related types
export * from './note';
