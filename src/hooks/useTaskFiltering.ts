
import { useState } from 'react';
import { Task, Priority } from '@/types';
import { isToday, isPast, isFuture, addDays, isWithinInterval } from 'date-fns';

export interface UseTaskFilteringProps {
  tasks: Task[];
  getTodaysCompletedTasks: () => Task[];
}

export const useTaskFiltering = ({ tasks, getTodaysCompletedTasks }: UseTaskFilteringProps) => {
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

  return {
    // State values
    viewingCompleted,
    showTodaysTasks,
    selectedPriorities,
    selectedTags,
    selectedPeople,
    filterByDueDate,
    filterByGoLive,
    activeTasks,
    completedTasks,
    todaysTasks,
    filteredTasks,
    
    // Actions
    handleTogglePriority,
    handleToggleTag,
    handleTogglePerson,
    setFilterByDueDate,
    setFilterByGoLive,
    clearAllFilters,
    handleShowAllActive,
    handleShowToday,
    handleShowCompleted
  };
};
