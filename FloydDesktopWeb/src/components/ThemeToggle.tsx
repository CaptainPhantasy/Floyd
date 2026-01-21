/**
 * Theme Toggle Component
 * Allows switching between CRUSH (dark) and Light themes
 */

import { useTheme } from '@/theme';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { themeId, toggleTheme } = useTheme();
  const isCrush = themeId === 'crush';

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
        'hover:bg-crush-overlay text-crush-text-secondary',
        'focus:outline-none focus:ring-2 focus:ring-crush-primary',
        className
      )}
      title={`Switch to ${isCrush ? 'Light' : 'CRUSH'} theme`}
    >
      {isCrush ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
      {showLabel && (
        <span className="text-sm">
          {isCrush ? 'CRUSH' : 'Light'}
        </span>
      )}
    </button>
  );
}
