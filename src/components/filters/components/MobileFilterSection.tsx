
import React from 'react';
import { Button } from '@/components/ui/button';
import { FilterX } from 'lucide-react';
import { Priority } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MobileFilterSectionProps {
  title: string;
  children: React.ReactNode;
}

const MobileFilterSection: React.FC<MobileFilterSectionProps> = ({ title, children }) => {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-medium text-muted-foreground">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {children}
      </div>
    </div>
  );
};

interface MobileFiltersProps {
  selectedTags: string[];
  selectedPeople: string[];
  selectedPriorities: Priority[];
  filterByDueDate: string;
  filterByGoLive: boolean;
  showCompleted: boolean;
  onToggleTag: (tagId: string) => void;
  onTogglePerson: (personId: string) => void;
  onTogglePriority: (priority: Priority) => void;
  onSetFilterByDueDate: (value: string) => void;
  onSetFilterByGoLive: (value: boolean) => void;
  onResetFilters: () => void;
  onToggleShowCompleted?: () => void;
  tags: { id: string; name: string }[];
  people: { id: string; name: string }[];
  hasActiveFilters: boolean;
  
  // New view options
  viewingCompleted?: boolean;
  showTodaysTasks?: boolean;
  onShowAllActive?: () => void;
  onShowToday?: () => void;
  onShowCompleted?: () => void;
}

export const MobileFilters: React.FC<MobileFiltersProps> = ({
  selectedTags,
  selectedPeople,
  selectedPriorities,
  filterByDueDate,
  filterByGoLive,
  showCompleted,
  onToggleTag,
  onTogglePerson,
  onTogglePriority,
  onSetFilterByDueDate,
  onSetFilterByGoLive,
  onResetFilters,
  onToggleShowCompleted,
  tags,
  people,
  hasActiveFilters,
  
  // New view options
  viewingCompleted = false,
  showTodaysTasks = false,
  onShowAllActive,
  onShowToday,
  onShowCompleted
}) => {
  return (
    <ScrollArea className="max-h-[70vh] pr-4">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">Filters</h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-8 px-2 text-xs"
            >
              <FilterX size={14} className="mr-1" />
              Reset
            </Button>
          )}
        </div>

        {/* View Options Section */}
        <MobileFilterSection title="View Options">
          {onShowAllActive && (
            <Button
              onClick={onShowAllActive}
              variant={!showTodaysTasks && !viewingCompleted ? "default" : "outline"}
              size="sm"
              className="text-xs px-2 py-0 h-7"
            >
              All Active Tasks
            </Button>
          )}
          
          {onShowToday && (
            <Button
              onClick={onShowToday}
              variant={showTodaysTasks ? "default" : "outline"}
              size="sm"
              className="text-xs px-2 py-0 h-7"
            >
              Due Today
            </Button>
          )}
          
          {onShowCompleted && (
            <Button
              onClick={onShowCompleted}
              variant={viewingCompleted ? "default" : "outline"}
              size="sm"
              className="text-xs px-2 py-0 h-7"
            >
              Completed Today
            </Button>
          )}
          
          {onToggleShowCompleted && (
            <Button
              onClick={onToggleShowCompleted}
              variant={showCompleted ? "default" : "outline"}
              size="sm"
              className="text-xs px-2 py-0 h-7"
            >
              {showCompleted ? "Hide Completed" : "Show Completed"}
            </Button>
          )}
        </MobileFilterSection>

        <MobileFilterSection title="Filter by Priority">
          {['high', 'normal', 'low', 'lowest'].map((priority) => (
            <Button
              key={priority}
              size="sm"
              variant={selectedPriorities.includes(priority as Priority) ? "secondary" : "outline"}
              onClick={() => onTogglePriority(priority as Priority)}
              className="text-xs px-2 py-0 h-7"
            >
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Button>
          ))}
        </MobileFilterSection>

        <MobileFilterSection title="Filter by Due Date">
          {[
            { id: 'all', label: 'All Dates' },
            { id: 'today', label: 'Due Today' },
            { id: 'week', label: 'This Week' },
            { id: 'overdue', label: 'Overdue' }
          ].map((option) => (
            <Button
              key={option.id}
              size="sm"
              variant={filterByDueDate === option.id ? "secondary" : "outline"}
              onClick={() => onSetFilterByDueDate(option.id)}
              className="text-xs px-2 py-0 h-7"
            >
              {option.label}
            </Button>
          ))}
        </MobileFilterSection>

        <Button
          size="sm"
          variant={filterByGoLive ? "secondary" : "outline"}
          onClick={() => onSetFilterByGoLive(!filterByGoLive)}
          className="text-xs"
        >
          Has Go-Live Date
        </Button>

        {tags.length > 0 && (
          <MobileFilterSection title="Filter by Tag">
            {tags.map((tag) => (
              <Button
                key={tag.id}
                size="sm"
                variant={selectedTags.includes(tag.id) ? "secondary" : "outline"}
                onClick={() => onToggleTag(tag.id)}
                className="text-xs px-2 py-0 h-7"
              >
                {tag.name}
              </Button>
            ))}
          </MobileFilterSection>
        )}

        {people.length > 0 && (
          <MobileFilterSection title="Filter by Person">
            {people.map((person) => (
              <Button
                key={person.id}
                size="sm"
                variant={selectedPeople.includes(person.id) ? "secondary" : "outline"}
                onClick={() => onTogglePerson(person.id)}
                className="text-xs px-2 py-0 h-7"
              >
                {person.name}
              </Button>
            ))}
          </MobileFilterSection>
        )}
      </div>
    </ScrollArea>
  );
};
