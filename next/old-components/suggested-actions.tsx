'use client';

import { motion } from 'framer-motion';
import { memo } from 'react';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { VisibilityType } from './visibility-selector';
import type { ChatMessage } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface SuggestedActionsProps {
  chatId: string;
  sendMessage: UseChatHelpers<ChatMessage>['sendMessage'];
  selectedVisibilityType: VisibilityType;
}

interface SuggestionItem {
  title: string;
  description: string;
  prompt: string;
  emoji: string;
}

function PureSuggestedActions({
  chatId,
  sendMessage,
  selectedVisibilityType,
}: SuggestedActionsProps) {
  const suggestedActions: SuggestionItem[] = [
    {
      title: "Lead Management Agent",
      description: "Automated customer research and scoring system",
      prompt: "Create an agent to manage customer leads with automated research and scoring",
      emoji: "🎯"
    },
    {
      title: "Content Creation Agent", 
      description: "Generate blog posts from templates automatically",
      prompt: "Build a content creation agent that generates blog posts from templates",
      emoji: "✨"
    },
    {
      title: "Pet Care System",
      description: "Health monitoring with automated scheduling",
      prompt: "Design a pet care management system with health monitoring and scheduling",
      emoji: "🐾"
    },
    {
      title: "Inventory Tracker",
      description: "Smart inventory with automated reorder alerts", 
      prompt: "Set up an AI agent for inventory tracking with automated reorder alerts",
      emoji: "📦"
    },
  ];

  return (
    <div
      data-testid="suggested-actions"
      className="grid w-full gap-3 sm:grid-cols-2"
    >
      {suggestedActions.map((suggestion, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={suggestion.title}
        >
          <Card 
            className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 h-full"
            onClick={() => {
              window.history.replaceState({}, '', `/chat/${chatId}`);
              sendMessage({
                role: 'user',
                parts: [{ type: 'text', text: suggestion.prompt }],
              });
            }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold leading-tight flex items-center gap-2">
                <span className="text-lg">{suggestion.emoji}</span>
                {suggestion.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-sm text-muted-foreground">
                {suggestion.description}
              </CardDescription>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions,
  (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) return false;
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType)
      return false;

    return true;
  },
);
