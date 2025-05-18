
import React from 'react';
import { DropdownMenuCheckboxItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

interface GoLiveFilterItemProps {
  filterByGoLive: boolean;
  onSetFilterByGoLive: (value: boolean) => void;
}

export const GoLiveFilterItem: React.FC<GoLiveFilterItemProps> = ({
  filterByGoLive,
  onSetFilterByGoLive
}) => {
  if (!onSetFilterByGoLive) return null;
  
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
