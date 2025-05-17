
import { addDays, addWeeks } from 'date-fns';
import { Priority, EffortLevel } from '@/types';

// Basic natural language task parser
export const naturalLanguageToTask = (input: string) => {
  const taskData: any = {};
  const lowerInput = input.toLowerCase();
  
  // Extract title (first line or everything before the first keyword)
  const firstLine = input.split('\n')[0];
  taskData.title = firstLine;
  
  // Extract description (everything after the first line)
  const description = input.split('\n').slice(1).join('\n');
  if (description.trim()) {
    taskData.description = description.trim();
  }
  
  // Extract priority
  if (lowerInput.includes('high priority') || lowerInput.includes('urgent') || lowerInput.includes('important')) {
    taskData.priority = 'high' as Priority;
  } else if (lowerInput.includes('low priority') || lowerInput.includes('not urgent') || lowerInput.includes('when you have time')) {
    taskData.priority = 'low' as Priority;
  } else if (lowerInput.includes('lowest priority') || lowerInput.includes('whenever')) {
    taskData.priority = 'lowest' as Priority;
  }
  
  // Extract effort level based on time keywords
  if (lowerInput.includes('quick') || lowerInput.includes('few minutes') || lowerInput.includes('5 minutes')) {
    taskData.effortLevel = 1 as EffortLevel;
  } else if (lowerInput.includes('30 minutes') || lowerInput.includes('half hour') || lowerInput.includes('short')) {
    taskData.effortLevel = 2 as EffortLevel;
  } else if (lowerInput.includes('couple hours') || lowerInput.includes('few hours') || lowerInput.includes('this afternoon')) {
    taskData.effortLevel = 4 as EffortLevel;
  } else if (lowerInput.includes('all day') || lowerInput.includes('one day') || lowerInput.includes('full day')) {
    taskData.effortLevel = 8 as EffortLevel;
  } else if (lowerInput.includes('this week') || lowerInput.includes('several days')) {
    taskData.effortLevel = 16 as EffortLevel;
  } else if (lowerInput.includes('couple weeks') || lowerInput.includes('few weeks')) {
    taskData.effortLevel = 32 as EffortLevel;
  } else if (lowerInput.includes('month') || lowerInput.includes('long term') || lowerInput.includes('big project')) {
    taskData.effortLevel = 64 as EffortLevel;
  }
  
  // Extract dates
  const today = new Date();
  
  // Due date
  if (lowerInput.includes('due today')) {
    taskData.dueDate = today;
  } else if (lowerInput.includes('due tomorrow')) {
    taskData.dueDate = addDays(today, 1);
  } else if (lowerInput.includes('due next week')) {
    taskData.dueDate = addDays(today, 7);
  } else if (lowerInput.includes('due friday') || lowerInput.includes('due on friday')) {
    // Find the next Friday
    const dayOfWeek = today.getDay();
    const daysToAdd = (5 - dayOfWeek + 7) % 7;
    taskData.dueDate = addDays(today, daysToAdd);
  } else if (lowerInput.includes('due monday') || lowerInput.includes('due on monday')) {
    const dayOfWeek = today.getDay();
    const daysToAdd = (1 - dayOfWeek + 7) % 7;
    taskData.dueDate = addDays(today, daysToAdd);
  } else if (lowerInput.includes('due tuesday') || lowerInput.includes('due on tuesday')) {
    const dayOfWeek = today.getDay();
    const daysToAdd = (2 - dayOfWeek + 7) % 7;
    taskData.dueDate = addDays(today, daysToAdd);
  } else if (lowerInput.includes('due wednesday') || lowerInput.includes('due on wednesday')) {
    const dayOfWeek = today.getDay();
    const daysToAdd = (3 - dayOfWeek + 7) % 7;
    taskData.dueDate = addDays(today, daysToAdd);
  } else if (lowerInput.includes('due thursday') || lowerInput.includes('due on thursday')) {
    const dayOfWeek = today.getDay();
    const daysToAdd = (4 - dayOfWeek + 7) % 7;
    taskData.dueDate = addDays(today, daysToAdd);
  } else if (lowerInput.includes('due saturday') || lowerInput.includes('due on saturday')) {
    const dayOfWeek = today.getDay();
    const daysToAdd = (6 - dayOfWeek + 7) % 7;
    taskData.dueDate = addDays(today, daysToAdd);
  } else if (lowerInput.includes('due sunday') || lowerInput.includes('due on sunday')) {
    const dayOfWeek = today.getDay();
    const daysToAdd = (0 - dayOfWeek + 7) % 7;
    taskData.dueDate = addDays(today, daysToAdd);
  }
  
  // Go-live date
  if (lowerInput.includes('go live today')) {
    taskData.goLiveDate = today;
  } else if (lowerInput.includes('go live tomorrow')) {
    taskData.goLiveDate = addDays(today, 1);
  } else if (lowerInput.includes('go live next week')) {
    taskData.goLiveDate = addWeeks(today, 1);
  }
  
  // Extract tags
  const tagMatches = input.match(/(#\w+)/g) || [];
  if (tagMatches.length > 0) {
    taskData.tagNames = tagMatches.map(tag => tag.replace('#', ''));
  }
  
  // Extract people
  const peopleMatches = input.match(/(@\w+)/g) || [];
  if (peopleMatches.length > 0) {
    taskData.peopleNames = peopleMatches.map(person => person.replace('@', ''));
  }
  
  return taskData;
};
