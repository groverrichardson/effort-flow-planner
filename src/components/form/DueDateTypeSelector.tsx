
import React from 'react';
import { DueDateType } from '@/types';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DueDateTypeSelectorProps {
  value: DueDateType;
  onChange: (value: DueDateType) => void;
  disabled?: boolean;
}

const DueDateTypeSelector: React.FC<DueDateTypeSelectorProps> = ({
  value = 'by',
  onChange,
  disabled = false
}) => {
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="dueDateType" className="text-xs">Due:</Label>
      <Select
        value={value}
        onValueChange={(value) => onChange(value as DueDateType)}
        disabled={disabled}
      >
        <SelectTrigger id="dueDateType" className="w-[60px] h-8 text-xs">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="on">On</SelectItem>
          <SelectItem value="by">By</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default DueDateTypeSelector;
