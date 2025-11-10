/**
 * API configuration for the app
 * Centralizes the base URL for API calls
 */

// For development, this should match your local network IP
// For production, this would be your production API URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Get the full API URL for a given path
 * Handles both absolute and relative paths
 */
export function getApiUrl(path: string): string {
  // If path already starts with http, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // If in web environment and Next.js is available, use relative paths
  if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
    // We're on web (Next.js), use relative paths
    return path.startsWith('/') ? path : `/${path}`;
  }

  // Otherwise (React Native), use full base URL
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

