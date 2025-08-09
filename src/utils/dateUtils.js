/**
 * Formats a date to dd-mm-yy format
 * @param {Date|string} date - The date to format (Date object or ISO string)
 * @returns {string} The formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  // If it's already in DD-MM-YY format, return it as is
  if (typeof date === 'string') {
    // Check if it's already in DD-MM-YY format (e.g., "23-09-25")
    const dateFormatRegex = /^\d{2}-\d{2}-\d{2}$/;
    if (dateFormatRegex.test(date)) {
      return date;
    }
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    // If invalid date but we have a string, return it as is
    return typeof date === 'string' ? date : '';
  }
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const year = String(dateObj.getFullYear()).slice(-2); // Get last 2 digits of year
  
  return `${day}-${month}-${year}`;
};

/**
 * Formats a date with time to dd-mm-yy hh:mm format
 * @param {Date|string} date - The date to format (Date object or ISO string)
 * @returns {string} The formatted date and time string
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  
  // If it's already in DD-MM-YY HH:MM format, return it as is
  if (typeof date === 'string') {
    // Check if it's already in DD-MM-YY HH:MM format (e.g., "23-09-25 14:30")
    const dateTimeFormatRegex = /^\d{2}-\d{2}-\d{2} \d{2}:\d{2}$/;
    if (dateTimeFormatRegex.test(date)) {
      return date;
    }
    
    // If it's in DD-MM-YY format, we should preserve it
    const dateFormatRegex = /^\d{2}-\d{2}-\d{2}$/;
    if (dateFormatRegex.test(date)) {
      return date;
    }
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    // If invalid date but we have a string, return it as is
    return typeof date === 'string' ? date : '';
  }
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const year = String(dateObj.getFullYear()).slice(-2); // Get last 2 digits of year
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  
  return `${day}-${month}-${year} ${hours}:${minutes}`;
};