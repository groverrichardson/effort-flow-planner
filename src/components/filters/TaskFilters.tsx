import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { FilterX, Filter } from 'lucide-react';
import { Priority } from '@/types';

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
  tags: { id: string; name: string }[];
  people: { id: string; name: string }[];
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  selectedTags,
  selectedPeople,
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
  tags,
  people,
}) => {
  const hasActiveFilters = selectedTags.length > 0 || 
                         selectedPeople.length > 0 || 
                         selectedPriorities.length > 0 || 
                         filterByDueDate !== 'all' || 
                         filterByGoLive;

  // Keep the dropdown open while selecting multiple items
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="mb-4">
      <div className="flex flex-wrap gap-2">
        {onToggleShowCompleted && (
          <Button
            onClick={onToggleShowCompleted}
            variant={showCompleted ? "default" : "outline"}
            size="sm"
          >
            {showCompleted ? "Hide Completed" : "Show Completed"}
          </Button>
        )}

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
          <DropdownMenuContent align="start" className="bg-background">
            <DropdownMenuLabel>Filter by Tag</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {tags.length > 0 ? (
              tags.map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag.id}
                  checked={selectedTags.includes(tag.id)}
                  onCheckedChange={() => {
                    onToggleTag(tag.id);
                    // Keep the dropdown open
                    setFiltersOpen(true);
                  }}
                >
                  {tag.name}
                </DropdownMenuCheckboxItem>
              ))
            ) : (
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                No tags available
              </DropdownMenuLabel>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuLabel>Filter by People</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {people.length > 0 ? (
              people.map((person) => (
                <DropdownMenuCheckboxItem
                  key={person.id}
                  checked={selectedPeople.includes(person.id)}
                  onCheckedChange={() => {
                    onTogglePerson(person.id);
                    // Keep the dropdown open
                    setFiltersOpen(true);
                  }}
                >
                  {person.name}
                </DropdownMenuCheckboxItem>
              ))
            ) : (
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                No people available
              </DropdownMenuLabel>
            )}

            {onTogglePriority && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={selectedPriorities.includes('high')}
                  onCheckedChange={() => {
                    onTogglePriority('high');
                    // Keep the dropdown open
                    setFiltersOpen(true);
                  }}
                >
                  High
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedPriorities.includes('normal')}
                  onCheckedChange={() => {
                    onTogglePriority('normal');
                    // Keep the dropdown open
                    setFiltersOpen(true);
                  }}
                >
                  Normal
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedPriorities.includes('low')}
                  onCheckedChange={() => {
                    onTogglePriority('low');
                    // Keep the dropdown open
                    setFiltersOpen(true);
                  }}
                >
                  Low
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedPriorities.includes('lowest')}
                  onCheckedChange={() => {
                    onTogglePriority('lowest');
                    // Keep the dropdown open
                    setFiltersOpen(true);
                  }}
                >
                  Lowest
                </DropdownMenuCheckboxItem>
              </>
            )}

            {onSetFilterByDueDate && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Due Date</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={filterByDueDate === 'all'}
                  onCheckedChange={() => {
                    onSetFilterByDueDate('all');
                    // Keep the dropdown open
                    setFiltersOpen(true);
                  }}
                >
                  All Dates
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterByDueDate === 'today'}
                  onCheckedChange={() => {
                    onSetFilterByDueDate('today');
                    // Keep the dropdown open
                    setFiltersOpen(true);
                  }}
                >
                  Due Today
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterByDueDate === 'week'}
                  onCheckedChange={() => {
                    onSetFilterByDueDate('week');
                    // Keep the dropdown open
                    setFiltersOpen(true);
                  }}
                >
                  Due This Week
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterByDueDate === 'overdue'}
                  onCheckedChange={() => {
                    onSetFilterByDueDate('overdue');
                    // Keep the dropdown open
                    setFiltersOpen(true);
                  }}
                >
                  Overdue
                </DropdownMenuCheckboxItem>
              </>
            )}

            {onSetFilterByGoLive && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={filterByGoLive}
                  onCheckedChange={() => {
                    onSetFilterByGoLive(!filterByGoLive);
                    // Keep the dropdown open
                    setFiltersOpen(true);
                  }}
                >
                  Has Go-Live Date
                </DropdownMenuCheckboxItem>
              </>
            )}

            {hasActiveFilters && (
              <>
                <DropdownMenuSeparator />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onResetFilters();
                    // Close the dropdown after resetting filters
                    setFiltersOpen(false);
                  }}
                  className="w-full flex gap-1 items-center justify-center"
                >
                  <FilterX size={14} />
                  Reset Filters
                </Button>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {selectedTags.length > 0 &&
          tags
            .filter((tag) => selectedTags.includes(tag.id))
            .map((tag) => (
              <Button
                key={tag.id}
                variant="secondary"
                size="sm"
                onClick={() => onToggleTag(tag.id)}
                className="gap-1"
              >
                {tag.name}
                <span className="text-xs">×</span>
              </Button>
            ))}

        {selectedPeople.length > 0 &&
          people
            .filter((person) => selectedPeople.includes(person.id))
            .map((person) => (
              <Button
                key={person.id}
                variant="secondary"
                size="sm"
                onClick={() => onTogglePerson(person.id)}
                className="gap-1"
              >
                {person.name}
                <span className="text-xs">×</span>
              </Button>
            ))}

        {selectedPriorities && selectedPriorities.length > 0 && (
          selectedPriorities.map((priority) => (
            <Button
              key={priority}
              variant="secondary"
              size="sm"
              onClick={() => onTogglePriority && onTogglePriority(priority)}
              className="gap-1"
            >
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
              <span className="text-xs">×</span>
            </Button>
          ))
        )}

        {filterByDueDate && filterByDueDate !== 'all' && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onSetFilterByDueDate && onSetFilterByDueDate('all')}
            className="gap-1"
          >
            {filterByDueDate === 'today' ? 'Due Today' : 
             filterByDueDate === 'week' ? 'Due This Week' : 
             filterByDueDate === 'overdue' ? 'Overdue' : filterByDueDate}
            <span className="text-xs">×</span>
          </Button>
        )}

        {filterByGoLive && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onSetFilterByGoLive && onSetFilterByGoLive(false)}
            className="gap-1"
          >
            Has Go-Live Date
            <span className="text-xs">×</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default TaskFilters;
