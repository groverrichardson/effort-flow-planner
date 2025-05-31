import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { Task, Tag, Person, Priority, EffortLevel, RecurrenceRule, TaskStatus } from '@/types';
import { TaskService } from '@/services/TaskService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';

export interface TaskContextType {
  tasks: Task[];
  tags: Tag[];
  people: Person[];
  recurrenceRules: RecurrenceRule[]; // Add recurrenceRules state
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'is_archived'>) => void;
  updateTask: (task: Task) => void;
  archiveTask: (taskId: string) => void; // Renamed from deleteTask
  deleteTask: (taskId: string) => void; // For hard deletion
  completeTask: (taskId: string) => void;
  addTag: (name: string) => Promise<Tag>;
  // updateTag: (tag: Tag) => Promise<void>; // Removed as it's not in TaskService
  deleteTag: (tagId: string) => void;
  addPerson: (name: string) => Promise<Person>;
  updatePerson: (person: Person) => void;
  deletePerson: (personId: string) => void;
  getTodaysCompletedTasks: () => Task[];
  getArchivedTasks: () => Task[]; // Added for archived tasks
  loading: boolean;
  getRecurrenceRuleById: (id: string) => RecurrenceRule | undefined;
  getTaskById: (id: string) => Task | undefined;
}

export const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [recurrenceRules, setRecurrenceRules] = useState<RecurrenceRule[]>([]); // State for recurrence rules
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load data from Supabase when user is authenticated
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        setLoading(true);
        try {
          // TODO: Implement TaskService.getRecurrenceRules() properly. Using a placeholder for now.
          const getRecurrenceRulesPlaceholder = async (): Promise<RecurrenceRule[]> => {
            console.warn('TaskService.getRecurrenceRules() is not implemented. Returning empty array.');
            return Promise.resolve([]);
          };

          const [tasksData, tagsData, peopleData, fetchedRecurrenceRulesData] = await Promise.all([
            TaskService.getTasks(true), // Fetch all tasks including archived
            TaskService.getTags(),
            TaskService.getPeople(),
            getRecurrenceRulesPlaceholder() // Using placeholder
          ]);
          
          console.log('[TaskContext] Raw tasksData from Service:', tasksData); // DEBUG
          setTasks(tasksData || []);
          console.log('[TaskContext] Raw tagsData from Service:', tagsData); // DEBUG
          setTags(tagsData || []);
          console.log('[TaskContext] Raw peopleData from Service:', peopleData); // DEBUG
          setPeople(peopleData || []);
          console.log('[TaskContext] Raw recurrenceRulesData from Service:', fetchedRecurrenceRulesData); // DEBUG
          setRecurrenceRules(fetchedRecurrenceRulesData || []);
        } catch (error) {
          console.error('Error loading data:', error);
          toast({
            title: 'Error',
            description: 'Failed to load your tasks. Please try refreshing the page.',
            variant: 'destructive'
          });
        } finally {
          setLoading(false);
        }
      } else {
        // Clear data when user is not authenticated
        setTasks([]);
        setTags([]);
        setPeople([]);
        setRecurrenceRules([]); // Clear recurrence rules
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'is_archived'>) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create tasks',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const newTask = await TaskService.createTask(taskData);
      
      if (newTask) {
        setTasks(prev => [newTask, ...prev]);
        toast({
          title: 'Success!',
          description: 'Task created successfully.',
          variant: 'default', 
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create task. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while creating the task.',
        variant: 'destructive'
      });
    }
  }, [user, setTasks]);

  const updateTask = useCallback(async (updatedTaskData: Task) => {
    if (!user) return;

    const { id, createdAt, updatedAt, userId, ...taskUpdates } = updatedTaskData;
    
    try {
      const updatedTaskResult = await TaskService.updateTask(id, taskUpdates);
      console.log('[TaskContext] updatedTaskResult from TaskService:', updatedTaskResult); // DEBUG: Inspect value
      
      if (updatedTaskResult) {
        setTasks(prev => 
          prev.map(task => 
            task.id === updatedTaskResult.id ? updatedTaskResult : task
          )
        );
        toast({
          title: 'Success!',
          description: 'Task updated successfully.',
          variant: 'default',
        });
      } else {
        // This case might occur if TaskService.updateTask returns null on failure before throwing
        // Or if the update didn't result in a modified task object being returned (though unlikely for a successful update)
        console.warn('Update task did not return a result for task ID:', id);
        toast({
          title: 'Error',
          description: 'Failed to update task. The update did not return a result.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive'
      });
    }
  }, [user, setTasks]);

  const archiveTask = useCallback(async (taskId: string) => {
    if (!user) return;
    
    try {
      // Update the task's is_archived status in the local state
      setTasks(prevTasks => {
        console.log(`[TaskContext] archiveTask - Attempting to archive task ID: ${taskId}`);
        const newTasks = prevTasks.map(task =>
          task.id === taskId
            ? { ...task, is_archived: true, status: TaskStatus.CANCELLED } // Mark as archived and set status
            : task
        );
        const updatedTask = newTasks.find(t => t.id === taskId);
        console.log(`[TaskContext] archiveTask - Task ${taskId} updated in local state:`, JSON.stringify(updatedTask));
        console.log(`[TaskContext] archiveTask - Total tasks after update: ${newTasks.length}`);
        return newTasks;
      });
      
      // Then send the archive request to the backend
      await TaskService.archiveTask(taskId);
      
      toast({
        title: 'Task Archived',
        description: 'The task has been successfully archived.',
      });
    } catch (error) {
      console.error('Error archiving task:', error);
      
      // If there's an error, refresh the tasks from the backend to restore correct state
      toast({
        title: 'Error',
        description: 'Failed to archive task.',
        variant: 'destructive'
      });
      
      // Reload the tasks to ensure UI is in sync with backend
      const tasksData = await TaskService.getTasks();
      setTasks(tasksData);
    }
  }, [user, setTasks]);

  const deleteTask = useCallback(async (taskId: string) => {
    if (!user) return;
    
    try {
      // First remove the task from the local state immediately for a responsive UI
      // Use a state update function to ensure we're working with the latest state
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      
      // Then send the delete request to the backend
      await TaskService.deleteTask(taskId);
      
      toast({
        title: 'Task Deleted',
        description: 'The task has been successfully deleted.',
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      
      // If there's an error, refresh the tasks from the backend to restore correct state
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive'
      });
      
      // Reload the tasks to ensure UI is in sync with backend
      const tasksData = await TaskService.getTasks();
      setTasks(tasksData);
    }
  }, [user, setTasks]);

  const completeTask = useCallback(async (taskId: string) => {
    if (!user) return;
    
    try {
      await TaskService.completeTask(taskId);
      
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId 
            ? { ...task, completed: true, completedDate: new Date(), updatedAt: new Date() } 
            : task
        )
      );
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete task',
        variant: 'destructive'
      });
    }
  }, [user, setTasks]);

  const addTag = useCallback(async (name: string): Promise<Tag> => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create tags',
        variant: 'destructive'
      });
      throw new Error('User not authenticated');
    }
    
    try {
      const newTag = await TaskService.createTag(name);
      
      if (newTag) {
        setTags(prev => [...prev, newTag]);
        // No need to update tasks here as new tags are not yet associated
        return newTag;
      }
      throw new Error('Failed to create tag');
    } catch (error) {
      console.error('Error adding tag:', error);
      toast({
        title: 'Error',
        description: 'Failed to create tag',
        variant: 'destructive'
      });
      throw error;
    }
  }, [user, setTags]);

  const deleteTag = useCallback(async (tagId: string) => {
    if (!user) return;
    
    try {
      await TaskService.deleteTag(tagId);
      
      setTags(prev => prev.filter(tag => tag.id !== tagId));
      
      // Remove the tag from all tasks
      setTasks(prev => 
        prev.map(task => ({
          ...task,
          tags: task.tags.filter(tag => tag.id !== tagId)
        }))
      );
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete tag',
        variant: 'destructive'
      });
    }
  }, [user, setTags, setTasks]);

  const addPerson = useCallback(async (name: string): Promise<Person> => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create people',
        variant: 'destructive'
      });
      throw new Error('User not authenticated');
    }
    
    try {
      const newPerson = await TaskService.createPerson(name);
      
      if (newPerson) {
        setPeople(prev => [...prev, newPerson]);
        return newPerson;
      }
      throw new Error('Failed to create person');
    } catch (error) {
      console.error('Error adding person:', error);
      toast({
        title: 'Error',
        description: 'Failed to create person',
        variant: 'destructive'
      });
      throw error;
    }
  }, [user, setPeople]);

  const updatePerson = useCallback(async (updatedPerson: Person) => {
    if (!user) return;
    
    try {
      await TaskService.updatePerson(updatedPerson);
      
      setPeople(prev => 
        prev.map(person => 
          person.id === updatedPerson.id ? updatedPerson : person
        )
      );
      
      // Update people in tasks
      setTasks(prev => 
        prev.map(task => ({
          ...task,
          people: task.people.map(person => 
            person.id === updatedPerson.id ? updatedPerson : person
          )
        }))
      );
    } catch (error) {
      console.error('Error updating person:', error);
      toast({
        title: 'Error',
        description: 'Failed to update person',
        variant: 'destructive'
      });
    }
  }, [user, setPeople, setTasks]);

  const deletePerson = useCallback(async (personId: string) => {
    if (!user) return;
    
    try {
      await TaskService.deletePerson(personId);
      
      setPeople(prev => prev.filter(person => person.id !== personId));
      
      // Remove the person from all tasks
      setTasks(prev => 
        prev.map(task => ({
          ...task,
          people: task.people.filter(person => person.id !== personId)
        }))
      );
    } catch (error) {
      console.error('Error deleting person:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete person',
        variant: 'destructive'
      });
    }
  }, [user, setPeople, setTasks]);

  const getTodaysCompletedTasks = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return tasks.filter(task => {
      if (!task.completed || !task.completedDate) return false;
      
      const completedDate = new Date(task.completedDate);
      completedDate.setHours(0, 0, 0, 0);
      
      return completedDate.getTime() === today.getTime();
    });
  }, [tasks]);

  const getArchivedTasks = useCallback(() => { // Added for archived tasks
    const archived = tasks.filter(task => task.is_archived === true);
    console.log('[TaskContext] getArchivedTasks returning:', archived); // DEBUG
    return archived;
  }, [tasks]);

  // Function to get a specific recurrence rule by ID
  const getRecurrenceRuleById = useCallback((id: string): RecurrenceRule | undefined => {
    return recurrenceRules.find(rule => rule.id === id);
  }, [recurrenceRules]);

  const getTaskById = useCallback((id: string): Task | undefined => {
    return tasks.find(task => task.id === id);
  }, [tasks]);

  const contextValue = useMemo(() => ({
    tasks,
    tags,
    people,
    recurrenceRules,
    addTask,
    updateTask,
    archiveTask, // Renamed
    deleteTask, // New hard delete
    completeTask,
    addTag,
    // updateTag, // Removed
    deleteTag,
    addPerson,
    updatePerson,
    deletePerson,
    getTodaysCompletedTasks,
    getArchivedTasks, // Added
    loading,
    getRecurrenceRuleById,
    getTaskById,
  }), [
    tasks, 
    tags, 
    people, 
    recurrenceRules, 
    addTask, 
    updateTask, 
    archiveTask, // Renamed
    deleteTask, // New hard delete
    completeTask, 
    addTag, 
    // updateTag, // Removed
    deleteTag, 
    addPerson, 
    updatePerson, 
    deletePerson, 
    getTodaysCompletedTasks, 
    getArchivedTasks, // Added
    loading, 
    getRecurrenceRuleById,
    getTaskById
  ]);

  console.log('[TaskProvider] PROVIDING contextValue.tasks:', contextValue.tasks ? contextValue.tasks.length : 'undefined/empty', JSON.stringify(contextValue.tasks?.map(t => t.id))); // Log task IDs for brevity

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
}

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};
