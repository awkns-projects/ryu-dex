'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  PlayCircleIcon, 
  RepeatIcon, 
  SearchIcon, 
  ChevronDownIcon, 
  ChevronRightIcon,
  PencilIcon,
  Trash2Icon,
  PlayIcon,
  PauseIcon
} from 'lucide-react';
import { AgentData, AgentSchedule } from '@/lib/types';
import { formatActionName } from '@/lib/utils';

interface SchedulePreviewProps {
  schedule: AgentSchedule;
  agentData: AgentData;
  isExpanded?: boolean;
  isSelected?: boolean;
  showActions?: boolean;
  variant?: 'full' | 'compact' | 'simple';
  onToggleExpanded?: (scheduleId: string, e?: React.MouseEvent<Element, MouseEvent>) => void;
  onSelect?: (scheduleId: string) => void;
  onRun?: (schedule: AgentSchedule) => void;
  onEdit?: (schedule: AgentSchedule) => void;
  onDelete?: (scheduleId: string) => void;
  onToggleStatus?: (scheduleId: string) => void;
}

export function SchedulePreview({ 
  schedule, 
  agentData, 
  isExpanded = false,
  isSelected = false,
  showActions = true,
  variant = 'full',
  onToggleExpanded,
  onSelect,
  onRun,
  onEdit,
  onDelete,
  onToggleStatus
}: SchedulePreviewProps) {
  const isRecurring = schedule.mode === 'recurring';
  const borderColor = isRecurring ? 'border-l-green-200' : 'border-l-blue-200';
  const iconColor = isRecurring ? 'text-green-600' : 'text-blue-600';
  const badgeColor = isRecurring ? 'text-green-600 border-green-200' : 'text-blue-600 border-blue-200';

  const renderStepDetails = () => (
    <div className="text-xs text-muted-foreground space-y-2 mt-2 pl-6 sm:pl-8">
      {schedule.steps?.map((step, index) => {
        const action = agentData.actions.find(a => a.name === step.actionName);
        const actionTitle = action ? (action.title || formatActionName(action.name)) : (step.actionName || 'Unknown Action');
        
        return (
          <div key={step.id} className="border-l-2 border-muted pl-3 py-1 space-y-1">
            <div className="flex items-start gap-2">
              <span className="text-xs font-medium text-muted-foreground flex-shrink-0">Step {index + 1}:</span>
              <span className="text-xs font-medium break-words">{step.modelName || 'Unknown Model'}</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-muted-foreground flex-shrink-0">→</span>
              <span className="break-words leading-relaxed">
                {actionTitle}
              </span>
            </div>
            {step.query && (
              <div className="flex items-start gap-1.5 pl-3">
                <SearchIcon className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span className="break-words leading-relaxed italic">{step.query}</span>
              </div>
            )}
          </div>
        );
      })}
      <div className="flex items-center gap-1 pt-1">
        {isRecurring ? (
          <>
            <RepeatIcon className="h-3 w-3 flex-shrink-0" />
            <span>Every {schedule.intervalHours}h</span>
            {schedule.nextRunAt && (
              <span className="text-muted-foreground">
                • Next: {new Date(schedule.nextRunAt).toLocaleString()}
              </span>
            )}
          </>
        ) : (
          <>
            <PlayCircleIcon className="h-3 w-3 flex-shrink-0" />
            <span>Run once</span>
          </>
        )}
      </div>
    </div>
  );

  const renderCompactSummary = () => (
    <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-1 pl-6 sm:pl-8">
      {isRecurring ? (
        <>
          <RepeatIcon className="h-3 w-3 flex-shrink-0" />
          <span>Every {schedule.intervalHours}h</span>
          {schedule.nextRunAt && (
            <span className="text-muted-foreground">
              • Next: {new Date(schedule.nextRunAt).toLocaleString()}
            </span>
          )}
        </>
      ) : (
        <>
          <PlayCircleIcon className="h-3 w-3 flex-shrink-0" />
          <span>Run once</span>
        </>
      )}
    </div>
  );

  const renderActions = () => {
    if (!showActions) return null;

    return (
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {isRecurring ? (
          <Button
            size="sm"
            variant="outline"
            className="gap-1 flex-1 sm:flex-none justify-center min-h-[36px]"
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus?.(schedule.id);
            }}
          >
            {schedule.status === 'active' ? (
              <><PauseIcon className="h-3 w-3" /> Pause</>
            ) : (
              <><PlayIcon className="h-3 w-3" /> Resume</>
            )}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="gap-1 flex-1 sm:flex-none justify-center min-h-[36px]"
            onClick={(e) => {
              e.stopPropagation();
              onRun?.(schedule);
            }}
          >
            <PlayCircleIcon className="h-4 w-4" />
            Run Now
          </Button>
        )}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="gap-1 flex-1 sm:flex-none justify-center min-h-[36px]"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(schedule);
            }}
          >
            <PencilIcon className="h-4 w-4" />
            <span className="sm:hidden">Edit</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="gap-1 text-destructive flex-1 sm:flex-none justify-center min-h-[36px]"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(schedule.id);
            }}
          >
            <Trash2Icon className="h-4 w-4" />
            <span className="sm:hidden">Delete</span>
          </Button>
        </div>
      </div>
    );
  };

  // Simple variant for onboarding modal
  if (variant === 'simple') {
    return (
      <div className="flex items-center justify-between p-3 border rounded-lg gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm sm:text-base font-medium break-words">{schedule.name}</p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {isRecurring ? `Runs every ${schedule.intervalHours} hours` : 'Run once'}
          </p>
        </div>
        <Badge variant={schedule.status === 'active' ? 'default' : 'secondary'} className="text-xs flex-shrink-0">
          {schedule.status}
        </Badge>
      </div>
    );
  }

  // Compact variant without expansion
  if (variant === 'compact') {
    return (
      <div className={`p-3 border rounded-lg bg-muted/30 border-l-4 ${borderColor}`}>
        <div className="flex items-start gap-2 mb-2">
          {isRecurring ? (
            <Badge variant="outline" className={`text-xs ${badgeColor} flex-shrink-0`}>
              {schedule.status}
            </Badge>
          ) : (
            <Badge variant="default" className={`text-xs bg-blue-100 text-blue-700 hover:bg-blue-100 flex-shrink-0`}>
              ready
            </Badge>
          )}
          <span className="font-medium text-sm break-words flex-1">
            {schedule.name || 'Untitled Schedule'}
          </span>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            ({schedule.steps?.length || 0} steps)
          </span>
        </div>
        {renderCompactSummary()}
        {showActions && (
          <div className="mt-3">
            {renderActions()}
          </div>
        )}
      </div>
    );
  }

  // Full variant with expansion
  return (
    <div
      className={`flex flex-col p-3 border rounded-lg bg-muted/30 gap-3 cursor-pointer transition-colors border-l-4 ${borderColor} ${
        isSelected ? 'ring-1 ring-primary' : ''
      }`}
      onClick={() => onSelect?.(schedule.id)}
    >
      <div className="space-y-2 min-w-0 flex-1">
        <div className="flex items-start gap-2">
          {onToggleExpanded && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 flex-shrink-0 mt-0.5"
              onClick={(e) => onToggleExpanded(schedule.id, e)}
            >
              {isExpanded ? (
                <ChevronDownIcon className="h-3 w-3" />
              ) : (
                <ChevronRightIcon className="h-3 w-3" />
              )}
            </Button>
          )}
          {isRecurring ? (
            <Badge variant={schedule.status === 'active' ? 'default' : 'outline'} className="text-xs flex-shrink-0">
              {schedule.status}
            </Badge>
          ) : (
            <Badge variant="default" className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-100 flex-shrink-0">
              ready
            </Badge>
          )}
          <span className="font-medium text-sm break-words flex-1">
            {schedule.name || 'Untitled Schedule'}
          </span>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            ({schedule.steps?.length || 0} steps)
          </span>
        </div>
        
        {/* Compact summary when collapsed */}
        {!isExpanded && renderCompactSummary()}
        
        {/* Detailed steps when expanded */}
        {isExpanded && renderStepDetails()}
      </div>
      
      {/* Action buttons */}
      {renderActions()}
    </div>
  );
} 