/**
 * Format a date string into a more readable format
 * 
 * This function takes a date string in the format YYYY-MM-DD
 * and returns a formatted date string like 'June 15, 2023'
 * 
 * @param {string} dateString - Date string in the format YYYY-MM-DD
 * @returns {string} Formatted date string
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const date = new Date(dateString);
  
  return date.toLocaleDateString('en-US', options);
}

/**
 * Format a date string into a short format
 * 
 * This function takes a date string in the format YYYY-MM-DD
 * and returns a formatted date string like 'Jun 15, 2023'
 * 
 * @param {string} dateString - Date string in the format YYYY-MM-DD
 * @returns {string} Formatted date string
 */
export function formatDateShort(dateString) {
  if (!dateString) return '';
  
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  const date = new Date(dateString);
  
  return date.toLocaleDateString('en-US', options);
}

/**
 * Format a time string
 * 
 * This function takes a time string and ensures it's in a consistent format
 * 
 * @param {string} timeString - Time string (e.g., "09:30 AM")
 * @returns {string} Formatted time string
 */
export function formatTime(timeString) {
  if (!timeString) return '';
  
  // For now, just return the original time string
  // This could be expanded to convert between 12/24 hour formats
  return timeString;
} 