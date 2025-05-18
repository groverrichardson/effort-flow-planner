
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

interface TaskFormActionsProps {
  isEditing: boolean;
  onCancel?: () => void;
  onDelete?: () => void;
}

const TaskFormActions = ({ isEditing, onCancel, onDelete }: TaskFormActionsProps) => {
  return isEditing ? (
    <div className="flex justify-between pt-2 border-t">
      {onDelete && (
        <Button 
          variant="destructive" 
          size="sm"
          type="button"
          onClick={onDelete}
        >
          <Trash size={16} className="mr-1" />
          Delete
        </Button>
      )}
      
      <div className={`flex gap-2 ${!onDelete ? 'ml-auto' : ''}`}>
        {onCancel && (
          <Button 
            variant="outline" 
            size="sm"
            type="button"
            onClick={onCancel}
          >
            Close
          </Button>
        )}
        <Button type="submit" size="sm">Update Task</Button>
      </div>
    </div>
  ) : (
    <div className="flex justify-end gap-2 pt-2">
      {onCancel && (
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={onCancel}
        >
          Cancel
        </Button>
      )}
      <Button type="submit" size="sm">Create Task</Button>
    </div>
  );
};

export default TaskFormActions;
