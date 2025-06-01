import { useState } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { naturalLanguageToTask } from '@/utils/naturalLanguageParser';
import NaturalLanguageInput from '@/components/form/NaturalLanguageInput';
import { toast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Loader2, XIcon } from 'lucide-react'; // Added XIcon
import { useQuickTaskInputState } from '@/hooks/useQuickTaskInputState';
import { TaskStatus, Priority, EffortLevel, DueDateType, Tag, Person } from '@/types';

interface QuickTaskInputProps {
  onClose?: () => void;
}

const QuickTaskInput: React.FC<QuickTaskInputProps> = ({ onClose }) => {
    const { addTask, tags, people, addTag, addPerson } = useTaskContext();
    const { inputValue, setInputValue } = useQuickTaskInputState();
    const [isProcessing, setIsProcessing] = useState(false);
    const isMobile = useIsMobile();

    const handleQuickTaskSubmit = async () => {
        if (!inputValue.trim()) return;

        try {
            setIsProcessing(true);

            // Use the enhanced natural language parser (now async)
            const taskData = await naturalLanguageToTask(inputValue);

            if (!taskData) {
                toast({
                    title: 'Error',
                    description: 'Could not parse task input. Please try rephrasing.',
                    variant: 'destructive',
                });
                setIsProcessing(false);
                return;
            }

            console.log('Parsed task data:', taskData);

            let resolvedTags: Tag[] = [];
            if (taskData.tagNames && taskData.tagNames.length > 0) {
                resolvedTags = await Promise.all(
                    taskData.tagNames.map(async (tagName) => {
                        const existingTag = tags.find(
                            (t) => t.name.toLowerCase() === tagName.toLowerCase()
                        );
                        return existingTag || (await addTag(tagName));
                    })
                );
            }

            let resolvedPeople: Person[] = [];
            if (taskData.peopleNames && taskData.peopleNames.length > 0) {
                const limitedPeopleNames = taskData.peopleNames.slice(0, 2);
                console.log('Processing people:', limitedPeopleNames);
                resolvedPeople = await Promise.all(
                    limitedPeopleNames.map(async (personName) => {
                        const existingPerson = people.find(
                            (p) => p.name.toLowerCase() === personName.toLowerCase()
                        );
                        return existingPerson || (await addPerson(personName));
                    })
                );
            }

            // Set default values for required fields
            const newTask = {
                title: taskData.title || inputValue,
                description: taskData.description || '',
                priority: taskData.priority || Priority.NORMAL,
                dueDate: taskData.dueDate || null,
                dueDateType: taskData.dueDate ? DueDateType.BY : DueDateType.NONE, // Default based on dueDate presence
                targetDeadline: null, // Not provided by current parser
                goLiveDate: taskData.goLiveDate || null,
                effortLevel: taskData.effortLevel || EffortLevel.M, // Default to Medium effort
                completed: false,
                completedDate: null,
                tags: resolvedTags,
                people: resolvedPeople,
                dependencies: [], // Not provided by current parser
                status: TaskStatus.PENDING, // Add default status
            };

            console.log('Creating task:', newTask);

            // Add the task and ensure we wait for it to complete
            await addTask(newTask);

            toast({
                title: 'Task created',
                description: `"${newTask.title}" has been created`,
            });
            setInputValue('');
            onClose?.(); // Call onClose after successful submission
        } catch (error) {
            console.error('Error creating task:', error);
            toast({
                title: 'Error',
                description: 'Failed to create task. Please try again.',
                variant: 'destructive',
            });
        } finally {
            // Always ensure we exit the processing state, even if there was an error
            setIsProcessing(false);
        }
    };

    if (isMobile) {
        return (
            <div className="p-4 bg-background border-t fixed bottom-0 left-0 right-0 z-50">
                {/* The 'Processing your task...' message container has been removed. */}
                {isProcessing && (
                    <div className="flex items-center space-x-2 mb-4 p-2 border border-input rounded-md bg-muted/20">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <p className="text-sm">Processing your task...</p>
                    </div>
                )}

                <NaturalLanguageInput
                    value={inputValue}
                    onChange={setInputValue}
                    onSubmit={handleQuickTaskSubmit}
                    placeholder="What would you like to get done?"
                />
                <div className="flex justify-between items-center mt-2">
                    <div className="text-xs text-muted-foreground flex-1">
                        Use #tag, @person, "high priority", dates like "due tomorrow"
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        aria-label="Close quick task input"
                        className="ml-2"
                        id="quick-task-cancel-button"
                    >
                        <XIcon className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-6">
            {/* The 'Processing your task...' message container has been removed. */}
            {isProcessing && (
                 <div className="flex items-center space-x-2 mb-4 p-2 border border-input rounded-md bg-muted/20">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p className="text-sm">Processing your task...</p>
                </div>
            )}

            <NaturalLanguageInput
                value={inputValue}
                onChange={setInputValue}
                onSubmit={handleQuickTaskSubmit}
                autoFocus={true}
            />
            <div className="mt-1 text-xs text-muted-foreground">
                Pro tip: Use #tag for tags, @person for people, "high priority"
                or dates like "due tomorrow"
            </div>
        </div>
    );
};

export default QuickTaskInput;
