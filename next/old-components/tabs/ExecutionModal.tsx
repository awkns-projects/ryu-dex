'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRightIcon } from 'lucide-react';

interface ExecutionModalProps {
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
  executionMetrics?: {
    executionTimeMs: number;
    tokenUsage: {
      totalTokens: number;
      inputTokens: number;
      outputTokens: number;
    };
  };
  onClose: () => void;
}

export function ExecutionModal({
  isOpen,
  actionName,
  recordName,
  currentStep,
  stepIndex,
  totalSteps,
  status,
  error,
  stepResults,
  updatedFields,
  executionMetrics,
  onClose,
}: ExecutionModalProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const [showAllDetails, setShowAllDetails] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
      <div className="bg-background border rounded-lg p-3 sm:p-6 w-full max-w-[95vw] sm:max-w-[600px] max-h-[95vh] sm:max-h-[80vh] overflow-y-auto">
        <div className="space-y-3 sm:space-y-4">
          {/* Header */}
          <div className="text-center">
            <h3 className="text-lg font-semibold">Executing Action</h3>
            <p className="text-sm text-muted-foreground">
              {actionName} on {recordName}
            </p>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{stepIndex} of {totalSteps} steps</span>
            </div>
            <Progress 
              value={(stepIndex / totalSteps) * 100} 
              className="h-2"
            />
          </div>

          {/* Current Step */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {status === 'running' && (
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
              )}
              {status === 'completed' && (
                <div className="h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
              {status === 'failed' && (
                <div className="h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✗</span>
                </div>
              )}
              <span className="text-sm font-medium">
                {status === 'completed' ? 'Results' : 'Current Step'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground pl-6">
              {currentStep}
            </p>
            {error && (
              <p className="text-sm text-red-500 pl-6">
                Error: {error}
              </p>
            )}
          </div>

          {/* Execution Metrics Summary (shown on completion) */}
          {status === 'completed' && executionMetrics && (
            <div className="space-y-3 border rounded-lg p-3 sm:p-4 bg-muted/10">
              <h4 className="text-sm font-medium flex items-center gap-2">
                📊 Execution Metrics
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
                <div className="space-y-1">
                  <div className="font-medium text-blue-700 dark:text-blue-300">⏱️ Execution Time</div>
                  <div className="text-lg font-mono">
                    {executionMetrics.executionTimeMs < 1000 
                      ? `${executionMetrics.executionTimeMs}ms`
                      : `${(executionMetrics.executionTimeMs / 1000).toFixed(2)}s`
                    }
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-green-700 dark:text-green-300">🔤 Total Tokens</div>
                  <div className="text-lg font-mono">
                    {executionMetrics.tokenUsage.totalTokens.toLocaleString()}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-purple-700 dark:text-purple-300">📥 Input Tokens</div>
                  <div className="font-mono">
                    {executionMetrics.tokenUsage.inputTokens.toLocaleString()}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-orange-700 dark:text-orange-300">📤 Output Tokens</div>
                  <div className="font-mono">
                    {executionMetrics.tokenUsage.outputTokens.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Updated Fields (shown on completion) */}
          {status === 'completed' && Object.keys(updatedFields).length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Fields Updated</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {Object.entries(updatedFields).map(([fieldName, fieldData]) => (
                  <div key={fieldName} className="border rounded-lg p-3 bg-muted/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {fieldData.isNew ? '🆕 New' : '📝 Updated'}
                      </Badge>
                      <span className="font-medium text-sm break-words">{fieldName}</span>
                    </div>
                    
                    {!fieldData.isNew && fieldData.before && (
                      <div className="text-xs text-muted-foreground mb-1">
                        <span className="font-medium">Before:</span> 
                        <div className="break-words mt-1">
                          {String(fieldData.before).substring(0, 100)}
                          {String(fieldData.before).length > 100 && '...'}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-xs">
                      <span className="font-medium text-green-600">
                        {fieldData.isNew ? 'Generated:' : 'After:'}
                      </span>
                      <div className="mt-1 p-2 bg-green-50 dark:bg-green-950/20 rounded border-l-2 border-green-500 break-words">
                        {String(fieldData.after).substring(0, 200)}
                        {String(fieldData.after).length > 200 && '...'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Execution Details (shown on completion) */}
          {status === 'completed' && stepResults.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Execution Details</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllDetails(!showAllDetails)}
                  className="text-xs h-6"
                >
                  {showAllDetails ? 'Hide Details' : 'Show All Details'}
                </Button>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {stepResults.map((step, index) => (
                  <Collapsible
                    key={index}
                    open={showAllDetails || expandedSteps.has(index)}
                    onOpenChange={(open) => {
                      setExpandedSteps(prev => {
                        const newSet = new Set(prev);
                        if (open) {
                          newSet.add(index);
                        } else {
                          newSet.delete(index);
                        }
                        return newSet;
                      });
                    }}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded-md transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">{step.stepName}</span>
                        <Badge variant="secondary" className="text-[10px]">
                          {step.stepType || 'ai_reasoning'}
                        </Badge>
                      </div>
                      <ChevronRightIcon 
                        className={`h-3 w-3 transition-transform ${
                          showAllDetails || expandedSteps.has(index) ? 'rotate-90' : ''
                        }`} 
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="pl-4 pt-2 space-y-3 text-xs">
                        {/* Step Inputs */}
                        {step.inputs && Object.keys(step.inputs).length > 0 && (
                          <div>
                            <div className="font-medium text-blue-700 dark:text-blue-300 mb-1">📥 Inputs:</div>
                            <div className="space-y-1 bg-blue-50 dark:bg-blue-950/20 p-2 rounded">
                              {Object.entries(step.inputs).map(([key, value]) => (
                                <div key={key} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                                  <span className="font-mono text-blue-600 dark:text-blue-400 min-w-0 flex-shrink-0">{key}:</span>
                                  <span className="text-blue-800 dark:text-blue-200 break-words">
                                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Step Outputs */}
                        {step.outputs && Object.keys(step.outputs).length > 0 && (
                          <div>
                            <div className="font-medium text-green-700 dark:text-green-300 mb-1">📤 Outputs:</div>
                            <div className="space-y-1 bg-green-50 dark:bg-green-950/20 p-2 rounded">
                              {Object.entries(step.outputs).map(([key, value]) => (
                                <div key={key} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                                  <span className="font-mono text-green-600 dark:text-green-400 min-w-0 flex-shrink-0">{key}:</span>
                                  <span className="text-green-800 dark:text-green-200 break-words">
                                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Token Usage */}
                        {step.tokenUsage && step.tokenUsage.totalTokens > 0 && (
                          <div>
                            <div className="font-medium text-purple-700 dark:text-purple-300 mb-1">🔤 Token Usage:</div>
                            <div className="bg-purple-50 dark:bg-purple-950/20 p-2 rounded">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                <div>
                                  <span className="font-mono text-purple-600 dark:text-purple-400">Total:</span>
                                  <div className="font-mono font-medium">{step.tokenUsage.totalTokens.toLocaleString()}</div>
                                </div>
                                <div>
                                  <span className="font-mono text-purple-600 dark:text-purple-400">Input:</span>
                                  <div className="font-mono">{step.tokenUsage.inputTokens.toLocaleString()}</div>
                                </div>
                                <div>
                                  <span className="font-mono text-purple-600 dark:text-purple-400">Output:</span>
                                  <div className="font-mono">{step.tokenUsage.outputTokens.toLocaleString()}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Execution Time */}
                        {step.executedAt && (
                          <div className="text-muted-foreground">
                            ⏱️ Executed at: {new Date(step.executedAt).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            {status !== 'running' && (
              <Button
                variant="outline"
                onClick={onClose}
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExecutionModal; 