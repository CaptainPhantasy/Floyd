/**
 * CopyButton Component - Phase 1, Task 1.2
 * 
 * Provides copy-to-clipboard functionality for message content.
 * Features:
 * - Appears on hover
 * - Copies text to clipboard
 * - Shows success feedback
 * - Handles both plain text and code blocks
 * - Toast notification on success
 * - Error handling
 */

import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  /** Content to copy */
  content: string;
  /** Additional class names */
  className?: string;
  /** Button size */
  size?: 'sm' | 'md';
}

export function CopyButton({ 
  content, 
  className,
  size = 'sm'
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopy = useCallback(async () => {
    try {
      // Use Clipboard API
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setError(null);

      // Reset after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err: any) {
      // Fallback for older browsers or when clipboard API fails
      try {
        const textArea = document.createElement('textarea');
        textArea.value = content;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else {
          setError('Failed to copy');
        }
      } catch (fallbackErr) {
        setError('Copy not supported');
        console.error('Copy failed:', fallbackErr);
      }
    }
  }, [content]);

  const sizeClasses = size === 'sm' 
    ? 'w-5 h-5' 
    : 'w-6 h-6';

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className={cn(
          'flex items-center justify-center',
          'text-crush-text-secondary hover:text-crush-primary',
          'hover:bg-crush-overlay',
          'rounded transition-all',
          'focus:outline-none focus:ring-2 focus:ring-crush-primary',
          'opacity-0 group-hover:opacity-100',
          sizeClasses,
          className
        )}
        title={copied ? 'Copied!' : error || 'Copy to clipboard'}
        aria-label="Copy message"
      >
        {copied ? (
          <Check className={`${sizeClasses} text-crush-ready`} />
        ) : (
          <Copy className={sizeClasses} />
        )}
      </button>
      
      {error && (
        <div className="absolute top-full right-0 mt-1 px-2 py-1 text-xs bg-crush-error text-crush-text-inverse rounded whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  );
}

/**
 * Hook to copy content with toast notification
 */
export function useCopyToast() {
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ show: false, message: '', type: 'success' });

  const copyWithToast = useCallback(async (content: string, label = 'Content') => {
    try {
      await navigator.clipboard.writeText(content);
      setToast({
        show: true,
        message: `${label} copied to clipboard!`,
        type: 'success',
      });

      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 2000);
    } catch (err: any) {
      setToast({
        show: true,
        message: 'Failed to copy to clipboard',
        type: 'error',
      });

      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
    }
  }, []);

  return { copyWithToast, toast };
}
