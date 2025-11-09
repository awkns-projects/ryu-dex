'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { XIcon, Check, ChevronsUpDown } from 'lucide-react';
import { AgentModel, AgentField } from '@/lib/types';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface CreateRecordModalProps {
  model: AgentModel;
  onClose: () => void;
  onCreate: (record: Record<string, any>) => void;
  getDisplayValueForReference: (referenceId: string, referencedModelName: string) => string;
  getReferencedModelRecords: (modelName: string) => any[];
}

export function CreateRecordModal({ 
  model, 
  onClose, 
  onCreate,
  getDisplayValueForReference,
  getReferencedModelRecords
}: CreateRecordModalProps) {
  const [newRecord, setNewRecord] = useState<Record<string, any>>({});
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({});

  const toggleOpen = (fieldName: string, isOpen: boolean) => {
    setOpenStates(prev => ({ ...prev, [fieldName]: isOpen }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
      <div className="bg-background border rounded-lg p-3 sm:p-6 w-full max-w-[95vw] sm:max-w-[600px] max-h-[95vh] sm:max-h-[80vh] overflow-y-auto">
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Create New Record</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onClose();
                setNewRecord({});
              }}
              className="h-8 w-8 p-0"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Form */}
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-4">
              {model.fields.map((field: AgentField) => {
                if (field.description?.includes('AI-generated field from step')) {
                  return null; // Skip AI-generated fields
                }

                console.log('🔍 DEBUG: Rendering field:', field.name, 'type:', field.type, 'options:', field.options, 'enumValues:', field.enumValues);

                switch (field.type) {
                  case 'text':
                    return (
                      <div key={field.name}>
                        <Label htmlFor={field.name}>
                          {field.title}
                          <span className="text-xs text-muted-foreground ml-2">({field.name})</span>
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        <Input
                          id={field.name}
                          value={newRecord[field.name] || ''}
                          onChange={(e) => setNewRecord(prev => ({ ...prev, [field.name]: e.target.value }))}
                          placeholder={field.description || `Enter ${field.title.toLowerCase()}`}
                        />
                      </div>
                    );
                  case 'number':
                    return (
                      <div key={field.name}>
                        <Label htmlFor={field.name}>
                          {field.title}
                          <span className="text-xs text-muted-foreground ml-2">({field.name})</span>
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        <Input
                          id={field.name}
                          type="number"
                          value={newRecord[field.name] || ''}
                          onChange={(e) => setNewRecord(prev => ({ ...prev, [field.name]: Number(e.target.value) }))}
                          placeholder={field.description || `Enter ${field.title.toLowerCase()}`}
                        />
                      </div>
                    );
                  case 'boolean':
                    return (
                      <div key={field.name} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={field.name}
                          checked={newRecord[field.name] || false}
                          onChange={(e) => setNewRecord(prev => ({ ...prev, [field.name]: e.target.checked }))}
                          className="h-4 w-4"
                        />
                        <Label htmlFor={field.name} className="flex-1">
                          {field.title}
                          <span className="text-xs text-muted-foreground ml-2">({field.name})</span>
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                      </div>
                    );
                  case 'date':
                    return (
                      <div key={field.name}>
                        <Label htmlFor={field.name}>
                          {field.title}
                          <span className="text-xs text-muted-foreground ml-2">({field.name})</span>
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        <Input
                          id={field.name}
                          type="date"
                          value={newRecord[field.name] || ''}
                          onChange={(e) => setNewRecord(prev => ({ ...prev, [field.name]: e.target.value }))}
                        />
                      </div>
                    );
                  case 'enum':
                    return (
                      <div key={field.name}>
                        <Label htmlFor={field.name}>
                          {field.title}
                          <span className="text-xs text-muted-foreground ml-2">({field.name})</span>
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        <Select
                          value={newRecord[field.name] || ''}
                          onValueChange={(value) => setNewRecord(prev => ({ ...prev, [field.name]: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={`Select ${field.title.toLowerCase()}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {(field.options || field.enumValues)?.map((option: string) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {field.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {field.description}
                          </p>
                        )}
                      </div>
                    );
                  case 'reference':
                    if (!field.referencesModel) return null;
                    
                    if (field.referenceType === 'to_many') {
                      // Multi-select for to-many references
                      return (
                        <div key={field.name}>
                          <Label htmlFor={field.name}>
                            {field.title}
                            <span className="text-xs text-muted-foreground ml-2">({field.name})</span>
                            {field.required && <span className="text-destructive ml-1">*</span>}
                          </Label>
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2 p-2 border rounded-lg min-h-[38px]">
                              {(newRecord[field.name] || []).map((refId: string) => {
                                const displayValue = getDisplayValueForReference(refId, field.referencesModel!);
                                return (
                                  <Badge key={refId} variant="secondary" className="flex items-center gap-1 max-w-full">
                                    <span className="truncate">{displayValue}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-4 w-4 p-0 hover:bg-transparent"
                                      onClick={() => {
                                        setNewRecord(prev => ({
                                          ...prev,
                                          [field.name]: prev[field.name].filter((id: string) => id !== refId)
                                        }));
                                      }}
                                    >
                                      <XIcon className="h-3 w-3" />
                                    </Button>
                                  </Badge>
                                );
                              })}
                            </div>
                            <Popover 
                              open={openStates[field.name]} 
                              onOpenChange={(isOpen) => toggleOpen(field.name, isOpen)}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className="w-full justify-between"
                                >
                                  <span>Add {field.referencesModel}</span>
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0" align="start">
                                <div className="max-h-[300px] overflow-y-auto">
                                  <div className="flex items-center border-b px-3 py-2">
                                    <input
                                      placeholder={`Search ${field.referencesModel}...`}
                                      className="flex h-8 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                      onChange={(e) => {
                                        // Simple search filter - you can implement this if needed
                                      }}
                                    />
                                  </div>
                                  <div className="p-1">
                                    {field.referencesModel && getReferencedModelRecords(field.referencesModel).map((record: any) => {
                                      const displayValue = getDisplayValueForReference(record.id, field.referencesModel!);
                                      const isSelected = field.referenceType === 'to_many' 
                                        ? newRecord[field.name]?.includes(record.id)
                                        : newRecord[field.name] === record.id;
                                      
                                      // Don't show already selected records for to-many
                                      if (field.referenceType === 'to_many' && isSelected) {
                                        return null;
                                      }

                                      return (
                                        <div
                                          key={record.id}
                                          className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                          onClick={() => {
                                            if (field.referenceType === 'to_many') {
                                              setNewRecord(prev => ({
                                                ...prev,
                                                [field.name]: [...(prev[field.name] || []), record.id]
                                              }));
                                            } else {
                                              setNewRecord(prev => ({ ...prev, [field.name]: record.id }));
                                            }
                                            toggleOpen(field.name, false);
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              isSelected ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          <span className="truncate">{displayValue}</span>
                                        </div>
                                      );
                                    })}
                                    {(!field.referencesModel || getReferencedModelRecords(field.referencesModel).length === 0) && (
                                      <div className="py-6 text-center text-sm">
                                        No {field.referencesModel} found.
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Select multiple {field.referencesModel}s
                          </p>
                        </div>
                      );
                    } else {
                      // Single select for to-one references
                      return (
                        <div key={field.name}>
                          <Label htmlFor={field.name}>
                            {field.title}
                            <span className="text-xs text-muted-foreground ml-2">({field.name})</span>
                            {field.required && <span className="text-destructive ml-1">*</span>}
                          </Label>
                          <Popover 
                            open={openStates[field.name]} 
                            onOpenChange={(isOpen) => toggleOpen(field.name, isOpen)}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="w-full justify-between"
                              >
                                {newRecord[field.name] ? (
                                  <span className="truncate">{getDisplayValueForReference(newRecord[field.name], field.referencesModel!)}</span>
                                ) : (
                                  <span>Select {field.referencesModel}</span>
                                )}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0" align="start">
                              <div className="max-h-[300px] overflow-y-auto">
                                <div className="flex items-center border-b px-3 py-2">
                                  <input
                                    placeholder={`Search ${field.referencesModel}...`}
                                    className="flex h-8 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                    onChange={(e) => {
                                      // Simple search filter - you can implement this if needed
                                    }}
                                  />
                                </div>
                                <div className="p-1">
                                  {field.referencesModel && getReferencedModelRecords(field.referencesModel).map((record: any) => {
                                    const displayValue = getDisplayValueForReference(record.id, field.referencesModel!);
                                    const isSelected = newRecord[field.name] === record.id;
                                    
                                    // Debug logging
                                    console.log(`🔍 Reference record:`, {
                                      recordId: record.id,
                                      displayValue,
                                      recordData: record,
                                      modelName: field.referencesModel
                                    });
                                    
                                    return (
                                      <div
                                        key={record.id}
                                        className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                        onClick={() => {
                                          setNewRecord(prev => ({ ...prev, [field.name]: record.id }));
                                          toggleOpen(field.name, false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            isSelected ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        <span className="truncate">{displayValue}</span>
                                      </div>
                                    );
                                  })}
                                  {(!field.referencesModel || getReferencedModelRecords(field.referencesModel).length === 0) && (
                                    <div className="py-6 text-center text-sm">
                                      No {field.referencesModel} found.
                                    </div>
                                  )}
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                          <p className="text-xs text-muted-foreground mt-1">
                            Select a single {field.referencesModel}
                          </p>
                        </div>
                      );
                    }
                  default:
                    return null;
                }
              })}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                  setNewRecord({});
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={() => onCreate(newRecord)}
                disabled={!model.fields.filter((f: AgentField) => f.required).every((f: AgentField) => newRecord[f.name])}
                className="w-full sm:w-auto"
              >
                Create Record
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateRecordModal; 