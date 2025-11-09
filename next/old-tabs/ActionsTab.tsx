'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDownIcon, ChevronRightIcon, CogIcon, PlayIcon, TableIcon, PlusIcon, EditIcon } from 'lucide-react';
import { AgentData } from '@/lib/types';
import { ExecutionLogs } from '@/components/execution-logs';
import { AddActionModal, ExecutionModal } from '.';
import { formatActionName } from '@/lib/utils';

interface ActionsTabProps {
  agentData: AgentData;
  setAgentData: (data: AgentData) => void;
  onExecuteAction?: (actionId: string, recordId: string, recordName: string) => void;
  onAddAction?: () => void;
}

export function ActionsTab({ agentData, setAgentData, onExecuteAction }: ActionsTabProps) {
  const [expandedActions, setExpandedActions] = useState<Set<string>>(new Set());
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [showAddActionModal, setShowAddActionModal] = useState(false);
  const [editingAction, setEditingAction] = useState<any>(null);
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

  const getStepTypeColor = (type: string) => {
    switch (type) {
      case 'fetch_record':
        return 'bg-chart-3/10 text-chart-3 border-chart-3/20';
      case 'ai_reasoning':
        return 'bg-chart-1/10 text-chart-1 border-chart-1/20';
      case 'web_search':
        return 'bg-chart-2/10 text-chart-2 border-chart-2/20';
      case 'image_generation':
        return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-300 dark:border-purple-800';
      case 'custom':
        return 'bg-chart-4/10 text-chart-4 border-chart-4/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
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
      totalSteps: action.steps.length,
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
      
      console.log('📊 Execution result received:', result);
      console.log('📊 Execution metrics from API:', result.executionMetrics);
      
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

      // Call the onExecuteAction callback if provided
      onExecuteAction?.(actionId, recordId, recordName);
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

  const handleActionClick = (actionId: string) => {
    if (selectedActionId === actionId) {
      setSelectedActionId(null);
      setExpandedActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(actionId);
        return newSet;
      });
    } else {
      setSelectedActionId(actionId);
      setExpandedActions(prev => new Set([...prev, actionId]));
    }
  };

  return (
    <div className="space-y-6">
      <Card className='border-none'>
        <CardHeader className='px-0'>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CogIcon className="h-5 w-5" />
                Actions & Workflows
              </CardTitle>
              <CardDescription>
                Define automated actions that can be performed on your data
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddActionModal(true)} size="sm" className="gap-2">
              <PlusIcon className="h-4 w-4" />
              Add Action
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-0">
          {agentData.actions.map((action) => (
            <div key={action.id} className="border rounded-lg">
              <Collapsible
                open={expandedActions.has(action.id)}
                onOpenChange={(open) => {
                  if (open) {
                    setExpandedActions(prev => new Set([...prev, action.id]));
                    setSelectedActionId(action.id);
                  } else {
                    setExpandedActions(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(action.id);
                      return newSet;
                    });
                    if (selectedActionId === action.id) {
                      setSelectedActionId(null);
                    }
                  }
                }}
              >
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between">
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="flex-1 justify-start p-4 h-auto hover:bg-muted/50 text-left"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActionClick(action.id);
                      }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        {expandedActions.has(action.id) ? (
                          <ChevronDownIcon className="h-4 w-4 shrink-0" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4 shrink-0" />
                        )}
                        <span className="font-medium">{action.title || formatActionName(action.name)}</span>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="shrink-0">Target: {action.targetModel}</Badge>
                          <Badge variant="outline" className="shrink-0">{action.steps?.length || 0} steps</Badge>
                        </div>
                      </div>
                    </Button>
                  </CollapsibleTrigger>
                  <div className="p-2 sm:p-2 border-t sm:border-t-0 sm:border-l">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingAction(action)}
                        className="gap-1"
                      >
                        <EditIcon className="h-4 w-4" />
                        Edit
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            className="gap-1"
                          >
                            <PlayIcon className="h-4 w-4" />
                            Execute
                          </Button>
                        </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64">
                        <div className="p-2">
                          <p className="text-sm font-medium mb-2">Execute on Record</p>
                          <p className="text-xs text-muted-foreground mb-3">
                            Choose a record to run this action on
                          </p>
                          
                          {/* Find target model records */}
                          {(() => {
                            const targetModel = agentData.models.find(m => m.name === action.targetModel);
                            const records = targetModel?.records || [];
                            
                            if (!targetModel) {
                              return (
                                <div className="text-center py-4 text-muted-foreground">
                                  <p className="text-xs">Target model not found</p>
                                </div>
                              );
                            }
                            
                            return records.length > 0 ? (
                              <div className="space-y-1 max-h-48 overflow-y-auto">
                                {records.slice(0, 10).map((record, index) => {
                                  const nameField = targetModel.fields.find(f => f.name.toLowerCase().includes('name'));
                                  const secondaryField = targetModel.fields.find(f => f.type === 'text' && f.name !== nameField?.name);
                                  const displayName = (nameField ? record[nameField.name] : null) || `Record ${index + 1}`;
                                  const secondaryValue = secondaryField ? record[secondaryField.name] : 'N/A';
                                  
                                  return (
                                    <DropdownMenuItem
                                      key={record.id || index}
                                      onClick={() => {
                                        executeActionOnRecord(action.id, record.id || `record-${index}`, displayName);
                                      }}
                                      className="flex items-center gap-2"
                                    >
                                      <PlayIcon className="h-3 w-3" />
                                      <span className="truncate">{displayName}</span>
                                      <span className="text-xs text-muted-foreground">
                                        ({secondaryField?.name}: {secondaryValue})
                                      </span>
                                    </DropdownMenuItem>
                                  );
                                })}
                                {records.length > 10 && (
                                  <div className="text-xs text-muted-foreground p-2 border-t">
                                    +{records.length - 10} more records available in Records & Actions section
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-4 text-muted-foreground">
                                <TableIcon className="h-6 w-6 mx-auto mb-2 opacity-50" />
                                <p className="text-xs">No records available</p>
                                <p className="text-xs">Add records first to execute actions</p>
                              </div>
                            );
                          })()}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    </div>
                  </div>
                </div>
                <CollapsibleContent className="px-4 pb-4 space-y-4">
                  {action.description && (
                    <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                      {action.description}
                    </div>
                  )}
                  
                  {/* Target Model */}
                  <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm font-medium text-foreground">🎯 Target Model:</span>
                    <Badge variant="outline">{action.targetModel}</Badge>
                    <span className="text-xs text-muted-foreground w-full sm:w-auto mt-1 sm:mt-0 sm:ml-2">
                      Action workflow that processes rows from this model
                    </span>
                  </div>

                  {/* Execution Flow */}
                  <div>
                    <h4 className="font-medium text-sm mb-3 text-foreground flex items-center gap-2">
                      ⚡ Execution Flow
                      <Badge variant="outline" className="text-xs">
                        {action.steps?.length || 0} step{(action.steps?.length || 0) !== 1 ? 's' : ''}
                      </Badge>
                    </h4>
                    
                    {/* Simplified Step Flow */}
                    <div className="space-y-2">
                      {(action.steps || [])
                        .sort((a, b) => a.order.localeCompare(b.order))
                        .map((step, index) => (
                          <Collapsible key={step.id}>
                            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg transition-colors border">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
                                    {index + 1}
                                  </div>
                                  {index < (action.steps?.length || 0) - 1 && (
                                    <div className="text-muted-foreground text-xs">→</div>
                                  )}
                                </div>
                                <div className="text-left">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{step.name}</span>
                                    <Badge className={getStepTypeColor(step.type)}>
                                      {step.type.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-muted-foreground">
                                      {(step.inputFields || []).length} input{(step.inputFields || []).length !== 1 ? 's' : ''} → {(step.outputFields || []).length} output{(step.outputFields || []).length !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <ChevronRightIcon className="h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="px-3 pb-3">
                              <div className="space-y-3 mt-3 border-l-2 border-muted pl-4 ml-3">
                                {/* Step Input/Output Fields */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <h5 className="text-xs font-medium text-muted-foreground mb-1">📥 Inputs:</h5>
                                    <div className="flex flex-wrap gap-1">
                                      {(step.inputFields || []).map((field, fieldIndex) => (
                                        <Badge key={fieldIndex} variant="secondary" className="text-xs">
                                          {field}
                                        </Badge>
                                      ))}
                                      {(!step.inputFields || step.inputFields.length === 0) && (
                                        <span className="text-xs text-muted-foreground">No inputs</span>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <h5 className="text-xs font-medium text-muted-foreground mb-1">📤 Outputs:</h5>
                                    <div className="flex flex-wrap gap-1">
                                      {(step.outputFields || []).map((field, fieldIndex) => (
                                        <Badge key={fieldIndex} variant="outline" className="text-xs">
                                          {field}
                                        </Badge>
                                      ))}
                                      {(!step.outputFields || step.outputFields.length === 0) && (
                                        <span className="text-xs text-muted-foreground">No outputs</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Step Description */}
                                {step.config?.prompt && (
                                  <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                                    <span className="font-medium">Prompt:</span> {step.config.prompt}
                                  </div>
                                )}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Add/Edit Action Modal */}
      {(showAddActionModal || editingAction) && (
        <AddActionModal
          agentData={agentData}
          editingAction={editingAction}
          onClose={() => {
            setShowAddActionModal(false);
            setEditingAction(null);
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

      {/* Execution Logs */}
      {selectedActionId && (
        <ExecutionLogs
          title="Action Execution History"
          fetchUrl={`/api/agent/action/${selectedActionId}/executions`}
          emptyMessage="No executions found for this action"
        />
      )}
    </div>
  );
}

export default ActionsTab; 