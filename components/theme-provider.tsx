'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

// مُغلّف ThemeProvider: يمرر الإعدادات لـ next-themes لدعم الوضع الليلي/النهاري والوضع التلقائي
export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
