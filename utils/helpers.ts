/**
 * Checks if the code is running on the server (Node.js) or in the browser
 * This is useful for conditionally running code that's only available in the browser
 */
export const isServer = (): boolean => {
  return typeof window === 'undefined';
};

/**
 * Generates a random UUID
 * Useful for creating unique identifiers
 */
export const generateUUID = (): string => {
  if (!isServer() && window.crypto) {
    // Use the Web Crypto API if available (modern browsers)
    return crypto.randomUUID();
  } else {
    // Fallback implementation for older browsers or server
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
};

/**
 * Formats a date object or string to a readable format
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Formats a time value in milliseconds to a human-readable format
 * E.g. "10ms", "1.2s", etc.
 */
export const formatExecutionTime = (time?: string | number | null): string => {
  if (!time) return 'N/A';
  
  const timeNum = typeof time === 'string' ? parseFloat(time) : time;
  
  if (isNaN(timeNum)) return 'N/A';
  
  // Time is usually in seconds from Judge0
  if (timeNum < 0.001) return '<0.001s';
  if (timeNum < 1) return `${timeNum.toFixed(3)}s`;
  return `${timeNum.toFixed(2)}s`;
};

/**
 * Formats a memory value in bytes to a human-readable format
 * E.g. "1.2 KB", "3.4 MB", etc.
 */
export const formatMemory = (memory?: string | number | null): string => {
  if (!memory) return 'N/A';
  
  const memoryNum = typeof memory === 'string' ? parseFloat(memory) : memory;
  
  if (isNaN(memoryNum)) return 'N/A';
  
  // Memory is usually in KB from Judge0
  if (memoryNum < 1024) return `${memoryNum.toFixed(0)} KB`;
  return `${(memoryNum / 1024).toFixed(2)} MB`;
}; 