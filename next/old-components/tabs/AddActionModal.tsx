// @ts-nocheck
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';
import { AgentData, AgentModel } from '@/lib/types';
import { ActionDetailsStep } from './ActionDetailsStep';
import { StepsEditingStep } from './StepsEditingStep';
import { StepIndicator } from './StepIndicator';
import { ActionStep, NewAction } from './types';

interface AddActionModalProps {
  agentData: AgentData;
  editingAction?: any;
  preSelectedModel?: AgentModel | null;
  onClose: () => void;
  onSave?: (updatedAction: any) => void;
}

export function AddActionModal({ agentData, editingAction, preSelectedModel, onClose, onSave }: AddActionModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [newAction, setNewAction] = useState<NewAction>(() => {
    if (editingAction) {
      return {
        name: editingAction.name || '',
        description: editingAction.description || '',
        targetModel: editingAction.targetModel || '',
        steps: editingAction.steps?.map((step: any) => ({
          name: step.name || '',
          type: step.type || 'ai_reasoning',
          prompt: step.config?.prompt || step.prompt || '',
          code: step.config?.code || step.code || '',
          envVars: step.envVars || [],
          inputFields: step.inputFields || [],
          outputFields: step.outputFields || [],
          customFieldTypes: {} as Record<string, { fieldType: string, enumValues?: string[] }>,
        })) || []
      };
    }
    
    return {
      name: '',
      description: '',
      targetModel: preSelectedModel?.name || '',
      steps: [] // Start with empty steps array for new actions
    };
  });
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [isSuggestingFields, setIsSuggestingFields] = useState(false);
  const [fieldSuggestions, setFieldSuggestions] = useState<any>(null);
  const [isGeneratingSteps, setIsGeneratingSteps] = useState(false);

  const steps = [
    {
      title: 'Action Details',
      description: 'Basic information and step generation'
    },
    {
      title: 'Configure Steps',
      description: 'Define processing workflow'
    }
  ];

  const updateAction = (updates: Partial<NewAction>) => {
    setNewAction(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    setCurrentStep(1);
  };

  const handleBack = () => {
    setCurrentStep(0);
  };

  const handleGenerateSteps = async () => {
    if (!newAction.name || !newAction.description || !newAction.targetModel) return;

    setIsGeneratingSteps(true);
    try {
      const response = await fetch('/api/agent/generate-steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionName: newAction.name,
          actionDescription: newAction.description,
          targetModel: newAction.targetModel,
          existingModels: agentData.models,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Replace current steps with generated steps
        setNewAction(prev => ({
          ...prev,
          description: result.enhancedActionDescription || prev.description,
          steps: result.steps.map((step: any) => ({
            name: step.name,
            type: step.type,
            prompt: step.prompt,
            code: '',
            envVars: [],
            inputFields: step.inputFields,
            outputFields: step.outputFields,
            customFieldTypes: {},
          }))
        }));

        // Set suggestions for potential new models
        if (result.suggestedModels?.length > 0) {
          setFieldSuggestions(result);
        }
      } else {
        console.error('Step generation failed:', await response.text());
      }
    } catch (error) {
      console.error('Step generation error:', error);
    } finally {
      setIsGeneratingSteps(false);
    }
  };

  const handleSuggestFields = async (selectedStepIndex: number) => {
    const step = newAction.steps[selectedStepIndex];
    if (!step?.prompt) return;

    setIsSuggestingFields(true);
    try {
      const response = await fetch('/api/agent/suggest-fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: step.prompt,
          stepType: step.type,
          targetModel: newAction.targetModel,
          existingModels: agentData.models,
        }),
      });

      if (response.ok) {
        const suggestions = await response.json();
        setFieldSuggestions(suggestions);
        
        // Auto-apply suggestions
        const updatedStep = { ...step };
        const customFieldTypes = { ...updatedStep.customFieldTypes };
        
        // Apply custom field types from suggestions
        [...(suggestions.inputFields || []), ...(suggestions.outputFields || [])].forEach((field: any) => {
          if (field.isCustom) {
            if (field.type === 'enum') {
              customFieldTypes[field.name] = {
                fieldType: 'enum',
                enumValues: field.enumValues
              };
            } else if (field.referencesModel) {
              customFieldTypes[field.name] = {
                fieldType: field.referencesModel
              };
            } else {
              customFieldTypes[field.name] = {
                fieldType: field.type
              };
            }
          }
        });

        updatedStep.prompt = suggestions.enhancedPrompt || updatedStep.prompt;
        updatedStep.inputFields = (suggestions.inputFields || []).map((f: any) => f.name);
        updatedStep.outputFields = (suggestions.outputFields || []).map((f: any) => f.name);
        updatedStep.customFieldTypes = customFieldTypes;
        
        // Update the step in the action
        const updatedSteps = [...newAction.steps];
        updatedSteps[selectedStepIndex] = updatedStep;
        setNewAction(prev => ({ ...prev, steps: updatedSteps }));
      } else {
        console.error('Field suggestion failed:', await response.text());
      }
    } catch (error) {
      console.error('Field suggestion error:', error);
    } finally {
      setIsSuggestingFields(false);
    }
  };

  const handleGenerateAICode = async (selectedStepIndex: number) => {
    const step = newAction.steps[selectedStepIndex];
    if (!step?.prompt || step.type !== 'custom') return;

    setIsGeneratingCode(true);
    try {
      const response = await fetch('/api/agent/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: step.prompt,
          stepName: step.name,
          inputFields: step.inputFields,
          outputFields: step.outputFields,
          targetModel: newAction.targetModel,
          actionDescription: newAction.description,
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        
        const updatedStep = { ...step };
        const envVars = (result.envVars || []).map((envVar: string) => ({
          key: envVar,
          value: '',
          isOAuth: ['FACEBOOK_ACCESS_TOKEN', 'INSTAGRAM_ACCESS_TOKEN', 'X_ACCESS_TOKEN', 'THREADS_ACCESS_TOKEN'].includes(envVar)
        }));
        
        updatedStep.code = result.code;
        updatedStep.envVars = envVars;
        updatedStep.npmPackages = result.dependencies || result.npmPackages || [];
        updatedStep.explanation = result.explanation;
        
        // Update the step in the action
        const updatedSteps = [...newAction.steps];
        updatedSteps[selectedStepIndex] = updatedStep;
        setNewAction(prev => ({ ...prev, steps: updatedSteps }));
      } else {
        console.error('Code generation failed:', await response.text());
      }
    } catch (error) {
      console.error('Code generation error:', error);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleAddAction = async () => {
    try {
      const isEditing = !!editingAction;
      const url = isEditing ? `/api/agent/action/${editingAction.id}` : '/api/agent/action';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agentData.id,
          action: {
            name: newAction.name,
            description: newAction.description,
            targetModel: newAction.targetModel,
            steps: newAction.steps.map((step: ActionStep, idx: number) => ({
              name: step.name,
              type: step.type,
              config: step.type === 'custom' ? { code: step.code } : { prompt: step.prompt, model: 'chat-model' },
              order: String(idx + 1),
              inputFields: step.inputFields,
              outputFields: step.outputFields,
            }))
          }
        }),
      });
      
      if (response.ok) {
        const responseData = await response.json();
        onClose();
        
        // Update the agentData state directly instead of reloading
        if (onSave) {
          onSave(responseData.action);
        }
        console.log('Action saved successfully:', responseData);
      } else {
        const errorText = await response.text();
        console.error(`Failed to ${isEditing ? 'update' : 'create'} action:`, errorText);
      }
    } catch (error) {
      console.error(`Error ${editingAction ? 'updating' : 'creating'} action:`, error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-hidden">
      <div className="h-full flex items-center justify-center p-2 sm:p-4">
        <div className="bg-background border rounded-lg w-full max-w-[95vw] sm:max-w-[900px] xl:max-w-[1000px] h-full max-h-[95vh] sm:max-h-[90vh] flex flex-col">
          {/* Fixed Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b flex-shrink-0">
            <h3 className="text-xl font-semibold">
              {editingAction ? 'Edit Action' : 'Add Custom Action'}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Step Indicator */}
          <div className="px-4 sm:px-6 py-3 border-b flex-shrink-0">
            <StepIndicator currentStep={currentStep} steps={steps} />
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {currentStep === 0 ? (
              <ActionDetailsStep
                action={newAction}
                agentData={agentData}
                isGeneratingSteps={isGeneratingSteps}
                onActionUpdate={updateAction}
                onGenerateSteps={handleGenerateSteps}
                onNext={handleNext}
              />
            ) : (
              <StepsEditingStep
                action={newAction}
                agentData={agentData}
                fieldSuggestions={fieldSuggestions}
                isSuggestingFields={isSuggestingFields}
                isGeneratingCode={isGeneratingCode}
                onActionUpdate={updateAction}
                onSuggestFields={handleSuggestFields}
                onGenerateCode={handleGenerateAICode}
                onClearSuggestions={() => setFieldSuggestions(null)}
                onBack={handleBack}
                onSave={handleAddAction}
                editingAction={editingAction}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddActionModal; 