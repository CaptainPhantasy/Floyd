/**
 * ImportButton Component - Phase 6, Task 6.4
 * Import conversations from Claude.ai export format
 */

import { useState, useRef } from 'react';
import { Upload, FileText, Check, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImportResult {
  success: boolean;
  message: string;
  sessionCount?: number;
}

interface ImportButtonProps {
  onImport: (file: File) => Promise<ImportResult>;
  disabled?: boolean;
}

export function ImportButton({ onImport, disabled = false }: ImportButtonProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setResult(null);

    try {
      const importResult = await onImport(file);
      setResult(importResult);
      
      if (importResult.success) {
        setTimeout(() => {
          setResult(null);
        }, 3000);
      }
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || 'Failed to import conversations',
      });
    } finally {
      setIsImporting(false);
    }

    // Reset input
    e.target.value = '';
  };

  const handleClick = () => {
    if (!disabled && !isImporting) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="relative">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Import Button */}
      <button
        onClick={handleClick}
        disabled={disabled || isImporting}
        className={cn(
          'flex items-center gap-2 px-3 py-2',
          'bg-crush-elevated hover:bg-crush-overlay',
          'border border-crush-overlay rounded-lg',
          'text-sm text-crush-text-primary',
          'transition-colors',
          (disabled || isImporting) && 'opacity-50 cursor-not-allowed'
        )}
        title="Import conversations from Claude.ai"
      >
        {isImporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Upload className="w-4 h-4 text-crush-secondary" />
        )}
        <span>Import</span>
      </button>

      {/* Result Toast */}
      {result && (
        <div className="absolute right-0 top-full mt-2 z-20 w-80 bg-crush-elevated rounded-lg shadow-lg border border-crush-overlay overflow-hidden animate-in slide-in-from-top-2">
          <div className={cn(
            'flex items-start gap-3 p-3',
            result.success ? 'bg-crush-ready/10' : 'bg-crush-error/10'
          )}>
            {result.success ? (
              <Check className="w-5 h-5 text-crush-ready flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-crush-error flex-shrink-0 mt-0.5" />
            )}
            
            <div className="flex-1">
              <div className={cn(
                'text-sm font-medium mb-1',
                result.success ? 'text-crush-ready' : 'text-crush-error'
              )}>
                {result.success ? 'Import Successful' : 'Import Failed'}
              </div>
              <div className="text-xs text-crush-text-secondary">
                {result.message}
              </div>
              {result.sessionCount && (
                <div className="text-xs text-crush-text-subtle mt-1">
                  {result.sessionCount} conversation{result.sessionCount !== 1 ? 's' : ''} imported
                </div>
              )}
            </div>

            <button
              onClick={() => setResult(null)}
              className="p-1 hover:bg-crush-overlay rounded transition-colors"
            >
              <FileText className="w-4 h-4 text-crush-text-subtle" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<ImportResult>;
}

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.json')) {
      await processImport(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processImport(file);
    }
  };

  const processImport = async (file: File) => {
    setIsImporting(true);
    setResult(null);

    try {
      const importResult = await onImport(file);
      setResult(importResult);
      
      if (importResult.success) {
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || 'Failed to import conversations',
      });
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg bg-crush-elevated rounded-xl shadow-2xl border border-crush-overlay overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-crush-overlay">
          <h2 className="text-lg font-semibold text-crush-text-primary">Import Conversations</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-crush-overlay rounded transition-colors"
          >
            <FileText className="w-5 h-5 text-crush-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isImporting && !result ? (
            <>
              <div className="mb-4">
                <p className="text-sm text-crush-text-secondary mb-4">
                  Import your conversations from Claude.ai export. Select a JSON file exported from Claude.ai to restore your chat history.
                </p>
              </div>

              {/* Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                  dragActive
                    ? 'border-crush-primary bg-crush-primary/10'
                    : 'border-crush-overlay hover:border-crush-primary hover:bg-crush-base'
                )}
              >
                <Upload className="w-12 h-12 mx-auto mb-3 text-crush-secondary" />
                <p className="text-sm font-medium text-crush-text-primary mb-1">
                  Drop your Claude.ai export file here
                </p>
                <p className="text-xs text-crush-text-subtle mb-3">
                  or click to browse
                </p>
                <p className="text-xs text-crush-text-subtle">
                  Supports .json files exported from Claude.ai
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </>
          ) : isImporting ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-crush-secondary mb-3" />
              <p className="text-sm text-crush-text-secondary">Importing conversations...</p>
            </div>
          ) : result ? (
            <div className="py-4">
              <div className={cn(
                'flex items-start gap-3 p-4 rounded-lg',
                result.success ? 'bg-crush-ready/10' : 'bg-crush-error/10'
              )}>
                {result.success ? (
                  <Check className="w-6 h-6 text-crush-ready flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-crush-error flex-shrink-0" />
                )}
                
                <div>
                  <div className={cn(
                    'font-medium mb-1',
                    result.success ? 'text-crush-ready' : 'text-crush-error'
                  )}>
                    {result.success ? 'Import Successful' : 'Import Failed'}
                  </div>
                  <div className="text-sm text-crush-text-secondary">
                    {result.message}
                  </div>
                  {result.sessionCount && (
                    <div className="text-sm text-crush-text-subtle mt-2">
                      {result.sessionCount} conversation{result.sessionCount !== 1 ? 's' : ''} imported
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-crush-base border-t border-crush-overlay flex justify-end">
          <button
            onClick={onClose}
            disabled={isImporting}
            className="px-4 py-2 bg-crush-overlay hover:bg-crush-base rounded text-sm text-crush-text-primary transition-colors disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
