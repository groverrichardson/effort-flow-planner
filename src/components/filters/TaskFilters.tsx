
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Priority, Group, Person } from '@/types';
import { Filter, X } from 'lucide-react';

interface TaskFiltersProps {
  activeTasks: Array<{
    priority: Priority;
    groups: Group[];
    people: Person[];
    dueDate?: Date | null;
    goLiveDate?: Date | null;
  }>;
  selectedPriorities: Priority[];
  selectedGroups: string[];
  selectedPeople: string[];
  filterByDueDate: string;
  filterByGoLive: boolean;
  onTogglePriority: (priority: Priority) => void;
  onToggleGroup: (groupId: string) => void;
  onTogglePerson: (personId: string) => void;
  onSetFilterByDueDate: (value: string) => void;
  onSetFilterByGoLive: (value: boolean) => void;
  onClearAllFilters: () => void;
}

const TaskFilters = ({
  activeTasks,
  selectedPriorities,
  selectedGroups,
  selectedPeople,
  filterByDueDate,
  filterByGoLive,
  onTogglePriority,
  onToggleGroup,
  onTogglePerson,
  onSetFilterByDueDate,
  onSetFilterByGoLive,
  onClearAllFilters
}: TaskFiltersProps) => {
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  
  // Check if any filters are active
  const hasActiveFilters = selectedPriorities.length > 0 || 
                          selectedGroups.length > 0 || 
                          selectedPeople.length > 0 || 
                          filterByDueDate !== 'all' ||
                          filterByGoLive;

  return (
    <div className="flex flex-col space-y-4">
      <Popover open={filterMenuOpen} onOpenChange={setFilterMenuOpen}>
        <PopoverTrigger asChild>
          <Button 
            size="sm"
            variant={hasActiveFilters ? "default" : "outline"}
            className="flex items-center gap-1"
          >
            <Filter size={16} />
            {hasActiveFilters ? "Filters Applied" : "Filter"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-4" align="end">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Filters</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClearAllFilters}
                className="h-8 text-xs"
              >
                Clear All
              </Button>
            </div>
            
            {/* Priority Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2">Priority</h4>
              <div className="flex flex-wrap gap-1">
                {(['high', 'normal', 'low', 'lowest'] as Priority[]).map(priority => (
                  <Badge 
                    key={priority} 
                    variant={selectedPriorities.includes(priority) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => onTogglePriority(priority)}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Due Date Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2">Due Date</h4>
              <div className="flex flex-wrap gap-1">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'today', label: 'Today' },
                  { value: 'week', label: 'This Week' },
                  { value: 'overdue', label: 'Overdue' },
                ].map(option => (
                  <Badge 
                    key={option.value} 
                    variant={filterByDueDate === option.value ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => onSetFilterByDueDate(option.value)}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Go-Live Filter */}
            <div>
              <label className="flex items-center space-x-2">
                <Checkbox 
                  checked={filterByGoLive}
                  onCheckedChange={() => onSetFilterByGoLive(!filterByGoLive)}
                />
                <span className="text-sm">Has Go-Live Date</span>
              </label>
            </div>
            
            {/* Group Filter */}
            {activeTasks.some(task => task.groups.length > 0) && (
              <div>
                <h4 className="text-sm font-medium mb-2">Groups/Areas</h4>
                <div className="max-h-28 overflow-y-auto space-y-1">
                  {Array.from(new Set(
                    activeTasks.flatMap(task => task.groups)
                      .map(group => ({ id: group.id, name: group.name }))
                  )).map(group => (
                    <label key={group.id} className="flex items-center space-x-2">
                      <Checkbox 
                        checked={selectedGroups.includes(group.id)}
                        onCheckedChange={() => onToggleGroup(group.id)}
                      />
                      <span className="text-sm">{group.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            
            {/* People Filter */}
            {activeTasks.some(task => task.people.length > 0) && (
              <div>
                <h4 className="text-sm font-medium mb-2">People</h4>
                <div className="max-h-28 overflow-y-auto space-y-1">
                  {Array.from(new Set(
                    activeTasks.flatMap(task => task.people)
                      .map(person => ({ id: person.id, name: person.name }))
                  )).map(person => (
                    <label key={person.id} className="flex items-center space-x-2">
                      <Checkbox 
                        checked={selectedPeople.includes(person.id)}
                        onCheckedChange={() => onTogglePerson(person.id)}
                      />
                      <span className="text-sm">{person.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {selectedPriorities.map(priority => (
            <Badge 
              key={priority} 
              variant="secondary"
              className="flex items-center gap-1"
            >
              {priority}
              <button
                className="ml-1 h-4 w-4 rounded-full flex items-center justify-center hover:bg-muted"
                onClick={() => onTogglePriority(priority)}
              >
                <X size={10} />
              </button>
            </Badge>
          ))}
          {filterByDueDate !== 'all' && (
            <Badge 
              variant="secondary"
              className="flex items-center gap-1"
            >
              Due: {filterByDueDate}
              <button
                className="ml-1 h-4 w-4 rounded-full flex items-center justify-center hover:bg-muted"
                onClick={() => onSetFilterByDueDate('all')}
              >
                <X size={10} />
              </button>
            </Badge>
          )}
          {filterByGoLive && (
            <Badge 
              variant="secondary"
              className="flex items-center gap-1"
            >
              Has Go-Live
              <button
                className="ml-1 h-4 w-4 rounded-full flex items-center justify-center hover:bg-muted"
                onClick={() => onSetFilterByGoLive(false)}
              >
                <X size={10} />
              </button>
            </Badge>
          )}
          {selectedGroups.map(groupId => {
            const group = Array.from(new Set(
              activeTasks.flatMap(task => task.groups)
            )).find(g => g.id === groupId);
            
            return group ? (
              <Badge 
                key={groupId} 
                variant="secondary"
                className="flex items-center gap-1"
              >
                Group: {group.name}
                <button
                  className="ml-1 h-4 w-4 rounded-full flex items-center justify-center hover:bg-muted"
                  onClick={() => onToggleGroup(groupId)}
                >
                  <X size={10} />
                </button>
              </Badge>
            ) : null;
          })}
          {selectedPeople.map(personId => {
            const person = Array.from(new Set(
              activeTasks.flatMap(task => task.people)
            )).find(p => p.id === personId);
            
            return person ? (
              <Badge 
                key={personId} 
                variant="secondary"
                className="flex items-center gap-1"
              >
                Person: {person.name}
                <button
                  className="ml-1 h-4 w-4 rounded-full flex items-center justify-center hover:bg-muted"
                  onClick={() => onTogglePerson(personId)}
                >
                  <X size={10} />
                </button>
              </Badge>
            ) : null;
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAllFilters}
            className="text-xs h-6"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};

export default TaskFilters;
