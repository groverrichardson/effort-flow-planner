
import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

interface ScheduledDateFilterItemsProps {
  filterByScheduledDate: string;
  onSetFilterByScheduledDate: (value: string) => void;
  size?: "sm" | "default"; 
  className?: string;
  fullWidth?: boolean;
}

export const ScheduledDateFilterItems: React.FC<ScheduledDateFilterItemsProps> = ({
  filterByScheduledDate,
  onSetFilterByScheduledDate,
  size,
  className,
  fullWidth
}) => {
  if (!onSetFilterByScheduledDate) return null;

  const handleSetAll = useCallback(() => onSetFilterByScheduledDate('all'), [onSetFilterByScheduledDate]);
  const handleSetToday = useCallback(() => onSetFilterByScheduledDate('today'), [onSetFilterByScheduledDate]);
  const handleSetWeek = useCallback(() => onSetFilterByScheduledDate('week'), [onSetFilterByScheduledDate]);
  const handleSetOverdue = useCallback(() => onSetFilterByScheduledDate('overdue'), [onSetFilterByScheduledDate]);
  
  // If we're rendering the component as buttons (for mobile)
  if (size) {
    return (
      <div className={className}>
        <Button
          variant={filterByScheduledDate === 'all' ? "default" : "outline"}
          size={size}
          onClick={handleSetAll}
          className={fullWidth ? "w-full justify-between" : ""}
        >
          All Dates
        </Button>
        <Button
          variant={filterByScheduledDate === 'today' ? "default" : "outline"}
          size={size}
          onClick={handleSetToday}
          className={fullWidth ? "w-full justify-between mt-1" : ""}
        >
          Scheduled Today
        </Button>
        <Button
          variant={filterByScheduledDate === 'week' ? "default" : "outline"}
          size={size}
          onClick={handleSetWeek}
          className={fullWidth ? "w-full justify-between mt-1" : ""}
        >
          Scheduled This Week
        </Button>
        <Button
          variant={filterByScheduledDate === 'overdue' ? "default" : "outline"}
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
      <DropdownMenuLabel>Scheduled Date</DropdownMenuLabel>
      <DropdownMenuSeparator />
      
      <DropdownMenuCheckboxItem
        checked={filterByScheduledDate === 'all'}
        onCheckedChange={handleSetAll}
      >
        All Dates
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem
        checked={filterByScheduledDate === 'today'}
        onCheckedChange={handleSetToday}
      >
        Due Today
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem
        checked={filterByScheduledDate === 'week'}
        onCheckedChange={handleSetWeek}
      >
        Due This Week
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem
        checked={filterByScheduledDate === 'overdue'}
        onCheckedChange={handleSetOverdue}
      >
        Overdue
      </DropdownMenuCheckboxItem>
    </>
  );
};

export default ScheduledDateFilterItems;
