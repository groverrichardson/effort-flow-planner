
import { Priority } from '@/types';
import TaskFilters from '../filters/TaskFilters';
import TaskListHeader from './TaskListHeader';

interface TaskListControlsProps {
  viewingCompleted: boolean;
  showTodaysTasks: boolean;
  todaysCount: number;
  completedCount: number;
  selectedTags: string[];
  selectedPeople: string[];
  selectedPriorities: Priority[];
  filterByDueDate: string;
  filterByGoLive: boolean;
  onShowAllActive: () => void;
  onShowToday: () => void;
  onShowCompleted: () => void;
  onToggleTag: (tagId: string) => void;
  onTogglePerson: (personId: string) => void;
  onTogglePriority: (priority: Priority) => void;
  onSetFilterByDueDate: (value: string) => void;
  onSetFilterByGoLive: (value: boolean) => void;
  onResetFilters: () => void;
  tags: { id: string; name: string }[];
  people: { id: string; name: string }[];
}

const TaskListControls = ({
  viewingCompleted,
  showTodaysTasks,
  todaysCount,
  completedCount,
  selectedTags,
  selectedPeople,
  selectedPriorities,
  filterByDueDate,
  filterByGoLive,
  onShowAllActive,
  onShowToday,
  onShowCompleted,
  onToggleTag,
  onTogglePerson,
  onTogglePriority,
  onSetFilterByDueDate,
  onSetFilterByGoLive,
  onResetFilters,
  tags,
  people
}: TaskListControlsProps) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <TaskListHeader 
          showTodaysTasks={showTodaysTasks}
          viewingCompleted={viewingCompleted}
          todaysCount={todaysCount}
          completedCount={completedCount}
          onShowAllActive={onShowAllActive}
          onShowToday={onShowToday}
          onShowCompleted={onShowCompleted}
        />
        
        {!viewingCompleted && (
          <TaskFilters 
            selectedTags={selectedTags}
            selectedPeople={selectedPeople} 
            selectedPriorities={selectedPriorities}
            filterByDueDate={filterByDueDate}
            filterByGoLive={filterByGoLive}
            onToggleTag={onToggleTag}
            onTogglePerson={onTogglePerson}
            onTogglePriority={onTogglePriority}
            onSetFilterByDueDate={onSetFilterByDueDate}
            onSetFilterByGoLive={onSetFilterByGoLive}
            onResetFilters={onResetFilters}
            tags={tags}
            people={people}
          />
        )}
      </div>
    </div>
  );
};

export default TaskListControls;
