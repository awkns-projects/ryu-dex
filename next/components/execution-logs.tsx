'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2Icon, CheckCircleIcon, XCircleIcon, ClockIcon } from 'lucide-react';

interface ExecutionLog {
  id: string;
  scheduleId: string;
  status: 'success' | 'failed' | 'running';
  startedAt: string;
  completedAt?: string;
  output?: string;
  error?: string;
  createdAt: string;
}

interface ExecutionLogsProps {
  title?: string;
  fetchUrl: string;
  emptyMessage?: string;
  refreshKey?: number; // Add a key to trigger refresh
}

export function ExecutionLogs({
  title = 'Execution History',
  fetchUrl,
  emptyMessage = 'No executions found',
  refreshKey = 0
}: ExecutionLogsProps) {
  const [executions, setExecutions] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExecutions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(fetchUrl);

        if (!response.ok) {
          throw new Error('Failed to fetch execution logs');
        }

        const data = await response.json();
        setExecutions(data.executions || []);
      } catch (err) {
        console.error('Failed to fetch execution logs:', err);
        setError(err instanceof Error ? err.message : 'Failed to load execution logs');
      } finally {
        setLoading(false);
      }
    };

    fetchExecutions();
  }, [fetchUrl, refreshKey]);

  const getStatusIcon = (status: ExecutionLog['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Loader2Icon className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: ExecutionLog['status']) => {
    const variants: Record<ExecutionLog['status'], 'default' | 'destructive' | 'secondary'> = {
      success: 'default',
      failed: 'destructive',
      running: 'secondary',
    };

    return (
      <Badge variant={variants[status]} className="text-xs capitalize">
        {status}
      </Badge>
    );
  };

  const formatDuration = (startedAt: string, completedAt?: string) => {
    const start = new Date(startedAt);
    const end = completedAt ? new Date(completedAt) : new Date();
    const duration = Math.abs(end.getTime() - start.getTime());

    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <Card className="border-none">
      <CardHeader className="px-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClockIcon className="h-4 w-4" />
          {title}
        </CardTitle>
        <CardDescription className="text-sm">
          View past execution logs and results
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <XCircleIcon className="h-8 w-8 mx-auto mb-2 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : executions.length > 0 ? (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3 pr-4">
              {executions.map((execution) => (
                <div key={execution.id} className="border rounded-lg p-3 bg-card">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(execution.status)}
                      {getStatusBadge(execution.status)}
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      {new Date(execution.startedAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    {execution.completedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">
                          {formatDuration(execution.startedAt, execution.completedAt)}
                        </span>
                      </div>
                    )}

                    {execution.output && (
                      <div className="mt-2 p-2 bg-muted/50 rounded">
                        <p className="text-muted-foreground mb-1">Output:</p>
                        <p className="whitespace-pre-wrap text-foreground">
                          {execution.output}
                        </p>
                      </div>
                    )}

                    {execution.error && (
                      <div className="mt-2 p-2 bg-destructive/10 rounded">
                        <p className="text-destructive mb-1">Error:</p>
                        <p className="text-destructive whitespace-pre-wrap">
                          {execution.error}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8">
            <ClockIcon className="h-8 w-8 mx-auto mb-2 opacity-50 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

