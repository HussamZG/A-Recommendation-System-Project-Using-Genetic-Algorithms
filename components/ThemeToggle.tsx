'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';


export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="inline-flex cursor-pointer items-center justify-center rounded-full border border-border px-3 py-2 bg-background/80 text-foreground transition-colors hover:bg-muted"
      aria-label="تبديل المظهر"
      title="تبديل المظهر"
    >
      <Sun
        className={`h-5 w-5 ${isDark ? 'opacity-0' : 'opacity-100'
          } transition-opacity dark:-rotate-90 dark:opacity-0`}
      />
      <Moon
        className={`absolute h-5 w-5 ${isDark ? 'opacity-100' : 'opacity-0'
          } transition-opacity dark:-rotate-90 dark:opacity-100`}
      />
    </button>
  );
}
