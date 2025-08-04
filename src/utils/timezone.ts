/**
 * Manual timezone conversion utilities that actually work
 */

export const getUserTimezone = (): string => {
  return localStorage.getItem('userTimezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const setUserTimezone = (timezone?: string): void => {
  const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  localStorage.setItem('userTimezone', tz);
};

/**
 * Convert UTC timestamp to local time manually
 */
export const convertUTCToLocal = (utcTimestamp: string): Date => {
  // Create date from UTC timestamp
  const utcDate = new Date(utcTimestamp);
  
  // Get the timezone offset in minutes and convert to milliseconds
  const timezoneOffset = utcDate.getTimezoneOffset() * 60000;
  
  // Create a new date that represents the local time
  const localDate = new Date(utcDate.getTime() - timezoneOffset);
  
  return localDate;
};

/**
 * Format time in user's local timezone (HH:MM format)
 */
export const formatTimeInUserTimezone = (timestamp: string): string => {
  const localDate = convertUTCToLocal(timestamp);
  
  const hours = localDate.getHours().toString().padStart(2, '0');
  const minutes = localDate.getMinutes().toString().padStart(2, '0');
  
  return `${hours}:${minutes}`;
};

/**
 * Format date in user's timezone for display
 */
export const formatDateInUserTimezone = (timestamp: string): string => {
  const localDate = convertUTCToLocal(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Compare dates
  const isToday = localDate.toDateString() === today.toDateString();
  const isYesterday = localDate.toDateString() === yesterday.toDateString();
  
  if (isToday) {
    return 'Today';
  } else if (isYesterday) {
    return 'Yesterday';
  } else {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const weekday = weekdays[localDate.getDay()];
    const month = months[localDate.getMonth()];
    const day = localDate.getDate();
    const year = localDate.getFullYear();
    
    if (year !== today.getFullYear()) {
      return `${weekday}, ${month} ${day}, ${year}`;
    } else {
      return `${weekday}, ${month} ${day}`;
    }
  }
};

/**
 * Format full date and time in user's timezone
 */
export const formatDateTimeInUserTimezone = (timestamp: string): string => {
  const dateStr = formatDateInUserTimezone(timestamp);
  const timeStr = formatTimeInUserTimezone(timestamp);
  
  if (dateStr === 'Today') {
    return `Today at ${timeStr}`;
  } else {
    return `${dateStr} at ${timeStr}`;
  }
};

/**
 * Get just the date part (YYYY-MM-DD) in user's timezone
 */
export const getDateStringInUserTimezone = (timestamp: string): string => {
  const localDate = convertUTCToLocal(timestamp);
  const year = localDate.getFullYear();
  const month = (localDate.getMonth() + 1).toString().padStart(2, '0');
  const day = localDate.getDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Check if two timestamps are on the same date in user's timezone
 */
export const isSameDateInUserTimezone = (timestamp1: string, timestamp2: string): boolean => {
  return getDateStringInUserTimezone(timestamp1) === getDateStringInUserTimezone(timestamp2);
};
