
import React from 'react';
import { DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

interface DueDateFilterItemsProps {
  filterByDueDate: string;
  onSetFilterByDueDate: (value: string) => void;
}

export const DueDateFilterItems: React.FC<DueDateFilterItemsProps> = ({
  filterByDueDate,
  onSetFilterByDueDate
}) => {
  if (!onSetFilterByDueDate) return null;
  
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
