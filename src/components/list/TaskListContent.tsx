import { Task, Priority } from '@/types';
import TaskCard from '../cards/TaskCard';
import TaskListEmpty from '../empty/TaskListEmpty';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import BulkActionToolbar from '../toolbars/BulkActionToolbar';

interface TaskListContentProps {
    tasks: Task[];
    viewingCompleted: boolean;
    showTodaysTasks: boolean;
    onTaskClick: (task: Task) => void;
    onCompleteTask: (taskId: string) => void;
    onArchiveTask: (taskId: string) => void; // Renamed for clarity
    isBulkEditing?: boolean;
    selectedTaskIds?: string[];
    onToggleSelectTask?: (taskId: string) => void;
    className?: string;
    selectedTaskCount?: number;
    onMarkSelectedComplete?: () => void;
    onArchiveSelected?: () => void; // Renamed from onDeleteSelected
    onDeleteSelectedPermanently?: () => void;
}

const TaskListContent = ({
    tasks,
    viewingCompleted,
    showTodaysTasks,
    onTaskClick,
    onCompleteTask,
    onArchiveTask, // Renamed for clarity
    isBulkEditing,
    selectedTaskIds,
    onToggleSelectTask,
    className,
    selectedTaskCount,
    onMarkSelectedComplete,
    onArchiveSelected, // Renamed
    onDeleteSelectedPermanently, // Added
}: TaskListContentProps) => {
    const handleComplete = (task: Task) => {
        onCompleteTask(task.id);
        toast({
            title: 'Task completed',
            description: `"${task.title}" marked as completed`,
        });
    };

    return (
        <div className={cn("space-y-2", className)}>
            {isBulkEditing && onMarkSelectedComplete && onArchiveSelected && onDeleteSelectedPermanently && (
                <BulkActionToolbar
                    selectedTaskCount={selectedTaskCount || 0}
                    onMarkSelectedComplete={onMarkSelectedComplete}
                    onArchiveSelected={onArchiveSelected}
                    onDeleteSelectedPermanently={onDeleteSelectedPermanently}
                />
            )}
            {tasks.length > 0 ? (
                <div className="flex flex-col gap-0">
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            viewingCompleted={viewingCompleted}
                            onClick={onTaskClick}
                            onComplete={handleComplete}
                            isBulkEditing={isBulkEditing}
                            isSelected={selectedTaskIds?.includes(task.id)}
                            onToggleSelectTask={onToggleSelectTask}
                        />
                    ))}
                </div>
            ) : (
                <TaskListEmpty
                    viewingCompleted={viewingCompleted}
                    showTodaysTasks={showTodaysTasks}
                />
            )}
        </div>
    );
};

export default TaskListContent;
