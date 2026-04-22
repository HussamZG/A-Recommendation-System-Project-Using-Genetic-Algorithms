import type { Metadata } from 'next';
import { Cairo, Geist } from 'next/font/google';

import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
const cairo = Cairo({ subsets: ['arabic', 'latin'] });

export const metadata: Metadata = {
  title: 'مختبر التوصيات الجينية',
  description:
    'منصة عربية لتحليل سلوك المستخدمين وتوليد توصيات منتجات جديدة بالاعتماد على الخوارزمية الجينية وبيانات Excel المنظفة.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={cn('font-sans', geist.variable)} suppressHydrationWarning>
      <body className={cn(cairo.className, 'min-h-screen bg-background text-foreground flex flex-col')}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
