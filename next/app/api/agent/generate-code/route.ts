import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { ChatSDKError } from '@/lib/errors';
import { generateCustomStepCode } from '@/lib/ai/code-generator';

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers
  });

  if (!session?.user) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  try {
    const body = await request.json();
    const { description, stepName, inputFields, outputFields, targetModel } = body;

    if (!description || !inputFields || !outputFields) {
      return Response.json(
        { error: 'Missing required fields: description, inputFields, outputFields' },
        { status: 400 }
      );
    }

    const result = await generateCustomStepCode({
      description,
      stepName,
      inputFields,
      outputFields,
      targetModel,
    });

    return Response.json({
      success: true,
      code: result.code,
      envVars: result.envVars,
      explanation: result.explanation,
      dependencies: result.dependencies,
      npmPackages: result.dependencies, // For backward compatibility
    });

  } catch (error) {
    console.error('❌ Code generation error:', error);
    return Response.json(
      {
        error: 'Code generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 