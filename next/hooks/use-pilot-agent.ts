import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateUUID } from '@/lib/utils';

interface CreateAgentParams {
  agentName: string;
  agentDescription: string;
  connections?: string[];
}

interface AgentCreationState {
  isCreating: boolean;
  error: string | null;
  agentId: string | null;
  progress: string;
}

export function usePilotAgent() {
  const router = useRouter();
  const [state, setState] = useState<AgentCreationState>({
    isCreating: false,
    error: null,
    agentId: null,
    progress: '',
  });

  const createAgent = async ({ agentName, agentDescription, connections }: CreateAgentParams) => {
    setState({
      isCreating: true,
      error: null,
      agentId: null,
      progress: 'Starting agent creation...',
    });

    try {
      const requestId = generateUUID();

      const response = await fetch('/api/pilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: requestId,
          agentName,
          agentDescription,
          connections,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create agent' }));
        throw new Error(errorData.message || 'Failed to create agent');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let createdAgentId: string | null = null;

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
            if (parsed.type === 'data-id') {
              createdAgentId = parsed.data;
              setState(prev => ({
                ...prev,
                agentId: parsed.data,
              }));
            } else if (parsed.type === 'data-title') {
              setState(prev => ({
                ...prev,
                progress: `Creating agent: ${parsed.data}`,
              }));
            } else if (parsed.type === 'data-kind' && parsed.data === 'agent') {
              setState(prev => ({
                ...prev,
                progress: 'Setting up agent structure...',
              }));
            } else if (parsed.type === 'data-agentData') {
              setState(prev => ({
                ...prev,
                progress: 'Agent created successfully!',
              }));
            } else if (parsed.type === 'data-finish') {
              setState(prev => ({
                ...prev,
                progress: 'Finalizing...',
              }));
            } else if (parsed.type === 'text-delta') {
              // AI reasoning text
              setState(prev => ({
                ...prev,
                progress: `Processing: ${parsed.textDelta || ''}`,
              }));
            }
          } catch (e) {
            console.error('Failed to parse SSE data:', e);
          }
        }
      }

      if (createdAgentId) {
        setState({
          isCreating: false,
          error: null,
          agentId: createdAgentId,
          progress: 'Complete!',
        });

        // Redirect to the created agent
        setTimeout(() => {
          router.push(`/en/agent/${createdAgentId}`);
        }, 1000);
      } else {
        throw new Error('Agent creation completed but no agent ID was returned');
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      setState({
        isCreating: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        agentId: null,
        progress: '',
      });
    }
  };

  return {
    ...state,
    createAgent,
  };
}

