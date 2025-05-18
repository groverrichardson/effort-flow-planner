
import { Priority, Tag, Person } from '@/types';
import TaskFilters from '../filters/TaskFilters';
import TaskListHeader from './TaskListHeader';
import { useIsMobile } from '@/hooks/use-mobile';

interface FilterProps {
  selectedTags: string[];
  selectedPeople: string[];
  selectedPriorities: Priority[];
  filterByDueDate: string;
  filterByGoLive: boolean;
  onToggleTag: (tagId: string) => void;
  onTogglePerson: (personId: string) => void;
  onTogglePriority: (priority: Priority) => void;
  onSetFilterByDueDate: (value: string) => void;
  onSetFilterByGoLive: (value: boolean) => void;
  onResetFilters: () => void;
}

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
  tags: Tag[];
  people: Person[];
  filterProps?: FilterProps;
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
  people,
  filterProps
}: TaskListControlsProps) => {
  const isMobile = useIsMobile();
  
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
        
        {/* Only show filters in desktop view, mobile view filters are in the hamburger menu */}
        {!viewingCompleted && !isMobile && (
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
