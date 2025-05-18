
import { addDays, addWeeks, addMonths, parse, isValid } from 'date-fns';
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
  
  // Extract people references (support multi-word names)
  const personMatches = [];
  const personRegex = /@([^\s@#]+(?:\s+[^\s@#]+)*)/g;
  let match;
  
  while ((match = personRegex.exec(input)) !== null) {
    const fullMatch = match[0]; // The entire match including the @ symbol
    const nameOnly = match[1]; // Just the name without the @ symbol
    
    // Remove from title and add to personMatches array
    title = title.replace(fullMatch, '');
    personMatches.push(nameOnly);
  }
  
  if (personMatches.length > 0) {
    taskData.peopleNames = personMatches;
  }
  
  // Extract priority keywords and remove from title - Enhanced to catch all priority levels
  if (lowerInput.includes('high priority') || lowerInput.includes('urgent') || lowerInput.includes('important')) {
    title = title.replace(/high priority|urgent|important/gi, '');
    taskData.priority = 'high' as Priority;
  } else if (lowerInput.includes('normal priority') || lowerInput.includes('medium priority')) {
    title = title.replace(/normal priority|medium priority/gi, '');
    taskData.priority = 'normal' as Priority;
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
  
  // Due date patterns - Enhanced
  const dueDatePatterns = [
    { regex: /due today/gi, date: today },
    { regex: /due tomorrow/gi, date: addDays(today, 1) },
    { regex: /due next week/gi, date: addDays(today, 7) },
    { regex: /tomorrow/gi, date: addDays(today, 1) },
    { regex: /today/gi, date: today },
    { regex: /next week/gi, date: addDays(today, 7) },
    { regex: /next month/gi, date: addMonths(today, 1) }
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
  
  // Handle "on <day>" and "this <day>" formats
  for (const pattern of dayOfWeekPatterns) {
    const regex1 = new RegExp(`due (on )?${pattern.day}|on ${pattern.day}`, 'gi');
    const regex2 = new RegExp(`this ${pattern.day}`, 'gi');
    
    if (regex1.test(lowerInput) || regex2.test(lowerInput)) {
      title = title.replace(regex1, '').replace(regex2, '');
      const dayOfWeek = today.getDay();
      let daysToAdd = (pattern.dayNum - dayOfWeek + 7) % 7;
      
      // If it's the same day and we use "next", add a week
      if (daysToAdd === 0 && regex2.test(lowerInput)) {
        daysToAdd = 7;
      }
      
      taskData.dueDate = addDays(today, daysToAdd);
    }
  }
  
  // Try to parse date formats like MM/DD, MM/DD/YYYY, Month Day, etc.
  const dateRegexes = [
    { regex: /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{1,2}(st|nd|rd|th)?(\s*,?\s*\d{4})?\b/gi, format: 'MMM d yyyy' },
    { regex: /\b\d{1,2}[\/\-]\d{1,2}([\/\-]\d{2,4})?\b/g, format: 'MM/dd/yyyy' }
  ];
  
  for (const dateRegex of dateRegexes) {
    const matches = lowerInput.match(dateRegex.regex);
    if (matches) {
      for (const match of matches) {
        // Try to parse the date
        let parsedDate;
        try {
          // Convert month names to standard format
          let normalizedDate = match.replace(/(st|nd|rd|th)/gi, '');
          
          // Handle short year format
          if (normalizedDate.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2}$/)) {
            const parts = normalizedDate.split(/[\/\-]/);
            if (parts.length === 3 && parts[2].length === 2) {
              const year = parseInt(parts[2]);
              const fullYear = year < 50 ? 2000 + year : 1900 + year;
              normalizedDate = `${parts[0]}/${parts[1]}/${fullYear}`;
            }
          }
          
          // Add current year if not specified for month/day format
          if (normalizedDate.match(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{1,2}$/i)) {
            normalizedDate = `${normalizedDate} ${today.getFullYear()}`;
          }
          
          if (normalizedDate.match(/^\d{1,2}[\/\-]\d{1,2}$/)) {
            normalizedDate = `${normalizedDate}/${today.getFullYear()}`;
          }
          
          // Try multiple formats
          const formats = ['MMM d yyyy', 'M/d/yyyy', 'M-d-yyyy'];
          for (const format of formats) {
            parsedDate = parse(normalizedDate, format, new Date());
            if (isValid(parsedDate)) break;
          }
          
          if (isValid(parsedDate)) {
            title = title.replace(match, '');
            taskData.dueDate = parsedDate;
            break;
          }
        } catch (e) {
          console.error("Error parsing date:", e);
        }
      }
    }
  }
  
  // Go-live date - Enhanced patterns
  const goLiveDatePatterns = [
    { regex: /go live today/gi, date: today },
    { regex: /go live tomorrow/gi, date: addDays(today, 1) },
    { regex: /go live next week/gi, date: addWeeks(today, 1) },
    { regex: /go live (on )?monday/gi, date: addDays(today, (1 - today.getDay() + 7) % 7) },
    { regex: /go live (on )?tuesday/gi, date: addDays(today, (2 - today.getDay() + 7) % 7) },
    { regex: /go live (on )?wednesday/gi, date: addDays(today, (3 - today.getDay() + 7) % 7) },
    { regex: /go live (on )?thursday/gi, date: addDays(today, (4 - today.getDay() + 7) % 7) },
    { regex: /go live (on )?friday/gi, date: addDays(today, (5 - today.getDay() + 7) % 7) },
    { regex: /go live (on )?saturday/gi, date: addDays(today, (6 - today.getDay() + 7) % 7) },
    { regex: /go live (on )?sunday/gi, date: addDays(today, (0 - today.getDay() + 7) % 7) }
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
  
  // Add a description if the original input is significantly different from the title
  if (input.length > title.length + 10) {
    taskData.description = `Original input: ${input}`;
  }
  
  return taskData;
};
