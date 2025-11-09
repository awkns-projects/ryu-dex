'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusIcon, ArrowLeftIcon } from 'lucide-react';
import { AgentData } from '@/lib/types';
import { StepNavigator } from './StepNavigator';
import { StepEditor } from './StepEditor';
import { ActionStep, NewAction } from './types';

interface StepsEditingStepProps {
  action: NewAction;
  agentData: AgentData;
  fieldSuggestions: any;
  isSuggestingFields: boolean;
  isGeneratingCode: boolean;
  onActionUpdate: (updates: Partial<NewAction>) => void;
  onSuggestFields: (selectedStepIndex: number) => void;
  onGenerateCode: (selectedStepIndex: number) => void;
  onClearSuggestions: () => void;
  onBack: () => void;
  onSave: () => void;
  editingAction?: any;
}

export function StepsEditingStep({
  action,
  agentData,
  fieldSuggestions,
  isSuggestingFields,
  isGeneratingCode,
  onActionUpdate,
  onSuggestFields,
  onGenerateCode,
  onClearSuggestions,
  onBack,
  onSave,
  editingAction
}: StepsEditingStepProps) {
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);

  const createEmptyStep = (): ActionStep => ({
    name: '',
    type: 'ai_reasoning',
    prompt: '',
    code: '',
    envVars: [],
    inputFields: [],
    outputFields: [],
    customFieldTypes: {},
  });

  const addNewStep = () => {
    const newStep = createEmptyStep();
    const updatedSteps = [...action.steps, newStep];
    onActionUpdate({ steps: updatedSteps });
    setSelectedStepIndex(updatedSteps.length - 1);
  };

  const updateStep = (stepIndex: number, updatedStep: ActionStep) => {
    const updatedSteps = [...action.steps];
    updatedSteps[stepIndex] = updatedStep;
    onActionUpdate({ steps: updatedSteps });
  };

  const moveStepUp = (stepIndex: number) => {
    if (stepIndex === 0) return;
    const updatedSteps = [...action.steps];
    [updatedSteps[stepIndex - 1], updatedSteps[stepIndex]] = [updatedSteps[stepIndex], updatedSteps[stepIndex - 1]];
    onActionUpdate({ steps: updatedSteps });
    setSelectedStepIndex(stepIndex - 1);
  };

  const moveStepDown = (stepIndex: number) => {
    if (stepIndex === action.steps.length - 1) return;
    const updatedSteps = [...action.steps];
    [updatedSteps[stepIndex + 1], updatedSteps[stepIndex]] = [updatedSteps[stepIndex], updatedSteps[stepIndex + 1]];
    onActionUpdate({ steps: updatedSteps });
    setSelectedStepIndex(stepIndex + 1);
  };

  const duplicateStep = (stepIndex: number) => {
    const stepToDuplicate = action.steps[stepIndex];
    const duplicatedStep = { 
      ...stepToDuplicate, 
      name: `${stepToDuplicate.name || 'Untitled'} (copy)`,
      customFieldTypes: { ...stepToDuplicate.customFieldTypes }
    };
    const updatedSteps = [...action.steps];
    updatedSteps.splice(stepIndex + 1, 0, duplicatedStep);
    onActionUpdate({ steps: updatedSteps });
    setSelectedStepIndex(stepIndex + 1);
  };

  const deleteStep = (stepIndex: number) => {
    if (action.steps.length === 1) return;
    const updatedSteps = action.steps.filter((_, i) => i !== stepIndex);
    onActionUpdate({ steps: updatedSteps });
    const nextIndex = Math.max(0, stepIndex - 1);
    setSelectedStepIndex(nextIndex);
  };

  const canSave = action.name && action.targetModel && action.steps.length > 0 && action.steps.every(s => s.name);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Configure Steps</h3>
        <p className="text-sm text-muted-foreground">
          Define the processing steps for "{action.name}"
        </p>
      </div>

      {/* Steps Configuration */}
      <div className="space-y-4">
        {action.steps && action.steps.length > 0 ? (
          <>
            {/* Steps Navigator */}
            <StepNavigator
              steps={action.steps}
              selectedStepIndex={selectedStepIndex}
              onStepSelect={setSelectedStepIndex}
              onAddStep={addNewStep}
            />
            
            {/* Current Step Editor */}
            <StepEditor
              step={action.steps[selectedStepIndex]}
              stepIndex={selectedStepIndex}
              totalSteps={action.steps.length}
              agentData={agentData}
              actionName={action.name}
              actionDescription={action.description}
              targetModel={action.targetModel}
              fieldSuggestions={fieldSuggestions}
              isSuggestingFields={isSuggestingFields}
              isGeneratingCode={isGeneratingCode}
              onStepUpdate={(updatedStep) => updateStep(selectedStepIndex, updatedStep)}
              onMoveUp={() => moveStepUp(selectedStepIndex)}
              onMoveDown={() => moveStepDown(selectedStepIndex)}
              onDuplicate={() => duplicateStep(selectedStepIndex)}
              onDelete={() => deleteStep(selectedStepIndex)}
              onSuggestFields={() => onSuggestFields(selectedStepIndex)}
              onGenerateCode={() => onGenerateCode(selectedStepIndex)}
              onClearSuggestions={onClearSuggestions}
            />
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-12 border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <PlusIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h4 className="text-lg font-medium">No steps configured</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Add your first processing step to get started
                </p>
              </div>
              <Button onClick={addNewStep} className="gap-2">
                <PlusIcon className="h-4 w-4" />
                Add First Step
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t">
        <Button
          variant="outline"
          onClick={onBack}
          className="gap-2 w-full sm:w-auto"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Details
        </Button>
        
        <Button
          onClick={onSave}
          disabled={!canSave}
          className="min-w-[120px] w-full sm:w-auto"
        >
          {editingAction ? 'Update Action' : 'Create Action'}
        </Button>
      </div>
    </div>
  );
} 