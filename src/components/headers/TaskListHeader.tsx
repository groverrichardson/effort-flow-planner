
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface TaskListHeaderProps {
  showTodaysTasks: boolean;
  viewingCompleted: boolean;
  todaysCount: number;
  completedCount: number;
  onShowAllActive: () => void;
  onShowToday: () => void;
  onShowCompleted: () => void;
}

const TaskListHeader = ({
  showTodaysTasks,
  viewingCompleted,
  todaysCount,
  completedCount,
  onShowAllActive,
  onShowToday,
  onShowCompleted
}: TaskListHeaderProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-2">
      <Button
        variant={!showTodaysTasks && !viewingCompleted ? "default" : "outline"}
        size="sm"
        onClick={onShowAllActive}
      >
        All Active
      </Button>
      <Button
        variant={showTodaysTasks ? "default" : "outline"}
        size="sm"
        onClick={onShowToday}
        className="flex items-center gap-1"
      >
        <Calendar size={16} />
        Due Today ({todaysCount})
      </Button>
      <Button
        variant={viewingCompleted ? "default" : "outline"}
        size="sm"
        onClick={onShowCompleted}
      >
        Completed Today ({completedCount})
      </Button>
    </div>
  );
};

export default TaskListHeader;
