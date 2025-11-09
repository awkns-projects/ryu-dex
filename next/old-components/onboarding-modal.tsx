'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircleIcon, 
  ArrowRightIcon, 
  ArrowLeftIcon, 
  PlayIcon, 
  DatabaseIcon,
  SettingsIcon,
  ClockIcon,
  SparklesIcon,
  ChevronRightIcon,
  LoaderIcon,
  XCircleIcon,
  SearchIcon,
  EyeIcon
} from 'lucide-react';
import { AgentData, AgentModel, AgentField } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OAUTH_TOKENS, isOAuthToken as checkIsOAuthToken } from '@/lib/oauth-constants';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SchedulePreview } from '@/components/schedule-preview';
import { ScheduleExecution } from '@/components/schedule-execution';


interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentData: AgentData;
  setAgentData: (data: AgentData) => void;
  onCreateRecord: (record: Record<string, any>) => void;
  getDisplayValueForReference: (referenceId: string, referencedModelName: string) => string;
  getReferencedModelRecords: (modelName: string) => any[];
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
}

export function OnboardingModal({ 
  isOpen, 
  onClose, 
  agentData, 
  setAgentData,
  onCreateRecord,
  getDisplayValueForReference,
  getReferencedModelRecords
}: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [rootModel, setRootModel] = useState<AgentModel | null>(null);
  const [hasCustomSteps, setHasCustomSteps] = useState(false);
  const [requiredEnvVars, setRequiredEnvVars] = useState<string[]>([]);
  
  // Create record form state
  const [newRecord, setNewRecord] = useState<Record<string, any>>({});
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({});
  const [isGeneratingExamples, setIsGeneratingExamples] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  
  // Schedule execution state
  const [showScheduleExecution, setShowScheduleExecution] = useState(false);
  const [scheduleExecutionComplete, setScheduleExecutionComplete] = useState(false);
  const [expandedSchedules, setExpandedSchedules] = useState<Set<string>>(new Set());
  const [enrichedSchedules, setEnrichedSchedules] = useState(agentData.schedules || []);
  
  // Custom step deployment status
  const [customStepsDeployed, setCustomStepsDeployed] = useState(true);
  const [deploymentStatus, setDeploymentStatus] = useState<string>('');

  // Initialize root model and check for custom steps
  useEffect(() => {
    if (agentData.rootModel) {
      const model = agentData.models.find(m => m.name === agentData.rootModel);
      setRootModel(model || agentData.models[0] || null);
    } else {
      setRootModel(agentData.models[0] || null);
    }

    // Check if any actions have custom steps that require environment variables
    const customSteps = agentData.actions.flatMap(action => 
      action.steps?.filter(step => step.type === 'custom') || []
    );
    
    const envVarsNeeded = new Set<string>();
    let allCustomStepsDeployed = true;
    let deploymentMessage = '';
    
    customSteps.forEach(step => {
      // Check if step config has envVars (array of strings like ["API_KEY", "DATABASE_URL"])
      if (step.config?.envVars && Array.isArray(step.config.envVars)) {
        step.config.envVars.forEach((envVar: string) => {
          // envVars is just an array of strings, not objects
          if (envVar && typeof envVar === 'string') {
            envVarsNeeded.add(envVar);
          }
        });
      }
      
      // Check deployment status
      if (!step.config?.deployment || !step.config.deployment.url || step.config.deployment.status !== 'deployed') {
        allCustomStepsDeployed = false;
        deploymentMessage = `Custom step "${step.name}" is not deployed yet. Please wait for deployment to complete.`;
      }
    });

    setHasCustomSteps(customSteps.length > 0);
    setRequiredEnvVars(Array.from(envVarsNeeded));
    setCustomStepsDeployed(allCustomStepsDeployed);
    setDeploymentStatus(deploymentMessage);
  }, [agentData]);

  // Load enriched schedule data when modal opens
  useEffect(() => {
    if (isOpen && agentData.id) {
      const loadEnrichedSchedules = async () => {
        try {
          const response = await fetch(`/api/agent/schedule?agentId=${agentData.id}`);
          if (response.ok) {
            const { schedules } = await response.json();
            setEnrichedSchedules(schedules || []);
          }
        } catch (error) {
          console.error('Failed to load enriched schedules:', error);
          // Fallback to original schedules
          setEnrichedSchedules(agentData.schedules || []);
        }
      };
      loadEnrichedSchedules();
    }
  }, [isOpen, agentData.id]);

  // Note: Polling removed - deployment now happens synchronously after env vars are entered

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome',
      description: 'Learn what this agent can do for you.',
      icon: SparklesIcon,
      completed: true // Always completed since it's just informational
    },
    {
      id: 'create-record',
      title: 'Create Your First Record',
      description: `Create your first ${rootModel?.name || 'record'} to get started with your agent.`,
      icon: DatabaseIcon,
      completed: (rootModel?.records && rootModel.records.length > 0) || false
    },
    {
      id: 'configure-env',
      title: 'Configure Environment',
      description: 'Set up environment variables for custom processing actions.',
      icon: SettingsIcon,
      completed: !hasCustomSteps || requiredEnvVars.every(key => envVars[key])
    },
    {
      id: 'start-schedule',
      title: 'Start Automation',
      description: 'Run your first schedule to see your agent in action.',
      icon: ClockIcon,
      completed: scheduleExecutionComplete
    }
  ];

  // Filter steps based on what's actually needed
  const activeSteps = steps.filter(step => {
    if (step.id === 'configure-env' && (!hasCustomSteps || requiredEnvVars.length === 0)) {
      return false;
    }
    return true;
  });

  const currentStepData = activeSteps[currentStep];
  const progress = ((currentStep + 1) / activeSteps.length) * 100;

  const handleNext = () => {
    if (currentStep < activeSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateRecord = () => {
    if (!rootModel) return;
    
    // Validate required fields
    const requiredFields = rootModel.fields.filter((f: AgentField) => f.required);
    const isValid = requiredFields.every((f: AgentField) => newRecord[f.name]);
    
    if (!isValid) return;
    
    onCreateRecord(newRecord);
    setNewRecord({});
    
    // Don't auto-advance - let user click Next to proceed
  };

  const toggleOpen = (fieldName: string, isOpen: boolean) => {
    setOpenStates(prev => ({ ...prev, [fieldName]: isOpen }));
  };

  const handleGenerateExamples = async () => {
    setIsGeneratingExamples(true);
    try {
      const response = await fetch('/api/agent/generate-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agentData.id,
          count: 3 // Generate 3 example records
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('Failed to generate examples:', result.error);
        return;
      }

      // Update local state with generated records
      const updatedAgentData = {
        ...agentData,
        models: agentData.models.map(model => {
          const generatedRecords = result.records[model.name] || [];
          const formattedRecords = generatedRecords.map((record: any) => ({
            ...record,
            ...record.data
          }));
          
          return {
            ...model,
            records: [...(model.records || []), ...formattedRecords]
          };
        })
      };

      setAgentData(updatedAgentData);
      
      // Show success message - don't auto-advance  
      const totalRecords = Object.values(result.recordCounts as Record<string, number>).reduce((sum, count) => sum + count, 0);
      console.log(`✅ Generated ${totalRecords} example records successfully`);
      
      // The success state will now show the generated records automatically since rootModel.records has been updated
      
    } catch (error) {
      console.error('Error generating examples:', error);
    } finally {
      setIsGeneratingExamples(false);
    }
  };

  const handleEnvVarChange = (key: string, value: string) => {
    setEnvVars(prev => ({ ...prev, [key]: value }));
  };

  // OAuth configuration - using standardized token names
  const oauthProviders = {
    [OAUTH_TOKENS.FACEBOOK]: {
      name: 'Facebook',
      icon: '👤',
      color: 'bg-blue-600 hover:bg-blue-700',
      authUrl: '/api/auth/facebook'
    },
    [OAUTH_TOKENS.INSTAGRAM]: {
      name: 'Instagram',
      icon: '📸',
      color: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
      authUrl: '/api/auth/instagram'
    },
    [OAUTH_TOKENS.X_TWITTER]: {
      name: 'X (Twitter)',
      icon: '𝕏',
      color: 'bg-black hover:bg-gray-900',
      authUrl: '/api/auth/x'
    },
    [OAUTH_TOKENS.THREADS]: {
      name: 'Threads',
      icon: '🧵',
      color: 'bg-black hover:bg-gray-900',
      authUrl: '/api/auth/threads'
    }
  };

  // Use shared OAuth token detection
  const isOAuthToken = (envVar: string): boolean => {
    return checkIsOAuthToken(envVar);
  };

  const handleOAuthConnect = async (envVar: string) => {
    const provider = oauthProviders[envVar as keyof typeof oauthProviders];
    if (!provider) return;

    // Open OAuth flow in popup
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      provider.authUrl,
      `${provider.name} OAuth`,
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Listen for OAuth callback
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'oauth-success' && event.data.provider === envVar) {
        setEnvVars(prev => ({ ...prev, [envVar]: event.data.token }));
        window.removeEventListener('message', handleMessage);
        popup?.close();
      }
    };

    window.addEventListener('message', handleMessage);
  };

  const [isDeployingSteps, setIsDeployingSteps] = useState(false);
  
  const handleSaveEnvVars = async () => {
    console.log('💾 Saving environment variables and deploying custom steps:', envVars);
    setIsDeployingSteps(true);
    
    try {
      // Deploy all custom steps with env vars
      const customSteps = agentData.actions.flatMap(action => 
        action.steps?.filter(step => step.type === 'custom' && step.config?.code && !step.config?.deployment) || []
      );
      
      if (customSteps.length === 0) {
        console.log('No custom steps to deploy');
        handleNext();
        return;
      }
      
      console.log(`🚀 Deploying ${customSteps.length} custom steps with env vars...`);
      
      // Deploy each custom step
      for (const step of customSteps) {
        try {
          console.log(`🔧 Deploying step: ${step.name}`);
          
          const response = await fetch('/api/deploy-step', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              stepId: step.id,
              stepName: step.name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
              code: step.config.code,
              environmentVariables: envVars, // Pass the env vars
              npmPackages: step.config.dependencies?.map((dep: any) => ({
                name: dep.name,
                version: dep.version
              })) || [],
              description: step.config.description || `Custom processing step: ${step.name}`,
            }),
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Deployment failed: ${response.status} ${errorText}`);
          }
          
          const deploymentResult = await response.json();
          console.log(`✅ Deployed ${step.name}:`, deploymentResult.url);
          
          // Update the step in the database with deployment info
          await fetch(`/api/agent/action/${step.actionId}/step/${step.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              deployment: {
                url: deploymentResult.url,
                deploymentId: deploymentResult.deploymentId,
                projectId: deploymentResult.projectId,
                deploymentUrl: deploymentResult.deploymentUrl,
                deployedAt: new Date().toISOString(),
                status: 'deployed'
              }
            }),
          });
          
        } catch (error) {
          console.error(`❌ Failed to deploy step ${step.name}:`, error);
          throw error; // Propagate error to show to user
        }
      }
      
      console.log('✅ All custom steps deployed successfully!');
      
      // Mark as deployed and move to next step
      setCustomStepsDeployed(true);
      handleNext();
      
    } catch (error) {
      console.error('❌ Deployment failed:', error);
      alert(`Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsDeployingSteps(false);
    }
  };

  const handleExecuteSchedule = async () => {
    const firstSchedule = enrichedSchedules?.[0];
    if (!firstSchedule) return;

    // Show the schedule execution component
    setShowScheduleExecution(true);
  };

  const executeFirstSchedule = async () => {
    const firstSchedule = enrichedSchedules?.[0];
    if (!firstSchedule) {
      throw new Error('No schedule found to execute');
    }
    
    return { scheduleId: firstSchedule.id };
  };

  const getFirstScheduleSteps = () => {
    const firstSchedule = enrichedSchedules?.[0];
    if (!firstSchedule?.steps) return [];
    
    return firstSchedule.steps.map(step => ({
      id: step.id,
      modelId: step.modelId,
      query: step.query || '',
      actionId: step.actionId,
      order: step.order,
    }));
  };

  const toggleScheduleExpanded = (scheduleId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedSchedules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(scheduleId)) {
        newSet.delete(scheduleId);
      } else {
        newSet.add(scheduleId);
      }
      return newSet;
    });
  };

  // Add this helper component after the imports and before the main component
  const RecordPreview = ({ record, fields }: { record: Record<string, any>, fields: AgentField[] }) => {
    const formatFieldValue = (field: AgentField, value: any) => {
      if (value === null || value === undefined || value === '') return 'Not set';
      
      switch (field.type) {
        case 'boolean':
          return value ? 'Yes' : 'No';
        case 'date':
          return new Date(value).toLocaleDateString();
        case 'json':
          return JSON.stringify(value, null, 2);
        case 'reference':
          return value?.toString() || 'Not set';
        default:
          return value.toString();
      }
    };

    return (
      <div className="bg-muted/30 rounded-lg p-3 space-y-2">
        {fields.slice(0, 4).map((field) => ( // Show first 4 fields to avoid clutter
          <div key={field.name} className="flex justify-between items-start gap-2">
            <span className="text-xs font-medium text-muted-foreground min-w-0 flex-shrink-0">
              {field.title}:
            </span>
            <span className="text-xs text-right flex-1 min-w-0">
              <span className="break-words">
                {formatFieldValue(field, record[field.name])}
              </span>
            </span>
          </div>
        ))}
        {fields.length > 4 && (
          <div className="text-xs text-muted-foreground text-center pt-1 border-t">
            +{fields.length - 4} more fields
          </div>
        )}
      </div>
    );
  };


  const renderStepContent = () => {
    if (!currentStepData) return null;

    switch (currentStepData.id) {
      case 'welcome':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center space-y-2 sm:space-y-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center">
                <SparklesIcon className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="px-2">
                <h3 className="text-lg sm:text-2xl font-bold leading-tight">{agentData.name}</h3>
                {agentData.description && (
                  <p className="text-sm sm:text-base text-muted-foreground mt-2 sm:mt-3 leading-relaxed max-w-xl mx-auto">
                    {agentData.description}
                  </p>
                )}
              </div>
            </div>

            <Card className="border-2">
              <CardHeader className="p-4 sm:p-6 pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <DatabaseIcon className="h-5 w-5 text-blue-600" />
                  What This Agent Does
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
                {/* Data Models Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                      {agentData.models.length}
                    </div>
                    <h4 className="text-sm font-semibold">Data Models</h4>
                  </div>
                  <div className="pl-8 space-y-2">
                    {agentData.models.slice(0, 3).map((model, index) => (
                      <div key={model.id} className="flex items-start gap-2 text-sm">
                        <Badge variant="outline" className="text-xs">
                          {model.name}
                        </Badge>
                        <span className="text-muted-foreground text-xs">
                          {model.fields.length} fields
                        </span>
                      </div>
                    ))}
                    {agentData.models.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{agentData.models.length - 3} more models
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions Section */}
                {agentData.actions && agentData.actions.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-xs font-bold text-green-600 dark:text-green-400">
                        {agentData.actions.length}
                      </div>
                      <h4 className="text-sm font-semibold">AI-Powered Actions</h4>
                    </div>
                    <div className="pl-8 space-y-2">
                      {agentData.actions.slice(0, 3).map((action) => (
                        <div key={action.id} className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            {action.emoji && <span className="text-base">{action.emoji}</span>}
                            <span className="font-medium">{action.title || action.name}</span>
                          </div>
                          {action.description && (
                            <p className="text-xs text-muted-foreground pl-6">
                              {action.description}
                            </p>
                          )}
                        </div>
                      ))}
                      {agentData.actions.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{agentData.actions.length - 3} more actions
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Schedules Section */}
                {agentData.schedules && agentData.schedules.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-xs font-bold text-purple-600 dark:text-purple-400">
                        {agentData.schedules.length}
                      </div>
                      <h4 className="text-sm font-semibold">Automated Schedules</h4>
                    </div>
                    <div className="pl-8 space-y-2">
                      {agentData.schedules.slice(0, 2).map((schedule) => (
                        <div key={schedule.id} className="flex items-start gap-2 text-sm">
                          <ClockIcon className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">{schedule.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {schedule.mode === 'recurring' 
                                ? `Runs every ${schedule.intervalHours || 24} hours`
                                : 'One-time execution'
                              }
                            </p>
                          </div>
                        </div>
                      ))}
                      {agentData.schedules.length > 2 && (
                        <p className="text-xs text-muted-foreground">
                          +{agentData.schedules.length - 2} more schedules
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* How It Works */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <SparklesIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                        How It Works
                      </h4>
                    </div>
                    <ol className="space-y-1.5 text-xs text-blue-800 dark:text-blue-200 pl-6 list-decimal">
                      <li>Create records in your data models</li>
                      <li>Run AI-powered actions to process and enhance them</li>
                      <li>Schedules automatically run actions at set intervals</li>
                      <li>Watch your data grow and evolve with AI assistance</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <ArrowRightIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Ready to get started?
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                    Click "Next" to create your first record and see your agent in action!
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'create-record':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center space-y-2 sm:space-y-4">
              <div className="w-10 h-10 sm:w-16 sm:h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <DatabaseIcon className="h-5 w-5 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="px-2">
                <h3 className="text-sm sm:text-lg font-semibold leading-tight">Create Your First {rootModel?.name}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2 leading-relaxed">
                  This is your starting point. {rootModel?.name} records serve as templates that will automatically generate other content through AI.
                </p>
              </div>
            </div>

                        {rootModel?.records && rootModel.records.length > 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Records Created Successfully!</p>
                        <p className="text-sm text-muted-foreground">
                          You have {rootModel.records.length} {rootModel.name} record(s) ready.
                        </p>
                      </div>
                    </div>

                    {/* Display the created records */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <EyeIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Created Records Preview</span>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {rootModel.records?.slice(-3).map((record, index) => ( // Show last 3 records (most recent)
                          <div key={record.id || index} className="border rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400">
                                {index + 1}
                              </div>
                              <span className="text-sm font-medium">{rootModel.name} #{(rootModel.records?.length || 0) - 2 + index}</span>
                            </div>
                            <RecordPreview record={record} fields={rootModel.fields} />
                          </div>
                        ))}
                        {(rootModel.records?.length || 0) > 3 && (
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">
                              Showing {Math.min(3, rootModel.records?.length || 0)} of {rootModel.records?.length || 0} records
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <ArrowRightIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            Ready for the next step!
                          </p>
                          <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                            Click "Next" below to set up automation and see your agent in action.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : showManualForm ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Create Your First {rootModel?.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowManualForm(false)}
                      className="text-muted-foreground"
                    >
                      ← Back to options
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6">
                  {rootModel?.fields.map((field: AgentField) => {
                    // Skip AI-generated fields in create form
                    if (field.description?.includes('AI-generated')) {
                      return null;
                    }

                    switch (field.type) {
                      case 'text':
                        return (
                          <div key={field.name} className="space-y-2">
                            <Label htmlFor={field.name} className="text-sm font-medium">
                              {field.title}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            {field.name.toLowerCase().includes('notes') || field.name.toLowerCase().includes('description') ? (
                              <Textarea
                                id={field.name}
                                placeholder={`Enter ${field.title.toLowerCase()}`}
                                value={newRecord[field.name] || ''}
                                onChange={(e) => setNewRecord(prev => ({ ...prev, [field.name]: e.target.value }))}
                                className="min-h-[80px] resize-none text-base sm:text-sm"
                                rows={3}
                              />
                            ) : (
                              <Input
                                id={field.name}
                                placeholder={`Enter ${field.title.toLowerCase()}`}
                                value={newRecord[field.name] || ''}
                                onChange={(e) => setNewRecord(prev => ({ ...prev, [field.name]: e.target.value }))}
                                className="text-base sm:text-sm h-10 sm:h-9"
                              />
                            )}
                            {field.description && (
                              <p className="text-xs text-muted-foreground">{field.description}</p>
                            )}
                          </div>
                        );

                      case 'number':
                        return (
                          <div key={field.name} className="space-y-2">
                            <Label htmlFor={field.name} className="text-sm font-medium">
                              {field.title}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            <Input
                              id={field.name}
                              type="number"
                              placeholder={`Enter ${field.title.toLowerCase()}`}
                              value={newRecord[field.name] || ''}
                              onChange={(e) => setNewRecord(prev => ({ ...prev, [field.name]: e.target.value }))}
                              className="text-base sm:text-sm h-10 sm:h-9"
                            />
                          </div>
                        );

                      case 'boolean':
                        return (
                          <div key={field.name} className="space-y-2">
                            <Label htmlFor={field.name} className="text-sm font-medium">{field.title}</Label>
                            <Select
                              value={newRecord[field.name]?.toString() || ''}
                              onValueChange={(value) => setNewRecord(prev => ({ ...prev, [field.name]: value === 'true' }))}
                            >
                              <SelectTrigger className="h-10 sm:h-9">
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Yes</SelectItem>
                                <SelectItem value="false">No</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        );

                      case 'date':
                        return (
                          <div key={field.name} className="space-y-2">
                            <Label htmlFor={field.name} className="text-sm font-medium">
                              {field.title}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            <Input
                              id={field.name}
                              type="date"
                              value={newRecord[field.name] || ''}
                              onChange={(e) => setNewRecord(prev => ({ ...prev, [field.name]: e.target.value }))}
                              className="text-base sm:text-sm h-10 sm:h-9"
                            />
                          </div>
                        );

                      case 'enum':
                        return (
                          <div key={field.name} className="space-y-2">
                            <Label htmlFor={field.name} className="text-sm font-medium">
                              {field.title}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            <Select
                              value={newRecord[field.name] || ''}
                              onValueChange={(value) => setNewRecord(prev => ({ ...prev, [field.name]: value }))}
                            >
                              <SelectTrigger className="h-10 sm:h-9">
                                <SelectValue placeholder={`Select ${field.title.toLowerCase()}`} />
                              </SelectTrigger>
                              <SelectContent>
                                {field.enumValues?.map(value => (
                                  <SelectItem key={value} value={value}>
                                    {value}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        );

                      default:
                        return null;
                    }
                  })}

                  <div className="pt-4">
                    <Button 
                      onClick={handleCreateRecord}
                      disabled={!rootModel?.fields.filter((f: AgentField) => f.required).every((f: AgentField) => newRecord[f.name])}
                      className="w-full gap-2 h-10 sm:h-9 text-base sm:text-sm"
                    >
                      <SparklesIcon className="h-4 w-4" />
                      Create {rootModel?.name}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Get Started with {rootModel?.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground">
                      Choose how you'd like to get started with your agent.
                    </p>
                    
                                         <div className="grid gap-2 sm:gap-4 py-1 sm:py-2">
                      <Button 
                        onClick={handleGenerateExamples}
                        disabled={isGeneratingExamples}
                        className="gap-1 sm:gap-2 h-auto p-3 sm:p-4 flex-col min-h-[70px] sm:min-h-[90px]"
                        variant="default"
                      >
                        <div className="flex items-center gap-1 sm:gap-2">
                          {isGeneratingExamples ? (
                            <LoaderIcon className="h-3 w-3 sm:h-5 sm:w-5 animate-spin" />
                          ) : (
                            <SparklesIcon className="h-3 w-3 sm:h-5 sm:w-5" />
                          )}
                          <span className="text-xs sm:text-base font-medium">
                            {isGeneratingExamples ? 'Generating...' : 'Start with Examples'}
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-sm text-muted-foreground text-center mt-0.5 sm:mt-1 px-1 sm:px-2 leading-tight">
                          {isGeneratingExamples 
                            ? 'Creating sample records...' 
                            : `AI will generate 3 sample ${rootModel?.name} records`
                          }
                        </p>
                      </Button>
                      
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">or</span>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => setShowManualForm(true)}
                        variant="outline"
                        className="gap-1 sm:gap-2 h-auto p-3 sm:p-4 flex-col min-h-[70px] sm:min-h-[90px]"
                      >
                        <div className="flex items-center gap-1 sm:gap-2">
                          <DatabaseIcon className="h-3 w-3 sm:h-5 sm:w-5" />
                          <span className="text-xs sm:text-base font-medium">Create Manually</span>
                        </div>
                        <p className="text-[10px] sm:text-sm text-muted-foreground text-center mt-0.5 sm:mt-1 px-1 sm:px-2 leading-tight">
                          Fill out the form to create your first {rootModel?.name}
                        </p>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'configure-env':
        const oauthVars = requiredEnvVars.filter(isOAuthToken);
        const regularVars = requiredEnvVars.filter(v => !isOAuthToken(v));
        
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <SettingsIcon className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold">Configure Connections</h3>
                <p className="text-sm text-muted-foreground mt-2 px-2">
                  Connect your accounts and set up required credentials for your agent.
                </p>
              </div>
            </div>

            {/* OAuth Connections */}
            {oauthVars.length > 0 && (
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <span className="text-xs">🔐</span>
                    </div>
                    Social Media Connections
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Connect your social media accounts to enable automated posting and content management.
                  </p>
                </CardHeader>
                <CardContent className="space-y-3 p-4 sm:p-6">
                  {oauthVars.map(envVar => {
                    const provider = oauthProviders[envVar as keyof typeof oauthProviders];
                    const isConnected = !!envVars[envVar];
                    
                    return (
                      <div key={envVar} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center text-xl">
                            {provider.icon}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{provider.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {isConnected ? 'Connected' : 'Not connected'}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleOAuthConnect(envVar)}
                          size="sm"
                          variant={isConnected ? "outline" : "default"}
                          className={`gap-2 ${!isConnected ? provider.color : ''}`}
                        >
                          {isConnected ? (
                            <>
                              <CheckCircleIcon className="h-4 w-4" />
                              Reconnect
                            </>
                          ) : (
                            <>
                              <span>Connect</span>
                              <ArrowRightIcon className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 mt-4">
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 bg-blue-600 dark:bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[10px] text-white">ℹ️</span>
                      </div>
                      <div>
                        <p className="text-xs text-blue-900 dark:text-blue-100 font-medium">
                          Secure OAuth Authentication
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-200 mt-1">
                          Your credentials are securely stored and never exposed. Click "Connect" to authorize access through the official OAuth flow.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Regular Environment Variables */}
            {regularVars.length > 0 && (
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <div className="w-5 h-5 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                      <span className="text-xs">🔧</span>
                    </div>
                    Environment Variables
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Configure API keys and other required credentials.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6">
                  {regularVars.map(envVar => (
                    <div key={envVar} className="space-y-2">
                      <Label htmlFor={envVar} className="text-sm font-medium flex items-center gap-2">
                        {envVar}
                        {envVars[envVar] && (
                          <CheckCircleIcon className="h-4 w-4 text-green-600" />
                        )}
                      </Label>
                      <Input
                        id={envVar}
                        type="password"
                        placeholder={`Enter ${envVar}`}
                        value={envVars[envVar] || ''}
                        onChange={(e) => handleEnvVarChange(envVar, e.target.value)}
                        className="text-base sm:text-sm h-10 sm:h-9"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            
            {requiredEnvVars.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <p className="text-sm font-medium">No Configuration Required</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your agent is ready to use without additional setup.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'start-schedule':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <ClockIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold">Start Your First Schedule</h3>
                <p className="text-sm text-muted-foreground mt-2 px-2">
                  Run a schedule to see your agent automatically process records and generate content.
                </p>
              </div>
            </div>

            {!showScheduleExecution ? (
              <Card>
                <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                  {enrichedSchedules && enrichedSchedules.length > 0 ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="text-sm sm:text-base font-medium">Available Schedules</h4>
                        <div className="space-y-2">
                          {enrichedSchedules.map(schedule => (
                            <SchedulePreview
                              key={schedule.id}
                              schedule={schedule}
                              agentData={agentData}
                              variant="full"
                              isExpanded={expandedSchedules.has(schedule.id)}
                              showActions={false}
                              onToggleExpanded={toggleScheduleExpanded}
                            />
                          ))}
                        </div>
                      </div>
                      <Button 
                        onClick={handleExecuteSchedule}
                        className="w-full gap-2 h-10 sm:h-9 text-base sm:text-sm"
                      >
                        <PlayIcon className="h-4 w-4" />
                        Run First Schedule
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">No schedules configured yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <ScheduleExecution
                scheduleName={enrichedSchedules?.[0]?.name || 'First Schedule'}
                steps={getFirstScheduleSteps()}
                onExecute={executeFirstSchedule}
                onComplete={(success) => setScheduleExecutionComplete(success)}
                autoStart={true}
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl w-[95vw] h-[90vh] sm:max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden sm:top-[50%] sm:translate-y-[-50%] top-[5vh] translate-y-0">
          {/* Header - Always visible */}
          <div className="flex-shrink-0 bg-background border-b sticky top-0 z-10">
            <DialogHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <SparklesIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                Get Started with {agentData.name}
              </DialogTitle>
            </DialogHeader>

            {/* Progress Bar */}
            <div className="space-y-2 px-4 sm:px-6 py-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Step {currentStep + 1} of {activeSteps.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-1.5 sm:h-2" />
            </div>

            {/* Step Navigation - Mobile Optimized */}
            <div className="flex justify-center sm:justify-between overflow-x-auto py-2 sm:py-3 px-4 sm:px-6 border-b">
              {activeSteps.map((step, index) => (
                <div key={step.id} className="flex items-center min-w-0">
                  <div className={`flex items-center gap-1 sm:gap-2 ${
                    index <= currentStep ? 'text-blue-600' : 'text-muted-foreground'
                  }`}>
                    <div className={`w-5 h-5 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0 ${
                      index < currentStep 
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                        : index === currentStep
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                    }`}>
                      {index < currentStep ? (
                        <CheckCircleIcon className="h-2.5 w-2.5 sm:h-4 sm:w-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className="hidden lg:inline text-xs sm:text-sm font-medium truncate max-w-[100px] sm:max-w-[120px]">{step.title}</span>
                  </div>
                  {index < activeSteps.length - 1 && (
                    <ChevronRightIcon className="h-2.5 w-2.5 sm:h-4 sm:w-4 text-muted-foreground mx-1 sm:mx-2 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content - Scrollable with proper padding for fixed footer */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="px-4 sm:px-6 py-4 pb-20">
              {renderStepContent()}
            </div>
          </div>

          {/* Navigation Buttons - Always visible at bottom with safe area */}
          <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-t sticky bottom-0 z-10 pb-safe">
            <div className="flex justify-between items-center gap-2 p-3 sm:px-6 sm:py-4">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="gap-1.5 h-11 sm:h-auto"
                size="sm"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              {currentStep === activeSteps.length - 1 ? (
                <Button onClick={onClose} className="gap-1.5 flex-1 sm:flex-initial h-11 sm:h-auto" size="sm">
                  <CheckCircleIcon className="h-4 w-4" />
                  Complete Setup
                </Button>
              ) : currentStepData?.id === 'configure-env' ? (
                <Button 
                  onClick={handleSaveEnvVars}
                  disabled={requiredEnvVars.some(key => !envVars[key]) || isDeployingSteps}
                  className="gap-1.5 flex-1 sm:flex-initial h-11 sm:h-auto"
                  size="sm"
                >
                  {isDeployingSteps ? (
                    <>
                      <LoaderIcon className="h-4 w-4 animate-spin" />
                      Deploying Steps...
                    </>
                  ) : (
                    <>
                      Save & Deploy
                      <ArrowRightIcon className="h-4 w-4" />
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={handleNext}
                  disabled={!currentStepData?.completed && !isGeneratingExamples}
                  className={`gap-1.5 flex-1 sm:flex-initial h-11 sm:h-auto ${currentStepData?.completed ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  variant={currentStepData?.completed ? 'default' : 'default'}
                  size="sm"
                >
                  {currentStepData?.completed ? 'Next' : 'Next'}
                  <ArrowRightIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 