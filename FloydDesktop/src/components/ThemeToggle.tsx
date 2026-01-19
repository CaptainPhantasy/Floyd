/**
 * FloydDesktop - Theme Toggle Component
 */

import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '../lib/utils';

type Theme = 'dark' | 'light' | 'system';

interface ThemeToggleProps {
  className?: string;
  onThemeChange?: (theme: Theme) => void;
}

export function ThemeToggle({ className, onThemeChange }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    // Load saved theme
    const saved = localStorage.getItem('floyd-theme') as Theme | null;
    if (saved) {
      setTheme(saved);
      applyTheme(saved);
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', newTheme === 'dark');
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('floyd-theme', newTheme);
    onThemeChange?.(newTheme);
  };

  const cycleTheme = () => {
    const themes: Theme[] = ['dark', 'light', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    handleThemeChange(themes[nextIndex]);
  };

  return (
    <button
      onClick={cycleTheme}
      className={cn(
        'p-2 hover:bg-slate-700 rounded-lg transition-colors',
        className
      )}
      aria-label={`Theme: ${theme}`}
      title={`Theme: ${theme}`}
    >
      {theme === 'dark' && <Moon className="w-5 h-5" />}
      {theme === 'light' && <Sun className="w-5 h-5" />}
      {theme === 'system' && <Monitor className="w-5 h-5" />}
    </button>
  );
}
