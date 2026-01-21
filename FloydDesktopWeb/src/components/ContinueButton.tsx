/**
 * ContinueButton Component - Phase 2, Task 2.2
 * 
 * Allows users to continue a stopped or incomplete assistant response.
 * Features:
 * - Appears on hover for assistant messages
 * - Shows loading state during continuation
 * - Can continue from any point in the conversation
 * - Visual feedback and error handling
 */

import { useState, useCallback } from 'react';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContinueButtonProps {
  onContinue: () => Promise<void>;
  isContinuing?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export function ContinueButton({ 
  onContinue,
  isContinuing = false,
  className,
  size = 'sm'
}: ContinueButtonProps) {
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = useCallback(async () => {
    if (localLoading || isContinuing) return;

    setLocalLoading(true);
    setError(null);

    try {
      await onContinue();
    } catch (err: any) {
      setError(err.message || 'Failed to continue response');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLocalLoading(false);
    }
  }, [onContinue, localLoading, isContinuing]);

  const loading = localLoading || isContinuing;

  const sizeClasses = size === 'sm' 
    ? 'w-7 h-7' 
    : 'w-8 h-8';

  return (
    <div className="relative">
      <button
        onClick={handleContinue}
        disabled={loading}
        className={cn(
          'p-1 rounded transition-all',
          'hover:bg-crush-overlay',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses,
          className
        )}
        title={loading ? 'Continuing...' : 'Continue response'}
      >
        <Play 
          className={cn(
            'w-4 h-4 text-crush-tertiary',
            loading && 'animate-pulse'
          )} 
          style={{ transform: 'scale(0.8) translateX(1px)' }}
          fill="currentColor"
        />
      </button>

      {/* Error tooltip */}
      {error && (
        <div className="absolute top-full right-0 mt-1 px-2 py-1 bg-crush-error text-crush-text-inverse text-xs rounded whitespace-nowrap z-10">
          {error}
        </div>
      )}
    </div>
  );
}
