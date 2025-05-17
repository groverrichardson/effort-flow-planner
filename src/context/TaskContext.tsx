
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Task, Tag, Person, Priority, EffortLevel } from '@/types';

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
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      return parsedTasks.map((task: any) => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        targetDeadline: task.targetDeadline ? new Date(task.targetDeadline) : null,
        goLiveDate: task.goLiveDate ? new Date(task.goLiveDate) : null,
        completedDate: task.completedDate ? new Date(task.completedDate) : null,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        // Handle migration from groups to tags
        tags: task.tags || task.groups || []
      }));
    }
    return [];
  });
  
  const [tags, setTags] = useState<Tag[]>(() => {
    const savedTags = localStorage.getItem('tags');
    const savedGroups = localStorage.getItem('groups');
    
    // Migration from groups to tags
    if (savedTags) {
      return JSON.parse(savedTags);
    } else if (savedGroups) {
      const groups = JSON.parse(savedGroups);
      localStorage.setItem('tags', JSON.stringify(groups));
      return groups;
    }
    
    return [
      { id: '1', name: 'Work' },
      { id: '2', name: 'Personal' },
      { id: '3', name: 'Health' },
      { id: '4', name: 'Learning' },
      { id: '5', name: 'Family' },
      { id: '6', name: 'Home' },
      { id: '7', name: 'Office' }
    ];
  });
  
  const [people, setPeople] = useState<Person[]>(() => {
    const savedPeople = localStorage.getItem('people');
    return savedPeople ? JSON.parse(savedPeople) : [];
  });

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('tags', JSON.stringify(tags));
  }, [tags]);

  useEffect(() => {
    localStorage.setItem('people', JSON.stringify(people));
  }, [people]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now
    };
    
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === updatedTask.id 
          ? { ...updatedTask, updatedAt: new Date() } 
          : task
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const completeTask = (taskId: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, completed: true, completedDate: new Date(), updatedAt: new Date() } 
          : task
      )
    );
  };

  const addTag = (name: string) => {
    const newTag: Tag = {
      id: crypto.randomUUID(),
      name
    };
    setTags(prev => [...prev, newTag]);
    return newTag;
  };

  const updateTag = (updatedTag: Tag) => {
    setTags(prev => 
      prev.map(tag => 
        tag.id === updatedTag.id ? updatedTag : tag
      )
    );
    
    // Update tasks with this tag
    setTasks(prev => 
      prev.map(task => ({
        ...task,
        tags: task.tags.map(g => 
          g.id === updatedTag.id ? updatedTag : g
        )
      }))
    );
  };

  const deleteTag = (tagId: string) => {
    setTags(prev => prev.filter(tag => tag.id !== tagId));
    
    // Remove the tag from all tasks
    setTasks(prev => 
      prev.map(task => ({
        ...task,
        tags: task.tags.filter(g => g.id !== tagId)
      }))
    );
  };

  const addPerson = (name: string) => {
    const newPerson: Person = {
      id: crypto.randomUUID(),
      name
    };
    setPeople(prev => [...prev, newPerson]);
    return newPerson;
  };

  const updatePerson = (updatedPerson: Person) => {
    setPeople(prev => 
      prev.map(person => 
        person.id === updatedPerson.id ? updatedPerson : person
      )
    );
    
    // Update tasks with this person
    setTasks(prev => 
      prev.map(task => ({
        ...task,
        people: task.people.map(p => 
          p.id === updatedPerson.id ? updatedPerson : p
        )
      }))
    );
  };

  const deletePerson = (personId: string) => {
    setPeople(prev => prev.filter(person => person.id !== personId));
    
    // Remove the person from all tasks
    setTasks(prev => 
      prev.map(task => ({
        ...task,
        people: task.people.filter(p => p.id !== personId)
      }))
    );
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
    getTodaysCompletedTasks
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
