
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { FilterX, Filter } from 'lucide-react';

interface TaskFiltersProps {
  selectedTags: string[];
  selectedPeople: string[];
  onToggleTag: (tagId: string) => void;
  onTogglePerson: (personId: string) => void;
  onResetFilters: () => void;
  showCompleted: boolean;
  onToggleShowCompleted: () => void;
  tags: { id: string; name: string }[];
  people: { id: string; name: string }[];
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  selectedTags,
  selectedPeople,
  onToggleTag,
  onTogglePerson,
  onResetFilters,
  showCompleted,
  onToggleShowCompleted,
  tags,
  people,
}) => {
  return (
    <div className="mb-4">
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={onToggleShowCompleted}
          variant={showCompleted ? "default" : "outline"}
          size="sm"
        >
          {showCompleted ? "Hide Completed" : "Show Completed"}
        </Button>

        <DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            asChild
          >
            <DropdownMenuCheckboxItem checked={false} />
            <Filter size={14} />
            Filter Tasks
          </Button>
          <DropdownMenuContent align="center">
            <DropdownMenuLabel>Filter by Tag</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {tags.length > 0 ? (
              tags.map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag.id}
                  checked={selectedTags.includes(tag.id)}
                  onCheckedChange={() => onToggleTag(tag.id)}
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
                  onCheckedChange={() => onTogglePerson(person.id)}
                >
                  {person.name}
                </DropdownMenuCheckboxItem>
              ))
            ) : (
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                No people available
              </DropdownMenuLabel>
            )}

            {(selectedTags.length > 0 || selectedPeople.length > 0) && (
              <>
                <DropdownMenuSeparator />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onResetFilters}
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
      </div>
    </div>
  );
};

export default TaskFilters;
