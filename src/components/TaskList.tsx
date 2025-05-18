
import { useState, useEffect, useCallback } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { Task } from '@/types';
import { useTaskFiltering } from '@/hooks/useTaskFiltering';
import TaskListControls from './headers/TaskListControls';
import TaskListContent from './list/TaskListContent';
import TaskDialogs from './dialogs/TaskDialogs';
import { useIsMobile } from '@/hooks/use-mobile';

const TaskList = () => {
  const { tasks, completeTask, getTodaysCompletedTasks } = useTaskContext();
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [visibleTasks, setVisibleTasks] = useState<Task[]>([]);
  const isMobile = useIsMobile();
  
  const {
    viewingCompleted,
    showTodaysTasks,
    selectedPriorities,
    selectedTags,
    selectedPeople,
    filterByDueDate,
    filterByGoLive,
    activeTasks,
    todaysTasks,
    filteredTasks,
    handleTogglePriority,
    handleToggleTag,
    handleTogglePerson,
    setFilterByDueDate,
    setFilterByGoLive,
    clearAllFilters,
    handleShowAllActive,
    handleShowToday,
    handleShowCompleted
  } = useTaskFiltering({ tasks, getTodaysCompletedTasks });

  // Memoize the filtered tasks to prevent unnecessary re-renders
  useEffect(() => {
    setVisibleTasks(filteredTasks);
  }, [filteredTasks]);

  // Get all unique tags from tasks
  const allTags = tasks.reduce((allTags, task) => {
    task.tags.forEach(tag => {
      if (!allTags.some(t => t.id === tag.id)) {
        allTags.push(tag);
      }
    });
    return allTags;
  }, [] as { id: string; name: string }[]);

  // Get all unique people from tasks
  const allPeople = tasks.reduce((allPeople, task) => {
    task.people.forEach(person => {
      if (!allPeople.some(p => p.id === person.id)) {
        allPeople.push(person);
      }
    });
    return allPeople;
  }, [] as { id: string; name: string }[]);

  const handleTaskClick = (task: Task) => {
    // Go directly to edit mode when clicking on a task
    setEditTask(task);
  };

  const handleCloseEdit = () => {
    setEditTask(null);
  };

  // Optimistic task removal for better UX
  const handleCompleteTask = useCallback((taskId: string) => {
    // Immediately remove the task from the visible list
    setVisibleTasks(currentTasks => currentTasks.filter(t => t.id !== taskId));
    // Then call the actual completion function
    completeTask(taskId);
  }, [completeTask]);

  // Make filter props available for both mobile menu and desktop view
  const filterProps = {
    selectedTags,
    selectedPeople,
    selectedPriorities,
    filterByDueDate,
    filterByGoLive,
    onToggleTag: handleToggleTag,
    onTogglePerson: handleTogglePerson,
    onTogglePriority: handleTogglePriority,
    onSetFilterByDueDate: setFilterByDueDate,
    onSetFilterByGoLive: setFilterByGoLive,
    onResetFilters: clearAllFilters,
    viewingCompleted,
    showTodaysTasks,
    onShowAllActive: handleShowAllActive,
    onShowToday: handleShowToday,
    onShowCompleted: handleShowCompleted
  };

  return (
    <div className="space-y-6">
      {!isMobile && (
        <TaskListControls 
          viewingCompleted={viewingCompleted}
          showTodaysTasks={showTodaysTasks}
          todaysCount={todaysTasks.length}
          completedCount={getTodaysCompletedTasks().length}
          selectedTags={selectedTags}
          selectedPeople={selectedPeople}
          selectedPriorities={selectedPriorities}
          filterByDueDate={filterByDueDate}
          filterByGoLive={filterByGoLive}
          onShowAllActive={handleShowAllActive}
          onShowToday={handleShowToday}
          onShowCompleted={handleShowCompleted}
          onToggleTag={handleToggleTag}
          onTogglePerson={handleTogglePerson}
          onTogglePriority={handleTogglePriority}
          onSetFilterByDueDate={setFilterByDueDate}
          onSetFilterByGoLive={setFilterByGoLive}
          onResetFilters={clearAllFilters}
          tags={allTags}
          people={allPeople}
          filterProps={filterProps}
        />
      )}

      <TaskListContent 
        tasks={visibleTasks}
        viewingCompleted={viewingCompleted}
        showTodaysTasks={showTodaysTasks}
        onTaskClick={handleTaskClick}
        onCompleteTask={handleCompleteTask}
      />

      <TaskDialogs 
        editTask={editTask}
        onCloseEdit={handleCloseEdit}
      />
    </div>
  );
};

export default TaskList;
