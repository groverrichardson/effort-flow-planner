
export type Priority = 'high' | 'normal' | 'low' | 'lowest';

export type EffortLevel = 1 | 2 | 4 | 8 | 16 | 32 | 64;

export type DueDateType = 'on' | 'by'; // New type for due date requirement

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface Person {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: Date | null;
  dueDateType: DueDateType; // New field to track if task must be done "on" or "by" the due date
  targetDeadline: Date | null;
  goLiveDate: Date | null;
  effortLevel: EffortLevel;
  completed: boolean;
  completedDate: Date | null;
  tags: Tag[];
  people: Person[];
  dependencies: string[]; // Array of task IDs that must be completed before this task can be completed
  createdAt: Date;
  updatedAt: Date;
}

// For backward compatibility
export interface Group extends Tag {}
