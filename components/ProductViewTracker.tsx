'use client';

import { useEffect } from 'react';

import { getActiveUserIdFromDocument } from '@/lib/active-user';


interface ProductViewTrackerProps {
  productId: number;
}

// مكون تتبع المشاهدة: يُرسل حدث 'view' للـ API مرة واحدة لكل (مستخدم + منتج) في الجلسة
export default function ProductViewTracker({ productId }: ProductViewTrackerProps) {
  useEffect(() => {
    const activeUserId = getActiveUserIdFromDocument();
    if (!activeUserId) {
      return;
    }

    // مفتاح فريد في sessionStorage لتجنب تكرار تتبع نفس المشاهدة في نفس الجلسة
    const storageKey = `tracked:view:${activeUserId}:${productId}`;

    try {
      if (sessionStorage.getItem(storageKey)) {
        return;
      }
    } catch {
      // Ignore storage issues and continue with the request once.
    }

    // إرسال حدث المشاهدة للخادم
    fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId,
        event: 'view',
      }),
    })
      .then(() => {
        try {
          sessionStorage.setItem(storageKey, '1');
        } catch {
          // Ignore storage issues after tracking succeeds.
        }
      })
      .catch(() => {
        // Silent failure keeps the product page usable even if tracking is unavailable.
      });
  }, [productId]);

  return null;
}
