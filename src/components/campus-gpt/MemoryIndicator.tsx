import { Brain, Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MemoryIndicatorProps {
  memoryCount: number;
  hasCustomInstructions: boolean;
}

export function MemoryIndicator({ memoryCount, hasCustomInstructions }: MemoryIndicatorProps) {
  if (memoryCount === 0 && !hasCustomInstructions) {
    return null;
  }

  const items = [];
  if (memoryCount > 0) {
    items.push(`${memoryCount} memories`);
  }
  if (hasCustomInstructions) {
    items.push('custom instructions');
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
            <Brain className="w-3 h-3" />
            <span>Personalized</span>
            <Sparkles className="w-3 h-3" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Using {items.join(' and ')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
