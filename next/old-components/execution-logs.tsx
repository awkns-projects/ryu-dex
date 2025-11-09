'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircleIcon, XCircleIcon, ClockIcon, PlayIcon, AlertCircleIcon } from 'lucide-react';

interface ExecutionRecord {
  execution: {
    id: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    result: any;
    error: string | null;
    createdAt: string;
    completedAt: string | null;
  };
  record: {
    id: string;
    data: any;
  };
  action: {
    id: string;
    name: string;
  };
}

interface ExecutionLogsProps {
  title: string;
  fetchUrl: string;
  emptyMessage?: string;
  maxHeight?: string;
}

export function ExecutionLogs({ title, fetchUrl, emptyMessage = 'No executions found', maxHeight = '400px' }: ExecutionLogsProps) {
  const [executions, setExecutions] = useState<ExecutionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadExecutions = async () => {
      try {
        const response = await fetch(fetchUrl);
        if (response.ok) {
          const { executions } = await response.json();
          setExecutions(executions || []);
        } else {
          console.error('Failed to load executions:', await response.text());
        }
      } catch (error) {
        console.error('Error loading executions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadExecutions();
  }, [fetchUrl]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'running':
        return <PlayIcon className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircleIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : executions.length > 0 ? (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {executions.map((record) => (
                <div
                  key={record.execution.id}
                  className="p-3 border rounded-lg bg-muted/30 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(record.execution.status)}
                      <span className="font-medium">{record.action.name}</span>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getStatusColor(record.execution.status)}`}
                      >
                        {record.execution.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(record.execution.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {record.execution.result && (
                    <div className="text-sm">
                      <pre className="whitespace-pre-wrap text-xs bg-muted p-2 rounded">
                        {JSON.stringify(record.execution.result, null, 2)}
                      </pre>
                    </div>
                  )}
                  {record.execution.error && (
                    <div className="text-sm text-red-600">
                      <pre className="whitespace-pre-wrap text-xs bg-red-50 p-2 rounded">
                        {record.execution.error}
                      </pre>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Record ID: {record.record.id}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>{emptyMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ExecutionLogs; 