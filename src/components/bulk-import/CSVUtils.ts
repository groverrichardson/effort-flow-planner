
import { ParsedCSVData, CSVTask } from './types';
import { toast } from '@/components/ui/use-toast';

export const parseRawCSV = (file: File): Promise<ParsedCSVData | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim().length > 0);
        
        if (lines.length === 0) {
          toast({
            title: "Empty CSV file",
            description: "The CSV file doesn't contain any data",
            variant: "destructive",
          });
          resolve(null);
          return;
        }

        // Parse CSV into rows and columns
        const rows = lines.map(line => 
          line.split(',').map(value => value.trim().replace(/^["'](.*)["']$/, '$1'))
        );
        
        resolve({
          headers: rows[0],
          rows: rows.slice(1)
        });
      } catch (error) {
        toast({
          title: "Error parsing CSV",
          description: "Could not parse the CSV file",
          variant: "destructive",
        });
        resolve(null);
      }
    };
    reader.readAsText(file);
  });
};

export const createInitialColumnMap = (headers: string[], hasHeaders: boolean): Record<string, string> => {
  const initialMap: Record<string, string> = {};
  
  if (hasHeaders) {
    headers.forEach(header => {
      const lowerHeader = header.toLowerCase();
      if (lowerHeader === 'title') initialMap[header] = 'title';
      else if (lowerHeader === 'description') initialMap[header] = 'description';
      else if (lowerHeader === 'priority') initialMap[header] = 'priority';
      else if (lowerHeader === 'duedate' || lowerHeader === 'due date') initialMap[header] = 'dueDate';
      else if (lowerHeader === 'people' || lowerHeader === 'person') initialMap[header] = 'people';
      else if (lowerHeader === 'tags' || lowerHeader === 'tag') initialMap[header] = 'tags';
      else initialMap[header] = 'ignore';
    });
  } else {
    headers.forEach(header => {
      initialMap[header] = 'ignore';
    });
  }
  
  return initialMap;
};

export const generateTasksFromCSV = (parsedData: ParsedCSVData, columnMap: Record<string, string>): CSVTask[] => {
  const tasks: CSVTask[] = [];
  const { headers, rows } = parsedData;
  
  // Process each row based on the column mapping
  rows.forEach(row => {
    const task: CSVTask = { title: '', status: 'pending' };
    
    // Apply mapping to extract fields
    headers.forEach((header, index) => {
      const field = columnMap[header];
      if (!field || field === 'ignore' || index >= row.length) return; // Skip ignored fields
      
      const value = row[index];
      if (!value) return;
      
      switch (field) {
        case 'title':
          task.title = value;
          break;
        case 'description':
          task.description = value;
          break;
        case 'priority':
          task.priority = value;
          break;
        case 'dueDate':
          task.dueDate = value;
          break;
        case 'people':
          task.personNames = value ? value.split(';').map(p => p.trim()) : [];
          break;
        case 'tags':
          task.tagNames = value ? value.split(';').map(t => t.trim()) : [];
          break;
      }
    });
    
    // Only add tasks with a title
    if (task.title) {
      tasks.push(task);
    }
  });
  
  return tasks;
};
