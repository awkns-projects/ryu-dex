'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  MoreVerticalIcon,
  PlayIcon,
  PencilIcon,
  Trash2Icon,
  PauseIcon,
  PlayCircleIcon
} from 'lucide-react';

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
  query: ScheduleQuery | string; // NEW: Structured query OR legacy string
  actionId: string;
  order: number;
}

interface Schedule {
  id: string;
  name: string | null;
  mode: 'once' | 'recurring';
  intervalHours?: string | null;
  status: 'active' | 'paused';
  nextRunAt?: string | null;
  lastRunAt?: string | null;
  steps?: ScheduleStep[];
}

interface AgentData {
  models: any[];
  actions: any[];
}

interface SchedulePreviewProps {
  schedule: Schedule;
  agentData: AgentData;
  isExpanded: boolean;
  isSelected: boolean;
  variant?: 'compact' | 'full';
  onToggleExpanded: (id: string, e?: React.MouseEvent) => void;
  onSelect: (id: string) => void;
  onRun?: (schedule: Schedule) => void;
  onEdit?: (schedule: Schedule) => void;
  onDelete?: (id: string) => void;
  onToggleStatus?: (id: string) => void;
}

export function SchedulePreview({
  schedule,
  agentData,
  isExpanded,
  isSelected,
  variant = 'full',
  onToggleExpanded,
  onSelect,
  onRun,
  onEdit,
  onDelete,
  onToggleStatus,
}: SchedulePreviewProps) {
  const formatActionName = (name: string) => {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <div
      className={`border rounded-lg bg-card ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={() => onSelect(schedule.id)}
    >
      {/* Header */}
      <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-accent/50 transition-colors rounded-t-lg">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpanded(schedule.id, e);
            }}
            className="flex-shrink-0 hover:bg-accent/80 rounded p-1"
          >
            {isExpanded ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium text-sm truncate">
                {schedule.name || 'Untitled Schedule'}
              </h4>
              <div className="flex items-center gap-1.5">
                <Badge variant={schedule.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                  {schedule.status}
                </Badge>
                {schedule.mode === 'recurring' && schedule.intervalHours && (
                  <Badge variant="outline" className="text-xs">
                    Every {schedule.intervalHours}h
                  </Badge>
                )}
              </div>
            </div>

            {!isExpanded && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {schedule.steps?.length || 0} step{schedule.steps?.length !== 1 ? 's' : ''}
                {schedule.nextRunAt && (
                  <> • Next: {new Date(schedule.nextRunAt).toLocaleString()}</>
                )}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 ml-2" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
          {onRun && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onRun(schedule);
              }}
              className="h-8 px-2 gap-1"
            >
              <PlayIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Run</span>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onRun && (
                <DropdownMenuItem onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onRun(schedule);
                }}>
                  <PlayCircleIcon className="h-4 w-4 mr-2" />
                  Run Now
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onEdit(schedule);
                }}>
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {onToggleStatus && schedule.mode === 'recurring' && (
                <DropdownMenuItem onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onToggleStatus(schedule.id);
                }}>
                  {schedule.status === 'active' ? (
                    <>
                      <PauseIcon className="h-4 w-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <PlayIcon className="h-4 w-4 mr-2" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    onDelete(schedule.id);
                  }}
                  className="text-destructive"
                >
                  <Trash2Icon className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3 border-t pt-3">
          {schedule.steps && schedule.steps.length > 0 ? (
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-muted-foreground">Steps:</h5>
              {schedule.steps.map((step, index) => {
                const model = agentData.models.find((m) => m.id === step.modelId);
                const action = agentData.actions.find((a) => a.id === step.actionId);

                return (
                  <div key={step.id || index} className="text-xs border rounded p-2 bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {index + 1}
                      </Badge>
                      <span className="font-medium">{model?.name || 'Unknown Model'}</span>
                      {step.query && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground italic truncate">
                            "{typeof step.query === 'string' ? step.query : JSON.stringify(step.query)}"
                          </span>
                        </>
                      )}
                    </div>
                    {action && (
                      <div className="mt-1 text-muted-foreground ml-8">
                        → {action.title || formatActionName(action.name)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No steps configured</p>
          )}

          {schedule.mode === 'recurring' && (
            <div className="text-xs space-y-1">
              {schedule.nextRunAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Next Run:</span>
                  <span className="font-medium">{new Date(schedule.nextRunAt).toLocaleString()}</span>
                </div>
              )}
              {schedule.lastRunAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last Run:</span>
                  <span className="font-medium">{new Date(schedule.lastRunAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

