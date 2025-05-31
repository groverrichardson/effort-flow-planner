
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Filter } from 'lucide-react';
import { FilterResetButton } from './FilterResetButton';
import TagFilterItems from './TagFilterItems';
import { PeopleFilterItems } from './PeopleFilterItems';
import { PriorityFilterItems } from './PriorityFilterItems';
import { DueDateFilterItems } from './DueDateFilterItems';
import { GoLiveFilterItem } from './GoLiveFilterItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Priority, Tag, Person } from '@/types';

interface FilterDropdownMenuProps {
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
  hasActiveFilters: boolean;
  tags: Tag[];
  people: Person[];
  showCompleted?: boolean;
  onToggleShowCompleted?: () => void;
  onShowAllActive?: () => void;
  onShowToday?: () => void;
  onShowCompleted?: () => void;
  showTodaysTasks?: boolean;
  viewingCompleted?: boolean;
}

export const FilterDropdownMenu: React.FC<FilterDropdownMenuProps> = ({
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
  hasActiveFilters,
  tags,
  people,
  showCompleted,
  onToggleShowCompleted,
  onShowAllActive,
  onShowToday,
  onShowCompleted,
  showTodaysTasks,
  viewingCompleted
}) => {
  const handleToggleTag = useCallback((tagId: string) => {
    onToggleTag(tagId);
  }, [onToggleTag]);

  const handleTogglePerson = useCallback((personId: string) => {
    onTogglePerson(personId);
  }, [onTogglePerson]);

  const handleTogglePriority = useCallback((priority: Priority) => {
    onTogglePriority(priority);
  }, [onTogglePriority]);

  const handleSetFilterByDueDate = useCallback((value: string) => {
    onSetFilterByDueDate(value);
  }, [onSetFilterByDueDate]);

  const handleSetFilterByGoLive = useCallback((value: boolean) => {
    onSetFilterByGoLive(value);
  }, [onSetFilterByGoLive]);

  const handleToggleShowCompletedClick = useCallback(() => {
    if (onToggleShowCompleted) {
      onToggleShowCompleted();
    }
  }, [onToggleShowCompleted]);

  const handleResetFiltersClick = useCallback(() => {
    onResetFilters();
  }, [onResetFilters]);
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1 h-8"
        >
          <Filter size={14} />
          Filter Tasks
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 bg-background">
        <ScrollArea className="max-h-[70vh]">
          <div className="p-1">
            <DropdownMenuLabel>Filter by Tag</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <TagFilterItems
              tags={tags}
              selectedTags={selectedTags}
              onToggleTag={handleToggleTag}
            />

            <DropdownMenuSeparator />
            <DropdownMenuLabel>Filter by People</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <PeopleFilterItems
              people={people}
              selectedPeople={selectedPeople}
              onTogglePerson={handleTogglePerson}
            />

            <PriorityFilterItems 
              selectedPriorities={selectedPriorities}
              onTogglePriority={handleTogglePriority}
            />

            <DueDateFilterItems
              filterByDueDate={filterByDueDate}
              onSetFilterByDueDate={handleSetFilterByDueDate}
            />

            <GoLiveFilterItem
              filterByGoLive={filterByGoLive}
              onSetFilterByGoLive={handleSetFilterByGoLive}
            />
            
            {onToggleShowCompleted && (
              <div className="px-2 py-1.5">
                <Button
                  onClick={handleToggleShowCompletedClick}
                  variant={showCompleted ? "default" : "outline"}
                  size="sm"
                  className="w-full justify-start"
                >
                  {showCompleted ? "Hide Completed" : "Show Completed"}
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>

        {hasActiveFilters && (
          <>
            <DropdownMenuSeparator />
            <FilterResetButton
              onResetFilters={handleResetFiltersClick}
            />
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
