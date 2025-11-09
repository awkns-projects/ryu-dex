'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { XIcon, PlayIcon, EditIcon, CogIcon } from 'lucide-react';
import { formatActionName } from '@/lib/utils';

interface ActionPromptModalProps {
  action: any;
  recordName: string;
  onClose: () => void;
  onRun: () => void;
  onEdit: () => void;
}

export function ActionPromptModal({ 
  action, 
  recordName, 
  onClose, 
  onRun, 
  onEdit 
}: ActionPromptModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
      <div className="bg-background border rounded-lg w-full max-w-[95vw] sm:max-w-[500px] p-4 sm:p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CogIcon className="h-5 w-5" />
              <h3 className="text-lg font-semibold truncate">Action Options</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Action Info */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {action.emoji && <span className="text-lg">{action.emoji}</span>}
                <h4 className="font-medium text-sm">{action.title || formatActionName(action.name)}</h4>
              </div>
              {action.description && (
                <p className="text-sm text-muted-foreground break-words">{action.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="text-xs">
                Target: {action.targetModel}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {action.steps?.length || 0} steps
              </Badge>
            </div>

            <div className="text-sm">
              <span className="text-muted-foreground">Record: </span>
              <span className="font-medium">{recordName}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={onRun}
              className="gap-2 flex-1"
            >
              <PlayIcon className="h-4 w-4" />
              Run Action
            </Button>
            <Button
              variant="outline"
              onClick={onEdit}
              className="gap-2 flex-1"
            >
              <EditIcon className="h-4 w-4" />
              Edit Action
            </Button>
          </div>

          <div className="flex justify-center pt-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActionPromptModal; 