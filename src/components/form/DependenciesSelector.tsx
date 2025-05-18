
import React, { useState } from 'react';
import { Task } from '@/types';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DependenciesSelectorProps {
  selectedDependencies: string[];
  availableTasks: Task[];
  currentTaskId?: string;
  onToggleDependency: (taskId: string) => void;
}

const DependenciesSelector: React.FC<DependenciesSelectorProps> = ({
  selectedDependencies = [],
  availableTasks = [],
  currentTaskId,
  onToggleDependency,
}) => {
  const [open, setOpen] = useState(false);

  // Filter out the current task and completed tasks from available options
  const eligibleTasks = availableTasks.filter(
    task => task.id !== currentTaskId && !task.completed
  );

  // Get full task objects for selected dependencies
  const selectedDependencyTasks = eligibleTasks.filter(
    task => selectedDependencies.includes(task.id)
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        Task Dependencies
      </label>
      
      <div className="flex flex-wrap gap-1 mb-2">
        {selectedDependencyTasks.length > 0 ? (
          selectedDependencyTasks.map((task) => (
            <Badge 
              key={task.id} 
              variant="secondary"
              className="flex items-center gap-1 pl-2 pr-1 py-1 h-6"
            >
              <span className="truncate max-w-[150px]">{task.title}</span>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onToggleDependency(task.id)}
                className="h-4 w-4 p-0 ml-1"
              >
                <XCircle className="h-4 w-4" />
                <span className="sr-only">Remove</span>
              </Button>
            </Badge>
          ))
        ) : (
          <div className="text-sm text-muted-foreground">No dependencies selected</div>
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            disabled={eligibleTasks.length === 0}
          >
            Add Dependencies
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search tasks..." />
            <CommandList>
              <CommandEmpty>No tasks found.</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-[200px]">
                  {eligibleTasks.map((task) => {
                    const isSelected = selectedDependencies.includes(task.id);
                    return (
                      <CommandItem
                        key={task.id}
                        onSelect={() => {
                          onToggleDependency(task.id);
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="truncate max-w-[200px]">{task.title}</span>
                          {isSelected && <CheckCircle className="h-4 w-4 text-primary ml-2" />}
                        </div>
                      </CommandItem>
                    );
                  })}
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DependenciesSelector;
