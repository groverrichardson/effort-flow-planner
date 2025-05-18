
import React from 'react';
import { Button } from '@/components/ui/button';
import { FilterX } from 'lucide-react';

interface FilterResetButtonProps {
  onResetFilters: () => void;
}

export const FilterResetButton: React.FC<FilterResetButtonProps> = ({
  onResetFilters
}) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onResetFilters}
      className="w-full flex gap-1 items-center justify-center"
    >
      <FilterX size={14} />
      Reset Filters
    </Button>
  );
};
