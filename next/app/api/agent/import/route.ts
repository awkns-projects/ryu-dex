import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { generateObject } from 'ai';
import { z } from 'zod';
import { myProvider } from '@/lib/ai/providers';
import { getFullAgentWithModelsAndActions, createAgentRecord } from '@/lib/db/agent-queries';
import { generateUUID } from '@/lib/utils';
import { ChatSDKError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers
  });

  if (!session?.user) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  try {
    const formData = await request.formData();
    const fileEntry = formData.get('file');
    const agentId = formData.get('agentId') as string;
    const modelId = formData.get('modelId') as string;

    if (!fileEntry || !(fileEntry instanceof File) || !agentId || !modelId) {
      return Response.json(
        { error: 'Missing required fields: file, agentId, modelId' },
        { status: 400 }
      );
    }

    const file = fileEntry;
    console.log('📁 Processing file upload:', file.name, 'type:', file.type);

    // Get agent and model information
    const agent = await getFullAgentWithModelsAndActions(agentId);
    if (!agent || agent.agent.userId !== session.user.id) {
      return new ChatSDKError('forbidden:chat').toResponse();
    }

    const targetModel = agent.models.find(m => m.id === modelId);
    if (!targetModel) {
      return Response.json(
        { error: 'Model not found' },
        { status: 404 }
      );
    }

    console.log('🎯 Target model:', targetModel.name, 'Fields:', targetModel.fields);

    // Read file content
    const fileContent = await file.text();
    console.log('📄 File content length:', fileContent.length);

    // Create schema for the expected records
    const fieldSchemas: any = {};
    (targetModel.fields as any[]).forEach((field: any) => {
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
        case 'json':
          fieldSchemas[field.name] = z.record(z.any()).describe(field.description || `A JSON object for ${field.name}`);
          break;
        default:
          fieldSchemas[field.name] = z.string().describe(field.description || `A ${field.name} value`);
      }
    });

    const recordSchema = z.object(fieldSchemas);
    const recordsSchema = z.object({
      records: z.array(recordSchema),
      summary: z.string().describe('Summary of what was processed'),
    });

    // Use AI to analyze and extract data
    console.log('🤖 Using AI to analyze file and extract records...');
    const result = await generateObject({
      model: myProvider.languageModel('artifact-model'),
      schema: recordsSchema,
      prompt: `Analyze the ${file.type.includes('csv') ? 'CSV' : 'PDF'} file content and extract records that match the ${targetModel.name} model structure.

Target Model: ${targetModel.name}
Expected Fields:
${(targetModel.fields as any[]).map((f: any) => `- ${f.name} (${f.type}): ${f.description || 'No description'}`).join('\n')}

File Content:
${fileContent}

Instructions:
1. Parse the file content and identify records that can be mapped to the model fields
2. Convert the data to match the expected field types
3. Clean and normalize the data as needed
4. Only include complete records (don't create partial records)
5. Provide a summary of what was processed

Extract as many valid records as possible that match the model structure.`,
    });

    console.log('✅ AI analysis completed. Found', result.object.records.length, 'records');

    // Save the extracted records to the database
    const savedRecords = await Promise.all(
      result.object.records.map(async (record: any) => {
        return await createAgentRecord({
          modelId: targetModel.id,
          data: {
            id: generateUUID(),
            ...record
          },
        });
      })
    );

    console.log('💾 Saved', savedRecords.length, 'records to database');

    return Response.json({
      success: true,
      recordsProcessed: savedRecords.length,
      summary: result.object.summary,
      message: `Successfully imported ${savedRecords.length} records from ${file.name}`,
    });

  } catch (error) {
    console.error('❌ File import error:', error);
    return Response.json(
      {
        error: 'Failed to process file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 