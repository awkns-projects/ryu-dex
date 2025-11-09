import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { generateObject } from 'ai';
import { z } from 'zod';
import { myProvider } from '@/lib/ai/providers';
import { getFullAgentWithModelsAndActions } from '@/lib/db/agent-queries';
import { ChatSDKError } from '@/lib/errors';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers
  });

  if (!session?.user) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  try {
    const body = await request.json();
    const { agentId, query, modelId } = body;

    if (!agentId || !query) {
      return Response.json(
        { error: 'Missing required fields: agentId, query' },
        { status: 400 }
      );
    }

    console.log('🔍 Semantic search request:', { agentId, query, modelId });

    // Get agent and verify ownership
    const agent = await getFullAgentWithModelsAndActions(agentId);
    if (!agent || agent.agent.userId !== session.user.id) {
      return new ChatSDKError('forbidden:chat').toResponse();
    }

    // Determine which models to search
    const modelsToSearch = modelId
      ? agent.models.filter(m => m.id === modelId)
      : agent.models;

    console.log('📊 Searching across', modelsToSearch.length, 'models');

    // Initialize OpenAI client for embeddings
    const apiKey = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;
    const openai = new OpenAI({
      apiKey,
      baseURL: 'https://ai-gateway.vercel.sh/v1',
    });

    // Generate embedding for the search query
    console.log('🧠 Generating query embedding...');
    const queryEmbeddingResponse = await openai.embeddings.create({
      model: 'openai/text-embedding-3-small',
      input: query,
    });
    const queryEmbedding = queryEmbeddingResponse.data[0].embedding;

    console.log('✅ Generated query embedding, length:', queryEmbedding.length);

    // Search across all records in the selected models
    const allSearchResults = [];

    for (const model of modelsToSearch) {
      if (!model.records || model.records.length === 0) continue;

      console.log(`🔍 Searching ${model.records.length} records in model: ${model.name}`);

      // Create embeddings for each record and calculate similarity
      for (const record of model.records) {
        try {
          // Create searchable text from record fields
          const recordData = record as any;
          const searchableText = (model.fields as any[])
            .filter(field => field.type === 'text')
            .map(field => `${field.name}: ${recordData[field.name] || ''}`)
            .join(' ');

          if (!searchableText.trim()) continue;

          // Generate embedding for this record
          const recordEmbeddingResponse = await openai.embeddings.create({
            model: 'openai/text-embedding-3-small',
            input: searchableText,
          });
          const recordEmbedding = recordEmbeddingResponse.data[0].embedding;

          // Calculate cosine similarity
          const similarity = cosineSimilarity(queryEmbedding, recordEmbedding);

          // Only include results above a threshold
          if (similarity > 0.3) {
            allSearchResults.push({
              id: recordData.id,
              record: recordData,
              modelName: model.name,
              modelId: model.id,
              similarity,
              searchableText,
              reason: await generateSearchReason(query, searchableText, similarity),
            });
          }
        } catch (error) {
          console.warn('⚠️ Failed to process record:', record, error);
        }
      }
    }

    // Sort by similarity (highest first)
    allSearchResults.sort((a, b) => b.similarity - a.similarity);

    // Limit results
    const topResults = allSearchResults.slice(0, 10);

    console.log('✅ Found', topResults.length, 'semantic matches');

    return Response.json({
      success: true,
      query,
      recordsSearched: modelsToSearch.reduce((sum, m) => sum + (m.records?.length || 0), 0),
      records: topResults,
    });

  } catch (error) {
    console.error('❌ Semantic search error:', error);
    return Response.json(
      {
        error: 'Search failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Calculate cosine similarity between two vectors
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Generate explanation for why a record matched
async function generateSearchReason(query: string, recordText: string, similarity: number): Promise<string> {
  try {
    const reasonSchema = z.object({
      reason: z.string().describe('Brief explanation of why this record matches the search query'),
    });

    const result = await generateObject({
      model: myProvider.languageModel('artifact-model'),
      schema: reasonSchema,
      prompt: `Explain why this record matches the search query in 1-2 words.

Search Query: "${query}"
Record: ${recordText}
Similarity Score: ${Math.round(similarity * 100)}%

Provide a brief reason like "name match", "species match", "description similarity", etc.`,
    });

    return result.object.reason;
  } catch (error) {
    return 'content similarity';
  }
} 