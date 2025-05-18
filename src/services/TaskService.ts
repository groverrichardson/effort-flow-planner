import { supabase } from '@/integrations/supabase/client';
import { Task, Tag, Person, Priority, EffortLevel, DueDateType } from '@/types';

export const TaskService = {
  // Tasks
  async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }

    const tasks = await Promise.all((data || []).map(async (task) => {
      // Get tags for this task
      const { data: tagData } = await supabase
        .from('task_tags')
        .select('tag_id, tag_name')
        .eq('task_id', task.id);
      
      // Get people for this task
      const { data: peopleData } = await supabase
        .from('task_people')
        .select('person_id, person_name')
        .eq('task_id', task.id);
      
      return {
        id: task.id,
        title: task.title,
        description: task.description || '',
        priority: task.priority as Priority,
        dueDate: task.due_date ? new Date(task.due_date) : null,
        dueDateType: (task.due_date_type as DueDateType) || 'by',
        targetDeadline: task.target_deadline ? new Date(task.target_deadline) : null,
        goLiveDate: task.go_live_date ? new Date(task.go_live_date) : null,
        effortLevel: task.effort_level as EffortLevel,
        completed: task.completed,
        completedDate: task.completed_date ? new Date(task.completed_date) : null,
        tags: (tagData || []).map(tag => ({ id: tag.tag_id, name: tag.tag_name })),
        people: (peopleData || []).map(person => ({ id: person.person_id, name: person.person_name })),
        dependencies: task.dependencies || [],
        createdAt: new Date(task.created_at),
        updatedAt: new Date(task.updated_at)
      };
    }));

    return tasks;
  },

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task | null> {
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    // Insert the task
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        due_date: task.dueDate ? task.dueDate.toISOString() : null,
        due_date_type: task.dueDateType || 'by',
        target_deadline: task.targetDeadline ? task.targetDeadline.toISOString() : null,
        go_live_date: task.goLiveDate ? task.goLiveDate.toISOString() : null,
        effort_level: task.effortLevel,
        completed: task.completed,
        completed_date: task.completedDate ? task.completedDate.toISOString() : null,
        dependencies: task.dependencies || []
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating task:', error);
      return null;
    }

    // Insert tags
    if (task.tags.length > 0) {
      const tagInserts = task.tags.map(tag => ({
        task_id: data.id,
        tag_id: tag.id,
        tag_name: tag.name
      }));

      const { error: tagError } = await supabase
        .from('task_tags')
        .insert(tagInserts);

      if (tagError) {
        console.error('Error adding task tags:', tagError);
      }
    }

    // Insert people
    if (task.people.length > 0) {
      const peopleInserts = task.people.map(person => ({
        task_id: data.id,
        person_id: person.id,
        person_name: person.name
      }));

      const { error: peopleError } = await supabase
        .from('task_people')
        .insert(peopleInserts);

      if (peopleError) {
        console.error('Error adding task people:', peopleError);
      }
    }

    // Return the created task with all relationships
    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      priority: data.priority as Priority,
      dueDate: data.due_date ? new Date(data.due_date) : null,
      dueDateType: (data.due_date_type as DueDateType) || 'by',
      targetDeadline: data.target_deadline ? new Date(data.target_deadline) : null,
      goLiveDate: data.go_live_date ? new Date(data.go_live_date) : null,
      effortLevel: data.effort_level as EffortLevel,
      completed: data.completed,
      completedDate: data.completed_date ? new Date(data.completed_date) : null,
      tags: task.tags,
      people: task.people,
      dependencies: data.dependencies || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  async updateTask(task: Task): Promise<void> {
    // Update the task
    const { error } = await supabase
      .from('tasks')
      .update({
        title: task.title,
        description: task.description,
        priority: task.priority,
        due_date: task.dueDate ? task.dueDate.toISOString() : null,
        due_date_type: task.dueDateType || 'by',
        target_deadline: task.targetDeadline ? task.targetDeadline.toISOString() : null,
        go_live_date: task.goLiveDate ? task.goLiveDate.toISOString() : null,
        effort_level: task.effortLevel,
        completed: task.completed,
        completed_date: task.completedDate ? task.completedDate.toISOString() : null,
        dependencies: task.dependencies || [],
        updated_at: new Date().toISOString()
      })
      .eq('id', task.id);

    if (error) {
      console.error('Error updating task:', error);
      return;
    }

    // Remove existing tags and people
    await supabase.from('task_tags').delete().eq('task_id', task.id);
    await supabase.from('task_people').delete().eq('task_id', task.id);
    
    // Re-insert tags
    if (task.tags.length > 0) {
      const tagInserts = task.tags.map(tag => ({
        task_id: task.id,
        tag_id: tag.id,
        tag_name: tag.name
      }));

      const { error: tagError } = await supabase
        .from('task_tags')
        .insert(tagInserts);

      if (tagError) {
        console.error('Error updating task tags:', tagError);
      }
    }

    // Re-insert people
    if (task.people.length > 0) {
      const peopleInserts = task.people.map(person => ({
        task_id: task.id,
        person_id: person.id,
        person_name: person.name
      }));

      const { error: peopleError } = await supabase
        .from('task_people')
        .insert(peopleInserts);

      if (peopleError) {
        console.error('Error updating task people:', peopleError);
      }
    }
  },

  async deleteTask(taskId: string): Promise<void> {
    // Delete the task (cascade will handle relationships)
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
    }
  },

  async completeTask(taskId: string): Promise<void> {
    const completedDate = new Date();
    
    const { error } = await supabase
      .from('tasks')
      .update({
        completed: true,
        completed_date: completedDate.toISOString(),
        updated_at: completedDate.toISOString()
      })
      .eq('id', taskId);

    if (error) {
      console.error('Error completing task:', error);
    }
  },

  // Tags
  async getTags(): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching tags:', error);
      return [];
    }

    return (data || []).map(tag => ({
      id: tag.id,
      name: tag.name
    }));
  },

  async createTag(name: string): Promise<Tag> {
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const { data, error } = await supabase
      .from('tags')
      .insert({ 
        name,
        user_id: user.id
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating tag:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name
    };
  },

  async updateTag(tag: Tag): Promise<void> {
    const { error } = await supabase
      .from('tags')
      .update({ name: tag.name })
      .eq('id', tag.id);

    if (error) {
      console.error('Error updating tag:', error);
    }

    // Update tag name in task_tags
    const { error: taskTagError } = await supabase
      .from('task_tags')
      .update({ tag_name: tag.name })
      .eq('tag_id', tag.id);

    if (taskTagError) {
      console.error('Error updating tag name in task_tags:', taskTagError);
    }
  },

  async deleteTag(tagId: string): Promise<void> {
    // Delete the tag
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', tagId);

    if (error) {
      console.error('Error deleting tag:', error);
    }
    
    // Delete tag references in task_tags
    const { error: taskTagError } = await supabase
      .from('task_tags')
      .delete()
      .eq('tag_id', tagId);

    if (taskTagError) {
      console.error('Error deleting tag references:', taskTagError);
    }
  },

  // People
  async getPeople(): Promise<Person[]> {
    const { data, error } = await supabase
      .from('people')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching people:', error);
      return [];
    }

    return (data || []).map(person => ({
      id: person.id,
      name: person.name
    }));
  },

  async createPerson(name: string): Promise<Person> {
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const { data, error } = await supabase
      .from('people')
      .insert({ 
        name,
        user_id: user.id
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating person:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name
    };
  },

  async updatePerson(person: Person): Promise<void> {
    const { error } = await supabase
      .from('people')
      .update({ name: person.name })
      .eq('id', person.id);

    if (error) {
      console.error('Error updating person:', error);
    }

    // Update person name in task_people
    const { error: taskPeopleError } = await supabase
      .from('task_people')
      .update({ person_name: person.name })
      .eq('person_id', person.id);

    if (taskPeopleError) {
      console.error('Error updating person name in task_people:', taskPeopleError);
    }
  },

  async deletePerson(personId: string): Promise<void> {
    // Delete the person
    const { error } = await supabase
      .from('people')
      .delete()
      .eq('id', personId);

    if (error) {
      console.error('Error deleting person:', error);
    }
    
    // Delete person references in task_people
    const { error: taskPeopleError } = await supabase
      .from('task_people')
      .delete()
      .eq('person_id', personId);

    if (taskPeopleError) {
      console.error('Error deleting person references:', taskPeopleError);
    }
  }
};
