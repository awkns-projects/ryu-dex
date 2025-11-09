'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SparklesIcon } from 'lucide-react';
import { AgentData } from '@/lib/types';
import { NewAction } from './types';

interface ActionDetailsStepProps {
  action: NewAction;
  agentData: AgentData;
  isGeneratingSteps: boolean;
  onActionUpdate: (updates: Partial<NewAction>) => void;
  onGenerateSteps: () => void;
  onNext: () => void;
}

export function ActionDetailsStep({
  action,
  agentData,
  isGeneratingSteps,
  onActionUpdate,
  onGenerateSteps,
  onNext
}: ActionDetailsStepProps) {
  const canProceed = action.name && action.description && action.targetModel;
  const hasSteps = action.steps && action.steps.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Action Details</h3>
        <p className="text-sm text-muted-foreground">
          Define the basic information for your custom action
        </p>
      </div>

      {/* Action Details Form */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="action-name">Action Name *</Label>
          <Input
            id="action-name"
            placeholder="e.g., Generate Marketing Copy"
            value={action.name}
            onChange={(e) => onActionUpdate({ name: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="action-description">Description *</Label>
          <Textarea
            id="action-description"
            placeholder="Describe what this action does..."
            value={action.description}
            onChange={(e) => onActionUpdate({ description: e.target.value })}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="target-model">Target Model *</Label>
          <Select
            value={action.targetModel}
            onValueChange={(value) => onActionUpdate({ targetModel: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a model to operate on" />
            </SelectTrigger>
            <SelectContent>
              {agentData.models.map((model) => (
                <SelectItem key={model.id} value={model.name}>
                  {model.name} ({model.fields.length} fields)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Step Generation */}
      <div className="space-y-4">
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Processing Steps</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Generate processing steps automatically or proceed to configure them manually
          </p>
          
          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              onClick={onGenerateSteps}
              disabled={!canProceed || isGeneratingSteps}
              className="gap-2 w-full"
            >
              {isGeneratingSteps ? (
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              ) : (
                <SparklesIcon className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {isGeneratingSteps ? 'Generating Workflow...' : 'Generate Steps with AI'}
              </span>
              <span className="sm:hidden">
                {isGeneratingSteps ? 'Generating...' : 'Generate with AI'}
              </span>
            </Button>

            {hasSteps && (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-900 dark:text-green-100">
                    {action.steps.length} step{action.steps.length !== 1 ? 's' : ''} generated
                  </span>
                </div>
                <p className="text-xs text-green-800 dark:text-green-200">
                  You can proceed to configure these steps or generate new ones
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4 border-t">
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="min-w-[120px] w-full sm:w-auto"
        >
          {hasSteps ? 'Configure Steps' : 'Add Steps Manually'}
        </Button>
      </div>
    </div>
  );
} 