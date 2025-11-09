import { useState } from 'react';
import { generateUUID } from '@/lib/utils';

interface UpdateAgentParams {
  agentId: string;
  featureDescription: string;
  connections?: string[];
}

interface AgentUpdateState {
  isUpdating: boolean;
  error: string | null;
  progress: string;
}

export function useAgentUpdater() {
  const [state, setState] = useState<AgentUpdateState>({
    isUpdating: false,
    error: null,
    progress: '',
  });

  const updateAgent = async ({ agentId, featureDescription, connections }: UpdateAgentParams) => {
    setState({
      isUpdating: true,
      error: null,
      progress: 'Starting feature addition...',
    });

    try {
      const requestId = generateUUID();

      const response = await fetch('/api/agent/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: requestId,
          agentId,
          featureDescription,
          connections,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update agent' }));
        throw new Error(errorData.message || 'Failed to update agent');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) {
            continue;
          }

          const data = line.slice(6); // Remove 'data: ' prefix

          if (data === '[DONE]') {
            continue;
          }

          try {
            const parsed = JSON.parse(data);

            // Handle different message types
            if (parsed.type === 'text-delta') {
              setState(prev => ({
                ...prev,
                progress: `Processing: ${parsed.textDelta || ''}`,
              }));
            } else if (parsed.type === 'data-finish') {
              setState(prev => ({
                ...prev,
                progress: 'Feature added successfully!',
              }));
            } else if (parsed.type === 'data-agentData') {
              setState(prev => ({
                ...prev,
                progress: 'Updating agent...',
              }));
            }
          } catch (e) {
            console.error('Failed to parse SSE data:', e);
          }
        }
      }

      setState({
        isUpdating: false,
        error: null,
        progress: 'Complete!',
      });

      // Return success
      return { success: true };
    } catch (error) {
      console.error('Error updating agent:', error);
      setState({
        isUpdating: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        progress: '',
      });
      throw error;
    }
  };

  return {
    ...state,
    updateAgent,
  };
}

