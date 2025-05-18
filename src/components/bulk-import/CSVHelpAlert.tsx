
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileText } from 'lucide-react';

export const CSVHelpAlert = () => {
  return (
    <Alert variant="default" className="bg-muted/50">
      <FileText className="h-4 w-4" />
      <AlertTitle>CSV Format Example</AlertTitle>
      <AlertDescription className="font-mono text-xs">
        title,description,priority,dueDate,people,tags<br />
        "Call client","Discuss project timeline",high,2025-05-25,"John Smith;Jane Doe","client;important"
      </AlertDescription>
    </Alert>
  );
};
