/**
 * FloydDesktop - Token Usage Component
 */

import { cn } from '../lib/utils';
import type { UsageInfo } from '../types';
import { TrendingUp } from 'lucide-react';

interface TokenUsageProps {
  usage?: UsageInfo;
  maxTokens?: number;
  className?: string;
}

export function TokenUsage({
  usage,
  maxTokens = 8192,
  className,
}: TokenUsageProps) {
  if (!usage) {
    return null;
  }

  const totalTokens = usage.input_tokens + usage.output_tokens;
  const usagePercent = Math.min((totalTokens / maxTokens) * 100, 100);
  const estimatedCost = estimateCost(usage.input_tokens, usage.output_tokens);

  return (
    <div className={cn('flex items-center gap-3 text-xs', className)}>
      <div className="flex items-center gap-1 text-slate-400">
        <TrendingUp className="w-3 h-3" />
        <span>
          {usage.input_tokens.toLocaleString()} in / {usage.output_tokens.toLocaleString()} out
        </span>
      </div>
      <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all',
            usagePercent > 90 ? 'bg-red-500' : usagePercent > 70 ? 'bg-yellow-500' : 'bg-sky-500'
          )}
          style={{ width: `${usagePercent}%` }}
        />
      </div>
      {estimatedCost > 0 && (
        <div className="text-slate-400">
          ~${estimatedCost.toFixed(4)}
        </div>
      )}
    </div>
  );
}

function estimateCost(inputTokens: number, outputTokens: number): number {
  // Rough estimate based on Claude pricing (adjust as needed)
  const inputCostPer1k = 0.015; // $15 per 1M tokens
  const outputCostPer1k = 0.075; // $75 per 1M tokens
  
  return (inputTokens / 1000) * inputCostPer1k + (outputTokens / 1000) * outputCostPer1k;
}
