/**
 * Inserta los partidos de la fase de grupos de Ecuador en el Mundial 2026 (Grupo E).
 * Idempotente: si un partido ya existe (mismo local + visitante), lo omite.
 *
 *   npx tsx scripts/seed-ecuador-2026.ts
 *
 * Fuente: Wikipedia "2026 FIFA World Cup Group E" + copaamerica.com.
 * Las horas se guardan en UTC (la web del sitio las muestra en hora de Ecuador, UTC-5).
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const FIXTURES = [
  {
    homeTeam: "Costa de Marfil",
    awayTeam: "Ecuador",
    league: "Grupo E · Filadelfia",
    // 14 jun 2026, 19:00 EDT (UTC-4) = 23:00 UTC
    kickoff: new Date("2026-06-14T23:00:00Z"),
  },
  {
    homeTeam: "Ecuador",
    awayTeam: "Curazao",
    league: "Grupo E · Kansas City",
    // 20 jun 2026, 19:00 CDT (UTC-5) = 21 jun 00:00 UTC
    kickoff: new Date("2026-06-21T00:00:00Z"),
  },
  {
    homeTeam: "Ecuador",
    awayTeam: "Alemania",
    league: "Grupo E · Nueva Jersey",
    // 25 jun 2026, 16:00 EDT (UTC-4) = 20:00 UTC
    kickoff: new Date("2026-06-25T20:00:00Z"),
  },
];

async function main() {
  let created = 0;
  for (const f of FIXTURES) {
    const exists = await prisma.match.findFirst({
      where: { homeTeam: f.homeTeam, awayTeam: f.awayTeam },
      select: { id: true },
    });
    if (exists) {
      console.log(`= Ya existe: ${f.homeTeam} vs ${f.awayTeam}`);
      continue;
    }
    await prisma.match.create({ data: f });
    created++;
    console.log(`+ Creado: ${f.homeTeam} vs ${f.awayTeam} (${f.kickoff.toISOString()})`);
  }
  console.log(`\nListo. ${created} partido(s) nuevo(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
