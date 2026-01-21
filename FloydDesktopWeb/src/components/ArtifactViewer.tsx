/**
 * ArtifactViewer Component - Phase 5, Task 5.4
 * Render artifacts with syntax highlighting and preview
 */

import { useState, useEffect } from 'react';
import { Code, Image as ImageIcon, FileText, Download, Copy, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Artifact {
  id: string;
  type: 'code' | 'image' | 'markdown' | 'text' | 'html';
  title: string;
  content: string;
  language?: string;
  createdAt: number;
}

interface ArtifactViewerProps {
  artifact: Artifact;
  onClose: () => void;
}

export function ArtifactViewer({ artifact, onClose }: ArtifactViewerProps) {
  const [copied, setCopied] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(artifact.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([artifact.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = artifact.title;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getArtifactIcon = () => {
    switch (artifact.type) {
      case 'code': return Code;
      case 'image': return ImageIcon;
      case 'markdown': return FileText;
      case 'html': return Code;
      default: return FileText;
    }
  };

  const ArtifactIcon = getArtifactIcon();

  const renderContent = () => {
    if (artifact.type === 'image') {
      if (previewError) {
        return (
          <div className="flex items-center justify-center h-full text-crush-text-subtle">
            <ImageIcon className="w-12 h-12 mb-2" />
            <p>Image preview not available</p>
            <button
              onClick={handleDownload}
              className="mt-4 px-4 py-2 bg-crush-primary hover:bg-crush-grape rounded text-crush-text-inverse"
            >
              Download Image
            </button>
          </div>
        );
      }

      return (
        <div className="flex items-center justify-center h-full bg-crush-base/50">
          <img
            src={artifact.content}
            alt={artifact.title}
            className="max-w-full max-h-full object-contain"
            onError={() => setPreviewError(true)}
          />
        </div>
      );
    }

    if (artifact.type === 'code' || artifact.type === 'html') {
      return (
        <div className="h-full overflow-auto">
          <pre className="text-sm">
            <code className={cn(
              'font-mono',
              artifact.language && `language-${artifact.language}`
            )}>
              {artifact.content}
            </code>
          </pre>
        </div>
      );
    }

    if (artifact.type === 'markdown') {
      return (
        <div className="prose prose-sm dark:prose-invert max-w-none h-full overflow-auto p-4">
          <pre className="whitespace-pre-wrap">{artifact.content}</pre>
        </div>
      );
    }

    // Default text rendering
    return (
      <div className="h-full overflow-auto p-4">
        <pre className="whitespace-pre-wrap text-sm">{artifact.content}</pre>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-5xl h-[80vh] bg-crush-elevated rounded-xl shadow-2xl border border-crush-overlay flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-crush-overlay bg-crush-base">
          <div className="flex items-center gap-3">
            <ArtifactIcon className="w-5 h-5 text-crush-secondary" />
            <h3 className="text-lg font-semibold text-crush-text-primary">
              {artifact.title}
            </h3>
            <span className="text-xs text-crush-text-subtle bg-crush-overlay px-2 py-1 rounded">
              {artifact.type}
              {artifact.language && ` · ${artifact.language}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-crush-overlay rounded-lg transition-colors text-crush-text-secondary"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-5 h-5 text-crush-ready" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={handleDownload}
              className="p-2 hover:bg-crush-overlay rounded-lg transition-colors text-crush-text-secondary"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-crush-overlay rounded-lg transition-colors text-crush-text-secondary"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-crush-overlay bg-crush-base text-xs text-crush-text-subtle flex items-center justify-between">
          <span>
            Created: {new Date(artifact.createdAt).toLocaleString()}
          </span>
          <span>
            {artifact.content.length} characters
          </span>
        </div>
      </div>
    </div>
  );
}

interface ArtifactCardProps {
  artifact: Artifact;
  onView: (artifact: Artifact) => void;
}

export function ArtifactCard({ artifact, onView }: ArtifactCardProps) {
  const getArtifactIcon = () => {
    switch (artifact.type) {
      case 'code': return Code;
      case 'image': return ImageIcon;
      case 'markdown': return FileText;
      case 'html': return Code;
      default: return FileText;
    }
  };

  const ArtifactIcon = getArtifactIcon();

  const getPreview = () => {
    if (artifact.type === 'image') {
      return (
        <div className="aspect-video bg-crush-base rounded overflow-hidden mb-2">
          <img
            src={artifact.content}
            alt={artifact.title}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    if (artifact.type === 'code' || artifact.type === 'html') {
      const lines = artifact.content.split('\n').slice(0, 5);
      return (
        <div className="bg-crush-base rounded p-2 mb-2 text-xs font-mono text-crush-text-secondary">
          {lines.map((line, i) => (
            <div key={i} className="truncate">{line || '\u00A0'}</div>
          ))}
          {artifact.content.split('\n').length > 5 && (
            <div className="text-crush-text-subtle italic">...</div>
          )}
        </div>
      );
    }

    // Default preview
    const preview = artifact.content.slice(0, 100);
    return (
      <div className="bg-crush-base rounded p-2 mb-2 text-sm text-crush-text-secondary">
        {preview}
        {artifact.content.length > 100 && '...'}
      </div>
    );
  };

  return (
    <button
      onClick={() => onView(artifact)}
      className="w-full text-left p-3 bg-crush-elevated hover:bg-crush-overlay rounded-lg border border-crush-overlay transition-colors"
    >
      <div className="flex items-start gap-3 mb-2">
        <ArtifactIcon className="w-5 h-5 text-crush-secondary flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-crush-text-primary truncate">
            {artifact.title}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-crush-text-subtle bg-crush-overlay px-2 py-0.5 rounded">
              {artifact.type}
            </span>
            {artifact.language && (
              <span className="text-xs text-crush-text-subtle">
                {artifact.language}
              </span>
            )}
          </div>
        </div>
      </div>

      {getPreview()}

      <div className="text-xs text-crush-text-subtle">
        {new Date(artifact.createdAt).toLocaleString()}
      </div>
    </button>
  );
}
