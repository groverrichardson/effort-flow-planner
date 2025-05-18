
import React from 'react';
import { DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

interface PriorityFilterItemsProps {
  selectedPriorities: string[];
  onTogglePriority: (priority: string) => void;
}

export const PriorityFilterItems: React.FC<PriorityFilterItemsProps> = ({
  selectedPriorities,
  onTogglePriority
}) => {
  if (!onTogglePriority) return null;
  
  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
      <DropdownMenuSeparator />
      
      <DropdownMenuCheckboxItem
        checked={selectedPriorities.includes('high')}
        onCheckedChange={() => onTogglePriority('high')}
      >
        High
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem
        checked={selectedPriorities.includes('normal')}
        onCheckedChange={() => onTogglePriority('normal')}
      >
        Normal
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem
        checked={selectedPriorities.includes('low')}
        onCheckedChange={() => onTogglePriority('low')}
      >
        Low
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem
        checked={selectedPriorities.includes('lowest')}
        onCheckedChange={() => onTogglePriority('lowest')}
      >
        Lowest
      </DropdownMenuCheckboxItem>
    </>
  );
};
