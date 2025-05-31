
import { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Upload, FileText, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface CSVFileUploaderProps {
  onFileChange: (file: File) => void;
  onClearFile: () => void;
  file: File | null;
}

export const CSVFileUploader = ({ onFileChange, onClearFile, file }: CSVFileUploaderProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      onFileChange(acceptedFiles[0]);
    }
  }, [onFileChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4" id="csv-uploader-container">
      <div
        {...getRootProps()}
        id="csv-dropzone-area"
        className={`p-6 border-2 border-dashed rounded-md text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/70'}`}
      >
        <input {...getInputProps()} id="csv-file-dropzone-input" />
        {isDragActive ? (
          <p className="text-primary">Drop the CSV file here ...</p>
        ) : (
          <p className="text-muted-foreground">
            Drag 'n' drop a CSV file here, or click the button below to select a file.
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Existing file input, now more of a fallback / alternative */}
        <Input
          type="file"
          accept=".csv"
          onChange={handleFileChange} // Keep this for the button
          id="csv-file-button-input" // Changed ID to avoid conflict
          className="hidden"
        />
        <label
          htmlFor="csv-file-button-input"
          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Upload size={16} />
          Choose CSV File
        </label>
        
        {file && (
          <button
            onClick={onClearFile}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            id="clear-csv-file-button"
          >
            <X size={16} className="mr-1" /> Clear
          </button>
        )}
      </div>
      
      {file && (
        <div className="flex items-center gap-2 text-sm" id="selected-csv-file-display">
          <FileText size={16} />
          <span>{file.name}</span>
        </div>
      )}
    </div>
  );
};
