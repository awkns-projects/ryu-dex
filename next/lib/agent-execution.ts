import { generateObject, generateText, experimental_generateImage as generateImage } from 'ai';
import { z } from 'zod';
import { gateway } from '@ai-sdk/gateway';
import { myProvider, getSafeModelId } from './ai/providers';
import {
  updateAgentRecord,
  createAgentRecord,
  createAgentExecution,
  updateAgentExecution
} from '@/lib/db/agent-queries';
import { ensureFreshToken, type OAuthTokenData } from './token-refresh';

// Execute an action on a specific record
export async function executeActionOnRecord(action: any, record: any, agent: any, streamCallback?: (event: any) => void, scheduleId?: string) {
  console.log(`🎯 Executing action ${action.name} on record ${record.id}`);
  console.log(`🔍 DEBUG: Action details:`, {
    actionId: action.id,
    actionName: action.name,
    stepsCount: action.steps?.length || 0,
    hasStreamCallback: !!streamCallback,
    requiresConnection: action.requiresConnection,
    steps: action.steps
  });

  // Initialize currentData from record (may be updated by token refresh)
  let currentData = { ...(record.data as any) };
  console.log('🔍 Initial record data:', {
    recordId: record.id,
    initialFields: Object.keys(currentData),
    initialData: currentData
  });

  // Check if action requires a connection and validate/refresh tokens
  if (action.requiresConnection && agent.connections) {
    const requiredConnection = agent.connections.find((c: any) => c.id === action.requiresConnection);

    if (requiredConnection) {
      console.log(`🔗 Action "${action.name}" requires connection: ${requiredConnection.title}`);
      console.log(`📋 Checking field: ${requiredConnection.fieldName}`);

      // Check if the connection is established (check if field has valid OAuth tokens)
      let connectionFieldValue = record.data?.[requiredConnection.fieldName];

      if (!connectionFieldValue || connectionFieldValue === '' || connectionFieldValue === 'null') {
        const errorMessage = `Connection "${requiredConnection.title}" is not established. Please connect ${requiredConnection.provider} first in the Connections section.`;
        console.error(`❌ ${errorMessage}`);

        // Throw error to stop execution
        throw new Error(errorMessage);
      }

      // Validate token format and refresh if needed
      try {
        const parsedAuth = JSON.parse(connectionFieldValue);
        if (!parsedAuth.accessToken) {
          throw new Error(`Connection "${requiredConnection.title}" has no access token`);
        }

        console.log(`✅ Connection found: ${requiredConnection.title}`);
        console.log(`🔑 Access token present: ${parsedAuth.accessToken.substring(0, 20)}...`);

        // Check if token needs refresh
        const provider = requiredConnection.provider as 'google' | 'facebook';
        console.log('🔍 Checking if token needs refresh...');

        const refreshResult = await ensureFreshToken(connectionFieldValue, provider);

        if (!refreshResult.success) {
          throw new Error(`Failed to ensure fresh token: ${refreshResult.error}`);
        }

        if (refreshResult.refreshed && refreshResult.newTokenData) {
          console.log('🔄 Token was refreshed, updating agent record...');

          // Update the agent record with new tokens
          const updatedTokenJson = JSON.stringify(refreshResult.newTokenData);

          await updateAgentRecord(record.id, {
            [requiredConnection.fieldName]: updatedTokenJson
          });

          // Update current data with new tokens for this execution
          currentData[requiredConnection.fieldName] = updatedTokenJson;

          console.log(`✅ Updated ${requiredConnection.fieldName} with fresh tokens`);
        } else {
          console.log('✅ Token still valid, no refresh needed');
        }

      } catch (e) {
        const errorMessage = `Connection "${requiredConnection.title}" validation failed: ${e instanceof Error ? e.message : 'Unknown error'}. Please reconnect ${requiredConnection.provider}.`;
        console.error(`❌ ${errorMessage}`);
        throw new Error(errorMessage);
      }
    } else {
      console.warn(`⚠️ Connection ID "${action.requiresConnection}" not found in agent.connections`);
    }
  }

  // Start tracking execution time
  const executionStartTime = Date.now();

  // Initialize token usage tracking
  let totalTokenUsage = {
    totalTokens: 0,
    inputTokens: 0,
    outputTokens: 0
  };

  // Create execution record for tracking
  const execution = await createAgentExecution({
    recordId: record.id,
    actionId: action.id,
    scheduleId: scheduleId,
    status: 'running'
  });

  try {
    // Execute each step sequentially
    // Note: currentData already initialized above after token refresh
    const stepResults: any[] = [];

    console.log(`🔍 DEBUG: Action has ${action.steps?.length || 0} steps:`, action.steps);

    for (let actionStepIndex = 0; actionStepIndex < action.steps.length; actionStepIndex++) {
      const step = action.steps[actionStepIndex];
      console.log(`🔄 Executing step: ${step.name}`);

      // Extract input values from the current record data
      const inputValues: any = {};
      const inputFields = step.inputFields || step.config.inputFields || [];
      inputFields.forEach((fieldName: string) => {
        inputValues[fieldName] = currentData[fieldName];
      });

      // Send action step start event
      if (streamCallback) {
        console.log(`🔄 Sending action_step_start for ${step.name} on record ${record.id}`);
        streamCallback({
          type: 'action_step_start',
          recordId: record.id,
          actionStepIndex,
          actionStepName: step.name,
          actionStepType: step.type,
          totalActionSteps: action.steps.length,
          inputs: inputValues
        });
      } else {
        console.log(`⚠️ No streamCallback available for action step ${step.name}`);
      }

      // Execute the step based on its type
      let stepResult;
      let stepTokenUsage = { totalTokens: 0, inputTokens: 0, outputTokens: 0 };
      try {
        switch (step.type) {
          case 'ai_reasoning':
            const aiResult = await executeAIReasoningStep(step, inputValues, action, agent);
            stepResult = aiResult.result;
            stepTokenUsage = aiResult.usage;
            break;
          case 'web_search':
            stepResult = await executeWebSearchStep(step, inputValues);
            break;
          case 'image_generation':
            stepResult = await executeImageGenerationStep(step, inputValues);
            break;
          case 'custom':
            stepResult = await executeCustomStep(step, inputValues);
            break;
          default:
            throw new Error(`Unknown step type: ${step.type}`);
        }

        // Accumulate token usage
        totalTokenUsage.totalTokens += stepTokenUsage.totalTokens;
        totalTokenUsage.inputTokens += stepTokenUsage.inputTokens;
        totalTokenUsage.outputTokens += stepTokenUsage.outputTokens;

        // Send action step complete event
        if (streamCallback) {
          console.log(`✅ Sending action_step_complete for ${step.name} on record ${record.id}`, {
            inputs: inputValues,
            outputs: stepResult,
            tokenUsage: stepTokenUsage
          });
          console.log(`🔍 stepResult type:`, typeof stepResult, 'value:', stepResult);
          console.log(`🔍 stepResult keys:`, stepResult ? Object.keys(stepResult) : 'no keys - stepResult is falsy');
          streamCallback({
            type: 'action_step_complete',
            recordId: record.id,
            actionStepIndex,
            actionStepName: step.name,
            actionStepType: step.type,
            success: true,
            inputs: inputValues,
            outputs: stepResult,
            outputFields: stepResult ? Object.keys(stepResult) : [],
            tokenUsage: stepTokenUsage
          });
        }
      } catch (error) {
        // Send action step error event
        if (streamCallback) {
          streamCallback({
            type: 'action_step_complete',
            recordId: record.id,
            actionStepIndex,
            actionStepName: step.name,
            actionStepType: step.type,
            success: false,
            inputs: inputValues,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
        throw error;
      }

      // Process step outputs - handle both regular fields and relationship creation
      const outputFields = step.outputFields || step.config.outputFields || [];

      console.log('🔍 Processing step outputs:', {
        stepName: step.name,
        stepType: step.type,
        outputFields,
        stepResultType: typeof stepResult,
        stepResultKeys: stepResult ? Object.keys(stepResult) : [],
        stepResult
      });

      for (const fieldName of outputFields) {
        console.log(`🔍 Processing output field: ${fieldName}`, {
          hasStepResult: !!stepResult,
          fieldValue: stepResult?.[fieldName],
          isDefined: stepResult && stepResult[fieldName] !== undefined
        });

        if (stepResult && stepResult[fieldName] !== undefined) {
          // Check if this is a relationship field that should create new records
          const targetModel = agent.models.find((m: any) => m.id === action.modelId);
          const relationshipField = targetModel?.fields?.find((f: any) => f.name === fieldName && f.type === 'reference' && f.referenceType === 'to_many');

          if (relationshipField && relationshipField.referencesModel) {
            // This is a to_many relationship field - create new records
            const relationshipData = stepResult[fieldName];

            if (relationshipData && typeof relationshipData === 'object') {
              console.log(`🔗 Creating new record in relationship field: ${fieldName}`);

              // Find the referenced model
              const referencedModel = agent.models.find((m: any) => m.name === relationshipField.referencesModel);

              if (referencedModel) {
                // Find the back-reference field
                const backReferenceField = referencedModel.fields?.find((f: any) =>
                  f.type === 'reference' && f.referencesModel === targetModel.name
                );

                const newRecord = await createAgentRecord({
                  modelId: referencedModel.id,
                  data: {
                    ...relationshipData,
                    ...(backReferenceField ? { [backReferenceField.name]: record.id } : {})
                  }
                });

                if (newRecord) {
                  // Add the new record ID to the relationship array
                  if (!Array.isArray(currentData[fieldName])) {
                    currentData[fieldName] = [];
                  }
                  currentData[fieldName].push(newRecord.id);

                  console.log(`✅ Created new ${relationshipField.referencesModel} record: ${newRecord.id}`);
                }
              }
            } else {
              // Regular field update
              currentData[fieldName] = stepResult[fieldName];
            }
          } else {
            // Regular field update
            currentData[fieldName] = stepResult[fieldName];
            console.log(`✅ Updated field: ${fieldName} =`, stepResult[fieldName]);
          }
        } else {
          console.warn(`⚠️ Output field '${fieldName}' not found in stepResult or is undefined`);
        }
      }

      console.log('📊 Current record data after step:', {
        allFields: Object.keys(currentData),
        updatedInThisStep: outputFields.filter(f => currentData[f] !== undefined),
        currentDataSnapshot: currentData
      });

      stepResults.push({
        stepName: step.name,
        stepType: step.type,
        inputs: inputValues,
        outputs: stepResult,
        tokenUsage: stepTokenUsage,
        executedAt: new Date(),
      });
    }

    // Calculate total execution time
    const executionEndTime = Date.now();
    const executionTimeMs = executionEndTime - executionStartTime;

    // Save the updated record back to the database
    console.log('💾 Final currentData before save:', {
      recordId: record.id,
      totalFields: Object.keys(currentData).length,
      fields: Object.keys(currentData),
      fullData: currentData,
      hasChanges: JSON.stringify(currentData) !== JSON.stringify(record.data)
    });

    const savedRecord = await updateAgentRecord(record.id, currentData);
    console.log('✅ Record saved successfully:', {
      savedRecordId: savedRecord?.id,
      savedData: savedRecord?.data
    });

    // Update execution status to completed with metrics
    if (execution) {
      await updateAgentExecution(execution.id, {
        status: 'completed',
        result: {
          stepResults,
          finalData: currentData,
          totalTokenUsage,
          executionTimeMs
        },
        totalTokens: totalTokenUsage.totalTokens,
        inputTokens: totalTokenUsage.inputTokens,
        outputTokens: totalTokenUsage.outputTokens,
        executionTimeMs: executionTimeMs
      });
    }

    console.log(`📊 Execution completed - Time: ${executionTimeMs}ms, Tokens: ${totalTokenUsage.totalTokens} (${totalTokenUsage.inputTokens} input, ${totalTokenUsage.outputTokens} output)`);

    return {
      recordId: record.id,
      stepResults,
      finalData: currentData,
      executionMetrics: {
        executionTimeMs,
        tokenUsage: totalTokenUsage
      }
    };
  } catch (error) {
    // Calculate execution time even for failed executions
    const executionEndTime = Date.now();
    const executionTimeMs = executionEndTime - executionStartTime;

    // Update execution status to failed with metrics
    if (execution) {
      await updateAgentExecution(execution.id, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        totalTokens: totalTokenUsage.totalTokens,
        inputTokens: totalTokenUsage.inputTokens,
        outputTokens: totalTokenUsage.outputTokens,
        executionTimeMs: executionTimeMs
      });
    }

    console.log(`❌ Execution failed - Time: ${executionTimeMs}ms, Tokens: ${totalTokenUsage.totalTokens} (${totalTokenUsage.inputTokens} input, ${totalTokenUsage.outputTokens} output)`);
    throw error;
  }
}

// Execute AI reasoning step
export async function executeAIReasoningStep(step: any, inputValues: any, action: any, agent: any) {
  const prompt = step.config.prompt || 'Process the input data';

  // Replace placeholders in prompt with actual values
  let processedPrompt = prompt;
  Object.keys(inputValues).forEach(key => {
    const placeholder = `{${key}}`;
    processedPrompt = processedPrompt.replace(new RegExp(placeholder, 'g'), inputValues[key] || '');
  });

  // Create schema for expected outputs
  const outputFields = step.outputFields || step.config.outputFields || [];
  const outputSchema: any = {};

  outputFields.forEach((fieldName: string) => {
    // Check if this is a relationship field that should create new records
    const targetModel = agent.models.find((m: any) => m.id === action.modelId);
    const relationshipField = targetModel?.fields?.find((f: any) => f.name === fieldName && f.type === 'reference' && f.referenceType === 'to_many');

    if (relationshipField && relationshipField.referencesModel) {
      // This is a relationship field - the output should be a complete model object
      const referencedModel = agent.models.find((m: any) => m.name === relationshipField.referencesModel);

      if (referencedModel) {
        const recordSchema: any = {};

        // Build schema for the referenced model
        referencedModel.fields?.forEach((field: any) => {
          if (field.type !== 'reference' || field.referencesModel !== targetModel.name) {
            switch (field.type) {
              case 'text':
                recordSchema[field.name] = z.string().describe(`${field.description || field.title || field.name}`);
                break;
              case 'number':
                recordSchema[field.name] = z.number().describe(`${field.description || field.title || field.name}`);
                break;
              case 'boolean':
                recordSchema[field.name] = z.boolean().describe(`${field.description || field.title || field.name}`);
                break;
              case 'date':
                recordSchema[field.name] = z.string().describe(`${field.description || field.title || field.name} (YYYY-MM-DD format)`);
                break;
              default:
                recordSchema[field.name] = z.string().describe(`${field.description || field.title || field.name}`);
            }
          }
        });

        outputSchema[fieldName] = z.object(recordSchema).describe(
          `Complete ${relationshipField.referencesModel} record object with all required fields.`
        );
      } else {
        outputSchema[fieldName] = z.string().describe(`Generated ${fieldName} based on the input data`);
      }
    } else {
      // Regular field
      outputSchema[fieldName] = z.string().describe(`Generated ${fieldName} based on the input data`);
    }
  });

  const resultSchema = z.object(outputSchema);

  // Add explicit instructions for relationship fields
  const hasRelationshipFields = outputFields.some((fieldName: string) => {
    const targetModel = agent.models.find((m: any) => m.id === action.modelId);
    const relationshipField = targetModel?.fields?.find((f: any) => f.name === fieldName && f.type === 'reference' && f.referenceType === 'to_many');
    return relationshipField && relationshipField.referencesModel;
  });

  let enhancedPrompt = processedPrompt;
  if (hasRelationshipFields) {
    enhancedPrompt += '\n\nIMPORTANT: For any relationship fields (like "posts"), you MUST generate a structured object with the actual field values, NOT a text description. For example, generate {"title": "Actual Title", "content": "Actual Content", "status": "draft"} instead of a string like "New post about...".';
  }

  // Use safe model validation
  const modelToUse = getSafeModelId(step.config.model);

  const result = await generateObject({
    model: myProvider.languageModel(modelToUse),
    schema: resultSchema,
    prompt: enhancedPrompt,
  });

  console.log(`🔍 AI reasoning result:`, result);
  console.log(`🔍 result.object:`, result.object);
  console.log(`🔍 result.usage:`, result.usage);

  // Return both result and usage with safe defaults for undefined values
  return {
    result: result.object,
    usage: {
      totalTokens: result.usage?.totalTokens || 0,
      inputTokens: (result.usage as any)?.promptTokens || 0,
      outputTokens: (result.usage as any)?.completionTokens || 0
    }
  };
}

// Execute web search step
export async function executeWebSearchStep(step: any, inputValues: any) {
  const searchQuery = Object.values(inputValues).filter(v => v).join(' ');
  console.log('🌐 Web search for:', searchQuery);

  const outputFields = step.outputFields || step.config.outputFields || [];

  // Build dynamic schema for output fields
  const schemaProperties: Record<string, any> = {};
  outputFields.forEach((fieldName: string) => {
    schemaProperties[fieldName] = z.string().describe(`Search result for ${fieldName}`);
  });

  try {
    // Use generateObject to perform web search with structured output
    const result = await generateObject({
      model: myProvider.languageModel('gpt-4o-mini'), // Use a standard model for web search
      prompt: `Perform a web search and provide current, accurate information for the following query: "${searchQuery}"\n\nProvide results for these specific fields: ${outputFields.join(', ')}`,
      schema: z.object(schemaProperties),
    });

    const { object } = result;

    console.log('✅ Web search results:', object);
    return object;
  } catch (error) {
    console.error('❌ Web search failed:', error);

    // Fallback: return placeholder results
    const results: any = {};
    outputFields.forEach((fieldName: string) => {
      results[fieldName] = `Unable to search for ${fieldName}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    });
    return results;
  }
}

// Execute image generation step
export async function executeImageGenerationStep(step: any, inputValues: any) {
  console.log('🖼️ Image generation with:', inputValues);

  // Replace placeholders in prompt with actual values
  let processedPrompt = step.config?.prompt || step.prompt || '';
  Object.keys(inputValues).forEach(key => {
    const placeholder = `{${key}}`;
    processedPrompt = processedPrompt.replace(new RegExp(placeholder, 'g'), inputValues[key] || '');
  });

  console.log('🎨 Generating image with prompt:', processedPrompt);

  const outputFields = step.outputFields || step.config.outputFields || [];
  const config = step.config || {};

  try {
    // Determine the model to use - default to dall-e-3
    let modelId = config.model || 'openai/dall-e-3';

    // Handle legacy/incorrect model formats
    if (modelId.includes('openai.image')) {
      modelId = 'openai/dall-e-3';
    } else if (modelId === 'dall-e-3') {
      modelId = 'openai/dall-e-3';
    } else if (modelId === 'grok-2-image') {
      modelId = 'xai/grok-2-image';
    }

    console.log('🎨 Using image model:', modelId);

    // Build generation options
    const generateOptions: any = {
      model: gateway.imageModel(modelId),
      prompt: processedPrompt,
    };

    // Add optional parameters if specified
    if (config.size) {
      generateOptions.size = config.size;
    }

    if (config.aspectRatio) {
      generateOptions.aspectRatio = config.aspectRatio;
    }

    if (config.n) {
      generateOptions.n = config.n;
    }

    if (config.seed) {
      generateOptions.seed = config.seed;
    }

    // Generate image(s)
    const result = await generateImage(generateOptions);

    // Process results
    const results: any = {};

    if (config.n && config.n > 1 && result.images) {
      // Multiple images generated
      console.log(`✅ Generated ${result.images.length} images`);

      // For multiple images, store as array of base64 data URLs
      outputFields.forEach((fieldName: string) => {
        results[fieldName] = result.images.map((img: any) =>
          `data:image/png;base64,${img.base64}`
        );
      });
    } else {
      // Single image generated
      const image = result.image || (result.images && result.images[0]);

      if (image) {
        console.log('✅ Image generated successfully');

        // Convert to base64 data URL for storage
        const imageDataUrl = `data:image/png;base64,${image.base64}`;

        // Store in all output fields (typically just one image_url field)
        outputFields.forEach((fieldName: string) => {
          results[fieldName] = imageDataUrl;
        });
      } else {
        throw new Error('No image generated');
      }
    }

    return results;

  } catch (error) {
    console.error('❌ Image generation failed:', error);

    // Fallback: return error message
    const results: any = {};
    outputFields.forEach((fieldName: string) => {
      results[fieldName] = `Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    });
    return results;
  }
}

// Execute custom step
export async function executeCustomStep(step: any, inputValues: any) {
  console.log('🔧 Custom processing with:', inputValues);
  console.log('🔍 Step details:', {
    name: step.name,
    type: step.type,
    hasDeployment: !!step.config?.deployment,
    deploymentUrl: step.config?.deployment?.url,
    deploymentStatus: step.config?.deployment?.status,
    hasCode: !!step.config?.code,
    hasCustomCode: !!step.config?.customCode,
    hasDescription: !!step.config?.description
  });

  // Check if this is an OAuth step (by checking customCode for OAUTH_REQUIRED marker)
  const customCode = step.config?.customCode || step.config?.code || '';
  if (customCode.includes('OAUTH_REQUIRED') || customCode.includes('requiresOAuth')) {
    console.log('🔐 OAuth step detected - executing custom code to get OAuth requirements');

    // Execute the custom code to get OAuth configuration
    // This is safe because our template code only returns a config object
    try {
      // Create a safe evaluation context with the input values
      const evalFunction = new Function(...Object.keys(inputValues), customCode);
      const result = evalFunction(...Object.values(inputValues));

      console.log('🔐 OAuth configuration:', result);

      // Return the OAuth requirement so the API can signal the frontend
      if (result.requiresOAuth) {
        return {
          requiresOAuth: true,
          provider: result.provider,
          scopes: result.scopes,
          outputField: result.outputField,
          requiresExisting: result.requiresExisting,
        };
      }
    } catch (error) {
      console.error('❌ Failed to evaluate OAuth custom code:', error);
      throw new Error(`OAuth step evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Check if step has been deployed (deployment info is in step.config)
  if (step.config?.deployment && step.config.deployment.url && step.config.deployment.status === 'deployed') {
    console.log(`🌐 Calling deployed API endpoint: ${step.config.deployment.url}`);

    try {
      // Call the deployed API endpoint
      const response = await fetch(step.config.deployment.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...inputValues, // Send input fields directly as expected by generated code
          metadata: {
            stepName: step.name,
            executedAt: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API endpoint error: ${response.status} ${response.statusText}`);
        console.error(`❌ Error details: ${errorText}`);
        throw new Error(`API endpoint returned ${response.status}: ${errorText}`);
      }

      const apiResult = await response.json();
      console.log('✅ API endpoint response:', apiResult);

      // Extract results from API response
      // The generated API should return { success: true, ...outputFields }
      if (apiResult && typeof apiResult === 'object' && apiResult.success) {
        // Remove the success field and return the rest as output fields
        const { success, ...results } = apiResult;

        // Validate that we have the expected output fields
        const outputFields = step.outputFields || step.config.outputFields || [];
        const validatedResults: any = {};

        outputFields.forEach((fieldName: string) => {
          if (results[fieldName] !== undefined) {
            validatedResults[fieldName] = results[fieldName];
          } else {
            console.warn(`⚠️ Expected output field '${fieldName}' not found in API response`);
            validatedResults[fieldName] = null;
          }
        });

        // Also include any additional fields returned by the API
        Object.keys(results).forEach(key => {
          if (!validatedResults.hasOwnProperty(key)) {
            validatedResults[key] = results[key];
          }
        });

        console.log('✅ Processed API results:', validatedResults);
        return validatedResults;
      } else {
        throw new Error('API endpoint returned invalid response format or failed');
      }

    } catch (error) {
      console.error('❌ Failed to call deployed API endpoint:', error);
      throw error;
    }
  } else {
    // No deployment available - execute code directly without deployment
    console.log('⚠️ Custom step has no deployment, executing code directly...');

    if (step.config?.code || step.config?.description) {
      try {
        let codeToExecute = step.config.code;

        // If we don't have code but have a description, generate it first
        if (!codeToExecute && step.config.description) {
          console.log('🤖 Generating code for execution...');
          const { generateCustomStepCode } = await import('@/lib/ai/code-generator');

          const codeGenResult = await generateCustomStepCode({
            description: step.config.description,
            stepName: step.name,
            inputFields: step.inputFields || step.config.inputFields || [],
            outputFields: step.outputFields || step.config.outputFields || [],
            targetModel: 'unknown',
          });

          codeToExecute = codeGenResult.code;

          // Update step config with generated code
          step.config.code = codeGenResult.code;
          step.config.dependencies = codeGenResult.dependencies;
          step.config.envVars = codeGenResult.envVars;
        }

        // Execute the code directly (no deployment)
        console.log('🚀 Executing custom code directly...');
        const { executeGeneratedCode } = await import('@/lib/ai/code-generator');

        // Get output fields from step config
        const outputFields = step.outputFields || step.config.outputFields || [];
        console.log('📋 Expected output fields:', outputFields);

        const result = await executeGeneratedCode(codeToExecute, inputValues, outputFields);
        console.log('✅ Custom code executed directly:', result);
        console.log('📊 Result has output fields:', outputFields.map(f => `${f}: ${result[f] !== undefined ? '✓' : '✗'}`));

        return result;

      } catch (error) {
        console.error('❌ Failed to execute custom step:', error);
        throw new Error(`Custom step execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      console.error('❌ Custom step has no code or description');
      throw new Error('Custom step requires code or description for execution');
    }
  }
} 