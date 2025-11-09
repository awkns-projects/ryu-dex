import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { ChatSDKError } from '@/lib/errors';
import { getTemplateById } from '@/lib/agent-templates';
import {
  createAgent,
  createAgentModel,
  createAgentAction,
  createAgentStep,
  createAgentSchedule,
  createAgentScheduleStep,
  createAgentRecord,
} from '@/lib/db/agent-queries';

// Helper function to get a random agent image
function getRandomAgentImage(): string {
  const imageCount = 10; // We have 0.png through 9.png
  const randomIndex = Math.floor(Math.random() * imageCount);
  return `/images/agents/${randomIndex}.png`;
}

// POST endpoint to create an agent from a template
export async function POST(request: NextRequest) {
  try {
    // Get session using Better Auth API
    console.log('🔐 Checking authentication...');
    console.log('Headers:', Object.fromEntries(request.headers.entries()));

    const session = await auth.api.getSession({
      headers: request.headers
    });

    console.log('Session result:', session ? 'Found' : 'Not found', session?.user?.id);

    if (!session?.user) {
      console.log('❌ No session found - returning 401');
      return new ChatSDKError('unauthorized:chat').toResponse();
    }

    const body = await request.json();
    const { templateId, title, name, description } = body;

    if (!templateId) {
      return Response.json(
        { error: 'Missing required field: templateId' },
        { status: 400 }
      );
    }

    console.log('🎨 Creating agent from template:', templateId);

    // 1. Get the template
    const template = getTemplateById(templateId);
    if (!template) {
      return Response.json(
        {
          code: 'not_found:template',
          message: `Template not found: ${templateId}`
        },
        { status: 404 }
      );
    }

    console.log('✅ Template found:', template.title);

    // 2. Create the agent record with a random image, features, and connections
    const newAgent = await createAgent({
      title: title || template.title, // Template title
      name: name || template.title, // User's custom name (defaults to title)
      description: description || template.description,
      templateId: templateId, // Store reference to template
      image: getRandomAgentImage(), // Assign a random agent avatar
      features: template.features || [], // Clone features from template
      connections: template.connections || [], // Clone connections from template
      userId: session.user.id,
    });

    console.log('✅ Created agent:', newAgent.id, newAgent.name, `(${template.features?.length || 0} features, ${template.connections?.length || 0} connections)`);

    // 3. Create models with fields and actions
    const modelMapping = new Map<string, string>(); // modelName -> modelId
    const actionMapping = new Map<string, string>(); // actionName -> actionId
    let modelsCreated = 0;
    let actionsCreated = 0;
    let stepsCreated = 0;
    let workspaceRecordCreated = false;

    for (const modelTemplate of template.models) {
      const newModel = await createAgentModel({
        agentId: newAgent.id,
        name: modelTemplate.name,
        fields: modelTemplate.fields,
        forms: modelTemplate.forms, // Clone forms into database
      });

      modelMapping.set(modelTemplate.name, newModel.id);
      modelsCreated++;

      console.log(`  ✅ Created model: ${modelTemplate.name} (${modelTemplate.fields.length} fields, ${modelTemplate.forms?.length || 0} forms)`);

      // CRITICAL: Create default Workspace record when Workspace model is created
      if (modelTemplate.name === 'Workspace') {
        const defaultWorkspaceData: Record<string, any> = {
          name: `${name || template.title} Workspace`,
          description: description || template.description || '',
        };

        // Add default values for all non-OAuth fields from the template
        for (const field of modelTemplate.fields) {
          // Skip OAuth fields (they'll be configured later by the user)
          if (field.type === 'oauth') continue;

          // Skip fields already set
          if (field.name in defaultWorkspaceData) continue;

          // Set default values based on field type
          if ('defaultValue' in field && field.defaultValue !== undefined) {
            defaultWorkspaceData[field.name] = field.defaultValue;
          } else if (field.type === 'number') {
            defaultWorkspaceData[field.name] = 0;
          } else if (field.type === 'boolean') {
            defaultWorkspaceData[field.name] = false;
          } else if (field.type === 'text' || field.type === 'textarea') {
            defaultWorkspaceData[field.name] = '';
          }
        }

        const workspaceRecord = await createAgentRecord({
          modelId: newModel.id,
          data: defaultWorkspaceData,
        });

        workspaceRecordCreated = true;
        console.log(`  🏢 Created default Workspace record:`, workspaceRecord.id);
      }

      // 4. Create actions for this model (only if model has actions)
      if (!modelTemplate.actions || !Array.isArray(modelTemplate.actions)) {
        console.log(`  ℹ️  Model ${modelTemplate.name} has no actions`);
        continue;
      }

      for (const actionTemplate of modelTemplate.actions) {
        const newAction = await createAgentAction({
          agentId: newAgent.id,
          modelId: newModel.id,
          name: actionTemplate.name,
          title: actionTemplate.title,
          emoji: actionTemplate.emoji,
          description: actionTemplate.description,
          inputFields: actionTemplate.inputFields,
          outputFields: actionTemplate.outputFields,
        });

        actionMapping.set(actionTemplate.name, newAction.id);
        actionsCreated++;

        console.log(`    ✅ Created action: ${actionTemplate.name} (${actionTemplate.steps.length} steps)`);

        // Create steps for this action
        if (!actionTemplate.steps || !Array.isArray(actionTemplate.steps)) {
          console.log(`    ⚠️  Action ${actionTemplate.name} has no steps`);
          continue;
        }

        for (const stepTemplate of actionTemplate.steps) {
          await createAgentStep({
            actionId: newAction.id,
            name: stepTemplate.name,
            type: stepTemplate.type as any,
            order: stepTemplate.order,
            config: stepTemplate.config,
          });

          stepsCreated++;
          console.log(`      ✅ Created step: ${stepTemplate.name} (${stepTemplate.type})`);
        }
      }
    }

    // 5. Create schedules with their steps
    let schedulesCreated = 0;

    if (template.schedules && Array.isArray(template.schedules)) {
      for (const scheduleTemplate of template.schedules) {
        const newSchedule = await createAgentSchedule({
          agentId: newAgent.id,
          name: scheduleTemplate.name,
          mode: scheduleTemplate.mode as any,
          intervalHours: scheduleTemplate.intervalHours,
          status: 'active',
        });

        schedulesCreated++;

        console.log(`  ✅ Created schedule: ${scheduleTemplate.name} (${scheduleTemplate.mode})`);

        // Create schedule steps (only if schedule has steps)
        if (!scheduleTemplate.steps || !Array.isArray(scheduleTemplate.steps)) {
          console.log(`  ℹ️  Schedule ${scheduleTemplate.name} has no steps`);
          continue;
        }

        for (const scheduleStep of scheduleTemplate.steps) {
          const modelId = modelMapping.get(scheduleStep.modelName);
          const actionId = actionMapping.get(scheduleStep.actionName);

          if (!modelId || !actionId) {
            console.warn(`    ⚠️ Skipping schedule step: model or action not found`);
            continue;
          }

          await createAgentScheduleStep({
            scheduleId: newSchedule.id,
            modelId,
            actionId,
            query: scheduleStep.query, // NEW: ScheduleQuery object OR legacy string
            order: scheduleStep.order,
          });

          console.log(`    ✅ Created schedule step: ${scheduleStep.actionName} on ${scheduleStep.modelName}`);
        }
      }
    }

    console.log('🎉 Agent creation complete!');

    return Response.json({
      success: true,
      agent: newAgent,
      details: {
        modelsCreated,
        actionsCreated,
        stepsCreated,
        schedulesCreated,
        workspaceRecordCreated,
        featuresCloned: template.features?.length || 0,
        connectionsCloned: template.connections?.length || 0,
      },
    });

  } catch (error) {
    console.error('❌ Error creating agent from template:', error);

    // Check if it's an auth error
    if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
      return new ChatSDKError('unauthorized:chat').toResponse();
    }

    return Response.json(
      {
        code: 'internal_error:agent',
        message: 'An error occurred while creating the agent.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

