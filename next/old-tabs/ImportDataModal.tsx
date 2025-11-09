'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { XIcon, UploadIcon, FileTextIcon, FileSpreadsheetIcon } from 'lucide-react';
import { AgentModel } from '@/lib/types';

interface ImportDataModalProps {
  model: AgentModel;
  agentId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportDataModal({ 
  model, 
  agentId, 
  onClose, 
  onSuccess 
}: ImportDataModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('agentId', agentId);
      formData.append('modelId', model.id);
      
      const response = await fetch('/api/agent/import', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('File processed successfully:', result);
        onSuccess();
        onClose();
      } else {
        const errorText = await response.text();
        console.error('File upload failed:', errorText);
        // You could show an error message to the user here
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
      <div className="bg-background border rounded-lg w-full max-w-[95vw] sm:max-w-[600px] p-4 sm:p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Import Data to {model.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Upload a file to create multiple records at once
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 flex-shrink-0"
              disabled={isUploading}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {isUploading ? (
              <div className="space-y-4">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="text-sm text-muted-foreground">Uploading and processing file...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <UploadIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium">Drop your file here</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or click to browse and select a file
                  </p>
                </div>
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FileSpreadsheetIcon className="h-4 w-4" />
                    <span>CSV, Excel</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileTextIcon className="h-4 w-4" />
                    <span>JSON</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="file-upload" className="sr-only">
                    Choose file
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv,.xlsx,.xls,.json"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="gap-2"
                  >
                    <UploadIcon className="h-4 w-4" />
                    Choose File
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium">File Requirements:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>CSV files should have headers matching your model fields</li>
              <li>Excel files (.xlsx, .xls) should have data in the first sheet</li>
              <li>JSON files should contain an array of objects</li>
              <li>Field names should match: {model.fields.map(f => f.name).join(', ')}</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImportDataModal; 