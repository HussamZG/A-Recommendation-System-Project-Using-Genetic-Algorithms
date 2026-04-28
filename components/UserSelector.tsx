'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User, X, Sparkles, Eye, MousePointerClick, ShoppingBag, Star } from 'lucide-react';
import { toast } from 'sonner';
import { rememberActiveUser, getActiveUserIdFromDocument } from '@/lib/active-user';

interface UserSelectorProps {
  maxUserId: number;
}

export default function UserSelector({ maxUserId }: UserSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState('');
  const [currentUser, setCurrentUser] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const active = getActiveUserIdFromDocument();
    if (active) {
      setCurrentUser(active);
    }

    // Check URL param
    const urlUserId = searchParams.get('user');
    if (urlUserId) {
      const parsed = Number(urlUserId);
      if (parsed >= 1 && parsed <= maxUserId) {
        setCurrentUser(parsed);
        rememberActiveUser(parsed);
      }
    }
  }, [searchParams, maxUserId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(userId);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > maxUserId) {
      toast.error(`أدخل رقم مستخدم بين 1 و ${maxUserId}`);
      return;
    }

    rememberActiveUser(parsed);
    setCurrentUser(parsed);
    setIsExpanded(false);
    toast.success(`تم تحديد المستخدم ${parsed}`);

    // Refresh page with user param
    const params = new URLSearchParams(searchParams.toString());
    params.set('user', String(parsed));
    router.push(`?${params.toString()}`);
  };

  const handleClear = () => {
    setCurrentUser(null);
    setUserId('');
    document.cookie = 'active_user_id=; Path=/; Max-Age=0';
    try {
      localStorage.removeItem('active_user_id');
    } catch {
      // ignore
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete('user');
    router.push(`?${params.toString()}`);
    toast.info('تم إلغاء تحديد المستخدم');
  };

  if (currentUser) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">المستخدم #{currentUser}</p>
              <p className="text-xs text-muted-foreground">
                <Link href={`/recommendations/${currentUser}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                  <Sparkles className="h-3 w-3" />
                  عرض توصياتي
                </Link>
              </p>
            </div>
          </div>
          <button
            onClick={handleClear}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
            title="إلغاء التحديد"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full rounded-2xl border border-dashed border-border bg-muted/30 p-4 text-center transition hover:bg-muted/50"
      >
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <User className="h-4 w-4" />
          <span className="text-sm font-medium">تصفح كمستخدم محدد</span>
        </div>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="mb-3 text-sm font-bold text-foreground">أدخل رقم المستخدم</p>
      <div className="flex gap-2">
        <input
          type="number"
          min={1}
          max={maxUserId}
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder={`1 - ${maxUserId}`}
          className="h-10 flex-1 rounded-xl border border-input bg-background px-3 text-sm text-foreground text-center outline-none transition focus:border-primary"
        />
        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
        >
          تحديد
        </button>
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-background px-3 text-sm text-muted-foreground transition hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

export function UserInteractionBadges({
  viewed,
  clicked,
  purchased,
  rating,
}: {
  viewed: number;
  clicked: number;
  purchased: number;
  rating: number;
}) {
  if (!viewed && !clicked && !purchased && !rating) return null;

  return (
    <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
      {purchased > 0 && (
        <span className="flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
          <ShoppingBag className="h-3 w-3" />
          مشتري
        </span>
      )}
      {clicked > 0 && !purchased && (
        <span className="flex items-center gap-1 rounded-full bg-blue-500 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
          <MousePointerClick className="h-3 w-3" />
          نقر
        </span>
      )}
      {viewed > 0 && !clicked && !purchased && (
        <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
          <Eye className="h-3 w-3" />
          مشاهد
        </span>
      )}
      {rating > 0 && (
        <span className="flex items-center gap-1 rounded-full bg-purple-500 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
          <Star className="h-3 w-3" />
          {rating}/5
        </span>
      )}
    </div>
  );
}
