import { neon } from "@neondatabase/serverless";

export type PushSubscriptionJSON = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

export function pushStorageConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ensureTables(sql: any) {
  await sql`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      endpoint TEXT PRIMARY KEY,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS seen_items (
      id TEXT PRIMARY KEY
    )
  `;
}

export async function saveSubscription(sub: PushSubscriptionJSON): Promise<void> {
  const sql = getSql();
  if (!sql) throw new Error("Neon no configurado");
  await ensureTables(sql);
  await sql`
    INSERT INTO push_subscriptions (endpoint, p256dh, auth)
    VALUES (${sub.endpoint}, ${sub.keys.p256dh}, ${sub.keys.auth})
    ON CONFLICT (endpoint) DO UPDATE SET p256dh = ${sub.keys.p256dh}, auth = ${sub.keys.auth}
  `;
}

export async function removeSubscription(endpoint: string): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  await ensureTables(sql);
  await sql`DELETE FROM push_subscriptions WHERE endpoint = ${endpoint}`;
}

export async function getAllSubscriptions(): Promise<PushSubscriptionJSON[]> {
  const sql = getSql();
  if (!sql) return [];
  await ensureTables(sql);
  const rows = (await sql`SELECT endpoint, p256dh, auth FROM push_subscriptions`) as Array<{
    endpoint: string;
    p256dh: string;
    auth: string;
  }>;
  return rows.map((r) => ({ endpoint: r.endpoint, keys: { p256dh: r.p256dh, auth: r.auth } }));
}

export async function getSeenIds(): Promise<Set<string>> {
  const sql = getSql();
  if (!sql) return new Set();
  await ensureTables(sql);
  const rows = (await sql`SELECT id FROM seen_items`) as Array<{ id: string }>;
  return new Set(rows.map((r) => r.id));
}

export async function addSeenIds(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const sql = getSql();
  if (!sql) return;
  await ensureTables(sql);
  for (const id of ids) {
    await sql`INSERT INTO seen_items (id) VALUES (${id}) ON CONFLICT DO NOTHING`;
  }
}
