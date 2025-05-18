
import React from 'react';
import { Button } from '@/components/ui/button';
import { Priority } from '@/types';

interface ActiveFilterPillsProps {
  selectedTags: string[];
  selectedPeople: string[];
  selectedPriorities: Priority[];
  filterByDueDate: string;
  filterByGoLive: boolean;
  onToggleTag: (tagId: string) => void;
  onTogglePerson: (personId: string) => void;
  onTogglePriority: (priority: Priority) => void;
  onSetFilterByDueDate?: (value: string) => void;
  onSetFilterByGoLive?: (value: boolean) => void;
  tags: { id: string; name: string }[];
  people: { id: string; name: string }[];
}

export const ActiveFilterPills: React.FC<ActiveFilterPillsProps> = ({
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
  tags,
  people
}) => {
  return (
    <>
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

      {selectedPriorities.length > 0 && (
        selectedPriorities.map((priority) => (
          <Button
            key={priority}
            variant="secondary"
            size="sm"
            onClick={() => onTogglePriority(priority)}
            className="gap-1"
          >
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
            <span className="text-xs">×</span>
          </Button>
        ))
      )}

      {filterByDueDate !== 'all' && onSetFilterByDueDate && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onSetFilterByDueDate('all')}
          className="gap-1"
        >
          {filterByDueDate === 'today' ? 'Due Today' : 
           filterByDueDate === 'week' ? 'Due This Week' : 
           filterByDueDate === 'overdue' ? 'Overdue' : filterByDueDate}
          <span className="text-xs">×</span>
        </Button>
      )}

      {filterByGoLive && onSetFilterByGoLive && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onSetFilterByGoLive(false)}
          className="gap-1"
        >
          Has Go-Live Date
          <span className="text-xs">×</span>
        </Button>
      )}
    </>
  );
};
