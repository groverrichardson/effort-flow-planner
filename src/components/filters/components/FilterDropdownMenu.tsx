
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

interface FilterDropdownMenuProps {
  selectedTags: string[];
  selectedPeople: string[];
  selectedPriorities: string[];
  filterByDueDate: string;
  filterByGoLive: boolean;
  onToggleTag: (tagId: string) => void;
  onTogglePerson: (personId: string) => void;
  onTogglePriority: (priority: string) => void;
  onSetFilterByDueDate: (value: string) => void;
  onSetFilterByGoLive: (value: boolean) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  tags: { id: string; name: string }[];
  people: { id: string; name: string }[];
  showCompleted?: boolean;
  onToggleShowCompleted?: () => void;
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
  onToggleShowCompleted
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
      <DropdownMenuContent align="start" className="bg-background max-h-[70vh]">
        <ScrollArea className="max-h-[60vh]">
          {onToggleShowCompleted && (
            <>
              <DropdownMenuLabel>View Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2 pb-2">
                <Button
                  onClick={onToggleShowCompleted}
                  variant={showCompleted ? "default" : "outline"}
                  size="sm"
                  className="w-full justify-start"
                >
                  {showCompleted ? "Hide Completed" : "Show Completed"}
                </Button>
              </div>
              <DropdownMenuSeparator />
            </>
          )}
        
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
