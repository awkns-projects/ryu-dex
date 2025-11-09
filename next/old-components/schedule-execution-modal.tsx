'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
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

interface ScheduleExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleName: string;
  steps: ScheduleStep[];
  onExecute: () => Promise<{ scheduleId: string }>;
}

export function ScheduleExecutionModal({ 
  isOpen, 
  onClose, 
  scheduleName, 
  steps,
  onExecute 
}: ScheduleExecutionModalProps) {
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
    // Don't reset modalSteps here - we want to keep them
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setExecutionComplete(false);
    setOverallProgress(0);
    setCurrentStepIndex(-1);

    // Initialize steps
    const initialSteps: ExecutionStep[] = modalSteps.map((step, index) => ({
      step: step.order,
      stepIndex: index,
      status: 'pending',
      modelName: '',
      actionName: '',
      query: step.query
    }));
    setExecutionSteps(initialSteps);

    try {
      // Get schedule ID from the execution function
      const { scheduleId } = await onExecute();
      
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
    } finally {
      setIsExecuting(false);
    }
  };

  const handleStreamEvent = (data: any) => {
    console.log('📨 Received stream event:', data.type, data);
    switch (data.type) {
      case 'start':
        console.log('Execution started:', data);
        break;

      case 'step_start':
        console.log('📥 Received step_start:', data);
        setCurrentStepIndex(data.stepIndex);
        setExecutionSteps(prev => {
          console.log('📥 step_start: Previous executionSteps:', prev);
          const updated = prev.map((step, index) => {
            if (index === data.stepIndex) {
              const updatedStep: ExecutionStep = {
                ...step,
                status: 'running' as const,
                modelName: data.modelName,
                actionName: data.actionName,
                recordResults: [] // Initialize empty record results
              };
              console.log('📥 step_start: Updated step at index', index, ':', updatedStep);
              return updatedStep;
            }
            return step;
          });
          console.log('📥 step_start: All updated steps:', updated);
          return updated;
        });
        break;

      case 'records_found':
        setExecutionSteps(prev => prev.map((step, index) => 
          index === data.stepIndex 
            ? { ...step, totalRecords: data.totalRecords }
            : step
        ));
        break;

      case 'records_filtered':
        setExecutionSteps(prev => prev.map((step, index) => 
          index === data.stepIndex 
            ? { ...step, processedRecords: data.processedRecords }
            : step
        ));
        break;

      case 'batch_start':
        // Batch processing started - could show batch indicator
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
          if (index === data.scheduleStepIndex) {
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
        // Action step completed within a record
        console.log('📥 Received action_step_complete:', data);
        
        setExecutionSteps(prev => {
          return prev.map((step, index) => {
            if (index === data.scheduleStepIndex) {
              const updatedRecordResults = [...(step.recordResults || [])];
              const recordIndex = updatedRecordResults.findIndex(r => r.recordId === data.recordId);
              
              if (recordIndex >= 0) {
                const existingActionSteps = updatedRecordResults[recordIndex].actionSteps || [];
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
                const existingStepIndex = existingActionSteps.findIndex(s => s.name === data.actionStepName);
                let updatedActionSteps;
                if (existingStepIndex >= 0) {
                  updatedActionSteps = [...existingActionSteps];
                  updatedActionSteps[existingStepIndex] = actionStep;
                } else {
                  updatedActionSteps = [...existingActionSteps, actionStep];
                }

                const updatedRecord = {
                  ...updatedRecordResults[recordIndex],
                  actionSteps: updatedActionSteps,
                  currentActionStep: data.actionStepIndex + 1
                };
                
                updatedRecordResults[recordIndex] = updatedRecord;
                console.log('📥 Updated record with actionSteps:', updatedRecord.actionSteps?.length || 0, 'steps');
              }

              return { ...step, recordResults: updatedRecordResults };
            }
            return step;
          });
        });
        break;

      case 'record_complete':
        setExecutionSteps(prev => prev.map((step, index) => {
          if (index === data.stepIndex) {
            const updatedRecordResults = [...(step.recordResults || [])];
            const existingIndex = updatedRecordResults.findIndex(r => r.recordId === data.recordId);
            
            if (existingIndex >= 0) {
              // Preserve existing action steps data when updating record completion status
              const existingRecord = updatedRecordResults[existingIndex];
              updatedRecordResults[existingIndex] = {
                ...existingRecord,
                success: data.success,
                error: data.error
              };
            } else {
              // Create new record result if it doesn't exist
              const recordResult: RecordResult = {
                recordId: data.recordId,
                success: data.success,
                error: data.error
              };
              updatedRecordResults.push(recordResult);
            }

            return { ...step, recordResults: updatedRecordResults };
          }
          return step;
        }));
        break;

      case 'batch_progress':
        // Update step with batch progress information
        setExecutionSteps(prev => prev.map((step, index) => 
          index === data.stepIndex 
            ? { 
                ...step, 
                batchProgress: data.progress,
                completedRecords: data.completed,
                totalRecords: data.total
              }
            : step
        ));
        break;

      case 'step_complete':
        setExecutionSteps(prev => prev.map((step, index) => 
          index === data.stepIndex 
            ? { 
                ...step, 
                status: data.success ? 'completed' : 'failed',
                success: data.success,
                error: data.error,
                totalRecords: data.totalRecords,
                processedRecords: data.processedRecords,
                // Preserve existing recordResults with action step data
                recordResults: step.recordResults || []
              }
            : step
        ));
        
        // Update overall progress
        const completedSteps = data.stepIndex + 1;
        setOverallProgress((completedSteps / modalSteps.length) * 100);
        
        // Auto-expand failed steps or steps with detailed action step data
        if (!data.success || data.recordResults?.some((r: RecordResult) => !r.success || (r.actionSteps && r.actionSteps.length > 0))) {
          setExpandedSteps(prev => new Set([...prev, data.stepIndex]));
        }
        break;

      case 'complete':
        setExecutionComplete(true);
        setCurrentStepIndex(-1);
        setOverallProgress(100);
        break;

      case 'error':
        console.error('Execution error:', data.error);
        setExecutionComplete(true);
        setIsExecuting(false);
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
    console.log('🔄 Toggling record expansion for:', recordId);
    setExpandedRecords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recordId)) {
        console.log('🔄 Collapsing record:', recordId);
        newSet.delete(recordId);
      } else {
        console.log('🔄 Expanding record:', recordId);
        newSet.add(recordId);
      }
      console.log('🔄 New expanded records set:', Array.from(newSet));
      return newSet;
    });
  };

  const handleClose = () => {
    resetState();
    onClose();
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
    console.log('🔍 Modal useEffect triggered - isOpen:', isOpen, 'steps:', steps, 'steps.length:', steps?.length);
    if (isOpen && steps && steps.length > 0) {
      console.log('🔍 Modal opening - setting modalSteps to:', steps);
      setModalSteps([...steps]);
      if (!isExecuting && !executionComplete) {
        resetState();
      }
    }
  }, [isOpen, isExecuting, executionComplete]);

  // Separate effect to update steps when they change (with stable dependencies)
  useEffect(() => {
    const stepsLength = steps?.length || 0;
    console.log('🔍 Steps prop changed:', steps, 'length:', stepsLength);
    if (stepsLength > 0 && !isExecuting && modalSteps.length === 0) {
      console.log('🔍 Updating modalSteps to:', steps);
      setModalSteps([...steps]);
    }
  }, [steps?.length, isExecuting, modalSteps.length]);

  console.log('🔍 Rendering modal - modalSteps:', modalSteps, 'props steps:', steps);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[95vh] sm:max-h-[80vh] overflow-hidden p-3 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <PlayIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="truncate">Execute Schedule: {scheduleName}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 sm:space-y-4">
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
                <div className="space-y-2">
                  {(() => {
                    console.log('🔍 Rendering - modalSteps.length:', modalSteps.length, 'modalSteps:', modalSteps);
                    return modalSteps.length === 0;
                  })() ? (
                    <div className="text-center py-6 sm:py-8 text-muted-foreground">
                      <ClockIcon className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
                      <p className="font-medium">No steps to execute</p>
                      <p className="text-sm mt-1">This schedule has no configured steps.</p>
                      <div className="text-xs mt-2 p-2 bg-blue-50 rounded border max-w-sm mx-auto">
                        <p className="font-medium text-blue-700">Debug Info:</p>
                        <p>Props steps length: {steps.length}</p>
                        <p>Modal steps length: {modalSteps.length}</p>
                        <p>Steps data: {JSON.stringify(steps.slice(0, 1))}</p>
                      </div>
                      <p className="text-xs mt-2 text-blue-600">
                        Close this modal and add steps to the schedule first:
                      </p>
                      <div className="text-xs mt-1 space-y-1 text-left max-w-xs mx-auto">
                        <p>1. Click "Add Step" in the schedule form</p>
                        <p>2. Select a Model and Action</p>
                        <p>3. Configure the query (optional)</p>
                        <p>4. Then try "Run Now" again</p>
                      </div>
                    </div>
                  ) : (
                    modalSteps.map((step, index) => {
                    const status = getStepStatus(index);
                    const executionStep = executionSteps[index];
                    const isExpanded = expandedSteps.has(index);
                    
                    return (
                      <div key={index} className="border rounded-lg">
                        <div 
                          className="p-2 sm:p-3 cursor-pointer flex items-center justify-between hover:bg-muted/50"
                          onClick={() => toggleStepExpanded(index)}
                        >
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            {/* Status Icon */}
                            {status === 'pending' && <ClockIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                            {status === 'running' && <LoaderIcon className="h-4 w-4 animate-spin text-blue-500 flex-shrink-0" />}
                            {status === 'completed' && <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />}
                            {status === 'failed' && <XCircleIcon className="h-4 w-4 text-red-500 flex-shrink-0" />}
                            
                            {/* Step Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <span className="font-medium">Step {index + 1}</span>
                                {executionStep?.modelName && (
                                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                    <Badge variant="outline" className="text-xs">
                                      {executionStep.modelName}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground hidden sm:inline">→</span>
                                    <Badge variant="outline" className="text-xs">
                                      {executionStep.actionName}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                              {step.query && (
                                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                  <SearchIcon className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{step.query}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Results Summary */}
                            {executionStep && (
                              <div className="text-xs text-muted-foreground text-right flex-shrink-0">
                                {/* Show batch progress for running steps */}
                                {status === 'running' && executionStep.batchProgress !== undefined && executionStep.completedRecords !== undefined && executionStep.totalRecords !== undefined && (
                                  <div className="space-y-1">
                                    <div className="whitespace-nowrap">{executionStep.completedRecords}/{executionStep.totalRecords} records</div>
                                    <div className="w-12 sm:w-16 h-1 bg-muted rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-blue-500 transition-all duration-300"
                                        style={{ width: `${executionStep.batchProgress}%` }}
                                      />
                                    </div>
                                  </div>
                                )}
                                
                                {/* Show final results for completed steps */}
                                {status !== 'running' && executionStep.processedRecords !== undefined && executionStep.totalRecords !== undefined && (
                                  <div className="whitespace-nowrap">{executionStep.processedRecords}/{executionStep.totalRecords} records</div>
                                )}
                                
                                {executionStep.recordResults && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <CheckCircleIcon className="h-3 w-3 text-green-500" />
                                    <span>{executionStep.recordResults.filter(r => r.success).length}</span>
                                    <XCircleIcon className="h-3 w-3 text-red-500" />
                                    <span>{executionStep.recordResults.filter(r => !r.success).length}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {executionStep && (
                              <>
                                {isExpanded ? (
                                  <ChevronDownIcon className="h-4 w-4" />
                                ) : (
                                  <ChevronRightIcon className="h-4 w-4" />
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
                                      console.log(`🔍 Record ${recordResult.recordId} isExpanded: ${isRecordExpanded}`);

                                      
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
                                              <code className="text-xs truncate">{recordResult.recordId}</code>
                                              {isRecordExpanded ? (
                                                <ChevronDownIcon className="h-3 w-3 flex-shrink-0" />
                                              ) : (
                                                <ChevronRightIcon className="h-3 w-3 flex-shrink-0" />
                                              )}
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                              {/* Action Steps Progress */}
                                              {recordResult.totalActionSteps && recordResult.currentActionStep !== undefined && (
                                                <div className="flex items-center gap-1">
                                                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {recordResult.currentActionStep}/{recordResult.totalActionSteps}
                                                  </span>
                                                  <div className="w-6 sm:w-8 h-1 bg-muted rounded-full overflow-hidden">
                                                    <div 
                                                      className="h-full bg-blue-500 transition-all duration-300"
                                                      style={{ 
                                                        width: `${(recordResult.currentActionStep / recordResult.totalActionSteps) * 100}%` 
                                                      }}
                                                    />
                                                  </div>
                                                </div>
                                              )}
                                              {recordResult.error && (
                                                <span className="text-red-600 truncate max-w-[100px] sm:max-w-xs">
                                                  {recordResult.error}
                                                </span>
                                              )}
                                            </div>
                                          </div>

                                          {/* Expanded Record Details */}
                                          {isRecordExpanded && (
                                            <div className="border-t bg-muted/10">
                                              {/* Action Steps Details */}
                                              {(() => {
                                                console.log('🔍 Rendering expanded record:', recordResult.recordId);
                                                console.log('🔍 Record actionSteps:', recordResult.actionSteps);
                                                console.log('🔍 Action steps length:', recordResult.actionSteps?.length || 0);
                                                return null;
                                              })()}
                                              {recordResult.actionSteps && recordResult.actionSteps.length > 0 && (
                                                <div className="p-2 space-y-2">
                                                  <h6 className="text-xs font-medium text-muted-foreground">Action Steps:</h6>
                                                  {recordResult.actionSteps.map((actionStep, actionStepIndex) => {
                                                    console.log('🔍 Rendering action step:', actionStepIndex, actionStep);
                                                    return (
                                                    <div 
                                                      key={actionStepIndex}
                                                      className="border rounded p-2 bg-background space-y-2"
                                                    >
                                                      {/* Action Step Header */}
                                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                          {actionStep.success ? (
                                                            <CheckCircleIcon className="h-3 w-3 text-green-500 flex-shrink-0" />
                                                          ) : (
                                                            <XCircleIcon className="h-3 w-3 text-red-500 flex-shrink-0" />
                                                          )}
                                                          <span className="text-xs font-medium truncate">
                                                            {actionStep.name}
                                                          </span>
                                                          <Badge variant="outline" className="text-xs px-1 py-0 flex-shrink-0">
                                                            {actionStep.type}
                                                          </Badge>
                                                        </div>
                                                        {actionStep.error && (
                                                          <span className="text-red-600 text-xs truncate max-w-full sm:max-w-xs">
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
                                                    );
                                                  })}
                                                </div>
                                              )}
                                              
                                              {/* Show current running action step */}
                                              {recordResult.currentActionStep !== undefined && 
                                               recordResult.currentActionStep < (recordResult.totalActionSteps || 0) &&
                                               !recordResult.success && (
                                                <div className="p-2 border-t">
                                                  <div className="flex items-center gap-2 text-xs py-1 text-blue-600">
                                                    <LoaderIcon className="h-3 w-3 animate-spin flex-shrink-0" />
                                                    <span>Running action step {recordResult.currentActionStep + 1}...</span>
                                                  </div>
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
                  }))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-2">
            <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
              {executionComplete ? 'Close' : 'Cancel'}
            </Button>
            {!isExecuting && !executionComplete && (
              <Button onClick={handleExecute} className="gap-2 w-full sm:w-auto">
                <PlayIcon className="h-4 w-4" />
                Start Execution
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 