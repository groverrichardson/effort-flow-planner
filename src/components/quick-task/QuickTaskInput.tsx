
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
  
  const handleQuickTaskSubmit = () => {
    if (!quickTaskInput.trim()) return;
    
    const taskData = naturalLanguageToTask(quickTaskInput);
    
    // Process tags from names - create new tags if needed
    if (taskData.tagNames && taskData.tagNames.length > 0) {
      taskData.tags = taskData.tagNames.map(tagName => {
        // Try to find an existing tag
        const existingTag = tags.find(t => 
          t.name.toLowerCase() === tagName.toLowerCase()
        );
        // Create a new tag if it doesn't exist
        return existingTag || addTag(tagName);
      });
      delete taskData.tagNames;
    } else {
      taskData.tags = [];
    }
    
    // Process people from names - create new people if needed
    if (taskData.peopleNames && taskData.peopleNames.length > 0) {
      taskData.people = taskData.peopleNames.map(personName => {
        // Try to find an existing person
        const existingPerson = people.find(p => 
          p.name.toLowerCase() === personName.toLowerCase()
        );
        // Create a new person if they don't exist
        return existingPerson || addPerson(personName);
      });
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
  };
  
  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background z-50 border-t">
        <NaturalLanguageInput
          value={quickTaskInput}
          onChange={setQuickTaskInput}
          onSubmit={handleQuickTaskSubmit}
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
