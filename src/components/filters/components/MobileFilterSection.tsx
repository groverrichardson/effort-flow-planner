
import React from 'react';
import { Button } from '@/components/ui/button';
import { FilterX, Plus } from 'lucide-react';
import { Priority, Tag, Person } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';

import { PriorityFilterItems } from './PriorityFilterItems';
import { TagFilterItems } from './TagFilterItems';
import { PeopleFilterItems } from './PeopleFilterItems';
import { DueDateFilterItems } from './DueDateFilterItems';
import { GoLiveFilterItem } from './GoLiveFilterItem';

// Mobile filters component for sidebar/hamburger menu
interface MobileFiltersProps {
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
  
  // Filter modes
  viewingCompleted?: boolean;
  showTodaysTasks?: boolean;
  showAllActive?: boolean;
  onShowAllActive?: () => void;
  onShowToday?: () => void;
  onShowCompleted?: () => void;
  onToggleShowCompleted?: () => void;
  
  // Data
  tags: Tag[];
  people: Person[];
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
  viewingCompleted,
  onToggleShowCompleted,
  onShowAllActive,
  onShowToday,
  onShowCompleted,
  tags,
  people,
  hasActiveFilters,
  onCreateTask
}) => {
  return (
    <div className="space-y-3 pr-1 flex flex-col h-full">
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
        <div className="text-xs font-medium">Priority</div>
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
          <div className="text-xs font-medium">Tags</div>
          <ScrollArea className="h-28 rounded-md border">
            <div className="p-1">
              <TagFilterItems
                tags={tags}
                selectedTags={selectedTags}
                onToggleTag={onToggleTag}
                size="sm"
                className="flex-col space-y-1 items-start"
                fullWidth
                compact={true}
              />
            </div>
          </ScrollArea>
        </div>
      )}

      {/* People filter section */}
      {people.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-medium">People</div>
          <ScrollArea className="h-28 rounded-md border">
            <div className="p-1">
              <PeopleFilterItems
                people={people}
                selectedPeople={selectedPeople}
                onTogglePerson={onTogglePerson}
                size="sm"
                className="flex-col space-y-1 items-start"
                fullWidth
                compact={true}
              />
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Date filters */}
      <div className="space-y-1">
        <div className="text-xs font-medium">Dates</div>
        <div className="space-y-1">
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
          className="w-full text-xs"
        >
          {viewingCompleted ? "Hide Completed" : "Show Completed"}
        </Button>
      )}
      
      {/* Push the button to the bottom with flex-grow */}
      <div className="flex-grow"></div>
      
      {/* Footer section with New Task button */}
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
  );
};

export default MobileFilters;
