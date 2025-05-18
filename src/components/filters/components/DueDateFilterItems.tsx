
import React from 'react';
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
  
  // If we're rendering the component as buttons (for mobile)
  if (size) {
    return (
      <div className={className}>
        <Button
          variant={filterByDueDate === 'all' ? "default" : "outline"}
          size={size}
          onClick={() => onSetFilterByDueDate('all')}
          className={fullWidth ? "w-full justify-between" : ""}
        >
          All Dates
        </Button>
        <Button
          variant={filterByDueDate === 'today' ? "default" : "outline"}
          size={size}
          onClick={() => onSetFilterByDueDate('today')}
          className={fullWidth ? "w-full justify-between mt-1" : ""}
        >
          Due Today
        </Button>
        <Button
          variant={filterByDueDate === 'week' ? "default" : "outline"}
          size={size}
          onClick={() => onSetFilterByDueDate('week')}
          className={fullWidth ? "w-full justify-between mt-1" : ""}
        >
          Due This Week
        </Button>
        <Button
          variant={filterByDueDate === 'overdue' ? "default" : "outline"}
          size={size}
          onClick={() => onSetFilterByDueDate('overdue')}
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
        onCheckedChange={() => onSetFilterByDueDate('all')}
      >
        All Dates
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem
        checked={filterByDueDate === 'today'}
        onCheckedChange={() => onSetFilterByDueDate('today')}
      >
        Due Today
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem
        checked={filterByDueDate === 'week'}
        onCheckedChange={() => onSetFilterByDueDate('week')}
      >
        Due This Week
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem
        checked={filterByDueDate === 'overdue'}
        onCheckedChange={() => onSetFilterByDueDate('overdue')}
      >
        Overdue
      </DropdownMenuCheckboxItem>
    </>
  );
};

export default DueDateFilterItems;
