/**
 * Authenticated fetch utility for making API calls with Better Auth
 * Handles authentication cookies and headers automatically
 */

import { authClient } from './auth-client';
import { getApiUrl } from './api-config';

export interface AuthenticatedFetchOptions extends Omit<RequestInit, 'headers'> {
  /** Relative API path (e.g., '/api/agent') */
  path: string;
  /** Additional headers to include */
  headers?: Record<string, string>;
  /** Whether to require authentication (default: true) */
  requireAuth?: boolean;
  /** Whether to throw on non-2xx responses (default: true) */
  throwOnError?: boolean;
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Not authenticated') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Make an authenticated API request
 * Automatically handles Better Auth cookies and authentication
 * 
 * @example
 * ```typescript
 * // GET request
 * const agents = await authenticatedFetch({
 *   path: '/api/agent',
 *   method: 'GET'
 * });
 * 
 * // POST request
 * const newAgent = await authenticatedFetch({
 *   path: '/api/agent/from-template',
 *   method: 'POST',
 *   body: JSON.stringify({ templateId: 'customer-support' })
 * });
 * ```
 */
export async function authenticatedFetch<T = any>(
  options: AuthenticatedFetchOptions
): Promise<T> {
  const {
    path,
    headers: customHeaders = {},
    requireAuth = true,
    throwOnError = true,
    ...fetchOptions
  } = options;

  // Get the full URL
  const url = getApiUrl(path);

  // Log for debugging
  console.log(`🌐 ${fetchOptions.method || 'GET'} ${url}`);

  // Check authentication if required
  if (requireAuth) {
    try {
      const sessionResult = await authClient.getSession();
      const session = 'data' in sessionResult ? sessionResult.data : null;

      if (!session?.user) {
        console.error('❌ Authentication required but no valid session');
        throw new AuthenticationError('Please log in to continue');
      }

      console.log('🔐 Authenticated as:', session.user.email);
    } catch (error) {
      console.error('❌ Session check failed:', error);
      throw new AuthenticationError('Authentication check failed. Please log in again.');
    }
  }

  // Build headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  // Make the request
  // For web (Next.js), use 'include' to send cookies automatically
  // For React Native, Better Auth handles session storage via AsyncStorage
  const isWeb = typeof window !== 'undefined' && typeof window.document !== 'undefined';
  const response = await fetch(url, {
    ...fetchOptions,
    credentials: isWeb ? 'include' : 'omit',
    headers,
  });

  // Handle response
  if (!response.ok) {
    const status = response.status;
    console.error(`❌ Request failed with status ${status}`);

    // Handle 401 Unauthorized
    if (status === 401) {
      throw new AuthenticationError('Authentication failed. Please log in again.');
    }

    // Try to parse error message from response
    let errorData;
    let errorMessage = `Request failed with status ${status}`;

    try {
      errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // Failed to parse JSON, use default message
    }

    if (throwOnError) {
      throw new ApiError(errorMessage, status, errorData);
    }
  }

  // Parse and return response
  const data = await response.json();
  console.log('✅ Request successful');
  return data as T;
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: <T = any>(path: string, options?: Omit<AuthenticatedFetchOptions, 'path' | 'method'>) =>
    authenticatedFetch<T>({ ...options, path, method: 'GET' }),

  post: <T = any>(path: string, body?: any, options?: Omit<AuthenticatedFetchOptions, 'path' | 'method' | 'body'>) =>
    authenticatedFetch<T>({
      ...options,
      path,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    }),

  put: <T = any>(path: string, body?: any, options?: Omit<AuthenticatedFetchOptions, 'path' | 'method' | 'body'>) =>
    authenticatedFetch<T>({
      ...options,
      path,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined
    }),

  delete: <T = any>(path: string, options?: Omit<AuthenticatedFetchOptions, 'path' | 'method'>) =>
    authenticatedFetch<T>({ ...options, path, method: 'DELETE' }),
};

