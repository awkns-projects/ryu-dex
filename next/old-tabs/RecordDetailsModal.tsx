'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PlayIcon, XIcon } from 'lucide-react';
import { AgentModel } from '@/lib/types';
import { formatActionName } from '@/lib/utils';

interface RecordDetailsModalProps {
  record: Record<string, any>;
  model: AgentModel;
  onClose: () => void;
  onAction: (actionId: string, recordId: string, recordName: string) => void;
  formatFieldValue: (record: any, field: any) => any;
  getActionsForModel: (modelId: string) => any[];
}

export function RecordDetailsModal({ 
  record, 
  model, 
  onClose, 
  onAction,
  formatFieldValue,
  getActionsForModel
}: RecordDetailsModalProps) {
  const modelActions = getActionsForModel(model.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
      <div className="bg-background border rounded-lg p-3 sm:p-6 w-full max-w-[95vw] sm:max-w-[600px] max-h-[95vh] sm:max-h-[80vh] overflow-y-auto">
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold truncate pr-2">{record[model.displayFields?.[0] || 'name'] || 'Record Details'}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Record Fields */}
          <div className="space-y-4">
            {model.fields.map((field) => (
              <div key={field.name} className="space-y-1.5">
                <Label className="text-sm">
                  {field.title}
                  <span className="text-xs text-muted-foreground ml-2">({field.name})</span>
                </Label>
                <div className="p-2 bg-muted/30 rounded-lg break-words">
                  {formatFieldValue(record, field)}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          {modelActions.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Available Actions</h4>
              <div className="flex flex-wrap gap-2">
                {modelActions.map((action) => (
                  <Button
                    key={action.id}
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const recordName = record[model.displayFields?.[0] || 'name'] || 'Record';
                      onAction(action.id, record.id, recordName);
                      onClose();
                    }}
                    className="gap-2 flex-1 min-w-0 sm:flex-none"
                  >
                    {action.emoji ? (
                      <span className="flex-shrink-0">{action.emoji}</span>
                    ) : (
                      <PlayIcon className="h-4 w-4 flex-shrink-0" />
                    )}
                    <span className="truncate">{action.title || formatActionName(action.name)}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecordDetailsModal; 