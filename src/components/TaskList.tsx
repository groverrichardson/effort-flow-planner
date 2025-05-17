
import { useState } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { Task, Priority, EffortLevel } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TaskDetail from './TaskDetail';
import TaskForm from './TaskForm';
import { toast } from '@/components/ui/use-toast';
import { Check } from 'lucide-react';

const TaskList = () => {
  const { tasks, completeTask, getTodaysCompletedTasks } = useTaskContext();
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [viewingCompleted, setViewingCompleted] = useState(false);
  const [selectedPriorities, setSelectedPriorities] = useState<Priority[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = getTodaysCompletedTasks();
  const displayTasks = viewingCompleted ? completedTasks : activeTasks;
  
  // Filter tasks based on selected filters
  const filteredTasks = displayTasks.filter(task => {
    // Priority filter
    if (selectedPriorities.length > 0 && !selectedPriorities.includes(task.priority)) {
      return false;
    }
    
    // Group filter
    if (selectedGroups.length > 0 && !task.groups.some(group => selectedGroups.includes(group.id))) {
      return false;
    }
    
    return true;
  });

  const handleTogglePriority = (priority: Priority) => {
    setSelectedPriorities(prev => 
      prev.includes(priority)
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    );
  };

  const handleToggleGroup = (groupId: string) => {
    setSelectedGroups(prev => 
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleTaskClick = (task: Task) => {
    setDetailTask(task);
  };

  const handleCloseDetail = () => {
    setDetailTask(null);
  };

  const handleEditClick = (task: Task) => {
    setDetailTask(null);
    setEditTask(task);
  };

  const handleCloseEdit = () => {
    setEditTask(null);
  };

  const handleComplete = (task: Task) => {
    completeTask(task.id);
    toast({ 
      title: "Task completed", 
      description: `"${task.title}" marked as completed` 
    });
  };

  const renderPriorityBadge = (priority: Priority) => {
    let className = '';
    switch (priority) {
      case 'high': className = 'priority-high'; break;
      case 'normal': className = 'priority-normal'; break;
      case 'low': className = 'priority-low'; break;
      case 'lowest': className = 'priority-lowest'; break;
    }
    
    return (
      <span className={`priority-badge ${className}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const renderEffortChip = (effort: EffortLevel) => {
    return (
      <span className={`effort-chip effort-${effort}`}>{effort}</span>
    );
  };

  const renderDateInfo = (task: Task) => {
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      
      const isPastDue = dueDate < today;
      const isDueToday = dueDate.getTime() === today.getTime();
      
      if (isPastDue) {
        return <span className="text-xs text-red-500">Past due: {format(task.dueDate, 'MMM d')}</span>;
      }
      
      if (isDueToday) {
        return <span className="text-xs text-orange-500">Due today</span>;
      }
      
      return <span className="text-xs text-gray-500">Due: {format(task.dueDate, 'MMM d')}</span>;
    }
    
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">
          {viewingCompleted ? 'Completed Today' : 'My Tasks'}
        </h2>
        <div className="flex gap-2 items-center">
          <Button
            variant={viewingCompleted ? "outline" : "default"}
            size="sm"
            onClick={() => setViewingCompleted(false)}
          >
            Active
          </Button>
          <Button
            variant={viewingCompleted ? "default" : "outline"}
            size="sm"
            onClick={() => setViewingCompleted(true)}
          >
            Completed Today ({completedTasks.length})
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Filter by Priority</h3>
            <div className="space-y-2">
              {(['high', 'normal', 'low', 'lowest'] as Priority[]).map(priority => (
                <div key={priority} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`priority-${priority}`}
                    checked={selectedPriorities.includes(priority)}
                    onCheckedChange={() => handleTogglePriority(priority)}
                  />
                  <label htmlFor={`priority-${priority}`} className="text-sm cursor-pointer">
                    {renderPriorityBadge(priority)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {activeTasks.some(task => task.groups.length > 0) && (
            <div>
              <h3 className="font-medium mb-3">Filter by Group/Area</h3>
              <div className="space-y-2">
                {Array.from(new Set(
                  activeTasks.flatMap(task => task.groups)
                    .map(group => ({ id: group.id, name: group.name }))
                )).map(group => (
                  <div key={group.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`group-${group.id}`}
                      checked={selectedGroups.includes(group.id)}
                      onCheckedChange={() => handleToggleGroup(group.id)}
                    />
                    <label htmlFor={`group-${group.id}`} className="text-sm cursor-pointer">
                      {group.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          {filteredTasks.length > 0 ? (
            <div className="space-y-4">
              {filteredTasks.map(task => (
                <Card key={task.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-start p-4 gap-3">
                      {!viewingCompleted && (
                        <Checkbox 
                          checked={task.completed}
                          onCheckedChange={() => handleComplete(task)}
                          className="mt-1"
                        />
                      )}
                      {viewingCompleted && (
                        <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center mt-1">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                      <div 
                        className="flex-1 cursor-pointer" 
                        onClick={() => handleTaskClick(task)}
                      >
                        <div className="font-medium mb-1">{task.title}</div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {renderPriorityBadge(task.priority)}
                          {renderEffortChip(task.effortLevel)}
                          {renderDateInfo(task)}
                        </div>
                        {(task.groups.length > 0 || task.people.length > 0) && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {task.groups.map(group => (
                              <Badge key={group.id} variant="outline" className="group-tag">
                                {group.name}
                              </Badge>
                            ))}
                            {task.people.map(person => (
                              <Badge key={person.id} variant="outline" className="people-tag">
                                {person.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {viewingCompleted
                  ? "No tasks completed today"
                  : "No tasks found matching your filters"}
              </p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!detailTask} onOpenChange={() => setDetailTask(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          {detailTask && (
            <TaskDetail 
              task={detailTask} 
              onClose={handleCloseDetail}
              onEdit={() => handleEditClick(detailTask)} 
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTask} onOpenChange={() => setEditTask(null)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editTask && (
            <TaskForm 
              task={editTask} 
              onSuccess={handleCloseEdit} 
              onCancel={handleCloseEdit} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskList;
