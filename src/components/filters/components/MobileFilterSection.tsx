
import React from 'react';
import { Button } from '@/components/ui/button';
import { FilterX, Plus } from 'lucide-react';
import { Priority } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';

import PriorityFilterItems from './PriorityFilterItems';
import TagFilterItems from './TagFilterItems';
import PeopleFilterItems from './PeopleFilterItems';
import DueDateFilterItems from './DueDateFilterItems';
import GoLiveFilterItem from './GoLiveFilterItem';

// Mobile filters component for sidebar/hamburger menu
interface MobileFiltersProps {
  selectedTags: string[];
  selectedPeople: string[];
  selectedPriorities: Priority[];
  filterByDueDate: boolean;
  filterByGoLive: boolean;
  
  onToggleTag: (tagId: string) => void;
  onTogglePerson: (personId: string) => void;
  onTogglePriority: (priority: Priority) => void;
  onSetFilterByDueDate: (value: boolean) => void;
  onSetFilterByGoLive: (value: boolean) => void;
  onResetFilters: () => void;
  
  // Filter modes
  showAllActive: boolean;
  showTodaysTasks: boolean;
  showCompleted: boolean;
  onShowAllActive?: () => void;
  onShowToday?: () => void;
  onShowCompleted?: () => void;
  onToggleShowCompleted?: () => void;
  
  // Data
  tags: { id: string; name: string; color: string }[];
  people: { id: string; name: string }[];
  hasActiveFilters: boolean;
  
  // Create task button option
  onCreateTask?: () => void;
}

export const MobileFilters: React.FC<MobileFiltersProps> = ({
  selectedTags,
  selectedPeople,
  selectedPriorities,
  filterByDueDate,
  filterByGoLive,
  onToggleTag,
  onTogglePerson,
  onTogglePriority,
  onSetFilterByDueDate,
  onSetFilterByGoLive,
  onResetFilters,
  showAllActive,
  showTodaysTasks,
  showCompleted,
  onToggleShowCompleted,
  tags,
  people,
  hasActiveFilters,
  onCreateTask
}) => {
  return (
    <div className="space-y-4 pr-1">
      {/* Active filter reset */}
      {hasActiveFilters && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={onResetFilters}
          className="w-full justify-between"
        >
          Clear all filters
          <FilterX size={14} />
        </Button>
      )}

      {/* Priority filter section */}
      <div className="space-y-1">
        <div className="text-sm font-medium">Filter by Priority</div>
        <PriorityFilterItems
          selectedPriorities={selectedPriorities}
          onTogglePriority={onTogglePriority}
          size="sm"
          className="flex-wrap gap-1"
          fullWidth
        />
      </div>

      {/* Tags filter section */}
      {tags.length > 0 && (
        <div className="space-y-1">
          <div className="text-sm font-medium">Filter by Tags</div>
          <ScrollArea className="h-40 rounded-md border">
            <div className="p-2">
              <TagFilterItems
                tags={tags}
                selectedTags={selectedTags}
                onToggleTag={onToggleTag}
                size="sm"
                className="flex-col space-y-1 items-start"
                fullWidth
              />
            </div>
          </ScrollArea>
        </div>
      )}

      {/* People filter section */}
      {people.length > 0 && (
        <div className="space-y-1">
          <div className="text-sm font-medium">Filter by People</div>
          <ScrollArea className="h-40 rounded-md border">
            <div className="p-2">
              <PeopleFilterItems
                people={people}
                selectedPeople={selectedPeople}
                onTogglePerson={onTogglePerson}
                size="sm"
                className="flex-col space-y-1 items-start"
                fullWidth
              />
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Date filters */}
      <div className="space-y-1">
        <div className="text-sm font-medium">Filter by Dates</div>
        <div className="space-y-2">
          <DueDateFilterItems
            filterByDueDate={filterByDueDate}
            onSetFilterByDueDate={onSetFilterByDueDate}
            size="sm"
            className="w-full"
          />
          <GoLiveFilterItem
            filterByGoLive={filterByGoLive}
            onSetFilterByGoLive={onSetFilterByGoLive}
            size="sm"
            className="w-full"
          />
        </div>
      </div>

      {/* Show completed toggle */}
      {onToggleShowCompleted && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={onToggleShowCompleted}
          className="w-full"
        >
          {showCompleted ? "Hide Completed" : "Show Completed"}
        </Button>
      )}
      
      {/* Footer section with New Task button - positioned with sign out */}
      <div className="mt-auto pt-4 border-t">
        {onCreateTask && (
          <Button 
            onClick={onCreateTask}
            className="w-full flex items-center justify-center"
          >
            <Plus size={18} className="mr-2" />
            New Task
          </Button>
        )}
      </div>
    </div>
  );
};

// Mobile header title
export const MobileFilterHeader = () => {
  return (
    <div className="px-4 py-2 border-b">
      <h2 className="text-lg font-semibold">Filters</h2>
    </div>
  );
};

export default {
  MobileFilters,
  MobileFilterHeader
};
