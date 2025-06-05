
import { ParsedCSVData, CSVTask } from './types';
import { toast } from '@/components/ui/use-toast';

export const parseRawCSV = (file: File): Promise<ParsedCSVData | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split(/\r\n|\r|\n/).filter(line => line.trim().length > 0);
        
        if (lines.length === 0) {
          toast({
            title: 'Empty CSV',
            description: 'The selected CSV file is empty or contains only whitespace.',
            variant: 'destructive',
          });
          resolve(null);
          return;
        }

        // More robust CSV line parser that handles quoted fields
        const parseCsvLine = (line: string): string[] => {
          const result: string[] = [];
          let currentField = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
                // Handle escaped quote ""
                currentField += '"';
                i++; // Skip next quote
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              result.push(currentField.trim());
              currentField = '';
            } else {
              currentField += char;
            }
          }
          result.push(currentField.trim()); // Add the last field
          return result;
        };

        const headers = parseCsvLine(lines[0]);
        const rows = lines.slice(1).map(line => parseCsvLine(line));
        
        resolve({
          headers,
          rows
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
      else if (lowerHeader === 'duedate' || lowerHeader === 'due date' || lowerHeader === 'scheduleddate' || lowerHeader === 'scheduled date') initialMap[header] = 'targetDeadline';
      else if (lowerHeader === 'people' || lowerHeader === 'person') initialMap[header] = 'people';
      else if (lowerHeader === 'tags' || lowerHeader === 'tag') initialMap[header] = 'tags';
      else if (lowerHeader === 'due date type' || lowerHeader === 'duedatetype' || lowerHeader === 'scheduled date type' || lowerHeader === 'scheduleddatetype') initialMap[header] = 'scheduledDateType';
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
        case 'effortLevel':
          const effort = parseInt(value, 10);
          if (!isNaN(effort)) {
            task.effortLevel = effort;
          }
          break;
        case 'completed':
          const lowerValue = value.toLowerCase();
          if (['true', 'yes', '1'].includes(lowerValue)) {
            task.completed = true;
          } else if (['false', 'no', '0'].includes(lowerValue)) {
            task.completed = false;
          }
          break;
        case 'completedDate':
          task.completedDate = value;
          break;
        case 'dueDateType':
          task.dueDateType = value;
          break;
        case 'goLiveDate':
          task.goLiveDate = value;
          break;
        case 'targetDeadline':
          task.targetDeadline = value;
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
