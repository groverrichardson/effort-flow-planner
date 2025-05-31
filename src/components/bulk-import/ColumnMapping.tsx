
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface ColumnMappingProps {
  headers: string[];
  previewRows: string[][];
  columnMap: Record<string, string>;
  onColumnMapChange: (map: Record<string, string>) => void;
}

const FIELD_OPTIONS = [
  { value: 'ignore', label: 'Ignore' },
  { value: 'title', label: 'Title (required)' },
  { value: 'description', label: 'Description' },
  { value: 'priority', label: 'Priority' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'effortLevel', label: 'Effort Level' },
  { value: 'completed', label: 'Completed' },
  { value: 'completedDate', label: 'Completed Date' },
  { value: 'dueDateType', label: 'Due Date Type' },
  { value: 'goLiveDate', label: 'Go Live Date' },
  { value: 'targetDeadline', label: 'Target Deadline' },
  { value: 'people', label: 'People' },
  { value: 'tags', label: 'Tags' },
];

const ColumnMapping = ({ 
  headers, 
  previewRows, 
  columnMap, 
  onColumnMapChange 
}: ColumnMappingProps) => {
  
  const handleFieldChange = (header: string, value: string) => {
    const newMap = { ...columnMap };
    
    // Clear any existing mappings for this field value to avoid duplicates
    if (value && value !== 'ignore') { // Updated condition to check for 'ignore' instead of empty string
      Object.keys(newMap).forEach(key => {
        if (newMap[key] === value && key !== header) {
          newMap[key] = 'ignore'; // Changed empty string to 'ignore'
        }
      });
    }
    
    // Set the new mapping
    newMap[header] = value;
    onColumnMapChange(newMap);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Match your CSV columns to task fields. Title is required.
      </p>
      
      <div className="border rounded-md overflow-hidden max-h-[400px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>CSV Column</TableHead>
              <TableHead>Map to Field</TableHead>
              <TableHead>Preview Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {headers.map((header, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{header}</TableCell>
                <TableCell>
                  <Select 
                    value={columnMap[header] || 'ignore'} // Use 'ignore' instead of empty string
                    onValueChange={(value) => handleFieldChange(header, value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {previewRows.map((row, rowIndex) => (
                    <div key={rowIndex} className="mb-1 truncate max-w-[200px]">
                      {row[index] || '-'}
                    </div>
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ColumnMapping;
