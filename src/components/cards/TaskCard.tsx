
import React from 'react';
import { Task } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CalendarClock } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { useTaskContext } from '@/context/TaskContext';

interface TaskCardProps {
  task: Task;
  viewingCompleted?: boolean;
  onClick: (task: Task) => void;
  onComplete: (task: Task) => void;
}

const TaskCard = ({ 
  task, 
  viewingCompleted = false,
  onClick,
  onComplete 
}: TaskCardProps) => {
  const { tasks } = useTaskContext();
  
  // Check if all dependencies are completed
  const hasDependencies = task.dependencies && task.dependencies.length > 0;
  const allDependenciesCompleted = hasDependencies ? 
    task.dependencies.every(depId => {
      const dependentTask = tasks.find(t => t.id === depId);
      return dependentTask?.completed === true;
    }) : true;
  
  // Format the due date with the type
  const formatDueDate = () => {
    if (!task.dueDate) return null;
    
    const dateStr = format(new Date(task.dueDate), 'MMM d');
    return `${task.dueDateType === 'on' ? 'On' : 'By'} ${dateStr}`;
  };
  
  // Check if the task is overdue
  const isOverdue = () => {
    if (!task.dueDate || task.completed) return false;
    return isPast(new Date(task.dueDate));
  };
  
  // Render the task card
  return (
    <Card 
      className={`transition-all hover:shadow-md cursor-pointer ${
        isOverdue() ? 'border-red-500' : ''
      }`}
      onClick={() => onClick(task)}
    >
      <CardContent className="pt-4 pb-2">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-md">{task.title}</h3>
          <div>
            <Badge variant={getPriorityVariant(task.priority)}>
              {task.priority}
            </Badge>
          </div>
        </div>
        
        {task.description && (
          <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </div>
        )}
        
        <div className="mt-3 flex flex-wrap gap-1">
          {task.tags.map(tag => (
            <Badge key={tag.id} variant="outline" className="text-xs">
              {tag.name}
            </Badge>
          ))}
        </div>

        <div className="mt-3 grid gap-1">
          {task.dueDate && (
            <div className="flex items-center text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              <span className={isOverdue() ? "text-red-500 font-medium" : ""}>
                {formatDueDate()}
              </span>
            </div>
          )}
          
          {task.goLiveDate && (
            <div className="flex items-center text-xs">
              <CalendarClock className="h-3 w-3 mr-1" />
              <span>Go-live: {format(new Date(task.goLiveDate), 'MMM d')}</span>
            </div>
          )}
          
          <div className="flex items-center text-xs">
            <Clock className="h-3 w-3 mr-1" />
            <span>Effort: {getEffortLabel(task.effortLevel)}</span>
          </div>
          
          {hasDependencies && !allDependenciesCompleted && (
            <Badge variant="destructive" className="w-fit mt-2">
              Blocked by dependencies
            </Badge>
          )}
        </div>
      </CardContent>
      
      {!viewingCompleted && (
        <CardFooter className="pt-0 pb-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onComplete(task);
            }}
            disabled={!allDependenciesCompleted}
          >
            {allDependenciesCompleted ? "Complete" : "Dependencies not met"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

// Helper functions - no changes needed
const getPriorityVariant = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'destructive';
    case 'normal':
      return 'default';
    case 'low':
      return 'secondary';
    case 'lowest':
      return 'outline';
    default:
      return 'default';
  }
};

const getEffortLabel = (effort: number): string => {
  switch (effort) {
    case 1: return '15min';
    case 2: return '30min';
    case 4: return 'Few hours';
    case 8: return '1 day';
    case 16: return '1 week';
    case 32: return '2 weeks';
    case 64: return '1 month+';
    default: return 'Unknown';
  }
};

export default TaskCard;
