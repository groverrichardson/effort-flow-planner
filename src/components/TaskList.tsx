
import { useState } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { Task } from '@/types';
import { useTaskFiltering } from '@/hooks/useTaskFiltering';
import TaskListControls from './headers/TaskListControls';
import TaskListContent from './list/TaskListContent';
import TaskDialogs from './dialogs/TaskDialogs';

const TaskList = () => {
  const { tasks, completeTask, getTodaysCompletedTasks } = useTaskContext();
  // We're not using detailTask anymore since we go directly to edit mode
  const [editTask, setEditTask] = useState<Task | null>(null);
  
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
    onResetFilters: clearAllFilters
  };

  return (
    <div className="space-y-6">
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

      <TaskListContent 
        tasks={filteredTasks}
        viewingCompleted={viewingCompleted}
        showTodaysTasks={showTodaysTasks}
        onTaskClick={handleTaskClick}
        onCompleteTask={completeTask}
      />

      <TaskDialogs 
        editTask={editTask}
        onCloseEdit={handleCloseEdit}
      />
    </div>
  );
};

export default TaskList;
