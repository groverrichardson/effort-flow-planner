import { useState, useEffect } from 'react';
import { Task } from '@/types';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import TaskForm from '../TaskForm';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/components/ui/use-toast';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface TaskDialogsProps {
    editTask: Task | null;
    onCloseEdit: () => void;
    onDeleteTask: (taskId: string) => void;
    onOpenCreateNoteDialog?: (taskId: string) => void; // To handle opening note creation from task
}

const TaskDialogs = ({
    editTask,
    onCloseEdit,
    onDeleteTask,
    onOpenCreateNoteDialog, // Destructure new prop
}: TaskDialogsProps) => {
    // Keep a local reference to the task being edited to prevent stale data
    const [currentEditTask, setCurrentEditTask] = useState<Task | null>(null);
    const isMobile = useIsMobile();

    // Update the local task reference whenever editTask changes
    useEffect(() => {
        if (editTask) {
            setCurrentEditTask({ ...editTask });
        } else {
            setCurrentEditTask(null);
        }
    }, [editTask]);

    const handleDelete = () => {
        if (currentEditTask) {
            // Delete the task first
            onDeleteTask(currentEditTask.id);

            // Show a single toast message
            toast({
                title: 'Task deleted',
                description: `"${currentEditTask.title}" has been removed`,
            });

            // Close the dialog
            onCloseEdit();
        }
    };

    return (
        <>
            <Dialog
                open={!!editTask}
                onOpenChange={(open) => !open && onCloseEdit()}>
                <DialogContent className="w-[95vw] max-w-2xl h-[90vh] max-h-[95vh] p-0 flex flex-col">
                        <DialogTitle className="sr-only">Edit Task Details</DialogTitle>
                        <VisuallyHidden>
                            <DialogDescription>
                                Modify the details of your task below.
                            </DialogDescription>
                        </VisuallyHidden>
                    <div className="flex-grow flex flex-col overflow-y-auto p-6">
                        {currentEditTask && (
                            <TaskForm
                                task={currentEditTask}
                                onSubmit={async () => onCloseEdit()}
                                onCancel={onCloseEdit}
                                onDelete={handleDelete}
                                onOpenCreateNoteDialogForTask={onOpenCreateNoteDialog} // Pass it to TaskForm
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default TaskDialogs;
