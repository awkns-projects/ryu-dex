export interface ActionStep {
  name: string;
  type: 'ai_reasoning' | 'web_search' | 'custom' | 'image_generation';
  prompt: string;
  code: string;
  envVars: Array<{key: string, value: string, isOAuth: boolean}>;
  inputFields: string[];
  outputFields: string[];
  customFieldTypes: Record<string, { fieldType: string, enumValues?: string[] }>;
  npmPackages?: Array<{name: string, version: string, reason: string}>;
  explanation?: string;
  deployment?: {
    url: string;
    deploymentId: string;
    projectId: string;
    deployedAt: string;
    status: string;
  };
}

export interface NewAction {
  name: string;
  description: string;
  targetModel: string;
  steps: ActionStep[];
} 