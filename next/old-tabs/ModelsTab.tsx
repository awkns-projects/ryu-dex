'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DatabaseIcon } from 'lucide-react';
import { AgentData, AgentField } from '@/lib/types';
import { ExecutionLogs } from '@/components/execution-logs';

interface ModelsTabProps {
  agentData: AgentData;
}

export function ModelsTab({ agentData }: ModelsTabProps) {
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return '📝';
      case 'number': return '🔢';
      case 'boolean': return '✅';
      case 'date': return '📅';
      case 'json': return '🔧';
      case 'reference': return '🔗';
      default: return '❓';
    }
  };

  return (
    <div className="space-y-6">
      <Card className='border-none'>
        <CardHeader className='px-0'>
          <CardTitle className="flex items-center gap-2">
            <DatabaseIcon className="h-5 w-5" />
            Data Models
          </CardTitle>
          <CardDescription>
            Define the structure of your data and how it should be stored
          </CardDescription>
        </CardHeader>
        <CardContent className='px-0'>
          <div className="space-y-6">
            {agentData.models.map((model) => (
              <div
                key={model.id}
                className={`border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors ${
                  selectedModelId === model.id ? 'bg-muted/50 ring-1 ring-primary' : ''
                }`}
                onClick={() => setSelectedModelId(model.id === selectedModelId ? null : model.id)}
              >
                <div className="p-3 border-b bg-muted/30">
                  <h3 className="font-medium">{model.name}</h3>
                </div>
                <div className="p-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {model.fields.map((field: AgentField) => (
                      <div key={field.name} className="flex items-start gap-2 p-2 rounded-lg bg-muted/20">
                        <span className="text-lg mt-0.5">{getFieldTypeIcon(field.type)}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-medium text-sm">{field.title}</span>
                            <span className="text-xs text-muted-foreground">({field.name})</span>
                            <div className="flex flex-wrap gap-1 mt-0.5">
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
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{field.description}</p>
                          )}
                          {field.type === 'reference' && field.referencesModel && (
                            <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1">
                              → {field.referencesModel}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Execution Logs */}
      {selectedModelId && (
        <ExecutionLogs
          title="Model Execution History"
          fetchUrl={`/api/agent/model/${selectedModelId}/executions`}
          emptyMessage="No executions found for this model"
        />
      )}
    </div>
  );
}

export default ModelsTab; 