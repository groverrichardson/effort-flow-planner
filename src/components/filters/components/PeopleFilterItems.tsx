
import React from 'react';
import { DropdownMenuCheckboxItem, DropdownMenuLabel } from '@/components/ui/dropdown-menu';

interface PeopleFilterItemsProps {
  people: { id: string; name: string }[];
  selectedPeople: string[];
  onTogglePerson: (personId: string) => void;
}

export const PeopleFilterItems: React.FC<PeopleFilterItemsProps> = ({
  people,
  selectedPeople,
  onTogglePerson
}) => {
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
