
import React, { useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenuCheckboxItem, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Person } from '@/types';

interface PeopleFilterItemsProps {
  people: Person[];
  selectedPeople: string[];
  onTogglePerson: (personId: string) => void;
  size?: "sm" | "default";
  className?: string;
  fullWidth?: boolean;
  compact?: boolean;
}

// Helper function to get initials from full name (moved to top-level)
const getInitials = (name: string): string => {
  // Improved to handle multi-word names better
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2); // Limit to 2 characters
};

// Memoized sub-component for DropdownMenuCheckboxItem
interface MemoizedPersonCheckboxItemProps {
  person: Person;
  isSelected: boolean;
  onTogglePerson: (personId: string) => void;
}

const MemoizedPersonCheckboxItem = memo<MemoizedPersonCheckboxItemProps>(({ person, isSelected, onTogglePerson }) => {
  const handleCheckedChange = useCallback(() => {
    onTogglePerson(person.id);
  }, [onTogglePerson, person.id]);

  return (
    <DropdownMenuCheckboxItem
      key={person.id}
      checked={isSelected}
      onCheckedChange={handleCheckedChange}
    >
      {person.name}
    </DropdownMenuCheckboxItem>
  );
});
MemoizedPersonCheckboxItem.displayName = 'MemoizedPersonCheckboxItem';

// Memoized sub-component for Button variant
interface MemoizedPersonButtonProps {
  person: Person;
  isSelected: boolean;
  onTogglePerson: (personId: string) => void;
  size: "sm" | "default";
  className?: string;
  fullWidth?: boolean;
  compact?: boolean;
}

const MemoizedPersonButton = memo<MemoizedPersonButtonProps>(({ person, isSelected, onTogglePerson, size, className, fullWidth, compact }) => {
  const handleClick = useCallback(() => {
    onTogglePerson(person.id);
  }, [onTogglePerson, person.id]);

  // For buttons, show initials for names longer than 10 characters or with multiple words
  const hasMultipleWords = person.name.trim().includes(' ');
  const displayName = (person.name.length > 10 || hasMultipleWords)
    ? getInitials(person.name) 
    : person.name;

  return (
    <Button
      key={person.id}
      variant={isSelected ? "default" : "outline"}
      size={compact ? "xs" : size}
      onClick={handleClick}
      className={`rounded-full ${compact ? "h-6 text-xs py-0" : ""}`.trim()}
      title={person.name} // Show full name on hover
    >
      {displayName}
    </Button>
  );
});
MemoizedPersonButton.displayName = 'MemoizedPersonButton';

export const PeopleFilterItems: React.FC<PeopleFilterItemsProps> = ({
  people = [],
  selectedPeople = [],
  onTogglePerson,
  size,
  className,
  fullWidth,
  compact = false
}) => {
  // Ensure people and selectedPeople are arrays even if undefined is passed
  const safePeopleArray = Array.isArray(people) ? people : [];
  const safeSelectedPeople = Array.isArray(selectedPeople) ? selectedPeople : [];
  
  // If we're rendering as buttons (for mobile)
  if (size) {
    return (
      <div className={className}>
        {safePeopleArray.length > 0 ? (
          safePeopleArray.map((person) => (
            <MemoizedPersonButton
              key={person.id}
              person={person}
              isSelected={safeSelectedPeople.includes(person.id)}
              onTogglePerson={onTogglePerson}
              size={size}
              className={className} // Pass own className to memoized component
              fullWidth={fullWidth}
              compact={compact}
            />
          ))
        ) : (
          <div className="text-muted-foreground text-xs">No people available</div>
        )}
      </div>
    );
  }
  
  // Default dropdown menu items
  return (
    <>
      {safePeopleArray.length > 0 ? (
        safePeopleArray.map((person) => (
          <MemoizedPersonCheckboxItem
            key={person.id}
            person={person}
            isSelected={safeSelectedPeople.includes(person.id)}
            onTogglePerson={onTogglePerson}
          />
        ))
      ) : (
        <DropdownMenuLabel className="text-muted-foreground text-xs">
          No people available
        </DropdownMenuLabel>
      )}
    </>
  );
};

export default PeopleFilterItems;
