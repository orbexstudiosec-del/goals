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
