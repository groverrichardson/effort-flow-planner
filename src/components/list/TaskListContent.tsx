
import { Task, Priority } from '@/types';
import TaskCard from '../cards/TaskCard';
import TaskListEmpty from '../empty/TaskListEmpty';
import { toast } from '@/components/ui/use-toast';

interface TaskListContentProps {
  tasks: Task[];
  viewingCompleted: boolean;
  showTodaysTasks: boolean;
  onTaskClick: (task: Task) => void;
  onCompleteTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

const TaskListContent = ({ 
  tasks, 
  viewingCompleted,
  showTodaysTasks,
  onTaskClick,
  onCompleteTask,
  onDeleteTask
}: TaskListContentProps) => {
  const handleComplete = (task: Task) => {
    onCompleteTask(task.id);
    toast({ 
      title: "Task completed", 
      description: `"${task.title}" marked as completed` 
    });
  };

  return (
    <div className="space-y-4">
      {tasks.length > 0 ? (
        <div className="space-y-4">
          {tasks.map(task => (
            <TaskCard 
              key={task.id}
              task={task}
              viewingCompleted={viewingCompleted}
              onClick={onTaskClick}
              onComplete={handleComplete}
              onDelete={onDeleteTask}
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
