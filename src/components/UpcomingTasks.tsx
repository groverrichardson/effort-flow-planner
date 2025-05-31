import React from 'react';
import { Task } from '@/types'; // Import Task type

interface UpcomingTasksProps {
    tasks: Task[];
    onTaskClick: (task: Task) => void; // New prop
}

const UpcomingTasks: React.FC<UpcomingTasksProps> = ({
    tasks,
    onTaskClick,
}) => {
    const upcomingTasksToDisplay = tasks
        .filter((task) => !task.completed && (task.dueDate || task.goLiveDate))
        .map((task) => ({
            ...task,
            effectiveDate: task.dueDate || task.goLiveDate, // Prioritize dueDate
        }))
        .sort((a, b) => {
            // The filter ensures effectiveDate is not null here
            return (
                new Date(a.effectiveDate!).getTime() -
                new Date(b.effectiveDate!).getTime()
            );
        })
        .slice(0, 3);

    const formatDate = (date: Date | null) => {
        if (!date) return 'N/A';
        // This can be enhanced later for "Tomorrow", "Next Monday", etc.
        return new Date(date).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            // Optionally add year: year: 'numeric' if tasks can be far out
        });
    };

    return (
        <div className="mb-4 p-4 bg-white dark:bg-slate-800 rounded-lg">
            <h2 className="text-xl font-semibold mb-3 text-gray-700 dark:text-slate-200">
                Coming Up Next
            </h2>
            {upcomingTasksToDisplay.length > 0 ? (
                <ul className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {upcomingTasksToDisplay.map((task) => (
                        <li
                            key={task.id}
                            className="p-3 bg-gray-100 dark:bg-slate-700 rounded-md hover:bg-white dark:hover:bg-slate-600 hover:shadow-none transition-shadow w-full cursor-pointer"
                            onClick={() => onTaskClick(task)}>
                            <h3
                                className="font-medium text-gray-800 dark:text-slate-100 truncate"
                                title={task.title}>
                                {task.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400">
                                Due: {formatDate(task.effectiveDate)}
                            </p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 dark:text-slate-400">
                    No upcoming tasks right now.
                </p>
            )}
        </div>
    );
};

export default UpcomingTasks;
