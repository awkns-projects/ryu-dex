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
import { type AgentUpdateRequestBody, agentUpdateRequestBodySchema } from "./schema";
import { agentUpdater } from "@/lib/ai/tools/agent-builder";

// Increased timeout for complex feature additions
export const maxDuration = 300; // 5 minutes

export async function POST(request: NextRequest) {
  let requestBody: AgentUpdateRequestBody;

  try {
    const json = await request.json();
    requestBody = agentUpdateRequestBodySchema.parse(json);
  } catch (error) {
    console.error('❌ Invalid request body:', error);
    return new ChatSDKError("bad_request:api").toResponse();
  }

  try {
    const {
      id,
      agentId,
      featureDescription,
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

    console.log('🚀 Starting agent feature addition:', {
      agentId,
      descriptionLength: featureDescription.length,
      connectionsCount: connections?.length || 0,
      userId: session.user.id,
    });

    const stream = createUIMessageStream({
      execute: ({ writer: dataStream }) => {
        const result = streamText({
          model: myProvider.languageModel('chat-model'),
          tools: {
            agentUpdater: agentUpdater({ session, dataStream }) as any,
          },
          toolChoice: 'required', // Force tool use
          maxSteps: 5,
          system: `You are an expert AI agent builder. Your task is to add a new feature to an existing AI agent by analyzing the feature description and determining what needs to be added.

CRITICAL INSTRUCTIONS:
1. Read the feature description carefully
2. Identify what components are needed for this feature:
   - What new data models are needed (if any)
   - What forms users need to fill (for data input)
   - What AI actions should process the data
   - What API operations are needed (ONLY from selected connections)
   - What automation schedules make sense
3. Use agentUpdater tool to add the feature:
   - Use modelsToAdd for new data models
   - Use actionsToAdd for new actions
   - Use schedulesToAdd for new schedules
4. Integrate seamlessly with existing agent structure

IMPORTANT:
- The feature should have a clear PURPOSE and be USEFUL
- Be specific about what it does
- Create forms for manual data entry when needed
- Create schedules for automated data processing
- Link forms to schedules so data flows automatically
- ONLY use the selected external connections (if provided)

The new feature should work seamlessly with the existing agent.`,
          prompt: `Add a new feature to the existing agent (ID: ${agentId}):

Feature Description: ${featureDescription}

${connections && connections.length > 0 ? `Available External Service Connections: ${connections.join(', ')}` : 'No external connections selected'}

Add this feature by:
1. Creating any necessary new data models
2. Adding forms for users to input data
3. Creating AI-powered actions to process the data
4. Setting up API integrations (ONLY using the selected connections if provided)
5. Adding automated schedules for recurring tasks
6. Ensuring proper relationships and integration with existing models

Use the agentUpdater tool to add this feature to the agent.`,
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: "agent-feature-updater",
          },
          onFinish: async ({ usage }) => {
            console.log('✅ Agent feature addition completed', usage);
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
        return "Oops, an error occurred while adding the feature!";
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

    console.error("Unhandled error in agent update API:", error, { vercelId });
    return new ChatSDKError("offline:chat").toResponse();
  }
}

