
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenuCheckboxItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

interface GoLiveFilterItemProps {
  filterByGoLive: boolean;
  onSetFilterByGoLive: (value: boolean) => void;
  size?: "sm" | "default";
  className?: string;
  fullWidth?: boolean;
}

export const GoLiveFilterItem: React.FC<GoLiveFilterItemProps> = ({
  filterByGoLive,
  onSetFilterByGoLive,
  size,
  className,
  fullWidth
}) => {
  if (!onSetFilterByGoLive) return null;
  
  // If we're rendering the component as button (for mobile)
  if (size) {
    return (
      <div className={className}>
        <Button
          variant={filterByGoLive ? "default" : "outline"}
          size={size}
          onClick={() => onSetFilterByGoLive(!filterByGoLive)}
          className={fullWidth ? "w-full justify-between" : ""}
        >
          Has Go-Live Date {filterByGoLive ? "✓" : ""}
        </Button>
      </div>
    );
  }
  
  // Default dropdown menu item
  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuCheckboxItem
        checked={filterByGoLive}
        onCheckedChange={() => onSetFilterByGoLive(!filterByGoLive)}
      >
        Has Go-Live Date
      </DropdownMenuCheckboxItem>
    </>
  );
};

export default GoLiveFilterItem;
