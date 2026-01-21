/**
 * RegenerateButton Component - Phase 1, Task 1.3
 * 
 * Allows users to regenerate the last assistant response.
 * Features:
 * - Appears on hover for assistant messages
 * - Shows loading state during regeneration
 * - Can be clicked multiple times
 * - Visual feedback and error handling
 */

import { useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RegenerateButtonProps {
  /** Callback to regenerate the response */
  onRegenerate: () => Promise<void>;
  /** Whether regeneration is currently in progress */
  isRegenerating?: boolean;
  /** Additional class names */
  className?: string;
  /** Button size */
  size?: 'sm' | 'md';
}

export function RegenerateButton({ 
  onRegenerate,
  isRegenerating = false,
  className,
  size = 'sm'
}: RegenerateButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  const loading = isRegenerating || localLoading;

  const handleRegenerate = useCallback(async () => {
    if (loading) return;

    setLocalLoading(true);
    setError(null);

    try {
      await onRegenerate();
    } catch (err: any) {
      setError(err.message || 'Failed to regenerate');
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      setLocalLoading(false);
    }
  }, [onRegenerate, loading]);

  const sizeClasses = size === 'sm' 
    ? 'w-5 h-5' 
    : 'w-6 h-6';

  return (
    <div className="relative group">
      <button
        onClick={handleRegenerate}
        disabled={loading}
        className={cn(
          'flex items-center justify-center',
          'text-crush-text-secondary hover:text-crush-primary',
          'hover:bg-crush-overlay',
          'rounded transition-all',
          'focus:outline-none focus:ring-2 focus:ring-crush-primary',
          'opacity-0 group-hover:opacity-100',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses,
          className
        )}
        title={error || (loading ? 'Regenerating...' : 'Regenerate response')}
        aria-label="Regenerate response"
      >
        <RefreshCw 
          className={cn(
            sizeClasses,
            loading && 'animate-spin'
          )} 
        />
      </button>
      
      {error && (
        <div className="absolute top-full right-0 mt-1 px-2 py-1 text-xs bg-crush-error text-crush-text-inverse rounded whitespace-nowrap z-10">
          {error}
        </div>
      )}
    </div>
  );
}
