
import { useState } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { naturalLanguageToTask } from '@/utils/naturalLanguageParser';
import NaturalLanguageInput from '@/components/form/NaturalLanguageInput';
import { toast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const QuickTaskInput = () => {
  const { addTask, tags, people, addTag, addPerson } = useTaskContext();
  const [quickTaskInput, setQuickTaskInput] = useState('');
  const isMobile = useIsMobile();
  
  const handleQuickTaskSubmit = async () => {
    if (!quickTaskInput.trim()) return;
    
    try {
      const taskData = naturalLanguageToTask(quickTaskInput);
      
      // Process tags from names - create new tags if needed
      if (taskData.tagNames && taskData.tagNames.length > 0) {
        taskData.tags = await Promise.all(taskData.tagNames.map(async tagName => {
          // Try to find an existing tag
          const existingTag = tags.find(t => 
            t.name.toLowerCase() === tagName.toLowerCase()
          );
          // Create a new tag if it doesn't exist
          return existingTag || await addTag(tagName);
        }));
        delete taskData.tagNames;
      } else {
        taskData.tags = [];
      }
      
      // Process people from names - create new people if needed
      let peopleToAdd = [];
      if (taskData.peopleNames && taskData.peopleNames.length > 0) {
        // Limit to a maximum of 2 people
        const limitedPeopleNames = taskData.peopleNames.slice(0, 2);
        
        peopleToAdd = await Promise.all(limitedPeopleNames.map(async personName => {
          // Try to find an existing person by exact match
          const existingPerson = people.find(p => 
            p.name.toLowerCase() === personName.toLowerCase()
          );
          
          // Create a new person if they don't exist
          return existingPerson || await addPerson(personName);
        }));
        taskData.people = peopleToAdd;
        delete taskData.peopleNames;
      } else {
        taskData.people = [];
      }
      
      // Set default values for required fields
      const newTask = {
        title: taskData.title || quickTaskInput,
        description: taskData.description || '',
        priority: taskData.priority || 'normal',
        dueDate: taskData.dueDate || null,
        targetDeadline: taskData.targetDeadline || null,
        goLiveDate: taskData.goLiveDate || null,
        effortLevel: taskData.effortLevel || 4,
        completed: false,
        completedDate: null,
        tags: taskData.tags,
        people: taskData.people,
      };
      
      addTask(newTask);
      toast({ 
        title: "Task created", 
        description: `"${newTask.title}" has been created` 
      });
      setQuickTaskInput('');
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive"
      });
    }
  };
  
  if (isMobile) {
    return (
      <div>
        <NaturalLanguageInput
          value={quickTaskInput}
          onChange={setQuickTaskInput}
          onSubmit={handleQuickTaskSubmit}
          placeholder="What would you like to get done?"
        />
        <div className="mt-1 text-xs text-muted-foreground">
          Use #tag for tags, @person for people, "high priority" or dates like "due tomorrow"
        </div>
      </div>
    );
  }
  
  return (
    <div className="mb-6">
      <NaturalLanguageInput
        value={quickTaskInput}
        onChange={setQuickTaskInput}
        onSubmit={handleQuickTaskSubmit}
        autoFocus={true}
      />
      <div className="mt-1 text-xs text-muted-foreground">
        Pro tip: Use #tag for tags, @person for people, "high priority" or dates like "due tomorrow"
      </div>
    </div>
  );
};

export default QuickTaskInput;
