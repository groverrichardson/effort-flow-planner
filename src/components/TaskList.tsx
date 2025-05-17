
import { useState } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { Task, Priority, EffortLevel } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { format, isToday, isPast, isFuture, addDays, isWithinInterval } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import TaskDetail from './TaskDetail';
import TaskForm from './TaskForm';
import { toast } from '@/components/ui/use-toast';
import { Check, Filter, Calendar } from 'lucide-react';

const TaskList = () => {
  const { tasks, completeTask, getTodaysCompletedTasks } = useTaskContext();
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [viewingCompleted, setViewingCompleted] = useState(false);
  const [showTodaysTasks, setShowTodaysTasks] = useState(false);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  
  // Filter states
  const [selectedPriorities, setSelectedPriorities] = useState<Priority[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [filterByDueDate, setFilterByDueDate] = useState<string>('all'); // 'all', 'today', 'week', 'overdue'
  const [filterByGoLive, setFilterByGoLive] = useState<boolean>(false);
  
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = getTodaysCompletedTasks();
  
  // Get today's tasks (due today or with today as go-live)
  const todaysTasks = activeTasks.filter(task => {
    if (!task.dueDate && !task.goLiveDate && !task.targetDeadline) return false;
    
    return (task.dueDate && isToday(new Date(task.dueDate))) || 
           (task.goLiveDate && isToday(new Date(task.goLiveDate))) ||
           (task.targetDeadline && isToday(new Date(task.targetDeadline)));
  });
  
  // Base display tasks on view mode
  let displayTasks = viewingCompleted ? completedTasks : 
                     showTodaysTasks ? todaysTasks : activeTasks;

  // Apply filters to display tasks
  const filteredTasks = displayTasks.filter(task => {
    // Skip filtering for completed tasks view
    if (viewingCompleted) return true;
    
    // Priority filter
    if (selectedPriorities.length > 0 && !selectedPriorities.includes(task.priority)) {
      return false;
    }
    
    // Group filter
    if (selectedGroups.length > 0 && !task.groups.some(group => selectedGroups.includes(group.id))) {
      return false;
    }
    
    // People filter
    if (selectedPeople.length > 0 && !task.people.some(person => selectedPeople.includes(person.id))) {
      return false;
    }
    
    // Due date filter
    if (filterByDueDate !== 'all' && task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (filterByDueDate === 'today' && !isToday(dueDate)) {
        return false;
      }
      
      if (filterByDueDate === 'week' && !isWithinInterval(dueDate, {
        start: today,
        end: addDays(today, 7)
      })) {
        return false;
      }
      
      if (filterByDueDate === 'overdue' && !isPast(dueDate)) {
        return false;
      }
    }
    
    // Go-live date filter
    if (filterByGoLive && !task.goLiveDate) {
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

  const handleTogglePerson = (personId: string) => {
    setSelectedPeople(prev => 
      prev.includes(personId)
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
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

  const clearAllFilters = () => {
    setSelectedPriorities([]);
    setSelectedGroups([]);
    setSelectedPeople([]);
    setFilterByDueDate('all');
    setFilterByGoLive(false);
    setFilterMenuOpen(false);
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
      
      const isPastDue = dueDate < today;
      const isDueToday = isToday(dueDate);
      
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

  // Check if any filters are active
  const hasActiveFilters = selectedPriorities.length > 0 || 
                          selectedGroups.length > 0 || 
                          selectedPeople.length > 0 || 
                          filterByDueDate !== 'all' ||
                          filterByGoLive;

  return (
    <div className="space-y-6">
      {/* Header with view selectors and filter button */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant={!showTodaysTasks && !viewingCompleted ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setViewingCompleted(false);
                setShowTodaysTasks(false);
              }}
            >
              All Active
            </Button>
            <Button
              variant={showTodaysTasks ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setShowTodaysTasks(true);
                setViewingCompleted(false);
              }}
              className="flex items-center gap-1"
            >
              <Calendar size={16} />
              Due Today ({todaysTasks.length})
            </Button>
            <Button
              variant={viewingCompleted ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setViewingCompleted(true);
                setShowTodaysTasks(false);
              }}
            >
              Completed Today ({completedTasks.length})
            </Button>
          </div>
          
          {!viewingCompleted && (
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
                      onClick={clearAllFilters}
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
                          onClick={() => handleTogglePriority(priority)}
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
                          onClick={() => setFilterByDueDate(option.value)}
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
                        onCheckedChange={() => setFilterByGoLive(!filterByGoLive)}
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
                              onCheckedChange={() => handleToggleGroup(group.id)}
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
                              onCheckedChange={() => handleTogglePerson(person.id)}
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
          )}
        </div>

        {hasActiveFilters && !viewingCompleted && (
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
                  onClick={() => handleTogglePriority(priority)}
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
                  onClick={() => setFilterByDueDate('all')}
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
                  onClick={() => setFilterByGoLive(false)}
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
                    onClick={() => handleToggleGroup(groupId)}
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
                    onClick={() => handleTogglePerson(personId)}
                  >
                    <X size={10} />
                  </button>
                </Badge>
              ) : null;
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs h-6"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
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
                : showTodaysTasks
                ? "No tasks due today"
                : "No tasks found matching your filters"}
            </p>
          </div>
        )}
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
