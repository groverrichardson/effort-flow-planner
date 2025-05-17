
export type Priority = 'high' | 'normal' | 'low' | 'lowest';

export type EffortLevel = 1 | 2 | 4 | 8 | 16 | 32 | 64;

export interface Group {
  id: string;
  name: string;
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
  targetDeadline: Date | null;
  goLiveDate: Date | null;
  effortLevel: EffortLevel;
  completed: boolean;
  completedDate: Date | null;
  groups: Group[];
  people: Person[];
  createdAt: Date;
  updatedAt: Date;
}
