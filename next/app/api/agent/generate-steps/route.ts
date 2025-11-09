import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { generateObject } from 'ai';
import { z } from 'zod';
import { myProvider } from '@/lib/ai/providers';

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers
  });
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { actionName, actionDescription, targetModel, existingModels } = await request.json();

    if (!actionName || !actionDescription || !targetModel) {
      return new Response('Action name, description, and target model are required', { status: 400 });
    }

    // Define the schema for the AI response
    const stepGenerationSchema = z.object({
      steps: z.array(z.object({
        name: z.string().describe('Step name that clearly describes what this step does'),
        type: z.enum(['ai_reasoning', 'web_search', 'custom', 'image_generation']).describe('Type of processing step'),
        prompt: z.string().describe('The prompt/description for this step with {fieldName} placeholders'),
        inputFields: z.array(z.string()).describe('Fields from the record that this step will read'),
        outputFields: z.array(z.string()).describe('Fields that this step will generate or update'),
        order: z.number().describe('Step execution order (1, 2, 3, etc.)')
      })).describe('Complete workflow steps for this action'),
      enhancedActionDescription: z.string().describe('An improved version of the action description with better clarity'),
      suggestedModels: z.array(z.object({
        name: z.string().describe('Model name in PascalCase'),
        description: z.string().describe('Brief description of what this model represents'),
        fields: z.array(z.object({
          name: z.string().describe('Field name in camelCase'),
          type: z.enum(['text', 'number', 'boolean', 'date', 'json', 'reference', 'enum', 'image_url']).describe('Field type'),
          description: z.string().describe('Brief description of the field'),
          required: z.boolean().describe('Whether this field is required'),
          enumValues: z.array(z.string()).optional().describe('For enum fields, the list of possible values')
        })).describe('Fields for the new model')
      })).describe('New models that might be needed for complex output data')
    });

    const targetModelInfo = existingModels?.find((m: any) => m.name === targetModel);
    const existingFields = targetModelInfo?.fields || [];

    const systemPrompt = `You are an AI assistant that creates complete step workflows for data processing actions.

CONTEXT: You are creating steps for the action "${actionName}" that will process individual ${targetModel} records.

Target Model: ${targetModel}
Existing Fields in ${targetModel}:
${existingFields.map((f: any) => `- ${f.name} (${f.type}${f.enumValues ? ` - values: ${f.enumValues.join(', ')}` : ''})`).join('\n')}

ACTION PROCESSING CONTEXT:
- This action will process ONE ${targetModel} record at a time
- Each step reads data from the current record and generates new data for that record
- Steps execute sequentially, with later steps able to use outputs from earlier steps
- The goal is to transform/enhance the single record being processed

STEP CREATION GUIDELINES:
1. ANALYZE the action description to understand the complete workflow needed
2. BREAK DOWN complex processing into logical sequential steps
3. Each step should have a clear, single purpose
4. Use existing fields from the target model whenever possible
5. Only create custom output fields for truly new data
6. Consider what type of processing each step needs:
   - ai_reasoning: For analysis, content generation, decision making
   - web_search: For gathering external information
   - image_generation: For generating images based on prompts
   - custom: For complex calculations or external API calls

FIELD USAGE RULES:
- For INPUT FIELDS: Use existing field names from the list above
- For OUTPUT FIELDS: Create new field names for data that doesn't exist yet
- Use {fieldName} syntax in prompts to reference input fields
- Make prompts singular and record-specific: "Analyze this pet's {healthStatus}"
- For image outputs, use image_url field type to store generated images

STEP TYPES:
- ai_reasoning: Use for content generation, analysis, decision making
- web_search: Use when external information is needed
- image_generation: Use for generating images (outputs image_url fields)
- custom: Use for calculations, API calls, or complex logic

CRITICAL: SOCIAL MEDIA IMAGE POSTING
For actions that post images to social media (X/Twitter, Facebook, Instagram), you MUST create TWO steps:

Step 1 (image_generation): Generate the image
- Type: image_generation
- Outputs: image_url field (e.g., generatedImage)

Step 2 (custom): Post to social platform
- Type: custom
- Description MUST include platform keywords for OAuth detection:
  * X/Twitter: "post to X", "post to Twitter", "tweet", "publish to X"
  * Facebook: "post to Facebook"
  * Instagram: "post to Instagram"
  * Threads: "post to Threads"
- Inputs: image_url field from step 1, caption/text
- Outputs: post URL, timestamp, status

Example X Post Action: "Create and post AI image to X/Twitter"
Steps:
1. "Generate Image" (image_generation): reads {imagePrompt} → outputs generatedImage
2. "Post to X" (custom, description: "Post the generated image to X/Twitter with caption"): reads {generatedImage, caption} → outputs tweetUrl, postedAt

EXAMPLES:
Action: "Analyze pet health and create care plan"
Steps:
1. "Analyze Health Status" (ai_reasoning): reads {healthStatus, lastCheckup, species} → outputs healthAnalysis
2. "Generate Care Plan" (ai_reasoning): reads {healthAnalysis, species} → outputs carePlan, nextCheckupDate
3. "Create Health Report" (custom): reads {healthAnalysis, carePlan} → outputs healthReport

Action: "Process customer order"  
Steps:
1. "Validate Order" (ai_reasoning): reads {orderAmount, customerEmail} → outputs validationStatus
2. "Calculate Pricing" (custom): reads {orderAmount, validationStatus} → outputs finalPrice, taxAmount
3. "Generate Confirmation" (ai_reasoning): reads {finalPrice, customerEmail} → outputs confirmationMessage`;

    const result = await generateObject({
      model: myProvider.languageModel('chat-model'),
      schema: stepGenerationSchema,
      prompt: `${systemPrompt}

Action Name: "${actionName}"
Action Description: "${actionDescription}"

Please create a complete step workflow for this action. Think about the logical sequence of operations needed to accomplish the action's goal, and break it down into clear, sequential steps.`,
    });

    return Response.json(result.object);

  } catch (error) {
    console.error('Error generating steps:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 