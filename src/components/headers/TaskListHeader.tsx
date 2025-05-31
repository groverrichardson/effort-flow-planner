import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

interface TaskListHeaderProps {
    showTodaysTasks: boolean;
    viewingCompleted: boolean;
    todaysCount: number;
    completedCount: number;
    viewingArchived: boolean; // Added
    archivedCount: number; // Added
    onShowAllActive: () => void;
    onShowToday: () => void;
    onShowCompleted: () => void;
    onShowArchived: () => void; // Added
}

const TaskListHeader = ({
    showTodaysTasks,
    viewingCompleted,
    todaysCount,
    completedCount,
    viewingArchived, // Added
    archivedCount, // Added
    onShowAllActive,
    onShowToday,
    onShowCompleted,
    onShowArchived, // Added
}: TaskListHeaderProps) => {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <Button
                variant={
                    !showTodaysTasks && !viewingCompleted
                        ? 'default'
                        : 'outline'
                }
                size="sm"
                onClick={onShowAllActive}>
                All Active
            </Button>
            <Button
                variant={viewingCompleted ? 'default' : 'outline'}
                size="sm"
                onClick={onShowCompleted}>
                Completed Today ({completedCount})
            </Button>
            <Button
                variant={viewingArchived ? 'default' : 'outline'}
                size="sm"
                onClick={onShowArchived}
                id="view-archived-tasks-button" // Unique ID
            >
                Archived ({archivedCount})
            </Button>
        </div>
    );
};

export default TaskListHeader;
