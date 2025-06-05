import { Task, Priority } from '@/types';
import TaskCard from '../cards/TaskCard';
import TaskListEmpty from '../empty/TaskListEmpty';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import BulkActionToolbar from '../toolbars/BulkActionToolbar';
import { DateGroup, groupTasksByDate, TaskGroup } from '@/utils/grouping/taskGrouping';
import { useMemo, useState, KeyboardEvent } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

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
    // State to track collapsed groups
    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
    const handleComplete = (task: Task) => {
        onCompleteTask(task.id);
        toast({
            title: 'Task completed',
            description: `"${task.title}" marked as completed`,
        });
    };
    
    // Toggle group collapse state
    const toggleGroupCollapse = (groupId: string) => {
        setCollapsedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    };
    
    // Handle keyboard events for accessibility
    const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, groupId: string) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleGroupCollapse(groupId);
        }
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
                            <button
                                id={`task-group-header-${group.id}`}
                                className="group-header w-full py-2 px-3 bg-slate-100 dark:bg-slate-800 font-semibold text-sm rounded-md mb-2 flex items-center border-l-4 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500"
                                onClick={() => toggleGroupCollapse(group.id)}
                                onKeyDown={(e) => handleKeyDown(e, group.id)}
                                aria-expanded={!collapsedGroups[group.id]}
                                aria-controls={`task-group-content-${group.id}`}
                                aria-label={`${group.id} group with ${group.tasks.length} tasks. ${collapsedGroups[group.id] ? 'Currently collapsed. Click to expand.' : 'Currently expanded. Click to collapse.'}`}
                            >
                                {collapsedGroups[group.id] ? (
                                    <ChevronRight className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                                )}
                                <span className="text-slate-700 dark:text-slate-200 flex-grow text-left">
                                    {(group.id as DateGroup)}
                                </span>
                                <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-full">
                                    {group.tasks.length}
                                </span>
                            </button>
                            
                            {/* Tasks in this group */}
                            <div 
                                id={`task-group-content-${group.id}`}
                                className={cn(
                                    "group-tasks flex flex-col gap-0",
                                    collapsedGroups[group.id] ? "hidden" : "block"
                                )}
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
