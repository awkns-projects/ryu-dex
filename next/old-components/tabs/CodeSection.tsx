'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { XIcon, PlusIcon, SparklesIcon, ChevronRightIcon } from 'lucide-react';
import { ActionStep } from './types';

interface CodeSectionProps {
  step: ActionStep;
  actionName: string;
  actionDescription: string;
  targetModel: string;
  onStepUpdate: (updatedStep: ActionStep) => void;
  onGenerateCode: () => void;
  isGeneratingCode: boolean;
}

export function CodeSection({ 
  step, 
  actionName, 
  actionDescription, 
  targetModel, 
  onStepUpdate, 
  onGenerateCode, 
  isGeneratingCode 
}: CodeSectionProps) {
  const [isCodeSectionCollapsed, setIsCodeSectionCollapsed] = useState(true);
  const [isEnvVarsCollapsed, setIsEnvVarsCollapsed] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);

  const updateStep = (updates: Partial<ActionStep>) => {
    onStepUpdate({ ...step, ...updates });
  };

  const handleDeploy = async () => {
    if (!actionName || !step.code) {
      alert('Please ensure action name and generated code are present before deploying.');
      return;
    }

    setIsDeploying(true);
    try {
      const stepName = step.name || 'custom-step';
      const sanitizedStepName = stepName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      
      const response = await fetch('/api/deploy-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepName: sanitizedStepName,
          code: step.code,
          environmentVariables: step.envVars?.reduce((acc, env) => {
            if (env.key && env.value && !env.isOAuth) {
              acc[env.key] = env.value;
            }
            return acc;
          }, {} as Record<string, string>) || {},
          npmPackages: step.npmPackages || [],
          description: step.prompt || `Custom processing step: ${stepName}`,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Deployment failed: ${response.status} ${errorText}`);
      }

      const deploymentResult = await response.json();
      
      updateStep({
        deployment: {
          url: deploymentResult.url,
          deploymentId: deploymentResult.deploymentId,
          projectId: deploymentResult.projectId,
          deployedAt: new Date().toISOString(),
          status: 'deployed'
        }
      });
      
      console.log('✅ Deployment successful:', deploymentResult);
      alert(`🎉 Deployment successful!\n\nAPI endpoint is live at:\n${deploymentResult.url}\n\nYou can now call this endpoint with your custom processing logic.`);
      
    } catch (error) {
      console.error('❌ Deployment failed:', error);
      alert(`❌ Deployment failed:\n\n${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease check your deployment configuration.`);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Code Generation Button */}
      <div className="flex items-center justify-between">
        <div>
          <Label>Code Generation</Label>
          <p className="text-xs text-muted-foreground">
            AI will generate Node.js code based on your processing description and field definitions
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onGenerateCode}
          disabled={isGeneratingCode || !step.prompt}
          className="gap-2"
        >
          {isGeneratingCode ? (
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
          ) : (
            <SparklesIcon className="h-4 w-4" />
          )}
          {isGeneratingCode ? 'Generating...' : 'Generate Code'}
        </Button>
      </div>

      {/* Generated Code Details - Collapsible Section */}
      {step.code && (
        <Collapsible open={!isCodeSectionCollapsed} onOpenChange={(open) => setIsCodeSectionCollapsed(!open)}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded-md transition-colors">
            <div className="text-left flex-1">
              <Label className="text-sm font-medium">Generated Code Details</Label>
              <p className="text-xs text-muted-foreground mt-1">
                View generated code, explanation, and dependencies
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  updateStep({ 
                    code: '', 
                    envVars: [], 
                    npmPackages: [], 
                    explanation: '' 
                  });
                }}
                className="gap-1 text-xs"
                title="Clear all generated code"
              >
                <XIcon className="h-3 w-3" />
                Clear
              </Button>
              <ChevronRightIcon 
                className={`h-4 w-4 transition-transform flex-shrink-0 ${!isCodeSectionCollapsed ? 'rotate-90' : ''}`} 
              />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-4 pt-2">
              {/* Generated Code Section */}
              <div>
                <Label>Generated Code</Label>
                <Textarea
                  placeholder="Edit the generated code..."
                  value={step.code || ''}
                  onChange={(e) => updateStep({ code: e.target.value })}
                  className="font-mono text-sm min-h-[200px] max-h-[400px] mt-2"
                  rows={12}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Complete Next.js API route with proper imports and error handling
                </p>
              </div>

              {/* Generated Code Explanation */}
              {step.explanation && (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    💡 Code Explanation
                  </h4>
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    {step.explanation}
                  </p>
                </div>
              )}

              {/* NPM Packages Required */}
              {step.npmPackages && step.npmPackages.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                    📦 NPM Packages Required
                  </h4>
                  <div className="space-y-2">
                    {step.npmPackages.map((pkg, index) => (
                      <div key={index} className="flex items-start gap-3 p-2 bg-amber-100 dark:bg-amber-900/30 rounded">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono text-amber-800 dark:text-amber-200">
                              {pkg.name}
                            </code>
                            <Badge variant="outline" className="text-xs text-amber-700 dark:text-amber-300">
                              {pkg.version}
                            </Badge>
                          </div>
                          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                            {pkg.reason}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Environment Variables - Only show when code exists */}
      {step.code && (
        <Collapsible open={!isEnvVarsCollapsed} onOpenChange={(open) => setIsEnvVarsCollapsed(!open)}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded-md transition-colors">
            <div className="text-left flex-1">
              <Label className="text-sm font-medium">Environment Variables</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Environment variables required by your generated code
              </p>
              {isEnvVarsCollapsed && step.envVars && step.envVars.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {step.envVars.slice(0, 3).map((envVar, index) => (
                    <Badge key={index} variant="secondary" className="text-[10px] px-1 py-0">
                      {envVar.isOAuth ? '🔐' : '🔧'} {envVar.key || 'ENV_VAR'}
                    </Badge>
                  ))}
                  {step.envVars.length > 3 && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                      +{step.envVars.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <ChevronRightIcon 
              className={`h-4 w-4 transition-transform flex-shrink-0 ${!isEnvVarsCollapsed ? 'rotate-90' : ''}`} 
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-2 pt-2">
              {step.envVars?.map((envVar, index) => (
                <div key={index} className="space-y-2 p-3 border rounded-lg bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="ENV_VAR_KEY"
                      value={envVar.key}
                      onChange={(e) => {
                        const envVars = [...(step.envVars || [])];
                        envVars[index] = { ...envVars[index], key: e.target.value };
                        updateStep({ envVars });
                      }}
                      className="font-mono text-sm flex-1"
                    />
                    {envVar.isOAuth ? (
                      <Badge variant="default" className="text-xs">
                        🔐 OAuth Available
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Manual Setup
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const envVars = (step.envVars || []).filter((_, i) => i !== index);
                        updateStep({ envVars });
                      }}
                      className="px-2"
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  {envVar.isOAuth ? (
                    <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-2 rounded">
                      🔐 This token will be automatically provided via OAuth integration
                    </div>
                  ) : (
                    <Input
                      placeholder="Environment variable value"
                      value={envVar.value}
                      onChange={(e) => {
                        const envVars = [...(step.envVars || [])];
                        envVars[index] = { ...envVars[index], value: e.target.value };
                        updateStep({ envVars });
                      }}
                      className="text-sm"
                      type="password"
                    />
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const envVars = [...(step.envVars || []), { key: '', value: '', isOAuth: false }];
                  updateStep({ envVars });
                }}
                className="gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Add Environment Variable
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Deploy to Vercel Button - Only show when code exists */}
      {step.code && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Deploy to Vercel</Label>
            <Button
              variant="default"
              size="sm"
              onClick={handleDeploy}
              disabled={isDeploying || !actionName || !step.code}
              className="gap-2"
            >
              {isDeploying ? (
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              ) : (
                <SparklesIcon className="h-4 w-4" />
              )}
              {isDeploying ? 'Deploying...' : 'Deploy to Vercel'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Deploy your custom processing code as an API endpoint on Vercel
          </p>
          
          {/* Show deployment status if deployed */}
          {step.deployment && (
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <h4 className="text-sm font-medium text-green-900 dark:text-green-100">
                  ✅ Deployed Successfully
                </h4>
              </div>
              <div className="space-y-1 text-xs text-green-800 dark:text-green-200">
                <div>
                  <strong>API Endpoint:</strong>{' '}
                  <a 
                    href={step.deployment.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                  >
                    {step.deployment.url}
                  </a>
                </div>
                <div>
                  <strong>Deployed:</strong> {new Date(step.deployment.deployedAt).toLocaleString()}
                </div>
                <div>
                  <strong>Status:</strong> {step.deployment.status}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 