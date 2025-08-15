/**
 * Utility functions for date formatting
 */

/**
 * Formats a date string to a human-readable format
 * Handles various date formats and provides fallbacks
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Unknown date';
  
  try {
    // Handle different date formats that might come from the backend
    let date: Date;
    
    // If it's already a valid ISO string, use it directly
    if (dateString.includes('T') || dateString.includes('Z')) {
      date = new Date(dateString);
    } else {
      // For other formats, try to parse them more carefully
      // Remove any timezone info and ensure it's in a standard format
      const cleanDateString = dateString.replace(/[+-]\d{2}:?\d{2}$/, '').trim();
      
      // Try different parsing approaches
      if (cleanDateString.includes('-')) {
        // ISO-like format (YYYY-MM-DD)
        date = new Date(cleanDateString + 'T00:00:00');
      } else if (cleanDateString.includes('/')) {
        // US format (MM/DD/YYYY)
        const parts = cleanDateString.split('/');
        if (parts.length === 3) {
          date = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
        } else {
          date = new Date(cleanDateString);
        }
      } else {
        // Fallback to standard parsing
        date = new Date(cleanDateString);
      }
    }
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return 'Unknown date';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error, 'Date string:', dateString);
    return 'Unknown date';
  }
};

/**
 * Formats a date string to a relative time (e.g., "2 days ago")
 */
export const formatRelativeTime = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Unknown time';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Unknown time';
    }
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffInSeconds / 31536000);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  } catch (error) {
    console.error('Error formatting relative time:', error, 'Date string:', dateString);
    return 'Unknown time';
  }
};

/**
 * Formats a date string to a short format (e.g., "Dec 15, 2024")
 */
export const formatShortDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Unknown date';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Unknown date';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting short date:', error, 'Date string:', dateString);
    return 'Unknown date';
  }
};

/**
 * Formats a date string to include time (e.g., "Dec 15, 2024 at 2:30 PM")
 */
export const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Unknown date';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Unknown date';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting date time:', error, 'Date string:', dateString);
    return 'Unknown date';
  }
};
