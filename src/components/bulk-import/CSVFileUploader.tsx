
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Upload, FileText, X } from 'lucide-react';

interface CSVFileUploaderProps {
  onFileChange: (file: File) => void;
  onClearFile: () => void;
  file: File | null;
}

export const CSVFileUploader = ({ onFileChange, onClearFile, file }: CSVFileUploaderProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          id="csv-file"
          className="hidden"
        />
        <label
          htmlFor="csv-file"
          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Upload size={16} />
          Choose CSV File
        </label>
        
        {file && (
          <button
            onClick={onClearFile}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <X size={16} className="mr-1" /> Clear
          </button>
        )}
      </div>
      
      {file && (
        <div className="flex items-center gap-2 text-sm">
          <FileText size={16} />
          <span>{file.name}</span>
        </div>
      )}
    </div>
  );
};
