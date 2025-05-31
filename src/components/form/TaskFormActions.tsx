import { Button } from '@/components/ui/button';
import { Trash, Archive } from 'lucide-react'; // Added Archive

interface TaskFormActionsProps {
    isEditing: boolean;
    onCancel?: () => void;
    onArchive?: () => void; // Renamed from onDelete
    onDelete?: () => void; // For hard deletion
}

const TaskFormActions = ({
    isEditing,
    onCancel,
    onArchive,
    onDelete,
}: TaskFormActionsProps) => {
    return isEditing ? (
        <div className="flex justify-between pt-2 border-t">
            <div className="flex gap-2">
                {onDelete && (
                    <Button
                        variant="destructive"
                        size="sm"
                        type="button"
                        onClick={onDelete}
                        id="task-form-delete-button">
                        <Trash size={16} className="mr-1" />
                        Delete
                    </Button>
                )}
                {onArchive && (
                    <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={onArchive}
                        id="task-form-archive-button">
                        <Archive size={16} className="mr-1" />
                        Archive
                    </Button>
                )}
            </div>

            <div className={`flex gap-2 ${!(onDelete || onArchive) ? 'ml-auto' : ''}`}>
                {onCancel && (
                    <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={onCancel}>
                        Close
                    </Button>
                )}
                <Button type="submit" size="sm">
                    Update Task
                </Button>
            </div>
        </div>
    ) : (
        <div className="flex justify-end gap-2 pt-2">
            {onCancel && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onCancel}>
                    Cancel
                </Button>
            )}
            <Button type="submit" size="sm">
                Create Task
            </Button>
        </div>
    );
};

export default TaskFormActions;
