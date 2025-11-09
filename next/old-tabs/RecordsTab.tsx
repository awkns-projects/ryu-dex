'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TableIcon } from 'lucide-react';
import { AgentData, AgentModel } from '@/lib/types';
import { 
  InteractiveRecordsSheet, 
  RecordDetailsModal, 
  CreateRecordModal, 
  ExecutionModal, 
  ModelDetailsModal, 
  ActionPromptModal, 
  AddActionModal,
  CreateRecordOptionsModal,
  ImportDataModal
} from '.';

interface RecordsTabProps {
  agentData: AgentData;
  setAgentData: (data: AgentData) => void;
  onExecuteAction?: (actionId: string, recordId: string) => void;
}

export function RecordsTab({ agentData, setAgentData, onExecuteAction }: RecordsTabProps) {
  const [selectedRecord, setSelectedRecord] = useState<{
    record: Record<string, any>;
    model: AgentModel;
  } | null>(null);
  const [showCreateRecordOptionsModal, setShowCreateRecordOptionsModal] = useState(false);
  const [showCreateRecordModal, setShowCreateRecordModal] = useState(false);
  const [showImportDataModal, setShowImportDataModal] = useState(false);
  const [activeModelTab, setActiveModelTab] = useState<string>(agentData.models[0]?.id || '');
  const [showModelDetailsModal, setShowModelDetailsModal] = useState(false);
  const [selectedModelForDetails, setSelectedModelForDetails] = useState<AgentModel | null>(null);
  const [showActionPromptModal, setShowActionPromptModal] = useState(false);
  const [selectedActionPrompt, setSelectedActionPrompt] = useState<{
    action: any;
    recordId: string;
    recordName: string;
  } | null>(null);
  const [showAddActionModal, setShowAddActionModal] = useState(false);
  const [editingAction, setEditingAction] = useState<any>(null);
  const [preSelectedModel, setPreSelectedModel] = useState<AgentModel | null>(null);
  const [executionModal, setExecutionModal] = useState<{
    isOpen: boolean;
    actionName: string;
    recordName: string;
    currentStep: string;
    stepIndex: number;
    totalSteps: number;
    status: 'running' | 'completed' | 'failed';
    error?: string;
    stepResults: any[];
    updatedFields: Record<string, any>;
    originalRecord: any;
    executionMetrics?: {
      executionTimeMs: number;
      tokenUsage: {
        totalTokens: number;
        inputTokens: number;
        outputTokens: number;
      };
    };
  }>({
    isOpen: false,
    actionName: '',
    recordName: '',
    currentStep: '',
    stepIndex: 0,
    totalSteps: 0,
    status: 'running',
    stepResults: [],
    updatedFields: {},
    originalRecord: {},
  });

  const getActionsForModel = (modelId: string) => {
    const model = agentData.models.find(m => m.id === modelId);
    if (!model) return [] as any[];
    const byName = agentData.actions.filter(a => a.targetModel === model.name);
    const byId = agentData.actions.filter(a => a.targetModelId === model.id);
    return byName.length ? byName : byId;
  };

  const getDisplayValueForReference = (referenceId: string, referencedModelName: string) => {
    const referencedModel = agentData.models.find(m => m.name === referencedModelName);
    if (!referencedModel) {
      console.warn(`Referenced model ${referencedModelName} not found`);
      return referenceId;
    }

    const record = referencedModel.records?.find(r => r.id === referenceId);
    if (!record) {
      console.warn(`Record ${referenceId} not found in model ${referencedModelName}`);
      return referenceId;
    }

    // Ensure we have the full record data
    const fullRecord = {
      ...record,
      ...(record.data || {}), // Include any data from the record.data field
    };

    const displayFields = referencedModel.displayFields || ['name'];
    let displayValues = displayFields
      .map(field => fullRecord[field])
      .filter(Boolean)
      .join(' - ');

    // If no display value found, try common field names as fallback
    if (!displayValues) {
      const fallbackFields = ['title', 'name', 'label', 'description'];
      for (const fieldName of fallbackFields) {
        if (fullRecord[fieldName]) {
          displayValues = String(fullRecord[fieldName]);
          console.log(`🔄 Using fallback field "${fieldName}" for display`);
          break;
        }
      }
    }

    console.log(`🔍 Display value for ${referenceId}:`, {
      modelName: referencedModelName,
      displayFields,
      fullRecord: Object.keys(fullRecord),
      displayValues,
      fallback: displayValues || referenceId
    });

    return displayValues || referenceId;
  };

  const formatFieldValue = (record: Record<string, any>, field: { name: string; type: string; referencesModel?: string }) => {
    const value = record[field.name];
    if (value === undefined || value === null) return '-';
    
    switch (field.type) {
      case 'boolean':
        return value ? '✅ True' : '❌ False';
      case 'reference':
        if (!field.referencesModel) return String(value);
        
        if (Array.isArray(value)) {
          return (
            <div className="flex flex-col gap-1">
              {value.map((refId, index) => (
                <span key={refId} className="text-xs">
                  <span className="text-blue-600 dark:text-blue-400">🔗</span>{' '}
                  {getDisplayValueForReference(refId, field.referencesModel!)}
                </span>
              ))}
            </div>
          );
        }
        
        return (
          <span className="text-xs">
            <span className="text-blue-600 dark:text-blue-400">🔗</span>{' '}
            {getDisplayValueForReference(value, field.referencesModel)}
          </span>
        );
      case 'number':
        return <span className="font-mono">{value}</span>;
      case 'enum':
        return (
          <Badge variant="outline" className="text-xs">
            {value}
          </Badge>
        );
      default:
        return String(value);
    }
  };

  const handleCreateRecord = async (newRecord: Record<string, any>) => {
    if (!activeModelTab) return;
    
    const targetModel = agentData.models.find(m => m.id === activeModelTab);
    if (!targetModel) return;

    try {
      const response = await fetch('/api/agent/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agentData.id,
          modelId: targetModel.id,
          data: newRecord,
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Failed to create record:', responseData.error, responseData.details);
        return;
      }

      // Update local state
      const updatedAgentData = {
        ...agentData,
        models: agentData.models.map(model => {
          if (model.id === targetModel.id) {
            const currentRecords = model.records || [];
            return {
              ...model,
              records: [...currentRecords, {
                ...responseData.record,
                id: responseData.record.id,
                ...responseData.record.data
              }]
            };
          }
          return model;
        })
      };

      // Update state
      setAgentData(updatedAgentData);
      setShowCreateRecordModal(false);
    } catch (error) {
      console.error('Error creating record:', error);
    }
  };

  const executeActionOnRecord = async (actionId: string, recordId: string, recordName: string) => {
    const action = agentData.actions.find(a => a.id === actionId);
    if (!action) {
      console.error('Action not found:', actionId);
      setExecutionModal({
        isOpen: true,
        actionName: 'Unknown Action',
        recordName: recordName || 'Record',
        currentStep: 'Error: Action not found',
        stepIndex: 0,
        totalSteps: 0,
        status: 'failed',
        error: `Action with ID ${actionId} not found`,
        stepResults: [],
        updatedFields: {},
        originalRecord: {},
      });
      return;
    }

    // Find the original record for comparison
    const targetModel = agentData.models.find(m => m.name === action.targetModel);
    if (!targetModel) {
      console.error('Target model not found:', action.targetModel);
      setExecutionModal({
        isOpen: true,
        actionName: action.name,
        recordName: recordName || 'Record',
        currentStep: 'Error: Target model not found',
        stepIndex: 0,
        totalSteps: action.steps?.length || 0,
        status: 'failed',
        error: `Target model ${action.targetModel} not found`,
        stepResults: [],
        updatedFields: {},
        originalRecord: {},
      });
      return;
    }

    const originalRecord = targetModel.records?.find(r => r.id === recordId) || {};

    // Show loading modal
    setExecutionModal({
      isOpen: true,
      actionName: action.name,
      recordName: recordName || 'Record',
      currentStep: 'Initializing...',
      stepIndex: 0,
      totalSteps: action.steps?.length || 0,
      status: 'running',
      stepResults: [],
      updatedFields: {},
      originalRecord,
    });

    try {
      // Execute the actual action
      const response = await fetch('/api/agent/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agentData.id,
          actionId: action.id,
          recordId,
          modelId: targetModel.id,
          targetModel: action.targetModel,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorText;
        } catch {
          errorMessage = errorText;
        }
        console.error('Action execution failed:', errorMessage);
        
        setExecutionModal(prev => ({
          ...prev,
          status: 'failed',
          currentStep: 'Action failed',
          error: errorMessage,
        }));
        return;
      }

      const result = await response.json();
      
      const updatedFields: Record<string, any> = {};
      const newRecord = result.updatedRecord || {};
      
      Object.keys(newRecord).forEach(key => {
        if (newRecord[key] !== originalRecord[key] && newRecord[key] !== undefined) {
          updatedFields[key] = {
            before: originalRecord[key],
            after: newRecord[key],
            isNew: !(key in originalRecord)
          };
        }
      });
      
      setExecutionModal(prev => ({
        ...prev,
        status: 'completed',
        currentStep: 'Action completed successfully!',
        stepIndex: action.steps?.length || 0,
        stepResults: result.stepResults || [],
        updatedFields,
        executionMetrics: result.executionMetrics
      }));
      
      // Update local state
      const updatedAgentData = {
        ...agentData,
        models: agentData.models.map(model => {
          if (model.name === action.targetModel) {
            return {
              ...model,
              records: (model.records || []).map(r => 
                r.id === recordId ? { ...r, ...newRecord } : r
              )
            };
          }
          return model;
        })
      };
      
      // Update state
      setAgentData(updatedAgentData);
    } catch (error) {
      console.error('Action execution error:', error);
      setExecutionModal(prev => ({
        ...prev,
        status: 'failed',
        currentStep: 'Execution error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  };

  const handleShowModelDetails = (model: AgentModel) => {
    setSelectedModelForDetails(model);
    setShowModelDetailsModal(true);
  };

  const handleShowActionPrompt = (action: any, recordId: string, recordName: string) => {
    setSelectedActionPrompt({ action, recordId, recordName });
    setShowActionPromptModal(true);
  };

  const handleRunAction = () => {
    if (selectedActionPrompt) {
      executeActionOnRecord(
        selectedActionPrompt.action.id, 
        selectedActionPrompt.recordId, 
        selectedActionPrompt.recordName
      );
      setShowActionPromptModal(false);
      setSelectedActionPrompt(null);
    }
  };

  const handleEditAction = () => {
    if (selectedActionPrompt) {
      setEditingAction(selectedActionPrompt.action);
      setShowAddActionModal(true);
      setShowActionPromptModal(false);
      setSelectedActionPrompt(null);
    }
  };

  const handleImportSuccess = () => {
    // Refresh the agent data or trigger a reload
    // For now, we'll just close the modal
    // In a real app, you might want to refetch the data
    setShowImportDataModal(false);
  };

  const getReferencedModelRecords = (modelName: string) => {
    // Find the referenced model by name
    const referencedModel = agentData.models.find(m => m.name === modelName);
    if (!referencedModel) {
      console.warn(`Referenced model ${modelName} not found`);
      return [];
    }

    // Get the records from the referenced model
    const records = referencedModel.records || [];

    // Sort records by display fields for better readability
    const displayFields = referencedModel.displayFields || ['name'];
    
    // Process and sort the records
    const processedRecords = records.map(record => {
      // Ensure we have the full record data
      const fullRecord = {
        ...record,
        ...(record.data || {}), // Include any data from the record.data field
      };

      // Calculate display value for sorting
      const displayValue = displayFields
        .map(field => fullRecord[field])
        .filter(Boolean)
        .join(' - ');

      return {
        ...fullRecord,
        displayValue, // Add displayValue for sorting and display
      };
    });

    // Sort by display value
    return processedRecords.sort((a, b) => 
      (a.displayValue || '').localeCompare(b.displayValue || '')
    );
  };

  return (
    <Card className='border-none'>
      <CardHeader className='px-0 pb-3'>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TableIcon className="h-4 w-4" />
          Records & Actions
        </CardTitle>
        <CardDescription className="text-sm">
          View and interact with your data records. Click the menu on each row to run actions.
        </CardDescription>
      </CardHeader>
      <CardContent className='px-0'>
        <InteractiveRecordsSheet 
          agentData={agentData} 
          onExecuteAction={executeActionOnRecord}
          activeModelTab={activeModelTab}
          setActiveModelTab={setActiveModelTab}
          onShowCreateRecord={() => setShowCreateRecordOptionsModal(true)}
          onSelectRecord={(record: Record<string, any>, model: AgentModel) => setSelectedRecord({ record, model })}
          getActionsForModel={getActionsForModel}
          formatFieldValue={formatFieldValue}
          getDisplayValueForReference={getDisplayValueForReference}
          onShowModelDetails={handleShowModelDetails}
          onShowActionPrompt={handleShowActionPrompt}
          onShowAddAction={(model) => {
            setPreSelectedModel(model);
            setShowAddActionModal(true);
          }}
        />
      </CardContent>

      {/* Record Details Modal */}
      {selectedRecord && (
        <RecordDetailsModal
          record={selectedRecord.record}
          model={selectedRecord.model}
          onClose={() => setSelectedRecord(null)}
          onAction={executeActionOnRecord}
          formatFieldValue={formatFieldValue}
          getActionsForModel={getActionsForModel}
        />
      )}

      {/* Create Record Options Modal */}
      {showCreateRecordOptionsModal && (
        <CreateRecordOptionsModal
          model={agentData.models.find(m => m.id === activeModelTab)!}
          onClose={() => setShowCreateRecordOptionsModal(false)}
          onCreateSingle={() => {
            setShowCreateRecordOptionsModal(false);
            setShowCreateRecordModal(true);
          }}
          onImportData={() => {
            setShowCreateRecordOptionsModal(false);
            setShowImportDataModal(true);
          }}
        />
      )}

      {/* Create Record Modal */}
      {showCreateRecordModal && (
        <CreateRecordModal
          model={agentData.models.find(m => m.id === activeModelTab)!}
          onClose={() => setShowCreateRecordModal(false)}
          onCreate={handleCreateRecord}
          getDisplayValueForReference={getDisplayValueForReference}
          getReferencedModelRecords={getReferencedModelRecords}
        />
      )}

      {/* Import Data Modal */}
      {showImportDataModal && (
        <ImportDataModal
          model={agentData.models.find(m => m.id === activeModelTab)!}
          agentId={agentData.id}
          onClose={() => setShowImportDataModal(false)}
          onSuccess={handleImportSuccess}
        />
      )}

      {/* Model Details Modal */}
      {showModelDetailsModal && selectedModelForDetails && (
        <ModelDetailsModal
          model={selectedModelForDetails}
          agentData={agentData}
          setAgentData={setAgentData}
          onClose={() => {
            setShowModelDetailsModal(false);
            setSelectedModelForDetails(null);
          }}
          onExecuteAction={executeActionOnRecord}
          onEditAction={(action) => {
            setEditingAction(action);
            setShowAddActionModal(true);
          }}
        />
      )}

      {/* Action Prompt Modal */}
      {showActionPromptModal && selectedActionPrompt && (
        <ActionPromptModal
          action={selectedActionPrompt.action}
          recordName={selectedActionPrompt.recordName}
          onClose={() => {
            setShowActionPromptModal(false);
            setSelectedActionPrompt(null);
          }}
          onRun={handleRunAction}
          onEdit={handleEditAction}
        />
      )}

      {/* Add/Edit Action Modal */}
      {showAddActionModal && (
        <AddActionModal
          agentData={agentData}
          editingAction={editingAction}
          preSelectedModel={preSelectedModel}
          onClose={() => {
            setShowAddActionModal(false);
            setEditingAction(null);
            setPreSelectedModel(null);
          }}
          onSave={(updatedAction) => {
            // Update agentData state directly
            setAgentData({
              ...agentData,
              actions: editingAction 
                ? agentData.actions.map(action => 
                    action.id === editingAction.id ? updatedAction : action
                  )
                : [...agentData.actions, updatedAction]
            });
          }}
        />
      )}

      {/* Execution Modal */}
      <ExecutionModal
        isOpen={executionModal.isOpen}
        actionName={executionModal.actionName}
        recordName={executionModal.recordName}
        currentStep={executionModal.currentStep}
        stepIndex={executionModal.stepIndex}
        totalSteps={executionModal.totalSteps}
        status={executionModal.status}
        error={executionModal.error}
        stepResults={executionModal.stepResults}
        updatedFields={executionModal.updatedFields}
        executionMetrics={executionModal.executionMetrics}
        onClose={() => setExecutionModal(prev => ({ ...prev, isOpen: false }))}
      />
    </Card>
  );
}

export default RecordsTab; 