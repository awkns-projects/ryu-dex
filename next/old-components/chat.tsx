'use client';

import { DefaultChatTransport } from 'ai';
import { useChat } from '@ai-sdk/react';
import { useEffect, useState, useRef, useCallback } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/lib/db/schema';
import { fetcher, fetchWithErrorHandlers, generateUUID } from '@/lib/utils';
import { Artifact } from './artifact';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import type { VisibilityType } from './visibility-selector';
import { useArtifactSelector } from '@/hooks/use-artifact';
import { unstable_serialize } from 'swr/infinite';
import { getChatHistoryPaginationKey } from './sidebar-history';
import { toast } from './toast';
import type { Session } from 'next-auth';
import { useSearchParams } from 'next/navigation';
import { useChatVisibility } from '@/hooks/use-chat-visibility';
import { useAutoResume } from '@/hooks/use-auto-resume';
import { ChatSDKError } from '@/lib/errors';
import type { Attachment, ChatMessage } from '@/lib/types';
import type { AppUsage } from '@/lib/usage';
import { useDataStream } from './data-stream-provider';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Square } from 'lucide-react';

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  session,
  autoResume,
  initialLastContext,
}: {
  id: string;
  initialMessages: ChatMessage[];
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: Session;
  autoResume: boolean;
  initialLastContext?: AppUsage;
}) {
  const { visibilityType } = useChatVisibility({
    chatId: id,
    initialVisibilityType,
  });

  const { mutate } = useSWRConfig();
  const { setDataStream } = useDataStream();

  const [input, setInput] = useState<string>('');
  const [usage, setUsage] = useState<AppUsage | undefined>(initialLastContext);
  const [showCreditCardAlert, setShowCreditCardAlert] = useState(false);
  const [currentModelId, setCurrentModelId] = useState(initialChatModel);
  const currentModelIdRef = useRef(currentModelId);
  
  // Add timeout handling for stuck messages
  const streamTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [streamStartTime, setStreamStartTime] = useState<number | null>(null);
  const STREAM_TIMEOUT = 60000; // 60 seconds timeout
  
  // Add state for tracking last failed message
  const [lastFailedMessage, setLastFailedMessage] = useState<ChatMessage | null>(null);
  const [showRetryOption, setShowRetryOption] = useState(false);
  
  useEffect(() => {
    currentModelIdRef.current = currentModelId;
  }, [currentModelId]);

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
    regenerate,
    resumeStream,
  } = useChat<ChatMessage>({
    id,
    messages: initialMessages,
    experimental_throttle: 100,
    generateId: generateUUID,
    transport: new DefaultChatTransport({
      api: '/api/chat',
      fetch: fetchWithErrorHandlers,
      prepareSendMessagesRequest({ messages, id, body }) {
        return {
          body: {
            id,
            message: messages.at(-1),
            selectedChatModel: currentModelIdRef.current,
            selectedVisibilityType: visibilityType,
            ...body,
          },
        };
      },
    }),
    onData: (dataPart) => {
      setDataStream((ds) => (ds ? [...ds, dataPart] : []));
      if (dataPart.type === 'data-usage') setUsage(dataPart.data);
      
      // Reset timeout on data received
      if (streamTimeoutRef.current) {
        clearTimeout(streamTimeoutRef.current);
      }
      
      // Set new timeout
      streamTimeoutRef.current = setTimeout(() => {
        if (status === 'streaming') {
          console.warn('Stream timeout detected, stopping stream');
          const lastUserMessage = messages.filter(m => m.role === 'user').pop();
          if (lastUserMessage) {
            setLastFailedMessage(lastUserMessage);
            setShowRetryOption(true);
          }
          stop();
          toast({
            type: 'error',
            description: 'Message generation timed out. Please try again.',
          });
        }
      }, STREAM_TIMEOUT);
    },
    onFinish: () => {
      // Clear timeout on finish
      if (streamTimeoutRef.current) {
        clearTimeout(streamTimeoutRef.current);
        streamTimeoutRef.current = null;
      }
      setStreamStartTime(null);
      mutate(unstable_serialize(getChatHistoryPaginationKey));
    },
    onError: (error) => {
      // Clear timeout on error
      if (streamTimeoutRef.current) {
        clearTimeout(streamTimeoutRef.current);
        streamTimeoutRef.current = null;
      }
      setStreamStartTime(null);
      
      // Store the failed message for retry
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      if (lastUserMessage) {
        setLastFailedMessage(lastUserMessage);
        setShowRetryOption(true);
      }
      
      if (error instanceof ChatSDKError) {
        // Check if it's a credit card error
        if (
          error.message?.includes('AI Gateway requires a valid credit card')
        ) {
          setShowCreditCardAlert(true);
        } else {
          toast({
            type: 'error',
            description: error.message,
          });
        }
      } else {
        // Handle network errors and other issues
        toast({
          type: 'error',
          description: 'Something went wrong. Please try again.',
        });
      }
    },
  });

  // Track stream start time
  useEffect(() => {
    if (status === 'streaming' && !streamStartTime) {
      setStreamStartTime(Date.now());
    } else if (status !== 'streaming') {
      setStreamStartTime(null);
      if (streamTimeoutRef.current) {
        clearTimeout(streamTimeoutRef.current);
        streamTimeoutRef.current = null;
      }
    }
  }, [status, streamStartTime]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (streamTimeoutRef.current) {
        clearTimeout(streamTimeoutRef.current);
      }
    };
  }, []);

  const searchParams = useSearchParams();
  const query = searchParams.get('query');

  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      sendMessage({
        role: 'user' as const,
        parts: [{ type: 'text', text: query }],
      });

      setHasAppendedQuery(true);
      window.history.replaceState({}, '', `/chat/${id}`);
    }
  }, [query, sendMessage, hasAppendedQuery, id]);

  const { data: votes } = useSWR<Array<Vote>>(
    messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
    fetcher,
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  useAutoResume({
    autoResume,
    initialMessages,
    resumeStream,
    setMessages,
  });

  // Retry function for failed messages
  const handleRetry = useCallback(() => {
    if (lastFailedMessage) {
      setShowRetryOption(false);
      setLastFailedMessage(null);
      sendMessage(lastFailedMessage);
    }
  }, [lastFailedMessage, sendMessage]);

  // Clear retry option when new message is sent successfully
  useEffect(() => {
    if (status === 'streaming' && showRetryOption) {
      setShowRetryOption(false);
      setLastFailedMessage(null);
    }
  }, [status, showRetryOption]);

  return (
    <>
      <div className="overscroll-behavior-contain flex h-dvh min-w-0 touch-pan-y flex-col bg-background">
        <ChatHeader
          chatId={id}
          selectedVisibilityType={initialVisibilityType}
          isReadonly={isReadonly}
          session={session}
        />

        <Messages
          chatId={id}
          status={status}
          votes={votes}
          messages={messages}
          setMessages={setMessages}
          regenerate={regenerate}
          isReadonly={isReadonly}
          isArtifactVisible={isArtifactVisible}
          selectedModelId={initialChatModel}
        />

        {/* Streaming status bar */}
        {status === 'streaming' && !isReadonly && (
          <div className="mx-auto w-full max-w-4xl px-2 md:px-4 pb-2">
            <div className="bg-muted/50 backdrop-blur-sm border rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">Generating response...</span>
                {streamStartTime && (
                  <span className="text-xs text-muted-foreground">
                    ({Math.floor((Date.now() - streamStartTime) / 1000)}s)
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={stop}
                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <Square size={14} />
                Stop Generation
              </Button>
            </div>
          </div>
        )}

        {/* Retry option for failed messages */}
        {showRetryOption && !isReadonly && status !== 'streaming' && (
          <div className="mx-auto w-full max-w-4xl px-2 md:px-4 pb-2">
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-red-700 dark:text-red-300">
                  Message failed to generate. Would you like to try again?
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRetryOption(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Dismiss
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleRetry}
                  className="gap-2"
                >
                  Retry
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="sticky bottom-0 z-1 mx-auto flex w-full max-w-4xl gap-2 border-t-0 bg-background px-2 pb-3 md:px-4 md:pb-4">
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              status={status}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              sendMessage={sendMessage}
              selectedVisibilityType={visibilityType}
              selectedModelId={currentModelId}
              onModelChange={setCurrentModelId}
              usage={usage}
            />
          )}
        </div>
      </div>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        status={status}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        sendMessage={sendMessage}
        messages={messages}
        setMessages={setMessages}
        regenerate={regenerate}
        votes={votes}
        isReadonly={isReadonly}
        selectedVisibilityType={visibilityType}
        selectedModelId={currentModelId}
        usage={usage}
      />

      <AlertDialog
        open={showCreditCardAlert}
        onOpenChange={setShowCreditCardAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate AI Gateway</AlertDialogTitle>
            <AlertDialogDescription>
              This application requires{' '}
              {process.env.NODE_ENV === 'production' ? 'the owner' : 'you'} to
              activate Vercel AI Gateway.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                window.open(
                  'https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%3Fmodal%3Dadd-credit-card',
                  '_blank',
                );
                window.location.href = '/';
              }}
            >
              Activate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
