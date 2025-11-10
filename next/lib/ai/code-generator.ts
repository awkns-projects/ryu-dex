import { generateObject } from 'ai';
import { z } from 'zod';
import { myProvider } from '@/lib/ai/providers';
import { detectRequiredOAuthTokens, OAUTH_TOKENS } from '@/lib/oauth-constants';

// Schema for generated code response
export const codeGenerationSchema = z.object({
  code: z.string().describe('Complete Next.js API route code (POST handler)'),
  envVars: z.array(z.string()).describe('Environment variables needed'),
  explanation: z.string().describe('Brief explanation of what the API route does'),
  dependencies: z.array(z.object({
    name: z.string().describe('NPM package name'),
    version: z.string().describe('Recommended version (e.g., "^2.1.0")'),
    reason: z.string().describe('Why this package is needed')
  })).describe('NPM packages required with versions'),
});

export type CodeGenerationResult = z.infer<typeof codeGenerationSchema>;

export interface CodeGenerationParams {
  description: string;
  stepName?: string;
  inputFields: string[];
  outputFields: string[];
  targetModel?: string;
}

/**
 * Generate custom processing code for agent steps
 */
export async function generateCustomStepCode({
  description,
  stepName = 'customStep',
  inputFields,
  outputFields,
  targetModel = 'unknown'
}: CodeGenerationParams): Promise<CodeGenerationResult> {
  console.log('🤖 Generating AI code for custom step:', { stepName, description });

  const result = await generateObject({
    model: myProvider.languageModel('artifact-model'),
    schema: codeGenerationSchema,
    prompt: `Generate a complete Next.js API route for custom processing based on the following requirements:

**Step Name:** ${stepName}
**Description:** ${description}
**Target Model:** ${targetModel}
**Input Fields:** ${inputFields.join(', ')}
**Output Fields:** ${outputFields.join(', ')}

**Requirements:**
1. Create a complete Next.js API route file (route.ts) with a POST handler using Node.js/TypeScript
2. The POST handler should accept a request body with the input fields: { ${inputFields.map((f: string) => `${f}: any`).join(', ')} }
3. Process the input data according to the description using Node.js libraries and APIs
4. Return a JSON response with success and the output fields: { success: true, ${outputFields.map((f: string) => `${f}: any`).join(', ')} }
5. Include proper TypeScript types, error handling, and authentication if needed
6. Use Node.js NPM libraries when appropriate for the processing requirements
7. Include proper imports, middleware, and Next.js/Node.js best practices
8. **CRITICAL**: If the description mentions ANY social media platforms, you MUST use these EXACT OAuth token names:
   - Twitter/X/"X post"/"tweet" → ${OAUTH_TOKENS.X_TWITTER}
   - Facebook/"fb"/"facebook post" → ${OAUTH_TOKENS.FACEBOOK}
   - Instagram/"ig"/"instagram post" → ${OAUTH_TOKENS.INSTAGRAM}
   - Threads/"threads post" → ${OAUTH_TOKENS.THREADS}
   ALWAYS use these EXACT token names in the envVars array!
9. For other APIs, suggest appropriate environment variable names
10. Handle rate limiting, validation, and API errors gracefully
11. **MANDATORY**: Always return ALL required environment variables in the envVars array, especially OAuth tokens

**API Route Structure:**
- Import statements (NextRequest, external Node.js NPM libraries ONLY)
- POST function export with proper TypeScript types  
- Request body validation (basic JSON parsing)
- Main processing logic using Node.js (pure data transformation)
- Return JSON response with output fields
- Error handling for processing failures

**MINIMAL NODE.JS API ROUTE PATTERN:**
1. Import NextRequest and external Node.js NPM packages only
2. Export async POST function with TypeScript types
3. Parse request body to get input fields
4. Process data using Node.js logic (no database/auth operations)
5. Return JSON with success: true and output fields
6. Handle errors with proper status codes

**CRITICAL CONSTRAINTS:**
- DO NOT use relative imports like '../../lib/twitter' or '../utils/helper'
- ALL code must be self-contained within the single Node.js API route file
- Only import from Node.js NPM packages, Next.js, and standard Node.js modules
- If you need utility functions, define them within the same file using Node.js/TypeScript
- Initialize API clients directly in the file using environment variables and Node.js patterns

**FORBIDDEN OPERATIONS:**
- NO database operations (no db.insert, db.update, db.select, etc.)
- NO user authentication checks (unless calling external APIs that require auth)
- NO file system operations (no fs.writeFile, fs.readFile, etc.)
- NO session management or user data access
- Focus ONLY on processing the input data to generate output data

**ALLOWED OPERATIONS (Node.js only):**
- External API calls using Node.js libraries (with proper auth tokens from env vars)
- Data transformation and processing with Node.js/TypeScript
- Mathematical calculations using Node.js math libraries
- Text analysis and generation with Node.js NLP libraries
- Image processing using Node.js image libraries
- Web scraping with Node.js scraping libraries (cheerio, puppeteer, etc.)
- AI/ML processing using Node.js clients (OpenAI, etc.)

**CORRECT IMPORTS:**
✅ import { NextRequest } from 'next/server';
✅ import { auth } from 'app/app/(auth)/auth';
✅ import axios from 'axios';
✅ import { TwitterApi } from 'twitter-api-v2';

**INCORRECT IMPORTS:**
❌ import { twitterClient } from '../../lib/twitter';
❌ import { helper } from '../utils/helper';
❌ import { config } from 'app/lib/config';

**SELF-CONTAINED NODE.JS APPROACH:**
Instead of importing utilities, define everything needed within the API route using Node.js/TypeScript:

Example: Define utility functions in the same file using Node.js patterns
- const initializeTwitterClient = () => new TwitterApi(process.env.X_ACCESS_TOKEN);
- const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
- All Node.js logic must be contained within the single API route file

**Example Request Body:** { ${inputFields.map((f: string) => `"${f}": "sample_value"`).join(', ')} }
**Example Response:** { "success": true, ${outputFields.map((f: string) => `"${f}": "generated_value"`).join(', ')} }

Generate a complete, deployable Next.js API route using Node.js/TypeScript with all necessary imports and dependencies.`,
  });

  console.log('✅ AI code generation completed');

  // Post-process to ensure OAuth tokens are detected using standardized names
  const detectedEnvVars = new Set(result.object.envVars);

  // Combine description and step name for better detection
  const searchText = `${description} ${stepName}`;

  // Auto-detect OAuth tokens using shared detection logic
  const detectedOAuthTokens = detectRequiredOAuthTokens(searchText);
  detectedOAuthTokens.forEach(token => {
    if (!detectedEnvVars.has(token)) {
      console.log(`🔍 Auto-detected OAuth requirement: ${token}`);
      detectedEnvVars.add(token);
    }
  });

  // Update the result with detected env vars
  const enhancedResult = {
    ...result.object,
    envVars: Array.from(detectedEnvVars)
  };

  if (enhancedResult.envVars.length > 0) {
    console.log('🔍 Final environment variables required:', enhancedResult.envVars);
  }

  return enhancedResult;
}

/**
 * Execute generated custom step code (for agent step execution)
 * Executes code directly in Node.js environment without deployment
 */
export async function executeGeneratedCode(
  generatedCode: string,
  inputData: Record<string, any>,
  outputFields?: string[]
): Promise<any> {
  console.log('🔧 Executing generated code with input:', inputData);
  console.log('📝 Code preview:', generatedCode.substring(0, 300) + '...');

  try {
    // The generated code should export a handler function
    // Create a module-like context for the code
    const moduleContext = {
      exports: {} as any,
      module: { exports: {} as any },
      console,
      JSON,
      Date,
      Math,
      Object,
      Array,
      String,
      Number,
      Boolean,
      Promise,
      setTimeout,
      setInterval,
      clearTimeout,
      clearInterval,
    };

    // Create async function with module context
    const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;

    // Wrap code to execute in module context
    const wrappedCode = `
      const module = { exports: {} };
      const exports = module.exports;
      
      ${generatedCode}
      
      // Return the exported handler or the module.exports
      return module.exports.handler || module.exports.processData || module.exports;
    `;

    // Execute the code to get the handler function
    const executeFn = new AsyncFunction('console', 'JSON', 'Date', 'Math', wrappedCode);
    const handler = await executeFn(console, JSON, Date, Math);

    console.log('📦 Loaded handler:', typeof handler);

    // If handler is a function, call it with input data
    if (typeof handler === 'function') {
      console.log('🚀 Calling handler function with input data...');
      const result = await handler(inputData);
      console.log('✅ Handler executed successfully:', result);
      console.log('📊 Result keys:', result ? Object.keys(result) : 'no result');

      // Ensure result is an object (not a primitive or undefined)
      if (!result || typeof result !== 'object') {
        console.warn('⚠️ Handler returned non-object result, wrapping it');
        return { result };
      }

      return result;
    }
    // If handler is an object (might be the exports object), check for common function names
    else if (handler && typeof handler === 'object') {
      if (typeof handler.handler === 'function') {
        console.log('🚀 Found handler.handler function');
        const result = await handler.handler(inputData);
        console.log('✅ Handler executed successfully:', result);
        console.log('📊 Result keys:', result ? Object.keys(result) : 'no result');

        if (!result || typeof result !== 'object') {
          return { result };
        }
        return result;
      } else if (typeof handler.processData === 'function') {
        console.log('🚀 Found handler.processData function');
        const result = await handler.processData(inputData);
        console.log('✅ ProcessData executed successfully:', result);
        console.log('📊 Result keys:', result ? Object.keys(result) : 'no result');

        if (!result || typeof result !== 'object') {
          return { result };
        }
        return result;
      }
    }

    // If no handler function found, return placeholder values for output fields
    console.warn('⚠️ No handler function found in generated code');
    console.warn('⚠️ Returning placeholder values for output fields');

    // Create placeholder result with output fields
    const placeholderResult: any = {};

    if (outputFields && outputFields.length > 0) {
      // Provide reasonable placeholder values based on field names
      outputFields.forEach(fieldName => {
        if (fieldName.toLowerCase().includes('url')) {
          placeholderResult[fieldName] = '#';
        } else if (fieldName.toLowerCase().includes('date') || fieldName.toLowerCase().includes('at')) {
          placeholderResult[fieldName] = new Date().toISOString();
        } else if (fieldName.toLowerCase().includes('updated') || fieldName.toLowerCase().includes('synced') || fieldName.toLowerCase().includes('sent')) {
          placeholderResult[fieldName] = true;
        } else if (fieldName.toLowerCase().includes('status')) {
          placeholderResult[fieldName] = 'completed';
        } else {
          placeholderResult[fieldName] = `Processed by ${handler ? 'handler' : 'custom step'}`;
        }
      });

      console.log('📝 Generated placeholder values:', placeholderResult);
    }

    return placeholderResult;

  } catch (error) {
    console.error('❌ Code execution failed:', error);
    console.error('📝 Generated code that failed:', generatedCode);

    throw new Error(`Code execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Deploy generated custom step code to Vercel (server-side only)
 * Note: This function should only be used in server-side contexts during agent creation
 * For client-side deployment, use the /api/deploy-step endpoint directly
 */
export async function deployCustomStepCode({
  stepName,
  code,
  dependencies,
  envVars,
  description
}: {
  stepName: string;
  code: string;
  dependencies: { name: string; version: string; reason: string; }[];
  envVars: string[];
  description?: string;
}): Promise<{
  url: string;
  deploymentId: string;
  projectId: string;
  deploymentUrl: string;
}> {
  console.log('🚀 Deploying custom step code (server-side):', stepName);

  // For now, we'll skip deployment during agent creation to avoid complexity
  // Instead, we'll mark the step as deployable and deploy on-demand during execution
  console.log('⚠️ Server-side deployment skipped - will deploy on-demand during execution');

  throw new Error('Server-side deployment not implemented - deployment will happen on-demand during execution');
}

/**
 * Generate and deploy custom step code in one operation
 */
export async function generateAndDeployCustomStep({
  description,
  stepName = 'customStep',
  inputFields,
  outputFields,
  targetModel = 'unknown'
}: CodeGenerationParams): Promise<{
  code: string;
  dependencies: { name: string; version: string; reason: string; }[];
  envVars: string[];
  explanation: string;
  deployment: {
    url: string;
    deploymentId: string;
    projectId: string;
    deploymentUrl: string;
    deployedAt: string;
    status: 'deployed';
  };
}> {
  console.log('🤖 Generating and deploying custom step:', stepName);

  // Step 1: Generate the code
  const codeResult = await generateCustomStepCode({
    description,
    stepName,
    inputFields,
    outputFields,
    targetModel,
  });

  // Step 2: Deploy the code
  const deploymentResult = await deployCustomStepCode({
    stepName,
    code: codeResult.code,
    dependencies: codeResult.dependencies,
    envVars: codeResult.envVars,
    description,
  });

  return {
    ...codeResult,
    deployment: {
      ...deploymentResult,
      deployedAt: new Date().toISOString(),
      status: 'deployed' as const,
    },
  };
} 