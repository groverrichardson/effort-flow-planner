import { useState, useMemo, KeyboardEvent } from 'react';
import { Task } from '@/types';
import TaskCard from '../cards/TaskCard';
import BulkActionToolbar from '../toolbars/BulkActionToolbar';
import TaskListEmpty from '../empty/TaskListEmpty';
import { cn } from '@/lib/utils';
import { groupTasksByDate, DateGroup, TaskGroup } from '@/utils/grouping/taskGrouping';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

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
                <div 
                    className="flex flex-col gap-3 overflow-y-auto" 
                    id="task-groups-container"
                    style={{ 
                        willChange: 'transform',  /* Optimization for scroll performance */
                        contain: 'content'        /* Improves performance by isolating content */
                    }}
                >
                    {groupedTasks.map((group, index) => (
                        <div 
                            key={group.id} 
                            className={cn(
                                "task-group mb-5 relative rounded-lg overflow-hidden",
                                group.id === DateGroup.OVERDUE && "bg-red-50/25 dark:bg-red-900/10 shadow-sm border-l border-red-200 dark:border-red-800/30",
                                group.id === DateGroup.TODAY && "bg-amber-50/25 dark:bg-amber-900/10 shadow-sm border-l border-amber-200 dark:border-amber-800/30",
                                group.id !== DateGroup.OVERDUE && group.id !== DateGroup.TODAY && "bg-slate-50/25 dark:bg-slate-900/10"
                            )} 
                            data-testid={`task-group-${group.id}`}
                        >
                            {/* Date group header */}
                            <button
                                id={`task-group-header-${group.id}`}
                                className={cn(
                                    "group-header w-full py-2 px-3 font-semibold text-sm backdrop-blur-sm flex items-center focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 sticky top-0 shadow-sm transition-all duration-200 ease-in-out",
                                    group.id === DateGroup.OVERDUE && "bg-red-100/95 dark:bg-red-900/90 border-l-4 border-red-400 dark:border-red-700 text-red-800 dark:text-red-200",
                                    group.id === DateGroup.TODAY && "bg-amber-100/95 dark:bg-amber-900/90 border-l-4 border-amber-400 dark:border-amber-700 text-amber-800 dark:text-amber-200",
                                    group.id !== DateGroup.OVERDUE && group.id !== DateGroup.TODAY && "bg-slate-100/95 dark:bg-slate-800/95 border-l-4 border-slate-300 dark:border-slate-600",
                                    !collapsedGroups[group.id] ? "rounded-t-md mb-2" : "rounded-md mb-0"
                                )}
                                style={{ 
                                    top: `${index * 2}px`,
                                    zIndex: `${100 - index}` /* Ensures proper stacking with first header on top */
                                }}
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
                                <span className={cn(
                                    "flex-grow text-left",
                                    group.id === DateGroup.OVERDUE ? "text-red-800 dark:text-red-300" : 
                                    group.id === DateGroup.TODAY ? "text-amber-800 dark:text-amber-300" : 
                                    "text-slate-700 dark:text-slate-200"
                                )}>
                                    {(group.id as DateGroup)}
                                </span>
                                <span className={cn(
                                    "text-xs px-2 py-1 rounded-full",
                                    group.id === DateGroup.OVERDUE && "bg-red-200 dark:bg-red-800/50 text-red-800 dark:text-red-200",
                                    group.id === DateGroup.TODAY && "bg-amber-200 dark:bg-amber-800/50 text-amber-800 dark:text-amber-200",
                                    group.id !== DateGroup.OVERDUE && group.id !== DateGroup.TODAY && "bg-slate-200 dark:bg-slate-700"
                                )}>
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
