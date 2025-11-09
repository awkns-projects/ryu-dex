'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusIcon } from 'lucide-react';
import { ActionStep } from './types';

interface StepNavigatorProps {
  steps: ActionStep[];
  selectedStepIndex: number;
  onStepSelect: (index: number) => void;
  onAddStep: () => void;
}

export function StepNavigator({ steps, selectedStepIndex, onStepSelect, onAddStep }: StepNavigatorProps) {
  const getStepTypeColor = (type: string) => {
    switch (type) {
      case 'fetch_record':
        return 'bg-chart-3/10 text-chart-3 border-chart-3/20';
      case 'ai_reasoning':
        return 'bg-chart-1/10 text-chart-1 border-chart-1/20';
      case 'web_search':
        return 'bg-chart-2/10 text-chart-2 border-chart-2/20';
      case 'image_generation':
        return 'bg-chart-5/10 text-chart-5 border-chart-5/20';
      case 'custom':
        return 'bg-chart-4/10 text-chart-4 border-chart-4/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'ai_reasoning':
        return '🤖';
      case 'web_search':
        return '🌐';
      case 'image_generation':
        return '🖼️';
      case 'custom':
        return '🔧';
      default:
        return '⚙️';
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Steps ({steps.length})</label>
      <div className="flex items-center gap-2 flex-wrap">
        {steps.map((step, idx) => (
          <Button
            key={idx}
            variant={selectedStepIndex === idx ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStepSelect(idx)}
            className="gap-1 text-xs h-8"
          >
            <span className="font-mono">#{idx + 1}</span>
            <span className="truncate max-w-[100px]">{step.name || 'Untitled'}</span>
            <Badge variant="outline" className="ml-1">{getStepIcon(step.type)}</Badge>
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={onAddStep}
          className="gap-1 text-xs h-8"
        >
          <PlusIcon className="h-3 w-3" />
          Add
        </Button>
      </div>
    </div>
  );
} 