
import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

interface DueDateFilterItemsProps {
  filterByDueDate: string;
  onSetFilterByDueDate: (value: string) => void;
  size?: "sm" | "default"; 
  className?: string;
  fullWidth?: boolean;
}

export const DueDateFilterItems: React.FC<DueDateFilterItemsProps> = ({
  filterByDueDate,
  onSetFilterByDueDate,
  size,
  className,
  fullWidth
}) => {
  if (!onSetFilterByDueDate) return null;

  const handleSetAll = useCallback(() => onSetFilterByDueDate('all'), [onSetFilterByDueDate]);
  const handleSetToday = useCallback(() => onSetFilterByDueDate('today'), [onSetFilterByDueDate]);
  const handleSetWeek = useCallback(() => onSetFilterByDueDate('week'), [onSetFilterByDueDate]);
  const handleSetOverdue = useCallback(() => onSetFilterByDueDate('overdue'), [onSetFilterByDueDate]);
  
  // If we're rendering the component as buttons (for mobile)
  if (size) {
    return (
      <div className={className}>
        <Button
          variant={filterByDueDate === 'all' ? "default" : "outline"}
          size={size}
          onClick={handleSetAll}
          className={fullWidth ? "w-full justify-between" : ""}
        >
          All Dates
        </Button>
        <Button
          variant={filterByDueDate === 'today' ? "default" : "outline"}
          size={size}
          onClick={handleSetToday}
          className={fullWidth ? "w-full justify-between mt-1" : ""}
        >
          Due Today
        </Button>
        <Button
          variant={filterByDueDate === 'week' ? "default" : "outline"}
          size={size}
          onClick={handleSetWeek}
          className={fullWidth ? "w-full justify-between mt-1" : ""}
        >
          Due This Week
        </Button>
        <Button
          variant={filterByDueDate === 'overdue' ? "default" : "outline"}
          size={size}
          onClick={handleSetOverdue}
          className={fullWidth ? "w-full justify-between mt-1" : ""}
        >
          Overdue
        </Button>
      </div>
    );
  }
  
  // Default dropdown menu items
  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuLabel>Due Date</DropdownMenuLabel>
      <DropdownMenuSeparator />
      
      <DropdownMenuCheckboxItem
        checked={filterByDueDate === 'all'}
        onCheckedChange={handleSetAll}
      >
        All Dates
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem
        checked={filterByDueDate === 'today'}
        onCheckedChange={handleSetToday}
      >
        Due Today
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem
        checked={filterByDueDate === 'week'}
        onCheckedChange={handleSetWeek}
      >
        Due This Week
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem
        checked={filterByDueDate === 'overdue'}
        onCheckedChange={handleSetOverdue}
      >
        Overdue
      </DropdownMenuCheckboxItem>
    </>
  );
};

export default DueDateFilterItems;
