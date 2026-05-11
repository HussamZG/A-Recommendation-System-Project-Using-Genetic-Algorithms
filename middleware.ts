// middleware.ts: يُنفّذ على كل طلب قبل وصوله للصفحات، ويُحدّث جلسة المستخدم مع Supabase
import { type NextRequest } from "next/server";

import { updateSession } from "@/utils/supabase/middleware";

// دالة الوسيط الرئيسية: تُحدّث الكوكيز وجلسة المصادقة لكل طلب مطابق
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

// إعدادات matcher: تُطبّق الوسيط على كل المسارات باستثناء الملفات الثابتة والصور
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
