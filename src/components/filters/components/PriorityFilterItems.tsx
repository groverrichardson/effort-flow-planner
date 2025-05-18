
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Priority } from '@/types';

interface PriorityFilterItemsProps {
  selectedPriorities: Priority[];
  onTogglePriority: (priority: Priority) => void;
  size?: "sm" | "default";
  className?: string;
  fullWidth?: boolean;
}

export const PriorityFilterItems: React.FC<PriorityFilterItemsProps> = ({
  selectedPriorities,
  onTogglePriority,
  size,
  className,
  fullWidth
}) => {
  if (!onTogglePriority) return null;
  
  // If we're rendering as buttons (for mobile)
  if (size) {
    return (
      <div className={`flex ${className || ''}`}>
        <Button
          variant={selectedPriorities.includes('high') ? "default" : "outline"}
          size={size}
          onClick={() => onTogglePriority('high')}
          className={fullWidth ? "flex-1" : ""}
        >
          High
        </Button>
        <Button
          variant={selectedPriorities.includes('normal') ? "default" : "outline"}
          size={size}
          onClick={() => onTogglePriority('normal')}
          className={fullWidth ? "flex-1 ml-1" : "ml-1"}
        >
          Normal
        </Button>
        <Button
          variant={selectedPriorities.includes('low') ? "default" : "outline"}
          size={size}
          onClick={() => onTogglePriority('low')}
          className={fullWidth ? "flex-1 ml-1" : "ml-1"}
        >
          Low
        </Button>
        <Button
          variant={selectedPriorities.includes('lowest') ? "default" : "outline"}
          size={size}
          onClick={() => onTogglePriority('lowest')}
          className={fullWidth ? "flex-1 ml-1" : "ml-1"}
        >
          Lowest
        </Button>
      </div>
    );
  }
  
  // Default dropdown menu items
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

export default PriorityFilterItems;
