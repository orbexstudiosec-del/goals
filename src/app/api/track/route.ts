import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const ONE_YEAR = 60 * 60 * 24 * 365;

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

    // Identifica al visitante: si no tiene cookie aún, se la asignamos ahora
    // (así todo visitante cuenta como "activo", no solo quienes interactúan).
    const store = await cookies();
    let visitor = store.get("gx_uid")?.value ?? null;
    if (!visitor) {
      visitor = randomUUID();
      store.set("gx_uid", visitor, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: ONE_YEAR,
      });
    }
    const ref = typeof referrer === "string" && referrer ? referrer.slice(0, 512) : null;

    await prisma.pageView.create({
      data: { path: path.slice(0, 512), visitor, referrer: ref },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
