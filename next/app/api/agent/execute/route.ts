import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';
import { myProvider } from '@/lib/ai/providers';
import {
  getFullAgentWithModelsAndActions,
  getAgentRecordById,
  updateAgentRecord,
  createAgentExecution,
  updateAgentExecution,
  createAgentRecord,
  getAgentRecordsByModelId
} from '@/lib/db/agent-queries';
import { ChatSDKError } from '@/lib/errors';
import { buildStepOutputSchema, buildStepInputContext } from '@/lib/ai/schema-builder';
import { executeActionOnRecord } from '@/lib/agent-execution';

export async function POST(request: NextRequest) {
  // Get session using Better Auth API
  const session = await auth.api.getSession({
    headers: request.headers
  });

  if (!session?.user) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  try {
    const body = await request.json();
    const { agentId, actionId, recordId, modelId, targetModel } = body;

    if (!agentId || !actionId || !recordId || !modelId) {
      return Response.json(
        { error: 'Missing required fields', details: { agentId, actionId, recordId, modelId } },
        { status: 400 }
      );
    }

    console.log('🚀 Executing action:', { agentId, actionId, recordId, modelId, targetModel });

    // Get agent and verify ownership
    const agent = await getFullAgentWithModelsAndActions(agentId);
    if (!agent || agent.agent.userId !== session.user.id) {
      return new ChatSDKError('forbidden:chat').toResponse();
    }

    // Find the action with detailed logging
    console.log('�� Looking for action:', actionId, 'in actions:', agent.actions.map(a => ({ id: a.id, name: a.name })));
    const action = agent.actions.find(a => a.id === actionId);
    if (!action) {
      return Response.json({
        error: 'Action not found',
        details: {
          actionId,
          availableActions: agent.actions.map(a => ({ id: a.id, name: a.name }))
        }
      }, { status: 404 });
    }

    // Verify action target model matches
    if (action.targetModel !== targetModel) {
      return Response.json({
        error: 'Action target model mismatch',
        details: {
          expected: action.targetModel,
          received: targetModel
        }
      }, { status: 400 });
    }

    // Get the record with detailed logging
    console.log('�� Looking for record:', recordId, 'in model:', modelId);
    const record = await getAgentRecordById(recordId);
    if (!record) {
      console.log('❌ Record not found in database for ID:', recordId);

      // Try to find record in the agent data (might be in-memory only)
      const targetModel = agent.models.find(m => m.name === action.targetModel);
      const inMemoryRecord = targetModel?.records?.find((r: any) => r.id === recordId);

      if (inMemoryRecord && targetModel) {
        console.log('✅ Found record in memory, need to save it first...');

        // Check if a record with the same data already exists in database
        const existingRecords = await getAgentRecordsByModelId(targetModel.id);
        const existingRecord = existingRecords.find((dbRecord: any) => {
          const dbData = dbRecord.data as any;
          const memoryData = inMemoryRecord as any;
          return dbData.name === memoryData.name &&
            dbData.species === memoryData.species &&
            dbData.age === memoryData.age;
        });

        if (existingRecord) {
          console.log('✅ Found existing database record, using it:', existingRecord.id);
          const result = await executeActionOnRecord(action, existingRecord, agent);
          return Response.json({
            success: true,
            executionId: `exec_${Date.now()}`,
            updatedRecord: result.finalData,
            stepResults: result.stepResults,
            executionMetrics: result.executionMetrics,
            message: `Successfully executed "${action.name}" on record`,
          });
        } else {
          console.log('💾 Creating new database record...');
          const savedRecord = await createAgentRecord({
            modelId: targetModel.id,
            data: inMemoryRecord,
          });
          console.log('💾 Created database record:', savedRecord.id);
          const result = await executeActionOnRecord(action, savedRecord, agent);
          return Response.json({
            success: true,
            executionId: `exec_${Date.now()}`,
            updatedRecord: result.finalData,
            stepResults: result.stepResults,
            executionMetrics: result.executionMetrics,
            message: `Successfully executed "${action.name}" on record`,
          });
        }
      } else {
        console.log('❌ Record not found in memory either');
        return Response.json({
          error: 'Record not found',
          details: `Record ID ${recordId} not found in database or memory`
        }, { status: 404 });
      }
    }

    console.log('📊 Action:', action.name, 'on record:', record.data);

    // Execute with the database record using shared logic
    const result = await executeActionOnRecord(action, record, agent);

    // Check if any step requires OAuth
    const oauthStep = result.stepResults?.find((sr: any) => sr.outputs?.requiresOAuth);
    
    if (oauthStep) {
      console.log('🔐 OAuth required - returning OAuth config to frontend');
      return Response.json({
        success: false,
        requiresOAuth: true,
        provider: oauthStep.outputs.provider,
        scopes: oauthStep.outputs.scopes,
        outputField: oauthStep.outputs.outputField,
        requiresExisting: oauthStep.outputs.requiresExisting,
        agentId,
        recordId,
        actionId,
        message: `OAuth authentication required for ${oauthStep.outputs.provider}`,
      });
    }

    return Response.json({
      success: true,
      executionId: `exec_${Date.now()}`, // Generate a simple execution ID
      updatedRecord: result.finalData,
      stepResults: result.stepResults,
      executionMetrics: result.executionMetrics,
      message: `Successfully executed "${action.name}" on record`,
    });

  } catch (error) {
    console.error('❌ Action execution error:', error);
    return Response.json(
      {
        error: 'Action execution failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}



