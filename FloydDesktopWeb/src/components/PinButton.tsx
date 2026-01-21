/**
 * PinButton Component - Phase 1, Task 1.4
 * 
 * Allows users to pin important chats for quick access.
 * Features:
 * - Toggle pin/unpin with visual feedback
 * - Pin icon shown when pinned
 * - Appears on hover in sidebar
 * - Quick click to toggle
 */

import { useState } from 'react';
import { Pin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PinButtonProps {
  /** Current pinned state */
  pinned: boolean;
  /** Callback to toggle pin state */
  onToggle: () => Promise<void>;
  /** Additional class names */
  className?: string;
}

export function PinButton({ pinned, onToggle, className }: PinButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      await onToggle();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle pin');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={handleClick}
        disabled={loading}
        className={cn(
          'flex items-center justify-center',
          'text-crush-text-secondary hover:text-crush-primary',
          'hover:bg-crush-overlay',
          'rounded transition-all',
          'focus:outline-none focus:ring-2 focus:ring-crush-primary',
          'opacity-0 group-hover:opacity-100',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'w-5 h-5',
          className
        )}
        title={error || (pinned ? 'Unpin chat' : 'Pin chat')}
        aria-label={pinned ? 'Unpin chat' : 'Pin chat'}
      >
        <Pin
          className={cn(
            'w-4 h-4',
            pinned && 'fill-current',
            !pinned && 'fill-none'
          )}
          style={{
            transform: pinned ? '-2px 0px 0 0' : undefined
          }}
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
