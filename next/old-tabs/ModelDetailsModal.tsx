'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { XIcon, DatabaseIcon, CogIcon, PlayIcon, HistoryIcon, PlusIcon } from 'lucide-react';
import { AgentModel, AgentField } from '@/lib/types';
import { ExecutionLogs } from '@/components/execution-logs';
import { formatActionName } from '@/lib/utils';
import { AddFieldModal } from './AddFieldModal';
import { AddActionModal } from './AddActionModal';

interface ModelDetailsModalProps {
  model: AgentModel;
  agentData: any;
  onClose: () => void;
  onExecuteAction?: (actionId: string, recordId: string, recordName: string) => void;
  onEditAction?: (action: any) => void;
  setAgentData?: (agentData: any) => void;
}

export function ModelDetailsModal({ 
  model, 
  agentData, 
  onClose, 
  onExecuteAction, 
  onEditAction,
  setAgentData
}: ModelDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('fields');
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [showAddActionModal, setShowAddActionModal] = useState(false);
  const [editingField, setEditingField] = useState<AgentField | undefined>(undefined);

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return '📝';
      case 'number': return '🔢';
      case 'boolean': return '✅';
      case 'date': return '📅';
      case 'json': return '🔧';
      case 'reference': return '🔗';
      case 'enum': return '🏷️';
      default: return '❓';
    }
  };

  const getActionsForModel = () => {
    if (!agentData?.actions) return [];
    const byName = agentData.actions.filter((a: any) => a.targetModel === model.name);
    const byId = agentData.actions.filter((a: any) => a.targetModelId === model.id);
    return byName.length ? byName : byId;
  };

  const modelActions = getActionsForModel();

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-background border rounded-lg w-full max-w-[95vw] sm:max-w-[800px] lg:max-w-[900px] my-2 sm:my-0 min-h-0 max-h-none sm:max-h-[90vh]">
        <div className="p-4 sm:p-6 max-h-[calc(100vh-1rem)] sm:max-h-none overflow-y-auto">
          <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between sticky top-0 bg-background z-10 pb-3 border-b sm:border-b-0 sm:pb-0 sm:static">
              <div className="flex items-center gap-2 min-w-0">
                <DatabaseIcon className="h-5 w-5 flex-shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-xl font-semibold truncate">{model.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{model.records?.length || 0} records</span>
                    <span>•</span>
                    <span>{model.fields.length} fields</span>
                    <span>•</span>
                    <span>{modelActions.length} actions</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 flex-shrink-0"
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>

            {/* Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="fields" className="flex items-center gap-2 text-xs sm:text-sm">
                  <DatabaseIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Fields</span>
                  <span className="sm:hidden">Fields</span>
                </TabsTrigger>
                <TabsTrigger value="actions" className="flex items-center gap-2 text-xs sm:text-sm">
                  <CogIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Actions</span>
                  <span className="sm:hidden">Actions</span>
                  {modelActions.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {modelActions.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2 text-xs sm:text-sm">
                  <HistoryIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">History</span>
                  <span className="sm:hidden">History</span>
                </TabsTrigger>
              </TabsList>

              {/* Fields Tab */}
              <TabsContent value="fields" className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium">Data Structure</h4>
                    <Button
                      onClick={() => setShowAddFieldModal(true)}
                      size="sm"
                      className="gap-2"
                    >
                      <PlusIcon className="h-4 w-4" />
                      Add Field
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {model.fields.map((field: AgentField) => (
                      <div key={field.name} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border">
                        <span className="text-lg mt-0.5 flex-shrink-0">{getFieldTypeIcon(field.type)}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-wrap">
                            <span className="font-medium text-sm">{field.title}</span>
                            <span className="text-xs text-muted-foreground">({field.name})</span>
                            <div className="flex flex-wrap gap-1 mt-1 sm:mt-0">
                              <Badge variant="outline" className="text-[10px] px-1">
                                {field.type}
                              </Badge>
                              {field.type === 'reference' && field.referenceType && (
                                <Badge variant="secondary" className="text-[10px] px-1">
                                  {field.referenceType === 'to_one' ? 'single' : 'multiple'}
                                </Badge>
                              )}
                              {field.required && (
                                <Badge variant="destructive" className="text-[10px] px-1">
                                  required
                                </Badge>
                              )}
                            </div>
                          </div>
                          {field.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 break-words">
                              {field.description}
                            </p>
                          )}
                          {field.type === 'reference' && field.referencesModel && (
                            <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1">
                              → References {field.referencesModel}
                            </p>
                          )}
                          {field.type === 'enum' && (field.options || field.enumValues) && (
                            <p className="text-[10px] text-green-600 dark:text-green-400 mt-1">
                              Options: {(field.options || field.enumValues)?.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Display Fields */}
                {model.displayFields && model.displayFields.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Display Fields</h4>
                    <div className="flex flex-wrap gap-1">
                      {model.displayFields.map((fieldName, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {fieldName}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Fields used to identify records in references and lists
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Actions Tab */}
              <TabsContent value="actions" className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium">Model Actions</h4>
                    <Button
                      onClick={() => setShowAddActionModal(true)}
                      size="sm"
                      className="gap-2"
                    >
                      <PlusIcon className="h-4 w-4" />
                      Add Action
                    </Button>
                  </div>
                  {modelActions.length > 0 ? (
                    <div className="space-y-3">
                      {modelActions.map((action: any) => (
                        <div key={action.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border">
                          {action.emoji ? (
                            <span className="text-xl mt-0.5 flex-shrink-0">{action.emoji}</span>
                          ) : (
                            <CogIcon className="h-5 w-5 mt-0.5 flex-shrink-0 text-muted-foreground" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <span className="font-medium text-sm">
                                {action.title || formatActionName(action.name)}
                              </span>
                              <div className="flex flex-wrap gap-1">
                                <Badge variant="outline" className="text-xs">
                                  {action.steps?.length || 0} steps
                                </Badge>
                              </div>
                            </div>
                            {action.description && (
                              <p className="text-xs text-muted-foreground mb-2 break-words">
                                {action.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2">
                              {model.records && model.records.length > 0 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    // Execute on first record as example
                                    const firstRecord = model.records![0];
                                    const recordName = firstRecord[model.displayFields?.[0] || 'name'] || 'Record';
                                    onExecuteAction?.(action.id, firstRecord.id || '1', recordName);
                                  }}
                                  className="gap-1 text-xs"
                                >
                                  <PlayIcon className="h-3 w-3" />
                                  Test Run
                                </Button>
                              )}
                              {onEditAction && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => onEditAction(action)}
                                  className="gap-1 text-xs"
                                >
                                  Edit
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CogIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="font-medium">No actions available</p>
                      <p className="text-sm mt-1">Actions targeting this model will appear here</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-3">Execution History</h4>
                  <ExecutionLogs
                    title=""
                    fetchUrl={`/api/agent/model/${model.id}/executions`}
                    emptyMessage="No execution history found for this model"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Add Field Modal */}
      {showAddFieldModal && (
        <AddFieldModal
          model={model}
          agentData={agentData}
          editingField={editingField}
          onClose={() => {
            setShowAddFieldModal(false);
            setEditingField(undefined);
          }}
          onSave={(updatedField) => {
            if (setAgentData) {
              // Update the agentData with the new/updated field
              const updatedModels = agentData.models.map((m: AgentModel) => {
                if (m.id === model.id) {
                  const updatedFields = editingField 
                    ? m.fields.map((f: AgentField) => f.name === editingField.name ? updatedField : f)
                    : [...m.fields, updatedField];
                  return { ...m, fields: updatedFields };
                }
                return m;
              });
              setAgentData({ ...agentData, models: updatedModels });
            }
          }}
        />
      )}

      {/* Add Action Modal */}
      {showAddActionModal && (
        <AddActionModal
          agentData={agentData}
          preSelectedModel={model}
          onClose={() => setShowAddActionModal(false)}
          onSave={(updatedAction) => {
            if (setAgentData) {
              // Update the agentData with the new action
              setAgentData({
                ...agentData,
                actions: [...agentData.actions, updatedAction]
              });
            }
          }}
        />
      )}
    </div>
  );
}

export default ModelDetailsModal; 