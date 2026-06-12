import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();
const AB = "abcdefghijkmnpqrstuvwxyz23456789";

function code(): string {
  const b = randomUUID().replace(/-/g, "");
  let c = "";
  for (let i = 0; i < 6; i++) c += AB[parseInt(b[i], 16) % AB.length];
  return c;
}

async function main() {
  const arts = await prisma.article.findMany({ where: { shortCode: null }, select: { id: true } });
  for (const a of arts) {
    let c = code();
    while (await prisma.article.findUnique({ where: { shortCode: c }, select: { id: true } })) c = code();
    await prisma.article.update({ where: { id: a.id }, data: { shortCode: c } });
  }
  console.log(`Backfill completo: ${arts.length} artículo(s) con código corto`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
