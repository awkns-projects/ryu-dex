'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayCircleIcon, Loader2Icon, CheckCircleIcon, XCircleIcon, AlertCircleIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ScheduleFilter {
  field: string;
  operator: string;
  value: any;
}

interface ScheduleQuery {
  filters: ScheduleFilter[];
  logic: 'AND' | 'OR';
}

interface ScheduleStep {
  id?: string;
  modelId: string;
  modelName?: string;
  query?: ScheduleQuery | string;  // NEW: Structured query OR legacy string
  actionId: string;
  actionName?: string;
  order: number;
}

interface StepExecution {
  step: ScheduleStep;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;
  error?: string;
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
  onExecute,
}: ScheduleExecutionModalProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [stepExecutions, setStepExecutions] = useState<StepExecution[]>([]);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');

  const handleExecute = async () => {
    setIsExecuting(true);
    setOverallStatus('running');

    // Initialize step executions
    const initialExecutions: StepExecution[] = steps.map(step => ({
      step,
      status: 'pending',
    }));
    setStepExecutions(initialExecutions);

    try {
      // Create/get the schedule and get the scheduleId
      const { scheduleId } = await onExecute();

      // Start the execution streaming
      const response = await fetch('/api/agent/schedule/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduleId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to execute schedule: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue;

          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'step_start') {
              setStepExecutions(prev =>
                prev.map((exec, idx) =>
                  idx === data.stepIndex
                    ? { ...exec, status: 'running' }
                    : exec
                )
              );
            } else if (data.type === 'step_complete') {
              setStepExecutions(prev =>
                prev.map((exec, idx) =>
                  idx === data.stepIndex
                    ? { ...exec, status: 'completed', output: data.result }
                    : exec
                )
              );
            } else if (data.type === 'step_error') {
              setStepExecutions(prev =>
                prev.map((exec, idx) =>
                  idx === data.stepIndex
                    ? { ...exec, status: 'failed', error: data.error }
                    : exec
                )
              );
            } else if (data.type === 'complete') {
              setOverallStatus('completed');
            } else if (data.type === 'error') {
              setOverallStatus('failed');
            }
          } catch (err) {
            console.error('Failed to parse streaming data:', err);
          }
        }
      }

      setOverallStatus('completed');
    } catch (error) {
      console.error('Execution failed:', error);
      setOverallStatus('failed');
      setStepExecutions(prev =>
        prev.map(exec => exec.status === 'running' ? { ...exec, status: 'failed', error: String(error) } : exec)
      );
    } finally {
      setIsExecuting(false);
    }
  };

  const handleClose = () => {
    if (!isExecuting) {
      // Reset state before closing
      setStepExecutions([]);
      setOverallStatus('idle');
      onClose();
    }
  };

  const getStatusIcon = (status: StepExecution['status']) => {
    switch (status) {
      case 'pending':
        return <div className="h-4 w-4 rounded-full border-2 border-muted" />;
      case 'running':
        return <Loader2Icon className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlayCircleIcon className="h-5 w-5" />
            Execute Schedule: {scheduleName}
          </DialogTitle>
          <DialogDescription>
            {overallStatus === 'idle' && `Ready to execute ${steps.length} step${steps.length !== 1 ? 's' : ''}`}
            {overallStatus === 'running' && 'Execution in progress...'}
            {overallStatus === 'completed' && 'Execution completed successfully'}
            {overallStatus === 'failed' && 'Execution failed'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          {stepExecutions.length > 0 ? (
            <div className="space-y-3">
              {stepExecutions.map((execution, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getStatusIcon(execution.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          Step {index + 1}
                        </Badge>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {execution.status}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">
                        {execution.step.modelName || `Model ${execution.step.modelId.slice(0, 8)}`}
                      </p>
                      {execution.step.query && (
                        <p className="text-xs text-muted-foreground italic mt-1">
                          "{typeof execution.step.query === 'string' ? execution.step.query : JSON.stringify(execution.step.query)}"
                        </p>
                      )}
                      {execution.step.actionName && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Action: {execution.step.actionName}
                        </p>
                      )}
                      {execution.output && (
                        <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                          <p className="text-muted-foreground mb-1">Output:</p>
                          <p className="whitespace-pre-wrap">{execution.output}</p>
                        </div>
                      )}
                      {execution.error && (
                        <div className="mt-2 p-2 bg-destructive/10 rounded text-xs">
                          <p className="text-destructive mb-1">Error:</p>
                          <p className="text-destructive whitespace-pre-wrap">{execution.error}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-3">Preview:</p>
              {steps.map((step, index) => (
                <div key={index} className="border rounded-lg p-3 bg-muted/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      Step {index + 1}
                    </Badge>
                  </div>
                  <p className="text-sm">
                    {step.modelName || `Model ${step.modelId.slice(0, 8)}`}
                  </p>
                  {step.query && (
                    <p className="text-xs text-muted-foreground italic mt-1">
                      "{typeof step.query === 'string' ? step.query : JSON.stringify(step.query)}"
                    </p>
                  )}
                  {step.actionName && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Action: {step.actionName}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {overallStatus === 'completed' && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircleIcon className="h-4 w-4" />
                  Success
                </div>
              )}
              {overallStatus === 'failed' && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircleIcon className="h-4 w-4" />
                  Failed
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} disabled={isExecuting}>
                {overallStatus === 'idle' ? 'Cancel' : 'Close'}
              </Button>
              {overallStatus === 'idle' && (
                <Button onClick={handleExecute} disabled={isExecuting || steps.length === 0}>
                  {isExecuting ? (
                    <>
                      <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <PlayCircleIcon className="h-4 w-4 mr-2" />
                      Execute
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

