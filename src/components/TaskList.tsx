import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { Task } from '@/types';
import { useTaskFiltering } from '@/hooks/useTaskFiltering';
import TaskListControls from './headers/TaskListControls';
import TaskListContent from './list/TaskListContent';
import BulkActionToolbar from './toolbars/BulkActionToolbar';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/components/ui/use-toast';

interface TaskListProps {
    onTaskItemClick: (task: Task) => void;
    filteredTasks: Task[];
    isBulkEditing: boolean; // Added from Index
    onToggleBulkEdit: () => void; // Added from Index
    viewingCompleted: boolean; // Added: to be passed to TaskListContent
    showTodaysTasks: boolean; // Added: to be passed to TaskListContent
}

const TaskList = ({
    onTaskItemClick,
    filteredTasks: initialFilteredTasks,
    isBulkEditing,
    onToggleBulkEdit,
    viewingCompleted,
    showTodaysTasks,
}: TaskListProps) => {
    const {
        tasks,
        completeTask,
        archiveTask,
        deleteTask,
        getTodaysCompletedTasks,
    } = useTaskContext(); // Use archiveTask (for soft delete) and deleteTask (for hard delete)
    // const [visibleTasks, setVisibleTasks] = useState<Task[]>([]); // No longer needed, use initialFilteredTasks directly
    // const [isBulkEditing, setIsBulkEditing] = useState(false); // Removed, now from props
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
    // const [searchTerm, setSearchTerm] = useState(''); // Removed, search handled in Index.tsx
    const isMobile = useIsMobile();

    // initialFilteredTasks is now the source of truth for visible tasks passed from Index.tsx
    // It already incorporates all filters including search term.

    // Get all unique tags from tasks, memoized for stability
    const allTags = useMemo(() => {
        return tasks.reduce((acc, task) => {
            task.tags.forEach((tag) => {
                if (!acc.some((t) => t.id === tag.id)) {
                    acc.push(tag);
                }
            });
            return acc;
        }, [] as { id: string; name: string }[]);
    }, [tasks]);

    // Get all unique people from tasks, memoized for stability
    const allPeople = useMemo(() => {
        return tasks.reduce((acc, task) => {
            task.people.forEach((person) => {
                if (!acc.some((p) => p.id === person.id)) {
                    acc.push(person);
                }
            });
            return acc;
        }, [] as { id: string; name: string }[]);
    }, [tasks]);

    // const handleToggleBulkEdit = () => { // Removed, now handled by onToggleBulkEdit from props (via Index.tsx)
    //     // Logic to clear selectedTaskIds when exiting bulk edit mode needs to be handled in Index.tsx or via a new prop
    // };

    // Effect to clear selected tasks when isBulkEditing (from props) turns false
    useEffect(() => {
        if (!isBulkEditing) {
            setSelectedTaskIds([]);
        }
    }, [isBulkEditing]);

    const handleToggleSelectTask = (taskId: string) => {
        setSelectedTaskIds((prevSelectedIds) => {
            if (prevSelectedIds.includes(taskId)) {
                return prevSelectedIds.filter((id) => id !== taskId);
            } else {
                return [...prevSelectedIds, taskId];
            }
        });
    };

    const handleArchiveSelectedTasks = () => {
        if (selectedTaskIds.length === 0) return;
        // setVisibleTasks removed - UI will update via prop changes from Index.tsx
        selectedTaskIds.forEach((id) => archiveTask(id)); // Use context's archiveTask
        toast({
            title: `${selectedTaskIds.length} task(s) archived`,
        });
        setSelectedTaskIds([]);
    };

    const handleMarkSelectedComplete = () => {
        if (selectedTaskIds.length === 0) return;
        // setVisibleTasks removed - UI will update via prop changes from Index.tsx
        selectedTaskIds.forEach((id) => completeTask(id));
        toast({
            title: `${selectedTaskIds.length} task(s) marked as complete`,
        });
        setSelectedTaskIds([]);
    };

    const handleDeleteSelectedTasksPermanently = () => {
        if (selectedTaskIds.length === 0) return;
        // setVisibleTasks removed - UI will update via prop changes from Index.tsx
        selectedTaskIds.forEach((id) => deleteTask(id)); // Use context's deleteTask (hard delete)
        toast({
            title: `${selectedTaskIds.length} task(s) permanently deleted`,
            variant: 'destructive',
        });
        setSelectedTaskIds([]);
    };

    // Optimistic task removal for better UX
    const handleCompleteTask = useCallback(
        (taskId: string) => {
            // setVisibleTasks removed - UI will update via prop changes from Index.tsx
            // Then call the actual completion function
            completeTask(taskId);
        },
        [completeTask]
    );

    // Handle task deletion with optimistic UI update
    const handleArchiveTask = useCallback(
        (taskId: string) => {
            // setVisibleTasks removed - UI will update via prop changes from Index.tsx
            // Then call the actual archive function
            archiveTask(taskId); // Use context's archiveTask
        },
        [archiveTask]
    );

    return (
        <div className="mt-6 space-y-6 bg-white dark:bg-slate-800 p-4 rounded-lg">
            {/* TaskListControls removed from here, now handled in Index.tsx */}

            <TaskListContent
                tasks={initialFilteredTasks} // Use prop directly
                viewingCompleted={viewingCompleted} // Pass directly
                showTodaysTasks={showTodaysTasks} // Pass directly
                onTaskClick={onTaskItemClick}
                onCompleteTask={handleCompleteTask}
                onArchiveTask={handleArchiveTask}
                isBulkEditing={isBulkEditing}
                selectedTaskIds={selectedTaskIds}
                onToggleSelectTask={handleToggleSelectTask}
                selectedTaskCount={selectedTaskIds.length}
                onMarkSelectedComplete={handleMarkSelectedComplete}
                onArchiveSelected={handleArchiveSelectedTasks} // Renamed prop
                onDeleteSelectedPermanently={
                    handleDeleteSelectedTasksPermanently
                } // New prop for hard delete
            />
        </div>
    );
};

export default TaskList;
