
export interface CSVTask {
  title: string;
  description?: string;
  priority?: string;
  dueDate?: string;
  personNames?: string[];
  tagNames?: string[];
  effortLevel?: number;
  completed?: boolean;
  completedDate?: string;
  dueDateType?: string;
  goLiveDate?: string;
  targetDeadline?: string;
  status?: 'pending' | 'processing' | 'error' | 'success';
  error?: string;
}

export interface ParsedCSVData {
  headers: string[];
  rows: string[][];
}
