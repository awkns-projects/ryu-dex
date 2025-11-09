'use client';

import { Button } from '@/components/ui/button';
import { XIcon, PlusIcon, UploadIcon } from 'lucide-react';
import { AgentModel } from '@/lib/types';

interface CreateRecordOptionsModalProps {
  model: AgentModel;
  onClose: () => void;
  onCreateSingle: () => void;
  onImportData: () => void;
}

export function CreateRecordOptionsModal({ 
  model, 
  onClose, 
  onCreateSingle, 
  onImportData 
}: CreateRecordOptionsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
      <div className="bg-background border rounded-lg w-full max-w-[95vw] sm:max-w-[500px] p-4 sm:p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Add Records to {model.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Choose how you'd like to add records to this model
              </p>
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

          {/* Options */}
          <div className="space-y-3">
            {/* Create Single Record */}
            <Button
              onClick={onCreateSingle}
              variant="outline"
              className="w-full h-auto p-4 flex-col gap-2 hover:bg-muted/50"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="flex-shrink-0">
                  <PlusIcon className="h-6 w-6" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">Create Single Record</div>
                  <div className="text-sm text-muted-foreground">
                    Manually create one record with a form
                  </div>
                </div>
              </div>
            </Button>

            {/* Import Data */}
            <Button
              onClick={onImportData}
              variant="outline"
              className="w-full h-auto p-4 flex-col gap-2 hover:bg-muted/50"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="flex-shrink-0">
                  <UploadIcon className="h-6 w-6" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">Import Data</div>
                  <div className="text-sm text-muted-foreground text-wrap">
                    Upload CSV, Excel, or JSON files to create multiple records
                  </div>
                </div>
              </div>
            </Button>
          </div>

          {/* Cancel */}
          <div className="flex justify-center pt-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateRecordOptionsModal; 