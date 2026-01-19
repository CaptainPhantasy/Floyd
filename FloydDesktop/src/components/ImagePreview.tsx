/**
 * FloydDesktop - Image Preview Component
 */

import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';

interface ImagePreviewProps {
  file: File;
  maxWidth?: number;
  maxHeight?: number;
  className?: string;
}

export function ImagePreview({
  file,
  maxWidth = 200,
  maxHeight = 200,
  className,
}: ImagePreviewProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.onerror = () => setError(true);
      reader.readAsDataURL(file);
    }
  }, [file]);

  if (error || !preview) {
    return (
      <div
        className={cn(
          'px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg',
          className
        )}
      >
        <span className="text-sm text-slate-400">{file.name}</span>
      </div>
    );
  }

  return (
    <div className={cn('relative rounded-lg overflow-hidden', className)}>
      <img
        src={preview}
        alt={file.name}
        style={{ maxWidth, maxHeight }}
        className="object-contain"
      />
    </div>
  );
}
