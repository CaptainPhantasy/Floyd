/**
 * TokenUsageBar Component - Phase 6, Task 6.2
 * Display token usage statistics for conversations
 */

import { useMemo } from 'react';
import { Zap, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TokenUsageBarProps {
  inputTokens: number;
  outputTokens: number;
  maxTokens?: number;
  className?: string;
}

export function TokenUsageBar({
  inputTokens,
  outputTokens,
  maxTokens = 200000,
  className,
}: TokenUsageBarProps) {
  const totalTokens = inputTokens + outputTokens;
  const percentage = useMemo(() => {
    return Math.min((totalTokens / maxTokens) * 100, 100);
  }, [totalTokens, maxTokens]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getColorClass = () => {
    if (percentage >= 90) return 'bg-crush-error';
    if (percentage >= 70) return 'bg-crush-warning';
    if (percentage >= 50) return 'bg-crush-info';
    return 'bg-crush-ready';
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Icon */}
      <div className="flex items-center gap-1.5 text-crush-text-secondary">
        <Zap className="w-4 h-4" />
        <span className="text-xs font-medium">Tokens</span>
      </div>

      {/* Bar */}
      <div className="flex-1 h-2 bg-crush-base rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-500',
            getColorClass()
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-crush-text-subtle">
        <div className="flex items-center gap-1">
          <span>In: {formatNumber(inputTokens)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Out: {formatNumber(outputTokens)}</span>
        </div>
        <div className="flex items-center gap-1 font-medium">
          <span>{formatNumber(totalTokens)}</span>
          <span className="text-crush-text-subtle">/ {formatNumber(maxTokens)}</span>
        </div>
      </div>
    </div>
  );
}

interface TokenUsageStatsProps {
  inputTokens: number;
  outputTokens: number;
  costEstimate?: {
    inputCost: number;
    outputCost: number;
    totalCost: number;
  };
  className?: string;
}

export function TokenUsageStats({
  inputTokens,
  outputTokens,
  costEstimate,
  className,
}: TokenUsageStatsProps) {
  const totalTokens = inputTokens + outputTokens;
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatCost = (cost: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(cost);
  };

  return (
    <div className={cn('bg-crush-elevated rounded-lg border border-crush-overlay p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-crush-text-primary flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-crush-secondary" />
          Token Usage
        </h3>
        {costEstimate && (
          <div className="text-sm font-medium text-crush-info">
            {formatCost(costEstimate.totalCost)}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-crush-text-secondary">Input Tokens</span>
          <span className="font-medium text-crush-text-primary">
            {formatNumber(inputTokens)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-crush-text-secondary">Output Tokens</span>
          <span className="font-medium text-crush-text-primary">
            {formatNumber(outputTokens)}
          </span>
        </div>

        <div className="border-t border-crush-overlay pt-2 mt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-crush-text-secondary">Total</span>
            <span className="font-semibold text-crush-text-primary">
              {formatNumber(totalTokens)}
            </span>
          </div>
        </div>

        {costEstimate && (
          <div className="border-t border-crush-overlay pt-2 mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs text-crush-text-subtle">
              <span>Input cost</span>
              <span>{formatCost(costEstimate.inputCost)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-crush-text-subtle">
              <span>Output cost</span>
              <span>{formatCost(costEstimate.outputCost)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
