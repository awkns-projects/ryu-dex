'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  XIcon,
  CodeIcon, 
  DatabaseIcon, 
  CogIcon, 
  ClockIcon, 
  SearchIcon, 
  ChevronDownIcon, 
  ChevronRightIcon,
  CopyIcon,
  ExternalLinkIcon
} from 'lucide-react';
import { AgentData } from '@/lib/types';

interface ApiModalProps {
  agentData: AgentData;
  onClose: () => void;
}

export function ApiModal({ agentData, onClose }: ApiModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['models']));
  
  const baseUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/agent/${agentData.id}`;
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const getModelCrudEndpoints = (model: any) => {
    return [
      {
        method: 'GET',
        path: `/model/${model.id}/records`,
        description: `Retrieve all ${model.name} records`,
      },
      {
        method: 'GET',
        path: `/model/${model.id}/records/{recordId}`,
        description: `Get a specific ${model.name} record`,
      },
      {
        method: 'POST',
        path: `/model/${model.id}/records`,
        description: `Create a new ${model.name} record`,
      },
      {
        method: 'PUT',
        path: `/model/${model.id}/records/{recordId}`,
        description: `Update a ${model.name} record`,
      },
      {
        method: 'DELETE',
        path: `/model/${model.id}/records/{recordId}`,
        description: `Delete a ${model.name} record`,
      }
    ];
  };

  const getActionEndpoints = (action: any) => {
    return [
      {
        method: 'POST',
        path: `/action/${action.id}/execute`,
        description: `Execute ${action.title || action.name} action on a record`,
      }
    ];
  };

  const getScheduleEndpoints = (schedule: any) => {
    return [
      {
        method: 'POST',
        path: `/schedule/${schedule.id}/execute`,
        description: `Execute ${schedule.name} workflow`,
      }
    ];
  };

  const runOnceSchedules = agentData.schedules?.filter(s => s.mode === 'once') || [];

  const filteredContent = searchQuery ? {
    models: agentData.models.filter(model => 
      model.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    actions: agentData.actions.filter(action => 
      (action.title || action.name).toLowerCase().includes(searchQuery.toLowerCase())
    ),
    schedules: runOnceSchedules.filter(schedule => 
      (schedule.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
  } : {
    models: agentData.models,
    actions: agentData.actions,
    schedules: runOnceSchedules
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-hidden">
      <div className="h-full flex items-center justify-center p-2 sm:p-4">
        <div className="bg-background border rounded-lg w-full max-w-[95vw] sm:max-w-[1000px] xl:max-w-[1200px] h-full max-h-[95vh] sm:max-h-[90vh] flex flex-col">
          {/* Fixed Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b flex-shrink-0">
            <div className="flex items-center gap-2">
              <CodeIcon className="h-5 w-5" />
              <div>
                <h3 className="text-xl font-semibold">API Documentation</h3>
                <p className="text-sm text-muted-foreground">
                  REST API endpoints for your agent's models, actions, and workflows
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="space-y-6">
              {/* Search */}
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search endpoints..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Base URL */}
              <div className="p-4 bg-muted/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Base URL</Label>
                    <p className="text-sm font-mono text-muted-foreground mt-1">{baseUrl}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(baseUrl)}
                    className="gap-2"
                  >
                    <CopyIcon className="h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </div>

              {/* Model CRUD Endpoints */}
              <Collapsible 
                open={expandedSections.has('models')} 
                onOpenChange={() => toggleSection('models')}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg transition-colors border">
                  <div className="flex items-center gap-3">
                    <DatabaseIcon className="h-5 w-5" />
                    <div>
                      <h3 className="font-medium text-left">Model CRUD Endpoints</h3>
                      <p className="text-sm text-muted-foreground text-left">
                        Create, read, update, and delete records for each model
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{filteredContent.models.length} models</Badge>
                    {expandedSections.has('models') ? (
                      <ChevronDownIcon className="h-4 w-4" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4" />
                    )}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-4 pt-4">
                    {filteredContent.models.map((model) => (
                      <div key={model.id} className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <DatabaseIcon className="h-4 w-4" />
                          {model.name} Model API
                          <Badge variant="outline" className="text-xs">
                            {model.records?.length || 0} records
                          </Badge>
                        </h4>
                        <div className="grid gap-2">
                          {getModelCrudEndpoints(model).map((endpoint, index) => (
                            <div key={index} className="border rounded p-3 bg-background">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={`font-mono text-xs ${
                                  endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                                  endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                                  endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {endpoint.method}
                                </Badge>
                                <code className="text-sm flex-1 truncate">{endpoint.path}</code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(`${baseUrl}${endpoint.path}`)}
                                  className="h-6 w-6 p-0"
                                >
                                  <CopyIcon className="h-3 w-3" />
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground">{endpoint.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Action Execution Endpoints */}
              <Collapsible 
                open={expandedSections.has('actions')} 
                onOpenChange={() => toggleSection('actions')}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg transition-colors border">
                  <div className="flex items-center gap-3">
                    <CogIcon className="h-5 w-5" />
                    <div>
                      <h3 className="font-medium text-left">Action Execution Endpoints</h3>
                      <p className="text-sm text-muted-foreground text-left">
                        Execute AI-powered actions on your records
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{filteredContent.actions.length} actions</Badge>
                    {expandedSections.has('actions') ? (
                      <ChevronDownIcon className="h-4 w-4" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4" />
                    )}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-4 pt-4">
                    {filteredContent.actions.map((action) => (
                      <div key={action.id} className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          {action.emoji ? (
                            <span className="text-lg">{action.emoji}</span>
                          ) : (
                            <CogIcon className="h-4 w-4" />
                          )}
                          {action.title || action.name} API
                          <Badge variant="outline" className="text-xs">
                            Target: {action.targetModel}
                          </Badge>
                        </h4>
                        {action.description && (
                          <p className="text-sm text-muted-foreground">{action.description}</p>
                        )}
                        <div className="grid gap-2">
                          {getActionEndpoints(action).map((endpoint, index) => (
                            <div key={index} className="border rounded p-3 bg-background">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-blue-100 text-blue-800 font-mono text-xs">
                                  {endpoint.method}
                                </Badge>
                                <code className="text-sm flex-1 truncate">{endpoint.path}</code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(`${baseUrl}${endpoint.path}`)}
                                  className="h-6 w-6 p-0"
                                >
                                  <CopyIcon className="h-3 w-3" />
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground">{endpoint.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Run-Once Schedule Endpoints */}
              {runOnceSchedules.length > 0 && (
                <Collapsible 
                  open={expandedSections.has('schedules')} 
                  onOpenChange={() => toggleSection('schedules')}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-lg transition-colors border">
                    <div className="flex items-center gap-3">
                      <ClockIcon className="h-5 w-5" />
                      <div>
                        <h3 className="font-medium text-left">Workflow Endpoints</h3>
                        <p className="text-sm text-muted-foreground text-left">
                          Execute run-once schedules as API workflows
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{filteredContent.schedules.length} workflows</Badge>
                      {expandedSections.has('schedules') ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="space-y-4 pt-4">
                      {filteredContent.schedules.map((schedule) => (
                        <div key={schedule.id} className="space-y-2">
                          <h4 className="font-medium flex items-center gap-2">
                            <ClockIcon className="h-4 w-4" />
                            {schedule.name} Workflow API
                            <Badge variant="outline" className="text-xs">
                              {schedule.steps?.length || 0} steps
                            </Badge>
                          </h4>
                          {schedule.steps && schedule.steps.length > 0 && (
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p className="font-medium">Workflow Steps:</p>
                              {schedule.steps.map((step: any, index: number) => (
                                <p key={index} className="text-xs pl-4">
                                  {index + 1}. Query {step.modelName} → Execute {step.actionName}
                                  {step.query && ` (${step.query})`}
                                </p>
                              ))}
                            </div>
                          )}
                          <div className="grid gap-2">
                            {getScheduleEndpoints(schedule).map((endpoint, index) => (
                              <div key={index} className="border rounded p-3 bg-background">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className="bg-blue-100 text-blue-800 font-mono text-xs">
                                    {endpoint.method}
                                  </Badge>
                                  <code className="text-sm flex-1 truncate">{endpoint.path}</code>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(`${baseUrl}${endpoint.path}`)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <CopyIcon className="h-3 w-3" />
                                  </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">{endpoint.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* API Documentation Footer */}
              <div className="pt-6 border-t">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-medium">Need help integrating?</h4>
                    <p className="text-sm text-muted-foreground">
                      All endpoints require authentication with your API key
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <ExternalLinkIcon className="h-4 w-4" />
                      API Documentation
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <CopyIcon className="h-4 w-4" />
                      Export OpenAPI
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApiModal; 