/**
 * FileUploadButton Component - Phase 4, Task 4.1
 * Upload files directly through the UI
 */

import { useState, useRef } from 'react';
import { Upload, File, X, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadButtonProps {
  onUpload: (files: File[]) => void;
  disabled?: boolean;
  maxFileSize?: number; // in bytes
  acceptedFileTypes?: string[];
}

export function FileUploadButton({
  onUpload,
  disabled = false,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  acceptedFileTypes = ['image/*', 'text/*', 'application/pdf', '.json', '.md', '.txt', '.csv'],
}: FileUploadButtonProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    file: File;
    status: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
  }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Filter by file type
    const validFiles = fileArray.filter(file => {
      if (acceptedFileTypes.includes('*')) return true;
      return acceptedFileTypes.some(type => {
        if (type.endsWith('/*')) {
          const category = type.split('/')[0];
          return file.type.startsWith(category);
        }
        return file.name.endsWith(type.replace('.', ''));
      });
    });

    // Filter by size
    const sizeValidFiles = validFiles.filter(file => {
      if (file.size > maxFileSize) {
        return false;
      }
      return true;
    });

    if (sizeValidFiles.length > 0) {
      const newFiles = sizeValidFiles.map(file => ({
        file,
        status: 'uploading' as const,
      }));
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
      
      try {
        await onUpload(sizeValidFiles);
        
        setUploadedFiles(prev => 
          prev.map(f => 
            sizeValidFiles.includes(f.file)
              ? { ...f, status: 'success' as const }
              : f
          )
        );
        
        // Clear successful uploads after 2 seconds
        setTimeout(() => {
          setUploadedFiles(prev => prev.filter(f => f.status !== 'success'));
        }, 2000);
      } catch (err: any) {
        setUploadedFiles(prev => 
          prev.map(f => 
            sizeValidFiles.includes(f.file)
              ? { ...f, status: 'error' as const, error: err.message }
              : f
          )
        );
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="relative">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedFileTypes.join(',')}
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Upload Button */}
      <button
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        disabled={disabled}
        className={cn(
          'p-2 hover:bg-crush-overlay rounded-lg transition-colors',
          'text-crush-text-secondary hover:text-crush-text-primary',
          disabled && 'opacity-50 cursor-not-allowed',
          isDragging && 'bg-crush-overlay ring-2 ring-crush-primary'
        )}
        title="Upload files"
      >
        <Upload className="w-5 h-5" />
      </button>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="absolute right-0 top-full mt-2 z-20 w-72 bg-crush-elevated rounded-lg shadow-lg border border-crush-overlay overflow-hidden">
          <div className="px-3 py-2 border-b border-crush-overlay">
            <div className="text-xs font-medium text-crush-text-tertiary">
              Uploaded Files
            </div>
          </div>
          
          <div className="max-h-64 overflow-y-auto p-2 space-y-1">
            {uploadedFiles.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 bg-crush-base rounded border border-crush-overlay"
              >
                <File className="w-4 h-4 text-crush-info flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-crush-text-primary truncate">
                    {item.file.name}
                  </div>
                  <div className="text-xs text-crush-text-subtle">
                    {formatFileSize(item.file.size)}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {item.status === 'uploading' && (
                    <div className="w-4 h-4 border-2 border-crush-working border-t-transparent rounded-full animate-spin" />
                  )}
                  
                  {item.status === 'success' && (
                    <Check className="w-4 h-4 text-crush-ready" />
                  )}
                  
                  {item.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-crush-error" title={item.error} />
                  )}
                  
                  <button
                    onClick={() => {
                      setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
                    }}
                    className="p-0.5 hover:bg-crush-overlay rounded transition-colors"
                  >
                    <X className="w-3 h-3 text-crush-text-secondary" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="px-3 py-2 bg-crush-base border-t border-crush-overlay text-xs text-crush-text-subtle">
            Max file size: {formatFileSize(maxFileSize)}
          </div>
        </div>
      )}
    </div>
  );
}
