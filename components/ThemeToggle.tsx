'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';


export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <button
        type="button"
        className="inline-flex cursor-pointer items-center justify-center rounded-full border border-border px-3 py-2 bg-background/80 text-foreground transition-colors hover:bg-muted"
        aria-label="تبديل المظهر"
        title="تبديل المظهر"
      >
        <div className="h-5 w-5" />
      </button>
    );
  }

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
