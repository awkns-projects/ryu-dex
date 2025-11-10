import 'server-only';

import { prisma } from './prisma';
import type {
  Agent,
  AgentModel,
  AgentAction,
  AgentStep,
  AgentRecord,
  AgentExecution,
  AgentSchedule,
  AgentScheduleStep,
} from '@prisma/client';

// Re-export types
export type {
  Agent,
  AgentModel,
  AgentAction,
  AgentStep,
  AgentRecord,
  AgentExecution,
  AgentSchedule,
  AgentScheduleStep,
};

// ============================================================================
// AGENT CRUD
// ============================================================================

export async function createAgent(data: {
  title: string;
  name: string;
  description?: string;
  templateId?: string;
  image?: string;
  features?: any[];
  connections?: any[];
  userId: string;
}): Promise<Agent> {
  return await prisma.agent.create({
    data: {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });
}

export async function getAgentsByUserId(userId: string): Promise<Agent[]> {
  return await prisma.agent.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getAgentById(id: string): Promise<Agent | null> {
  return await prisma.agent.findUnique({
    where: { id }
  });
}

export async function updateAgent(id: string, data: Partial<{
  title: string;
  name: string;
  description: string;
}>): Promise<Agent> {
  return await prisma.agent.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    }
  });
}

export async function deleteAgent(id: string): Promise<void> {
  await prisma.agent.delete({
    where: { id }
  });
}

// ============================================================================
// AGENT MODEL CRUD
// ============================================================================

export async function createAgentModel(data: {
  agentId: string;
  name: string;
  fields: any[];
  forms?: any[];
}): Promise<AgentModel> {
  return await prisma.agentModel.create({
    data: {
      ...data,
      forms: data.forms || [],
      createdAt: new Date(),
    }
  });
}

export async function getAgentModelsByAgentId(agentId: string): Promise<AgentModel[]> {
  return await prisma.agentModel.findMany({
    where: { agentId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getAgentModelById(id: string): Promise<AgentModel | null> {
  return await prisma.agentModel.findUnique({
    where: { id }
  });
}

// ============================================================================
// AGENT ACTION CRUD
// ============================================================================

export async function createAgentAction(data: {
  agentId: string;
  modelId: string;
  name: string;
  title?: string;
  emoji?: string;
  description?: string;
  inputFields: string[];
  outputFields: string[];
}): Promise<AgentAction> {
  return await prisma.agentAction.create({
    data: {
      ...data,
      createdAt: new Date(),
    }
  });
}

export async function getAgentActionsByAgentId(agentId: string): Promise<AgentAction[]> {
  return await prisma.agentAction.findMany({
    where: { agentId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getAgentActionById(id: string): Promise<AgentAction | null> {
  return await prisma.agentAction.findUnique({
    where: { id }
  });
}

export async function updateAgentAction(id: string, data: Partial<{
  name: string;
  title: string;
  description: string;
  modelId: string;
}>): Promise<AgentAction> {
  return await prisma.agentAction.update({
    where: { id },
    data
  });
}

export async function deleteAgentAction(id: string): Promise<void> {
  await prisma.agentAction.delete({
    where: { id }
  });
}

// ============================================================================
// AGENT STEP CRUD
// ============================================================================

export async function createAgentStep(data: {
  actionId: string;
  name: string;
  type: 'ai_reasoning' | 'web_search' | 'custom' | 'image_generation';
  config: any;
  order: string;
}): Promise<AgentStep> {
  return await prisma.agentStep.create({
    data: {
      actionId: data.actionId,
      name: data.name,
      type: data.type,
      config: data.config,
      order: parseInt(data.order), // Convert string to number for Prisma
      createdAt: new Date(),
    }
  });
}

export async function getAgentStepsByActionId(actionId: string): Promise<AgentStep[]> {
  return await prisma.agentStep.findMany({
    where: { actionId },
    orderBy: { order: 'asc' }
  });
}

export async function updateAgentStep(id: string, data: Partial<{
  name: string;
  type: 'ai_reasoning' | 'web_search' | 'custom' | 'image_generation';
  config: any;
  order: string;
}>): Promise<AgentStep> {
  const updateData: Record<string, any> = {};

  if (data.name) updateData.name = data.name;
  if (data.type) updateData.type = data.type;
  if (data.config) updateData.config = data.config;
  if (data.order) updateData.order = parseInt(data.order);

  return await prisma.agentStep.update({
    where: { id },
    data: updateData
  });
}

export async function deleteAgentStep(id: string): Promise<void> {
  await prisma.agentStep.delete({
    where: { id }
  });
}

// ============================================================================
// AGENT RECORD CRUD
// ============================================================================

export async function createAgentRecord(data: {
  modelId: string;
  data: any;
}): Promise<AgentRecord> {
  return await prisma.agentRecord.create({
    data: {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });
}

export async function getAgentRecordsByModelId(modelId: string): Promise<AgentRecord[]> {
  return await prisma.agentRecord.findMany({
    where: {
      modelId,
      deletedAt: null, // Only non-deleted records
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function countAgentRecordsByModelId(modelId: string): Promise<number> {
  return await prisma.agentRecord.count({
    where: {
      modelId,
      deletedAt: null, // Only count non-deleted records
    }
  });
}

export async function getAgentRecordById(id: string): Promise<AgentRecord | null> {
  return await prisma.agentRecord.findUnique({
    where: { id }
  });
}

export async function updateAgentRecord(id: string, data: any): Promise<AgentRecord> {
  // Get existing record to merge data
  const existingRecord = await getAgentRecordById(id);

  if (!existingRecord) {
    throw new Error(`Record ${id} not found`);
  }

  // Merge new data with existing data (preserves fields not being updated)
  const existingData = (existingRecord.data || {}) as Record<string, any>;
  const mergedData = {
    ...existingData,  // Existing fields
    ...data,          // New/updated fields (overwrites duplicates)
  };

  console.log('🔄 Merging record data:', {
    recordId: id,
    existingFields: Object.keys(existingData),
    newFields: Object.keys(data),
    mergedFields: Object.keys(mergedData),
  });

  return await prisma.agentRecord.update({
    where: { id },
    data: {
      data: mergedData,  // ✅ Merged data preserves all fields
      updatedAt: new Date(),
    }
  });
}

export async function deleteAgentRecord(id: string): Promise<AgentRecord> {
  // Soft delete: Set deletedAt timestamp
  return await prisma.agentRecord.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      updatedAt: new Date(),
    }
  });
}

// ============================================================================
// AGENT EXECUTION CRUD
// ============================================================================

export async function createAgentExecution(data: {
  recordId: string;
  actionId: string;
  scheduleId?: string;
  status?: 'pending' | 'running' | 'completed' | 'failed';
}): Promise<AgentExecution> {
  return await prisma.agentExecution.create({
    data: {
      ...data,
      status: data.status || 'pending',
      createdAt: new Date(),
    }
  });
}

export async function updateAgentExecution(id: string, data: {
  status?: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  totalTokens?: number;
  inputTokens?: number;
  outputTokens?: number;
  executionTimeMs?: number;
}): Promise<AgentExecution> {
  return await prisma.agentExecution.update({
    where: { id },
    data: {
      ...data,
      completedAt: data.status === 'completed' || data.status === 'failed'
        ? new Date()
        : undefined,
    }
  });
}

export async function getAgentExecutionsByRecordId(recordId: string): Promise<AgentExecution[]> {
  return await prisma.agentExecution.findMany({
    where: { recordId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getAgentExecutionById(id: string): Promise<AgentExecution | null> {
  return await prisma.agentExecution.findUnique({
    where: { id }
  });
}

// ============================================================================
// SCHEDULE CRUD
// ============================================================================

export async function createAgentSchedule(data: {
  agentId: string;
  name: string;
  mode: 'once' | 'recurring';
  intervalHours?: string;
  status?: 'active' | 'paused';
  nextRunAt?: Date;
}): Promise<AgentSchedule> {
  return await prisma.agentSchedule.create({
    data: {
      ...data,
      intervalHours: data.intervalHours ? parseInt(data.intervalHours) : null,
      status: data.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });
}

export async function createAgentScheduleStep(data: {
  scheduleId: string;
  modelId: string;
  query?: any;
  actionId: string;
  order: number;
}): Promise<AgentScheduleStep> {
  return await prisma.agentScheduleStep.create({
    data: {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });
}

export async function getAgentSchedulesByAgentId(agentId: string): Promise<AgentSchedule[]> {
  return await prisma.agentSchedule.findMany({
    where: { agentId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getAgentScheduleStepsByScheduleId(scheduleId: string): Promise<AgentScheduleStep[]> {
  return await prisma.agentScheduleStep.findMany({
    where: { scheduleId },
    orderBy: { order: 'desc' }
  });
}

// ============================================================================
// COMPLEX QUERIES
// ============================================================================

export async function getAgentSummary(agentId: string) {
  const agentData = await getAgentById(agentId);
  if (!agentData) return null;

  const models = await getAgentModelsByAgentId(agentId);
  const actions = await getAgentActionsByAgentId(agentId);

  // Count total steps across all actions
  const stepCounts = await Promise.all(
    actions.map(action =>
      prisma.agentStep.count({ where: { actionId: action.id } })
    )
  );
  const totalSteps = stepCounts.reduce((sum, count) => sum + count, 0);

  // Count total records across all models
  const recordCounts = await Promise.all(
    models.map(model => countAgentRecordsByModelId(model.id))
  );
  const totalRecords = recordCounts.reduce((sum, count) => sum + count, 0);

  return {
    agent: agentData,
    modelsCount: models.length,
    actionsCount: actions.length,
    totalSteps,
    totalRecords,
  };
}

export async function getFullAgentWithModelsAndActions(agentId: string) {
  const agentData = await prisma.agent.findUnique({
    where: { id: agentId },
    include: {
      models: {
        include: {
          records: {
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' }
          }
        }
      },
      actions: {
        include: {
          steps: {
            orderBy: { order: 'asc' }
          }
        }
      },
      schedules: {
        include: {
          steps: {
            include: {
              model: {
                select: { name: true }
              },
              action: {
                select: { name: true }
              }
            },
            orderBy: { order: 'asc' }
          }
        }
      }
    }
  });

  if (!agentData) return null;

  // Format actions with enhanced steps
  const actionsWithSteps = agentData.actions.map(action => {
    const targetModel = agentData.models.find(m => m.id === action.modelId);

    const enhancedSteps = action.steps.map(step => ({
      ...step,
      inputFields: (step.config as any)?.inputFields || [],
      outputFields: (step.config as any)?.outputFields || [],
    }));

    return {
      ...action,
      steps: enhancedSteps,
      targetModel: targetModel?.name,
    };
  });

  // Format schedules with enriched steps
  const schedulesWithSteps = agentData.schedules.map(schedule => ({
    ...schedule,
    steps: schedule.steps.map(step => ({
      ...step,
      modelName: step.model.name,
      actionName: step.action.name,
    }))
  }));

  return {
    agent: {
      id: agentData.id,
      title: agentData.title,
      name: agentData.name,
      description: agentData.description,
      templateId: agentData.templateId,
      image: agentData.image,
      features: agentData.features,
      connections: agentData.connections,
      userId: agentData.userId,
      createdAt: agentData.createdAt,
      updatedAt: agentData.updatedAt,
    },
    models: agentData.models.map(model => ({
      ...model,
      records: model.records
    })),
    actions: actionsWithSteps,
    schedules: schedulesWithSteps,
    features: agentData.features || [],
    connections: agentData.connections || [],
  };
}

export async function executeAgentActionOnRecord(
  recordId: string,
  actionId: string
): Promise<AgentExecution> {
  // Create execution record
  const execution = await createAgentExecution({
    recordId,
    actionId,
    status: 'pending',
  });

  // Get the action and its steps
  const action = await getAgentActionById(actionId);
  if (!action) {
    throw new Error(`Action ${actionId} not found`);
  }

  const steps = await getAgentStepsByActionId(actionId);
  const record = await getAgentRecordById(recordId);
  if (!record) {
    throw new Error(`Record ${recordId} not found`);
  }

  try {
    // Update status to running
    await updateAgentExecution(execution.id, { status: 'running' });

    // Execute steps sequentially
    const stepResults: Record<string, any> = {};

    for (const step of steps) {
      // This would integrate with the actual step execution logic
      // For now, we'll just simulate the execution
      stepResults[step.name] = {
        stepId: step.id,
        type: step.type,
        config: step.config,
        result: `Mock result for ${step.name}`,
        executedAt: new Date(),
      };
    }

    // Update execution with results
    await updateAgentExecution(execution.id, {
      status: 'completed',
      result: stepResults,
    });

    // Update the record with output fields
    const updatedRecordData: Record<string, any> = typeof record.data === 'object' && record.data !== null
      ? { ...record.data as any }
      : {};

    const outputFields = action.outputFields as any[];
    if (outputFields && Array.isArray(outputFields)) {
      for (const outputField of outputFields) {
        // This would contain the actual processed data
        updatedRecordData[outputField as string] = `Processed value for ${outputField}`;
      }
    }

    await updateAgentRecord(recordId, updatedRecordData);

    return await getAgentExecutionById(execution.id) as AgentExecution;
  } catch (error) {
    await updateAgentExecution(execution.id, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

// Get all active recurring schedules for cron processing
export async function getAllActiveSchedules(limit: number = 100) {
  const schedules = await prisma.agentSchedule.findMany({
    where: {
      status: 'active',
      mode: 'recurring'
    },
    include: {
      steps: true
    },
    orderBy: [
      { lastRunAt: 'asc' }, // NULL values (never run) come first
      { createdAt: 'asc' }
    ],
    take: limit
  });

  return schedules;
}

// Update a schedule's properties
export async function updateAgentSchedule(scheduleId: string, updates: {
  status?: 'active' | 'paused';
  lastRunAt?: string;
  nextRunAt?: string;
}): Promise<AgentSchedule> {
  const updateData: any = {
    updatedAt: new Date(),
  };

  if (updates.status) updateData.status = updates.status;
  if (updates.lastRunAt) updateData.lastRunAt = new Date(updates.lastRunAt);
  if (updates.nextRunAt) updateData.nextRunAt = new Date(updates.nextRunAt);

  return await prisma.agentSchedule.update({
    where: { id: scheduleId },
    data: updateData
  });
}
