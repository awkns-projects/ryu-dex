'use client';

import { useEffect, useRef } from 'react';
import { artifactDefinitions } from './artifact';
import { initialArtifactData, useArtifact } from '@/hooks/use-artifact';
import { useDataStream } from './data-stream-provider';

export function DataStreamHandler() {
  const { dataStream } = useDataStream();

  const { artifact, setArtifact, setMetadata } = useArtifact();
  const lastProcessedIndex = useRef(-1);

  useEffect(() => {
    if (!dataStream?.length) return;

    const newDeltas = dataStream.slice(lastProcessedIndex.current + 1);
    lastProcessedIndex.current = dataStream.length - 1;

    newDeltas.forEach((delta) => {
      console.log('🔄 DataStreamHandler processing delta:', delta.type);
      if (delta.type === 'data-agentData') {
        console.log('🎯 FOUND data-agentData:', delta.data);
      }
      console.log('Current artifact kind:', artifact.kind);
      
      const artifactDefinition = artifactDefinitions.find(
        (artifactDefinition) => artifactDefinition.kind === artifact.kind,
      );

      console.log('Found artifact definition:', !!artifactDefinition);

      if (artifactDefinition?.onStreamPart) {
        console.log('Calling artifact onStreamPart for:', artifactDefinition.kind);
        artifactDefinition.onStreamPart({
          streamPart: delta,
          setArtifact,
          setMetadata,
        });
      }

      setArtifact((draftArtifact) => {
        if (!draftArtifact) {
          console.log('Creating initial artifact data');
          return { ...initialArtifactData, status: 'streaming' };
        }

        console.log('Processing delta in setArtifact:', delta.type);
        switch (delta.type) {
          case 'data-id':
            return {
              ...draftArtifact,
              documentId: delta.data,
              status: 'streaming',
            };

          case 'data-title':
            return {
              ...draftArtifact,
              title: delta.data,
              status: 'streaming',
            };

          case 'data-kind':
            return {
              ...draftArtifact,
              kind: delta.data,
              status: 'streaming',
            };

          case 'data-clear':
            return {
              ...draftArtifact,
              content: '',
              status: 'streaming',
            };

          case 'data-finish':
            console.log('🏁 Main handler: Stream finishing, setting status to idle');
            return {
              ...draftArtifact,
              status: 'idle',
            };

          case 'data-agentData':
            console.log('📊 Setting agent data in main handler:', delta.data);
            const newArtifact = {
              ...draftArtifact,
              agentData: delta.data,
              status: 'streaming' as const,
              isVisible: true, // Make sure agent artifacts are visible
            };
            console.log('✅ Updated artifact with agent data, status:', newArtifact.status, 'isVisible:', newArtifact.isVisible);
            return newArtifact;

          default:
            return draftArtifact;
        }
      });
    });
  }, [dataStream, setArtifact, setMetadata, artifact]);

  return null;
}
