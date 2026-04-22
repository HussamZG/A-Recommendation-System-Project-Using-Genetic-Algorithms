import { NextResponse } from "next/server";

import { getRecommendationPayload } from "@/lib/server/recommender";


export async function GET(
  _request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  const { userId } = await context.params;
  const parsedUserId = Number(userId);

  if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
    return NextResponse.json(
      { message: "رقم المستخدم غير صالح." },
      { status: 400 },
    );
  }

  const payload = await getRecommendationPayload(parsedUserId);
  if (!payload) {
    return NextResponse.json(
      { message: "المستخدم غير موجود." },
      { status: 404 },
    );
  }

  return NextResponse.json(payload);
}
