
export interface CSVTask {
  title: string;
  description?: string;
  priority?: string;
  dueDate?: string;
  personNames?: string[];
  tagNames?: string[];
  status?: 'pending' | 'processing' | 'error' | 'success';
  error?: string;
}

export interface ParsedCSVData {
  headers: string[];
  rows: string[][];
}
