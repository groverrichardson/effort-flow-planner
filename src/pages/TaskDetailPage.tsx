import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTaskContext } from '@/context/TaskContext';
import TaskDetail from '@/components/TaskDetail';
import TaskForm from '@/components/TaskForm'; // Import TaskForm
import { Task } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/components/ui/use-toast'; // For delete confirmation

const TaskDetailPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { tasks, loading, updateTask, archiveTask, deleteTask } = useTaskContext(); // Destructure both archiveTask and deleteTask
  const [task, setTask] = useState<Task | null>(null);


  useEffect(() => {
    if (!loading && taskId) { // Ensure tasks are loaded before trying to find one
      const foundTask = tasks.find(t => t.id === taskId);
      if (foundTask) {
        setTask(foundTask);
      } else {
        console.error(`Task with ID ${taskId} not found.`);
        // Optionally navigate to a 404 page or show a more prominent 'not found' message
        // For now, the component will render "Task not found." if task remains null
      }
    }
  }, [taskId, tasks, loading, navigate]);


    const handleSaveTask = async (taskDataToSave: Task | Partial<Task>) => {
    if (!updateTask || !taskId) {
      toast({ title: 'Error', description: 'Cannot update task. Context not available.', variant: 'destructive' });
      return;
    }

    // Ensure we have the full task object if it's an update
    // For new tasks, TaskForm would pass a Partial<Task> which addTask would handle
    // For this page, we are always updating an existing task.
    const fullTaskData = { ...task, ...taskDataToSave } as Task;

    try {
        await updateTask(fullTaskData); // TaskForm no longer calls this
        // The toast notification is now handled by TaskContext.tsx based on the actual outcome.

        // Update local state immediately for responsiveness and navigate from context after successful save
      if (!loading) {
        const updatedTaskFromContext = tasks.find(t => t.id === taskId);
        if (updatedTaskFromContext) {
          setTask(updatedTaskFromContext);
        }
      }
        navigate(-1); // Navigate to the previous page after successful save
    } catch (error) {
      console.error('Failed to save task:', error);
      toast({ title: 'Save Error', description: 'Could not save task. Please try again.', variant: 'destructive' });
      // Remain in edit mode
    }
  };

  const handleCancelEdit = () => {
      navigate('/'); // Navigate to the home page on cancel
    };

  const handleArchiveTask = () => {
    if (task && archiveTask) { // Use archiveTask from context
      archiveTask(task.id);
      toast({ title: 'Task Archived', description: `Task "${task.title}" has been archived.` });
      navigate(-1); // Navigate to the previous page after archive
    } else {
      toast({ title: 'Error', description: 'Could not archive task.', variant: 'destructive' });
    }
  };

  const handleDeleteTaskPermanently = () => {
    if (task && deleteTask) { // Use deleteTask from context (hard delete)
      deleteTask(task.id);
      toast({ title: 'Task Deleted', description: `Task "${task.title}" has been permanently deleted.` });
      navigate(-1); // Navigate to the previous page after delete
    } else {
      toast({ title: 'Error', description: 'Could not permanently delete task.', variant: 'destructive' });
    }
  };

  // Placeholder for opening note creation dialog
  const handleOpenCreateNoteDialog = (taskId: string) => {
    console.log('Attempting to open create note dialog for task ID (from TaskDetailPage):', taskId);
    // This would typically involve setting some state to open a dialog, 
    // or navigating to a note creation page with the taskId.
    // For now, we can navigate to the generic new note page, 
    // or a task-specific one if you have that route.
    // Example: navigate(`/tasks/${taskId}/notes/new`);
    // Navigate to the task-specific note creation page and 'from' in state
    navigate(`/tasks/${taskId}/notes/new`, { state: { from: `/tasks/${taskId}` } });
    toast({ title: 'Info', description: 'Opening note creation...' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen" id="task-detail-loading">
        <p>Loading task details...</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container mx-auto p-4" id="task-detail-not-found">
         <Button variant="outline" size="icon" onClick={() => navigate('/')} className="mb-4" aria-label="Go back to previous page" id="task-detail-back-button-not-found">
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-2xl font-semibold mb-4" id="task-detail-not-found-title">Task Not Found</h1>
        <p id="task-detail-not-found-message">The task you are looking for does not exist or could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4" id={`task-detail-page-${task.id}`}>
      {/* Simple Inline Header */}
      <div className="flex items-center mb-6" id={`task-detail-page-header-${task.id}`}>
        <Button variant="outline" size="icon" onClick={() => navigate('/')} className="mr-4" aria-label="Go back to previous page" id={`task-detail-back-button-${task.id}`}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back to previous page</span>
        </Button>
        <h1 className="text-2xl font-semibold" id={`task-detail-title-${task.id}`}>{task.title || 'Task Detail'}</h1>
      </div>

      <div className="mt-4" id={`task-detail-content-${task.id}`}>
        {task ? (
          <TaskForm
            task={task} // Task to edit
            onSubmit={handleSaveTask}
            onCancel={handleCancelEdit}
            onArchive={handleArchiveTask}
            onDelete={handleDeleteTaskPermanently}
            onOpenCreateNoteDialogForTask={handleOpenCreateNoteDialog}
          />
        ) : (
          <p id="task-detail-no-task-for-form">Task data is not available to display the form.</p> // Should ideally not happen if !task guard above works
        )}
      </div>
    </div>
  );
};

export default TaskDetailPage;
