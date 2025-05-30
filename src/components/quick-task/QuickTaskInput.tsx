import { useState } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { naturalLanguageToTask } from '@/utils/naturalLanguageParser';
import NaturalLanguageInput from '@/components/form/NaturalLanguageInput';
import { toast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useQuickTaskInputState } from '@/hooks/useQuickTaskInputState';
import { TaskStatus } from '@/types';

const QuickTaskInput = () => {
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

            console.log('Parsed task data:', taskData);

            // Process tags from names - create new tags if needed
            if (taskData.tagNames && taskData.tagNames.length > 0) {
                taskData.tags = await Promise.all(
                    taskData.tagNames.map(async (tagName) => {
                        // Try to find an existing tag
                        const existingTag = tags.find(
                            (t) =>
                                t.name.toLowerCase() === tagName.toLowerCase()
                        );
                        // Create a new tag if it doesn't exist
                        return existingTag || (await addTag(tagName));
                    })
                );
                delete taskData.tagNames;
            } else {
                taskData.tags = [];
            }

            // Process people from names - create new people if needed
            let peopleToAdd = [];
            if (taskData.peopleNames && taskData.peopleNames.length > 0) {
                // Limit to a maximum of 2 people
                const limitedPeopleNames = taskData.peopleNames.slice(0, 2);

                console.log('Processing people:', limitedPeopleNames);

                peopleToAdd = await Promise.all(
                    limitedPeopleNames.map(async (personName) => {
                        // Try to find an existing person by exact match
                        const existingPerson = people.find(
                            (p) =>
                                p.name.toLowerCase() ===
                                personName.toLowerCase()
                        );

                        // Create a new person if they don't exist
                        return existingPerson || (await addPerson(personName));
                    })
                );
                taskData.people = peopleToAdd;
                delete taskData.peopleNames;
            } else {
                taskData.people = [];
            }

            // Set default values for required fields
            const newTask = {
                title: taskData.title || inputValue,
                description: taskData.description || '',
                priority: taskData.priority || 'normal',
                dueDate: taskData.dueDate || null,
                dueDateType: taskData.dueDateType || 'by',
                targetDeadline: taskData.targetDeadline || null,
                goLiveDate: taskData.goLiveDate || null,
                effortLevel: taskData.effortLevel || 4,
                completed: false,
                completedDate: null,
                tags: taskData.tags || [],
                people: taskData.people || [],
                dependencies: taskData.dependencies || [],
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
            <div>
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
                <div className="mt-1 text-xs text-muted-foreground">
                    Use #tag for tags, @person for people, "high priority" or
                    dates like "due tomorrow"
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
