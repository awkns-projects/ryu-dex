import {
  createUIMessageStream,
  JsonToSseTransformStream,
  streamText,
} from "ai";
import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { entitlementsByUserType } from "@/lib/ai/entitlements";
import { myProvider } from "@/lib/ai/providers";
import { isProductionEnvironment } from "@/lib/constants";
import { getMessageCountByUserId } from "@/lib/db/queries";
import { ChatSDKError } from "@/lib/errors";
import type { ChatMessage } from "@/lib/types";
import { generateUUID } from "@/lib/utils";
import { type PilotRequestBody, pilotRequestBodySchema } from "./schema";
import { agentBuilder } from "@/lib/ai/tools/agent-builder";

// Increased timeout for complex agent creation (requires Vercel Pro plan)
// For Hobby plan, max is 60 seconds. Consider async job pattern for longer operations.
export const maxDuration = 300; // 5 minutes

export async function POST(request: NextRequest) {
  let requestBody: PilotRequestBody;

  try {
    const json = await request.json();
    requestBody = pilotRequestBodySchema.parse(json);
  } catch (error) {
    console.error('❌ Invalid request body:', error);
    return new ChatSDKError("bad_request:api").toResponse();
  }

  try {
    const {
      id,
      agentName,
      agentDescription,
      connections,
    } = requestBody;

    const session = await auth.api.getSession({
      headers: request.headers
    });

    console.log('🔐 Session check:', session ? 'Found' : 'Not found', session?.user?.id);

    if (!session?.user) {
      console.log('❌ No session/user found, returning unauthorized');
      return new ChatSDKError("unauthorized:chat").toResponse();
    }

    console.log('✅ User authenticated:', session.user.id);

    const userType = (session.user as any).type || 'regular';

    const messageCount = await getMessageCountByUserId({
      id: session.user.id,
      differenceInHours: 24,
    });

    if (messageCount > entitlementsByUserType[userType].maxMessagesPerDay) {
      return new ChatSDKError("rate_limit:chat").toResponse();
    }

    console.log('🚀 Starting pilot agent creation:', {
      agentName,
      descriptionLength: agentDescription.length,
      connectionsCount: connections?.length || 0,
      userId: session.user.id,
    });

    const stream = createUIMessageStream({
      execute: ({ writer: dataStream }) => {
        const result = streamText({
          model: myProvider.languageModel('chat-model'),
          tools: {
            agentBuilder: agentBuilder({ session, dataStream }) as any,
          },
          toolChoice: 'required', // Force tool use
          maxSteps: 5,
          system: `You are an expert AI agent builder. Your task is to create a complete, production-ready AI agent by analyzing the user's description and imagining ALL necessary features.

CRITICAL INSTRUCTIONS:
1. Read the agent description carefully
2. Identify ALL features the agent needs to work properly
3. For each feature, determine:
   - What forms users need to fill (for data input)
   - What AI actions should process the data
   - What API operations are needed (ONLY from selected connections)
   - What automation schedules make sense
4. Create appropriate data models with meaningful fields
5. Design complete workflows from data input → AI processing → API calls → automation

IMPORTANT:
- Each feature should have a clear PURPOSE and be USEFUL
- No generic or vague features - be specific about what it does
- Create forms for manual data entry when needed
- Create schedules for automated data processing
- Link forms to schedules so data flows automatically

The agent should be fully functional and ready to use immediately after creation.`,
          prompt: `Create a complete AI agent with the following specifications:

Agent Name: ${agentName}
Description: ${agentDescription}

Selected External Service Connections: ${connections && connections.length > 0 ? connections.join(', ') : 'none'}

Based on this description, imagine and create:
1. ALL features this agent needs (be comprehensive and thoughtful)
2. Data models to store all necessary information
3. Forms for users to input data (new and edit forms where appropriate)
4. AI-powered actions to process data intelligently
5. API integrations using ONLY the selected connections
6. Automated schedules for recurring tasks
7. Proper relationships between all models

Make sure every feature has a clear purpose and adds value to the agent. Think about the complete user workflow from start to finish.`,
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: "pilot-agent-builder",
          },
          onFinish: async ({ usage }) => {
            console.log('✅ Pilot agent creation completed', usage);
            dataStream.write({
              type: "data-usage",
              data: usage,
            });
          },
        });

        result.consumeStream();

        dataStream.merge(
          result.toUIMessageStream({
            sendReasoning: true,
          })
        );
      },
      generateId: generateUUID,
      onFinish: async ({ messages }) => {
        console.log('✅ Stream finished, messages:', messages.length);
      },
      onError: (error) => {
        console.error('❌ Stream error:', error);
        return "Oops, an error occurred while creating your agent!";
      },
    });

    return new Response(stream.pipeThrough(new JsonToSseTransformStream()), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    const vercelId = request.headers.get("x-vercel-id");

    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }

    console.error("Unhandled error in pilot API:", error, { vercelId });
    return new ChatSDKError("offline:chat").toResponse();
  }
}

