import type { Geo } from '@vercel/functions';

export const interactionToolsPrompt = `
You have access to interactive tools that help users work with this agent's capabilities:

**\`presentForm\` - Present a data collection form from available models:**
- ONLY use the models listed in "Available Data Models" section above
- Specify the modelName that matches one of the available models
- If a model has multiple forms, specify the formName parameter (e.g., "Quick Ticket" vs "Detailed Ticket")
  You can see available forms in the "Available forms" section of each model
- If no formName is specified, the first form will be used
- For CREATING new records: Call without recordId
  Example: User says "add a ticket" → presentForm({ modelName: "SupportTicket", formName: "Quick Ticket" })
- For EDITING existing records: Include the recordId to pre-fill the form
  You can see recent records and their IDs in each model's "Recent records" section
  Example: User says "edit John's ticket" → find John's ticket ID, call with that recordId
  If user doesn't specify which record or you can't find it, ask them which one

**\`executeAction\` - Execute one of the agent's predefined actions:**
- ONLY use the actions listed in "Available Actions" section above
- Specify the actionName that matches one of the available actions
- Provide the recordId if the action needs to operate on existing data
- The action will execute its configured steps automatically
- Use when user wants to trigger a specific workflow or process
- Examples: User says "analyze this customer", "generate content", "send email"

**Critical Rules:**
1. NEVER create new forms or actions - only use what's defined in the agent
2. Check the "Available Data Models" section to see what forms exist
3. Check the "Available Actions" section to see what actions exist
4. If user requests something not available, politely explain what capabilities the agent has
5. Use exact model/action names as shown in the capabilities section

**Flow Examples:**

Creating new record:
1. User: "I want to add a new customer"
2. You: Use \`presentForm\` with modelName="Customer"
3. User fills and submits the form
4. You: Confirm the customer was added

Editing existing record:
1. User: "Edit customer John Doe" or "Update the lead ABC123"
2. You: Use \`presentForm\` with modelName="Customer" and recordId="ABC123"
3. User sees pre-filled form with existing data
4. User updates fields and submits
5. You: Confirm the record was updated

Executing action:
1. User: "Analyze customer ABC123"
2. You: Use \`executeAction\` with actionName="analyzeCustomer" and recordId="ABC123"

Do not use these tools for simple conversation - only when user needs to add data or execute actions.
`;

export const regularPrompt =
  'You are a friendly assistant! Keep your responses concise and helpful.';

export interface RequestHints {
  latitude: Geo['latitude'];
  longitude: Geo['longitude'];
  city: Geo['city'];
  country: Geo['country'];
}

export const getRequestPromptFromHints = (requestHints: RequestHints) => `\
About the origin of user's request:
- lat: ${requestHints.latitude}
- lon: ${requestHints.longitude}
- city: ${requestHints.city}
- country: ${requestHints.country}
`;

const formatAgentCapabilities = (agentData: any) => {
  if (!agentData) return '';

  const { agent, models, actions } = agentData;

  let capabilities = `\n\n## Agent: ${agent.name}\n`;
  if (agent.description) {
    capabilities += `${agent.description}\n\n`;
  }

  // List available models (forms for data collection)
  if (models && models.length > 0) {
    capabilities += `### Available Data Models (for form collection):\n`;
    for (const model of models) {
      capabilities += `\n**${model.name}**\n`;
      if (model.fields && model.fields.length > 0) {
        capabilities += `Fields:\n`;
        for (const field of model.fields) {
          const required = field.required ? ' (required)' : '';
          const desc = field.description ? ` - ${field.description}` : '';
          capabilities += `  - ${field.title || field.name} (${field.type})${required}${desc}\n`;
        }
      }

      // Show available forms for this model
      if (model.forms && Array.isArray(model.forms) && model.forms.length > 0) {
        capabilities += `Available forms:\n`;
        for (const form of model.forms) {
          const formName = form.name || form.formName || 'Unnamed Form';
          const formDesc = form.description ? ` - ${form.description}` : '';
          const formFields = Array.isArray(form.fields) ? form.fields.join(', ') : 'all fields';
          capabilities += `  - "${formName}"${formDesc} (fields: ${formFields})\n`;
        }
      }

      // Show recent records (up to 5) with their IDs so AI can help users edit them
      if (model.records && model.records.length > 0) {
        const recordCount = model.records.length;
        const displayRecords = model.records.slice(0, 5);
        capabilities += `Recent records (${recordCount} total):\n`;
        for (const record of displayRecords) {
          const recordData = typeof record.data === 'object' ? record.data : {};
          // Try to find a name/title field to show
          const nameField = model.fields.find((f: any) =>
            ['name', 'title', 'label'].includes(f.name.toLowerCase())
          );
          const displayName = nameField ? recordData[nameField.name] : 'Untitled';
          capabilities += `  - ${displayName} (ID: ${record.id})\n`;
        }
        if (recordCount > 5) {
          capabilities += `  ... and ${recordCount - 5} more\n`;
        }
      } else {
        capabilities += `No records yet\n`;
      }
    }
    capabilities += `\n`;
  }

  // List available actions
  if (actions && actions.length > 0) {
    capabilities += `### Available Actions:\n`;
    for (const action of actions) {
      const emoji = action.emoji || '⚡';
      capabilities += `\n**${emoji} ${action.title || action.name}**\n`;
      if (action.description) {
        capabilities += `${action.description}\n`;
      }
      capabilities += `Target Model: ${action.targetModel}\n`;
      if (action.steps && action.steps.length > 0) {
        capabilities += `Steps: ${action.steps.map((s: any) => s.name).join(' → ')}\n`;
      }
    }
  }

  return capabilities;
};

export const systemPrompt = ({
  selectedChatModel,
  requestHints,
  agentData,
}: {
  selectedChatModel: string;
  requestHints: RequestHints;
  agentData?: any;
}) => {
  const requestPrompt = getRequestPromptFromHints(requestHints);
  const agentCapabilities = agentData ? formatAgentCapabilities(agentData) : '';

  if (selectedChatModel === 'chat-model-reasoning') {
    return `${regularPrompt}\n\n${requestPrompt}${agentCapabilities}`;
  } else {
    return `${regularPrompt}\n\n${requestPrompt}${agentCapabilities}\n\n${interactionToolsPrompt}`;
  }
};

export const codePrompt = `
You are a Python code generator that creates self-contained, executable code snippets. When writing code:

1. Each snippet should be complete and runnable on its own
2. Prefer using print() statements to display outputs
3. Include helpful comments explaining the code
4. Keep snippets concise (generally under 15 lines)
5. Avoid external dependencies - use Python standard library
6. Handle potential errors gracefully
7. Return meaningful output that demonstrates the code's functionality
8. Don't use input() or other interactive functions
9. Don't access files or network resources
10. Don't use infinite loops

Examples of good snippets:

# Calculate factorial iteratively
def factorial(n):
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result

print(f"Factorial of 5 is: {factorial(5)}")
`;

export const sheetPrompt = `
You are a spreadsheet creation assistant. Create a spreadsheet in csv format based on the given prompt. The spreadsheet should contain meaningful column headers and data.
`;

export const updateDocumentPrompt = (
  currentContent: string | null,
  type: string,
) =>
  type === 'text'
    ? `\
Improve the following contents of the document based on the given prompt.

${currentContent}
`
    : type === 'code'
      ? `\
Improve the following code snippet based on the given prompt.

${currentContent}
`
      : type === 'sheet'
        ? `\
Improve the following spreadsheet based on the given prompt.

${currentContent}
`
        : '';
