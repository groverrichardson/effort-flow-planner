
import { useState, useEffect } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { naturalLanguageToTask } from '@/utils/naturalLanguageParser';
import { CSVFileUploader } from './CSVFileUploader';
import { CSVMappingSection } from './CSVMappingSection';
import { TaskPreviewTable } from './TaskPreviewTable';
import { ImportProgressBar } from './ImportProgressBar';
import { CSVHelpAlert } from './CSVHelpAlert';
import { parseRawCSV, createInitialColumnMap, generateTasksFromCSV } from './CSVUtils';
import { CSVTask, ParsedCSVData } from './types';
import { TaskStatus, Priority, EffortLevel } from '@/types'; // Added TaskStatus, Priority, EffortLevel for explicit typing

const CSVTaskImporter = () => {
  const { addTask, tags, people, addTag, addPerson } = useTaskContext();
  const [file, setFile] = useState<File | null>(null);
  const [csvTasks, setCsvTasks] = useState<CSVTask[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [parsedData, setParsedData] = useState<ParsedCSVData | null>(null);
  const [hasHeaders, setHasHeaders] = useState(true);
  const [columnMap, setColumnMap] = useState<Record<string, string>>({});
  const [mappingComplete, setMappingComplete] = useState(false);

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    setMappingComplete(false);
    setCsvTasks([]);
    
    const parsedCSV = await parseRawCSV(selectedFile);
    if (parsedCSV) {
      setParsedData(parsedCSV);
      const initialMap = createInitialColumnMap(parsedCSV.headers, hasHeaders);
      setColumnMap(initialMap);
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setParsedData(null);
    setCsvTasks([]);
    setMappingComplete(false);
  };

  const handleHeaderToggle = (checked: boolean) => {
    setHasHeaders(checked);
    
    if (parsedData) {
      // If we're toggling headers off, we need to treat first row as data
      // If we're toggling headers on, we need to treat first row as headers
      setParsedData({
        headers: checked ? parsedData.rows[0] : Array.from({ length: parsedData.rows[0].length }, (_, i) => `Column ${i + 1}`),
        rows: checked ? parsedData.rows.slice(1) : parsedData.rows
      });
      
      // Reset column mapping when header toggle changes
      const headers = checked ? parsedData.rows[0] : Array.from({ length: parsedData.rows[0].length }, (_, i) => `Column ${i + 1}`);
      const initialMap = createInitialColumnMap(headers, checked);
      setColumnMap(initialMap);
    }
  };

  const applyColumnMapping = () => {
    if (!parsedData) return;
    
    const tasks = generateTasksFromCSV(parsedData, columnMap);
    
    if (tasks.length === 0) {
      toast({
        title: "No valid tasks",
        description: "Could not find any valid tasks in the CSV. Make sure the title column is mapped correctly.",
        variant: "destructive",
      });
      return;
    }
    
    setCsvTasks(tasks);
    setMappingComplete(true);
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
        status: TaskStatus.PENDING, // Added default status
        priority: task.priority || enhancedTaskData.priority || Priority.NORMAL,
        dueDate: enhancedTaskData.dueDate || (task.dueDate ? new Date(task.dueDate) : null),
        dueDateType: enhancedTaskData.dueDateType || 'by',
        scheduledDate: enhancedTaskData.scheduledDate || enhancedTaskData.targetDeadline || (task.scheduledDate ? new Date(task.scheduledDate) : (task.targetDeadline ? new Date(task.targetDeadline) : null)),
        targetDeadline: enhancedTaskData.scheduledDate || enhancedTaskData.targetDeadline || (task.scheduledDate ? new Date(task.scheduledDate) : (task.targetDeadline ? new Date(task.targetDeadline) : null)), // For transition period
        goLiveDate: enhancedTaskData.goLiveDate || null,
        effortLevel: enhancedTaskData.effortLevel || EffortLevel.M, // Default to Medium effort
        completed: false,
        completedDate: null,
        tags: taskTags,
        people: taskPeople,
        dependencies: []
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

  return (
    <div className="space-y-4 pt-4">
      {/* Header removed, as it's now handled by BulkImportDialog */}
      <CSVFileUploader 
        file={file} 
        onFileChange={handleFileChange} 
        onClearFile={handleClearFile} 
      />
      
      <CSVMappingSection
        parsedData={parsedData}
        hasHeaders={hasHeaders}
        columnMap={columnMap}
        onHeaderToggle={handleHeaderToggle}
        onColumnMapChange={setColumnMap}
        onApplyMapping={applyColumnMapping}
        mappingComplete={mappingComplete}
      />
      
      {csvTasks.length > 0 && mappingComplete && (
        <div className="space-y-4">
          <TaskPreviewTable tasks={csvTasks} />
          
          <ImportProgressBar progress={importProgress} isImporting={isImporting} />
          
          {!isImporting && (
            <Button onClick={importTasks} className="w-full">
              Import {csvTasks.length} Tasks
            </Button>
          )}
          
          <CSVHelpAlert />
        </div>
      )}
    </div>
  );
};

export default CSVTaskImporter;
