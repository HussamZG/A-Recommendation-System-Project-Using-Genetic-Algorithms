import { createClient } from "@supabase/supabase-js";

// إنشاء عميل Supabase بصلاحيات الإدارة (Service Role): يُستخدم للعمليات التي تتجاوز RLS مثل التتبع
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // إن لم تُعيّن مفاتيح الإدارة يُرجع null ويتم fallback للعميل العادي
  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
