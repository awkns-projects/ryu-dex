/**
 * Utility functions to create agent records from templates
 * This handles creating all necessary database records: agent, models, actions, steps, schedules
 */

import type { AgentTemplateData } from './agent-templates';

export interface CreateAgentInput {
  name: string;
  description: string;
  userId: string;
  templateData: AgentTemplateData;
}

export interface CreatedAgent {
  agentId: string;
  modelIds: Map<string, string>; // modelName -> modelId
  actionIds: Map<string, string>; // actionName -> actionId
  scheduleIds: string[];
}

/**
 * Creates a complete agent with all related records from a template
 * This is the server-side implementation that would be called via API
 */
export async function createAgentFromTemplate(
  input: CreateAgentInput
): Promise<CreatedAgent> {
  const { name, description, userId, templateData } = input;

  // In a real implementation, this would:
  // 1. Start a database transaction
  // 2. Create agent record
  // 3. Create model records with fields
  // 4. Create action records with input/output fields
  // 5. Create step records for each action
  // 6. Create schedule records with steps
  // 7. Commit transaction

  // For now, this is a mock implementation that shows the structure
  console.log('[Agent Creation] Starting agent creation from template:', templateData.id);

  // Step 1: Create the agent record
  const agentId = await createAgentRecord({
    name,
    description,
    userId,
  });
  console.log('[Agent Creation] Created agent:', agentId);

  // Step 2: Create models and their actions
  const modelIds = new Map<string, string>();
  const actionIds = new Map<string, string>();

  for (const modelTemplate of templateData.models) {
    const modelId = await createModelRecord({
      agentId,
      name: modelTemplate.name,
      fields: modelTemplate.fields,
    });
    modelIds.set(modelTemplate.name, modelId);
    console.log(`[Agent Creation] Created model: ${modelTemplate.name} -> ${modelId}`);

    // Step 3: Create actions for this model
    for (const actionTemplate of modelTemplate.actions) {
      // Create the action
      const actionId = await createActionRecord({
        agentId,
        modelId,
        name: actionTemplate.name,
        title: actionTemplate.title,
        emoji: actionTemplate.emoji,
        description: actionTemplate.description,
        inputFields: actionTemplate.inputFields,
        outputFields: actionTemplate.outputFields,
      });
      actionIds.set(actionTemplate.name, actionId);
      console.log(`[Agent Creation] Created action: ${actionTemplate.name} -> ${actionId}`);

      // Create steps for this action
      for (const stepTemplate of actionTemplate.steps) {
        const stepId = await createStepRecord({
          actionId,
          name: stepTemplate.name,
          type: stepTemplate.type,
          order: stepTemplate.order,
          config: stepTemplate.config,
        });
        console.log(`[Agent Creation] Created step: ${stepTemplate.name} -> ${stepId}`);
      }
    }
  }

  // Step 4: Create schedules with steps
  const scheduleIds: string[] = [];
  if (templateData.schedules) {
    for (const scheduleTemplate of templateData.schedules) {
      const scheduleId = await createScheduleRecord({
        agentId,
        name: scheduleTemplate.name,
        mode: scheduleTemplate.mode,
        intervalHours: scheduleTemplate.intervalHours,
      });
      scheduleIds.push(scheduleId);
      console.log(`[Agent Creation] Created schedule: ${scheduleTemplate.name} -> ${scheduleId}`);

      // Create schedule steps
      for (const scheduleStep of scheduleTemplate.steps) {
        const modelId = modelIds.get(scheduleStep.modelName);
        const actionId = actionIds.get(scheduleStep.actionName);

        if (!modelId || !actionId) {
          console.warn(`[Agent Creation] Model or action not found for schedule step`);
          continue;
        }

        const scheduleStepId = await createScheduleStepRecord({
          scheduleId,
          modelId,
          actionId,
          query: scheduleStep.query,
          order: scheduleStep.order,
        });
        console.log(`[Agent Creation] Created schedule step: ${scheduleStepId}`);
      }
    }
  }

  console.log('[Agent Creation] Agent creation complete:', {
    agentId,
    modelCount: modelIds.size,
    actionCount: actionIds.size,
    scheduleCount: scheduleIds.length,
  });

  return {
    agentId,
    modelIds,
    actionIds,
    scheduleIds,
  };
}

// Mock database creation functions
// In a real implementation, these would use your database ORM/client

async function createAgentRecord(data: {
  name: string;
  description: string;
  userId: string;
}): Promise<string> {
  // Simulated database insert
  // Example: await db.insert(agent).values({ ...data, createdAt: new Date(), updatedAt: new Date() })
  return `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function createModelRecord(data: {
  agentId: string;
  name: string;
  fields: any;
}): Promise<string> {
  // Simulated database insert
  // Example: await db.insert(agentModel).values({ ...data, createdAt: new Date() })
  return `model-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function createActionRecord(data: {
  agentId: string;
  modelId: string;
  name: string;
  title: string;
  emoji: string;
  description: string;
  inputFields: string[];
  outputFields: string[];
}): Promise<string> {
  // Simulated database insert
  // Example: await db.insert(agentAction).values({ ...data, createdAt: new Date() })
  return `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function createStepRecord(data: {
  actionId: string;
  name: string;
  type: string;
  order: string;
  config: any;
}): Promise<string> {
  // Simulated database insert
  // Example: await db.insert(agentStep).values({ ...data, createdAt: new Date() })
  return `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function createScheduleRecord(data: {
  agentId: string;
  name: string;
  mode: string;
  intervalHours?: string;
}): Promise<string> {
  // Simulated database insert
  // Example: await db.insert(agentSchedule).values({ ...data, status: 'active', createdAt: new Date(), updatedAt: new Date() })
  return `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function createScheduleStepRecord(data: {
  scheduleId: string;
  modelId: string;
  actionId: string;
  query?: string;
  order: number;
}): Promise<string> {
  // Simulated database insert
  // Example: await db.insert(agentScheduleStep).values({ ...data, createdAt: new Date(), updatedAt: new Date() })
  return `schedule-step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Helper function to convert template to API request format
 */
export function prepareAgentCreationRequest(
  name: string,
  description: string,
  userId: string,
  templateData: AgentTemplateData
) {
  return {
    name,
    description,
    userId,
    templateId: templateData.id,
    models: templateData.models.map(m => ({
      name: m.name,
      fields: m.fields,
      actions: m.actions.map(a => ({
        name: a.name,
        title: a.title,
        emoji: a.emoji,
        description: a.description,
        modelName: a.modelName,
        inputFields: a.inputFields,
        outputFields: a.outputFields,
        steps: a.steps,
      })),
    })),
    schedules: templateData.schedules?.map(s => ({
      name: s.name,
      mode: s.mode,
      intervalHours: s.intervalHours,
      steps: s.steps,
    })),
  };
}

