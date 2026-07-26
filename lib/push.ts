import { Redis } from "@upstash/redis";

const SUBS_KEY = "push:subscriptions";
const SEEN_KEY = "push:seen-ids";

export type PushSubscriptionJSON = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export function pushStorageConfigured(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

export async function saveSubscription(sub: PushSubscriptionJSON): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error("Upstash no configurado");
  await redis.hset(SUBS_KEY, { [sub.endpoint]: JSON.stringify(sub) });
}

export async function removeSubscription(endpoint: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.hdel(SUBS_KEY, endpoint);
}

export async function getAllSubscriptions(): Promise<PushSubscriptionJSON[]> {
  const redis = getRedis();
  if (!redis) return [];
  const all = await redis.hgetall<Record<string, string>>(SUBS_KEY);
  if (!all) return [];
  return Object.values(all).map((v) => (typeof v === "string" ? JSON.parse(v) : v));
}

export async function getSeenIds(): Promise<Set<string>> {
  const redis = getRedis();
  if (!redis) return new Set();
  const ids = await redis.smembers(SEEN_KEY);
  return new Set(ids ?? []);
}

export async function addSeenIds(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const redis = getRedis();
  if (!redis) return;
  await redis.sadd(SEEN_KEY, ids[0], ...ids.slice(1));
}
