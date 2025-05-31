
import React from 'react';
import { Button } from '@/components/ui/button';
import { Priority, Tag, Person } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { FilterDropdownMenu } from './components/FilterDropdownMenu';
import { ActiveFilterPills } from './components/ActiveFilterPills';
import { MobileFilters } from './components/MobileFilterSection';

interface TaskFiltersProps {
  selectedTags: string[];
  selectedPeople: string[];
  selectedPriorities?: Priority[];
  filterByDueDate?: string;
  filterByGoLive?: boolean;
  onToggleTag: (tagId: string) => void;
  onTogglePerson: (personId: string) => void;
  onTogglePriority?: (priority: Priority) => void;
  onSetFilterByDueDate?: (value: string) => void;
  onSetFilterByGoLive?: (value: boolean) => void;
  onResetFilters: () => void;
  showCompleted?: boolean;
  onToggleShowCompleted?: () => void;
  tags: Tag[];
  people: Person[];
  inMobileMenu?: boolean;
  
  // Add view options
  viewingCompleted?: boolean;
  showTodaysTasks?: boolean;
  onShowAllActive?: () => void;
  onShowToday?: () => void;
  onShowCompleted?: () => void;
  
  // Add create task option for mobile
  onCreateTask?: () => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  selectedTags = [],
  selectedPeople = [],
  selectedPriorities = [],
  filterByDueDate = 'all',
  filterByGoLive = false,
  onToggleTag,
  onTogglePerson,
  onTogglePriority = () => {},
  onSetFilterByDueDate = () => {},
  onSetFilterByGoLive = () => {},
  onResetFilters,
  showCompleted = false,
  onToggleShowCompleted = () => {},
  tags = [],
  people = [],
  inMobileMenu = false,
  
  // View options
  viewingCompleted = false,
  showTodaysTasks = false,
  onShowAllActive = () => {},
  onShowToday = () => {},
  onShowCompleted = () => {},
  
  // Create task option
  onCreateTask
}) => {
  const isMobile = useIsMobile();
  const hasActiveFilters = selectedTags.length > 0 || 
                         selectedPeople.length > 0 || 
                         selectedPriorities.length > 0 || 
                         filterByDueDate !== 'all' || 
                         filterByGoLive;

  // For mobile menu, we use a different UI approach - expanded filters rather than a dropdown
  if (inMobileMenu) {
    return (
      <MobileFilters
        selectedTags={selectedTags}
        selectedPeople={selectedPeople}
        selectedPriorities={selectedPriorities}
        filterByDueDate={filterByDueDate}
        filterByGoLive={filterByGoLive}
        viewingCompleted={viewingCompleted}
        showTodaysTasks={showTodaysTasks}
        onToggleTag={onToggleTag}
        onTogglePerson={onTogglePerson}
        onTogglePriority={onTogglePriority}
        onSetFilterByDueDate={onSetFilterByDueDate}
        onSetFilterByGoLive={onSetFilterByGoLive}
        onResetFilters={onResetFilters}
        onToggleShowCompleted={onToggleShowCompleted}
        onShowAllActive={onShowAllActive}
        onShowToday={onShowToday}
        onShowCompleted={onShowCompleted}
        tags={tags || []}
        people={people || []}
        hasActiveFilters={hasActiveFilters}
        onCreateTask={onCreateTask}
      />
    );
  }

  // Default desktop implementation
  return (
    <div>
      <div className="flex flex-wrap gap-1 items-start">
        <FilterDropdownMenu
          selectedTags={selectedTags}
          selectedPeople={selectedPeople}
          selectedPriorities={selectedPriorities}
          filterByDueDate={filterByDueDate}
          filterByGoLive={filterByGoLive}
          showCompleted={showCompleted}
          onToggleTag={onToggleTag}
          onTogglePerson={onTogglePerson}
          onTogglePriority={onTogglePriority}
          onSetFilterByDueDate={onSetFilterByDueDate}
          onSetFilterByGoLive={onSetFilterByGoLive}
          onResetFilters={onResetFilters}
          onToggleShowCompleted={onToggleShowCompleted}
          hasActiveFilters={hasActiveFilters}
          tags={tags || []}
          people={people || []}
          viewingCompleted={viewingCompleted}
          showTodaysTasks={showTodaysTasks}
          onShowAllActive={onShowAllActive}
          onShowToday={onShowToday}
          onShowCompleted={onShowCompleted}
        />

        <ActiveFilterPills
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
          tags={tags || []}
          people={people || []}
        />
      </div>
    </div>
  );
};

export default TaskFilters;
