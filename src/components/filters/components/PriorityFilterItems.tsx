
import React, { useCallback } from 'react';
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

  const handleToggleHigh = useCallback(() => onTogglePriority('high'), [onTogglePriority]);
  const handleToggleNormal = useCallback(() => onTogglePriority('normal'), [onTogglePriority]);
  const handleToggleLow = useCallback(() => onTogglePriority('low'), [onTogglePriority]);
  const handleToggleLowest = useCallback(() => onTogglePriority('lowest'), [onTogglePriority]);
  
  // If we're rendering as buttons (for mobile)
  if (size) {
    return (
      <div className={`flex ${className || ''}`}>
        <Button
          variant={selectedPriorities.includes('high') ? "default" : "outline"}
          size={size}
          onClick={handleToggleHigh}
          className="rounded-full"
        >
          High
        </Button>
        <Button
          variant={selectedPriorities.includes('normal') ? "default" : "outline"}
          size={size}
          onClick={handleToggleNormal}
          className="rounded-full"
        >
          Normal
        </Button>
        <Button
          variant={selectedPriorities.includes('low') ? "default" : "outline"}
          size={size}
          onClick={handleToggleLow}
          className="rounded-full"
        >
          Low
        </Button>
        <Button
          variant={selectedPriorities.includes('lowest') ? "default" : "outline"}
          size={size}
          onClick={handleToggleLowest}
          className="rounded-full"
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
        onCheckedChange={handleToggleHigh}
      >
        High
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem
        checked={selectedPriorities.includes('normal')}
        onCheckedChange={handleToggleNormal}
      >
        Normal
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem
        checked={selectedPriorities.includes('low')}
        onCheckedChange={handleToggleLow}
      >
        Low
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem
        checked={selectedPriorities.includes('lowest')}
        onCheckedChange={handleToggleLowest}
      >
        Lowest
      </DropdownMenuCheckboxItem>
    </>
  );
};

export default PriorityFilterItems;
