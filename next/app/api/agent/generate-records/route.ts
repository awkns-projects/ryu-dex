import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { generateObject } from 'ai';
import { z } from 'zod';
import { myProvider } from '@/lib/ai/providers';
import {
  getFullAgentWithModelsAndActions,
  createAgentRecord,
  getAgentRecordsByModelId
} from '@/lib/db/agent-queries';
import { ChatSDKError } from '@/lib/errors';
import { generateUUID, formatActionName } from '@/lib/utils';

interface AgentField {
  name: string;
  title: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'reference' | 'enum';
  required: boolean;
  description?: string;
  referencesModel?: string;
  referencesField?: string;
  referenceType?: 'to_one' | 'to_many';
  enumValues?: string[];
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers
  });

  if (!session?.user?.id) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  try {
    const body = await request.json();
    const { agentId, count = 5 } = body;

    if (!agentId) {
      return Response.json(
        { error: 'Missing required field: agentId' },
        { status: 400 }
      );
    }

    console.log('🎯 Generating records for agent:', agentId);

    // Get agent and verify ownership
    const agent = await getFullAgentWithModelsAndActions(agentId);
    if (!agent || agent.agent.userId !== session.user.id) {
      return new ChatSDKError('forbidden:chat').toResponse();
    }

    console.log('✅ Agent found and authorized:', agent.agent.name);

    // Generate records sequentially with proper relationships
    const allGeneratedRecords = await generateSequentialRecords(
      agent.models,
      agent.actions,
      agent.schedules || [],
      agent.agent.name || 'Agent',
      agent.agent.description || undefined,
      count
    );

    // Save generated records to database
    console.log('💾 Saving generated records to database...');
    const savedRecords: any = {};

    for (const model of agent.models) {
      const modelRecords = allGeneratedRecords[model.name] || [];

      const savedModelRecords = await Promise.all(
        modelRecords.map(async (record: Record<string, any>) => {
          const savedRecord = await createAgentRecord({
            modelId: model.id,
            data: record,
          });
          return savedRecord;
        })
      );

      savedRecords[model.name] = savedModelRecords;
      console.log(`✅ Saved ${savedModelRecords.length} records for ${model.name}`);
    }

    return Response.json({
      success: true,
      message: `Generated ${count} records for each of ${agent.models.length} models`,
      records: savedRecords,
      recordCounts: Object.fromEntries(
        Object.entries(savedRecords).map(([modelName, records]) => [
          modelName,
          (records as any[]).length
        ])
      )
    });

  } catch (error) {
    console.error('Error generating records:', error);
    return Response.json(
      {
        error: 'Failed to generate records',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Generate records sequentially with proper relationships
async function generateSequentialRecords(
  models: any[],
  actions: any[],
  schedules: any[],
  agentName: string,
  agentDescription?: string,
  count: number = 5
) {
  console.log('🎯 Starting sequential AI record generation...');

  // First pass: Set default displayFields for each model if not specified
  models = models.map(model => {
    // If displayFields already set, use them
    if (model.displayFields && model.displayFields.length > 0) {
      return model;
    }

    // Otherwise, intelligently choose display fields based on model structure
    const displayFields = [];

    // Always include name or title field if it exists
    const nameField = model.fields.find((f: AgentField) =>
      f.name.toLowerCase().includes('name') || f.name.toLowerCase().includes('title')
    );
    if (nameField) {
      displayFields.push(nameField.name);
    }

    // Add descriptive text fields that would be good for display
    const descriptiveFields = model.fields.filter((f: AgentField) =>
      f.type === 'text' &&
      !f.name.toLowerCase().includes('name') &&
      ['title', 'label', 'description', 'species', 'type', 'category'].some(term =>
        f.name.toLowerCase().includes(term)
      )
    );
    displayFields.push(...descriptiveFields.map((f: AgentField) => f.name));

    // If no good display fields found, use the first text field
    if (displayFields.length === 0) {
      const firstTextField = model.fields.find((f: AgentField) => f.type === 'text');
      if (firstTextField) {
        displayFields.push(firstTextField.name);
      }
    }

    return {
      ...model,
      displayFields: displayFields.length > 0 ? displayFields : ['id']
    };
  });

  // Analyze model dependencies (which models reference others)
  const modelDependencies = analyzeModelDependencies(models);
  console.log('📊 Model dependencies:', modelDependencies);

  // Sort models by dependency order (referenced models first)
  const sortedModels = topologicalSort(models, modelDependencies);
  console.log('📋 Model generation order:', sortedModels.map(m => m.name));

  const allGeneratedRecords: any = {};
  const recordIdMap = new Map<string, string[]>(); // Map to store IDs by model name
  const recordDisplayMap = new Map<string, Map<string, string>>(); // Map to store display values by ID

  // Generate records for each model in dependency order
  for (const model of sortedModels) {
    console.log(`🤖 Generating records for model: ${model.name} (display fields: ${model.displayFields.join(', ')})`);

    const modelRecords = await generateRecordsForModel(
      model,
      allGeneratedRecords,
      recordIdMap,
      recordDisplayMap,
      actions,
      schedules,
      agentName,
      agentDescription,
      count
    );

    // Update maps before generating next model's records
    allGeneratedRecords[model.name] = modelRecords;
    recordIdMap.set(model.name, modelRecords.map((r: any) => r.id));

    // Store display values for each record
    const displayMap = new Map<string, string>();
    modelRecords.forEach((record: any) => {
      const displayValues = model.displayFields
        .map((field: string) => record[field])
        .filter(Boolean)
        .join(' - ');
      displayMap.set(record.id, displayValues);
    });
    recordDisplayMap.set(model.name, displayMap);

    console.log(`✅ Generated ${modelRecords.length} records for ${model.name} with IDs:`, recordIdMap.get(model.name));
  }

  // After all records are generated, update bidirectional references
  console.log('🔄 Updating bidirectional references...');
  models.forEach((model) => {
    const modelRecords = allGeneratedRecords[model.name];
    if (!modelRecords) return;

    // Find all reference fields in this model
    const referenceFields = model.fields.filter((f: AgentField) => f.type === 'reference');

    referenceFields.forEach((field: AgentField) => {
      if (!field.referencesModel) return;

      const referencedModel = models.find(m => m.name === field.referencesModel);
      if (!referencedModel) return;

      // Find the corresponding back-reference field in the referenced model
      const backReferenceField = referencedModel.fields.find((f: AgentField) =>
        f.type === 'reference' && f.referencesModel === model.name
      );

      if (!backReferenceField) return;

      console.log(`🔗 Updating bidirectional reference between ${model.name}.${field.name} and ${referencedModel.name}.${backReferenceField.name}`);

      // Update references in both directions
      modelRecords.forEach((record: Record<string, any>) => {
        const referenceValue = record[field.name];

        if (field.referenceType === 'to_one' && referenceValue) {
          // For to-one references, update the corresponding to-many array
          const referencedRecords = allGeneratedRecords[field.referencesModel || ''];
          const referencedRecord = referencedRecords?.find(
            (r: Record<string, any>) => r.id === referenceValue
          );

          if (referencedRecord) {
            if (!referencedRecord[backReferenceField.name]) {
              referencedRecord[backReferenceField.name] = [];
            }
            if (!referencedRecord[backReferenceField.name].includes(record.id)) {
              referencedRecord[backReferenceField.name].push(record.id);
            }
          }
        } else if (field.referenceType === 'to_many' && Array.isArray(referenceValue)) {
          // For to-many references, update each referenced record's to-one reference
          const referencedRecords = allGeneratedRecords[field.referencesModel || ''];
          referenceValue.forEach((refId: string) => {
            const referencedRecord = referencedRecords?.find(
              (r: Record<string, any>) => r.id === refId
            );
            if (referencedRecord) {
              referencedRecord[backReferenceField.name] = record.id;
            }
          });
        }
      });
    });
  });

  console.log('✅ Bidirectional references updated');
  return allGeneratedRecords;
}

// Analyze dependencies between models
function analyzeModelDependencies(models: any[]) {
  const dependencies: any[] = [];
  models.forEach((model) => {
    model.fields.forEach((field: any) => {
      if (field.type === 'reference' && field.referencesModel) {
        // Add explicit dependency direction based on reference type
        if (field.referenceType === 'to_one') {
          // For to-one references, the current model depends on the referenced model
          dependencies.push({
            dependent: model.name,
            dependsOn: field.referencesModel,
            field: field.name,
            type: 'to_one'
          });
        } else {
          // For to-many references, the referenced model depends on the current model
          dependencies.push({
            dependent: field.referencesModel,
            dependsOn: model.name,
            field: field.name,
            type: 'to_many'
          });
        }
      }
    });
  });
  return dependencies;
}

// Topological sort to determine generation order
function topologicalSort(models: any[], dependencies: any[]) {
  const sorted: any[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  const visit = (modelName: string) => {
    if (visiting.has(modelName)) {
      console.warn('⚠️ Circular dependency detected:', modelName);
      return;
    }
    if (visited.has(modelName)) return;

    visiting.add(modelName);

    // Visit dependencies first - but only for to-one references
    const modelDeps = dependencies
      .filter(d => d.dependent === modelName && d.type === 'to_one');
    modelDeps.forEach(dep => visit(dep.dependsOn));

    visiting.delete(modelName);
    visited.add(modelName);

    const model = models.find(m => m.name === modelName);
    if (model) sorted.push(model);
  };

  // Start with models that have to-one references
  const modelsWithToOne = new Set(
    dependencies
      .filter(d => d.type === 'to_one')
      .map(d => d.dependent)
  );

  // Process models with to-one references first
  models.forEach(model => {
    if (modelsWithToOne.has(model.name)) {
      visit(model.name);
    }
  });

  // Then process remaining models
  models.forEach(model => {
    if (!visited.has(model.name)) {
      visit(model.name);
    }
  });

  return sorted;
}

// Generate records for a single model with AI
async function generateRecordsForModel(
  model: any,
  existingRecords: any,
  recordIdMap: Map<string, string[]>,
  recordDisplayMap: Map<string, Map<string, string>>,
  actions: any[],
  schedules: any[],
  agentName: string,
  agentDescription?: string,
  count: number = 5
) {
  try {
    // Create schema for this model
    const fieldSchemas: any = {};
    model.fields.forEach((field: any) => {
      switch (field.type) {
        case 'text':
          fieldSchemas[field.name] = z.string().describe(field.description || `A ${field.name} value`);
          break;
        case 'number':
          fieldSchemas[field.name] = z.number().describe(field.description || `A numeric ${field.name} value`);
          break;
        case 'boolean':
          fieldSchemas[field.name] = z.boolean().describe(field.description || `A boolean ${field.name} value`);
          break;
        case 'date':
          fieldSchemas[field.name] = z.string().describe(field.description || `A date string for ${field.name} in YYYY-MM-DD format`);
          break;
        case 'enum':
          if (field.enumValues && field.enumValues.length > 0) {
            fieldSchemas[field.name] = z.enum(field.enumValues as [string, ...string[]]).describe(field.description || `An enum value for ${field.name}. Must be one of: ${field.enumValues.join(', ')}`);
          } else {
            fieldSchemas[field.name] = z.string().describe(field.description || `An enum value for ${field.name}`);
          }
          break;
        case 'reference':
          const refType = field.referenceType || 'to_one';
          const refDesc = `A reference ${refType === 'to_one' ? 'ID' : 'array of IDs'} linking to ${field.referencesModel}.${field.referencesField}`;
          const referencedIds = recordIdMap.get(field.referencesModel) || [];

          if (referencedIds.length === 0) {
            console.warn(`⚠️ No IDs available for referenced model ${field.referencesModel}`);
            // For models that haven't been generated yet, we'll update the references later
            if (refType === 'to_one') {
              fieldSchemas[field.name] = z.string().optional().describe(refDesc);
            } else {
              fieldSchemas[field.name] = z.array(z.string()).optional().describe(refDesc);
            }
          } else {
            // For models that have been generated, enforce valid references
            if (refType === 'to_one') {
              fieldSchemas[field.name] = z.string().refine(
                id => referencedIds.includes(id),
                `Must be a valid ${field.referencesModel} ID`
              ).describe(refDesc);
            } else {
              fieldSchemas[field.name] = z.array(z.string().refine(
                id => referencedIds.includes(id),
                `Must be valid ${field.referencesModel} IDs`
              )).describe(refDesc);
            }
          }
          break;
        default:
          fieldSchemas[field.name] = z.string().describe(field.description || `A ${field.name} value`);
      }
    });

    const recordSchema = z.object(fieldSchemas);
    const recordsSchema = z.object({
      records: z.array(recordSchema).length(count)
    });

    // Build context about existing records for references
    let referenceContext = '';
    const referenceFields = model.fields.filter((f: AgentField) => f.type === 'reference');
    if (referenceFields.length > 0) {
      referenceContext = 'AVAILABLE RECORDS FOR RELATIONSHIPS:\n';
      referenceFields.forEach((field: AgentField) => {
        const referencedIds = recordIdMap.get(field.referencesModel || '') || [];
        const refType = field.referenceType || 'to_one';
        const displayMap = recordDisplayMap.get(field.referencesModel || '');

        referenceContext += `\n${model.name}.${field.name} ${refType === 'to_one' ? 'belongs to one' : 'can have multiple'} ${field.referencesModel}:\n`;
        referenceContext += `Available records:\n`;

        if (existingRecords[field.referencesModel || '']) {
          existingRecords[field.referencesModel || ''].forEach((record: any) => {
            const displayValue = displayMap?.get(record.id) || record.id;
            referenceContext += `- ID ${record.id}: ${displayValue}\n`;
          });
        }
      });
      referenceContext += '\nIMPORTANT: Use ONLY the IDs shown above when creating references. Each reference must match an existing record.';
    }

    // Build context about actions and schedules that will operate on this model
    const modelActions = actions.filter(action => action.targetModel === model.name);
    const modelSchedules = schedules?.filter(schedule =>
      schedule.steps?.some((step: any) => {
        const stepAction = actions.find(a => a.name === step.actionName);
        return stepAction?.targetModel === model.name || step.modelName === model.name;
      })
    ) || [];

    let actionScheduleContext = '';
    if (modelActions.length > 0 || modelSchedules.length > 0) {
      actionScheduleContext = '\nACTIONS & SCHEDULES THAT WILL OPERATE ON THIS DATA:\n';

      if (modelActions.length > 0) {
        actionScheduleContext += '\nActions:\n';
        modelActions.forEach(action => {
          actionScheduleContext += `- ${action.name}: ${action.description || 'No description'}\n`;
          if (action.steps) {
            action.steps.forEach((step: any) => {
              actionScheduleContext += `  • ${step.name} (${step.type}): reads [${step.inputFields?.join(', ') || 'none'}] → generates [${step.outputFields?.join(', ') || 'none'}]\n`;
            });
          }
        });
      }

      if (modelSchedules.length > 0) {
        actionScheduleContext += '\nSchedules:\n';
        modelSchedules.forEach(schedule => {
          const intervalText = schedule.mode === 'recurring' && schedule.intervalHours
            ? ` every ${schedule.intervalHours} hours`
            : schedule.mode === 'once' ? ' (one-time)' : '';
          actionScheduleContext += `- ${schedule.name} (${schedule.mode}${intervalText}): ${schedule.status}\n`;
          if (schedule.steps) {
            schedule.steps.forEach((step: any, index: number) => {
              const stepAction = actions.find(a => a.name === step.actionName);
              actionScheduleContext += `  ${index + 1}. Query ${step.modelName} records → Run "${stepAction?.name || step.actionName}" action\n`;
            });
          }
        });
      }

      actionScheduleContext += '\nIMPORTANT: Generate data that will be meaningful for these automated operations. Include:';
      actionScheduleContext += '\n- Status fields that schedules can check (e.g., "active", "needs_review", "pending")';
      actionScheduleContext += '\n- Timestamp fields for tracking (e.g., "lastUpdated", "nextCheckDate", "createdAt")';
      actionScheduleContext += '\n- Fields that actions will read and modify';
      actionScheduleContext += '\n- Realistic values that would trigger scheduled operations';
    }

    // Update the record generation prompt to emphasize relationships
    const result = await generateObject({
      model: myProvider.languageModel('artifact-model'),
      schema: recordsSchema,
      prompt: `Generate ${count} realistic records for the ${model.name} model in the context of "${agentName}" (${agentDescription || 'a business system'}).

Model: ${model.name}
Display Fields: ${model.displayFields.join(', ')} (these fields will be shown when this record is referenced)
Fields:
${model.fields.map((f: any) => {
        if (f.type === 'reference') {
          const refType = f.referenceType || 'to_one';
          const availableIds = recordIdMap.get(f.referencesModel) || [];
          const referencedModel = model.fields.find((m: any) => m.name === f.referencesModel);
          const referenceExamples = existingRecords[f.referencesModel]?.slice(0, 3).map((record: Record<string, any>) => {
            const displayValue = referencedModel?.displayFields
              ?.map((field: string) => record[field])
              .filter(Boolean)
              .join(' - ');
            return `${record.id} (${displayValue})`;
          }).join(', ');

          return `- ${f.title} (${f.name}) (${refType === 'to_one' ? 'single reference' : 'multiple references'}): ${f.description || 'No description'} → ${refType === 'to_one' ? 'must reference exactly one' : 'can reference multiple'} ${f.referencesModel}.${f.referencesField}
Available records: ${referenceExamples}
Available IDs: ${availableIds.join(', ')}`;
        }
        return `- ${f.title} (${f.name}) (${f.type}): ${f.description || 'No description'}`;
      }).join('\n')}

${referenceContext ? `\nRELATIONSHIP CONTEXT:\n${referenceContext}\n` : ''}

${actionScheduleContext}

IMPORTANT RULES:
1. For to-one references: Use exactly ONE ID from the referenced model's available IDs
2. For to-many references: Use 1-3 IDs from the referenced model's available IDs in an array
3. ALWAYS use valid IDs from the existing records shown above
4. Maintain logical relationships (e.g., if a Pet belongs to an Owner, use a real Owner ID)
5. Ensure bidirectional relationships make sense
6. Make the display fields (${model.displayFields.join(', ')}) meaningful as they will be shown when this record is referenced
7. Use the field names (not titles) when generating the record data
8. **SCHEDULE-AWARE DATA GENERATION**: Create data that will work effectively with the scheduled operations:
   ${modelSchedules.length > 0 ? `
   - Include realistic status values that schedules can query and filter on
   - Add meaningful timestamps that schedules can use for time-based triggers
   - Ensure fields that actions read have realistic, varied values
   - Create data states that would naturally trigger the scheduled actions
   - For recurring schedules, include fields that change over time (e.g., "lastCheckDate", "status")
   - For one-time schedules, include setup data that the schedule will process` : `
   - For recurring health checks (e.g., Pet model): include lastCheckupDate, healthStatus
   - For periodic analysis (e.g., Customer behavior): include lastPurchaseDate, activityStatus
   - For automated updates (e.g., Product recommendations): include preferences, purchaseHistory
   - For maintenance tasks (e.g., Inventory checks): include stockLevel, lastRestockDate`}

Make the data realistic and varied while maintaining proper relationships. For example:
- If this is a Pet record, ensure it references a valid Owner ID and has meaningful name and species
- If this is an Owner record, ensure it has a meaningful name that will be shown when referenced
- Use the exact IDs provided in the available IDs list
- **Schedule Integration**: Generate data with realistic values that the scheduled operations can meaningfully process
- Include varied status fields, timestamps, and trigger conditions that make sense for automation

Generate exactly ${count} records with proper references and realistic data that will work well with the automated schedules.`,
    });

    // Initialize records with empty values for AI-generated fields
    const records = result.object.records.map((record: any) => {
      const recordWithId = {
        id: generateUUID(),
        ...record
      };

      // Add placeholder null values for AI-generated fields
      model.fields
        .filter((f: AgentField) => f.description?.includes('AI-generated field from step'))
        .forEach((f: AgentField) => {
          recordWithId[f.name] = null;
        });

      // Validate and fix reference fields
      model.fields
        .filter((f: AgentField) => f.type === 'reference')
        .forEach((f: AgentField) => {
          const referencedIds = recordIdMap.get(f.referencesModel || '') || [];
          if (referencedIds.length > 0) {
            if (f.referenceType === 'to_many') {
              // Ensure to-many references are arrays of valid IDs
              const value = recordWithId[f.name];
              recordWithId[f.name] = Array.isArray(value)
                ? value.filter(id => referencedIds.includes(id))
                : value && referencedIds.includes(value) ? [value] : [referencedIds[0]];
            } else {
              // Ensure to-one references are valid single IDs
              const value = recordWithId[f.name];
              recordWithId[f.name] = referencedIds.includes(value) ? value : referencedIds[0];
            }
          }
        });

      return recordWithId;
    });

    return records;
  } catch (error) {
    console.error(`Failed to generate AI records for ${model.name}, using fallback:`, error);
    return generateFallbackRecordsForModel(model, recordIdMap, count);
  }
}

// Fallback generation for a single model
function generateFallbackRecordsForModel(model: any, recordIdMap: Map<string, string[]>, count: number) {
  return Array.from({ length: count }, (_, i) => {
    const record: any = { id: generateUUID() };
    model.fields.forEach((field: any) => {
      switch (field.type) {
        case 'text':
          record[field.name] = `Sample ${field.name} ${i + 1}`;
          break;
        case 'number':
          record[field.name] = Math.floor(Math.random() * 100) + 1;
          break;
        case 'boolean':
          record[field.name] = Math.random() > 0.5;
          break;
        case 'date':
          const date = new Date();
          date.setDate(date.getDate() - Math.floor(Math.random() * 365));
          record[field.name] = date.toISOString().split('T')[0];
          break;
        case 'enum':
          if (field.enumValues && field.enumValues.length > 0) {
            record[field.name] = field.enumValues[Math.floor(Math.random() * field.enumValues.length)];
          } else {
            record[field.name] = 'unknown';
          }
          break;
        case 'reference':
          const refType = field.referenceType || 'to_one';
          const availableIds = recordIdMap.get(field.referencesModel) || [];
          if (refType === 'to_one') {
            record[field.name] = availableIds[Math.floor(Math.random() * availableIds.length)] || generateUUID();
          } else {
            const refCount = Math.floor(Math.random() * 2) + 1; // 1-2 references
            record[field.name] = Array.from({ length: refCount }, () =>
              availableIds[Math.floor(Math.random() * availableIds.length)] || generateUUID()
            );
          }
          break;
        default:
          record[field.name] = `Sample value ${i + 1}`;
      }
    });
    return record;
  });
} 