
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CSVTask } from './types';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface TaskPreviewTableProps {
  tasks: CSVTask[];
}

export const TaskPreviewTable = ({ tasks }: TaskPreviewTableProps) => {
  const getTaskStatusIcon = (status: CSVTask['status']) => {
    switch (status) {
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">Status</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>People</TableHead>
            <TableHead>Tags</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.slice(0, 10).map((task, index) => (
            <TableRow key={index}>
              <TableCell>{getTaskStatusIcon(task.status)}</TableCell>
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell>{task.priority || 'Normal'}</TableCell>
              <TableCell>{task.dueDate || '-'}</TableCell>
              <TableCell>{task.personNames?.join(', ') || '-'}</TableCell>
              <TableCell>{task.tagNames?.join(', ') || '-'}</TableCell>
            </TableRow>
          ))}
          {tasks.length > 10 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                + {tasks.length - 10} more tasks
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
