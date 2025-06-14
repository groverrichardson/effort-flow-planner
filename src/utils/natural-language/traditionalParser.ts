
import { addDays, addWeeks, addMonths, isValid, getDay, parseISO, formatISO } from 'date-fns';
import { Priority, EffortLevel, ParsedTaskDetails } from '@/types';
import { mapEffortLevel } from './parserUtils';

// Traditional natural language parser without AI enhancement
export async function parseWithTraditional(input: string): Promise<ParsedTaskDetails | null> {
  const taskData: Partial<ParsedTaskDetails> = {};
  try {
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
  
  // Extract priority keywords and remove from title
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
  
  // --- Effort Parsing Logic (using centralized mapEffortLevel) ---
  // Regex to find all effort phrases in the input
  // This regex is primarily for identifying phrases to pass to mapEffortLevel and for removal from title.
  // The detailed parsing is handled by mapEffortLevel from parserUtils.
  const effortGlobalRegex = /\b(?:(\d+)\s*(minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|months?|mo)|(an?|one)\s+(minute|min|m|hour|hr|h|day|d|week|w|month|mo)|(a\s+)?(half\s+hour|half\s+day)|(a\s+)?(couple|few|several)\s*(hours?|hrs?|h|days?|d|weeks?|w)|(quick|short|all\s+day|full\s+day|this\s+afternoon|long\s+term|big\s+project))\b/gi;
  let effortMatches;
  let highestEffortLevel: EffortLevel | null = null;
  let effortPhraseToRemove: string = '';

  while ((effortMatches = effortGlobalRegex.exec(lowerInput)) !== null) {
    const matchedPhrase = effortMatches[0];
    const currentEffortLevel = mapEffortLevel(matchedPhrase); // Use imported mapEffortLevel
    if (currentEffortLevel) {
      if (highestEffortLevel === null || currentEffortLevel > highestEffortLevel) {
        highestEffortLevel = currentEffortLevel;
        effortPhraseToRemove = matchedPhrase; // Store the phrase that resulted in the highest effort
      }
    }
  }

  if (highestEffortLevel !== null) {
    taskData.effortLevel = highestEffortLevel;
    // Remove the specific effort phrase that contributed to the highest effort level from the title
    if (effortPhraseToRemove) {
      // Need to create a regex that matches the phrase case-insensitively
      // Escape special characters in the phrase to be used in a regex
      const escapedPhrase = effortPhraseToRemove.replace(/[.*+?^${}()|[\\\]\\]/g, '\\$&');
      const phraseRegex = new RegExp(`\\b${escapedPhrase}\\b`, 'gi');
      title = title.replace(phraseRegex, '');
    }
  }
  // --- End Effort Parsing Logic ---
  
  // Extract date related information
  const today = new Date();
  
  // Scheduled date patterns
  const scheduledDatePatterns = [
    { regex: /due today/gi, date: today },
    { regex: /due tomorrow/gi, date: addDays(today, 1) },
    { regex: /due next week/gi, date: addDays(today, 7) },
    { regex: /tomorrow/gi, date: addDays(today, 1) },
    { regex: /today/gi, date: today },
    { regex: /next week/gi, date: addDays(today, 7) },
    { regex: /next month/gi, date: addMonths(today, 1) }
  ];
  
  for (const pattern of scheduledDatePatterns) {
    if (pattern.regex.test(lowerInput)) {
      title = title.replace(pattern.regex, '');
      taskData.targetDeadline = pattern.date;
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
      
      taskData.targetDeadline = addDays(today, daysToAdd);
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
          
          // Instead of using date-fns parse, we'll use a more basic approach with regex and Date constructor
          // This will help avoid the dependency on the problematic parse/_lib/parsers.mjs module
          
          // Try to parse MM/DD/YYYY or MM-DD-YYYY format
          const dateRegex = /^(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?$/;
          const match = normalizedDate.match(dateRegex);
          
          if (match) {
            const month = parseInt(match[1]) - 1; // JS months are 0-based
            const day = parseInt(match[2]);
            let year = match[3] ? parseInt(match[3]) : today.getFullYear();
            
            // Handle 2-digit years
            if (year < 100) {
              year = year < 50 ? 2000 + year : 1900 + year;
            }
            
            try {
              parsedDate = new Date(year, month, day);
              if (!isValid(parsedDate)) parsedDate = null;
            } catch (e) {
              console.error('Error creating date:', e);
            }
          } else {
            // Try to parse month name format
            const monthNameRegex = /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* (\d{1,2})(?:\s*,?\s*(\d{4}))?$/i;
            const monthMatch = normalizedDate.match(monthNameRegex);
            
            if (monthMatch) {
              const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
              const monthIndex = monthNames.findIndex(m => m === monthMatch[1].toLowerCase().substring(0, 3));
              const day = parseInt(monthMatch[2]);
              const year = monthMatch[3] ? parseInt(monthMatch[3]) : today.getFullYear();
              
              if (monthIndex !== -1) {
                try {
                  parsedDate = new Date(year, monthIndex, day);
                  if (!isValid(parsedDate)) parsedDate = null;
                } catch (e) {
                  console.error('Error creating date:', e);
                }
              }
            }
          }
          
          if (isValid(parsedDate)) {
            title = title.replace(match, '');
            taskData.targetDeadline = parsedDate;
            break;
          }
        } catch (e) {
          console.error("Error parsing date:", e);
        }
      }
    }
  }
  
  // Go-live date patterns
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
  
  return taskData as ParsedTaskDetails;
  } catch (error) {
    console.error('Error in traditional parsing:', error);
    return null;
  }
}
