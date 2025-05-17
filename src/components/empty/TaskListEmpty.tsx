
interface TaskListEmptyProps {
  viewingCompleted: boolean;
  showTodaysTasks: boolean;
}

const TaskListEmpty = ({ viewingCompleted, showTodaysTasks }: TaskListEmptyProps) => {
  let message = "No tasks found matching your filters";
  
  if (viewingCompleted) {
    message = "No tasks completed today";
  } else if (showTodaysTasks) {
    message = "No tasks due today";
  }

  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
};

export default TaskListEmpty;
