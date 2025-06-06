import { format, isToday } from 'date-fns'; // isPast, isYesterday might be unused now
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task, Priority, EffortLevel, TaskStatus } from '@/types'; // Added TaskStatus
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
        // If task is completed, don't show scheduled/due date info.
        if (task.status === TaskStatus.COMPLETED) {
            return null;
        }

        const displayableDateSource = task.scheduledDate || task.targetDeadline;

        // If no scheduledDate or targetDeadline, don't show date info.
        if (!displayableDateSource) {
            return null;
        }

        const displayDate = new Date(displayableDateSource);
        // determineTaskDateGroup uses scheduledDate first, then targetDeadline
        const taskGroup = determineTaskDateGroup(task); 

        let dateText = '';
        let dateColorClass = 'text-gray-500'; // Default color
        let IconComponent = Clock; // Default icon

        switch (taskGroup) {
            case DateGroup.OVERDUE:
                dateText = `Scheduled: ${format(displayDate, 'MMM d')}`;
                dateColorClass = 'text-red-500 font-semibold';
                IconComponent = AlertCircle;
                break;
            case DateGroup.TODAY:
                dateText = 'Scheduled: Today';
                dateColorClass = 'text-orange-500 font-semibold';
                break;
            case DateGroup.TOMORROW:
                dateText = 'Scheduled: Tomorrow';
                dateColorClass = 'text-blue-500';
                break;
            case DateGroup.THIS_WEEK:
            case DateGroup.NEXT_WEEK:
            case DateGroup.THIS_MONTH:
            case DateGroup.FUTURE:
                dateText = `Scheduled: ${format(displayDate, 'MMM d')}`;
                break;
            case DateGroup.NO_DATE: 
            default:
                return null; // Don't render anything for these cases
        }

        return (
            <span className={`flex items-center text-xs ${dateColorClass}`}>
                <IconComponent className="mr-1 h-3 w-3" />
                {dateText}
            </span>
        );
    };

    // Determine if the task is completed to show the green checkmark
    const isTaskCompleted = task.status === TaskStatus.COMPLETED;

    return (
        <Card
            className={cn(
                'task-card group relative mb-2 rounded-lg shadow-sm transition-all duration-200 ease-in-out hover:shadow-md',
                {
                    'opacity-60 completed-task-card': viewingCompleted,
                    'border-2 border-blue-500 selected-task-card': isSelected,
                    'cursor-default': isBulkEditing, // Prevent hover effects if bulk editing
                }
            )}
            data-testid={`task-card-${task.id}`}>
            <CardContent className="p-3">
                <div className="flex items-start gap-3">
                    {isBulkEditing ? (
                        <Checkbox
                            id={`bulk-select-${task.id}`}
                            checked={isSelected}
                            onCheckedChange={() =>
                                onToggleSelectTask && onToggleSelectTask(task.id)
                            }
                            className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            aria-label={`Select task ${task.title}`}
                        />
                    ) : isTaskCompleted ? (
                        <div
                            data-testid={`completed-indicator-${task.id}`}
                            className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center mt-1">
                            <Check className="h-3 w-3 text-white" />
                        </div>
                    ) : (
                        <Checkbox
                            id={`complete-${task.id}`}
                            checked={false} // Always unchecked for non-completed tasks
                            onCheckedChange={() => {
                                onComplete(task);
                                toast({
                                    title: 'Task Completed!',
                                    description: `"${task.title}" marked as complete.`,
                                });
                            }}
                            className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            aria-label={`Complete task ${task.title}`}
                        />
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
