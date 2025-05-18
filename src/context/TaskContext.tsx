
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Task, Tag, Person, Priority, EffortLevel } from '@/types';
import { TaskService } from '@/services/TaskService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';

interface TaskContextType {
  tasks: Task[];
  tags: Tag[];
  people: Person[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  completeTask: (taskId: string) => void;
  addTag: (name: string) => Tag;
  updateTag: (tag: Tag) => void;
  deleteTag: (tagId: string) => void;
  addPerson: (name: string) => Person;
  updatePerson: (person: Person) => void;
  deletePerson: (personId: string) => void;
  getTodaysCompletedTasks: () => Task[];
  loading: boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load data from Supabase when user is authenticated
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        setLoading(true);
        try {
          const [tasksData, tagsData, peopleData] = await Promise.all([
            TaskService.getTasks(),
            TaskService.getTags(),
            TaskService.getPeople()
          ]);
          
          setTasks(tasksData);
          setTags(tagsData);
          setPeople(peopleData);
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
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
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
      }
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive'
      });
    }
  };

  const updateTask = async (updatedTask: Task) => {
    if (!user) return;
    
    try {
      await TaskService.updateTask(updatedTask);
      
      setTasks(prev => 
        prev.map(task => 
          task.id === updatedTask.id 
            ? { ...updatedTask, updatedAt: new Date() } 
            : task
        )
      );
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive'
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    
    try {
      await TaskService.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive'
      });
    }
  };

  const completeTask = async (taskId: string) => {
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
  };

  const addTag = async (name: string) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create tags',
        variant: 'destructive'
      });
      return { id: '', name: '' };
    }
    
    try {
      const newTag = await TaskService.createTag(name);
      
      if (newTag) {
        setTags(prev => [...prev, newTag]);
        return newTag;
      }
    } catch (error) {
      console.error('Error adding tag:', error);
      toast({
        title: 'Error',
        description: 'Failed to create tag',
        variant: 'destructive'
      });
    }
    
    return { id: '', name: '' };
  };

  const updateTag = async (updatedTag: Tag) => {
    if (!user) return;
    
    try {
      await TaskService.updateTag(updatedTag);
      
      setTags(prev => 
        prev.map(tag => 
          tag.id === updatedTag.id ? updatedTag : tag
        )
      );
      
      // Update tags in tasks
      setTasks(prev => 
        prev.map(task => ({
          ...task,
          tags: task.tags.map(tag => 
            tag.id === updatedTag.id ? updatedTag : tag
          )
        }))
      );
    } catch (error) {
      console.error('Error updating tag:', error);
      toast({
        title: 'Error',
        description: 'Failed to update tag',
        variant: 'destructive'
      });
    }
  };

  const deleteTag = async (tagId: string) => {
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
  };

  const addPerson = async (name: string) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create people',
        variant: 'destructive'
      });
      return { id: '', name: '' };
    }
    
    try {
      const newPerson = await TaskService.createPerson(name);
      
      if (newPerson) {
        setPeople(prev => [...prev, newPerson]);
        return newPerson;
      }
    } catch (error) {
      console.error('Error adding person:', error);
      toast({
        title: 'Error',
        description: 'Failed to create person',
        variant: 'destructive'
      });
    }
    
    return { id: '', name: '' };
  };

  const updatePerson = async (updatedPerson: Person) => {
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
  };

  const deletePerson = async (personId: string) => {
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
  };

  const getTodaysCompletedTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return tasks.filter(task => {
      if (!task.completed || !task.completedDate) return false;
      
      const completedDate = new Date(task.completedDate);
      completedDate.setHours(0, 0, 0, 0);
      
      return completedDate.getTime() === today.getTime();
    });
  };

  const value = {
    tasks,
    tags,
    people,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    addTag,
    updateTag,
    deleteTag,
    addPerson,
    updatePerson,
    deletePerson,
    getTodaysCompletedTasks,
    loading
  };

  return (
    <TaskContext.Provider value={value}>
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
