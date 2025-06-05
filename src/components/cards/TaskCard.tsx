import { format, isToday, isPast, isYesterday } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task, Priority, EffortLevel } from '@/types';
import { Check, AlertCircle, Clock } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { determineTaskDateGroup, DateGroup } from '@/utils/grouping/taskGrouping';

interface TaskCardProps {
    task: Task;
    viewingCompleted: boolean;
    onClick: (task: Task) => void;
    onComplete: (task: Task) => void;
    isBulkEditing?: boolean;
    isSelected?: boolean;
    onToggleSelectTask?: (taskId: string) => void;
}

const TaskCard = ({
    task,
    viewingCompleted,
    onClick,
    onComplete,
    isBulkEditing,
    isSelected,
    onToggleSelectTask,
}: TaskCardProps) => {
    const renderPriorityBadge = (priority: Priority) => {
        let className = '';
        switch (priority) {
            case 'high':
                className = 'priority-high';
                break;
            case 'normal':
                className = 'priority-normal';
                break;
            case 'low':
                className = 'priority-low';
                break;
            case 'lowest':
                className = 'priority-lowest';
                break;
        }

        return (
            <span className={`priority-badge ${className}`}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </span>
        );
    };

    const renderEffortChip = (effort: EffortLevel) => {
        return <span className={`effort-chip effort-${effort}`}>{effort}</span>;
    };

    const renderDateInfo = (task: Task) => {
        if (task.dueDate) {
            const dueDate = new Date(task.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const isPastDue = dueDate < today;
            const isDueToday = isToday(dueDate);
            const isYesterdayDate = isYesterday(dueDate);

            if (isPastDue) {
                return (
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {isYesterdayDate ? 'Due yesterday' : `Past due: ${format(task.dueDate, 'MMM d')}`}
                    </span>
                );
            }

            if (isDueToday) {
                return (
                    <span className="text-xs text-orange-500 font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Due today
                    </span>
                );
            }

            return (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    Due: {format(task.dueDate, 'MMM d')}
                </span>
            );
        }

        return null;
    };

    return (
        <Card
            key={task.id}
            className="block overflow-hidden group border-0 shadow-none p-0 mb-2">
            <CardContent 
                className={cn(
                    "p-4 relative dark:group-hover:bg-slate-600 transition-colors duration-200",
                    determineTaskDateGroup(task) === DateGroup.OVERDUE ? 
                        "bg-red-50 dark:bg-slate-700/90 group-hover:bg-red-100/50" : 
                        "bg-gray-100 dark:bg-slate-700 group-hover:bg-transparent"
                )}
                id={`task-card-${task.id}`}
            >
                <div className="flex items-start gap-3">
                    {isBulkEditing && (
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={() =>
                                onToggleSelectTask?.(task.id)
                            }
                            className="mt-1 mr-3"
                        />
                    )}
                    {!isBulkEditing && !viewingCompleted && (
                        <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => onComplete(task)}
                            className="mt-1 invisible group-hover:visible"
                        />
                    )}
                    {!isBulkEditing && viewingCompleted && (
                        <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center mt-1">
                            <Check className="h-3 w-3 text-white" />
                        </div>
                    )}
                    <div
                        className={`flex-1 ${
                            !isBulkEditing ? 'cursor-pointer' : ''
                        }`}
                        onClick={
                            !isBulkEditing ? () => onClick(task) : undefined
                        }>
                        <div className="font-medium mb-1">{task.title}</div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            {renderPriorityBadge(task.priority)}
                            {renderEffortChip(task.effortLevel)}
                            {renderDateInfo(task)}
                        </div>
                        {(task.tags.length > 0 || task.people.length > 0) && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {task.tags.map((tag) => (
                                    <Badge
                                        key={tag.id}
                                        variant="outline"
                                        className="group-tag">
                                        {tag.name}
                                    </Badge>
                                ))}
                                {task.people.map((person) => (
                                    <Badge
                                        key={person.id}
                                        variant="outline"
                                        className="people-tag">
                                        {person.name}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default TaskCard;
