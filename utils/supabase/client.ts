import { createBrowserClient } from "@supabase/ssr";

// جلب متغيرات بيئة Supabase المطلوبة للاتصال من جانب المتصفح
function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return { supabaseUrl, supabaseKey };
}

// إنشاء عميل Supabase للمتصفح (Browser Client): يُستخدم في مكونات React للاتصال المباشر بقاعدة البيانات
export function createClient() {
  const { supabaseUrl, supabaseKey } = getSupabaseEnv();

  return createBrowserClient(supabaseUrl, supabaseKey);
}
