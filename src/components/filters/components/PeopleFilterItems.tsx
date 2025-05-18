
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
}

export const PeopleFilterItems: React.FC<PeopleFilterItemsProps> = ({
  people,
  selectedPeople,
  onTogglePerson,
  size,
  className,
  fullWidth
}) => {
  // If we're rendering as buttons (for mobile)
  if (size) {
    return (
      <div className={className}>
        {people.length > 0 ? (
          people.map((person) => (
            <Button
              key={person.id}
              variant={selectedPeople.includes(person.id) ? "default" : "outline"}
              size={size}
              onClick={() => onTogglePerson(person.id)}
              className={fullWidth ? "w-full justify-between" : ""}
            >
              {person.name}
            </Button>
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
    </>
  );
};

export default PeopleFilterItems;
