
import React from 'react';
import { Button } from '@/components/ui/button';
import { FilterX, Plus } from 'lucide-react';
import { Priority, Tag, Person } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';

import { PriorityFilterItems } from './PriorityFilterItems';
import { TagFilterItems } from './TagFilterItems';
import { PeopleFilterItems } from './PeopleFilterItems';
import { ScheduledDateFilterItems } from './ScheduledDateFilterItems';
import { GoLiveFilterItem } from './GoLiveFilterItem';

// Mobile filters component for sidebar/hamburger menu
export interface MobileFiltersProps {
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
  tags?: Tag[];
  people?: Person[];
  hasActiveFilters?: boolean;
  
  // Create task button option
  onCreateTask?: () => void;
  onBulkImport?: () => void;
}

export const MobileFilters: React.FC<MobileFiltersProps> = ({
  selectedTags = [],
  selectedPeople = [],
  selectedPriorities = [],
  filterByDueDate = 'all',
  filterByGoLive = false,
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
  tags = [],
  people = [],
  hasActiveFilters,
  onCreateTask,
  onBulkImport
}) => {
  // Ensure tags and people are arrays with default empty arrays
  const safeTags = Array.isArray(tags) ? tags : [];
  const safePeople = Array.isArray(people) ? people : [];
  
  // Calculate if there are active filters
  const activeFilters = hasActiveFilters !== undefined ? hasActiveFilters : 
    (selectedTags.length > 0 || selectedPeople.length > 0 || 
     selectedPriorities.length > 0 || filterByDueDate !== 'all' || filterByGoLive);
  
  return (
    <div className="space-y-4 pr-1">

      {/* Active filter reset */}
      {activeFilters && (
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
      {safeTags.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-medium">Tags</div>
          <ScrollArea className="min-h-8 rounded-md border dark:border-slate-700 max-h-28">
            <div className="p-1">
              <TagFilterItems
                tags={safeTags}
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
      {safePeople.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-medium">People</div>
          <ScrollArea className="min-h-8 rounded-md border dark:border-slate-700 max-h-28">
            <div className="p-1">
              <PeopleFilterItems
                people={safePeople}
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
          <ScheduledDateFilterItems
            filterByScheduledDate={filterByDueDate}
            onSetFilterByScheduledDate={onSetFilterByDueDate}
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
    </div>
  );
};

export default MobileFilters;
