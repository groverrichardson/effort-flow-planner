/**
 * Date utility functions for test automation
 * 
 * Provides helper functions for working with dates in test scenarios.
 */

/**
 * Gets today's date as a string in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  const today = new Date();
  return formatDateToYYYYMMDD(today);
}

/**
 * Gets tomorrow's date as a string in YYYY-MM-DD format
 */
export function getTomorrowDateString(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDateToYYYYMMDD(tomorrow);
}

/**
 * Gets yesterday's date as a string in YYYY-MM-DD format
 */
export function getYesterdayDateString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDateToYYYYMMDD(yesterday);
}

/**
 * Formats a date object to YYYY-MM-DD string
 */
export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a date string for input in a date field
 * Different browsers and platforms may need different formats
 * 
 * @param dateString Date string in YYYY-MM-DD format
 * @returns Formatted date string for input fields
 */
export function formatDateForInput(dateString: string): string {
  // Default to YYYY-MM-DD format as it works on most browsers
  return dateString;
}

/**
 * Adds days to a date string
 * 
 * @param dateString Date string in YYYY-MM-DD format
 * @param days Number of days to add (negative to subtract)
 * @returns New date string in YYYY-MM-DD format
 */
export function addDaysToDate(dateString: string, days: number): string {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return formatDateToYYYYMMDD(date);
}

/**
 * Formats a date for display in the UI
 * This matches the format used in the application
 * 
 * @param dateString Date string in YYYY-MM-DD format
 * @returns Formatted date string for UI display
 */
export function formatDateForDisplay(dateString: string): string {
  const date = new Date(dateString);
  
  // Format to "Mon DD, YYYY" (e.g. "Jan 01, 2023")
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  };
  
  return date.toLocaleDateString('en-US', options);
}
