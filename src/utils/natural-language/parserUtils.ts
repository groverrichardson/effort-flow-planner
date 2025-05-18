
import { addDays, addWeeks, addMonths, parse, isValid } from 'date-fns';
import { Priority, EffortLevel } from '@/types';

// Converts date strings from Gemini to actual Date objects
export function parseDateFromString(dateString: string | null): Date | null {
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
export function mapEffortLevel(effortString: string | null): EffortLevel | null {
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
