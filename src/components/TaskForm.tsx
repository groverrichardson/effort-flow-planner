import { useState, useEffect } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { Task, Priority, EffortLevel } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { format, addDays, addWeeks, addMonths } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { naturalLanguageToTask } from '@/utils/naturalLanguageParser';

// Import our new components
import DatePickerField from './form/DatePickerField';
import TagSelector from './form/TagSelector';
import PeopleSelector from './form/PeopleSelector';
import TaskFormActions from './form/TaskFormActions';

interface TaskFormProps {
  task?: Task;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const defaultTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '',
  description: '',
  priority: 'normal' as Priority,
  dueDate: null,
  targetDeadline: null,
  goLiveDate: null,
  effortLevel: 1 as EffortLevel,
  completed: false,
  completedDate: null,
  tags: [],
  people: []
};

const TaskForm = ({ task, onSuccess, onCancel }: TaskFormProps) => {
  const { addTask, updateTask, tags, people, addTag, addPerson } = useTaskContext();
  const [formData, setFormData] = useState(task || defaultTask);
  const isEditing = !!task;

  // Auto-fill target deadline based on effort level
  useEffect(() => {
    if (!isEditing || (isEditing && !task?.targetDeadline)) {
      const today = new Date();
      let targetDate = null;
      
      switch(formData.effortLevel) {
        case 1: // 15 minutes or less
          targetDate = new Date(today.getTime() + (15 * 60 * 1000));
          break;
        case 2: // 30 minutes
          targetDate = new Date(today.getTime() + (30 * 60 * 1000));
          break;
        case 4: // couple hours
          targetDate = new Date(today.getTime() + (2 * 60 * 60 * 1000));
          break;
        case 8: // a whole day
          targetDate = addDays(today, 1);
          break;
        case 16: // a week
          targetDate = addDays(today, 7);
          break;
        case 32: // couple of weeks
          targetDate = addWeeks(today, 2);
          break;
        case 64: // a month or more
          targetDate = addMonths(today, 1);
          break;
        default:
          targetDate = null;
      }
      
      setFormData(prev => ({ ...prev, targetDeadline: targetDate }));
    }
  }, [formData.effortLevel, isEditing, task?.targetDeadline]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePriorityChange = (value: string) => {
    setFormData(prev => ({ ...prev, priority: value as Priority }));
  };

  const handleEffortChange = (value: string) => {
    setFormData(prev => ({ ...prev, effortLevel: Number(value) as EffortLevel }));
  };

  const handleDateChange = (date: Date | null, field: 'dueDate' | 'targetDeadline' | 'goLiveDate') => {
    setFormData(prev => ({ ...prev, [field]: date }));
    // Auto-close the popover after selection by triggering a click outside event
    document.body.click();
  };

  const handleTagToggle = (tagId: string) => {
    setFormData(prev => {
      const isSelected = prev.tags.some(g => g.id === tagId);
      const selectedTag = tags.find(g => g.id === tagId);
      
      if (!selectedTag) return prev;
      
      return {
        ...prev,
        tags: isSelected 
          ? prev.tags.filter(g => g.id !== tagId)
          : [...prev.tags, selectedTag]
      };
    });
  };

  const handlePersonToggle = (personId: string) => {
    setFormData(prev => {
      const isSelected = prev.people.some(p => p.id === personId);
      const selectedPerson = people.find(p => p.id === personId);
      
      if (!selectedPerson) return prev;
      
      return {
        ...prev,
        people: isSelected 
          ? prev.people.filter(p => p.id !== personId)
          : [...prev.people, selectedPerson]
      };
    });
  };

  const handleAddNewTag = (tagName: string) => {
    if (!tagName.trim()) return;
    
    // Check if tag already exists
    const existingTag = tags.find(g => 
      g.name.toLowerCase() === tagName.trim().toLowerCase()
    );
    
    if (existingTag) {
      // If it exists but isn't selected, select it
      if (!formData.tags.some(g => g.id === existingTag.id)) {
        handleTagToggle(existingTag.id);
      }
      return;
    }
    
    // Add new tag
    const newTag = addTag(tagName.trim());
    if (newTag) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
    }
  };

  const handleAddNewPerson = (personName: string) => {
    if (!personName.trim()) return;
    
    // Check if person already exists
    const existingPerson = people.find(p => 
      p.name.toLowerCase() === personName.trim().toLowerCase()
    );
    
    if (existingPerson) {
      // If it exists but isn't selected, select it
      if (!formData.people.some(p => p.id === existingPerson.id)) {
        handlePersonToggle(existingPerson.id);
      }
      return;
    }
    
    // Add new person
    const newPerson = addPerson(personName.trim());
    if (newPerson) {
      setFormData(prev => ({
        ...prev,
        people: [...prev.people, newPerson]
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive"
      });
      return;
    }
    
    if (isEditing && task) {
      updateTask({ ...task, ...formData });
      toast({ title: "Success", description: "Task updated successfully" });
    } else {
      addTask(formData);
      toast({ title: "Success", description: "Task created successfully" });
    }
    
    if (onSuccess) onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Task title"
          className="text-md font-medium"
        />
      </div>

      <div>
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Add a description..."
          className="min-h-[80px] text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium mb-1">Priority</label>
          <Select value={formData.priority} onValueChange={handlePriorityChange}>
            <SelectTrigger className="h-8 text-xs">
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
          <label className="block text-xs font-medium mb-1">Effort</label>
          <Select value={formData.effortLevel.toString()} onValueChange={handleEffortChange}>
            <SelectTrigger className="h-8 text-xs">
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

      <div className="flex flex-wrap gap-2">
        <DatePickerField 
          label="Due Date" 
          value={formData.dueDate} 
          onChange={(date) => handleDateChange(date, 'dueDate')} 
        />
        <DatePickerField 
          label="Target Deadline" 
          value={formData.targetDeadline} 
          onChange={(date) => handleDateChange(date, 'targetDeadline')} 
        />
        <DatePickerField 
          label="Go-Live Date" 
          value={formData.goLiveDate} 
          onChange={(date) => handleDateChange(date, 'goLiveDate')} 
        />
      </div>

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

      <TaskFormActions 
        isEditing={isEditing} 
        onCancel={onCancel}
        onDelete={onCancel} // Reusing onCancel for delete operation
      />
    </form>
  );
};

export default TaskForm;
