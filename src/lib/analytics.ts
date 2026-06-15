import { prisma } from "@/lib/prisma";

const DAY = 24 * 60 * 60 * 1000;

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * DAY);
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getViewsSummary() {
  const [today, d7, d30, total, uniq7, uniq30] = await Promise.all([
    prisma.pageView.count({ where: { createdAt: { gte: startOfToday() } } }),
    prisma.pageView.count({ where: { createdAt: { gte: daysAgo(7) } } }),
    prisma.pageView.count({ where: { createdAt: { gte: daysAgo(30) } } }),
    prisma.pageView.count(),
    prisma.pageView
      .findMany({
        where: { createdAt: { gte: daysAgo(7) }, visitor: { not: null } },
        distinct: ["visitor"],
        select: { visitor: true },
      })
      .then((r) => r.length),
    prisma.pageView
      .findMany({
        where: { createdAt: { gte: daysAgo(30) }, visitor: { not: null } },
        distinct: ["visitor"],
        select: { visitor: true },
      })
      .then((r) => r.length),
  ]);

  return { today, d7, d30, total, uniq7, uniq30 };
}

export type DayPoint = { label: string; date: string; views: number };

/** Vistas por día de los últimos `days` días (rellena días sin datos con 0). */
export async function getViewsPerDay(days = 14): Promise<DayPoint[]> {
  const since = daysAgo(days - 1);
  since.setHours(0, 0, 0, 0);

  const rows = await prisma.$queryRaw<{ day: Date; count: number }[]>`
    SELECT date_trunc('day', "createdAt") AS day, count(*)::int AS count
    FROM "PageView"
    WHERE "createdAt" >= ${since}
    GROUP BY day
    ORDER BY day ASC
  `;

  const map = new Map<string, number>();
  for (const r of rows) {
    map.set(new Date(r.day).toISOString().slice(0, 10), Number(r.count));
  }

  const out: DayPoint[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(since.getTime() + i * DAY);
    const key = d.toISOString().slice(0, 10);
    out.push({
      date: key,
      label: d.toLocaleDateString("es-EC", { day: "numeric", month: "short" }),
      views: map.get(key) ?? 0,
    });
  }
  return out;
}

// ─────────────────────────────────────────── Tiempo real

export type RealtimeStats = {
  activeNow: number; // visitantes únicos en los últimos 5 min
  views5m: number;
  views30m: number;
  perMinute: { t: string; count: number }[]; // últimos 30 min
  topPages: { path: string; views: number }[];
  recent: { path: string; referrer: string | null; at: string }[];
};

export async function getRealtimeStats(): Promise<RealtimeStats> {
  const now = Date.now();
  const m5 = new Date(now - 5 * 60 * 1000);
  const m30 = new Date(now - 30 * 60 * 1000);

  const [activeRows, views5m, views30m, perMinRows, topRows, recent] = await Promise.all([
    prisma.pageView.findMany({
      where: { createdAt: { gte: m5 }, visitor: { not: null } },
      distinct: ["visitor"],
      select: { visitor: true },
    }),
    prisma.pageView.count({ where: { createdAt: { gte: m5 } } }),
    prisma.pageView.count({ where: { createdAt: { gte: m30 } } }),
    prisma.$queryRaw<{ minute: Date; count: number }[]>`
      SELECT date_trunc('minute', "createdAt") AS minute, count(*)::int AS count
      FROM "PageView"
      WHERE "createdAt" >= ${m30}
      GROUP BY minute
      ORDER BY minute ASC
    `,
    prisma.pageView.groupBy({
      by: ["path"],
      where: { createdAt: { gte: m5 } },
      _count: { path: true },
      orderBy: { _count: { path: "desc" } },
      take: 6,
    }),
    prisma.pageView.findMany({
      where: { createdAt: { gte: m30 } },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { path: true, referrer: true, createdAt: true },
    }),
  ]);

  const map = new Map<string, number>();
  for (const r of perMinRows) {
    map.set(new Date(r.minute).toISOString().slice(0, 16), Number(r.count));
  }
  const base = new Date(now);
  base.setSeconds(0, 0);
  const perMinute: { t: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(base.getTime() - i * 60000);
    perMinute.push({ t: d.toISOString(), count: map.get(d.toISOString().slice(0, 16)) ?? 0 });
  }

  return {
    activeNow: activeRows.length,
    views5m,
    views30m,
    perMinute,
    topPages: topRows.map((r) => ({ path: r.path, views: r._count.path })),
    recent: recent.map((r) => ({ path: r.path, referrer: r.referrer, at: r.createdAt.toISOString() })),
  };
}

export async function getTopPages(days = 30, limit = 8) {
  const rows = await prisma.pageView.groupBy({
    by: ["path"],
    where: { createdAt: { gte: daysAgo(days) } },
    _count: { path: true },
    orderBy: { _count: { path: "desc" } },
    take: limit,
  });
  return rows.map((r) => ({ path: r.path, views: r._count.path }));
}
