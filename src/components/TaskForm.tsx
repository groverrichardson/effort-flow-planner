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
import { Checkbox } from '@/components/ui/checkbox'; // Added for the new toggle
import { Label } from '@/components/ui/label'; // Added for Checkbox label
import { naturalLanguageToTask } from '@/utils/naturalLanguageParser';
import debounce from 'lodash.debounce';

// Import our new components
import DatePickerField from './form/DatePickerField';
import TagSelector from './form/TagSelector';
import PeopleSelector from './form/PeopleSelector';
import TaskFormActions from './form/TaskFormActions';
import DependencySelector from './form/DependencySelector';
import { useNoteStore } from '@/store/noteStore'; // For accessing notes
import { Note } from '@/types'; // Note type
import { PlusCircle, Pencil, X } from 'lucide-react'; // For Add Note button icon & Edit icon & Remove icon
import { useNavigate, useLocation } from 'react-router-dom';

interface TaskFormProps {
    task?: Task;
    onSubmit: (taskData: Task | Partial<Task>) => Promise<void>; // Changed from onSuccess
    onCancel?: () => void;
    onArchive?: (taskId: string) => void; // For archiving tasks
    onDelete?: (taskId: string) => void; // For hard deleting tasks
    onOpenCreateNoteDialogForTask?: (taskId: string) => void; // To open note dialog
}

type LiveParseState = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  originalDatePhrase?: string | null;
  // people?: string[]; // Future: consider showing live parsed people/tags
  // tags?: string[];
};

interface RecurrenceSettingsState {
  frequency: RecurrenceFrequency | 'never';
  interval: number;
  daysOfWeek: number[];
  dayOfMonth: number | null;
  monthOfYear: number | null;
  endConditionType: 'never' | 'onDate' | 'afterOccurrences';
  endDate: Date | null;
  count: number | null;
  repeatOnlyOnCompletion: boolean;
}

const defaultTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
    title: '',
    description: '',
    status: 'PENDING' as TaskStatus, // Added to fix lint error
    priority: 'normal' as Priority,
    dueDate: null,
    dueDateType: 'by' as DueDateType,
    targetDeadline: null,
    goLiveDate: null,
    effortLevel: 1 as EffortLevel,
    completed: false,
    completedDate: null,
    tags: [],
    people: [],
    dependencies: [],
    // Initialize new optional fields from Task interface
    recurrenceRuleId: undefined,
    isRecurringInstance: false,
    originalRecurringTaskId: undefined,
    is_archived: false, // Added default for archiving
    userId: '', // Added default, will be set by context on creation
};

const defaultRecurrenceSettings: RecurrenceSettingsState = {
  frequency: 'never',
  interval: 1,
  daysOfWeek: [],
  dayOfMonth: null,
  monthOfYear: null,
  endConditionType: 'never',
  endDate: null,
  count: null,
  repeatOnlyOnCompletion: false,
};

const TaskForm = ({ task, onSubmit, onCancel, onArchive, onDelete, onOpenCreateNoteDialogForTask }: TaskFormProps): JSX.Element => {
    const navigate = useNavigate();
    const location = useLocation();
    const { getNoteById, removeTagFromNote } = useNoteStore();
    const handleRepeatOnlyOnCompletionChange = (checked: boolean) => {
        setRecurrenceSettings(prev => ({ ...prev, repeatOnlyOnCompletion: checked }));
    };

    const {
        addTask, updateTask, tags, people, addTag, addPerson, tasks,
        getRecurrenceRuleById // Destructure getRecurrenceRuleById
    } = useTaskContext();
    const [formData, setFormData] = useState(task || defaultTask);
    const isEditing = !!task;

    const [liveParseResult, setLiveParseResult] = useState<LiveParseState | null>(null);
    const [isParsingLive, setIsParsingLive] = useState(false);

    const { notes } = useNoteStore(); // Get all notes
    const [linkedNotes, setLinkedNotes] = useState<Note[]>([]); // Notes linked to this task

    const handleRemoveNoteFromTask = async (noteIdToRemove: string) => {
      if (!task || !task.id) {
        toast({ title: 'Error', description: 'Task ID is missing.', variant: 'destructive' });
        return;
      }
      try {
        await removeTagFromNote(noteIdToRemove, task.id);
        toast({ title: 'Note Unlinked', description: 'The note has been successfully unlinked from this task.' });
        // The linkedNotes state should update automatically due to the change in the store
        // and the useEffect that calculates it.
      } catch (error) {
        console.error('Error unlinking note from task:', error);
        toast({ title: 'Error', description: 'Could not unlink the note. Please try again.', variant: 'destructive' });
      }
    };

    const [recurrenceSettings, setRecurrenceSettings] = useState<RecurrenceSettingsState>(defaultRecurrenceSettings);

    useEffect(() => {
        if (task && task.recurrenceRuleId) {
            const rule = getRecurrenceRuleById(task.recurrenceRuleId);
            if (rule) {
                setRecurrenceSettings({
                    frequency: rule.frequency,
                    interval: rule.interval || 1,
                    daysOfWeek: rule.daysOfWeek || [],
                    dayOfMonth: rule.dayOfMonth || null,
                    monthOfYear: rule.monthOfYear || null,
                    endConditionType: rule.endConditionType || 'never',
                    endDate: rule.endDate ? new Date(rule.endDate) : null,
                    count: rule.count || null,
                    // @ts-ignore
                    repeatOnlyOnCompletion: rule.repeatOnlyOnCompletion || false,
                });
            } else {
                setRecurrenceSettings(defaultRecurrenceSettings);
            }
        } else {
            setRecurrenceSettings(defaultRecurrenceSettings);
        }
    }, [task, getRecurrenceRuleById]);

    // Effect to update linked notes when task or notes store changes
    useEffect(() => {
      if (task && task.id && notes) {
        const filtered = notes.filter(note => note.taggedTaskIds.includes(task.id));
        setLinkedNotes(filtered);
      } else {
        setLinkedNotes([]);
      }
    }, [task, notes]);

    // Effect to initialize recurrenceSettings when a task is being edited
    useEffect(() => {
        if (task) {
            // Default recurrence settings
            let currentRecurrenceSettings = {
                frequency: 'never' as RecurrenceFrequency | 'never',
                interval: 1,
                daysOfWeek: [] as number[],
                dayOfMonth: null as number | null,
                monthOfYear: null as number | null,
                endConditionType: 'never' as 'never' | 'onDate' | 'afterOccurrences',
                endDate: null as Date | null,
                count: null as number | null,
                repeatOnlyOnCompletion: false,
            };

            if (task.recurrenceRuleId && getRecurrenceRuleById) {
                const rule = getRecurrenceRuleById(task.recurrenceRuleId);
                if (rule) {
                    // If a rule is found, update settings from the rule, creating a new object
                    currentRecurrenceSettings = {
                        ...currentRecurrenceSettings, // Start with defaults or previous state if applicable
                        frequency: rule.frequency || 'never',
                        interval: rule.interval || 1,
                        daysOfWeek: rule.daysOfWeek || [],
                        dayOfMonth: rule.dayOfMonth || null,
                        monthOfYear: rule.monthOfYear || null,
                        // TODO: Populate endConditionType, endDate, count from rule based on its structure
                        // For now, ensure these are at least defaulted if not in rule
                        endConditionType: rule.endConditionType || 'never',
                        endDate: rule.endDate ? new Date(rule.endDate) : null,
                        count: rule.count || null,
                        repeatOnlyOnCompletion: rule.repeatOnlyOnCompletion !== undefined ? rule.repeatOnlyOnCompletion : false,
                    };
                }
            }
            setRecurrenceSettings(currentRecurrenceSettings);
        } else {
            // New task, reset recurrence settings to default "never"
            setRecurrenceSettings({
                // @ts-ignore
                frequency: 'never',
                interval: 1,
                daysOfWeek: [],
                dayOfMonth: null,
                // @ts-ignore
                monthOfYear: null,
                endConditionType: 'never',
                endDate: null,
                count: null,
                repeatOnlyOnCompletion: false,
            });
        }
    }, [task, getRecurrenceRuleById]); // Add getRecurrenceRuleById to dependency array

    useEffect(() => {
        if (task) {
            // This effect was for initializing formData from task, keep it separate.
            // The recurrenceSettings are handled by the effect above.
            // If task.recurrenceRuleId exists, we should fetch the RecurrenceRule
            // and populate recurrenceSettings. This is a placeholder for that logic.
            // For now, if editing a task that has a recurrenceRuleId, we'll set a default
            // frequency to indicate it's recurring. This will be improved later.
            if (task.recurrenceRuleId) {
                // TODO: In a real scenario, fetch the RecurrenceRule by task.recurrenceRuleId
                // from your backend/TaskService and populate recurrenceSettings accordingly.
                // For now, this is a placeholder if a rule ID exists.
                // console.log(`Task ${task.id} has recurrence rule ${task.recurrenceRuleId}, loading rule...`);
                // Example: If you had a function getRecurrenceRule(id): Promise<RecurrenceRule | null>
                // const rule = await getRecurrenceRule(task.recurrenceRuleId);
                // if (rule) { setRecurrenceSettings(rule); }
                // As a temporary placeholder, let's assume a simple default if a rule ID exists.
                // console.log('[TaskForm] Second useEffect: Task has recurrenceRuleId. Recurrence settings handled by primary effect.');
            } else {
                // Task exists but has no recurrence rule
                // console.log('[TaskForm] Second useEffect: Task exists but no recurrenceRuleId. Recurrence settings handled by primary effect.');
            }
        } else {
            // New task, reset recurrence settings to default "never"
            // console.log('[TaskForm] Second useEffect: New task. Recurrence settings handled by primary effect.');
        }
    }, [task]); // Dependency: task object itself

    // Auto-fill target deadline based on effort level
    useEffect(() => {
        if (!isEditing || (isEditing && !task?.targetDeadline)) {
            const today = new Date();
            let targetDate: Date | null = null;

            switch (formData.effortLevel) {
                case 1: // 15 minutes or less
                    targetDate = new Date(today.getTime() + 15 * 60 * 1000);
                    break;
                case 2: // 30 minutes
                    targetDate = new Date(today.getTime() + 30 * 60 * 1000);
                    break;
                case 4: // couple hours
                    targetDate = new Date(today.getTime() + 2 * 60 * 60 * 1000);
                    break;
                case 8: // a whole day
                    targetDate = addDays(today, 1);
                    break;
                case 16: // a week
                    targetDate = addDays(today, 7);
                    break;
                case 32: // couple of weeks
                    // @ts-ignore
                    targetDate = addWeeks(today, 2);
                    break;
                case 64: // a month or more
                    // @ts-ignore
                    targetDate = addMonths(today, 1);
                    break;
                default:
                    targetDate = null;
            }

            setFormData((prev) => ({ ...prev, targetDeadline: targetDate }));
        }
    }, [formData.effortLevel, isEditing, task?.targetDeadline]);

    // Debounced function for live parsing
    const debouncedLiveParseTitle = useCallback(
        debounce(async (titleToParse: string) => {
            if (!titleToParse.trim() || titleToParse.length < 5) { // Min length to trigger
                setLiveParseResult(null);
                setIsParsingLive(false);
                return;
            }
            setIsParsingLive(true);
            try {
                const result = await naturalLanguageToTask(titleToParse, true); // isLiveTyping = true
                if (result && (result.dueDate || result.peopleNames?.length || result.tagNames?.length)) { // Check if any relevant field is present
                    let originalPhrase = '';

                    if (result.dueDate) {
                        if (result.originalDatePhrase) {
                            originalPhrase = result.originalDatePhrase;
                        }
                    }
                    // Potentially similar logic for people and tags if they were fully implemented here
                    // For example, if live parsing also set people:
                    // if (result.people && result.people.length > 0) {
                    //    // partialUpdate.people = result.people.map(p => typeof p === 'string' ? { name: p, id: '', user_id: '', created_at: '', updated_at: '' } : p);
                    // }
                    // And for tags:
                    // if (result.tags && result.tags.length > 0) {
                    //    // partialUpdate.tags = result.tags.map(t => typeof t === 'string' ? { name: t, id: '', user_id: '', created_at: '', updated_at: '' } : t);
                    // }

                    setLiveParseResult({ originalDatePhrase: originalPhrase || null });

                    // Optionally, you could offer to apply these:
                    // For now, just showing the original phrase.
                    // if (result.dueDate) {
                    //   toast({ title: "Date Detected", description: `Found date: ${format(result.dueDate, 'PPP')}. Original: "${originalPhrase}"` });
                    // }

                } else {
                    // @ts-ignore
                    setLiveParseResult(null);
                }
            } catch (error) {
                console.error('Live parsing error:', error);
                // @ts-ignore
                setLiveParseResult(null);
            } finally {
                setIsParsingLive(false);
            }
        }, 1000), // 1-second debounce
        [naturalLanguageToTask] // Dependency
    );

    // useEffect to trigger debounced parsing when title changes
    useEffect(() => {
        if (formData.title) {
            debouncedLiveParseTitle(formData.title);
            // debouncedParseTitle(formData.title); // This was a duplicate call and referred to a non-existent function
        } else {
            setLiveParseResult(null);
            setIsParsingLive(false);
        }
        // Cleanup debouncer on unmount or when debouncedLiveParseTitle changes (it won't due to useCallback)
        return () => {
            debouncedLiveParseTitle.cancel();
        };
    }, [formData.title, debouncedLiveParseTitle]);

    const handleDescriptionChange = (htmlContent: string) => {
        setFormData(prev => ({ ...prev, description: htmlContent }));
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePriorityChange = (value: string) => {
        setFormData((prev) => ({ ...prev, priority: value as Priority }));
    };

    const handleEffortChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            effortLevel: Number(value) as EffortLevel,
        }));
    };

    const handleDueDateTypeChange = (value: string) => {
        // @ts-ignore
        setFormData((prev) => ({ ...prev, dueDateType: value as DueDateType }));
    };

    const handleDateChange = (
        date: Date | null,
        field: 'dueDate' | 'targetDeadline' | 'goLiveDate'
    ) => {
        // @ts-ignore
        setFormData((prev) => ({ ...prev, [field]: date }));
        // Auto-close the popover after selection by triggering a click outside event
        document.body.click();
    };

    const handleTagToggle = (tagId: string) => {
        setFormData((prev) => {
            const isSelected = prev.tags.some((g) => g.id === tagId);
            const selectedTag = tags.find((g) => g.id === tagId);

            if (!selectedTag) return prev;

            return {
                ...prev,
                tags: isSelected
                    ? prev.tags.filter((g) => g.id !== tagId)
                    : [...prev.tags, selectedTag],
            };
        });
    };

    const handlePersonToggle = (personId: string) => {
        setFormData((prev) => {
            const isSelected = prev.people.some((p) => p.id === personId);
            const selectedPerson = people.find((p) => p.id === personId);

            if (!selectedPerson) return prev;

            return {
                ...prev,
                people: isSelected
                    ? prev.people.filter((p) => p.id !== personId)
                    : [...prev.people, selectedPerson],
            };
        });
    };

    const handleDependencyToggle = (taskId: string) => {
        setFormData((prev) => {
            const isSelected = prev.dependencies.includes(taskId);

            return {
                ...prev,
                dependencies: isSelected
                    ? prev.dependencies.filter((id) => id !== taskId)
                    : [...prev.dependencies, taskId],
            };
        });
    };

    const handleAddNewTag = async (tagName: string) => {
        if (!tagName.trim()) return;

        // Check if tag already exists
        const existingTag = tags.find(
            (g) => g.name.toLowerCase() === tagName.trim().toLowerCase()
        );

        if (existingTag) {
            // If it exists but isn't selected, select it
            // @ts-ignore
            if (!formData.tags.some((g) => g.id === existingTag.id)) {
                // @ts-ignore
                handleTagToggle(existingTag.id);
            }
            return;
        }

        try {
            // Add new tag - this returns a Promise<Tag> now
            const newTag = await addTag(tagName.trim());
            if (newTag) {
                setFormData((prev) => ({
                    ...prev,
                    tags: [...prev.tags, newTag],
                }));
            }
        } catch (error) {
            console.error('Error adding new tag:', error);
            toast({
                title: 'Error',
                description: 'Failed to create new tag',
                variant: 'destructive',
            });
        }
    };

    const handleAddNewPerson = async (personName: string) => {
        if (!personName.trim()) return;

        // Check if person already exists
        const existingPerson = people.find(
            (p) => p.name.toLowerCase() === personName.trim().toLowerCase()
        );

        if (existingPerson) {
            // If it exists but isn't selected, select it
            if (!formData.people.some((p) => p.id === existingPerson.id)) {
                handlePersonToggle(existingPerson.id);
            }
            return;
        }

        try {
            // Add new person - this returns a Promise<Person> now
            const newPerson = await addPerson(personName.trim());
            if (newPerson) {
                setFormData((prev) => ({
                    ...prev,
                    people: [...prev.people, newPerson],
                }));
            }
        } catch (error) {
            console.error('Error adding new person:', error);
            toast({
                title: 'Error',
                description: 'Failed to create new person',
                variant: 'destructive',
            });
        }
    };

    const handleRecurrenceFrequencyChange = (value: string) => {
        const newFrequency = value as RecurrenceFrequency | 'never';
        setRecurrenceSettings(prev => ({
            ...prev,
            frequency: newFrequency,
            interval: 1, // Reset interval to 1 when frequency changes
            daysOfWeek: newFrequency === 'weekly' ? (prev.daysOfWeek.length > 0 ? prev.daysOfWeek : []) : [],
            dayOfMonth: (newFrequency === 'monthly' || newFrequency === 'yearly') ? (prev.dayOfMonth || 1) : null,
            monthOfYear: newFrequency === 'yearly' ? (prev.monthOfYear || 0) : null, // Default to January or keep existing
            // endDate and count could be preserved or reset based on UX preference
            // Reset end condition to 'never' if frequency becomes 'never'
            endConditionType: newFrequency === 'never' ? 'never' : prev.endConditionType,
            endDate: newFrequency === 'never' ? null : prev.endDate,
            count: newFrequency === 'never' ? null : prev.count,
        }));
    };

    const handleRecurrenceIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newInterval = parseInt(e.target.value, 10);
        if (newInterval >= 1) {
            setRecurrenceSettings(prev => ({ ...prev, interval: newInterval }));
        }
    };

    const handleDayOfWeekToggle = (dayIndex: number) => {
        // @ts-ignore
        setRecurrenceSettings(prev => {
            const newDaysOfWeek = prev.daysOfWeek.includes(dayIndex)
                ? prev.daysOfWeek.filter(d => d !== dayIndex)
                : [...prev.daysOfWeek, dayIndex].sort((a, b) => a - b);
            return { ...prev, daysOfWeek: newDaysOfWeek };
        });
    };

    const handleDayOfMonthChange = (value: string) => {
        const newDayOfMonth = parseInt(value, 10);
        if (newDayOfMonth >= 1 && newDayOfMonth <= 31) {
            // @ts-ignore
            setRecurrenceSettings(prev => ({ ...prev, dayOfMonth: newDayOfMonth }));
        }
    };

    const handleMonthOfYearChange = (value: string) => {
        const newMonth = parseInt(value, 10);
        if (newMonth >= 0 && newMonth <= 11) { // 0 for Jan, 11 for Dec
            // @ts-ignore
            setRecurrenceSettings(prev => ({ ...prev, monthOfYear: newMonth }));
        }
    };

    const handleEndConditionTypeChange = (value: string) => {
        const newEndType = value as 'never' | 'onDate' | 'afterOccurrences';
        setRecurrenceSettings(prev => ({
            ...prev,
            endConditionType: newEndType,
            endDate: newEndType === 'onDate' ? prev.endDate : null, // Preserve if switching back, else clear
            count: newEndType === 'afterOccurrences' ? prev.count : null, // Preserve if switching back, else clear
        }));
    };

    const handleRecurrenceEndDateChange = (date: Date | null) => {
        setRecurrenceSettings(prev => ({ ...prev, endDate: date, count: null })); // Clear count if date is set
    };

    const handleRecurrenceCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newCount = parseInt(e.target.value, 10);
        if (newCount >= 1) {
            setRecurrenceSettings(prev => ({ ...prev, count: newCount, endDate: null })); // Clear endDate if count is set
        }
    };

    // Helper to build the rule object from settings
    const buildRecurrenceRulePayload = (): Omit<RecurrenceRule, 'id'> | null => {
        if (recurrenceSettings.frequency === 'never' || !recurrenceSettings.frequency) {
            return null;
        }

        const payload: Omit<RecurrenceRule, 'id'> & { interval: number; repeatOnlyOnCompletion?: boolean; daysOfWeek?: number[]; dayOfMonth?: number | null; monthOfYear?: number | null; endConditionType?: 'never' | 'onDate' | 'afterOccurrences'; endDate?: Date | null; count?: number | null; } = {
            frequency: recurrenceSettings.frequency as RecurrenceFrequency,
            interval: recurrenceSettings.interval || 1,
            repeatOnlyOnCompletion: recurrenceSettings.repeatOnlyOnCompletion,
            endConditionType: recurrenceSettings.endConditionType,
        };

        if (recurrenceSettings.frequency === 'weekly' && recurrenceSettings.daysOfWeek && recurrenceSettings.daysOfWeek.length > 0) {
            payload.daysOfWeek = recurrenceSettings.daysOfWeek;
        }
        if ((recurrenceSettings.frequency === 'monthly' || recurrenceSettings.frequency === 'yearly') && recurrenceSettings.dayOfMonth !== null) {
            payload.dayOfMonth = recurrenceSettings.dayOfMonth;
        }
        if (recurrenceSettings.frequency === 'yearly' && recurrenceSettings.monthOfYear !== null) {
            payload.monthOfYear = recurrenceSettings.monthOfYear;
        }

        if (recurrenceSettings.endConditionType === 'onDate' && recurrenceSettings.endDate) {
            // @ts-ignore
            payload.endDate = recurrenceSettings.endDate;
            payload.count = undefined; // Ensure count is not set if endDate is
        } else if (recurrenceSettings.endConditionType === 'afterOccurrences' && recurrenceSettings.count !== null && recurrenceSettings.count > 0) {
            // @ts-ignore
            payload.count = recurrenceSettings.count;
            // @ts-ignore
            payload.endDate = undefined; // Ensure endDate is not set if count is
        } else { // 'never' ends or invalid end condition
            // @ts-ignore
            payload.endDate = undefined;
            // @ts-ignore
            payload.count = undefined;
        }
        return payload;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast({
                title: 'Error',
                description: 'Task title is required',
                variant: 'destructive',
            });
            return; // Return after showing toast
        };

        const recurrenceRulePayload = buildRecurrenceRulePayload();
        // console.log('[TaskForm] handleSubmit - recurrenceRulePayload:', JSON.stringify(recurrenceRulePayload, null, 2));

        if (isEditing && task) {
            let finalTaskData: Task = { ...task, ...formData };

            if (recurrenceRulePayload) {
                // Recurrence is active (daily, weekly, monthly, yearly)
                if (task.recurrenceRuleId) {
                    console.log(`TODO: Update existing RecurrenceRule (ID: ${task.recurrenceRuleId}) with payload:`, recurrenceRulePayload);
                    // finalTaskData.recurrenceRuleId remains task.recurrenceRuleId - assuming update in place
                    // Example: await updateRecurrenceRule(task.recurrenceRuleId, recurrenceRulePayload);
                } else {
                    const newMockRuleId = 'mock-rec-rule-existing-task-' + Date.now();
                    console.log('TODO: Create new RecurrenceRule for existing task with payload:', recurrenceRulePayload, `Assigning mock ID: ${newMockRuleId}`);
                    finalTaskData.recurrenceRuleId = newMockRuleId;
                    // Example: const newRule = await createRecurrenceRule(recurrenceRulePayload); finalTaskData.recurrenceRuleId = newRule.id;
                }
            } else if (task.recurrenceRuleId) {
                // Recurrence was active but now set to 'never'
                console.log(`TODO: Delete existing RecurrenceRule (ID: ${task.recurrenceRuleId}) as recurrence is now 'never'.`);
                finalTaskData.recurrenceRuleId = undefined;
                // Example: await deleteRecurrenceRule(task.recurrenceRuleId);
            }
            // If no recurrenceRulePayload and no existing task.recurrenceRuleId, nothing to do for recurrence.

            await onSubmit(finalTaskData); // Call parent's submit handler
        } else {
            // Create new task
            let finalTaskData: Partial<Task> = { ...formData, id: 'temp-' + Date.now(), createdAt: new Date(), updatedAt: new Date(), completed: false }; // Basic new task structure

            if (recurrenceRulePayload) {
                const newMockRuleId = 'mock-rec-rule-new-task-' + Date.now();
                console.log('TODO: Create new RecurrenceRule for new task with payload:', recurrenceRulePayload, `Assigning mock ID: ${newMockRuleId}`);
                finalTaskData.recurrenceRuleId = newMockRuleId;
                // Example: const newRule = await createRecurrenceRule(recurrenceRulePayload); finalTaskData.recurrenceRuleId = newRule.id;
            }
            // If no recurrenceRulePayload, recurrenceRuleId remains undefined by default for a new task.

            await onSubmit(finalTaskData as Task); // Call parent's submit handler
        }

    };

    const availableTasks = tasks.filter(
        (t) => !t.completed && (!isEditing || t.id !== task?.id)
    );

return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
            <div>
                <label
                    htmlFor="title"
                    className="block text-xs font-medium mb-1">
                    Title
                </label>
                <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="E.g., Finalize Q1 report by Friday @JohnDoe #urgent"
                    className="text-xs h-10"
                />
            </div>
            <div>
                <Textarea showToolbar={false}
                    value={formData.description}
                    onChange={handleDescriptionChange} // Changed to the correct handler
                    placeholder="Add a description..."
                    className="min-h-[80px] text-sm"
                    id="task-form-description-textarea" // Added ID for consistency and future reference
                />
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-xs font-medium mb-1">
                        Priority
                    </label>
                    <Select
                        value={formData.priority}
                        onValueChange={handlePriorityChange}>
                        <SelectTrigger className="h-10 text-xs">
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="lowest">Lowest</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="block text-xs font-medium mb-1">
                        Effort
                    </label>
                    <Select
                        value={formData.effortLevel.toString()}
                        onValueChange={handleEffortChange}>
                        <SelectTrigger className="h-10 text-xs">
                            <SelectValue placeholder="Effort" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">15min</SelectItem>
                            <SelectItem value="2">30min</SelectItem>
                            <SelectItem value="4">Few hours</SelectItem>
                            <SelectItem value="8">1 day</SelectItem>
                            <SelectItem value="16">1 week</SelectItem>
                            <SelectItem value="32">2 weeks</SelectItem>
                            <SelectItem value="64">1 month</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Due Date with By/On selector */}
            <div>
                <label className="block text-xs font-medium mb-1">
                    Due Date
                </label>
                <div className="flex items-end gap-1">
                    <div className="flex-1">
                        <DatePickerField
                            label=""
                            value={formData.dueDate}
                            onChange={(date) =>
                                handleDateChange(date, 'dueDate')
                            }
                        />
                    </div>
                    <div className="w-16">
                        <Select
                            value={formData.dueDateType}
                            onValueChange={handleDueDateTypeChange}>
                            <SelectTrigger className="h-10 text-xs w-16">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="by">By</SelectItem>
                                <SelectItem value="on">On</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Recurrence Section */}
            <div>
                <label htmlFor="recurrence-frequency-select" className="block text-xs font-medium mb-1">
                    Repeats
                </label>
                <Select
                    value={recurrenceSettings.frequency}
                    onValueChange={handleRecurrenceFrequencyChange}
                >
                    <SelectTrigger data-testid="recurrence-frequency-select-trigger" id="recurrence-frequency-select" className="h-10">
                        <SelectValue placeholder="Select recurrence" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="never" data-testid="select-item-never">Never</SelectItem>
                        <SelectItem value="daily" data-testid="select-item-daily">Daily</SelectItem>
                        <SelectItem value="weekly" data-testid="select-item-weekly">Weekly</SelectItem>
                        <SelectItem value="monthly" data-testid="select-item-monthly">Monthly</SelectItem>
                        <SelectItem value="yearly" data-testid="select-item-yearly">Yearly</SelectItem>
                    </SelectContent>
                </Select>

                {/* Daily Recurrence Options */}
                {recurrenceSettings.frequency === 'daily' && (
                    <div className="mt-2">
                        <label htmlFor="recurrence-daily-interval-input" className="block text-xs font-medium mb-1">
                            Every
                        </label>
                        <div className="flex items-center">
                            <Input
                                id="recurrence-daily-interval-input" data-testid="recurrence-daily-interval-input"
                                type="number"
                                min="1"
                                value={recurrenceSettings.interval}
                                onChange={handleRecurrenceIntervalChange}
                                className="w-20 mr-2 h-10"
                            />
                            <span className="text-sm">day(s)</span>
                        </div>
                    </div>
                )}

                {/* Weekly Recurrence Options */}
                {recurrenceSettings.frequency === 'weekly' && (
                    <div className="mt-2 space-y-2">
                        <div>
                            <label htmlFor="recurrence-weekly-interval-input" className="block text-xs font-medium mb-1">
                                Every
                            </label>
                            <div className="flex items-center">
                                <Input
                                    id="recurrence-weekly-interval-input"
                                    type="number"
                                    min="1"
                                    value={recurrenceSettings.interval}
                                    onChange={handleRecurrenceIntervalChange}
                                    className="w-20 mr-2 h-10"
                                />
                                <span className="text-sm">week(s) on:</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                                <Button
                                    id={`recurrence-weekly-day-${day.toLowerCase()}-toggle`}
                                    key={day}
                                    type="button"
                                    variant={recurrenceSettings.daysOfWeek.includes(index) ? 'default' : 'outline'}
                                    onClick={() => handleDayOfWeekToggle(index)}
                                    className="h-8 px-2 text-xs"
                                >
                                    {day}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Monthly Recurrence Options */}
                {recurrenceSettings.frequency === 'monthly' && (
                    <div className="mt-2 space-y-2">
                        <div>
                            <label htmlFor="recurrence-monthly-interval-input" className="block text-xs font-medium mb-1">
                                Every
                            </label>
                            <div className="flex items-center">
                                <Input
                                    id="recurrence-monthly-interval-input"
                                    type="number"
                                    min="1"
                                    value={recurrenceSettings.interval}
                                    onChange={handleRecurrenceIntervalChange}
                                    className="w-20 mr-2 h-10"
                                />
                                <span className="text-sm">month(s) on day:</span>
                            </div>
                        </div>
                        <div>
                            <Select
                                value={recurrenceSettings.dayOfMonth?.toString() || '1'}
                                onValueChange={handleDayOfMonthChange}
                            >
                                <SelectTrigger id="recurrence-monthly-day-select" className="h-10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                        <SelectItem key={day} value={day.toString()}>
                                            {day}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                {/* Yearly Recurrence Options */}
                {recurrenceSettings.frequency === 'yearly' && (
                    <div className="mt-2 space-y-2">
                        <div>
                            <label htmlFor="recurrence-yearly-interval-input" className="block text-xs font-medium mb-1">
                                Every
                            </label>
                            <div className="flex items-center">
                                <Input
                                    id="recurrence-yearly-interval-input"
                                    type="number"
                                    min="1"
                                    value={recurrenceSettings.interval}
                                    onChange={handleRecurrenceIntervalChange}
                                    className="w-20 mr-2 h-10"
                                />
                                <span className="text-sm">year(s) on:</span>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <div className="flex-1">
                                <label htmlFor="recurrence-yearly-month-select" className="block text-xs font-medium mb-1">
                                    Month
                                </label>
                                <Select
                                    value={recurrenceSettings.monthOfYear?.toString() || '0'}
                                    onValueChange={handleMonthOfYearChange}
                                >
                                    <SelectTrigger id="recurrence-yearly-month-select" className="h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, index) => (
                                            <SelectItem key={month} value={index.toString()}>
                                                {month}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex-1">
                                <label htmlFor="recurrence-yearly-day-select" className="block text-xs font-medium mb-1">
                                    Day
                                </label>
                                <Select
                                    value={recurrenceSettings.dayOfMonth?.toString() || '1'}
                                    onValueChange={handleDayOfMonthChange} // Reusing existing handler
                                >
                                    <SelectTrigger id="recurrence-yearly-day-select" className="h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                            <SelectItem key={day} value={day.toString()}>
                                                {day}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                )}

                {/* End Condition Section - only show if frequency is not 'never' */}
                {recurrenceSettings.frequency !== 'never' && (
                    <>
                        <div className="mt-4 pt-4 border-t">
                        <label htmlFor="recurrence-end-condition-type-select" className="block text-xs font-medium mb-1">
                            Ends
                        </label>
                        <Select
                            value={recurrenceSettings.endConditionType}
                            onValueChange={handleEndConditionTypeChange}
                        >
                            <SelectTrigger id="recurrence-end-condition-select" data-testid="ends-condition-type-select-trigger" className="h-10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="never">Never</SelectItem>
                                <SelectItem value="onDate">On date</SelectItem>
                                <SelectItem value="afterOccurrences">After occurrences</SelectItem>
                            </SelectContent>
                        </Select>

                        {recurrenceSettings.endConditionType === 'onDate' && (
                            <div className="mt-2">
                                <DatePickerField
                                    label="End Date"
                                    value={recurrenceSettings.endDate}
                                    onChange={handleRecurrenceEndDateChange} 
                                />
                            </div>
                        )}

                        {recurrenceSettings.endConditionType === 'afterOccurrences' && (
                            <div className="mt-2">
                                <label htmlFor="recurrence-count-input" className="block text-xs font-medium mb-1">
                                    After
                                </label>
                                <div className="flex items-center">
                                    <Input
                                        id="recurrence-count-input"
                                        type="number"
                                        min="1"
                                        value={recurrenceSettings.count || ''} // Ensure input is controlled
                                        onChange={handleRecurrenceCountChange}
                                        className="w-20 mr-2 h-10"
                                    />
                                    <span className="text-sm">occurrence(s)</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 'Repeat only after completion' Toggle */}
                    <div className="mt-4 flex items-center space-x-2">
                        <Checkbox 
                            id="repeat-only-on-completion-checkbox"
                            data-testid="repeat-only-on-completion-checkbox"
                            checked={recurrenceSettings.repeatOnlyOnCompletion}
                            onCheckedChange={handleRepeatOnlyOnCompletionChange}
                        />
                        <Label htmlFor="repeat-only-on-completion-checkbox" className="text-sm font-medium">
                            Repeat only after completion
                        </Label>
                    </div>
                    </>
                )}
            </div>

            {/* Target Deadline and Go-Live Date in a separate row - updated for consistency */}
            <div className="flex gap-4">
                <div className="flex-1 h-10">
                    <DatePickerField
                        label="Target Deadline"
                        value={formData.targetDeadline}
                        onChange={(date) =>
                            handleDateChange(date, 'targetDeadline')
                        }
                    />
                </div>
                <div className="flex-1 h-10">
                    <DatePickerField
                        label="Go-Live Date"
                        value={formData.goLiveDate}
                        onChange={(date) =>
                            handleDateChange(date, 'goLiveDate')
                        }
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TagSelector
                    selectedTags={formData.tags}
                    availableTags={tags}
                    onToggleTag={handleTagToggle}
                    onAddNewTag={handleAddNewTag}
                />

                <PeopleSelector
                    selectedPeople={formData.people}
                    availablePeople={people}
                    onTogglePerson={handlePersonToggle}
                    onAddNewPerson={handleAddNewPerson}
                />

                {/* Task Dependencies Section with the updated component */}
                <DependencySelector
                    selectedDependencies={formData.dependencies}
                    availableTasks={availableTasks}
                    onToggleDependency={handleDependencyToggle}
                />
            </div> {/* Closes the "Selectors" grid div */}

            {/* Linked Notes Section */}
            <div id="task-form-linked-notes-section" className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <Label className="text-lg font-semibold text-foreground">Linked Notes</Label>
                {task && task.id && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => task && task.id && onOpenCreateNoteDialogForTask?.(task.id)}
                    disabled={!task || !task.id}
                    id="task-form-add-note-button"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Note
                  </Button>
                )}
              </div>
              {linkedNotes.length > 0 ? (
                <ul className="space-y-2 bg-muted p-3 rounded-md">
                  {linkedNotes.map(note => (
                    <li key={note.id} className="flex justify-between items-center text-sm text-muted-foreground hover:bg-background/50 p-1 rounded" id={`linked-note-item-${note.id}`}>
                      <span 
                        className="flex-grow cursor-pointer hover:underline"
                        onClick={() => {
                          if (task && task.id && note && note.id) {
                            const targetPath = `/tasks/${task.id}/notes/${note.id}/edit`;
                            const fromPath = `/tasks/${task.id}`;
                            console.log(`[TaskForm] View/Edit note (from name click): Navigating to ${targetPath} with from: ${fromPath}`);
                            navigate(targetPath, { state: { from: fromPath } });
                          } else {
                            let errorMsg = 'Cannot navigate to note. Missing information.';
                            if (!task || !task.id) errorMsg = 'Task information is missing to link back from note.';
                            else if (!note || !note.id) errorMsg = 'Note information is missing.';
                            console.error(`[TaskForm] Cannot navigate to note: task.id=${task?.id}, note.id=${note?.id}. Error: ${errorMsg}`);
                            toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
                          }
                        }}
                        id={`task-form-view-note-${note.id}-link`}
                      >
                        {note.name}
                      </span>
                      <div className="flex items-center">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          if (task && task.id && note && note.id) {
                            const targetPath = `/tasks/${task.id}/notes/${note.id}/edit`;
                            const fromPath = `/tasks/${task.id}`;
                            console.log(`[TaskForm] Edit note: Navigating to ${targetPath} with from: ${fromPath}`);
                            navigate(targetPath, { state: { from: fromPath } });
                          } else {
                            console.error('[TaskForm] Cannot edit note: task.id or note.id is missing.');
                            toast({ title: 'Error', description: 'Cannot edit note. Missing task or note information.', variant: 'destructive' });
                          }
                        }}
                        aria-label={`Edit note ${note.name}`}
                        className="px-2 py-1 h-auto"
                        id={`task-form-edit-note-${note.id}-button`}
                      >
                        <Pencil className="h-3 w-3 mr-1" /> Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (task && task.id && note && note.id) {
                            // Call API to remove note from task
                            handleRemoveNoteFromTask(note.id);
                          } else {
                            console.error('[TaskForm] Cannot remove note from task: task.id or note.id is missing.');
                            toast({ title: 'Error', description: 'Cannot remove note from task. Missing task or note information.', variant: 'destructive' });
                          }
                        }}
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
              ) : (
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md" id="task-form-no-linked-notes-message">
                  No notes are currently linked to this task.
                </p>
              )}
            </div>
        </div> {/* Closes the main scrollable div (L355) */}

        <div className="flex-shrink-0 bg-background p-4"> {/* Actions footer */}
            <TaskFormActions
                isEditing={isEditing}
                onCancel={onCancel}
                onArchive={task && onArchive ? () => onArchive(task.id) : undefined}
                onDelete={task && onDelete ? () => onDelete(task.id) : undefined}
            />
        </div>
      </form>
    </>
);
}

export default TaskForm;
