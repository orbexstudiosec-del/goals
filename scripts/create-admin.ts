import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "crypto";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const prisma = new PrismaClient();

async function main() {
  const [email, password, ...nameParts] = process.argv.slice(2);
  if (!email || !password) {
    console.error('Uso: npm run admin:create -- <email> <password> ["Nombre"]');
    process.exit(1);
  }
  const name = nameParts.join(" ") || "Admin";
  const user = await prisma.adminUser.upsert({
    where: { email: email.toLowerCase() },
    update: { passwordHash: hashPassword(password), name },
    create: { email: email.toLowerCase(), name, passwordHash: hashPassword(password) },
  });
  console.log(`✔ Admin listo: ${user.email} (${user.name})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
