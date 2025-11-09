import { generateText } from 'ai';
import { myProvider } from '@/lib/ai/providers';
import type { ChatMessage } from '@/lib/types';

export async function generateTitleFromUserMessage({
  message,
}: {
  message: ChatMessage;
}): Promise<string> {
  try {
    // Extract text content from message parts
    const messageText = message.parts
      .filter((part) => part.type === 'text')
      .map((part) => part.text)
      .join(' ');

    if (!messageText || messageText.trim().length === 0) {
      return 'New Chat';
    }

    // Generate a concise title from the message
    const { text } = await generateText({
      model: myProvider.languageModel('gpt-4o-mini'),
      prompt: `Generate a concise, descriptive title (3-8 words) for a chat that starts with this message: "${messageText}". Return ONLY the title, no quotes or extra text.`,
    });

    return text.trim() || 'New Chat';
  } catch (error) {
    console.error('Failed to generate chat title:', error);
    return 'New Chat';
  }
}

