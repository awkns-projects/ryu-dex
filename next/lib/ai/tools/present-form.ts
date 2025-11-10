import { generateUUID } from '@/lib/utils';
import { tool } from 'ai';
import { z } from 'zod';

// Type definition to avoid cross-package dependency
interface AgentField {
  name: string;
  title: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'json' | 'reference' | 'enum' | 'image_url';
  required: boolean;
  description?: string;
  options?: string[];
  enumValues?: string[];
}

interface PresentFormProps {
  dataStream: any; // UIMessageStreamWriter from AI SDK
  agentData?: any;
}

// Map agent field types to form field types
const mapFieldType = (agentFieldType: string): string => {
  const typeMap: Record<string, string> = {
    text: 'text',
    number: 'number',
    boolean: 'checkbox',
    date: 'date',
    enum: 'select',
    json: 'textarea',
    reference: 'text',
    image_url: 'text',
  };
  return typeMap[agentFieldType] || 'text';
};

export const presentForm = ({ dataStream, agentData }: PresentFormProps) =>
  tool({
    description: `Present a form to collect or edit data for one of the agent's models. 
    ONLY use model names that exist in the agent's "Available Data Models" section.
    The form fields are determined by the predefined form templates for that model.
    If formName is provided, use that specific form; otherwise use the first available form.
    If recordId is provided, the form will be pre-filled with existing data for editing.
    If no recordId, the form is for creating a new record.`,
    inputSchema: z.object({
      modelName: z.string().describe('The exact name of the model to create a form for (must match one of the Available Data Models)'),
      formName: z.string().optional().describe('Optional name of a specific form template to use (e.g., "Quick Ticket", "Detailed Ticket")'),
      recordId: z.string().optional().describe('Optional ID of an existing record to edit. If not provided, creates a new record.'),
      customMessage: z.string().optional().describe('Optional custom message to show above the form'),
    }),
    execute: async ({ modelName, formName, recordId, customMessage }) => {
      if (!agentData) {
        console.error('❌ presentForm: No agent data available');
        throw new Error('Unable to present form: No agent is currently configured for this chat.');
      }

      // Find the model
      const model = agentData.models?.find((m: any) => m.name === modelName);

      if (!model) {
        const availableModels = agentData.models?.map((m: any) => m.name).join(', ') || 'none';
        throw new Error(`Model "${modelName}" not found. Available models: ${availableModels}`);
      }

      const formId = generateUUID();
      const isEditing = !!recordId;

      // If editing, find the existing record data
      let existingData: Record<string, any> = {};
      if (recordId && model.records) {
        const record = model.records.find((r: any) => r.id === recordId);
        if (record) {
          existingData = typeof record.data === 'object' ? record.data : {};
        } else {
          throw new Error(`Record with ID "${recordId}" not found in model "${modelName}".`);
        }
      }

      // Get forms for this model
      const modelForms = Array.isArray(model.forms) ? model.forms : [];

      // Find the specific form or use the first one
      let selectedForm: any = null;
      if (formName) {
        selectedForm = modelForms.find((f: any) =>
          f.name === formName || f.formName === formName
        );
        if (!selectedForm) {
          const availableForms = modelForms.map((f: any) => f.name || f.formName).join(', ');
          throw new Error(`Form "${formName}" not found for model "${modelName}". Available forms: ${availableForms}`);
        }
      } else if (modelForms.length > 0) {
        selectedForm = modelForms[0]; // Use first form by default
      }

      // Determine which fields to show
      let fieldsToShow: string[] = [];
      let formTitle = '';
      let formDescription = '';

      if (selectedForm) {
        // Use form's field list
        fieldsToShow = Array.isArray(selectedForm.fields)
          ? selectedForm.fields
          : Object.values(selectedForm.fields || {});
        formTitle = selectedForm.name || selectedForm.formName || `${modelName} Form`;
        formDescription = selectedForm.description || customMessage || '';
      } else {
        // No forms defined, show all fields
        fieldsToShow = model.fields.map((f: AgentField) => f.name);
        formTitle = isEditing ? `Edit ${modelName}` : `Add ${modelName}`;
        formDescription = customMessage || '';
      }

      // Convert model fields to form fields (only those in the form)
      const fields = fieldsToShow
        .map((fieldName: string) => {
          const field = model.fields.find((f: AgentField) => f.name === fieldName);
          if (!field) {
            console.warn(`Field "${fieldName}" not found in model "${modelName}"`);
            return null;
          }
          return {
            id: field.name,
            label: field.title || field.name,
            type: mapFieldType(field.type),
            required: field.required,
            description: field.description,
            options: field.options || field.enumValues,
            defaultValue: existingData[field.name]?.toString() || '', // Pre-fill with existing data
          };
        })
        .filter(Boolean); // Remove nulls

      // Send form data through the stream
      dataStream.write({
        type: 'data-form',
        data: {
          id: formId,
          modelId: model.id,
          modelName: model.name,
          formName: selectedForm?.name || selectedForm?.formName,
          recordId: recordId, // Include recordId for editing
          title: isEditing ? `Edit: ${formTitle}` : formTitle,
          description: formDescription,
          fields,
          submitButtonText: isEditing ? 'Update' : 'Create',
          isEditing,
        },
        transient: false,
      });

      return {
        formId,
        modelName,
        recordId: recordId,
        isEditing,
        message: isEditing
          ? `Form for editing "${modelName}" record has been presented to the user. Waiting for submission.`
          : `Form for creating new "${modelName}" has been presented to the user. Waiting for submission.`,
      };
    },
  });

