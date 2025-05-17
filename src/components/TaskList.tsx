import { useState } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { Task, Priority } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { format, isToday, isPast, isFuture, addDays, isWithinInterval } from 'date-fns';
import TaskDetail from './TaskDetail';
import TaskForm from './TaskForm';
import TaskFilters from './filters/TaskFilters';
import TaskListHeader from './headers/TaskListHeader';
import TaskCard from './cards/TaskCard';
import TaskListEmpty from './empty/TaskListEmpty';

const TaskList = () => {
  const { tasks, completeTask, getTodaysCompletedTasks } = useTaskContext();
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [viewingCompleted, setViewingCompleted] = useState(false);
  const [showTodaysTasks, setShowTodaysTasks] = useState(false);
  
  // Filter states
  const [selectedPriorities, setSelectedPriorities] = useState<Priority[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [filterByDueDate, setFilterByDueDate] = useState<string>('all');
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
    
    // Tag filter
    if (selectedTags.length > 0 && !task.tags.some(tag => selectedTags.includes(tag.id))) {
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

  const handleToggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
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
    setSelectedTags([]);
    setSelectedPeople([]);
    setFilterByDueDate('all');
    setFilterByGoLive(false);
  };

  const handleShowAllActive = () => {
    setViewingCompleted(false);
    setShowTodaysTasks(false);
  };

  const handleShowToday = () => {
    setShowTodaysTasks(true);
    setViewingCompleted(false);
  };

  const handleShowCompleted = () => {
    setViewingCompleted(true);
    setShowTodaysTasks(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with view selectors and filter button */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <TaskListHeader 
            showTodaysTasks={showTodaysTasks}
            viewingCompleted={viewingCompleted}
            todaysCount={todaysTasks.length}
            completedCount={completedTasks.length}
            onShowAllActive={handleShowAllActive}
            onShowToday={handleShowToday}
            onShowCompleted={handleShowCompleted}
          />
          
          {!viewingCompleted && (
            <TaskFilters 
              activeTasks={activeTasks}
              selectedPriorities={selectedPriorities}
              selectedTags={selectedTags}
              selectedPeople={selectedPeople}
              filterByDueDate={filterByDueDate}
              filterByGoLive={filterByGoLive}
              onTogglePriority={handleTogglePriority}
              onToggleTag={handleToggleTag}
              onTogglePerson={handleTogglePerson}
              onSetFilterByDueDate={setFilterByDueDate}
              onSetFilterByGoLive={setFilterByGoLive}
              onClearAllFilters={clearAllFilters}
            />
          )}
        </div>
      </div>

      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          <div className="space-y-4">
            {filteredTasks.map(task => (
              <TaskCard 
                key={task.id}
                task={task}
                viewingCompleted={viewingCompleted}
                onClick={handleTaskClick}
                onComplete={handleComplete}
              />
            ))}
          </div>
        ) : (
          <TaskListEmpty 
            viewingCompleted={viewingCompleted} 
            showTodaysTasks={showTodaysTasks} 
          />
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
