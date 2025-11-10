import 'server-only';
import { auth } from './auth';
import { headers } from 'next/headers';

/**
 * Get the current session on the server side
 */
export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth() {
  const session = await getServerSession();

  if (!session) {
    throw new Error('Unauthorized - Please sign in');
  }

  return session;
}

/**
 * Get user from session
 */
export async function getCurrentUser() {
  const session = await getServerSession();
  return session?.user || null;
}

