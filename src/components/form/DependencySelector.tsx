
import { useState } from 'react';
import { Task } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DependencySelectorProps {
  selectedDependencies: string[];
  availableTasks: Task[];
  onToggleDependency: (taskId: string) => void;
}

const DependencySelector = ({
  selectedDependencies,
  availableTasks,
  onToggleDependency,
}: DependencySelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredTasks = availableTasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <label className="block text-xs font-medium mb-1">Dependencies</label>
      <div className="relative mb-2">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search dependencies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>
      
      <div className="border border-input rounded-md min-h-[70px] max-h-[150px] overflow-y-auto p-2">
        {selectedDependencies.length > 0 ? (
          <div className="flex flex-wrap gap-1 mb-2">
            {selectedDependencies.map(depId => {
              const task = availableTasks.find(t => t.id === depId);
              return task ? (
                <Badge 
                  key={depId}
                  variant="secondary"
                  className="flex items-center gap-1 cursor-pointer hover:bg-muted"
                  onClick={() => onToggleDependency(depId)}
                >
                  {task.title}
                  <span className="text-xs">×</span>
                </Badge>
              ) : null;
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground p-1">No dependencies selected</p>
        )}
        
        {searchTerm && filteredTasks.length > 0 && (
          <div className="mt-2 border-t pt-2">
            <p className="text-xs text-muted-foreground mb-1">Search results:</p>
            <div className="space-y-1">
              {filteredTasks.map(task => (
                <div
                  key={task.id}
                  className={`text-xs p-1.5 rounded-sm cursor-pointer ${
                    selectedDependencies.includes(task.id) ? 'bg-muted' : 'hover:bg-muted'
                  }`}
                  onClick={() => onToggleDependency(task.id)}
                >
                  {task.title}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DependencySelector;
