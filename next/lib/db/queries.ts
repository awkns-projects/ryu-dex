import 'server-only';

import { prisma } from './prisma';
import type { Prisma } from '@prisma/client';
import { generateUUID } from '../utils';
import { generateHashedPassword } from './utils';
import { ChatSDKError } from '../errors';
import type { AppUsage } from '../usage';

// Type definitions
export type ArtifactKind = 'text' | 'code' | 'image' | 'sheet' | 'agent';
export type VisibilityType = 'private' | 'public';

// Re-export types from Prisma
export type { User, Chat, Message as DBMessage } from '@prisma/client';

// ============================================================================
// USER QUERIES
// ============================================================================

export async function getUser(email: string) {
  try {
    return await prisma.user.findMany({
      where: { email }
    });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get user by email',
    );
  }
}

export async function createUser(email: string, password: string) {
  const hashedPassword = generateHashedPassword(password);

  try {
    return await prisma.user.create({
      data: {
        id: generateUUID(),
        email,
        password: hashedPassword,
      }
    });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to create user');
  }
}

export async function createGuestUser() {
  const email = `guest-${Date.now()}`;
  const password = generateHashedPassword(generateUUID());

  try {
    return await prisma.user.create({
      data: {
        id: generateUUID(),
        email,
        password,
      },
      select: {
        id: true,
        email: true,
      }
    });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create guest user',
    );
  }
}

// ============================================================================
// CHAT QUERIES
// ============================================================================

export async function saveChat({
  id,
  userId,
  title,
  visibility,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: VisibilityType;
}) {
  try {
    return await prisma.chat.create({
      data: {
        id,
        userId,
        title,
        visibility,
        createdAt: new Date(),
      }
    });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save chat');
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    // Prisma will cascade delete votes, messages, and streams automatically
    return await prisma.chat.delete({
      where: { id }
    });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete chat by id',
    );
  }
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    const extendedLimit = limit + 1;

    let cursor: { id: string; createdAt: Date } | undefined;
    let orderDirection: 'desc' | 'asc' = 'desc';

    if (startingAfter) {
      const selectedChat = await prisma.chat.findUnique({
        where: { id: startingAfter }
      });

      if (!selectedChat) {
        throw new ChatSDKError(
          'not_found:database',
          `Chat with id ${startingAfter} not found`,
        );
      }

      cursor = { id: selectedChat.id, createdAt: selectedChat.createdAt };
    } else if (endingBefore) {
      const selectedChat = await prisma.chat.findUnique({
        where: { id: endingBefore }
      });

      if (!selectedChat) {
        throw new ChatSDKError(
          'not_found:database',
          `Chat with id ${endingBefore} not found`,
        );
      }

      cursor = { id: selectedChat.id, createdAt: selectedChat.createdAt };
    }

    const filteredChats = await prisma.chat.findMany({
      where: { userId: id },
      take: extendedLimit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor.id } : undefined,
      orderBy: { createdAt: orderDirection }
    });

    const hasMore = filteredChats.length > limit;

    return {
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    };
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get chats by user id',
    );
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    return await prisma.chat.findUnique({
      where: { id }
    });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get chat by id');
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}) {
  try {
    return await prisma.chat.update({
      where: { id: chatId },
      data: { visibility }
    });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to update chat visibility by id',
    );
  }
}

export async function updateChatLastContextById({
  chatId,
  context,
}: {
  chatId: string;
  context: AppUsage;
}) {
  try {
    return await prisma.chat.update({
      where: { id: chatId },
      data: { lastContext: context as any }
    });
  } catch (error) {
    console.warn('Failed to update lastContext for chat', chatId, error);
    return;
  }
}

// ============================================================================
// MESSAGE QUERIES
// ============================================================================

export async function saveMessages({
  messages,
}: {
  messages: Array<{
    id: string;
    chatId: string;
    role: string;
    parts: any;
    attachments: any;
    createdAt: Date;
  }>;
}) {
  try {
    return await prisma.message.createMany({
      data: messages
    });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save messages');
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await prisma.message.findMany({
      where: { chatId: id },
      orderBy: { createdAt: 'asc' }
    });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get messages by chat id',
    );
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await prisma.message.findMany({
      where: { id }
    });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get message by id',
    );
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    // Delete votes first (Prisma will cascade, but being explicit)
    await prisma.vote.deleteMany({
      where: {
        chatId,
        message: {
          createdAt: { gte: timestamp }
        }
      }
    });

    // Delete messages
    return await prisma.message.deleteMany({
      where: {
        chatId,
        createdAt: { gte: timestamp }
      }
    });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete messages by chat id after timestamp',
    );
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: {
  id: string;
  differenceInHours: number;
}) {
  try {
    const twentyFourHoursAgo = new Date(
      Date.now() - differenceInHours * 60 * 60 * 1000,
    );

    const count = await prisma.message.count({
      where: {
        chat: {
          userId: id
        },
        createdAt: { gte: twentyFourHoursAgo },
        role: 'user'
      }
    });

    return count;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get message count by user id',
    );
  }
}

// ============================================================================
// VOTE QUERIES
// ============================================================================

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  try {
    const existingVote = await prisma.vote.findUnique({
      where: {
        chatId_messageId: {
          chatId,
          messageId
        }
      }
    });

    const isUpvoted = type === 'up';

    if (existingVote) {
      return await prisma.vote.update({
        where: {
          chatId_messageId: {
            chatId,
            messageId
          }
        },
        data: { isUpvoted }
      });
    }

    return await prisma.vote.create({
      data: {
        chatId,
        messageId,
        isUpvoted,
      }
    });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to vote message');
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await prisma.vote.findMany({
      where: { chatId: id }
    });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get votes by chat id',
    );
  }
}

// ============================================================================
// DOCUMENT QUERIES
// ============================================================================

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await prisma.document.create({
      data: {
        id,
        title,
        kind,
        content,
        userId,
        createdAt: new Date(),
      }
    });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save document');
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    return await prisma.document.findMany({
      where: { id },
      orderBy: { createdAt: 'asc' }
    });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get documents by id',
    );
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    return await prisma.document.findFirst({
      where: { id },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get document by id',
    );
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    // Delete suggestions first (will cascade with Prisma onDelete)
    await prisma.suggestion.deleteMany({
      where: {
        documentId: id,
        createdAt: { gt: timestamp }
      }
    });

    // Delete documents
    return await prisma.document.deleteMany({
      where: {
        id,
        createdAt: { gt: timestamp }
      }
    });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete documents by id after timestamp',
    );
  }
}

// ============================================================================
// SUGGESTION QUERIES
// ============================================================================

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<{
    id: string;
    documentId: string;
    originalText: string;
    suggestedText: string;
    description?: string;
    isResolved?: boolean;
    userId: string;
    createdAt: Date;
  }>;
}) {
  try {
    return await prisma.suggestion.createMany({
      data: suggestions
    });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to save suggestions',
    );
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await prisma.suggestion.findMany({
      where: { documentId }
    });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get suggestions by document id',
    );
  }
}

// ============================================================================
// STREAM QUERIES
// ============================================================================

export async function createStreamId({
  streamId,
  chatId,
}: {
  streamId: string;
  chatId: string;
}) {
  try {
    await prisma.stream.create({
      data: {
        id: streamId,
        chatId,
        createdAt: new Date()
      }
    });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create stream id',
    );
  }
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  try {
    const streams = await prisma.stream.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      select: { id: true }
    });

    return streams.map(({ id }) => id);
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get stream ids by chat id',
    );
  }
}

// ============================================================================
// SCHEDULE QUERIES
// ============================================================================

export async function createSchedule({
  agentId,
  name,
  mode,
  intervalHours,
  steps,
}: {
  agentId: string;
  name?: string;
  mode: 'once' | 'recurring';
  intervalHours?: string;
  steps: Array<{
    modelId: string;
    query?: any;
    actionId: string;
    order: number;
  }>;
}) {
  const now = new Date();
  const nextRunAt = mode === 'recurring'
    ? new Date(now.getTime() + (Number(intervalHours) * 60 * 60 * 1000))
    : null;

  try {
    return await prisma.$transaction(async (tx) => {
      // Create schedule with steps
      const schedule = await tx.agentSchedule.create({
        data: {
          agentId,
          name: name || null,
          mode,
          intervalHours: intervalHours ? Number(intervalHours) : null,
          nextRunAt,
          createdAt: now,
          updatedAt: now,
          steps: {
            create: steps.map(step => ({
              modelId: step.modelId,
              query: step.query || null,
              actionId: step.actionId,
              order: step.order,
              createdAt: now,
              updatedAt: now,
            }))
          }
        },
        include: {
          steps: {
            include: {
              model: {
                select: { name: true }
              },
              action: {
                select: { name: true }
              }
            }
          }
        }
      });

      // Format the response to match expected structure
      return {
        ...schedule,
        steps: schedule.steps.map(step => ({
          ...step,
          modelName: step.model.name,
          actionName: step.action.name,
        }))
      };
    });
  } catch (error) {
    console.error('Database error:', error);
    throw new ChatSDKError('bad_request:database', 'Failed to create schedule');
  }
}

export async function getSchedulesByAgentId(agentId: string) {
  try {
    const schedules = await prisma.agentSchedule.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
      include: {
        steps: {
          orderBy: { order: 'asc' },
          include: {
            model: {
              select: { name: true }
            },
            action: {
              select: { name: true }
            }
          }
        }
      }
    });

    // Format the response
    return schedules.map(schedule => ({
      ...schedule,
      steps: schedule.steps.map(step => ({
        ...step,
        modelName: step.model.name,
        actionName: step.action.name,
      }))
    }));
  } catch (error) {
    console.error('Database error:', error);
    throw new ChatSDKError('bad_request:database', 'Failed to get schedules by agent id');
  }
}

export async function getScheduleById(id: string) {
  try {
    const schedule = await prisma.agentSchedule.findUnique({
      where: { id },
      include: {
        steps: {
          orderBy: { order: 'asc' },
          include: {
            model: {
              select: { name: true }
            },
            action: {
              select: { name: true }
            }
          }
        }
      }
    });

    if (!schedule) {
      throw new ChatSDKError('not_found:database', 'Schedule not found');
    }

    // Format the response
    return {
      ...schedule,
      steps: schedule.steps.map(step => ({
        ...step,
        modelName: step.model.name,
        actionName: step.action.name,
      }))
    };
  } catch (error) {
    console.error('Database error:', error);
    throw new ChatSDKError('bad_request:database', 'Failed to get schedule by id');
  }
}

export async function toggleSchedule(id: string) {
  try {
    const schedule = await prisma.agentSchedule.findUnique({
      where: { id }
    });

    if (!schedule) {
      throw new ChatSDKError('not_found:database', 'Schedule not found');
    }

    const newStatus = schedule.status === 'active' ? 'paused' : 'active';

    return await prisma.agentSchedule.update({
      where: { id },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      }
    });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to toggle schedule');
  }
}

export async function deleteSchedule(id: string) {
  try {
    // Prisma will cascade delete steps and set executions.scheduleId to null
    return await prisma.agentSchedule.delete({
      where: { id }
    });
  } catch (error) {
    console.error('Database error deleting schedule:', error);
    throw new ChatSDKError('bad_request:database', 'Failed to delete schedule');
  }
}

export async function updateScheduleLastRun(id: string) {
  try {
    return await prisma.agentSchedule.update({
      where: { id },
      data: {
        lastRunAt: new Date(),
        updatedAt: new Date(),
      }
    });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to update schedule last run time');
  }
}

export async function updateSchedule({
  id,
  name,
  mode,
  intervalHours,
  steps,
}: {
  id: string;
  name?: string;
  mode: 'once' | 'recurring';
  intervalHours?: string;
  steps: Array<{
    id?: string;
    modelId: string;
    query?: any;
    actionId: string;
    order: number;
  }>;
}) {
  const now = new Date();
  const nextRunAt = mode === 'recurring'
    ? new Date(now.getTime() + (Number(intervalHours) * 60 * 60 * 1000))
    : null;

  try {
    return await prisma.$transaction(async (tx) => {
      // Update schedule
      const schedule = await tx.agentSchedule.update({
        where: { id },
        data: {
          name: name || null,
          mode,
          intervalHours: intervalHours ? Number(intervalHours) : null,
          nextRunAt,
          updatedAt: now,
        }
      });

      // Delete steps that are not in the new list
      const existingStepIds = steps
        .filter(step => step.id)
        .map(step => step.id as string);

      await tx.agentScheduleStep.deleteMany({
        where: {
          scheduleId: id,
          ...(existingStepIds.length > 0 ? {
            id: { notIn: existingStepIds }
          } : {})
        }
      });

      // Update or create steps
      const updatedSteps = await Promise.all(
        steps.map(async (step) => {
          if (step.id) {
            // Update existing step
            return await tx.agentScheduleStep.update({
              where: { id: step.id },
              data: {
                modelId: step.modelId,
                query: step.query || null,
                actionId: step.actionId,
                order: step.order,
                updatedAt: now,
              },
              include: {
                model: { select: { name: true } },
                action: { select: { name: true } }
              }
            });
          } else {
            // Create new step
            return await tx.agentScheduleStep.create({
              data: {
                scheduleId: id,
                modelId: step.modelId,
                query: step.query || null,
                actionId: step.actionId,
                order: step.order,
                createdAt: now,
                updatedAt: now,
              },
              include: {
                model: { select: { name: true } },
                action: { select: { name: true } }
              }
            });
          }
        })
      );

      // Format the response
      return {
        ...schedule,
        steps: updatedSteps.map(step => ({
          ...step,
          modelName: step.model.name,
          actionName: step.action.name,
        }))
      };
    });
  } catch (error) {
    console.error('Database error:', error);
    throw new ChatSDKError('bad_request:database', 'Failed to update schedule');
  }
}

// ============================================================================
// EXECUTION QUERIES
// ============================================================================

export async function getExecutionsByModelId(modelId: string, limit = 50) {
  try {
    const executions = await prisma.agentExecution.findMany({
      where: {
        record: {
          modelId
        }
      },
      include: {
        record: true,
        action: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    // Format to match expected structure
    return executions.map(execution => ({
      execution,
      record: execution.record,
      action: execution.action,
    }));
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get executions by model id');
  }
}

export async function getExecutionsByActionId(actionId: string, limit = 50) {
  try {
    const executions = await prisma.agentExecution.findMany({
      where: { actionId },
      include: {
        record: true,
        action: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    // Format to match expected structure
    return executions.map(execution => ({
      execution,
      record: execution.record,
      action: execution.action,
    }));
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get executions by action id');
  }
}

export async function getExecutionsByScheduleId(scheduleId: string, limit = 50) {
  try {
    const executions = await prisma.agentExecution.findMany({
      where: { scheduleId },
      include: {
        record: true,
        action: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    // Format to match expected structure
    return executions.map(execution => ({
      execution,
      record: execution.record,
      action: execution.action,
    }));
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get executions by schedule id');
  }
}
