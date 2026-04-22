import Link from 'next/link';
import { LayoutDashboard, Menu, Package, Search, Sparkles } from 'lucide-react';

import ThemeToggle from '@/components/ThemeToggle';


function SearchForm({ compact = false }: { compact?: boolean }) {
  return (
    <form action="/products" className={`relative ${compact ? 'w-full' : 'w-72'}`}>
      <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        name="q"
        placeholder="ابحث عن منتج أو فئة..."
        className="h-10 w-full rounded-full border border-input bg-background/80 pr-10 pl-4 text-sm text-foreground outline-none transition focus:border-primary"
      />
    </form>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="hidden text-xl font-black text-foreground sm:block">مختبر التوصيات الجينية</span>
        </Link>

        <nav className="hidden items-center gap-3 md:flex">
          <Link href="/" className="rounded-full px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted">
            الرئيسية
          </Link>
          <Link href="/products" className="inline-flex items-center rounded-full px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted">
            <Package className="ml-2 h-4 w-4" />
            المنتجات
          </Link>
          <Link href="/dashboard" className="inline-flex items-center rounded-full px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted">
            <LayoutDashboard className="ml-2 h-4 w-4" />
            لوحة التحكم
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <SearchForm />
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <details className="relative">
            <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-border bg-background/80 text-foreground transition hover:bg-muted">
              <Menu className="h-5 w-5" />
            </summary>
            <div className="absolute left-0 mt-3 w-72 rounded-2xl border border-border bg-background p-4 shadow-xl">
              <div className="mb-4">
                <SearchForm compact />
              </div>
              <div className="flex flex-col gap-2">
                <Link href="/" className="rounded-xl px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted">
                  الرئيسية
                </Link>
                <Link href="/products" className="rounded-xl px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted">
                  المنتجات
                </Link>
                <Link href="/dashboard" className="rounded-xl px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted">
                  لوحة التحكم
                </Link>
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
