
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import ColumnMapping from './ColumnMapping';
import { ParsedCSVData } from './types';

interface CSVMappingSectionProps {
  parsedData: ParsedCSVData;
  hasHeaders: boolean;
  columnMap: Record<string, string>;
  onHeaderToggle: (checked: boolean) => void;
  onColumnMapChange: (map: Record<string, string>) => void;
  onApplyMapping: () => void;
  mappingComplete: boolean;
}

export const CSVMappingSection = ({ 
  parsedData,
  hasHeaders,
  columnMap,
  onHeaderToggle,
  onColumnMapChange,
  onApplyMapping,
  mappingComplete
}: CSVMappingSectionProps) => {
  if (!parsedData || mappingComplete) return null;

  return (
    <div className="space-y-4 border p-4 rounded-md bg-muted/30">
      <div className="flex items-center space-x-2 mb-4">
        <Switch 
          id="has-headers" 
          checked={hasHeaders}
          onCheckedChange={onHeaderToggle}
        />
        <Label htmlFor="has-headers">First row contains column headers</Label>
      </div>
      
      <h3 className="text-md font-medium">Map Columns to Task Fields</h3>
      <ColumnMapping
        headers={parsedData.headers}
        previewRows={parsedData.rows.slice(0, 3)}
        columnMap={columnMap}
        onColumnMapChange={onColumnMapChange}
      />
      
      <Button 
        onClick={onApplyMapping} 
        className="w-full mt-2"
      >
        Apply Mapping
      </Button>
    </div>
  );
};
