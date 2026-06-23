/**
 * Seed de TODOS los partidos de la fase de grupos del Mundial 2026 (72 partidos).
 * Idempotente: omite partidos ya existentes (verifica en ambos sentidos local/visitante).
 *
 *   npx tsx scripts/seed-mundial-2026.ts
 *
 * Horarios en UTC (Ecuador = UTC-5).
 * IMPORTANTE: verifica equipos y horas contra el fixture oficial de FIFA.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type F = { homeTeam: string; awayTeam: string; league: string; kickoff: Date };

const u = (s: string) => new Date(s + "Z");

// Genera los 6 partidos de un grupo (round-robin 4 equipos)
// equipos: [A, B, C, D]   fechas: [md1a, md1b, md2a, md2b, md3]
// Emparejamiento estándar FIFA: MD1→(A-B,C-D)  MD2→(A-C,B-D)  MD3→(A-D,B-C) simultáneos
function rr(g: string, [a,b,c,d]: string[], [t1,t2,t3,t4,t5]: Date[]): F[] {
  return [
    { homeTeam:a, awayTeam:b, league:`Grupo ${g} · Jornada 1`, kickoff:t1 },
    { homeTeam:c, awayTeam:d, league:`Grupo ${g} · Jornada 1`, kickoff:t2 },
    { homeTeam:a, awayTeam:c, league:`Grupo ${g} · Jornada 2`, kickoff:t3 },
    { homeTeam:b, awayTeam:d, league:`Grupo ${g} · Jornada 2`, kickoff:t4 },
    { homeTeam:a, awayTeam:d, league:`Grupo ${g} · Jornada 3`, kickoff:t5 },
    { homeTeam:b, awayTeam:c, league:`Grupo ${g} · Jornada 3`, kickoff:t5 },
  ];
}

const FIXTURES: F[] = [
  // ── Grupo A · Estados Unidos, Albania, Ucrania, Panamá ──────────────────────
  ...rr("A", ["Estados Unidos","Albania","Ucrania","Panamá"], [
    u("2026-06-11T23:00:00"), u("2026-06-12T02:00:00"),
    u("2026-06-17T20:00:00"), u("2026-06-17T23:00:00"),
    u("2026-06-23T23:00:00"),
  ]),

  // ── Grupo B · México, Jamaica, Polonia, Arabia Saudita ──────────────────────
  ...rr("B", ["México","Jamaica","Polonia","Arabia Saudita"], [
    u("2026-06-13T00:00:00"), u("2026-06-13T03:00:00"),
    u("2026-06-18T23:00:00"), u("2026-06-19T02:00:00"),
    u("2026-06-24T23:00:00"),
  ]),

  // ── Grupo C · Canadá, Uruguay, Marruecos, Serbia ────────────────────────────
  ...rr("C", ["Canadá","Uruguay","Marruecos","Serbia"], [
    u("2026-06-12T23:00:00"), u("2026-06-13T02:00:00"),
    u("2026-06-18T20:00:00"), u("2026-06-19T23:00:00"),
    u("2026-06-24T20:00:00"),
  ]),

  // ── Grupo D · Francia, Japón, Nigeria, Honduras ─────────────────────────────
  ...rr("D", ["Francia","Japón","Nigeria","Honduras"], [
    u("2026-06-14T20:00:00"), u("2026-06-15T00:00:00"),
    u("2026-06-19T20:00:00"), u("2026-06-20T00:00:00"),
    u("2026-06-25T23:00:00"),
  ]),

  // ── Grupo E · Alemania, Ecuador, Costa de Marfil, Curazao ✓ ─────────────────
  // Partidos explícitos para respetar el orden local/visitante del fixture oficial
  { homeTeam:"Costa de Marfil", awayTeam:"Ecuador",  league:"Grupo E · Filadelfia",   kickoff:u("2026-06-14T23:00:00") },
  { homeTeam:"Alemania",        awayTeam:"Curazao",   league:"Grupo E · Boston",        kickoff:u("2026-06-15T20:00:00") },
  { homeTeam:"Ecuador",         awayTeam:"Curazao",   league:"Grupo E · Kansas City",   kickoff:u("2026-06-21T00:00:00") },
  { homeTeam:"Alemania",        awayTeam:"Costa de Marfil", league:"Grupo E · Dallas", kickoff:u("2026-06-21T20:00:00") },
  { homeTeam:"Ecuador",         awayTeam:"Alemania",  league:"Grupo E · Nueva Jersey",  kickoff:u("2026-06-25T20:00:00") },
  { homeTeam:"Costa de Marfil", awayTeam:"Curazao",   league:"Grupo E · Nueva Jersey",  kickoff:u("2026-06-25T20:00:00") },

  // ── Grupo F · España, Colombia, Ghana, Turquía ──────────────────────────────
  ...rr("F", ["España","Colombia","Ghana","Turquía"], [
    u("2026-06-15T23:00:00"), u("2026-06-16T02:00:00"),
    u("2026-06-21T20:00:00"), u("2026-06-21T23:00:00"),
    u("2026-06-26T20:00:00"),
  ]),

  // ── Grupo G · Portugal, Chile, Senegal, Irán ────────────────────────────────
  ...rr("G", ["Portugal","Chile","Senegal","Irán"], [
    u("2026-06-16T20:00:00"), u("2026-06-16T23:00:00"),
    u("2026-06-22T00:00:00"), u("2026-06-22T20:00:00"),
    u("2026-06-26T23:00:00"),
  ]),

  // ── Grupo H · Argentina, Australia, Corea del Sur, Argelia ─────────────────
  ...rr("H", ["Argentina","Australia","Corea del Sur","Argelia"], [
    u("2026-06-17T00:00:00"), u("2026-06-17T23:00:00"),
    u("2026-06-22T23:00:00"), u("2026-06-23T20:00:00"),
    u("2026-06-27T20:00:00"),
  ]),

  // ── Grupo I · Brasil, Suiza, Camerún, Egipto ────────────────────────────────
  ...rr("I", ["Brasil","Suiza","Camerún","Egipto"], [
    u("2026-06-18T00:00:00"), u("2026-06-18T23:00:00"),
    u("2026-06-23T23:00:00"), u("2026-06-24T03:00:00"),
    u("2026-06-27T23:00:00"),
  ]),

  // ── Grupo J · Inglaterra, Costa Rica, Jordania, Sudáfrica ──────────────────
  ...rr("J", ["Inglaterra","Costa Rica","Jordania","Sudáfrica"], [
    u("2026-06-18T20:00:00"), u("2026-06-19T00:00:00"),
    u("2026-06-24T00:00:00"), u("2026-06-24T20:00:00"),
    u("2026-06-28T20:00:00"),
  ]),

  // ── Grupo K · Países Bajos, Bolivia, Uzbekistán, Túnez ─────────────────────
  ...rr("K", ["Países Bajos","Bolivia","Uzbekistán","Túnez"], [
    u("2026-06-19T20:00:00"), u("2026-06-20T23:00:00"),
    u("2026-06-25T00:00:00"), u("2026-06-25T23:00:00"),
    u("2026-06-28T23:00:00"),
  ]),

  // ── Grupo L · Bélgica, Croacia, Nueva Zelanda, Congo ───────────────────────
  ...rr("L", ["Bélgica","Croacia","Nueva Zelanda","Congo"], [
    u("2026-06-20T03:00:00"), u("2026-06-20T20:00:00"),
    u("2026-06-26T00:00:00"), u("2026-06-26T20:00:00"),
    u("2026-06-29T20:00:00"),
  ]),
];

async function main() {
  let created = 0, skipped = 0;

  for (const f of FIXTURES) {
    // Verifica en ambos sentidos para evitar duplicados con local/visitante invertidos
    const exists = await prisma.match.findFirst({
      where: {
        OR: [
          { homeTeam: f.homeTeam, awayTeam: f.awayTeam },
          { homeTeam: f.awayTeam, awayTeam: f.homeTeam },
        ],
      },
      select: { id: true },
    });
    if (exists) {
      console.log(`= Existe: ${f.homeTeam} vs ${f.awayTeam}`);
      skipped++;
      continue;
    }
    await prisma.match.create({ data: f });
    console.log(`+ Creado: ${f.homeTeam} vs ${f.awayTeam}`);
    created++;
  }

  console.log(`\nListo. ${created} creado(s), ${skipped} omitido(s) de ${FIXTURES.length} partidos.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
