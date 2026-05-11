// نقطة نهاية API لجلب التوصيات الجينية لمستخدم محدد: تتحقق من صحة المعرّف ثم تُرجع نتيجة الخوارزمية
import { NextResponse } from "next/server";

import { getRecommendationPayload } from "@/lib/server/recommender";


export async function GET(
  _request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  const { userId } = await context.params; // استخراج معرّف المستخدم من عنوان URL
  const parsedUserId = Number(userId); // تحويله لعدد صحيح

  // التحقق من صحة معرّف المستخدم: يجب أن يكون عدداً صحيحاً موجباً
  if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
    return NextResponse.json(
      { message: "رقم المستخدم غير صالح." },
      { status: 400 },
    );
  }

  // تشغيل الخوارزمية الجينية لبناء قائمة التوصيات المخصصة لهذا المستخدم
  const payload = await getRecommendationPayload(parsedUserId);
  if (!payload) {
    return NextResponse.json(
      { message: "المستخدم غير موجود." },
      { status: 404 },
    );
  }

  return NextResponse.json(payload); // إرجاع التوصيات + الإحصائيات + السجل التاريخي
}
