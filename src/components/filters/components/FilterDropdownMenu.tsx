
import React, { useState } from 'react';
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
import { TagFilterItems } from './TagFilterItems';
import { PeopleFilterItems } from './PeopleFilterItems';
import { PriorityFilterItems } from './PriorityFilterItems';
import { DueDateFilterItems } from './DueDateFilterItems';
import { GoLiveFilterItem } from './GoLiveFilterItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Priority } from '@/types';

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
  tags: { id: string; name: string; color?: string }[];
  people: { id: string; name: string }[];
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  return (
    <DropdownMenu open={filtersOpen} onOpenChange={setFiltersOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
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
              onToggleTag={(tagId) => {
                onToggleTag(tagId);
                setFiltersOpen(true);
              }}
            />

            <DropdownMenuSeparator />
            <DropdownMenuLabel>Filter by People</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <PeopleFilterItems
              people={people}
              selectedPeople={selectedPeople}
              onTogglePerson={(personId) => {
                onTogglePerson(personId);
                setFiltersOpen(true);
              }}
            />

            <PriorityFilterItems 
              selectedPriorities={selectedPriorities}
              onTogglePriority={(priority) => {
                onTogglePriority(priority);
                setFiltersOpen(true);
              }}
            />

            <DueDateFilterItems
              filterByDueDate={filterByDueDate}
              onSetFilterByDueDate={(value) => {
                onSetFilterByDueDate(value);
                setFiltersOpen(true);
              }}
            />

            <GoLiveFilterItem
              filterByGoLive={filterByGoLive}
              onSetFilterByGoLive={(value) => {
                onSetFilterByGoLive(value);
                setFiltersOpen(true);
              }}
            />
            
            {onToggleShowCompleted && (
              <div className="px-2 py-1.5">
                <Button
                  onClick={() => {
                    onToggleShowCompleted();
                    setFiltersOpen(false);
                  }}
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
              onResetFilters={() => {
                onResetFilters();
                setFiltersOpen(false);
              }}
            />
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
