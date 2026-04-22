import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { ACTIVE_USER_COOKIE, parseActiveUserId } from "@/lib/active-user";
import {
  applyTrackEvent,
  applyTrackEventToProduct,
  calculateFitness,
  type TrackEvent,
} from "@/lib/tracking";
import { createClient as createSupabaseClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";


function isTrackEvent(value: unknown): value is TrackEvent {
  return value === "view" || value === "click" || value === "purchase";
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const activeUserId = parseActiveUserId(
    cookieStore.get(ACTIVE_USER_COOKIE)?.value,
  );

  if (!activeUserId) {
    return NextResponse.json(
      { message: "اختر رقم مستخدم أولاً لبدء تتبّع السلوك." },
      { status: 400 },
    );
  }

  const body = await request.json().catch(() => null);
  const productId = Number(body?.productId);
  const event = body?.event;

  if (!Number.isInteger(productId) || productId <= 0 || !isTrackEvent(event)) {
    return NextResponse.json(
      { message: "بيانات التتبع غير صالحة." },
      { status: 400 },
    );
  }

  const supabase = createAdminClient() ?? (await createSupabaseClient(cookieStore));

  const [productResult, interactionResult] = await Promise.all([
    supabase
      .from("products")
      .select("product_id, views, clicks, purchases")
      .eq("product_id", productId)
      .maybeSingle(),
    supabase
      .from("interactions")
      .select("user_id, product_id, viewed, clicked, purchased, rating")
      .eq("user_id", activeUserId)
      .eq("product_id", productId)
      .maybeSingle(),
  ]);

  if (productResult.error) {
    return NextResponse.json(
      {
        message:
          "تعذر قراءة جدول المنتجات من Supabase. شغّل schema أولاً ثم أعد المحاولة.",
        details: productResult.error.message,
      },
      { status: 503 },
    );
  }

  if (!productResult.data) {
    return NextResponse.json(
      { message: "المنتج غير موجود في Supabase." },
      { status: 404 },
    );
  }

  if (interactionResult.error && interactionResult.error.code !== "PGRST116") {
    return NextResponse.json(
      {
        message:
          "تعذر قراءة جدول التفاعلات من Supabase. شغّل schema أولاً ثم أعد المحاولة.",
        details: interactionResult.error.message,
      },
      { status: 503 },
    );
  }

  const nextInteraction = applyTrackEvent(
    {
      viewed: interactionResult.data?.viewed ?? 0,
      clicked: interactionResult.data?.clicked ?? 0,
      purchased: interactionResult.data?.purchased ?? 0,
      rating: interactionResult.data?.rating ?? 0,
    },
    event,
  );

  const nextProductCounters = applyTrackEventToProduct(
    {
      views: productResult.data.views ?? 0,
      clicks: productResult.data.clicks ?? 0,
      purchases: productResult.data.purchases ?? 0,
    },
    event,
  );

  const fitness = calculateFitness(nextInteraction);

  const [upsertInteractionResult, updateProductResult] = await Promise.all([
    supabase.from("interactions").upsert(
      {
        user_id: activeUserId,
        product_id: productId,
        viewed: nextInteraction.viewed,
        clicked: nextInteraction.clicked,
        purchased: nextInteraction.purchased,
        rating: nextInteraction.rating,
        fitness,
      },
      {
        onConflict: "user_id,product_id",
      },
    ),
    supabase
      .from("products")
      .update({
        views: nextProductCounters.views,
        clicks: nextProductCounters.clicks,
        purchases: nextProductCounters.purchases,
      })
      .eq("product_id", productId),
  ]);

  if (upsertInteractionResult.error || updateProductResult.error) {
    return NextResponse.json(
      {
        message: "فشل حفظ التفاعل في Supabase.",
        details:
          upsertInteractionResult.error?.message ??
          updateProductResult.error?.message,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    userId: activeUserId,
    productId,
    event,
    fitness,
  });
}
