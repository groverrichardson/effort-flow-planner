
import { useState } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileText, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { naturalLanguageToTask } from '@/utils/naturalLanguageParser';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CSVTask {
  title: string;
  description?: string;
  priority?: string;
  dueDate?: string;
  personNames?: string[];
  tagNames?: string[];
  status?: 'pending' | 'processing' | 'error' | 'success';
  error?: string;
}

const CSVTaskImporter = () => {
  const { addTask, tags, people, addTag, addPerson } = useTaskContext();
  const [file, setFile] = useState<File | null>(null);
  const [csvTasks, setCsvTasks] = useState<CSVTask[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      parseCSV(e.target.files[0]);
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim().length > 0);
        const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
        
        // Validate required headers
        if (!headers.includes('title')) {
          toast({
            title: "Invalid CSV format",
            description: "CSV must contain a 'title' column",
            variant: "destructive",
          });
          return;
        }

        const parsedTasks: CSVTask[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(value => value.trim());
          
          if (values.length !== headers.length) {
            continue; // Skip lines with incorrect number of values
          }
          
          const task: CSVTask = {
            title: '',
            status: 'pending'
          };
          
          headers.forEach((header, index) => {
            if (header === 'title') {
              task.title = values[index];
            } else if (header === 'description') {
              task.description = values[index];
            } else if (header === 'priority') {
              task.priority = values[index];
            } else if (header === 'duedate') {
              task.dueDate = values[index];
            } else if (header === 'people' || header === 'person') {
              task.personNames = values[index] ? values[index].split(';').map(p => p.trim()) : [];
            } else if (header === 'tags') {
              task.tagNames = values[index] ? values[index].split(';').map(t => t.trim()) : [];
            }
          });
          
          // Only add tasks with a title
          if (task.title) {
            parsedTasks.push(task);
          }
        }
        
        setCsvTasks(parsedTasks);
      } catch (error) {
        toast({
          title: "Error parsing CSV",
          description: "Could not parse the CSV file",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleClearFile = () => {
    setFile(null);
    setCsvTasks([]);
  };

  const processTask = async (task: CSVTask, index: number): Promise<void> => {
    try {
      // Mark task as processing
      setCsvTasks(prev => prev.map((t, i) => 
        i === index ? { ...t, status: 'processing' } : t
      ));
      
      // Natural language parsing if the title contains things like @people or #tags
      const enhancedTaskData = await naturalLanguageToTask(task.title);
      
      // Process tags - from both CSV data and NL parsing
      const tagNames = [...(task.tagNames || []), ...(enhancedTaskData.tagNames || [])];
      const taskTags = await Promise.all(tagNames.map(async tagName => {
        const existingTag = tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
        return existingTag || await addTag(tagName);
      }));
      
      // Process people - from both CSV data and NL parsing
      const personNames = [...(task.personNames || []), ...(enhancedTaskData.peopleNames || [])];
      // Limit to max 2 people
      const limitedPersonNames = personNames.slice(0, 2);
      const taskPeople = await Promise.all(limitedPersonNames.map(async personName => {
        const existingPerson = people.find(p => p.name.toLowerCase() === personName.toLowerCase());
        return existingPerson || await addPerson(personName);
      }));

      // Create the new task
      const newTask = {
        title: enhancedTaskData.title || task.title,
        description: task.description || enhancedTaskData.description || '',
        priority: task.priority || enhancedTaskData.priority || 'normal',
        dueDate: enhancedTaskData.dueDate || (task.dueDate ? new Date(task.dueDate) : null),
        targetDeadline: enhancedTaskData.targetDeadline || null,
        goLiveDate: enhancedTaskData.goLiveDate || null,
        effortLevel: enhancedTaskData.effortLevel || 4,
        completed: false,
        completedDate: null,
        tags: taskTags,
        people: taskPeople,
      };
      
      // Add task to the database
      await addTask(newTask);
      
      // Mark task as success
      setCsvTasks(prev => prev.map((t, i) => 
        i === index ? { ...t, status: 'success' } : t
      ));
    } catch (error) {
      console.error(`Error importing task ${index}:`, error);
      
      // Mark task as error
      setCsvTasks(prev => prev.map((t, i) => 
        i === index ? { ...t, status: 'error', error: 'Failed to import' } : t
      ));
    }
  };

  const importTasks = async () => {
    if (!csvTasks.length) return;
    
    setIsImporting(true);
    setImportProgress(0);
    
    // Process tasks sequentially
    for (let i = 0; i < csvTasks.length; i++) {
      await processTask(csvTasks[i], i);
      setImportProgress(Math.round(((i + 1) / csvTasks.length) * 100));
    }
    
    toast({
      title: "Bulk import completed",
      description: `Successfully imported ${csvTasks.filter(t => t.status === 'success').length} of ${csvTasks.length} tasks`,
    });
    
    setIsImporting(false);
  };

  const getTaskStatusIcon = (status: CSVTask['status']) => {
    switch (status) {
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-2">Bulk Import Tasks</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Import multiple tasks using a CSV file. The CSV must include at least a 'title' column.
          Optional columns: description, priority, dueDate, people (use semicolons for multiple), tags (use semicolons for multiple).
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <Input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          id="csv-file"
          className="hidden"
        />
        <label
          htmlFor="csv-file"
          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Upload size={16} />
          Choose CSV File
        </label>
        
        {file && (
          <button
            onClick={handleClearFile}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <X size={16} className="mr-1" /> Clear
          </button>
        )}
      </div>
      
      {file && (
        <div className="flex items-center gap-2 text-sm">
          <FileText size={16} />
          <span>{file.name}</span>
        </div>
      )}
      
      {csvTasks.length > 0 && (
        <div className="space-y-4">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">Status</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>People</TableHead>
                  <TableHead>Tags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {csvTasks.slice(0, 10).map((task, index) => (
                  <TableRow key={index}>
                    <TableCell>{getTaskStatusIcon(task.status)}</TableCell>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>{task.priority || 'Normal'}</TableCell>
                    <TableCell>{task.dueDate || '-'}</TableCell>
                    <TableCell>{task.personNames?.join(', ') || '-'}</TableCell>
                    <TableCell>{task.tagNames?.join(', ') || '-'}</TableCell>
                  </TableRow>
                ))}
                {csvTasks.length > 10 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                      + {csvTasks.length - 10} more tasks
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {isImporting ? (
            <div className="space-y-2">
              <div className="w-full bg-muted rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${importProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-center">
                Importing... {Math.round(importProgress)}%
              </p>
            </div>
          ) : (
            <Button onClick={importTasks} className="w-full">
              Import {csvTasks.length} Tasks
            </Button>
          )}
          
          <Alert variant="default" className="bg-muted/50">
            <FileText className="h-4 w-4" />
            <AlertTitle>CSV Format Example</AlertTitle>
            <AlertDescription className="font-mono text-xs">
              title,description,priority,dueDate,people,tags<br />
              "Call client","Discuss project timeline",high,2025-05-25,"John Smith;Jane Doe","client;important"
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

export default CSVTaskImporter;
