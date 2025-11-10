import {
  customProvider,
} from 'ai';
import { gateway } from '@ai-sdk/gateway';
import { isTestEnvironment } from '../constants';

// Available model IDs
export const AVAILABLE_MODELS = [
  'chat-model',
  'chat-model-reasoning', 
  'title-model',
  'artifact-model',
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-5',
] as const;

export type AvailableModel = typeof AVAILABLE_MODELS[number];

// Helper function to validate and get a safe model ID
export function getSafeModelId(requestedModel?: string): AvailableModel {
  const defaultModel: AvailableModel = 'artifact-model';
  
  if (!requestedModel) {
    return defaultModel;
  }
  
  if (AVAILABLE_MODELS.includes(requestedModel as AvailableModel)) {
    return requestedModel as AvailableModel;
  }
  
  console.warn(`Model '${requestedModel}' not found, falling back to '${defaultModel}'`);
  return defaultModel;
}

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
        gpt4oModel,
        gpt4oMiniModel,
        gpt5Model,
      } = require('./models.mock');
      return customProvider({
        languageModels: {
          'chat-model': chatModel,
          'chat-model-reasoning': reasoningModel,
          'title-model': titleModel,
          'artifact-model': artifactModel,
          'gpt-4o': gpt4oModel,
          'gpt-4o-mini': gpt4oMiniModel,
          'gpt-5': gpt5Model,
        },
      });
    })()
  : customProvider({
      languageModels: {
        'chat-model': gateway.languageModel('xai/grok-2-vision-1212'),
        'chat-model-reasoning': gateway.languageModel('xai/grok-3-mini'),
        'title-model': gateway.languageModel('xai/grok-2-1212'),
        'artifact-model': gateway.languageModel('xai/grok-2-1212'),
        'gpt-4o': gateway.languageModel('openai/gpt-4o'),
        'gpt-4o-mini': gateway.languageModel('openai/gpt-4o-mini'),
        'gpt-5': gateway.languageModel('openai/gpt-5'),
      },
    });
