import { Task, Priority } from '@/types';
import TaskCard from '../cards/TaskCard';
import TaskListEmpty from '../empty/TaskListEmpty';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import BulkActionToolbar from '../toolbars/BulkActionToolbar';
import { DateGroup, groupTasksByDate, TaskGroup, formatGroupTitle } from '@/utils/grouping/taskGrouping';
import { useMemo } from 'react';

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

    // Group tasks by date
    const groupedTasks = useMemo(() => {
        return groupTasksByDate(tasks);
    }, [tasks]);

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
                <div className="flex flex-col gap-2">
                    {groupedTasks.map((group) => (
                        <div key={group.id} className="task-group mb-4" data-testid={`task-group-${group.id}`}>
                            {/* Date group header */}
                            <h2 
                                id={`task-group-header-${group.id}`}
                                className="group-header py-2 px-3 bg-slate-100 dark:bg-slate-800 font-semibold text-sm rounded-md mb-2 flex justify-between items-center border-l-4 border-slate-300 dark:border-slate-600"
                                aria-label={`${group.id} group with ${group.tasks.length} tasks`}
                            >
                                <span className="text-slate-700 dark:text-slate-200">
                                    {(group.id as DateGroup)}
                                </span>
                                <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-full">
                                    {group.tasks.length}
                                </span>
                            </h2>
                            
                            {/* Tasks in this group */}
                            <div 
                                className="group-tasks flex flex-col gap-0"
                                role="region" 
                                aria-labelledby={`task-group-header-${group.id}`}
                            >
                                {group.tasks.map((task) => (
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
                        </div>
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
