'use client';

import { useState } from 'react';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { getActiveUserIdFromDocument } from '@/lib/active-user';
import type { TrackEvent } from '@/lib/tracking';


interface ProductActionButtonsProps {
  productId: number;
  productName: string;
}

export default function ProductActionButtons({
  productId,
  productName,
}: ProductActionButtonsProps) {
  const [pendingEvent, setPendingEvent] = useState<TrackEvent | null>(null);

  async function trackProduct(event: TrackEvent) {
    if (!getActiveUserIdFromDocument()) {
      toast.error('اختر المستخدم أولاً', {
        description: 'أدخل رقم مستخدم من الصفحة الرئيسية أو لوحة الإحصائيات قبل التفاعل مع المنتج.',
        position: 'bottom-left',
      });
      return;
    }

    setPendingEvent(event);

    try {
      const response = await fetch('/api/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          event,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.message ?? 'تعذر حفظ التفاعل الآن.');
      }

      if (event === 'purchase') {
        toast.success('تمت الإضافة للسلة', {
          description: `${productName} أضيف بنجاح وتم حفظ حدث الشراء في Supabase.`,
          position: 'bottom-left',
        });
      } else {
        toast.success('تم تسجيل الاهتمام', {
          description: `تم حفظ تفاعل ${productName} للمستخدم الحالي.`,
          position: 'bottom-left',
        });
      }
    } catch (error) {
      toast.error('تعذر حفظ التفاعل', {
        description:
          error instanceof Error ? error.message : 'حدث خطأ غير متوقع أثناء حفظ الحدث.',
        position: 'bottom-left',
      });
    } finally {
      setPendingEvent(null);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <button
        type="button"
        disabled={pendingEvent !== null}
        onClick={() => void trackProduct('purchase')}
        className="inline-flex h-14 flex-1 items-center justify-center rounded-2xl border border-border bg-background px-6 text-base font-bold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70"
      >
        <Sparkles className="ml-2 h-5 w-5" />
        {pendingEvent === 'purchase' ? 'جارٍ الحفظ...' : 'إضافة للسلة'}
      </button>

      <button
        type="button"
        disabled={pendingEvent !== null}
        onClick={() => void trackProduct('click')}
        className="inline-flex h-14 flex-1 items-center justify-center rounded-2xl bg-primary px-6 text-base font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <ShoppingBag className="ml-2 h-5 w-5" />
        {pendingEvent === 'click' ? 'جارٍ الحفظ...' : 'متابعة المنتج'}
      </button>
    </div>
  );
}
