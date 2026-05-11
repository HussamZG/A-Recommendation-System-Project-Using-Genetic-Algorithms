import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// جلب متغيرات بيئة Supabase المطلوبة لتحديث الجلسة في الـ middleware
function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  return { supabaseUrl, supabaseKey };
}

// تحديث جلسة المستخدم في Supabase من خلال الـ middleware: تُزامن الكوكيز بين الطلب والاستجابة
export async function updateSession(request: NextRequest) {
  const { supabaseUrl, supabaseKey } = getSupabaseEnv();
  let supabaseResponse = NextResponse.next({
    request,
  });

  // إن لم تُعيّن متغيرات Supabase يُرجع الاستجابة كما هي دون تحديث
  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // تحديث الكوكيز في الطلب أولاً ثم في الاستجابة لضمان تمريرها للمتصفح
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  await supabase.auth.getUser(); // تحديث/تجديد جلسة المصادقة إن لزم الأمر

  return supabaseResponse;
}
