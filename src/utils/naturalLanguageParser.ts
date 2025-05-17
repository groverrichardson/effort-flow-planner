
import { addDays, addWeeks } from 'date-fns';
import { Priority, EffortLevel } from '@/types';

// Basic natural language task parser
export const naturalLanguageToTask = (input: string) => {
  const taskData: any = {};
  const lowerInput = input.toLowerCase();
  
  // Extract title (everything before special syntax)
  let title = input;
  
  // Remove tags
  const tagMatches = input.match(/(#\w+)/g) || [];
  if (tagMatches.length > 0) {
    tagMatches.forEach(tag => {
      title = title.replace(tag, '');
    });
    taskData.tagNames = tagMatches.map(tag => tag.replace('#', ''));
  }
  
  // Remove people references
  const peopleMatches = input.match(/(@\w+)/g) || [];
  if (peopleMatches.length > 0) {
    peopleMatches.forEach(person => {
      title = title.replace(person, '');
    });
    taskData.peopleNames = peopleMatches.map(person => person.replace('@', ''));
  }
  
  // Extract priority keywords and remove from title
  if (lowerInput.includes('high priority') || lowerInput.includes('urgent') || lowerInput.includes('important')) {
    title = title.replace(/high priority|urgent|important/gi, '');
    taskData.priority = 'high' as Priority;
  } else if (lowerInput.includes('low priority') || lowerInput.includes('not urgent') || lowerInput.includes('when you have time')) {
    title = title.replace(/low priority|not urgent|when you have time/gi, '');
    taskData.priority = 'low' as Priority;
  } else if (lowerInput.includes('lowest priority') || lowerInput.includes('whenever')) {
    title = title.replace(/lowest priority|whenever/gi, '');
    taskData.priority = 'lowest' as Priority;
  }
  
  // Extract effort level keywords and remove from title
  if (lowerInput.includes('quick') || lowerInput.includes('few minutes') || lowerInput.includes('5 minutes')) {
    title = title.replace(/quick|few minutes|5 minutes/gi, '');
    taskData.effortLevel = 1 as EffortLevel;
  } else if (lowerInput.includes('30 minutes') || lowerInput.includes('half hour') || lowerInput.includes('short')) {
    title = title.replace(/30 minutes|half hour|short/gi, '');
    taskData.effortLevel = 2 as EffortLevel;
  } else if (lowerInput.includes('couple hours') || lowerInput.includes('few hours') || lowerInput.includes('this afternoon')) {
    title = title.replace(/couple hours|few hours|this afternoon/gi, '');
    taskData.effortLevel = 4 as EffortLevel;
  } else if (lowerInput.includes('all day') || lowerInput.includes('one day') || lowerInput.includes('full day')) {
    title = title.replace(/all day|one day|full day/gi, '');
    taskData.effortLevel = 8 as EffortLevel;
  } else if (lowerInput.includes('this week') || lowerInput.includes('several days')) {
    title = title.replace(/this week|several days/gi, '');
    taskData.effortLevel = 16 as EffortLevel;
  } else if (lowerInput.includes('couple weeks') || lowerInput.includes('few weeks')) {
    title = title.replace(/couple weeks|few weeks/gi, '');
    taskData.effortLevel = 32 as EffortLevel;
  } else if (lowerInput.includes('month') || lowerInput.includes('long term') || lowerInput.includes('big project')) {
    title = title.replace(/month|long term|big project/gi, '');
    taskData.effortLevel = 64 as EffortLevel;
  }
  
  // Extract date related information
  const today = new Date();
  
  // Due date
  if (lowerInput.includes('due today')) {
    title = title.replace(/due today/gi, '');
    taskData.dueDate = today;
  } else if (lowerInput.includes('due tomorrow')) {
    title = title.replace(/due tomorrow/gi, '');
    taskData.dueDate = addDays(today, 1);
  } else if (lowerInput.includes('due next week')) {
    title = title.replace(/due next week/gi, '');
    taskData.dueDate = addDays(today, 7);
  } else if (lowerInput.includes('due friday') || lowerInput.includes('due on friday')) {
    title = title.replace(/due friday|due on friday/gi, '');
    // Find the next Friday
    const dayOfWeek = today.getDay();
    const daysToAdd = (5 - dayOfWeek + 7) % 7;
    taskData.dueDate = addDays(today, daysToAdd);
  } else if (lowerInput.includes('due monday') || lowerInput.includes('due on monday')) {
    title = title.replace(/due monday|due on monday/gi, '');
    const dayOfWeek = today.getDay();
    const daysToAdd = (1 - dayOfWeek + 7) % 7;
    taskData.dueDate = addDays(today, daysToAdd);
  } else if (lowerInput.includes('due tuesday') || lowerInput.includes('due on tuesday')) {
    title = title.replace(/due tuesday|due on tuesday/gi, '');
    const dayOfWeek = today.getDay();
    const daysToAdd = (2 - dayOfWeek + 7) % 7;
    taskData.dueDate = addDays(today, daysToAdd);
  } else if (lowerInput.includes('due wednesday') || lowerInput.includes('due on wednesday')) {
    title = title.replace(/due wednesday|due on wednesday/gi, '');
    const dayOfWeek = today.getDay();
    const daysToAdd = (3 - dayOfWeek + 7) % 7;
    taskData.dueDate = addDays(today, daysToAdd);
  } else if (lowerInput.includes('due thursday') || lowerInput.includes('due on thursday')) {
    title = title.replace(/due thursday|due on thursday/gi, '');
    const dayOfWeek = today.getDay();
    const daysToAdd = (4 - dayOfWeek + 7) % 7;
    taskData.dueDate = addDays(today, daysToAdd);
  } else if (lowerInput.includes('due saturday') || lowerInput.includes('due on saturday')) {
    title = title.replace(/due saturday|due on saturday/gi, '');
    const dayOfWeek = today.getDay();
    const daysToAdd = (6 - dayOfWeek + 7) % 7;
    taskData.dueDate = addDays(today, daysToAdd);
  } else if (lowerInput.includes('due sunday') || lowerInput.includes('due on sunday')) {
    title = title.replace(/due sunday|due on sunday/gi, '');
    const dayOfWeek = today.getDay();
    const daysToAdd = (0 - dayOfWeek + 7) % 7;
    taskData.dueDate = addDays(today, daysToAdd);
  }
  
  // Go-live date
  if (lowerInput.includes('go live today')) {
    title = title.replace(/go live today/gi, '');
    taskData.goLiveDate = today;
  } else if (lowerInput.includes('go live tomorrow')) {
    title = title.replace(/go live tomorrow/gi, '');
    taskData.goLiveDate = addDays(today, 1);
  } else if (lowerInput.includes('go live next week')) {
    title = title.replace(/go live next week/gi, '');
    taskData.goLiveDate = addWeeks(today, 1);
  }
  
  // Clean up the title by removing extra spaces and trimming
  title = title.replace(/\s+/g, ' ').trim();
  taskData.title = title;
  
  // Add a description if the original text is significantly different from the title
  if (input.length > title.length + 10) {
    taskData.description = `Original input: ${input}`;
  }
  
  return taskData;
};
