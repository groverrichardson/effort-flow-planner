
import { addDays, addWeeks, addMonths, parse, isValid, getDay } from 'date-fns';
import { Priority, EffortLevel } from '@/types';
import { supabase } from "@/integrations/supabase/client";

// Helper function to use Gemini for enhanced parsing
async function enhanceWithGemini(input: string) {
  try {
    const { data, error } = await supabase.functions.invoke('parse-natural-language', {
      body: { text: input },
    });

    if (error) {
      console.error('Error calling parse-natural-language function:', error);
      return null;
    }

    if (!data.success) {
      console.error('Parse function unsuccessful:', data);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in enhanceWithGemini:', error);
    return null;
  }
}

// Converts date strings from Gemini to actual Date objects
function parseDateFromGemini(dateString: string | null): Date | null {
  if (!dateString) return null;
  
  const today = new Date();
  
  // Check for common date patterns
  if (dateString.toLowerCase().includes('today')) {
    return today;
  } else if (dateString.toLowerCase().includes('tomorrow')) {
    return addDays(today, 1);
  } else if (dateString.toLowerCase().includes('next week')) {
    return addWeeks(today, 1);
  }
  
  // Try to parse with date-fns
  try {
    const formats = ['MMM d yyyy', 'M/d/yyyy', 'M-d-yyyy', 'yyyy-MM-dd'];
    for (const format of formats) {
      const parsedDate = parse(dateString, format, new Date());
      if (isValid(parsedDate)) return parsedDate;
    }
  } catch (e) {
    console.error("Error parsing date from Gemini:", e);
  }
  
  return null;
}

// Map effort string from Gemini to EffortLevel
function mapEffortLevelFromGemini(effortString: string | null): EffortLevel | null {
  if (!effortString) return null;
  
  const effortLower = effortString.toLowerCase();
  
  if (effortLower.includes('minute') || effortLower.includes('quick')) {
    return effortLower.includes('30') ? 2 : 1;
  } else if (effortLower.includes('hour')) {
    return 4;
  } else if (effortLower.includes('day')) {
    return 8;
  } else if (effortLower.includes('week')) {
    return effortLower.includes('couple') || effortLower.includes('few') ? 32 : 16;
  } else if (effortLower.includes('month')) {
    return 64;
  }
  
  return null;
}

// Map priority string from Gemini to Priority
function mapPriorityFromGemini(priorityString: string | null): Priority | null {
  if (!priorityString) return null;
  
  const priorityLower = priorityString.toLowerCase();
  
  if (priorityLower === 'high') {
    return 'high' as Priority;
  } else if (priorityLower === 'normal') {
    return 'normal' as Priority;
  } else if (priorityLower === 'low') {
    return 'low' as Priority;
  } else if (priorityLower === 'lowest') {
    return 'lowest' as Priority;
  }
  
  return null;
}

// Enhanced natural language task parser
export const naturalLanguageToTask = async (input: string) => {
  const taskData: any = {};
  let title = input;
  
  // First try to enhance with Gemini
  try {
    const enhancedData = await enhanceWithGemini(input);
    
    if (enhancedData) {
      console.log('Enhanced data from Gemini:', enhancedData);
      
      // Process people (full names supported through Gemini)
      if (enhancedData.people && enhancedData.people.length > 0) {
        // Limit to 2 people
        const limitedPeople = enhancedData.people.slice(0, 2);
        taskData.peopleNames = limitedPeople;
        
        // Remove the @mentions from the title
        limitedPeople.forEach(person => {
          const personWithAt = `@${person}`;
          title = title.replace(new RegExp(personWithAt, 'gi'), '');
        });
      }
      
      // Process tags
      if (enhancedData.tags && enhancedData.tags.length > 0) {
        taskData.tagNames = enhancedData.tags;
        
        // Remove the hashtags from the title
        enhancedData.tags.forEach(tag => {
          const tagWithHash = `#${tag}`;
          title = title.replace(new RegExp(tagWithHash, 'gi'), '');
        });
      }
      
      // Process priority
      const priority = mapPriorityFromGemini(enhancedData.priority);
      if (priority) {
        taskData.priority = priority;
        
        // Remove priority mentions from title
        const priorityRegex = new RegExp(`\\b(${enhancedData.priority} priority|${enhancedData.priority})\\b`, 'gi');
        title = title.replace(priorityRegex, '');
      }
      
      // Process due date
      const dueDate = parseDateFromGemini(enhancedData.dueDate);
      if (dueDate) {
        taskData.dueDate = dueDate;
        
        // Remove due date mentions from title (this is a simplification, actual implementation would be more complex)
        if (enhancedData.dueDate) {
          const dueDateRegex = new RegExp(`\\bdue\\s+${enhancedData.dueDate}\\b|\\b${enhancedData.dueDate}\\b`, 'gi');
          title = title.replace(dueDateRegex, '');
        }
      }
      
      // Process effort level
      const effortLevel = mapEffortLevelFromGemini(enhancedData.effort);
      if (effortLevel) {
        taskData.effortLevel = effortLevel;
        
        // Remove effort mentions from title (also a simplification)
        if (enhancedData.effort) {
          const effortRegex = new RegExp(`\\b${enhancedData.effort}\\b`, 'gi');
          title = title.replace(effortRegex, '');
        }
      }
      
      // Fall back to traditional parsing if needed for certain fields
      // ...
    } else {
      console.log('Falling back to traditional parsing');
      return traditionalNaturalLanguageToTask(input);
    }
  } catch (error) {
    console.error('Error in enhanced parsing, falling back to traditional parsing:', error);
    return traditionalNaturalLanguageToTask(input);
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

// The original parser function renamed as fallback
function traditionalNaturalLanguageToTask(input: string) {
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
  
  // Extract priority keywords and remove from title - Enhanced to catch ALL priority levels
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
  
  // Extract date related information - Enhanced with more variations
  const today = new Date();
  
  // Due date patterns - Enhanced with more variations
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
  
  // Enhanced day of week patterns with "next" variations
  const dayOfWeekPatterns = [
    { day: 'monday', dayNum: 1 },
    { day: 'tuesday', dayNum: 2 },
    { day: 'wednesday', dayNum: 3 },
    { day: 'thursday', dayNum: 4 },
    { day: 'friday', dayNum: 5 },
    { day: 'saturday', dayNum: 6 },
    { day: 'sunday', dayNum: 0 }
  ];
  
  // Handle "on <day>", "this <day>", and "next <day>" formats
  for (const pattern of dayOfWeekPatterns) {
    // Regular day mention
    const regularRegex = new RegExp(`(?:due (?:on )?)?(${pattern.day})(?:\\b|\\s|$)`, 'gi');
    // "This day" pattern
    const thisRegex = new RegExp(`this ${pattern.day}`, 'gi');
    // "Next day" pattern
    const nextRegex = new RegExp(`next ${pattern.day}`, 'gi');
    
    if (regularRegex.test(lowerInput) || thisRegex.test(lowerInput) || nextRegex.test(lowerInput)) {
      title = title.replace(regularRegex, '').replace(thisRegex, '').replace(nextRegex, '');
      
      const currentDayOfWeek = getDay(today);
      let daysToAdd = 0;
      
      if (nextRegex.test(lowerInput)) {
        // "Next day" means next week for that day
        daysToAdd = (pattern.dayNum - currentDayOfWeek + 7) % 7;
        if (daysToAdd === 0) daysToAdd = 7; // If it's the same day, add a week
      } else {
        // Regular or "this day" - find next occurrence
        daysToAdd = (pattern.dayNum - currentDayOfWeek + 7) % 7;
        if (daysToAdd === 0 && !thisRegex.test(lowerInput)) daysToAdd = 7;
      }
      
      taskData.dueDate = addDays(today, daysToAdd);
    }
  }
  
  // Enhanced date formats: MM/DD, MM/DD/YYYY, Month Day, Month Day Year, etc.
  const dateRegexes = [
    { regex: /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{1,2}(?:st|nd|rd|th)?(?:\s*,?\s*\d{4})?\b/gi, format: 'MMM d yyyy' },
    { regex: /\b\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?\b/g, format: 'MM/dd/yyyy' }
  ];
  
  for (const dateRegex of dateRegexes) {
    const matches = input.match(dateRegex.regex);
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
}
