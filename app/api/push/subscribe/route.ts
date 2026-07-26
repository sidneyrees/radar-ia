import { NextRequest, NextResponse } from "next/server";
import { saveSubscription, removeSubscription, pushStorageConfigured } from "@/lib/push";

export async function POST(req: NextRequest) {
  if (!pushStorageConfigured()) {
    return NextResponse.json(
      { error: "Falta configurar UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN" },
      { status: 500 }
    );
  }
  const body = await req.json();
  if (!body?.endpoint || !body?.keys?.p256dh || !body?.keys?.auth) {
    return NextResponse.json({ error: "subscription inválida" }, { status: 400 });
  }
  await saveSubscription(body);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.endpoint) {
    return NextResponse.json({ error: "falta endpoint" }, { status: 400 });
  }
  await removeSubscription(body.endpoint);
  return NextResponse.json({ ok: true });
}
