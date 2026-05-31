import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DAY = 24 * 60 * 60 * 1000;

function rand(n: number) {
  return Math.floor(Math.random() * n);
}

async function main() {
  const [memes, confs, notes, articles] = await Promise.all([
    prisma.post.findMany({ where: { type: "MEME" }, select: { slug: true }, take: 8 }),
    prisma.post.findMany({ where: { type: "CONFESSION" }, select: { slug: true }, take: 8 }),
    prisma.post.findMany({ where: { type: "NOTE" }, select: { slug: true }, take: 8 }),
    prisma.article.findMany({ select: { slug: true }, take: 12 }),
  ]);

  const paths: string[] = [
    "/", "/", "/", "/memes", "/memes", "/confesionario", "/confesionario",
    "/notas", "/publicar", "/buscar",
    ...memes.map((m) => `/memes/${m.slug}`),
    ...confs.map((c) => `/confesionario/${c.slug}`),
    ...notes.map((n) => `/notas/${n.slug}`),
    ...articles.map((a) => `/articulo/${a.slug}`),
  ];

  const visitors = Array.from({ length: 140 }, (_, i) => `seed-visitor-${i + 1}`);

  // Limpia visitas sembradas previas
  await prisma.pageView.deleteMany({ where: { visitor: { startsWith: "seed-visitor-" } } });

  const rows: { path: string; visitor: string; referrer: string | null; createdAt: Date }[] = [];
  const referrers = [null, "https://www.google.com/", "https://www.facebook.com/", "https://t.co/", "https://www.instagram.com/"];

  for (let d = 13; d >= 0; d--) {
    const base = Date.now() - d * DAY;
    // más visitas en días recientes
    const count = 25 + rand(60) + (13 - d) * 3;
    for (let i = 0; i < count; i++) {
      const when = new Date(base - rand(DAY));
      rows.push({
        path: paths[rand(paths.length)],
        visitor: visitors[rand(visitors.length)],
        referrer: referrers[rand(referrers.length)],
        createdAt: when,
      });
    }
  }

  await prisma.pageView.createMany({ data: rows });
  console.log(`✔ ${rows.length} visitas de ejemplo sembradas.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
