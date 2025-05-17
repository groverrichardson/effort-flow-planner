
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
import { CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import GroupForm from './GroupForm';
import PersonForm from './PersonForm';

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
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [personModalOpen, setPersonModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  
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

  const handleCreateGroup = (name: string) => {
    const newGroup = addGroup(name);
    setFormData(prev => ({
      ...prev,
      groups: [...prev.groups, newGroup]
    }));
    setGroupModalOpen(false);
  };

  const handleCreatePerson = (name: string) => {
    const newPerson = addPerson(name);
    setFormData(prev => ({
      ...prev,
      people: [...prev.people, newPerson]
    }));
    setPersonModalOpen(false);
  };

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setGroupModalOpen(true);
  };

  const handleEditPerson = (person: Person) => {
    setEditingPerson(person);
    setPersonModalOpen(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Input
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Task title"
          className="text-lg font-medium"
        />
      </div>

      <div>
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Add a description..."
          className="min-h-[100px]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <Select value={formData.priority} onValueChange={handlePriorityChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="normal">Normal Priority</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
              <SelectItem value="lowest">Lowest Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Effort Level</label>
          <Select value={formData.effortLevel.toString()} onValueChange={handleEffortChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select effort level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 - Very Small</SelectItem>
              <SelectItem value="2">2 - Small</SelectItem>
              <SelectItem value="4">4 - Medium</SelectItem>
              <SelectItem value="8">8 - Large</SelectItem>
              <SelectItem value="16">16 - Very Large</SelectItem>
              <SelectItem value="32">32 - Enormous</SelectItem>
              <SelectItem value="64">64 - Massive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Due Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.dueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.dueDate ? format(formData.dueDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.dueDate || undefined}
                onSelect={(date) => handleDateChange(date, 'dueDate')}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
              {formData.dueDate && (
                <div className="p-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDateChange(null, 'dueDate')}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Target Deadline</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.targetDeadline && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.targetDeadline ? format(formData.targetDeadline, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.targetDeadline || undefined}
                onSelect={(date) => handleDateChange(date, 'targetDeadline')}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
              {formData.targetDeadline && (
                <div className="p-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDateChange(null, 'targetDeadline')}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Go-Live Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.goLiveDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.goLiveDate ? format(formData.goLiveDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.goLiveDate || undefined}
                onSelect={(date) => handleDateChange(date, 'goLiveDate')}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
              {formData.goLiveDate && (
                <div className="p-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDateChange(null, 'goLiveDate')}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">Groups/Areas</label>
          <Button 
            type="button" 
            size="sm" 
            variant="outline"
            onClick={() => {
              setEditingGroup(null);
              setGroupModalOpen(true);
            }}
          >
            Add New Group
          </Button>
        </div>
        <div className="border rounded-md p-3 min-h-[100px] bg-background">
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.groups.map(group => (
              <Badge key={group.id} variant="outline" className="group-tag flex items-center gap-1">
                {group.name}
                <button 
                  type="button" 
                  onClick={() => handleGroupToggle(group.id)}
                  className="rounded-full hover:bg-accent ml-1 h-4 w-4 flex items-center justify-center"
                >
                  <X size={12} />
                </button>
                <button 
                  type="button" 
                  onClick={() => handleEditGroup(group)}
                  className="ml-1 text-xs underline"
                >
                  Edit
                </button>
              </Badge>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {groups
              .filter(g => !formData.groups.some(sg => sg.id === g.id))
              .map(group => (
                <div 
                  key={group.id}
                  onClick={() => handleGroupToggle(group.id)}
                  className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-secondary"
                >
                  <span className="text-sm">{group.name}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">People</label>
          <Button 
            type="button" 
            size="sm" 
            variant="outline"
            onClick={() => {
              setEditingPerson(null);
              setPersonModalOpen(true);
            }}
          >
            Add New Person
          </Button>
        </div>
        <div className="border rounded-md p-3 min-h-[100px] bg-background">
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.people.map(person => (
              <Badge key={person.id} variant="outline" className="people-tag flex items-center gap-1">
                {person.name}
                <button 
                  type="button" 
                  onClick={() => handlePersonToggle(person.id)}
                  className="rounded-full hover:bg-accent ml-1 h-4 w-4 flex items-center justify-center"
                >
                  <X size={12} />
                </button>
                <button 
                  type="button" 
                  onClick={() => handleEditPerson(person)}
                  className="ml-1 text-xs underline"
                >
                  Edit
                </button>
              </Badge>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {people
              .filter(p => !formData.people.some(sp => sp.id === p.id))
              .map(person => (
                <div 
                  key={person.id}
                  onClick={() => handlePersonToggle(person.id)}
                  className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-secondary"
                >
                  <span className="text-sm">{person.name}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button type="submit">{isEditing ? 'Update Task' : 'Create Task'}</Button>
      </div>

      <Dialog open={groupModalOpen} onOpenChange={setGroupModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGroup ? 'Edit Group' : 'Add New Group'}</DialogTitle>
          </DialogHeader>
          <GroupForm 
            group={editingGroup} 
            onSave={handleCreateGroup}
            onCancel={() => setGroupModalOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={personModalOpen} onOpenChange={setPersonModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPerson ? 'Edit Person' : 'Add New Person'}</DialogTitle>
          </DialogHeader>
          <PersonForm 
            person={editingPerson} 
            onSave={handleCreatePerson}
            onCancel={() => setPersonModalOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </form>
  );
};

export default TaskForm;
