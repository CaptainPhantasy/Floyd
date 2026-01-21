/**
 * MessageTimestamp Component - Phase 6, Task 6.3
 * Display relative and absolute timestamps for messages
 */

import { useState } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageTimestampProps {
  timestamp: number;
  className?: string;
  showRelative?: boolean;
  showAbsolute?: boolean;
}

export function MessageTimestamp({
  timestamp,
  className,
  showRelative = true,
  showAbsolute = false,
}: MessageTimestampProps) {
  const [showFullDate, setShowFullDate] = useState(false);

  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return new Date(timestamp).toLocaleDateString();
    }
  };

  const formatAbsoluteTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleMouseEnter = () => {
    if (showAbsolute) {
      setShowFullDate(true);
    }
  };

  const handleMouseLeave = () => {
    setShowFullDate(false);
  };

  return (
    <div
      className={cn('inline-flex items-center gap-1 bg-crush-elevated/80 backdrop-blur px-2 py-1 rounded-md border border-crush-overlay/50', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Clock className="w-3 h-3 text-crush-text-subtle" />
      <span className="text-xs text-crush-text-subtle font-medium">
        {showFullDate ? formatAbsoluteTime(timestamp) : formatRelativeTime(timestamp)}
      </span>
    </div>
  );
}

interface CompactTimestampProps {
  timestamp: number;
  className?: string;
}

export function CompactTimestamp({ timestamp, className }: CompactTimestampProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <span className={cn('text-xs text-crush-text-subtle', className)}>
      {formatTime(timestamp)}
    </span>
  );
}

interface FullTimestampProps {
  timestamp: number;
  className?: string;
  showDate?: boolean;
  showTime?: boolean;
}

export function FullTimestamp({
  timestamp,
  className,
  showDate = true,
  showTime = true,
}: FullTimestampProps) {
  const date = new Date(timestamp);

  if (!showDate && !showTime) {
    return null;
  }

  return (
    <time 
      className={cn('text-xs text-crush-text-subtle', className)}
      dateTime={date.toISOString()}
    >
      {showDate && showTime && (
        date.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      )}
      {showDate && !showTime && (
        date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
        })
      )}
      {showTime && !showDate && (
        date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      )}
    </time>
  );
}
