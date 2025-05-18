
import { Loader2 } from 'lucide-react';

interface ImportProgressBarProps {
  progress: number;
  isImporting: boolean;
}

export const ImportProgressBar = ({ progress, isImporting }: ImportProgressBarProps) => {
  if (!isImporting) return null;
  
  return (
    <div className="space-y-2">
      <div className="w-full bg-muted rounded-full h-2.5">
        <div 
          className="bg-primary h-2.5 rounded-full" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-sm text-center">
        Importing... {Math.round(progress)}%
      </p>
    </div>
  );
};
