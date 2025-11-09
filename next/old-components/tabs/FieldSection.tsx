'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { XIcon, PlusIcon, ChevronRightIcon } from 'lucide-react';
import { AgentData } from '@/lib/types';
import { ActionStep } from './types';

interface FieldSectionProps {
  type: 'input' | 'output';
  step: ActionStep;
  agentData: AgentData;
  targetModel: string;
  fieldSuggestions: any;
  onStepUpdate: (updatedStep: ActionStep) => void;
}

export function FieldSection({ type, step, agentData, targetModel, fieldSuggestions, onStepUpdate }: FieldSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  const fields = type === 'input' ? step.inputFields : step.outputFields;
  const fieldType = type === 'input' ? 'inputFields' : 'outputFields';
  const title = type === 'input' ? 'Input Fields' : 'Output Fields';
  const description = type === 'input' 
    ? 'Fields from the record that this step will read'
    : 'New fields that this step will generate';

  const updateFields = (newFields: string[]) => {
    const updatedStep = { ...step, [fieldType]: newFields };
    onStepUpdate(updatedStep);
  };

  const updateCustomFieldTypes = (newCustomFieldTypes: Record<string, { fieldType: string, enumValues?: string[] }>) => {
    const updatedStep = { ...step, customFieldTypes: newCustomFieldTypes };
    onStepUpdate(updatedStep);
  };

  const getFieldIcon = (fieldType: string) => {
    switch (fieldType) {
      case 'text': return '📝';
      case 'number': return '🔢';
      case 'boolean': return '✅';
      case 'date': return '📅';
      case 'json': return '🔧';
      case 'reference': return '🔗';
      default: return '❓';
    }
  };

  return (
    <Collapsible open={!isCollapsed} onOpenChange={(open) => setIsCollapsed(!open)}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded-md transition-colors">
        <div className="text-left flex-1">
          <Label className="text-sm font-medium">{title}</Label>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
          {isCollapsed && fields.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {fields.slice(0, 5).map((field, index) => {
                const modelField = targetModel ? 
                  agentData.models.find(m => m.name === targetModel)?.fields.find(f => f.name === field) : 
                  null;
                const isCustomField = !modelField;
                return (
                  <Badge key={index} variant="secondary" className="text-[10px] px-1 py-0">
                    {isCustomField ? '🔧' : getFieldIcon(modelField?.type)} {field}
                  </Badge>
                );
              })}
              {fields.length > 5 && (
                <Badge variant="outline" className="text-[10px] px-1 py-0">
                  +{fields.length - 5} more
                </Badge>
              )}
            </div>
          )}
        </div>
        <ChevronRightIcon 
          className={`h-4 w-4 transition-transform flex-shrink-0 ${!isCollapsed ? 'rotate-90' : ''}`} 
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-2">
          {/* Existing model fields selection */}
          {targetModel && (
            <div className="flex flex-wrap gap-2">
              {agentData.models
                .find(m => m.name === targetModel)
                ?.fields.map((field) => (
                  <Button
                    key={field.name}
                    variant={fields.includes(field.name) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      const isSelected = fields.includes(field.name);
                      const newFields = isSelected
                        ? fields.filter(f => f !== field.name)
                        : [...fields, field.name];
                      updateFields(newFields);
                    }}
                    className={`text-xs ${
                      fieldSuggestions?.[fieldType]?.some((f: any) => f.name === field.name) 
                        ? 'ring-2 ring-blue-500 ring-offset-1' 
                        : ''
                    }`}
                  >
                    {fieldSuggestions?.[fieldType]?.some((f: any) => f.name === field.name) && '✨ '}
                    {getFieldIcon(field.type)} {field.name}
                  </Button>
                ))}
            </div>
          )}
          
          {/* Custom fields */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {fields
                .filter(field => !agentData.models.find(m => m.name === targetModel)?.fields.some(f => f.name === field))
                .map((field, index) => (
                  <div key={`custom-${type}-${index}`} className="space-y-2 p-3 border rounded-lg bg-muted/20">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-1">🔧</span>
                      <Input
                        placeholder={`Custom field name (e.g., ${type === 'input' ? 'externalData' : 'aiSummary'})`}
                        value={field}
                        onChange={(e) => {
                          const allFields = [...fields];
                          const customFields = allFields.filter(f => !agentData.models.find(m => m.name === targetModel)?.fields.some(mf => mf.name === f));
                          const modelFields = allFields.filter(f => agentData.models.find(m => m.name === targetModel)?.fields.some(mf => mf.name === f));
                          customFields[index] = e.target.value;
                          updateFields([...modelFields, ...customFields]);
                        }}
                        className="text-xs h-6 border-0 bg-transparent px-1 flex-1 min-w-[120px]"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newFields = fields.filter(f => f !== field);
                          const customFieldTypes = { ...step.customFieldTypes };
                          delete customFieldTypes[field];
                          updateFields(newFields);
                          updateCustomFieldTypes(customFieldTypes);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <XIcon className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Type:</Label>
                      <Select
                        value={(() => {
                          const fieldType = step.customFieldTypes?.[field]?.fieldType;
                          if (!fieldType) return 'text';
                          if (fieldSuggestions?.suggestedModels?.some((m: any) => m.name === fieldType)) {
                            return `new:${fieldType}`;
                          }
                          return fieldType;
                        })()}
                        onValueChange={(value: string) => {
                          const customFieldTypes = { ...step.customFieldTypes };
                          const actualValue = value.startsWith('new:') ? value.replace('new:', '') : value;
                          customFieldTypes[field] = { 
                            fieldType: actualValue,
                            ...(value !== 'enum' && { enumValues: undefined })
                          };
                          updateCustomFieldTypes(customFieldTypes);
                        }}
                      >
                        <SelectTrigger className="h-6 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">📝 Text</SelectItem>
                          <SelectItem value="number">🔢 Number</SelectItem>
                          <SelectItem value="boolean">✅ Boolean</SelectItem>
                          <SelectItem value="date">📅 Date</SelectItem>
                          <SelectItem value="json">🔧 JSON</SelectItem>
                          {/* Show enum fields from target model */}
                          {targetModel && agentData.models
                            .find(m => m.name === targetModel)
                            ?.fields.filter(f => (f as any).type === 'enum')
                            .map((enumField) => (
                              <SelectItem key={`enum-${enumField.name}`} value={`enum:${enumField.name}`}>
                                🏷️ {enumField.name} ({(enumField as any).enumValues?.join(', ') || 'enum'})
                              </SelectItem>
                            ))}
                          {/* Show existing models */}
                          {agentData.models.map((model) => (
                            <SelectItem key={model.name} value={model.name}>🏢 {model.name}</SelectItem>
                          ))}
                          {/* Show suggested new models */}
                          {fieldSuggestions?.suggestedModels?.map((model: any) => (
                            <SelectItem key={`new-${model.name}`} value={`new:${model.name}`}>
                              ✨ {model.name} (New)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {step.customFieldTypes?.[field]?.fieldType === 'enum' && (
                        <Input
                          placeholder="Values: healthy,needs_review,sick"
                          value={step.customFieldTypes?.[field]?.enumValues?.join(',') || ''}
                          onChange={(e) => {
                            const customFieldTypes = { ...step.customFieldTypes };
                            const enumValues = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
                            customFieldTypes[field] = { ...customFieldTypes[field], enumValues };
                            updateCustomFieldTypes(customFieldTypes);
                          }}
                          className="text-xs h-6 flex-1"
                        />
                      )}
                    </div>
                  </div>
                ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newFields = [...fields, ''];
                updateFields(newFields);
              }}
              className="gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Add Custom {title.split(' ')[0]} Field
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
} 