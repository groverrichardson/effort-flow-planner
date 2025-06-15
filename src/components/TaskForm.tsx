import { useState, useEffect, useCallback } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { Task, Priority, EffortLevel, DueDateType, RecurrenceFrequency, RecurrenceRule, TaskStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { format, addDays, addWeeks, addMonths } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { naturalLanguageToTask } from '@/utils/naturalLanguageParser';
import debounce from 'lodash.debounce';

import DatePickerField from './form/DatePickerField';
import TagSelector from './form/TagSelector';
import PeopleSelector from './form/PeopleSelector';
import TaskFormActions from './form/TaskFormActions';
import DependencySelector from './form/DependencySelector';
// import RecurrenceFields from './form/RecurrenceFields';
import { useNoteStore } from '@/store/noteStore';
import { Note } from '@/types';
import { PlusCircle, Pencil, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface TaskFormProps {
    task?: Task;
    onSubmit: (taskData: Task | Partial<Task>) => Promise<void>;
    onCancel?: () => void;
    onArchive?: (taskId: string) => void;
    onDelete?: (taskId: string) => void;
    onOpenCreateNoteDialogForTask?: (taskId: string) => void;
}

type LiveParseState = {
  originalDatePhrase?: string | null;
};

const TaskForm = ({
    task,
    onSubmit,
    onCancel,
    onArchive,
    onDelete,
    onOpenCreateNoteDialogForTask,
}: TaskFormProps) => {
    const { createTask, updateTask } = useTaskContext();
    const isEditing = !!task;
    const navigate = useNavigate();
    const location = useLocation();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState<string | undefined>('');
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
    const [dueDateType, setDueDateType] = useState<DueDateType>(DueDateType.SpecificDate);
    const [priority, setPriority] = useState<Priority>(Priority.Medium);
    const [effort, setEffort] = useState<EffortLevel>(EffortLevel.Medium);
    const [status, setStatus] = useState<TaskStatus>(TaskStatus.ToDo);
    const [assignedTo, setAssignedTo] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [dependencies, setDependencies] = useState<string[]>([]); 
    const [subTasks, setSubTasks] = useState<Partial<Task>[]>([]);
    const [parentId, setParentId] = useState<string | null>(null);
    const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule | null>(null);
    const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
    const [completionDate, setCompletionDate] = useState<Date | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [liveParseState, setLiveParseState] = useState<LiveParseState>({});

    const { notes, fetchNotesForTask, linkNoteToTask, unlinkNoteFromTask } = useNoteStore();
    const [linkedNotes, setLinkedNotes] = useState<Note[]>([]);

    const { people: allPeople, tags: allTags, tasks: allTasksForDeps } = useTaskContext();


    const handleOpenCreateNoteDialog = () => {
      if (task?.id && onOpenCreateNoteDialogForTask) {
        onOpenCreateNoteDialogForTask(task.id);
      } else if (!task?.id) {
        toast({
          title: "Save Task First",
          description: "Please save this task before creating and linking notes.",
          variant: "default",
        });
      } else {
        console.warn("onOpenCreateNoteDialogForTask is not defined, but task ID exists.")
        toast({
          title: "Cannot Create Note",
          description: "The functionality to create notes is not available right now.",
          variant: "destructive", 
        });
      }
    };

    const handleLinkExistingNote = async (noteId: string) => {
      if (task?.id) {
        try {
          await linkNoteToTask(noteId, task.id);
          toast({ title: 'Note linked successfully' });
          loadNotes(); // Refresh linked notes
        } catch (error) {
          console.error('Error linking note:', error);
          toast({ title: 'Error linking note', description: (error as Error).message, variant: 'destructive' });
        }
      } else {
        toast({ title: 'Cannot link note', description: 'Task must be saved first.', variant: 'destructive' });
      }
    };
    
    const handleRemoveNoteFromTask = async (noteId: string) => {
      if (task?.id) {
        try {
          await unlinkNoteFromTask(noteId, task.id);
          toast({ title: 'Note unlinked successfully' });
          loadNotes(); // Refresh linked notes
        } catch (error) {
          console.error('Error unlinking note:', error);
          toast({ title: 'Error unlinking note', description: (error as Error).message, variant: 'destructive' });
        }
      } else {
        toast({ title: 'Cannot unlink note', description: 'Task must be saved first.', variant: 'destructive' });
      }
    };


    const loadNotes = useCallback(async () => {
      if (task?.id) {
        const notesForTask = await fetchNotesForTask(task.id);
        setLinkedNotes(notesForTask || []);
      }
    }, [task?.id, fetchNotesForTask]);

    useEffect(() => {
      loadNotes();
    }, [loadNotes]);

    useEffect(() => {
        if (task) {
            setTitle(task.title || '');
            setDescription(task.description || '');
            setDueDate(task.due_date ? new Date(task.due_date) : undefined);
            setDueDateType(task.due_date_type || DueDateType.SpecificDate);
            setPriority(task.priority || Priority.Medium);
            setEffort(task.effort_level || EffortLevel.Medium);
            setStatus(task.status || TaskStatus.ToDo);
            setAssignedTo(task.assigned_to || []);
            setTags(task.tags || []);
            setDependencies(task.dependencies || []);
            setSubTasks(task.subTasks || []);
            setParentId(task.parent_id || null);
            setScheduledDate(task.scheduled_date ? new Date(task.scheduled_date) : undefined);
            setCompletionDate(task.completion_date ? new Date(task.completion_date) : undefined);

            // Handle both recurrenceRule (from test) and recurrence_rule (from API)
            const ruleToUse = task.recurrenceRule || task.recurrence_rule;
            if (ruleToUse) {
                setRecurrenceRule({
                    ...ruleToUse,
                    frequency: ruleToUse.frequency || RecurrenceFrequency.DAILY,
                    interval: ruleToUse.interval || 1,
                    repeatOnlyOnCompletion: ruleToUse.repeatOnlyOnCompletion === true,
                    ends_on_type: ruleToUse.ends_on_type,
                    ends_on_date: ruleToUse.ends_on_date ? new Date(ruleToUse.ends_on_date) : undefined,
                    ends_after_occurrences: ruleToUse.ends_after_occurrences,
                });
            } else {
                setRecurrenceRule(null);
            }
        } else {
            // Set defaults for new task form
            setTitle('');
            setDescription('');
            setDueDate(undefined);
            setDueDateType(DueDateType.SpecificDate);
            setPriority(Priority.Medium);
            setEffort(EffortLevel.Medium);
            setStatus(TaskStatus.ToDo);
            setAssignedTo([]);
            setTags([]);
            setDependencies([]);
            setSubTasks([]);
            setParentId(null);
            setRecurrenceRule(null);
            setScheduledDate(undefined);
            setCompletionDate(undefined);
        }
    }, [task]);

    const handleTitleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTitle = e.target.value;
      setTitle(newTitle);
      debouncedParseTitle(newTitle);
    };

    const debouncedParseTitle = useCallback(
      debounce(async (currentTitle: string) => {
        if (!isEditing && currentTitle.trim() !== '') { // Only parse for new tasks and if title is not empty
          try {
            const parsedDetails = await naturalLanguageToTask(currentTitle);
            if (parsedDetails) {
              if (parsedDetails.dueDate) {
                setDueDate(parsedDetails.dueDate);
                setLiveParseState(prev => ({...prev, originalDatePhrase: parsedDetails.originalDatePhrase || null }));
              }
              if (parsedDetails.priority) setPriority(parsedDetails.priority as Priority);
              if (parsedDetails.effort) setEffort(parsedDetails.effort as EffortLevel);
              if (parsedDetails.tags && parsedDetails.tags.length > 0) setTags(prevTags => Array.from(new Set([...prevTags, ...parsedDetails.tags!])));
              if (parsedDetails.people && parsedDetails.people.length > 0) setAssignedTo(prevPeople => Array.from(new Set([...prevPeople, ...parsedDetails.people!])));
            }
          } catch (error) {
            console.error("Error parsing title:", error);
            // Potentially show a toast or a subtle error message to the user
          }
        }
      }, 500), // 500ms debounce delay
      [isEditing] // Recreate debounce if isEditing changes
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (!title.trim()) {
            toast({
                title: "Title is required",
                description: "Please enter a title for the task.",
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }

        const taskData: Partial<Task> = {
            title,
            description,
            due_date: dueDate ? dueDate.toISOString() : null,
            due_date_type: dueDateType,
            priority,
            effort_level: effort,
            status,
            assigned_to: assignedTo,
            tags,
            dependencies,
            // subTasks, // Subtasks might need separate handling or a different structure in DB
            parent_id: parentId,
            recurrence_rule: recurrenceRule ? {
                ...recurrenceRule,
                ends_on_date: recurrenceRule.ends_on_date ? recurrenceRule.ends_on_date.toISOString() : undefined,
            } : null,
            scheduled_date: scheduledDate ? scheduledDate.toISOString() : null,
            completion_date: completionDate ? completionDate.toISOString() : null,
        };

        try {
            if (isEditing && task?.id) {
                await onSubmit({ id: task.id, ...taskData });
                toast({
                    title: "Task Updated",
                    description: `Task "${title}" has been updated.`,
                });
            } else {
                await onSubmit(taskData as Task); // For new tasks, it's a full Task object (minus id, created_at etc)
                toast({
                    title: "Task Created",
                    description: `New task "${title}" has been created.`,
                });
                // Reset form for new task entry if needed, or navigate away
                // For now, we rely on parent component to handle navigation or form reset via onCancel or successful onSubmit
            }
        } catch (error) {
            console.error("Error submitting task:", error);
            toast({
                title: "Submission Error",
                description: (error as Error).message || "Could not save the task. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRecurrenceChange = (rule: RecurrenceRule | null) => {
        setRecurrenceRule(rule);
    };

    return (
        <div className="h-full flex flex-col">
          <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden" aria-label="Task Form">
            <div className="flex items-center justify-between mb-4 p-4 bg-background sticky top-0 z-10 border-b">
              <h2 className="text-xl font-semibold" id="task-form-title-header">{isEditing ? 'Edit Task' : 'Create New Task'}</h2>
              <div className="flex items-center">
                {/* Future: Add quick actions like 'Save & New' or 'Templates' here? */}
              </div>
            </div>
    
            <div className="flex-grow overflow-y-auto p-4 space-y-6" id="task-form-scrollable-content">
              {/* Basic Info: Title & Description */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium" id="task-form-title-label">Title <span className="text-destructive">*</span></Label>
                <Input
                  id="title"
                  value={title}
                  onChange={handleTitleChange} 
                  placeholder="e.g., Follow up with John Doe next Tuesday at 2pm #meeting @JohnDoe p1 e:low"
                  required
                  className="text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium" id="task-form-description-label">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add more details about the task..."
                  rows={4}
                  className="text-sm"
                />
              </div>
    
              {/* Scheduling: Due Date, Scheduled Date, Recurrence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DatePickerField 
                  label="Due Date" 
                  date={dueDate}
                  setDate={setDueDate} 
                  enableTime={true}
                  originalDatePhrase={liveParseState.originalDatePhrase}
                  clearOriginalDatePhrase={() => setLiveParseState(prev => ({...prev, originalDatePhrase: null}))}
                  idPrefix="task-form-due-date"
                  aria-label="Select a due date for this task"
                />
                <DatePickerField 
                  label="Scheduled Date" 
                  date={scheduledDate} 
                  setDate={setScheduledDate} 
                  enableTime={false} 
                  idPrefix="task-form-scheduled-date"
                  aria-label="Select a scheduled date for this task"
                  description="The date when this task is planned to be worked on"
                />
              </div>

              {/* Recurrence Section */}
              <div className="space-y-4 p-4 border rounded-md bg-muted/20" id="task-form-recurrence-section">
                <div className="space-y-2">
                  <Label htmlFor="recurrence-frequency" className="text-sm font-medium" id="task-form-recurrence-frequency-label">
                    Repeats
                  </Label>
                  <Select
                    value={recurrenceRule?.frequency || RecurrenceFrequency.NEVER}
                    onValueChange={(value) => {
                      if (value === RecurrenceFrequency.NEVER) {
                        setRecurrenceRule(null);
                      } else if (!recurrenceRule) {
                        // Create a new recurrence rule with default values
                        setRecurrenceRule({
                          id: 'temp-id', // Temporary ID until saved to backend
                          frequency: value as RecurrenceFrequency,
                          interval: 1,
                          repeatOnlyOnCompletion: false,
                          // Additional fields based on frequency
                          dayOfMonth: 1,
                          daysOfWeek: []
                        });
                      } else {
                        // Update existing rule frequency
                        handleRecurrenceChange({
                          ...recurrenceRule,
                          frequency: value as RecurrenceFrequency,
                        });
                      }
                    }}
                  >
                    <SelectTrigger id="recurrence-frequency" data-testid="recurrence-frequency-select-trigger" aria-labelledby="task-form-recurrence-frequency-label">
                      <SelectValue placeholder="Select recurrence" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(RecurrenceFrequency).map((freq) => (
                        <SelectItem key={freq} value={freq} data-testid={`select-item-${freq.toLowerCase()}`} id={`task-form-recurrence-freq-option-${freq.toLowerCase()}`}>
                          {freq.charAt(0).toUpperCase() + freq.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {recurrenceRule && recurrenceRule.frequency !== RecurrenceFrequency.NEVER && (
                  <div className="space-y-4 pl-2 border-l-2 border-primary/20">
                    <div className="space-y-2">
                      <Label htmlFor="recurrence-interval" className="text-sm font-medium" id="task-form-recurrence-interval-label">
                        Repeat every
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="recurrence-interval"
                          type="number"
                          min="1"
                          value={recurrenceRule.interval || 1}
                          onChange={(e) => handleRecurrenceChange({ ...recurrenceRule, interval: parseInt(e.target.value, 10) || 1 })}
                          className="w-20"
                          data-testid="recurrence-interval-input"
                        />
                        <span className="text-sm text-muted-foreground">
                          {recurrenceRule.frequency === RecurrenceFrequency.DAILY && (recurrenceRule.interval === 1 ? 'day' : 'days')}
                          {recurrenceRule.frequency === RecurrenceFrequency.WEEKLY && (recurrenceRule.interval === 1 ? 'week' : 'weeks')}
                          {recurrenceRule.frequency === RecurrenceFrequency.MONTHLY && (recurrenceRule.interval === 1 ? 'month' : 'months')}
                          {recurrenceRule.frequency === RecurrenceFrequency.YEARLY && (recurrenceRule.interval === 1 ? 'year' : 'years')}
                        </span>
                      </div>
                    </div>

                    {/* Placeholder for more specific recurrence options (e.g., days of week for weekly) */}
                    {recurrenceRule.frequency === RecurrenceFrequency.WEEKLY && (
                        <div className="text-sm text-muted-foreground p-2 bg-amber-50 border border-amber-200 rounded-md" id="task-form-weekly-options-placeholder">
                            Weekly options (e.g., select days) will be here.
                        </div>
                    )}
                    {recurrenceRule.frequency === RecurrenceFrequency.MONTHLY && (
                        <div className="text-sm text-muted-foreground p-2 bg-amber-50 border border-amber-200 rounded-md" id="task-form-monthly-options-placeholder">
                            Monthly options (e.g., on day X, or Nth weekday) will be here.
                        </div>
                    )}
                    {recurrenceRule.frequency === RecurrenceFrequency.YEARLY && (
                        <div className="text-sm text-muted-foreground p-2 bg-amber-50 border border-amber-200 rounded-md" id="task-form-yearly-options-placeholder">
                            Yearly options will be here.
                        </div>
                    )}

                    {/* Repeat only after completion checkbox - only show when recurrenceRule exists and frequency is not NEVER */}
                    {recurrenceRule && recurrenceRule.frequency !== RecurrenceFrequency.NEVER && (
                      <div className="flex items-center space-x-2 pt-2">
                        <Checkbox
                          id="repeat-only-on-completion"
                          data-testid="repeat-only-on-completion-checkbox"
                          checked={recurrenceRule.repeatOnlyOnCompletion === true}
                          onCheckedChange={(checked) => {
                            if (recurrenceRule) {
                              handleRecurrenceChange({
                                ...recurrenceRule,
                                repeatOnlyOnCompletion: checked === true,
                              });
                            }
                          }}
                        />
                        <Label htmlFor="repeat-only-on-completion" className="text-sm font-normal cursor-pointer" id="task-form-repeat-only-on-completion-label">
                          Repeat only after task completion
                        </Label>
                      </div>
                    )}

                    {/* Recurrence End Condition */}
                    <div className="space-y-2 pt-2">
                        <Label htmlFor="ends-condition-type" className="text-sm font-medium" id="task-form-ends-condition-type-label">Ends</Label>
                        <div className="flex items-center space-x-2">
                            <Select 
                                value={recurrenceRule.ends_on_type || 'never'} 
                                onValueChange={(value) => {
                                    const newEndsOnType = value as 'never' | 'on_date' | 'after_occurrences';
                                    let newEndsOnDate = recurrenceRule.ends_on_date;
                                    let newEndsAfterOccurrences = recurrenceRule.ends_after_occurrences;

                                    if (newEndsOnType === 'never') {
                                        newEndsOnDate = undefined;
                                        newEndsAfterOccurrences = undefined;
                                    } else if (newEndsOnType === 'on_date' && !newEndsOnDate) {
                                        // Default to one month from due date or today if due date not set
                                        const baseDate = dueDate || new Date();
                                        newEndsOnDate = addMonths(baseDate, 1);
                                    } else if (newEndsOnType === 'after_occurrences' && !newEndsAfterOccurrences) {
                                        newEndsAfterOccurrences = 10; // Default occurrences
                                    }

                                    handleRecurrenceChange({
                                        ...recurrenceRule,
                                        ends_on_type: newEndsOnType,
                                        ends_on_date: newEndsOnDate,
                                        ends_after_occurrences: newEndsAfterOccurrences,
                                    });
                                }}
                                data-testid="ends-condition-type-select" 
                            >
                                <SelectTrigger id="ends-condition-type" data-testid="ends-condition-type-select-trigger">
                                    <SelectValue placeholder="Select end condition" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="never">Never</SelectItem>
                                  <SelectItem value="on_date">On Date</SelectItem>
                                  <SelectItem value="after_occurrences">After X Occurrences</SelectItem>
                                </SelectContent>
                              </Select>
                          </div>
                        {recurrenceRule.ends_on_type === 'on_date' && (
                            <div className="pt-2">
                                <DatePickerField 
                                    label="End Date" 
                                    date={recurrenceRule.ends_on_date} 
                                    setDate={(date) => handleRecurrenceChange({...recurrenceRule, ends_on_date: date})} 
                                    idPrefix="task-form-recurrence-end-date"
                                />
                            </div>
                        )}
                        {recurrenceRule.ends_on_type === 'after_occurrences' && (
                            <div className="flex items-center space-x-2 pt-2">
                                <Input 
                                    type="number" 
                                    min="1" 
                                    value={recurrenceRule.ends_after_occurrences || ''} 
                                    onChange={(e) => handleRecurrenceChange({...recurrenceRule, ends_after_occurrences: parseInt(e.target.value, 10) || undefined})} 
                                    className="w-24" 
                                    placeholder="e.g., 10"
                                    data-testid="ends-after-occurrences-input"
                                />
                                <span className="text-sm text-muted-foreground">occurrences</span>
                            </div>
                        )}
                    </div>
                  </div>
                )}
              </div>
    
              {/* Categorization: Priority, Effort, Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-sm font-medium" id="task-form-priority-label">Priority</Label>
                  <Select value={priority} onValueChange={(value) => setPriority(value as Priority)}>
                    <SelectTrigger id="priority" aria-labelledby="task-form-priority-label">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(Priority).map((p) => (
                        <SelectItem key={p} value={p} id={`task-form-priority-option-${p.toLowerCase()}`}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="effort" className="text-sm font-medium" id="task-form-effort-label">Effort</Label>
                  <Select value={effort} onValueChange={(value) => setEffort(value as EffortLevel)}>
                    <SelectTrigger id="effort" aria-labelledby="task-form-effort-label">
                      <SelectValue placeholder="Select effort" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(EffortLevel).map((level) => (
                        <SelectItem key={level} value={level} id={`task-form-effort-option-${level.toString().toLowerCase()}`}>{level.toString()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium" id="task-form-status-label">Status</Label>
                  <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)}>
                    <SelectTrigger id="status" aria-labelledby="task-form-status-label">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TaskStatus).map((s) => (
                        <SelectItem key={s} value={s} id={`task-form-status-option-${s.toLowerCase()}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
    
              {/* People & Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PeopleSelector selectedPeople={assignedTo} onChange={setAssignedTo} allPeople={allPeople || []} />
                <TagSelector selectedTags={tags} onChange={setTags} allTags={allTags || []} />
              </div>

              {/* Dependencies */}
              <DependencySelector 
                currentTaskId={task?.id}
                selectedDependencies={dependencies} 
                onChange={setDependencies} 
                allTasks={allTasksForDeps || []} 
              />

              {/* Sub-tasks - Placeholder for now */}
              <div className="space-y-2">
                <Label className="text-sm font-medium" id="task-form-subtasks-label">Sub-tasks</Label>
                <div className="text-sm text-muted-foreground p-3 bg-amber-50 border border-amber-200 rounded-md" id="task-form-subtasks-placeholder">
                    Sub-task functionality will be implemented here. You'll be able to add and manage sub-tasks related to this main task.
                </div>
                {/* <Button type="button" variant="outline" size="sm" onClick={() => { ... }}>Add Sub-task</Button> */}
              </div>

              {/* Linked Notes */}
              <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium" id="task-form-linked-notes-heading">Linked Notes</h3>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={handleOpenCreateNoteDialog} 
                      disabled={!isEditing} // Only allow creating/linking if task exists
                      id="task-form-create-link-note-button"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" /> Create & Link New Note
                    </Button>
                    {/* TODO: Add a button/modal to link EXISTING notes */}
                  </div>
                  {!isEditing && (
                    <p className="text-xs text-muted-foreground bg-amber-100 dark:bg-amber-900 border border-amber-300 dark:border-amber-700 p-2 rounded-md" id="task-form-save-task-for-notes-message">
                      Save the task to enable note linking and creation.
                    </p>
                  )}
                  {isEditing && linkedNotes.length > 0 ? (
                    <ul className="space-y-2 border p-3 rounded-md bg-muted/50">
                      {linkedNotes.map((note) => (
                        <li key={note.id} className="text-sm flex justify-between items-center p-2 rounded bg-background shadow-sm" id={`task-form-linked-note-item-${note.id}`}>
                          <span className="font-medium truncate pr-2" title={note.name}>{note.name || 'Untitled Note'}</span>
                          <div className="flex items-center space-x-1 flex-shrink-0">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => navigate(`/notes/${note.id}`, { state: { from: location.pathname, fromTaskForm: true, taskIdForNote: task?.id } })} 
                            className="px-2 py-1 h-auto"
                            id={`task-form-edit-note-${note.id}-button`}
                          >
                            <Pencil className="h-3 w-3 mr-1" /> Edit
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveNoteFromTask(note.id)}
                            aria-label={`Remove note ${note.name} from task`}
                            className="px-2 py-1 h-auto text-destructive hover:text-destructive"
                            id={`task-form-remove-note-${note.id}-button`}
                          >
                            <X className="h-3 w-3 mr-1" /> Remove
                          </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : isEditing ? (
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md mt-2" id="task-form-no-linked-notes-message">
                      No notes are currently linked to this task.
                    </p>
                  ) : null }
                </div>
            </div>
    
            <div className="flex-shrink-0 bg-background p-4 border-t">
                <TaskFormActions
                    isEditing={isEditing}
                    onCancel={onCancel}
                    onArchive={task && onArchive ? () => onArchive(task.id!) : undefined}
                    onDelete={task && onDelete ? () => onDelete(task.id!) : undefined}
                />
            </div>
          </form>
        </div>

    );
}

export default TaskForm;
