import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Task, Priority } from '@/types';
import { isToday, isPast, isFuture, addDays, isWithinInterval } from 'date-fns';

export interface UseTaskFilteringProps {
  tasks: Task[];
  getTodaysCompletedTasks: () => Task[];
  getArchivedTasks: () => Task[]; // Added for archived tasks
  searchTerm?: string; // Added for search term
}

export const useTaskFiltering = (props: UseTaskFilteringProps) => {
  console.log('[useTaskFiltering] DEBUG: Hook received props.tasks count:', props.tasks?.length, 'props.searchTerm:', props.searchTerm);
  console.log('[useTaskFiltering] HOOK ENTRYPOINT - TOP'); // New log
  // Simplified props access for now
  const tasks = props.tasks || [];
  const getTodaysCompletedTasks = props.getTodaysCompletedTasks;
  const getArchivedTasks = props.getArchivedTasks;
  const initialSearchTermParam = typeof props.searchTerm === 'string' ? props.searchTerm : '';

  console.log(`[useTaskFiltering] HOOK EXECUTION. props.tasks count: ${tasks.length}`);
  const _archivedByProps = getArchivedTasks ? getArchivedTasks() : [];
  console.log(`[useTaskFiltering] HOOK EXECUTION. props.getArchivedTasks() count: ${_archivedByProps.length}`);
  
  const [viewingCompleted, setViewingCompleted] = useState(false);
  const [showTodaysTasks, setShowTodaysTasks] = useState(false);
  const internalUpdateRef = useRef(false);
  const [viewingArchived, setViewingArchived] = useState(false); // Added for archived tasks
  
  // Filter states
  const [selectedPriorities, setSelectedPriorities] = useState<Priority[]>([]);
  // Initialize searchTerm state directly with the processed initialSearchTermParam
  const [internalSearchTerm, setInternalSearchTerm] = useState(() => {
    const initialValue = props.searchTerm !== undefined ? props.searchTerm : '';
    console.log(`[useTaskFiltering] Initializing internalSearchTerm to: "${initialValue}" (props.searchTerm: "${props.searchTerm}")`);
    console.log('[useTaskFiltering] DEBUG: Initializing internalSearchTerm with:', initialValue);
    return initialValue;
  });

  useEffect(() => {
    if (internalUpdateRef.current) {
      // If the update was internal (from handleSetSearchTerm),
      // reset the flag and don't sync from props this time.
      internalUpdateRef.current = false;
      return;
    }

    const newSearchTerm = props.searchTerm !== undefined ? props.searchTerm : '';
    // Only update if the effective prop value has changed compared to current internal state
    // AND the update wasn't an internal one that we just handled above.
    if (newSearchTerm !== internalSearchTerm) { 
      console.log(`[useTaskFiltering] EFFECT (PROP_SYNC): props.searchTerm is now effectively "${newSearchTerm}". Updating internalSearchTerm from "${internalSearchTerm}".`);
      setInternalSearchTerm(newSearchTerm);
    }
  }, [props.searchTerm, internalSearchTerm]); // internalSearchTerm included to ensure sync if it changes independently and prop needs to re-assert

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [filterByDueDate, setFilterByDueDate] = useState<string>('all');
  const [filterByGoLive, setFilterByGoLive] = useState<boolean>(false);

  const activeTasks = useMemo(() => {
    const result = tasks.filter(task => {
      const isActive = !task.completed && !task.is_archived;
      return isActive;
    });
    return result;
  }, [tasks]);

  const completedTasks = useMemo(() => {
    return getTodaysCompletedTasks();
  }, [getTodaysCompletedTasks]);

  const archivedTasks = useMemo(() => {
    const result = getArchivedTasks ? getArchivedTasks() : [];
    console.log(`[useTaskFiltering] MEMO: archivedTasks RECOMPUTED. Count: ${result.length}, IDs: ${result.map(t=>t.id).join(', ')}`);
    return result;
  }, [getArchivedTasks]);
  
  const todaysTasks = useMemo(() => {
    return activeTasks.filter(task => {
      if (!task.dueDate && !task.goLiveDate && !task.targetDeadline) return false;
      
      return (task.dueDate && isToday(new Date(task.dueDate))) || 
             (task.goLiveDate && isToday(new Date(task.goLiveDate))) ||
             (task.targetDeadline && isToday(new Date(task.targetDeadline)));
    });
  }, [activeTasks]);
  
  const filteredTasks = useMemo(() => {
  console.log('[useTaskFiltering] DEBUG: Recalculating filteredTasks. SearchTerm:', internalSearchTerm, 'View:', viewingArchived ? 'archived' : viewingCompleted ? 'completed' : showTodaysTasks ? 'today' : 'active');

  // 1. Determine baseTasks based on current view
  let baseTasks;
  if (viewingArchived) {
    baseTasks = archivedTasks;
    console.log(`[useTaskFiltering] MEMO: filteredTasks - Using archivedTasks. Count: ${baseTasks?.length}`);
  } else if (viewingCompleted) {
    // Key change: Use all completed, non-archived tasks
    baseTasks = tasks.filter(task => task.completed && !task.is_archived);
    console.log(`[useTaskFiltering] MEMO: filteredTasks - Using ALL completed (non-archived) tasks. Count: ${baseTasks?.length}`);
  } else if (showTodaysTasks) {
    baseTasks = todaysTasks;
    console.log(`[useTaskFiltering] MEMO: filteredTasks - Using todaysTasks. Count: ${baseTasks?.length}`);
  } else { // Default to active tasks
    baseTasks = activeTasks;
    console.log(`[useTaskFiltering] MEMO: filteredTasks - Using activeTasks. Count: ${baseTasks?.length}`);
  }

  let tasksToProcess = baseTasks || []; // Ensure tasksToProcess is always an array

  // 2. Apply search term filter
  if (internalSearchTerm) {
    const lowerSearchTerm = internalSearchTerm.toLowerCase();
    if (viewingCompleted || viewingArchived) {
      const sourceTasks = viewingCompleted ? completedTasks : archivedTasks;
      console.log(`[useTaskFiltering] MEMO: filteredTasks (completed/archived branch) - Using ${viewingCompleted ? 'ALL completed (non-archived)' : 'archivedTasks'}. Count: ${sourceTasks.length}, IDs: ${sourceTasks.map(t=>t.id).join(', ')}`);
      tasksToProcess = sourceTasks.filter(task => {
        const titleMatch = task.title.toLowerCase().includes(lowerSearchTerm);
        const descriptionMatch = task.description && task.description.toLowerCase().includes(lowerSearchTerm);
        const tagMatch = Array.isArray(task.tags) && task.tags.some(tag => tag && typeof tag.name === 'string' && tag.name.toLowerCase().includes(lowerSearchTerm));
        return titleMatch || descriptionMatch || tagMatch;
      });
      console.log(`[useTaskFiltering] Tasks after search (completed/archived). Count: ${tasksToProcess.length}, IDs: ${tasksToProcess.map(t => t.id).join(', ')}`);
    } else {
      tasksToProcess = tasksToProcess.filter(task => {
        const titleMatch = task.title.toLowerCase().includes(lowerSearchTerm);
        const descriptionMatch = task.description && task.description.toLowerCase().includes(lowerSearchTerm);
        const tagMatch = Array.isArray(task.tags) && task.tags.some(tag => tag && typeof tag.name === 'string' && tag.name.toLowerCase().includes(lowerSearchTerm));
        return titleMatch || descriptionMatch || tagMatch;
      });
      console.log(`[useTaskFiltering] Tasks after search. Count: ${tasksToProcess.length}, IDs: ${tasksToProcess.map(t => t.id).join(', ')}`);
    }
  }

  // 3. If viewing completed or archived tasks, no further filters are applied after search
  if (viewingCompleted || viewingArchived) {
    console.log('[useTaskFiltering] DEBUG: Final filteredTasks (completed/archived view). Count:', tasksToProcess.length, 'IDs:', tasksToProcess.map(t=>t.id).join(', '));
    return tasksToProcess;
  }

  // 4. For active/today's tasks, apply other filters
  const finalFilteredTasks = tasksToProcess.filter(task => {
    if (selectedPriorities.length > 0 && !selectedPriorities.includes(task.priority)) return false;
    if (selectedTags.length > 0 && (!task.tags || !Array.isArray(task.tags) || !task.tags.some(tag => tag && selectedTags.includes(tag.id)))) return false;
    if (selectedPeople.length > 0 && (!task.people || !Array.isArray(task.people) || !task.people.some(person => person && selectedPeople.includes(person.id)))) return false;
    
    if (filterByDueDate !== 'all') {
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      if (!dueDate) return false;
      const todayDate = new Date(); todayDate.setHours(0, 0, 0, 0);
      if (filterByDueDate === 'past' && (isFuture(dueDate) || isToday(dueDate))) return false; // Corrected past logic
      if (filterByDueDate === 'today' && !isToday(dueDate)) return false;
      if (filterByDueDate === 'future') {
        const tomorrow = addDays(todayDate, 1);
        if (!isFuture(dueDate) || dueDate < tomorrow) return false;
      }
      if (filterByDueDate === 'next7days') {
        const sevenDaysFromNow = addDays(todayDate, 6); // end of 7th day from today
        if (!isWithinInterval(dueDate, { start: todayDate, end: sevenDaysFromNow })) return false;
      }
    }
    if (filterByGoLive && (!task.goLiveDate || !isToday(new Date(task.goLiveDate)))) return false;
    return true;
  });
  console.log('[useTaskFiltering] DEBUG: Final filteredTasks (active/today view). Count:', finalFilteredTasks.length, 'IDs:', finalFilteredTasks.map(t=>t.id).join(', '));
  return finalFilteredTasks;
}, [
  tasks, activeTasks, completedTasks, todaysTasks, archivedTasks, // Source task arrays
  viewingCompleted, showTodaysTasks, viewingArchived, // View determiners
  internalSearchTerm, selectedPriorities, selectedTags, selectedPeople, filterByDueDate, filterByGoLive // Filter states
]);

  const handleTogglePriority = useCallback((priority: Priority) => {
    setSelectedPriorities(prev => 
      prev.includes(priority)
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    );
  }, []);

  const handleToggleTag = useCallback((tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  }, []);

  const handleTogglePerson = useCallback((personId: string) => {
    setSelectedPeople(prev => 
      prev.includes(personId)
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    );
  }, []);

  const clearAllFilters = useCallback(() => {
    setSelectedPriorities([]);
    setSelectedTags([]);
    setSelectedPeople([]);
    setFilterByDueDate('all');
    setFilterByGoLive(false);
  }, []);

  const handleSetSearchTerm = useCallback((term: string) => {
    console.log(`[useTaskFiltering] handleSetSearchTerm called with: "${term}"`);
    internalUpdateRef.current = true; // Signal that this update is internal
    setInternalSearchTerm(term);
  }, []);

  const handleShowAllActive = useCallback(() => {
    setViewingCompleted(false);
    setShowTodaysTasks(false);
    setViewingArchived(false);
  }, []);

  const handleShowToday = useCallback(() => {
    if (showTodaysTasks) {
      handleShowAllActive();
    } else {
      setShowTodaysTasks(true);
      setViewingCompleted(false);
      setViewingArchived(false);
    }
  }, [showTodaysTasks, handleShowAllActive]);

  const handleShowCompleted = useCallback(() => {
    if (viewingCompleted) {
      handleShowAllActive();
    } else {
      setViewingCompleted(true);
      setShowTodaysTasks(false);
      setViewingArchived(false);
    }
  }, [viewingCompleted, handleShowAllActive]);

  const handleShowArchived = useCallback(() => {
    if (viewingArchived) {
      handleShowAllActive();
    } else {
      setViewingArchived(true);
      setViewingCompleted(false);
      setShowTodaysTasks(false); // This was missing
    }
  }, [viewingArchived, handleShowAllActive]);

  // Calculate activeFilterCount
  const activeFilterCount = useMemo(() => {
    let count = selectedPriorities.length + selectedTags.length + selectedPeople.length;
    if (filterByDueDate !== 'all') count++;
    if (filterByGoLive) count++;
    if (internalSearchTerm) count++; // Count searchTerm as an active filter
    return count;
  }, [selectedPriorities, selectedTags, selectedPeople, filterByDueDate, filterByGoLive, internalSearchTerm]);
  
  const getTaskById = useCallback((id: string) => {
    return tasks.find(task => task.id === id);
  }, [tasks]);

  // Current view determination
  const currentView = useMemo(() => {
    if (viewingArchived) return 'archived';
    if (viewingCompleted) return 'completed';
    if (showTodaysTasks) return 'today';
    return 'active';
  }, [viewingArchived, viewingCompleted, showTodaysTasks]);

  const setCurrentView = useCallback((view: 'active' | 'today' | 'completed' | 'archived') => {
    switch (view) {
      case 'active':
        handleShowAllActive();
        break;
      case 'today':
        handleShowToday();
        break;
      case 'completed':
        handleShowCompleted();
        break;
      case 'archived':
        handleShowArchived();
        break;
    }
  }, [handleShowAllActive, handleShowToday, handleShowCompleted, handleShowArchived]);


  return {
    // State values
    viewingCompleted,
    showTodaysTasks,
    viewingArchived,
    selectedPriorities,
    selectedTags,
    selectedPeople,
    filterByDueDate,
    filterByGoLive,
    activeTasks,
    completedTasks,
    todaysTasks,
    archivedTasks, // Make sure this is returned
    filteredTasks,
    searchTerm: internalSearchTerm, // Current effective search term
    propsSearchTerm: props.searchTerm, // Prop value for debugging

    // Actions
    handleTogglePriority,
    handleToggleTag,
    handleTogglePerson,
    setFilterByDueDate,
    setFilterByGoLive,
    clearAllFilters,
    handleShowAllActive,
    handleShowToday,
    handleShowCompleted,
    handleShowArchived,
    setSearchTerm: handleSetSearchTerm, // Expose the custom handler

    // Derived state
    activeFilterCount,
    archivedTasksCount: archivedTasks.length,
    getTaskById,
    currentView,
    setCurrentView,
  };
};
