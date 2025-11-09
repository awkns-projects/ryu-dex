import { useCallback, type MouseEvent } from 'react';
import { useArtifact } from '@/hooks/use-artifact';
import { CogIcon } from 'lucide-react';

interface AgentPreviewProps {
  isReadonly: boolean;
  result: any;
  isEditing?: boolean;
}

export function AgentPreview({ isReadonly, result, isEditing = false }: AgentPreviewProps) {
  const { setArtifact } = useArtifact();

  const handleClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (isReadonly) {
        return;
      }

      const boundingBox = event.currentTarget.getBoundingClientRect();

      console.log('🎯 AgentPreview clicked, opening agent artifact:', result);
      
      setArtifact((currentArtifact) => ({
        ...currentArtifact,
        title: result.name || 'Agent',
        documentId: result.id,
        kind: 'agent' as const,
        isVisible: true,
        status: 'idle' as const,
        boundingBox: {
          left: boundingBox.x,
          top: boundingBox.y,
          width: boundingBox.width,
          height: boundingBox.height,
        },
      }));
    },
    [setArtifact, result, isReadonly],
  );

  return (
    <button
      type="button"
      className="group flex w-full cursor-pointer flex-col gap-3 rounded-lg border bg-card p-4 text-left hover:bg-accent/50 transition-all duration-200"
      onClick={handleClick}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
          <CogIcon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-foreground">{result.name || 'Agent'}</div>
          <div className="text-sm text-muted-foreground">
            Agent configuration and workflows
          </div>
        </div>
      </div>
      
     
      
      <div className="text-xs text-muted-foreground border-t pt-2">
        Click to view and configure agent
      </div>
    </button>
  );
} 