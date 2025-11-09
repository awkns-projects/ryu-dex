'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { TableIcon, ClockIcon, MoreHorizontalIcon, CodeIcon, DownloadIcon, ExternalLinkIcon, FileTextIcon, ArrowLeftIcon, KeyIcon } from 'lucide-react';
import { AgentData } from '@/lib/types';
import { RecordsTab, SchedulesTab, ApiTab } from './tabs';
import { OnboardingModal } from './onboarding-modal';

interface AgentBuilderProps {
  agentData: AgentData;
  onExecuteAction?: (actionId: string, recordId: string) => void;
  isEditing?: boolean; // Add this prop to indicate edit mode
  onRequestAgentUpdate?: (updatePrompt: string) => void; // Callback to trigger agent update via chat
}

export function AgentBuilder({ 
  agentData: initialAgentData, 
  onExecuteAction, 
  isEditing = false,
  onRequestAgentUpdate 
}: AgentBuilderProps) {
  const [agentData, setAgentData] = useState<AgentData>(initialAgentData);
  const [activeTab, setActiveTab] = useState('records');
  const [currentView, setCurrentView] = useState<'main' | 'api'>('main');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isFixingOAuth, setIsFixingOAuth] = useState(false);

  // Calculate reactive counts based on current agentData state
  const runOnceSchedulesCount = agentData.schedules?.filter(s => s.mode === 'once').length || 0;
  const totalApiEndpoints = (agentData.models.length * 5) + agentData.actions.length + runOnceSchedulesCount;

  // Check if onboarding should be shown
  const shouldShowOnboarding = () => {
    // Don't show onboarding in edit mode
    if (isEditing) return false;
    
    // Find the root model
    const rootModel = agentData.rootModel 
      ? agentData.models.find(m => m.name === agentData.rootModel)
      : agentData.models[0];
    
    // Show onboarding if there are no records in the root model
    return !rootModel?.records || rootModel.records.length === 0;
  };

  // Initialize onboarding state - only on mount, not when agentData changes
  useEffect(() => {
    setShowOnboarding(shouldShowOnboarding());
  }, []); // Empty dependency array - only run on mount

  // Helper functions for onboarding
  const handleCreateRecord = async (record: Record<string, any>) => {
    // Find the root model
    const rootModel = agentData.rootModel 
      ? agentData.models.find(m => m.name === agentData.rootModel)
      : agentData.models[0];
      
    if (!rootModel) return;

    try {
      const response = await fetch('/api/agent/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agentData.id,
          modelId: rootModel.id,
          data: record,
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Failed to create record:', responseData.error, responseData.details);
        return;
      }

      // Update local state
      const updatedAgentData = {
        ...agentData,
        models: agentData.models.map(model => {
          if (model.id === rootModel.id) {
            const currentRecords = model.records || [];
            return {
              ...model,
              records: [...currentRecords, {
                ...responseData.record,
                id: responseData.record.id,
                ...responseData.record.data
              }]
            };
          }
          return model;
        })
      };

      setAgentData(updatedAgentData);
    } catch (error) {
      console.error('Error creating record:', error);
    }
  };

  const getDisplayValueForReference = (referenceId: string, referencedModelName: string): string => {
    const referencedModel = agentData.models.find(m => m.name === referencedModelName);
    if (!referencedModel) return referenceId;
    
    const record = referencedModel.records?.find((r: any) => r.id === referenceId);
    if (!record) return referenceId;
    
    const displayFields = referencedModel.displayFields || ['name'];
    return displayFields.map(field => record[field] || '').filter(Boolean).join(' - ') || referenceId;
  };

  const getReferencedModelRecords = (modelName: string): any[] => {
    const model = agentData.models.find(m => m.name === modelName);
    return model?.records || [];
  };

  const exportAgentData = () => {
    const dataStr = JSON.stringify(agentData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${agentData.name.toLowerCase().replace(/\s+/g, '-')}-agent.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Fix OAuth configuration for existing agents
  const fixOAuthConfiguration = async () => {
    setIsFixingOAuth(true);
    try {
      const response = await fetch('/api/agent/fix-env-vars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: agentData.id }),
      });

      const result = await response.json();
      
      if (response.ok && result.updatedCount > 0) {
        console.log(`✅ ${result.message}`);
        // Refresh the page to show updated configuration
        window.location.reload();
      } else {
        console.log(`ℹ️ ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Failed to fix OAuth configuration:', error);
    } finally {
      setIsFixingOAuth(false);
    }
  };

  // Helper function to request agent updates via chat
  const handleRequestUpdate = (updatePrompt: string) => {
    if (onRequestAgentUpdate) {
      onRequestAgentUpdate(`Update this agent: ${updatePrompt}`);
    }
  };

  // API View
  if (currentView === 'api') {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
        {/* API Header with Back Button */}
        <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentView('main')}
              className="gap-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </Button>
        <div className="flex items-start justify-between pb-6 border-b">

          <div className="flex items-center gap-4">
           
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <CodeIcon className="h-6 w-6" />
                API Documentation
              </h1>
              <p className="text-muted-foreground mt-1">
                REST API endpoints for {agentData.name}
              </p>
            </div>
          </div>
          
          <Badge variant="secondary" className="text-sm font-medium">
            {totalApiEndpoints} endpoints
          </Badge>
        </div>

        {/* API Content */}
        <ApiTab agentData={agentData} />
      </div>
    );
  }

  // Main View
  return (
    <div className="w-full max-w-4xl mx-auto md:p-4 sm:p-2 space-y-4">
      {/* Agent Header with Settings Menu */}
      <div className="flex items-center justify-between py-2">
        <div>
          <h1 className="text-xl font-bold">{agentData.name}</h1>
          {agentData.description && (
            <p className="text-sm text-muted-foreground mt-1">{agentData.description}</p>
          )}
        </div>
        
        {/* Settings/More Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <MoreHorizontalIcon className="h-4 w-4" />
              More
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => setCurrentView('api')}>
              <CodeIcon className="h-4 w-4 mr-2" />
              API Documentation
              <Badge variant="secondary" className="ml-auto text-xs">
                {totalApiEndpoints}
              </Badge>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={fixOAuthConfiguration} disabled={isFixingOAuth}>
              <KeyIcon className="h-4 w-4 mr-2" />
              {isFixingOAuth ? 'Fixing OAuth...' : 'Fix OAuth Config'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportAgentData}>
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export Agent Data
            </DropdownMenuItem>
            {/* <DropdownMenuItem onClick={() => window.open('/docs/api', '_blank')}>
              <ExternalLinkIcon className="h-4 w-4 mr-2" />
              API Reference
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.open('/docs/integration', '_blank')}>
              <FileTextIcon className="h-4 w-4 mr-2" />
              Integration Guide
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
        <TabsList className="grid grid-cols-2 w-full h-auto p-1 bg-muted/30">
          <TabsTrigger 
            value="records" 
            className="h-[40px] flex items-center gap-2 py-2 px-4 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:bg-background/50"
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <TableIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <div className="font-medium">Records</div>
              </div>
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="schedules" 
            className="h-[40px] flex items-center gap-2 py-2 px-4 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:bg-background/50"
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/30">
                <ClockIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-left">
                <div className="font-medium">Schedules</div>
              </div>
            </div>
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <div className="mt-4">
          <TabsContent value="records" className="m-0">
            <RecordsTab 
              agentData={agentData} 
              setAgentData={setAgentData}
              onExecuteAction={onExecuteAction} 
            />
          </TabsContent>

          <TabsContent value="schedules" className="m-0">
            <SchedulesTab agentData={agentData} setAgentData={setAgentData} />
          </TabsContent>
        </div>
      </Tabs>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        agentData={agentData}
        setAgentData={setAgentData}
        onCreateRecord={handleCreateRecord}
        getDisplayValueForReference={getDisplayValueForReference}
        getReferencedModelRecords={getReferencedModelRecords}
      />
    </div>
  );
}

export default AgentBuilder; 
