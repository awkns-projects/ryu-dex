'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronUpIcon, ChevronDownIcon, CopyIcon, XIcon, SparklesIcon } from 'lucide-react';
import { AgentData } from '@/lib/types';
import { FieldSection } from './FieldSection';
import { CodeSection } from './CodeSection';
import { SuggestionsSummary } from './SuggestionsSummary';
import { ActionStep } from './types';

interface StepEditorProps {
  step: ActionStep;
  stepIndex: number;
  totalSteps: number;
  agentData: AgentData;
  actionName: string;
  actionDescription: string;
  targetModel: string;
  fieldSuggestions: any;
  isSuggestingFields: boolean;
  isGeneratingCode: boolean;
  onStepUpdate: (updatedStep: ActionStep) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSuggestFields: () => void;
  onGenerateCode: () => void;
  onClearSuggestions: () => void;
}

export function StepEditor({
  step,
  stepIndex,
  totalSteps,
  agentData,
  actionName,
  actionDescription,
  targetModel,
  fieldSuggestions,
  isSuggestingFields,
  isGeneratingCode,
  onStepUpdate,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onSuggestFields,
  onGenerateCode,
  onClearSuggestions
}: StepEditorProps) {
  
  const updateStep = (updates: Partial<ActionStep>) => {
    onStepUpdate({ ...step, ...updates });
  };

  const renderStepTypeContent = () => {
    switch (step.type) {
      case 'ai_reasoning':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="step-prompt">AI Prompt</Label>
              <Textarea
                id="step-prompt"
                placeholder="Enter the AI prompt. Use {fieldName} for input field placeholders..."
                value={step.prompt || ''}
                onChange={(e) => updateStep({ prompt: e.target.value })}
                rows={3}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onSuggestFields}
              disabled={!step.prompt || isSuggestingFields}
              className="gap-2"
            >
              {isSuggestingFields ? (
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              ) : (
                <SparklesIcon className="h-4 w-4" />
              )}
              {isSuggestingFields ? 'Analyzing...' : 'Suggest Input/Output Fields'}
            </Button>
          </div>
        );

      case 'web_search':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="web-search-prompt">Web Search Prompt</Label>
              <Textarea
                id="web-search-prompt"
                placeholder="Enter the search prompt. Use {fieldName} for input field placeholders. AI will search the web and process results..."
                value={step.prompt || ''}
                onChange={(e) => updateStep({ prompt: e.target.value })}
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                AI will search the web based on your prompt and generate the output fields using the search results
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onSuggestFields}
              disabled={!step.prompt || isSuggestingFields}
              className="gap-2"
            >
              {isSuggestingFields ? (
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              ) : (
                <SparklesIcon className="h-4 w-4" />
              )}
              {isSuggestingFields ? 'Analyzing...' : 'Suggest Input/Output Fields'}
            </Button>
          </div>
        );

      case 'image_generation':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="image-prompt">Image Generation Prompt</Label>
              <Textarea
                id="image-prompt"
                placeholder="Enter the image generation prompt. Use {fieldName} for input field placeholders. AI will generate an image based on your prompt..."
                value={step.prompt || ''}
                onChange={(e) => updateStep({ prompt: e.target.value })}
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                AI will generate an image based on your prompt. Output fields should be of type image_url to store the generated image.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onSuggestFields}
              disabled={!step.prompt || isSuggestingFields}
              className="gap-2"
            >
              {isSuggestingFields ? (
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              ) : (
                <SparklesIcon className="h-4 w-4" />
              )}
              {isSuggestingFields ? 'Analyzing...' : 'Suggest Input/Output Fields'}
            </Button>
          </div>
        );

      case 'custom':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="custom-prompt">Processing Description</Label>
              <Textarea
                id="custom-prompt"
                placeholder="Describe what this custom processing step should do. Use {fieldName} for input field placeholders..."
                value={step.prompt || ''}
                onChange={(e) => updateStep({ prompt: e.target.value })}
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Describe the processing logic. AI will generate Node.js code based on this description and your input/output fields.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onSuggestFields}
              disabled={!step.prompt || isSuggestingFields}
              className="gap-2"
            >
              {isSuggestingFields ? (
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              ) : (
                <SparklesIcon className="h-4 w-4" />
              )}
              {isSuggestingFields ? 'Analyzing...' : 'Suggest Input/Output Fields'}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 p-3 sm:p-4 border rounded-lg bg-muted/30">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex-1 w-full sm:w-auto">
          <Label htmlFor="step-name">Step Name</Label>
          <Input
            id="step-name"
            placeholder="e.g., Generate Content"
            value={step.name || ''}
            onChange={(e) => updateStep({ name: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-1 w-full sm:w-auto justify-end">
          <Button
            variant="ghost"
            size="sm"
            disabled={stepIndex === 0}
            onClick={onMoveUp}
            className="h-8 w-8 p-0"
            title="Move up"
          >
            <ChevronUpIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={stepIndex === totalSteps - 1}
            onClick={onMoveDown}
            className="h-8 w-8 p-0"
            title="Move down"
          >
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDuplicate}
            className="h-8 w-8 p-0"
            title="Duplicate step"
          >
            <CopyIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={totalSteps === 1}
            onClick={onDelete}
            className="h-8 w-8 p-0"
            title="Remove step"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Step Type */}
      <div>
        <Label htmlFor="step-type">Step Type</Label>
        <Select
          value={step.type}
          onValueChange={(value: 'ai_reasoning' | 'web_search' | 'custom' | 'image_generation') => 
            updateStep({ type: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ai_reasoning">🤖 AI Reasoning</SelectItem>
            <SelectItem value="web_search">🌐 Web Search</SelectItem>
            <SelectItem value="image_generation">🖼️ Image Generation</SelectItem>
            <SelectItem value="custom">🔧 Custom Processing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Step Type Content */}
      {renderStepTypeContent()}

      {/* Suggestions Summary */}
      <SuggestionsSummary 
        fieldSuggestions={fieldSuggestions}
        onClose={onClearSuggestions}
      />

      {/* Field Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FieldSection
          type="input"
          step={step}
          agentData={agentData}
          targetModel={targetModel}
          fieldSuggestions={fieldSuggestions}
          onStepUpdate={onStepUpdate}
        />

        <FieldSection
          type="output"
          step={step}
          agentData={agentData}
          targetModel={targetModel}
          fieldSuggestions={fieldSuggestions}
          onStepUpdate={onStepUpdate}
        />
      </div>

      {/* Code Section */}
      {step.type === 'custom' && (
        <CodeSection
          step={step}
          actionName={actionName}
          actionDescription={actionDescription}
          targetModel={targetModel}
          onStepUpdate={onStepUpdate}
          onGenerateCode={onGenerateCode}
          isGeneratingCode={isGeneratingCode}
        />
      )}
    </div>
  );
} 