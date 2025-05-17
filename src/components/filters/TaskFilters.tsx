
import { useState } from 'react';
import { Task, Priority, Tag, Person } from '@/types';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter } from 'lucide-react';

interface TaskFiltersProps {
  activeTasks: Task[];
  selectedPriorities: Priority[];
  selectedTags: string[];
  selectedPeople: string[];
  filterByDueDate: string;
  filterByGoLive: boolean;
  onTogglePriority: (priority: Priority) => void;
  onToggleTag: (tagId: string) => void;
  onTogglePerson: (personId: string) => void;
  onSetFilterByDueDate: (value: string) => void;
  onSetFilterByGoLive: (value: boolean) => void;
  onClearAllFilters: () => void;
}

const TaskFilters = ({
  activeTasks,
  selectedPriorities,
  selectedTags,
  selectedPeople,
  filterByDueDate,
  filterByGoLive,
  onTogglePriority,
  onToggleTag,
  onTogglePerson,
  onSetFilterByDueDate,
  onSetFilterByGoLive,
  onClearAllFilters
}: TaskFiltersProps) => {
  const [open, setOpen] = useState(false);
  
  // Extract unique tags from active tasks
  const uniqueTags = Array.from(
    new Map(
      activeTasks.flatMap(task => task.tags.map(tag => [tag.id, tag]))
    ).values()
  );
  
  // Extract unique people from active tasks
  const uniquePeople = Array.from(
    new Map(
      activeTasks.flatMap(task => task.people.map(person => [person.id, person]))
    ).values()
  );
  
  // Count active filters
  const activeFilterCount = 
    selectedPriorities.length + 
    selectedTags.length + 
    selectedPeople.length + 
    (filterByDueDate !== 'all' ? 1 : 0) + 
    (filterByGoLive ? 1 : 0);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter size={16} className="mr-1" />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filters</h4>
            {activeFilterCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-7" 
                onClick={onClearAllFilters}
              >
                Clear all
              </Button>
            )}
          </div>
          
          <div>
            <h5 className="text-sm font-medium mb-2">Priority</h5>
            <div className="flex flex-wrap gap-1">
              {(['high', 'normal', 'low', 'lowest'] as Priority[]).map(priority => (
                <Badge 
                  key={priority}
                  variant={selectedPriorities.includes(priority) ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => onTogglePriority(priority)}
                >
                  {priority}
                </Badge>
              ))}
            </div>
          </div>
          
          {uniqueTags.length > 0 && (
            <div>
              <h5 className="text-sm font-medium mb-2">Tags</h5>
              <div className="flex flex-wrap gap-1">
                {uniqueTags.map(tag => (
                  <Badge 
                    key={tag.id}
                    variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                    className="cursor-pointer group-tag"
                    onClick={() => onToggleTag(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {uniquePeople.length > 0 && (
            <div>
              <h5 className="text-sm font-medium mb-2">People</h5>
              <div className="flex flex-wrap gap-1">
                {uniquePeople.map(person => (
                  <Badge 
                    key={person.id}
                    variant={selectedPeople.includes(person.id) ? "default" : "outline"}
                    className="cursor-pointer people-tag"
                    onClick={() => onTogglePerson(person.id)}
                  >
                    {person.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <h5 className="text-sm font-medium mb-2">Due Date</h5>
            <div className="flex flex-wrap gap-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'today', label: 'Today' },
                { id: 'week', label: 'This Week' },
                { id: 'overdue', label: 'Overdue' }
              ].map(option => (
                <Badge 
                  key={option.id}
                  variant={filterByDueDate === option.id ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => onSetFilterByDueDate(option.id)}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <h5 className="text-sm font-medium mb-2">Go-Live Date</h5>
            <div className="flex flex-wrap gap-1">
              <Badge 
                variant={filterByGoLive ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => onSetFilterByGoLive(!filterByGoLive)}
              >
                Has Go-Live Date
              </Badge>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TaskFilters;
