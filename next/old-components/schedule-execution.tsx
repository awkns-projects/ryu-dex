'use client';

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  PlayIcon, 
  LoaderIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DatabaseIcon,
  SearchIcon
} from 'lucide-react';

interface ScheduleStep {
  id?: string;
  modelId: string;
  query: string;
  actionId: string;
  order: number;
}

interface ActionStepResult {
  actionStepIndex?: number;
  actionStepName?: string;
  actionStepType?: string;
  name: string;
  type: string;
  success: boolean;
  error?: string;
  inputs?: any;
  outputs?: any;
  outputFields?: string[];
  tokenUsage?: {
    totalTokens: number;
    inputTokens: number;
    outputTokens: number;
  };
}

interface RecordResult {
  recordId: string;
  success: boolean;
  result?: any;
  error?: string;
  actionSteps?: ActionStepResult[];
  currentActionStep?: number;
  totalActionSteps?: number;
}

interface ExecutionStep {
  step: number;
  stepIndex: number;
  success?: boolean;
  modelName?: string;
  actionName?: string;
  query?: string;
  totalRecords?: number;
  processedRecords?: number;
  recordResults?: RecordResult[];
  error?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  batchProgress?: number;
  completedRecords?: number;
}

interface ScheduleExecutionProps {
  scheduleName: string;
  steps: ScheduleStep[];
  onExecute: () => Promise<{ scheduleId: string }>;
  onComplete?: (success: boolean) => void;
  autoStart?: boolean;
}

export function ScheduleExecution({ 
  scheduleName, 
  steps,
  onExecute,
  onComplete,
  autoStart = false
}: ScheduleExecutionProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set());
  const [executionComplete, setExecutionComplete] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [modalSteps, setModalSteps] = useState<ScheduleStep[]>(steps || []);

  const resetState = () => {
    setIsExecuting(false);
    setExecutionSteps([]);
    setExpandedSteps(new Set());
    setExpandedRecords(new Set());
    setExecutionComplete(false);
    setOverallProgress(0);
    setCurrentStepIndex(-1);
  };

  const handleExecute = async () => {
    if (isExecuting || modalSteps.length === 0) return;
    
    console.log('🚀 Starting execution with steps:', modalSteps);
    setIsExecuting(true);
    setExecutionComplete(false);
    setOverallProgress(0);
    
    // Initialize execution steps
    const initialSteps: ExecutionStep[] = modalSteps.map((step, index) => ({
      step: step.order,
      stepIndex: index,
      status: 'pending' as const,
      modelName: '',
      actionName: '',
      query: step.query || ''
    }));
    setExecutionSteps(initialSteps);

    try {
      // Get the schedule ID to execute
      const { scheduleId } = await onExecute();
      console.log('🚀 Got schedule ID:', scheduleId);

      // Start streaming execution
      const response = await fetch('/api/agent/schedule/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduleId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to start execution: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              handleStreamEvent(data);
            } catch (error) {
              console.error('Error parsing stream data:', error);
            }
          }
        }
      }

    } catch (error) {
      console.error('Execution failed:', error);
      setExecutionComplete(true);
      setIsExecuting(false);
      onComplete?.(false);
    }
  };

  const handleStreamEvent = (data: any) => {
    console.log('📨 Received stream event:', data.type, data);
    
    switch (data.type) {
      case 'start':
        console.log('Execution started');
        break;

      case 'step_start':
        setCurrentStepIndex(data.stepIndex);
        setExecutionSteps(prev => prev.map((step, index) => 
          index === data.stepIndex 
            ? { 
                ...step, 
                status: 'running',
                modelName: data.modelName,
                actionName: data.actionName,
                totalRecords: data.totalRecords || 0,
                processedRecords: 0,
                recordResults: []
              }
            : step
        ));
        break;

      case 'records_found':
        setExecutionSteps(prev => prev.map((step, index) => 
          index === data.stepIndex 
            ? { 
                ...step, 
                totalRecords: data.count,
                recordResults: []
              }
            : step
        ));
        break;

      case 'record_start':
        // Individual record started - initialize action steps tracking
        console.log('📥 Received record_start:', data);
        setExecutionSteps(prev => prev.map((step, index) => {
          if (index === data.stepIndex) {
            const updatedRecordResults = [...(step.recordResults || [])];
            const existingIndex = updatedRecordResults.findIndex(r => r.recordId === data.recordId);
            
            if (existingIndex >= 0) {
              updatedRecordResults[existingIndex] = {
                ...updatedRecordResults[existingIndex],
                actionSteps: [],
                currentActionStep: 0,
                totalActionSteps: 0
              };
            } else {
              updatedRecordResults.push({
                recordId: data.recordId,
                success: false,
                actionSteps: [],
                currentActionStep: 0,
                totalActionSteps: 0
              });
            }

            return { ...step, recordResults: updatedRecordResults };
          }
          return step;
        }));
        break;

      case 'action_step_start':
        // Action step started within a record
        console.log('📥 Received action_step_start:', data);
        setExecutionSteps(prev => prev.map((step, index) => {
          if (index === data.scheduleStepIndex || index === data.stepIndex || index === currentStepIndex) {
            const updatedRecordResults = [...(step.recordResults || [])];
            const recordIndex = updatedRecordResults.findIndex(r => r.recordId === data.recordId);
            
            if (recordIndex >= 0) {
              updatedRecordResults[recordIndex] = {
                ...updatedRecordResults[recordIndex],
                currentActionStep: data.actionStepIndex,
                totalActionSteps: data.totalActionSteps
              };
            }

            return { ...step, recordResults: updatedRecordResults };
          }
          return step;
        }));
        break;

      case 'action_step_complete':
        // Individual action step completed
        console.log('📥 Received action_step_complete:', data);
        setExecutionSteps(prev => prev.map((step, index) => {
          if (index === data.scheduleStepIndex || index === data.stepIndex || index === currentStepIndex) {
            const recordResults = step.recordResults || [];
            const recordIndex = recordResults.findIndex((r: any) => r.recordId === data.recordId);
            
            if (recordIndex >= 0) {
              const actionSteps = recordResults[recordIndex].actionSteps || [];
              const actionStep = {
                name: data.actionStepName,
                type: data.actionStepType,
                success: data.success,
                inputs: data.inputs,
                outputs: data.outputs,
                outputFields: data.outputFields,
                tokenUsage: data.tokenUsage,
                error: data.error
              };
              
              console.log('📥 Adding actionStep:', actionStep);
              
              // Add or update the action step
              const existingStepIndex = actionSteps.findIndex(s => s.name === data.actionStepName);
              let updatedActionSteps;
              if (existingStepIndex >= 0) {
                updatedActionSteps = [...actionSteps];
                updatedActionSteps[existingStepIndex] = actionStep;
              } else {
                updatedActionSteps = [...actionSteps, actionStep];
              }
              
              recordResults[recordIndex] = {
                ...recordResults[recordIndex],
                actionSteps: updatedActionSteps,
                currentActionStep: data.actionStepIndex + 1
              };
            }
            
            return {
              ...step,
              recordResults: [...recordResults]
            };
          }
          return step;
        }));
        break;

      case 'record_complete':
        console.log('📥 Received record_complete:', data);
        setExecutionSteps(prev => prev.map((step, index) => {
          if (index === data.scheduleStepIndex || index === data.stepIndex || index === currentStepIndex) {
            const recordResults = step.recordResults || [];
            const recordIndex = recordResults.findIndex((r: any) => r.recordId === data.recordId);
            
            if (recordIndex >= 0) {
              recordResults[recordIndex] = {
                ...recordResults[recordIndex],
                success: data.success,
                result: data.result,
                error: data.error
              };
            }
            
            return {
              ...step,
              processedRecords: (step.processedRecords || 0) + 1,
              recordResults: [...recordResults]
            };
          }
          return step;
        }));
        break;

      case 'step_complete':
        setExecutionSteps(prev => {
          const updatedSteps = prev.map((step, index) => 
            index === data.stepIndex 
              ? { 
                  ...step, 
                  status: (data.success ? 'completed' : 'failed') as 'completed' | 'failed',
                  success: data.success,
                  error: data.error,
                  totalRecords: data.totalRecords,
                  processedRecords: data.processedRecords,
                  recordResults: step.recordResults || []
                }
              : step
          );
          
          // Auto-expand failed steps or steps with record results
          const completedStep = updatedSteps[data.stepIndex];
          if (!data.success || (completedStep.recordResults && completedStep.recordResults.length > 0)) {
            console.log('🔍 Auto-expanding step', data.stepIndex, 'with', completedStep.recordResults?.length, 'record results');
            setExpandedSteps(prev => new Set([...prev, data.stepIndex]));
          }
          
          return updatedSteps;
        });
        
        // Update overall progress
        const completedSteps = data.stepIndex + 1;
        setOverallProgress((completedSteps / modalSteps.length) * 100);
        break;

      case 'complete':
        setExecutionComplete(true);
        setCurrentStepIndex(-1);
        setOverallProgress(100);
        setIsExecuting(false);
        onComplete?.(true);
        break;

      case 'error':
        console.error('Execution error:', data.error);
        setExecutionComplete(true);
        setIsExecuting(false);
        onComplete?.(false);
        break;
    }
  };

  const toggleStepExpanded = (stepIndex: number) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepIndex)) {
        newSet.delete(stepIndex);
      } else {
        newSet.add(stepIndex);
      }
      return newSet;
    });
  };

  const toggleRecordExpanded = (recordId: string) => {
    setExpandedRecords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recordId)) {
        newSet.delete(recordId);
      } else {
        newSet.add(recordId);
      }
      return newSet;
    });
  };

  const getStepStatus = (stepIndex: number) => {
    const step = executionSteps[stepIndex];
    if (!step) return 'pending';
    return step.status;
  };

  const getOverallStatus = () => {
    if (!executionComplete && isExecuting) return 'running';
    if (!executionComplete) return 'pending';
    
    const hasFailures = executionSteps.some(step => step.status === 'failed');
    const hasPartialFailures = executionSteps.some(step => 
      step.status === 'completed' && step.recordResults?.some(r => !r.success)
    );
    
    if (hasFailures) return 'failed';
    if (hasPartialFailures) return 'partial';
    return 'completed';
  };

  useEffect(() => {
    if (steps && steps.length > 0) {
      setModalSteps([...steps]);
      if (!isExecuting && !executionComplete) {
        resetState();
      }
    }
  }, [steps, isExecuting, executionComplete]);

  // Auto-start execution if requested
  useEffect(() => {
    if (autoStart && modalSteps.length > 0 && !isExecuting && !executionComplete) {
      handleExecute();
    }
  }, [autoStart, modalSteps.length, isExecuting, executionComplete]);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Start Button (if not auto-started) */}
      {!autoStart && !isExecuting && !executionComplete && (
        <div className="flex justify-center">
          <Button 
            onClick={handleExecute}
            disabled={modalSteps.length === 0}
            className="gap-2"
          >
            <PlayIcon className="h-4 w-4" />
            Execute {scheduleName}
          </Button>
        </div>
      )}

      {/* Show execution UI once started */}
      {(isExecuting || executionComplete) && (
        <>
          {/* Overall Progress */}
          <Card>
            <CardContent className="pt-3 sm:pt-4">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <div className="flex items-center gap-2">
                    {getOverallStatus() === 'running' && <LoaderIcon className="h-4 w-4 animate-spin" />}
                    {getOverallStatus() === 'completed' && <CheckCircleIcon className="h-4 w-4 text-green-500" />}
                    {getOverallStatus() === 'failed' && <XCircleIcon className="h-4 w-4 text-red-500" />}
                    {getOverallStatus() === 'partial' && <XCircleIcon className="h-4 w-4 text-yellow-500" />}
                    <span className="text-xs sm:text-sm">
                      {executionComplete ? (
                        `${executionSteps.filter(step => step.status === 'completed').length}/${modalSteps.length} steps completed`
                      ) : (
                        `${Math.floor(overallProgress)}% complete`
                      )}
                    </span>
                  </div>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Steps List */}
          <Card>
            <CardContent className="pt-3 sm:pt-4">
              <ScrollArea className="h-64 sm:h-96">
                <div className="space-y-2 pr-3">
                  {modalSteps.length === 0 ? (
                    <div className="text-center py-6 sm:py-8 text-muted-foreground">
                      <ClockIcon className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
                      <p className="font-medium">No steps to execute</p>
                      <p className="text-sm mt-1">This schedule has no configured steps.</p>
                    </div>
                  ) : (
                    modalSteps.map((step, index) => {
                      const status = getStepStatus(index);
                      const executionStep = executionSteps[index];
                      const isExpanded = expandedSteps.has(index);
                      
                      return (
                        <div key={index} className="border rounded-lg overflow-visible">
                          <div 
                            className="p-2 sm:p-3 cursor-pointer flex items-start justify-between hover:bg-muted/50 gap-2"
                            onClick={() => toggleStepExpanded(index)}
                          >
                            <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                              {/* Status Icon */}
                              {status === 'pending' && <ClockIcon className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />}
                              {status === 'running' && <LoaderIcon className="h-4 w-4 animate-spin text-blue-500 flex-shrink-0 mt-0.5" />}
                              {status === 'completed' && <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />}
                              {status === 'failed' && <XCircleIcon className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />}
                              
                              {/* Step Info */}
                              <div className="flex-1 min-w-0 overflow-visible">
                                <div className="flex flex-col gap-1.5">
                                  <span className="font-medium text-sm">Step {index + 1}</span>
                                  {executionStep?.modelName && (
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <Badge variant="outline" className="text-xs whitespace-nowrap">
                                        {executionStep.modelName}
                                      </Badge>
                                      <span className="text-sm text-muted-foreground">→</span>
                                      <Badge variant="outline" className="text-xs whitespace-nowrap">
                                        {executionStep.actionName}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                                {step.query && (
                                  <div className="flex items-start gap-1.5 mt-1.5 text-xs text-muted-foreground">
                                    <SearchIcon className="h-3 w-3 flex-shrink-0 mt-0.5" />
                                    <span className="break-words leading-relaxed">{step.query}</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Results Summary */}
                              {executionStep && (
                                <div className="text-xs text-muted-foreground text-right flex-shrink-0 min-w-0">
                                  {/* Show batch progress for running steps */}
                                  {status === 'running' && executionStep.batchProgress !== undefined && executionStep.completedRecords !== undefined && executionStep.totalRecords !== undefined && (
                                    <div className="space-y-1">
                                      <div className="whitespace-nowrap">{executionStep.completedRecords}/{executionStep.totalRecords}</div>
                                      <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-blue-500 transition-all duration-300"
                                          style={{ width: `${executionStep.batchProgress}%` }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Show final results for completed steps */}
                                  {status !== 'running' && executionStep.processedRecords !== undefined && executionStep.totalRecords !== undefined && (
                                    <div className="whitespace-nowrap">{executionStep.processedRecords}/{executionStep.totalRecords}</div>
                                  )}
                                  
                                  {executionStep.recordResults && (
                                    <div className="flex items-center gap-1 mt-1 justify-end">
                                      <CheckCircleIcon className="h-3 w-3 text-green-500" />
                                      <span>{executionStep.recordResults.filter(r => r.success).length}</span>
                                      <XCircleIcon className="h-3 w-3 text-red-500" />
                                      <span>{executionStep.recordResults.filter(r => !r.success).length}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-start gap-1 flex-shrink-0 ml-1">
                              {executionStep && (
                                <>
                                  {isExpanded ? (
                                    <ChevronDownIcon className="h-4 w-4 mt-0.5" />
                                  ) : (
                                    <ChevronRightIcon className="h-4 w-4 mt-0.5" />
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                          
                          {/* Expanded Details */}
                          {isExpanded && executionStep && (
                            <div className="px-2 sm:px-3 pb-2 sm:pb-3 border-t bg-muted/20">
                              <div className="space-y-2 mt-2 sm:mt-3">
                                {executionStep.error && (
                                  <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700 break-words">
                                    <strong>Error:</strong> {executionStep.error}
                                  </div>
                                )}
                                
                                {executionStep.recordResults && executionStep.recordResults.length > 0 && (
                                  <div className="space-y-2">
                                    <h5 className="text-sm font-medium flex items-center gap-1">
                                      <DatabaseIcon className="h-4 w-4" />
                                      Record Results ({executionStep.recordResults.length})
                                    </h5>
                                    <div className="space-y-1 max-h-64 sm:max-h-96 overflow-y-auto">
                                      {executionStep.recordResults.map((recordResult, recordIndex) => {
                                        const isRecordExpanded = expandedRecords.has(recordResult.recordId);
                                        
                                        return (
                                          <div 
                                            key={recordIndex}
                                            className="bg-background rounded border"
                                          >
                                            {/* Record Header */}
                                            <div 
                                              className="flex items-center justify-between p-2 text-xs cursor-pointer hover:bg-muted/50"
                                              onClick={() => toggleRecordExpanded(recordResult.recordId)}
                                            >
                                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                                {recordResult.success ? (
                                                  <CheckCircleIcon className="h-3 w-3 text-green-500 flex-shrink-0" />
                                                ) : recordResult.currentActionStep !== undefined ? (
                                                  <LoaderIcon className="h-3 w-3 animate-spin text-blue-500 flex-shrink-0" />
                                                ) : (
                                                  <XCircleIcon className="h-3 w-3 text-red-500 flex-shrink-0" />
                                                )}
                                                <code className="text-xs break-all">{recordResult.recordId}</code>
                                                {isRecordExpanded ? (
                                                  <ChevronDownIcon className="h-3 w-3 flex-shrink-0 ml-auto" />
                                                ) : (
                                                  <ChevronRightIcon className="h-3 w-3 flex-shrink-0 ml-auto" />
                                                )}
                                              </div>
                                              <div className="flex items-center gap-2 flex-shrink-0">
                                                {/* Action Steps Progress */}
                                                {recordResult.totalActionSteps && recordResult.currentActionStep !== undefined && (
                                                  <div className="flex items-center gap-1">
                                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                      {recordResult.currentActionStep}/{recordResult.totalActionSteps}
                                                    </span>
                                                  </div>
                                                )}
                                              </div>
                                            </div>

                                            {/* Expanded Record Details */}
                                            {isRecordExpanded && (
                                              <div className="border-t bg-muted/10">
                                                {recordResult.error && (
                                                  <div className="p-2">
                                                    <div className="p-1.5 bg-red-50 border border-red-200 rounded text-xs text-red-600 break-words">
                                                      <strong>Error:</strong> {recordResult.error}
                                                    </div>
                                                  </div>
                                                )}
                                                
                                                {recordResult.actionSteps && recordResult.actionSteps.length > 0 && (
                                                  <div className="p-2 space-y-2">
                                                    <h6 className="text-xs font-medium text-muted-foreground">Action Steps:</h6>
                                                    {recordResult.actionSteps.map((actionStep, actionStepIndex) => (
                                                      <div 
                                                        key={actionStepIndex}
                                                        className="border rounded p-2 bg-background space-y-2"
                                                      >
                                                        {/* Action Step Header */}
                                                        <div className="flex flex-col gap-2">
                                                          <div className="flex items-center gap-2 min-w-0 flex-wrap">
                                                            {actionStep.success ? (
                                                              <CheckCircleIcon className="h-3 w-3 text-green-500 flex-shrink-0" />
                                                            ) : (
                                                              <XCircleIcon className="h-3 w-3 text-red-500 flex-shrink-0" />
                                                            )}
                                                            <span className="text-xs font-medium break-words">
                                                              {actionStep.name}
                                                            </span>
                                                            <Badge variant="outline" className="text-xs px-1 py-0 flex-shrink-0 whitespace-nowrap">
                                                              {actionStep.type}
                                                            </Badge>
                                                          </div>
                                                          {actionStep.error && (
                                                            <span className="text-red-600 text-xs break-words">
                                                              {actionStep.error}
                                                            </span>
                                                          )}
                                                        </div>

                                                        {/* Inputs */}
                                                        {actionStep.inputs && Object.keys(actionStep.inputs).length > 0 && (
                                                          <div className="space-y-1">
                                                            <h6 className="text-xs font-medium text-blue-600">Inputs:</h6>
                                                            <div className="bg-blue-50 rounded p-2 text-xs border border-blue-200">
                                                              <pre className="whitespace-pre-wrap font-mono text-xs text-blue-800 break-words">
                                                                {JSON.stringify(actionStep.inputs, null, 2)}
                                                              </pre>
                                                            </div>
                                                          </div>
                                                        )}

                                                        {/* Outputs */}
                                                        {actionStep.outputs && Object.keys(actionStep.outputs).length > 0 && (
                                                          <div className="space-y-1">
                                                            <h6 className="text-xs font-medium text-green-600">Outputs:</h6>
                                                            <div className="bg-green-50 rounded p-2 text-xs border border-green-200">
                                                              <pre className="whitespace-pre-wrap font-mono text-xs text-green-800 break-words">
                                                                {JSON.stringify(actionStep.outputs, null, 2)}
                                                              </pre>
                                                            </div>
                                                          </div>
                                                        )}

                                                        {/* Token Usage */}
                                                        {actionStep.tokenUsage && (
                                                          <div className="space-y-1">
                                                            <h6 className="text-xs font-medium text-purple-600">Token Usage:</h6>
                                                            <div className="bg-purple-50 rounded p-2 text-xs border border-purple-200">
                                                              <pre className="whitespace-pre-wrap font-mono text-xs text-purple-800 break-words">
                                                                {JSON.stringify(actionStep.tokenUsage, null, 2)}
                                                              </pre>
                                                            </div>
                                                          </div>
                                                        )}
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}

      {/* Completion Message */}
      {executionComplete && (
        <div className={`p-3 sm:p-4 rounded-lg border ${
          getOverallStatus() === 'completed' 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-start gap-2 sm:gap-3">
            {getOverallStatus() === 'completed' ? (
              <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p className={`text-xs sm:text-sm font-medium ${
                getOverallStatus() === 'completed' 
                  ? 'text-green-900 dark:text-green-100'
                  : 'text-red-900 dark:text-red-100'
              }`}>
                {getOverallStatus() === 'completed' 
                  ? 'Schedule executed successfully!'
                  : 'Schedule execution completed with errors'
                }
              </p>
              <p className={`text-xs sm:text-sm mt-1 ${
                getOverallStatus() === 'completed' 
                  ? 'text-green-700 dark:text-green-200'
                  : 'text-red-700 dark:text-red-200'
              }`}>
                {getOverallStatus() === 'completed' 
                  ? 'Your agent has processed records and generated new content. Check the Records tab to see the results.'
                  : 'Some steps failed during execution. Check the expanded details above for more information.'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 