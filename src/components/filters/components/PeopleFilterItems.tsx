
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenuCheckboxItem, DropdownMenuLabel } from '@/components/ui/dropdown-menu';

interface PeopleFilterItemsProps {
  people: { id: string; name: string }[];
  selectedPeople: string[];
  onTogglePerson: (personId: string) => void;
  size?: "sm" | "default";
  className?: string;
  fullWidth?: boolean;
  compact?: boolean;
}

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
  
  // Helper function to get initials from full name
  const getInitials = (name: string): string => {
    // Improved to handle multi-word names better
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2); // Limit to 2 characters
  };
  
  // If we're rendering as buttons (for mobile)
  if (size) {
    return (
      <div className={`${className} flex flex-wrap gap-1`}>
        {safePeopleArray.length > 0 ? (
          safePeopleArray.map((person) => {
            // For buttons, show initials for names longer than 10 characters or with multiple words
            const hasMultipleWords = person.name.trim().includes(' ');
            const displayName = (person.name.length > 10 || hasMultipleWords)
              ? getInitials(person.name) 
              : person.name;
            
            return (
              <Button
                key={person.id}
                variant={safeSelectedPeople.includes(person.id) ? "default" : "outline"}
                size={compact ? "xs" : size}
                onClick={() => onTogglePerson(person.id)}
                className={`${fullWidth ? "justify-between" : ""} ${compact ? "h-6 text-xs py-0" : ""}`}
                title={person.name} // Show full name on hover
              >
                {displayName}
              </Button>
            );
          })
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
          <DropdownMenuCheckboxItem
            key={person.id}
            checked={safeSelectedPeople.includes(person.id)}
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
    </>
  );
};

export default PeopleFilterItems;
