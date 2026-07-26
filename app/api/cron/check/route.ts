import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { getChangelog } from "@/lib/fetchChangelog";
import {
  pushStorageConfigured,
  getSeenIds,
  addSeenIds,
  getAllSubscriptions,
  removeSubscription,
} from "@/lib/push";

export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;
  const url = new URL(req.url);
  return url.searchParams.get("secret") === secret;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }
  if (!pushStorageConfigured()) {
    return NextResponse.json({ error: "Upstash no configurado" }, { status: 500 });
  }

  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  if (!vapidPublic || !vapidPrivate) {
    return NextResponse.json({ error: "VAPID no configurado" }, { status: 500 });
  }
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:hola@example.com",
    vapidPublic,
    vapidPrivate
  );

  const { items } = await getChangelog();
  const seenIds = await getSeenIds();
  const newItems = items.filter((i) => !seenIds.has(i.id));

  if (newItems.length === 0) {
    return NextResponse.json({ sent: false, newItems: 0 });
  }

  const bySource = new Map<string, number>();
  for (const it of newItems) bySource.set(it.sourceLabel, (bySource.get(it.sourceLabel) || 0) + 1);
  const sourceNames = [...bySource.keys()];

  const title =
    newItems.length === 1
      ? `${newItems[0].sourceLabel}: ${newItems[0].title}`
      : `${newItems.length} lanzamientos nuevos`;
  const body =
    newItems.length === 1
      ? newItems[0].excerpt.slice(0, 120)
      : sourceNames.slice(0, 4).join(", ") + (sourceNames.length > 4 ? "…" : "");

  const payload = JSON.stringify({
    title,
    body,
    url: newItems.length === 1 ? newItems[0].url : "/",
  });

  const subs = await getAllSubscriptions();
  let delivered = 0;
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(sub, payload);
        delivered++;
      } catch (err: any) {
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await removeSubscription(sub.endpoint);
        }
      }
    })
  );

  await addSeenIds(items.map((i) => i.id));

  return NextResponse.json({ sent: delivered > 0, newItems: newItems.length, delivered });
}
