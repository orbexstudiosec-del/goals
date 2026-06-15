import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getRealtimeStats } from "@/lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const stats = await getRealtimeStats();
  return NextResponse.json(stats, {
    headers: { "Cache-Control": "no-store" },
  });
}
