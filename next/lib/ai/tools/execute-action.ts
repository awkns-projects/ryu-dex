import { generateUUID } from '@/lib/utils';
import { tool } from 'ai';
import { z } from 'zod';

interface ExecuteActionProps {
  dataStream: any; // UIMessageStreamWriter from AI SDK
  agentData?: any;
}

export const executeAction = ({ dataStream, agentData }: ExecuteActionProps) =>
  tool({
    description: `Execute one of the agent's predefined actions. 
    ONLY use action names that exist in the agent's "Available Actions" section.
    The action will execute its configured workflow steps automatically.`,
    inputSchema: z.object({
      actionName: z.string().describe('The exact name of the action to execute (must match one of the Available Actions)'),
      recordId: z.string().optional().describe('The ID of the record to execute the action on (if action operates on existing data)'),
      requiresConfirmation: z.boolean().default(true).describe('Whether to ask user for confirmation before executing'),
    }),
    execute: async ({
      actionName,
      recordId,
      requiresConfirmation,
    }) => {
      if (!agentData) {
        console.error('❌ executeAction: No agent data available');
        throw new Error('Unable to execute action: No agent is currently configured for this chat.');
      }

      // Find the action
      const action = agentData.actions?.find((a: any) =>
        a.name === actionName || a.title === actionName
      );

      if (!action) {
        const availableActions = agentData.actions?.map((a: any) => a.title || a.name).join(', ') || 'none';
        throw new Error(`Action "${actionName}" not found. Available actions: ${availableActions}`);
      }

      const executionId = generateUUID();

      // Prepare action parameters
      const parameters: Record<string, any> = {
        actionId: action.id,
        targetModel: action.targetModel,
      };

      if (recordId) {
        parameters.recordId = recordId;
      }

      if (action.steps && action.steps.length > 0) {
        parameters.steps = action.steps.map((s: any) => s.name).join(' → ');
      }

      // Send action data through the stream
      dataStream.write({
        type: 'data-action',
        data: {
          id: executionId,
          actionId: action.id,
          actionName: action.name,
          actionType: action.name,
          title: action.title || action.name,
          emoji: action.emoji,
          description: action.description || `Execute ${action.name} on ${action.targetModel}`,
          parameters,
          requiresConfirmation,
          confirmButtonText: 'Execute',
          status: requiresConfirmation ? 'pending' : 'executed',
        },
        transient: false,
      });

      if (requiresConfirmation) {
        return {
          executionId,
          actionName: action.name,
          status: 'pending_confirmation',
          message: `Action "${action.title || action.name}" is ready to execute. Waiting for user confirmation.`,
        };
      }

      return {
        executionId,
        actionName: action.name,
        status: 'executed',
        message: `Action "${action.title || action.name}" has been executed successfully.`,
      };
    },
  });

