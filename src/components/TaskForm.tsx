
import { useState, useEffect } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { Task, Priority, EffortLevel, Group, Person } from '@/types';
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
import { format } from 'date-fns';
import { CalendarIcon, X, Search, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

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
  groups: [],
  people: []
};

const TaskForm = ({ task, onSuccess, onCancel }: TaskFormProps) => {
  const { addTask, updateTask, groups, people, addGroup, addPerson } = useTaskContext();
  const [formData, setFormData] = useState(task || defaultTask);
  const [groupSearch, setGroupSearch] = useState('');
  const [personSearch, setPersonSearch] = useState('');
  
  const isEditing = !!task;

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

  const handleGroupToggle = (groupId: string) => {
    setFormData(prev => {
      const isSelected = prev.groups.some(g => g.id === groupId);
      const selectedGroup = groups.find(g => g.id === groupId);
      
      if (!selectedGroup) return prev;
      
      return {
        ...prev,
        groups: isSelected 
          ? prev.groups.filter(g => g.id !== groupId)
          : [...prev.groups, selectedGroup]
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

  const handleAddNewGroup = () => {
    if (!groupSearch.trim()) return;
    
    // Check if group already exists
    const existingGroup = groups.find(g => 
      g.name.toLowerCase() === groupSearch.trim().toLowerCase()
    );
    
    if (existingGroup) {
      // If it exists but isn't selected, select it
      if (!formData.groups.some(g => g.id === existingGroup.id)) {
        handleGroupToggle(existingGroup.id);
      }
      setGroupSearch('');
      return;
    }
    
    // Add new group
    const newGroup = addGroup(groupSearch.trim());
    if (newGroup) {
      setFormData(prev => ({
        ...prev,
        groups: [...prev.groups, newGroup]
      }));
      setGroupSearch('');
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

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(groupSearch.toLowerCase()) && 
    !formData.groups.some(sg => sg.id === g.id)
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
              <SelectItem value="1">1 - Tiny</SelectItem>
              <SelectItem value="2">2 - Small</SelectItem>
              <SelectItem value="4">4 - Medium</SelectItem>
              <SelectItem value="8">8 - Large</SelectItem>
              <SelectItem value="16">16 - XLarge</SelectItem>
              <SelectItem value="32">32 - XXLarge</SelectItem>
              <SelectItem value="64">64 - Massive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
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
        <label className="block text-xs font-medium mb-1">Groups/Areas</label>
        <div className="flex flex-wrap gap-1 mb-1">
          {formData.groups.map(group => (
            <Badge key={group.id} variant="outline" className="group-tag text-xs py-0 h-6 flex items-center gap-1">
              {group.name}
              <button 
                type="button" 
                onClick={() => handleGroupToggle(group.id)}
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
                placeholder="Search or add groups..."
                value={groupSearch}
                onChange={(e) => setGroupSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start" onInteractOutside={(e) => e.preventDefault()}>
            <div className="p-2 max-h-[150px] overflow-y-auto">
              {filteredGroups.length > 0 ? (
                <div className="space-y-1">
                  {filteredGroups.map(group => (
                    <div
                      key={group.id}
                      className="flex items-center px-2 py-1 text-xs rounded-md cursor-pointer hover:bg-accent"
                      onClick={() => {
                        handleGroupToggle(group.id);
                        setGroupSearch('');
                      }}
                    >
                      {group.name}
                    </div>
                  ))}
                </div>
              ) : (
                groupSearch.trim() !== '' && (
                  <div 
                    className="flex items-center gap-1 px-2 py-1 text-xs rounded-md cursor-pointer hover:bg-accent"
                    onClick={handleAddNewGroup}
                  >
                    <Plus size={14} />
                    Add "{groupSearch.trim()}"
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
