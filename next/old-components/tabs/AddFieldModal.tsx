'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { XIcon, DatabaseIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { AgentModel, AgentField } from '@/lib/types';

interface AddFieldModalProps {
  model: AgentModel;
  agentData: any;
  editingField?: AgentField;
  onClose: () => void;
  onSave?: (updatedField: AgentField) => void;
}

export function AddFieldModal({ model, agentData, editingField, onClose, onSave }: AddFieldModalProps) {
  const [newField, setNewField] = useState<Partial<AgentField>>(() => {
    if (editingField) {
      return {
        name: editingField.name || '',
        title: editingField.title || '',
        type: editingField.type || 'text',
        description: editingField.description || '',
        required: editingField.required || false,
        referencesModel: editingField.referencesModel || '',
        referenceType: editingField.referenceType || 'to_one',
        enumValues: editingField.enumValues || [],
        options: editingField.options || []
      };
    }
    
    return {
      name: '',
      title: '',
      type: 'text',
      description: '',
      required: false,
      referencesModel: '',
      referenceType: 'to_one',
      enumValues: [],
      options: []
    };
  });

  const [enumValue, setEnumValue] = useState('');

  const updateField = (updates: Partial<AgentField>) => {
    setNewField(prev => ({ ...prev, ...updates }));
  };

  const handleAddEnumValue = () => {
    if (enumValue.trim() && !newField.enumValues?.includes(enumValue.trim())) {
      const updatedEnumValues = [...(newField.enumValues || []), enumValue.trim()];
      updateField({ enumValues: updatedEnumValues, options: updatedEnumValues });
      setEnumValue('');
    }
  };

  const handleRemoveEnumValue = (valueToRemove: string) => {
    const updatedEnumValues = (newField.enumValues || []).filter(v => v !== valueToRemove);
    updateField({ enumValues: updatedEnumValues, options: updatedEnumValues });
  };

  const handleSave = async () => {
    try {
      const isEditing = !!editingField;
      const fieldData = {
        ...newField,
        name: newField.name?.trim(),
        title: newField.title?.trim() || newField.name?.trim(),
      };

      // Validate required fields
      if (!fieldData.name || !fieldData.type) {
        alert('Please provide a field name and type.');
        return;
      }

      // Check for duplicate field names (only if not editing or name changed)
      if (!isEditing || fieldData.name !== editingField.name) {
        const existingField = model.fields.find(f => f.name === fieldData.name);
        if (existingField) {
          alert('A field with this name already exists.');
          return;
        }
      }

      const url = `/api/agent/model/${model.id}/field${isEditing ? `/${editingField.name}` : ''}`;
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agentData.id,
          field: fieldData
        }),
      });
      
      if (response.ok) {
        const responseData = await response.json();
        onClose();
        
        if (onSave) {
          onSave(responseData.field);
        }
        console.log('Field saved successfully:', responseData);
      } else {
        const errorText = await response.text();
        console.error(`Failed to ${isEditing ? 'update' : 'create'} field:`, errorText);
        alert(`Failed to ${isEditing ? 'update' : 'create'} field. Please try again.`);
      }
    } catch (error) {
      console.error(`Error ${editingField ? 'updating' : 'creating'} field:`, error);
      alert(`Error ${editingField ? 'updating' : 'creating'} field. Please try again.`);
    }
  };

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return '📝';
      case 'number': return '🔢';
      case 'boolean': return '✅';
      case 'date': return '📅';
      case 'json': return '🔧';
      case 'reference': return '🔗';
      case 'enum': return '🏷️';
      default: return '❓';
    }
  };

  const availableModels = agentData.models.filter((m: AgentModel) => m.id !== model.id);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-hidden">
      <div className="h-full flex items-center justify-center p-2 sm:p-4">
        <div className="bg-background border rounded-lg w-full max-w-[95vw] sm:max-w-[600px] max-h-[95vh] sm:max-h-[90vh] flex flex-col">
          {/* Fixed Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b flex-shrink-0">
            <div className="flex items-center gap-2">
              <DatabaseIcon className="h-5 w-5" />
              <div>
                <h3 className="text-xl font-semibold">
                  {editingField ? 'Edit Field' : 'Add New Field'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {editingField ? 'Update field properties' : `Add a new field to ${model.name}`}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="field-name">
                    Field Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="field-name"
                    value={newField.name || ''}
                    onChange={(e) => updateField({ name: e.target.value })}
                    placeholder="e.g., category, status, priority"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Used as the database column name. Use lowercase with underscores.
                  </p>
                </div>

                <div>
                  <Label htmlFor="field-title">Display Title</Label>
                  <Input
                    id="field-title"
                    value={newField.title || ''}
                    onChange={(e) => updateField({ title: e.target.value })}
                    placeholder="e.g., Category, Status, Priority"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Human-readable label shown in forms and tables.
                  </p>
                </div>

                <div>
                  <Label htmlFor="field-type">
                    Field Type <span className="text-destructive">*</span>
                  </Label>
                  <Select value={newField.type} onValueChange={(value) => updateField({ type: value as AgentField['type'] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">
                        <div className="flex items-center gap-2">
                          <span>📝</span>
                          <span>Text</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="number">
                        <div className="flex items-center gap-2">
                          <span>🔢</span>
                          <span>Number</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="boolean">
                        <div className="flex items-center gap-2">
                          <span>✅</span>
                          <span>Boolean</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="date">
                        <div className="flex items-center gap-2">
                          <span>📅</span>
                          <span>Date</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="image_url">
                        <div className="flex items-center gap-2">
                          <span>🖼️</span>
                          <span>Image URL</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="enum">
                        <div className="flex items-center gap-2">
                          <span>🏷️</span>
                          <span>Enum (Options)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="reference">
                        <div className="flex items-center gap-2">
                          <span>🔗</span>
                          <span>Reference</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="json">
                        <div className="flex items-center gap-2">
                          <span>🔧</span>
                          <span>JSON</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="field-description">Description</Label>
                  <Textarea
                    id="field-description"
                    value={newField.description || ''}
                    onChange={(e) => updateField({ description: e.target.value })}
                    placeholder="Describe what this field represents..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="field-required"
                    checked={newField.required || false}
                    onChange={(e) => updateField({ required: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="field-required">Required field</Label>
                </div>
              </div>

              {/* Type-specific Configuration */}
              {newField.type === 'enum' && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                  <div>
                    <Label>Enum Values</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Define the available options for this field.
                    </p>
                    
                    <div className="flex gap-2 mb-3">
                      <Input
                        value={enumValue}
                        onChange={(e) => setEnumValue(e.target.value)}
                        placeholder="Enter an option..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddEnumValue();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={handleAddEnumValue}
                        disabled={!enumValue.trim()}
                        size="sm"
                        className="gap-1"
                      >
                        <PlusIcon className="h-4 w-4" />
                        Add
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(newField.enumValues || []).map((value, index) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          {value}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveEnumValue(value)}
                            className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {newField.type === 'reference' && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                  <div>
                    <Label htmlFor="reference-model">Referenced Model</Label>
                    <Select 
                      value={newField.referencesModel || ''} 
                      onValueChange={(value) => updateField({ referencesModel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a model to reference" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableModels.map((refModel: AgentModel) => (
                          <SelectItem key={refModel.id} value={refModel.name}>
                            {refModel.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="reference-type">Reference Type</Label>
                    <Select 
                      value={newField.referenceType || 'to_one'} 
                      onValueChange={(value) => updateField({ referenceType: value as 'to_one' | 'to_many' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="to_one">Single Reference (to_one)</SelectItem>
                        <SelectItem value="to_many">Multiple References (to_many)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 p-4 sm:p-6 border-t flex-shrink-0">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!newField.name || !newField.type}
              className="w-full sm:w-auto"
            >
              {editingField ? 'Update Field' : 'Add Field'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddFieldModal; 