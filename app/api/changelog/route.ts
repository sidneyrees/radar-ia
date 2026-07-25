import { NextResponse } from "next/server";
import { getChangelog } from "@/lib/fetchChangelog";

export const revalidate = 3600;

export async function GET() {
  const result = await getChangelog();
  return NextResponse.json(result);
}
