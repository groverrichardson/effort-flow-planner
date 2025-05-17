
import { useState, useEffect } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { Task, Priority, EffortLevel, Tag, Person } from '@/types';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays, addWeeks, addMonths } from 'date-fns';
import { CalendarIcon, X, Search, Plus, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { naturalLanguageToTask } from '@/utils/naturalLanguageParser';

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
  const [tagSearch, setTagSearch] = useState('');
  const [personSearch, setPersonSearch] = useState('');
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [showNaturalLanguageInput, setShowNaturalLanguageInput] = useState(false);
  
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

  const handleAddNewTag = () => {
    if (!tagSearch.trim()) return;
    
    // Check if tag already exists
    const existingTag = tags.find(g => 
      g.name.toLowerCase() === tagSearch.trim().toLowerCase()
    );
    
    if (existingTag) {
      // If it exists but isn't selected, select it
      if (!formData.tags.some(g => g.id === existingTag.id)) {
        handleTagToggle(existingTag.id);
      }
      setTagSearch('');
      return;
    }
    
    // Add new tag
    const newTag = addTag(tagSearch.trim());
    if (newTag) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setTagSearch('');
    }
  };

  const handleAddNewPerson = () => {
    if (!personSearch.trim()) return;
    
    // Check if person already exists
    const existingPerson = people.find(p => 
      p.name.toLowerCase() === personSearch.trim().toLowerCase()
    );
    
    if (existingPerson) {
      // If it exists but isn't selected, select it
      if (!formData.people.some(p => p.id === existingPerson.id)) {
        handlePersonToggle(existingPerson.id);
      }
      setPersonSearch('');
      return;
    }
    
    // Add new person
    const newPerson = addPerson(personSearch.trim());
    if (newPerson) {
      setFormData(prev => ({
        ...prev,
        people: [...prev.people, newPerson]
      }));
      setPersonSearch('');
    }
  };

  const handleNaturalLanguageSubmit = () => {
    if (!naturalLanguageInput.trim()) return;
    
    const taskData = naturalLanguageToTask(naturalLanguageInput);
    
    // Merge with existing form data, prioritizing parsed data
    setFormData(prev => ({
      ...prev,
      ...taskData
    }));
    
    setNaturalLanguageInput('');
    setShowNaturalLanguageInput(false);
    
    toast({
      title: "Task parsed",
      description: "Task details extracted from natural language input"
    });
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

  const filteredTags = tags.filter(g => 
    g.name.toLowerCase().includes(tagSearch.toLowerCase()) && 
    !formData.tags.some(sg => sg.id === g.id)
  );

  const filteredPeople = people.filter(p => 
    p.name.toLowerCase().includes(personSearch.toLowerCase()) && 
    !formData.people.some(sp => sp.id === p.id)
  );

  // Condensed date picker component
  const DatePickerField = ({ 
    label, 
    value, 
    onChange 
  }: { 
    label: string; 
    value: Date | null; 
    onChange: (date: Date | null) => void 
  }) => (
    <div>
      <label className="block text-xs font-medium mb-1">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-8 px-3 text-xs",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-3 w-3" />
            {value ? format(value, "PP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value || undefined}
            onSelect={onChange}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isEditing && (
        <div className="text-right">
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            onClick={() => setShowNaturalLanguageInput(!showNaturalLanguageInput)}
          >
            {showNaturalLanguageInput ? "Hide" : "Use Natural Language Input"}
          </Button>
        </div>
      )}

      {showNaturalLanguageInput && (
        <div className="space-y-2">
          <Textarea
            value={naturalLanguageInput}
            onChange={(e) => setNaturalLanguageInput(e.target.value)}
            placeholder="Describe your task in natural language (e.g., 'Create a high priority presentation for the marketing team due next Friday')"
            className="min-h-[80px] text-sm"
          />
          <div className="text-right">
            <Button 
              type="button" 
              size="sm"
              onClick={handleNaturalLanguageSubmit}
            >
              Parse Task
            </Button>
          </div>
        </div>
      )}

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
              <SelectItem value="1">1 - Tiny (15min)</SelectItem>
              <SelectItem value="2">2 - Small (30min)</SelectItem>
              <SelectItem value="4">4 - Medium (hours)</SelectItem>
              <SelectItem value="8">8 - Large (1 day)</SelectItem>
              <SelectItem value="16">16 - XLarge (1 week)</SelectItem>
              <SelectItem value="32">32 - XXLarge (2 weeks)</SelectItem>
              <SelectItem value="64">64 - Massive (1+ month)</SelectItem>
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

      <div>
        <label className="block text-xs font-medium mb-1">Tags</label>
        <div className="flex flex-wrap gap-1 mb-1">
          {formData.tags.map(tag => (
            <Badge key={tag.id} variant="outline" className="tag-tag text-xs py-0 h-6 flex items-center gap-1">
              {tag.name}
              <button 
                type="button" 
                onClick={() => handleTagToggle(tag.id)}
                className="rounded-full hover:bg-accent ml-1 h-3 w-3 flex items-center justify-center"
              >
                <X size={10} />
              </button>
            </Badge>
          ))}
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <div className="relative">
              <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search or add tags..."
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start" onInteractOutside={(e) => e.preventDefault()}>
            <div className="p-2 max-h-[150px] overflow-y-auto">
              {filteredTags.length > 0 ? (
                <div className="space-y-1">
                  {filteredTags.map(tag => (
                    <div
                      key={tag.id}
                      className="flex items-center px-2 py-1 text-xs rounded-md cursor-pointer hover:bg-accent"
                      onClick={() => {
                        handleTagToggle(tag.id);
                        setTagSearch('');
                      }}
                    >
                      {tag.name}
                    </div>
                  ))}
                </div>
              ) : (
                tagSearch.trim() !== '' && (
                  <div 
                    className="flex items-center gap-1 px-2 py-1 text-xs rounded-md cursor-pointer hover:bg-accent"
                    onClick={handleAddNewTag}
                  >
                    <Plus size={14} />
                    Add "{tagSearch.trim()}"
                  </div>
                )
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1">People</label>
        <div className="flex flex-wrap gap-1 mb-1">
          {formData.people.map(person => (
            <Badge key={person.id} variant="outline" className="people-tag text-xs py-0 h-6 flex items-center gap-1">
              {person.name}
              <button 
                type="button" 
                onClick={() => handlePersonToggle(person.id)}
                className="rounded-full hover:bg-accent ml-1 h-3 w-3 flex items-center justify-center"
              >
                <X size={10} />
              </button>
            </Badge>
          ))}
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <div className="relative">
              <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search or add people..."
                value={personSearch}
                onChange={(e) => setPersonSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start" onInteractOutside={(e) => e.preventDefault()}>
            <div className="p-2 max-h-[150px] overflow-y-auto">
              {filteredPeople.length > 0 ? (
                <div className="space-y-1">
                  {filteredPeople.map(person => (
                    <div
                      key={person.id}
                      className="flex items-center px-2 py-1 text-xs rounded-md cursor-pointer hover:bg-accent"
                      onClick={() => {
                        handlePersonToggle(person.id);
                        setPersonSearch('');
                      }}
                    >
                      {person.name}
                    </div>
                  ))}
                </div>
              ) : (
                personSearch.trim() !== '' && (
                  <div 
                    className="flex items-center gap-1 px-2 py-1 text-xs rounded-md cursor-pointer hover:bg-accent"
                    onClick={handleAddNewPerson}
                  >
                    <Plus size={14} />
                    Add "{personSearch.trim()}"
                  </div>
                )
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {isEditing ? (
        <div className="flex justify-between pt-2 border-t">
          <Button 
            variant="destructive" 
            size="sm"
            type="button"
            onClick={() => {
              if (onCancel) onCancel();
            }}
          >
            <Trash size={16} className="mr-1" />
            Delete
          </Button>
          
          <div className="flex gap-2">
            {onCancel && (
              <Button 
                variant="outline" 
                size="sm"
                type="button"
                onClick={onCancel}
              >
                Close
              </Button>
            )}
            <Button type="submit" size="sm">Update Task</Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end gap-2 pt-2">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" size="sm">Create Task</Button>
        </div>
      )}
    </form>
  );
};

export default TaskForm;
