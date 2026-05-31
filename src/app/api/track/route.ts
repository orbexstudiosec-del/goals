import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { path, referrer } = await req.json();
    if (
      typeof path !== "string" ||
      path.startsWith("/admin") ||
      path.startsWith("/api")
    ) {
      return NextResponse.json({ ok: true });
    }

    const visitor = (await cookies()).get("gx_uid")?.value ?? null;
    const ref = typeof referrer === "string" && referrer ? referrer.slice(0, 512) : null;

    await prisma.pageView.create({
      data: { path: path.slice(0, 512), visitor, referrer: ref },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
