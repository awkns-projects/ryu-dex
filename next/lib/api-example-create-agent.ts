/**
 * Example API implementation for creating agents from templates
 * This shows how to integrate the agent templates with your database
 * 
 * Usage in Next.js API route:
 * 
 * // app/api/agents/create/route.ts
 * import { createAgentFromTemplateAPI } from 'app/lib/api-example-create-agent';
 * 
 * export async function POST(request: Request) {
 *   const body = await request.json();
 *   const result = await createAgentFromTemplateAPI(body);
 *   return Response.json(result);
 * }
 */

import { getTemplateById } from './agent-templates';

// This would be your actual database client
// import { db } from './db/client';
// import { agent, agentModel, agentAction, agentStep, agentSchedule, agentScheduleStep } from './db/schema';

export interface CreateAgentRequest {
  templateId: string;
  userId: string;
  customName?: string; // Optional: override template name
  customDescription?: string; // Optional: override template description
}

export interface CreateAgentResponse {
  success: boolean;
  agentId?: string;
  error?: string;
  details?: {
    modelsCreated: number;
    actionsCreated: number;
    stepsCreated: number;
    schedulesCreated: number;
  };
}

/**
 * API function to create an agent from a template
 */
export async function createAgentFromTemplateAPI(
  request: CreateAgentRequest
): Promise<CreateAgentResponse> {
  try {
    const { templateId, userId, customName, customDescription } = request;

    // 1. Get the template
    const template = getTemplateById(templateId);
    if (!template) {
      return {
        success: false,
        error: `Template not found: ${templateId}`,
      };
    }

    console.log(`Creating agent from template: ${template.title}`);

    // 2. Create the agent record
    // In real implementation with Drizzle:
    // const [newAgent] = await db.insert(agent).values({
    //   name: customName || template.name,
    //   description: customDescription || template.description,
    //   userId,
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    // }).returning();

    const agentId = `agent-${Date.now()}`;
    console.log(`Created agent: ${agentId}`);

    // 3. Create models with fields and actions
    const modelMapping = new Map<string, string>(); // modelName -> modelId
    const actionMapping = new Map<string, string>(); // actionName -> actionId
    let modelsCreated = 0;
    let actionsCreated = 0;
    let stepsCreated = 0;

    for (const modelTemplate of template.models) {
      // In real implementation:
      // const [newModel] = await db.insert(agentModel).values({
      //   agentId: newAgent.id,
      //   name: modelTemplate.name,
      //   fields: modelTemplate.fields,
      //   createdAt: new Date(),
      // }).returning();

      const modelId = `model-${Date.now()}-${modelsCreated}`;
      modelMapping.set(modelTemplate.name, modelId);
      modelsCreated++;

      console.log(`  Created model: ${modelTemplate.name} (${modelTemplate.fields.length} fields)`);

      // 4. Create actions for this model
      for (const actionTemplate of modelTemplate.actions) {
        // In real implementation:
        // const [newAction] = await db.insert(agentAction).values({
        //   agentId: newAgent.id,
        //   modelId,
        //   name: actionTemplate.name,
        //   title: actionTemplate.title,
        //   emoji: actionTemplate.emoji,
        //   description: actionTemplate.description,
        //   inputFields: actionTemplate.inputFields,
        //   outputFields: actionTemplate.outputFields,
        //   createdAt: new Date(),
        // }).returning();

        const actionId = `action-${Date.now()}-${actionsCreated}`;
        actionMapping.set(actionTemplate.name, actionId);
        actionsCreated++;

        console.log(`    Created action: ${actionTemplate.name} (${actionTemplate.steps.length} steps)`);

        // Create steps for this action
        for (const stepTemplate of actionTemplate.steps) {
          // In real implementation:
          // await db.insert(agentStep).values({
          //   actionId: newAction.id,
          //   name: stepTemplate.name,
          //   type: stepTemplate.type,
          //   order: stepTemplate.order,
          //   config: stepTemplate.config,
          //   createdAt: new Date(),
          // });

          stepsCreated++;
          console.log(`      Created step: ${stepTemplate.name} (${stepTemplate.type})`);
        }
      }
    }

    // 5. Create schedules with their steps
    let schedulesCreated = 0;

    if (template.schedules) {
      for (const scheduleTemplate of template.schedules) {
        // In real implementation:
        // const [newSchedule] = await db.insert(agentSchedule).values({
        //   agentId: newAgent.id,
        //   name: scheduleTemplate.name,
        //   mode: scheduleTemplate.mode,
        //   intervalHours: scheduleTemplate.intervalHours,
        //   status: 'active',
        //   createdAt: new Date(),
        //   updatedAt: new Date(),
        // }).returning();

        const scheduleId = `schedule-${Date.now()}-${schedulesCreated}`;
        schedulesCreated++;

        console.log(`  Created schedule: ${scheduleTemplate.name} (${scheduleTemplate.mode})`);

        // Create schedule steps
        for (const scheduleStep of scheduleTemplate.steps) {
          const modelId = modelMapping.get(scheduleStep.modelName);
          const actionId = actionMapping.get(scheduleStep.actionName);

          if (!modelId || !actionId) {
            console.warn(`    Skipping schedule step: model or action not found`);
            continue;
          }

          // In real implementation:
          // await db.insert(agentScheduleStep).values({
          //   scheduleId: newSchedule.id,
          //   modelId,
          //   actionId,
          //   query: scheduleStep.query,
          //   order: scheduleStep.order,
          //   createdAt: new Date(),
          //   updatedAt: new Date(),
          // });

          console.log(`    Created schedule step: ${scheduleStep.actionName} on ${scheduleStep.modelName}`);
        }
      }
    }

    console.log('✅ Agent creation complete!');

    return {
      success: true,
      agentId,
      details: {
        modelsCreated,
        actionsCreated,
        stepsCreated,
        schedulesCreated,
      },
    };

  } catch (error) {
    console.error('Error creating agent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Example of integrating with Drizzle ORM
 * 
 * This is what the actual implementation would look like:
 */
export const IMPLEMENTATION_EXAMPLE = `
import { db } from './db/client';
import { 
  agent, 
  agentModel, 
  agentAction, 
  agentStep, 
  agentSchedule, 
  agentScheduleStep 
} from './db/schema';

export async function createAgentWithDrizzle(
  templateId: string, 
  userId: string
) {
  const template = getTemplateById(templateId);
  if (!template) throw new Error('Template not found');
  
  return await db.transaction(async (tx) => {
    // 1. Create agent
    const [newAgent] = await tx.insert(agent).values({
      name: template.name,
      description: template.description,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    // 2. Create models and actions
    const modelIds = new Map();
    const actionIds = new Map();
    for (const model of template.models) {
      const [newModel] = await tx.insert(agentModel).values({
        agentId: newAgent.id,
        name: model.name,
        fields: model.fields,
        createdAt: new Date(),
      }).returning();
      modelIds.set(model.name, newModel.id);
      
      // 3. Create actions for this model
      for (const action of model.actions) {
        const [newAction] = await tx.insert(agentAction).values({
          agentId: newAgent.id,
          modelId: newModel.id,
          name: action.name,
          title: action.title,
          emoji: action.emoji,
          description: action.description,
          inputFields: action.inputFields,
          outputFields: action.outputFields,
          createdAt: new Date(),
        }).returning();
        actionIds.set(action.name, newAction.id);
        
        // Create steps
        for (const step of action.steps) {
          await tx.insert(agentStep).values({
            actionId: newAction.id,
            name: step.name,
            type: step.type,
            order: step.order,
            config: step.config,
            createdAt: new Date(),
          });
        }
      }
    }
    
    // 4. Create schedules
    if (template.schedules) {
      for (const schedule of template.schedules) {
        const [newSchedule] = await tx.insert(agentSchedule).values({
          agentId: newAgent.id,
          name: schedule.name,
          mode: schedule.mode,
          intervalHours: schedule.intervalHours,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        }).returning();
        
        // Create schedule steps
        for (const step of schedule.steps) {
          await tx.insert(agentScheduleStep).values({
            scheduleId: newSchedule.id,
            modelId: modelIds.get(step.modelName),
            actionId: actionIds.get(step.actionName),
            query: step.query,
            order: step.order,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
    }
    
    return newAgent;
  });
}
`;

