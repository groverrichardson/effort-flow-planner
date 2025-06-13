
import { Priority, EffortLevel } from '@/types';
// Changed from static to dynamic import to fix Vite build issues
// import * as chrono from 'chrono-node';
let chronoParser: any = null;

// Helper function to calculate the last occurrence of a specific day of the week in a given month and year
function calculateLastDayOfWeekInMonth(year: number, month: number, dayOfWeek: number): Date | null {
  // dayOfWeek: 0 for Sunday, 1 for Monday, ..., 6 for Saturday
  // month: 0 for January, 1 for February, ...
  try {
    const lastDayOfMonth = new Date(year, month + 1, 0); // Get the last calendar day of the target month
    let day = lastDayOfMonth.getDate();
    const resultDate = new Date(year, month, day);

    while (resultDate.getDay() !== dayOfWeek) {
      resultDate.setDate(resultDate.getDate() - 1);
      if (resultDate.getMonth() !== month) { // Should not happen if logic is correct, but a safeguard
        return null;
      }
    }
    return resultDate;
  } catch (e) {
    console.error("Error in calculateLastDayOfWeekInMonth:", e);
    return null;
  }
}

// Converts date strings (potentially from Gemini or other NLP) to actual Date objects
export function parseDateFromString(dateString: string | null): Date | null {
  console.log('[parserUtils] parseDateFromString received:', dateString);
  if (!dateString || dateString.trim() === '') {
    console.log('[parserUtils] dateString is null or empty, returning null.');
    return null;
  }

  const lowerDateString = dateString.toLowerCase();
  console.log('[parserUtils] lowerDateString:', lowerDateString);
  const dayMap: { [key: string]: number } = {
    sunday: 0, monday: 1, tuesday: 2, wednesday: 3, 
    thursday: 4, friday: 5, saturday: 6
  };

  // Regex to catch "last [weekday] of [the/this/current] month"
  const lastDayPattern = /last\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\s+of\s+(?:the\s+|this\s+|current\s+)?month/i;
  const match = lowerDateString.match(lastDayPattern);
  console.log('[parserUtils] regex match result:', match);

  if (match && match[1]) {
    console.log('[parserUtils] Entered custom logic for "last weekday of month".');
    const targetDayName = match[1];
    console.log('[parserUtils] targetDayName from regex:', targetDayName);
    const targetDayOfWeek = dayMap[targetDayName];
    
    if (targetDayOfWeek !== undefined) {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth(); // 0-indexed month

      const calculatedDate = calculateLastDayOfWeekInMonth(currentYear, currentMonth, targetDayOfWeek);
      console.log('[parserUtils] calculatedDate by custom logic:', calculatedDate);
      if (calculatedDate) {
        // Set time to noon to avoid timezone issues making it the previous day
        calculatedDate.setHours(12, 0, 0, 0);
        return calculatedDate;
      }
    }
  }

  console.log('[parserUtils] Did not enter custom logic, or custom logic failed. Falling back to chrono-node.');
  try {
    // Dynamically import chrono-node to fix Vite build issues
    if (!chronoParser) {
      try {
        // Try to import synchronously for tests that don't support await
        // This is a workaround for Vite test environment
        chronoParser = require('chrono-node');
      } catch (e) {
        console.error('Error requiring chrono-node:', e);
        // Fallback to regex date parsing if chrono-node can't be loaded
        const dateRegex = /\b(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})\b/;
        const match = dateString.match(dateRegex);
        if (match) {
          const [_, month, day, year] = match;
          const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          if (!isNaN(dateObj.getTime())) {
            return dateObj;
          }
        }
        return null;
      }
    }
    
    // Use the imported parser
    if (chronoParser) {
      const parsedDate = chronoParser.parseDate(dateString, new Date(), { forwardDate: true });
      if (parsedDate) {
        return parsedDate;
      }
    }
  } catch (error) {
    console.error('Error parsing date string with chrono-node:', error);
  }
  
  return null;
}

// --- START New Effort Parsing Logic ---
// Helper function to parse effort string to minutes
function parseEffortStringToMinutesInternal(effortString: string): number | null {
  const lowerEffortString = effortString.toLowerCase();
  // Regex to capture different effort formats
  const effortRegex = /\b(?:(\d+)\s*(minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|months?|mo)|(an?|one)\s+(minute|min|m|hour|hr|h|day|d|week|w|month|mo)|(a\s+)?(half\s+hour|half\s+day)|(a\s+)?(couple|few|several)\s*(hours?|hrs?|h|days?|d|weeks?|w)|(quick|short|all\s+day|full\s+day|this\s+afternoon|long\s+term|big\s+project))\b/i;
  const match = lowerEffortString.match(effortRegex);

  if (!match) return null;

  let minutes = 0;
  const workDayHours = 8; // Assume 8 hours for "a day"

  // Case 1: "N units" (e.g., "30 minutes", "2 hours")
  if (match[1] && match[2]) {
      const value = parseInt(match[1]);
      const unit = match[2];
      if (unit.startsWith('m')) minutes = value; // minutes, min, m
      else if (unit.startsWith('h')) minutes = value * 60; // hours, hr, h
      else if (unit.startsWith('d')) minutes = value * workDayHours * 60; // days, d
      else if (unit.startsWith('w')) minutes = value * 5 * workDayHours * 60; // weeks, w (5 work days)
      else if (unit.startsWith('mo')) minutes = value * 20 * workDayHours * 60; // months, mo (20 work days)
      else return null;
      return minutes;
  }

  // Case 2: "a/an/one unit" (e.g., "an hour", "one day")
  if (match[3] && match[4]) {
      const unit = match[4];
      if (unit.startsWith('m')) minutes = 1;
      else if (unit.startsWith('h')) minutes = 1 * 60;
      else if (unit.startsWith('d')) minutes = 1 * workDayHours * 60;
      else if (unit.startsWith('w')) minutes = 1 * 5 * workDayHours * 60;
      else if (unit.startsWith('mo')) minutes = 1 * 20 * workDayHours * 60;
      else return null;
      return minutes;
  }

  // Case 3: "half hour/day" (e.g., "a half hour")
  if (match[6]) { // Matched group for 'half hour' or 'half day'
      const unitPhrase = match[6];
      if (unitPhrase.includes('hour')) minutes = 30;
      else if (unitPhrase.includes('day')) minutes = (workDayHours / 2) * 60;
      else return null;
      return minutes;
  }

  // Case 4: "couple/few/several units" (e.g., "a couple hours", "few days")
  if (match[8] && match[9]) { // Matched group for quantifier and unit
      const quantifier = match[8];
      const unit = match[9];
      let multiplier = 1;
      if (quantifier === 'couple') multiplier = 2;
      else if (quantifier === 'few') multiplier = 3;
      else if (quantifier === 'several') multiplier = 5;

      if (unit.startsWith('h')) minutes = multiplier * 60;
      else if (unit.startsWith('d')) minutes = multiplier * workDayHours * 60;
      else if (unit.startsWith('w')) minutes = multiplier * 5 * workDayHours * 60;
      else return null;
      return minutes;
  }
  
  // Case 5: Specific phrases
  if (match[10]) {
      const phrase = match[10];
      if (phrase === 'quick' || phrase === 'short') minutes = 15;
      else if (phrase === 'this afternoon') minutes = 3 * 60; // Approx 3 hours
      else if (phrase === 'all day' || phrase === 'full day') minutes = workDayHours * 60;
      else if (phrase === 'long term' || phrase === 'big project') minutes = 20 * workDayHours * 60; // Default to 1 month (20 work days)
      else return null;
      return minutes;
  }

  return null;
}

// Helper function to map minutes to EffortLevel
function mapMinutesToEffortLevelInternal(minutes: number): EffortLevel | null {
  if (minutes <= 0) return null;

  if (minutes <= 15) return 1;       // <= 15 min
  if (minutes <= 30) return 2;       // > 15 min to 30 min
  if (minutes <= 3 * 60) return 4;   // > 30 min to 3 hours (Few hours)
  if (minutes <= 8 * 60) return 8;   // > 3 hours to 8 hours (1 day)
  if (minutes <= 5 * 8 * 60) return 16; // > 1 day to 1 week (5 work days)
  if (minutes <= 10 * 8 * 60) return 32;// > 1 week to 2 weeks (10 work days)
  return 64;                          // > 2 weeks (1 month or more)
}

// Map effort string (potentially from Gemini) to EffortLevel using detailed parsing
export function mapEffortLevel(effortString: string | null): EffortLevel | null {
  if (!effortString) return null;
  const minutes = parseEffortStringToMinutesInternal(effortString);
  if (minutes === null || minutes < 0) return null; // Ensure minutes is non-negative
  return mapMinutesToEffortLevelInternal(minutes);
}
// --- END New Effort Parsing Logic ---

// Map priority string from Gemini to Priority
export function mapPriority(priorityString: string | null): Priority | null {
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

// Debounce utility function
export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): Promise<ReturnType<F>> => {
    if (timeout) {
      clearTimeout(timeout);
    }

    return new Promise(resolve => {
      timeout = setTimeout(() => {
        const result = func(...args);
        resolve(result);
      }, waitFor);
    });
  };
};
