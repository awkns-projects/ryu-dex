import { z } from 'zod';

// Build AI schema for step outputs based on actual field definitions
export function buildStepOutputSchema(outputFields: string[], targetModel: any, agent: any) {
  const outputSchema: any = {};
  
  outputFields.forEach((fieldName: string) => {
    // Find the actual field definition in the target model
    const fieldDef = targetModel?.fields?.find((f: any) => f.name === fieldName);
    
    if (!fieldDef) {
      console.warn(`⚠️ Field ${fieldName} not found in model ${targetModel?.name}, using string fallback`);
      outputSchema[fieldName] = z.string().describe(`Generated ${fieldName} (field not found in model)`);
      return;
    }

    console.log(`🔍 Building schema for ${fieldName} (${fieldDef.type}${fieldDef.referenceType ? ` ${fieldDef.referenceType}` : ''})`);

    // Generate schema based on actual field type
    switch (fieldDef.type) {
      case 'text':
        outputSchema[fieldName] = z.string().describe(`${fieldDef.description || fieldDef.title || fieldName} (text field)`);
        break;
        
      case 'number':
        outputSchema[fieldName] = z.number().describe(`${fieldDef.description || fieldDef.title || fieldName} (number field)`);
        break;
        
      case 'boolean':
        outputSchema[fieldName] = z.boolean().describe(`${fieldDef.description || fieldDef.title || fieldName} (boolean field)`);
        break;
        
      case 'date':
        outputSchema[fieldName] = z.string().describe(`${fieldDef.description || fieldDef.title || fieldName} (date field in YYYY-MM-DD format)`);
        break;
        
             case 'reference':
         if (fieldDef.referenceType === 'to_many' && fieldDef.referencesModel) {
           // This is a to_many relationship field - output should be a complete model object
           const referencedModel = agent.models.find((m: any) => m.name === fieldDef.referencesModel);
           console.log(`🏗️ TO_MANY RELATIONSHIP: ${fieldName} outputs ${fieldDef.referencesModel} model object`);
           
           if (referencedModel) {
             const recordSchema = buildModelSchema(referencedModel, targetModel);
             outputSchema[fieldName] = z.object(recordSchema).describe(
               `Complete ${fieldDef.referencesModel} record object. This creates a new ${fieldDef.referencesModel} record.`
             );
           } else {
             console.warn(`⚠️ Referenced model ${fieldDef.referencesModel} not found`);
             outputSchema[fieldName] = z.string().describe(`Reference to ${fieldDef.referencesModel} (model not found)`);
           }
         } else if (fieldDef.referenceType === 'to_one' && fieldDef.referencesModel) {
           // This is a to_one relationship field - output should be a reference ID or model selection
           console.log(`🔗 TO_ONE RELATIONSHIP: ${fieldName} references ${fieldDef.referencesModel} ID`);
           
           // Get available records for validation
           const referencedModel = agent.models.find((m: any) => m.name === fieldDef.referencesModel);
           if (referencedModel) {
             // For to_one outputs, AI should select from existing records
             outputSchema[fieldName] = z.string().describe(
               `Reference ID to an existing ${fieldDef.referencesModel} record. Choose from available ${fieldDef.referencesModel} records.`
             );
           } else {
             outputSchema[fieldName] = z.string().describe(`Reference ID to a ${fieldDef.referencesModel} record`);
           }
         } else {
           console.warn(`⚠️ Unknown reference configuration for ${fieldName}`);
           outputSchema[fieldName] = z.string().describe(`Reference field ${fieldName}`);
         }
        break;
        
      default:
        console.log(`📝 UNKNOWN FIELD TYPE: ${fieldName} (${fieldDef.type})`);
        outputSchema[fieldName] = z.string().describe(`Generated ${fieldName} (unknown type: ${fieldDef.type})`);
    }
  });

  return z.object(outputSchema);
}

// Build schema for input fields to understand what data is available
export function buildStepInputContext(inputFields: string[], currentData: any, targetModel: any, agent?: any) {
  const inputContext: string[] = [];
  
  inputFields.forEach((fieldName: string) => {
    const fieldDef = targetModel?.fields?.find((f: any) => f.name === fieldName);
    const value = currentData[fieldName];
    
    if (fieldDef) {
      let fieldDescription = `${fieldName} (${fieldDef.type}`;
      
      if (fieldDef.type === 'reference') {
        fieldDescription += ` ${fieldDef.referenceType} → ${fieldDef.referencesModel}`;
        
        // For to_one references, try to resolve the referenced data
        if (fieldDef.referenceType === 'to_one' && agent && value) {
          const referencedModel = agent.models.find((m: any) => m.name === fieldDef.referencesModel);
          if (referencedModel) {
            const referencedRecord = referencedModel.records?.find((r: any) => r.id === value);
            if (referencedRecord) {
              fieldDescription += ` - Referenced data: ${JSON.stringify(referencedRecord, null, 2)}`;
            }
          }
        }
      }
      
      fieldDescription += `): ${value}`;
      inputContext.push(fieldDescription);
    } else {
      inputContext.push(`${fieldName}: ${value} (field definition not found)`);
    }
  });
  
  return inputContext.join('\n');
}

// Build Zod schema for a model's fields
function buildModelSchema(model: any, excludeBackReferenceTo?: any) {
  const recordSchema: any = {};
  
  model.fields?.forEach((field: any) => {
    // Skip back-references to avoid circular dependencies
    if (field.type === 'reference' && 
        excludeBackReferenceTo && 
        field.referencesModel === excludeBackReferenceTo.name) {
      return;
    }
    
    switch (field.type) {
      case 'text':
        recordSchema[field.name] = z.string().describe(`${field.description || field.title || field.name}`);
        break;
      case 'number':
        recordSchema[field.name] = z.number().describe(`${field.description || field.title || field.name}`);
        break;
      case 'boolean':
        recordSchema[field.name] = z.boolean().describe(`${field.description || field.title || field.name}`);
        break;
      case 'date':
        recordSchema[field.name] = z.string().describe(`${field.description || field.title || field.name} (YYYY-MM-DD format)`);
        break;
      case 'reference':
        if (field.referenceType === 'to_one') {
          recordSchema[field.name] = z.string().describe(`Reference ID to ${field.referencesModel} record`);
        } else {
          recordSchema[field.name] = z.array(z.string()).describe(`Array of reference IDs to ${field.referencesModel} records`);
        }
        break;
      default:
        recordSchema[field.name] = z.string().describe(`${field.description || field.title || field.name} (${field.type})`);
    }
  });
  
  return recordSchema;
} 