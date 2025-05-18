
import { addDays, addWeeks } from 'date-fns';
import { Priority, EffortLevel } from '@/types';

// Improved natural language task parser
export const naturalLanguageToTask = (input: string) => {
  const taskData: any = {};
  const lowerInput = input.toLowerCase();
  
  // Extract title (everything before special syntax)
  let title = input;
  
  // Extract tags and remove from title
  const tagMatches = input.match(/(#\w+)/g) || [];
  if (tagMatches.length > 0) {
    tagMatches.forEach(tag => {
      title = title.replace(tag, '');
    });
    taskData.tagNames = tagMatches.map(tag => tag.replace('#', ''));
  }
  
  // Extract people references and remove from title
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
  const effortPatterns = [
    { regex: /quick|few minutes|5 minutes/gi, level: 1 },
    { regex: /30 minutes|half hour|short/gi, level: 2 },
    { regex: /couple hours|few hours|this afternoon/gi, level: 4 },
    { regex: /all day|one day|full day/gi, level: 8 },
    { regex: /this week|several days/gi, level: 16 },
    { regex: /couple weeks|few weeks/gi, level: 32 },
    { regex: /month|long term|big project/gi, level: 64 }
  ];
  
  for (const pattern of effortPatterns) {
    if (pattern.regex.test(lowerInput)) {
      title = title.replace(pattern.regex, '');
      taskData.effortLevel = pattern.level as EffortLevel;
    }
  }
  
  // Extract date related information
  const today = new Date();
  
  // Due date patterns
  const dueDatePatterns = [
    { regex: /due today/gi, date: today },
    { regex: /due tomorrow/gi, date: addDays(today, 1) },
    { regex: /due next week/gi, date: addDays(today, 7) },
    { regex: /tomorrow/gi, date: addDays(today, 1) },
    { regex: /today/gi, date: today }
  ];
  
  for (const pattern of dueDatePatterns) {
    if (pattern.regex.test(lowerInput)) {
      title = title.replace(pattern.regex, '');
      taskData.dueDate = pattern.date;
    }
  }
  
  // Day of week patterns
  const dayOfWeekPatterns = [
    { day: 'monday', dayNum: 1 },
    { day: 'tuesday', dayNum: 2 },
    { day: 'wednesday', dayNum: 3 },
    { day: 'thursday', dayNum: 4 },
    { day: 'friday', dayNum: 5 },
    { day: 'saturday', dayNum: 6 },
    { day: 'sunday', dayNum: 0 }
  ];
  
  for (const pattern of dayOfWeekPatterns) {
    const regex = new RegExp(`due ${pattern.day}|due on ${pattern.day}`, 'gi');
    if (regex.test(lowerInput)) {
      title = title.replace(regex, '');
      const dayOfWeek = today.getDay();
      const daysToAdd = (pattern.dayNum - dayOfWeek + 7) % 7;
      taskData.dueDate = addDays(today, daysToAdd);
    }
  }
  
  // Go-live date
  const goLiveDatePatterns = [
    { regex: /go live today/gi, date: today },
    { regex: /go live tomorrow/gi, date: addDays(today, 1) },
    { regex: /go live next week/gi, date: addWeeks(today, 1) }
  ];
  
  for (const pattern of goLiveDatePatterns) {
    if (pattern.regex.test(lowerInput)) {
      title = title.replace(pattern.regex, '');
      taskData.goLiveDate = pattern.date;
    }
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
