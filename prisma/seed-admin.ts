import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

type AdminSeedConfig = {
  databaseUrl: string;
  email: string;
  password: string;
  name: string;
};

function getConfig(): AdminSeedConfig {
  const databaseUrl = process.env.DATABASE_URL;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Administrator";

  if (!databaseUrl) throw new Error("DATABASE_URL is not set");
  if (!email) throw new Error("ADMIN_EMAIL is not set");
  if (!password) throw new Error("ADMIN_PASSWORD is not set");
  if (password.length < 8) throw new Error("ADMIN_PASSWORD must be at least 8 characters");

  return { databaseUrl, email, password, name };
}

const config = getConfig();

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: config.databaseUrl }),
});

async function main() {
  const passwordHash = await bcrypt.hash(config.password, 12);

  const user = await prisma.user.upsert({
    where: { email: config.email },
    update: {
      name: config.name,
      password: passwordHash,
      role: "SUPER_ADMIN",
      active: true,
    },
    create: {
      email: config.email,
      name: config.name,
      password: passwordHash,
      role: "SUPER_ADMIN",
      active: true,
    },
    select: {
      id: true,
      email: true,
      role: true,
      active: true,
    },
  });

  console.log(`SUPER_ADMIN ready: ${user.email} (${user.role}, active=${user.active})`);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
