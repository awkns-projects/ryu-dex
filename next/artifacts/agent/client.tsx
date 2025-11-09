'use client';

import AgentBuilder from '@/components/agent-builder';

export const agentArtifact = {
  kind: 'agent' as const,
  initialize: async () => {
    // Agents don't use document fetching - they get data from the stream
    console.log('🔧 Agent artifact initialized - no document fetching needed');
  },
  actions: [],
  toolbar: [],
  content: ({ 
    mode,
    status,
    content,
    isCurrentVersion,
    currentVersionIndex,
    onSaveContent,
    getDocumentContentById,
    isLoading,
    metadata,
    setMetadata,
    artifact
  }: any) => {
    // Agents don't use content saving - disable the save function
    const noOpSaveContent = () => {
      console.log('🚫 Agent artifacts do not save content - ignoring save request');
    };
    console.log('Agent content rendering with:', { isLoading, metadata, status, artifact });
    
    if (isLoading) {
      console.log('Agent is loading...');
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading agent...</p>
        </div>
      );
    }

    // Show different message based on streaming status
    if (status === 'streaming') {
      console.log('Agent is still streaming...');
      
      // Show progress if available
      const progress = artifact?.progress;
      if (progress) {
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center max-w-md">
              <div className="mb-4">
                <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {progress.message}
              </h3>
              {progress.details && (
                <p className="text-sm text-muted-foreground mb-4">
                  {progress.details}
                </p>
              )}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Stage: {progress.stage}</span>
              </div>
            </div>
          </div>
        );
      }
      
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-pulse mb-2">🤖</div>
            <p className="text-muted-foreground">Generating agent data...</p>
            <p className="text-xs text-muted-foreground mt-1">Creating models and sample records</p>
          </div>
        </div>
      );
    }

    // Check both metadata.agentData and artifact.agentData for the data
    const agentData = metadata?.agentData || artifact?.agentData;
    if (!agentData) {
      console.log('No agent data found. Metadata:', metadata, 'Artifact:', artifact);
      return (
        <div className="flex items-center justify-center h-64 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="text-center">
            <p className="text-destructive font-medium">No agent data available</p>
            <p className="text-xs text-muted-foreground mt-1">Status: {status}</p>
            <p className="text-xs text-muted-foreground">Metadata: {JSON.stringify(metadata)}</p>
            <p className="text-xs text-muted-foreground">Artifact agentData: {JSON.stringify(artifact?.agentData)}</p>
          </div>
        </div>
      );
    }

    console.log('🎨 Rendering agent with data:', agentData);
    console.log('🔧 Agent actions available:', agentData.actions?.map((a: any) => ({ name: a.name, target: a.targetModel })));
    return (
      <div className="w-full h-full overflow-y-auto bg-background">
        <div className="p-4">
          {/* <p className="text-muted-foreground text-sm mb-4">✅ Agent artifact loaded successfully!</p> */}
          <AgentBuilder 
            key={agentData.id} // Prevent re-renders during streaming
            agentData={agentData}
            onExecuteAction={(actionId, recordId) => {
              console.log('Execute action:', actionId, 'on record:', recordId);
              // In a real implementation, this would trigger the agent execution
            }}
          />
        </div>
      </div>
    );
  },
  onStreamPart: ({ streamPart, setMetadata, setArtifact }: any) => {
    console.log('Agent artifact received stream part:', streamPart.type, streamPart.data);
    
    if (streamPart.type === 'data-progress') {
      console.log('📈 Updating progress:', streamPart.data);
      setArtifact((currentArtifact: any) => ({
        ...currentArtifact,
        progress: streamPart.data,
        status: 'streaming',
        isVisible: true, // Make sure artifact is visible when progress updates come in
      }));
    }
    
    if (streamPart.type === 'data-agentData') {
      console.log('Setting agent data:', streamPart.data);
      setMetadata((currentMetadata: any) => {
        const newMetadata = {
          ...currentMetadata,
          agentData: streamPart.data,
        };
        console.log('Updated metadata:', newMetadata);
        return newMetadata;
      });
      
      // Also make the artifact visible when we receive agent data
      setArtifact((currentArtifact: any) => {
        const newArtifact = {
          ...currentArtifact,
          isVisible: true,
          status: 'streaming',
          agentData: streamPart.data, // Also store in artifact for compatibility
        };
        console.log('Updated artifact:', newArtifact);
        return newArtifact;
      });
    }
    
    if (streamPart.type === 'data-finish') {
      console.log('🏁 Agent streaming finished - final completion');
      setArtifact((currentArtifact: any) => ({
        ...currentArtifact,
        status: 'idle',
        progress: undefined, // Clear progress when finished
      }));
      
      // Also update metadata to ensure everything is in final state
      setMetadata((currentMetadata: any) => ({
        ...currentMetadata,
        streamingComplete: true,
        completedAt: new Date().toISOString(),
      }));
    }
  },
}; 