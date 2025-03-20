/**
 * Generates initials from a name
 * @param name - The name to generate initials from
 * @returns The initials (up to 2 characters)
 */
export const getInitials = (name?: string): string => {
  if (!name) return '?';
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Generates a background color based on a string (e.g., user ID or name)
 * @param str - The string to generate a color from
 * @returns A CSS-compatible color string
 */
export const getAvatarBgColor = (str?: string): string => {
  if (!str) return '#2C3539';
  
  // Generate a hash from the string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert hash to a color (HSL for better distribution)
  const h = Math.abs(hash % 360);
  return `hsl(${h}, 70%, 40%)`;
};

/**
 * Generates an avatar URL from Supabase storage or returns null if not available
 * @param url - The avatar URL from storage
 * @returns The full avatar URL with transformation parameters or null
 */
export const getAvatarUrl = (url?: string): string | null => {
  if (!url) return null;
  
  // Add transformation parameters if needed
  if (url.includes('supabase.co/storage')) {
    return `${url}?width=80&height=80`;
  }
  
  return url;
}; 