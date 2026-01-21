/**
 * EditableTitle Component - Phase 1, Task 1.1
 * 
 * Allows users to click-to-edit session titles in the sidebar.
 * Features:
 * - Click to activate edit mode
 * - Press Enter to save
 * - Press Escape to cancel
 * - Click outside to save
 * - Trim whitespace
 * - Show loading state during save
 * - Visual feedback
 */

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface EditableTitleProps {
  /** Current display title (falls back to auto-generated) */
  title: string;
  /** User-defined custom title (optional) */
  customTitle?: string;
  /** Callback when title is saved */
  onSave: (newTitle: string) => Promise<void>;
  /** Maximum length for title */
  maxLength?: number;
  /** Additional class names */
  className?: string;
}

export function EditableTitle({
  title,
  customTitle,
  onSave,
  maxLength = 100,
  className,
}: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(customTitle || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Display customTitle if set, otherwise use auto-generated title
  const displayTitle = customTitle || title;

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Handle click outside to save
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isEditing &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        handleSave();
      }
    }

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isEditing, editValue]);

  const startEditing = () => {
    setIsEditing(true);
    setEditValue(customTitle || '');
    setError(null);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditValue(customTitle || '');
    setError(null);
  };

  const handleSave = async () => {
    const trimmed = editValue.trim();
    
    // If unchanged, just close edit mode
    if (trimmed === (customTitle || '')) {
      setIsEditing(false);
      return;
    }

    // Validate
    if (trimmed.length > maxLength) {
      setError(`Title must be less than ${maxLength} characters`);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(trimmed.length > 0 ? trimmed : '');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save title');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditing();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
    setError(null);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative group',
        isEditing && 'is-editing',
        className
      )}
    >
      {isEditing ? (
        // Edit mode: Input field
        <div className="flex items-center gap-1">
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={isSaving}
            placeholder="Enter custom title..."
            className={cn(
              'flex-1 bg-crush-base border border-crush-overlay rounded px-2 py-1',
              'text-sm text-crush-text-primary',
              'focus:outline-none focus:ring-2 focus:ring-crush-primary',
              'placeholder:text-crush-text-subtle',
              'disabled:opacity-50'
            )}
            maxLength={maxLength}
          />
          {isSaving && (
            <span className="text-xs text-crush-text-subtle">Saving...</span>
          )}
          {error && (
            <span className="text-xs text-crush-error whitespace-nowrap">
              {error}
            </span>
          )}
        </div>
      ) : (
        // View mode: Display title with edit indicator
        <button
          onClick={startEditing}
          className={cn(
            'flex items-center gap-2 text-left w-full',
            'text-sm text-crush-text-primary truncate',
            'hover:text-crush-text-selected',
            'transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-crush-primary rounded'
          )}
          title="Click to rename"
        >
          <span className="truncate flex-1">{displayTitle}</span>
          <span 
            className={cn(
              'opacity-0 group-hover:opacity-100',
              'transition-opacity',
              'text-crush-text-subtle hover:text-crush-secondary'
            )}
          >
            ✏️
          </span>
        </button>
      )}
    </div>
  );
}
