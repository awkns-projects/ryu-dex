/**
 * Schedule API utilities for mobile app
 * Uses the same backend endpoints as the web app
 */

import { getApiUrl } from '../api-config';
import { authenticatedFetch } from '../authenticated-fetch';
import { authClient } from '../auth-client';

export interface ScheduleFilter {
  field: string;
  operator: string;
  value: any;
}

export interface ScheduleQuery {
  filters: ScheduleFilter[];
  logic: 'AND' | 'OR';
}

export interface ScheduleStep {
  id?: string;
  modelId: string;
  modelName?: string;
  query: ScheduleQuery | string; // NEW: Structured query OR legacy string
  actionId: string;
  actionName?: string;
  order: number;
}

export interface Schedule {
  id: string;
  agentId: string;
  name: string;
  mode: 'once' | 'recurring';
  intervalHours?: number;
  status: 'active' | 'paused';
  nextRunAt?: string;
  lastRunAt?: string;
  steps: ScheduleStep[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleData {
  agentId: string;
  name: string;
  mode: 'once' | 'recurring';
  intervalHours?: number;
  steps: Omit<ScheduleStep, 'id'>[];
}

export interface UpdateScheduleData {
  name: string;
  mode: 'once' | 'recurring';
  intervalHours?: number;
  steps: ScheduleStep[];
}

/**
 * Fetch all schedules for an agent
 */
export async function fetchSchedules(agentId: string): Promise<{ schedules: Schedule[] }> {
  return authenticatedFetch<{ schedules: Schedule[] }>({
    path: `/api/agent/schedule?agentId=${agentId}`,
    method: 'GET',
  });
}

/**
 * Create a new schedule
 */
export async function createSchedule(data: CreateScheduleData): Promise<{ schedule: Schedule }> {
  return authenticatedFetch<{ schedule: Schedule }>({
    path: '/api/agent/schedule',
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update an existing schedule
 */
export async function updateSchedule(id: string, data: UpdateScheduleData): Promise<{ schedule: Schedule }> {
  return authenticatedFetch<{ schedule: Schedule }>({
    path: `/api/agent/schedule/${id}`,
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Delete a schedule
 */
export async function deleteSchedule(id: string): Promise<{ schedule: Schedule }> {
  return authenticatedFetch<{ schedule: Schedule }>({
    path: `/api/agent/schedule/${id}`,
    method: 'DELETE',
  });
}

/**
 * Toggle schedule status (active/paused)
 */
export async function toggleSchedule(id: string): Promise<{ schedule: Schedule }> {
  return authenticatedFetch<{ schedule: Schedule }>({
    path: `/api/agent/schedule/${id}/toggle`,
    method: 'POST',
  });
}

/**
 * Execute a schedule
 * Note: This returns a Response object with streaming data
 * For React Native, we'll need to handle the stream differently
 */
export async function executeSchedule(scheduleId: string): Promise<Response> {
  const url = getApiUrl('/api/agent/schedule/run');

  // Check if we have a valid session
  try {
    const sessionResult = await authClient.getSession();
    const session = 'data' in sessionResult ? sessionResult.data : null;

    console.log('🔐 Session check for execution:');
    console.log('🔐 Is authenticated:', !!session?.user);
    console.log('🔐 User:', session?.user?.email);

    if (!session?.user) {
      throw new Error('Please log in to continue');
    }
  } catch (error) {
    console.error('❌ Session check failed:', error);
    throw new Error('Authentication check failed. Please log in again.');
  }

  // Log for debugging
  console.log(`🌐 POST ${url}`);

  // Build headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  console.log('📤 Making authenticated request for schedule execution');

  // For web (Next.js), use 'include' to send cookies automatically
  // For React Native, Better Auth handles session storage via AsyncStorage
  const isWeb = typeof window !== 'undefined' && typeof window.document !== 'undefined';
  const response = await fetch(url, {
    method: 'POST',
    headers,
    credentials: isWeb ? 'include' : 'omit',
    body: JSON.stringify({ scheduleId }),
  });

  // Log response status
  console.log(`📡 Response status: ${response.status}`);

  if (!response.ok) {
    console.error(`❌ Request failed with status ${response.status}`);
    if (response.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    }
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response;
}

/**
 * Trigger a cron examination for all agents or a specific agent.
 * This calls the authenticated proxy endpoint which forwards to the cron route.
 */
export async function triggerCron(agentId?: string): Promise<{ ok: boolean; status: number; data: any }> {
  const url = getApiUrl('/api/agent/cron/trigger');

  // Ensure user is authenticated
  const sessionResult = await authClient.getSession();
  const session = 'data' in sessionResult ? sessionResult.data : null;

  if (!session?.user) {
    throw new Error('Please log in to continue');
  }

  const headers: HeadersInit = { 'Content-Type': 'application/json' };

  // For web (Next.js), use 'include' to send cookies automatically
  // For React Native, Better Auth handles session storage via AsyncStorage
  const isWeb = typeof window !== 'undefined' && typeof window.document !== 'undefined';
  const res = await fetch(url, {
    method: 'POST',
    headers,
    credentials: isWeb ? 'include' : 'omit',
    body: JSON.stringify(agentId ? { agentId } : {}),
  });

  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

/**
 * Fetch execution logs for a schedule
 */
export async function fetchExecutionLogs(scheduleId: string): Promise<{ executions: any[] }> {
  return authenticatedFetch<{ executions: any[] }>({
    path: `/api/agent/schedule/${scheduleId}/executions`,
    method: 'GET',
  });
}

