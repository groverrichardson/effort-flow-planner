
export interface Token {
  type: 'text' | 'tag' | 'person' | 'priority' | 'date' | 'effort';
  value: string;
  original: string;
  start: number;
  end: number;
  color?: string;
}

export interface GeminiResponse {
  success: boolean;
  people: string[];
  tags: string[];
  priority: string | null;
  dueDate: string | null;
  effort: string | null;
}

export interface Suggestion {
  type: string;
  items: { id: string, name: string }[];
}
