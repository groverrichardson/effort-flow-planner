
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Task, Group, Person, Priority, EffortLevel } from '@/types';

interface TaskContextType {
  tasks: Task[];
  groups: Group[];
  people: Person[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  completeTask: (taskId: string) => void;
  addGroup: (name: string) => void;
  updateGroup: (group: Group) => void;
  deleteGroup: (groupId: string) => void;
  addPerson: (name: string) => void;
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
        updatedAt: new Date(task.updatedAt)
      }));
    }
    return [];
  });
  
  const [groups, setGroups] = useState<Group[]>(() => {
    const savedGroups = localStorage.getItem('groups');
    return savedGroups ? JSON.parse(savedGroups) : [
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
    localStorage.setItem('groups', JSON.stringify(groups));
  }, [groups]);

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

  const addGroup = (name: string) => {
    const newGroup: Group = {
      id: crypto.randomUUID(),
      name
    };
    setGroups(prev => [...prev, newGroup]);
    return newGroup;
  };

  const updateGroup = (updatedGroup: Group) => {
    setGroups(prev => 
      prev.map(group => 
        group.id === updatedGroup.id ? updatedGroup : group
      )
    );
    
    // Update tasks with this group
    setTasks(prev => 
      prev.map(task => ({
        ...task,
        groups: task.groups.map(g => 
          g.id === updatedGroup.id ? updatedGroup : g
        )
      }))
    );
  };

  const deleteGroup = (groupId: string) => {
    setGroups(prev => prev.filter(group => group.id !== groupId));
    
    // Remove the group from all tasks
    setTasks(prev => 
      prev.map(task => ({
        ...task,
        groups: task.groups.filter(g => g.id !== groupId)
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
    groups,
    people,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    addGroup,
    updateGroup,
    deleteGroup,
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
