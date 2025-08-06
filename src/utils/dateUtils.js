/**
 * Formats a date to dd/mm/yy format
 * @param {Date|string} date - The date to format (Date object or ISO string)
 * @returns {string} The formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) return '';
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const year = String(dateObj.getFullYear()).slice(-2); // Get last 2 digits of year
  
  return `${day}/${month}/${year}`;
};

/**
 * Formats a date with time to dd/mm/yy hh:mm format
 * @param {Date|string} date - The date to format (Date object or ISO string)
 * @returns {string} The formatted date and time string
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) return '';
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const year = String(dateObj.getFullYear()).slice(-2); // Get last 2 digits of year
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};