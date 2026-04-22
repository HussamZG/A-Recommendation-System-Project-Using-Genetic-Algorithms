'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { rememberActiveUser } from '@/lib/active-user';


interface RecommendationUserFormProps {
  maxUserId: number;
  buttonLabel?: string;
  placeholder?: string;
  compact?: boolean;
}

export default function RecommendationUserForm({
  maxUserId,
  buttonLabel = 'احصل على توصياتي',
  placeholder = 'رقم المستخدم (مثال: 42)',
  compact = false,
}: RecommendationUserFormProps) {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedUserId = Number(userId);
    if (!Number.isInteger(parsedUserId) || parsedUserId < 1 || parsedUserId > maxUserId) {
      setError(`أدخل رقم مستخدم صحيحًا بين 1 و ${maxUserId}.`);
      return;
    }

    setError('');
    rememberActiveUser(parsedUserId);
    router.push(`/recommendations/${parsedUserId}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={`flex ${compact ? 'flex-col sm:flex-row' : 'flex-col sm:flex-row'} items-center justify-center gap-4 max-w-lg mx-auto`}>
        <input
          type="number"
          min={1}
          max={maxUserId}
          required
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-input bg-background px-4 text-center text-base text-foreground shadow-sm outline-none ring-0 transition focus:border-primary ${compact ? 'h-12 sm:w-36 text-sm' : 'h-14 sm:w-2/3 text-lg'}`}
        />
        <button
          type="submit"
          className={`inline-flex items-center justify-center rounded-xl bg-primary px-5 font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 ${compact ? 'h-12 w-full sm:w-auto text-sm' : 'h-14 w-full sm:w-1/3 text-base'}`}
        >
          {buttonLabel}
        </button>
      </div>
      {error ? (
        <p className="mt-3 text-center text-sm text-destructive">{error}</p>
      ) : null}
    </form>
  );
}
