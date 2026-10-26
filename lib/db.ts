import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: url }),
  });
}

function getClient(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  const client = createClient();
  globalForPrisma.prisma = client;
  return client;
}

// The real client is created on first property access, never at import time.
// This keeps `next build` from failing when DATABASE_URL is absent.
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getClient();
    const value: unknown = Reflect.get(client, property, client);
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value;
  },
});

export type DatabaseErrorInfo = {
  code: string;
  message: string;
  status: number;
};

/**
 * Convert a Prisma/database error into a safe public message.
 * Never includes connection strings or credentials.
 */
export function describeDatabaseError(error: unknown): DatabaseErrorInfo {
  if (error instanceof Error && error.message === "DATABASE_URL is not set") {
    return {
      code: "NO_DATABASE_URL",
      message: "Database is not configured. Set DATABASE_URL in the hosting environment.",
      status: 500,
    };
  }

  let code = "";
  if (typeof error === "object" && error !== null && "code" in error) {
    const value = (error as { code?: unknown }).code;
    if (typeof value === "string") code = value;
  }

  switch (code) {
    case "P1000":
      return {
        code,
        message: "Database authentication failed. Check the production database credentials.",
        status: 500,
      };
    case "P1001":
      return {
        code,
        message: "Cannot reach the database. Check the production database connection.",
        status: 500,
      };
    case "P1002":
      return { code, message: "Database connection timed out.", status: 500 };
    case "P2021":
      return {
        code,
        message: "Database tables are not initialized. Run the production database setup.",
        status: 500,
      };
    case "P2022":
      return {
        code,
        message: "Database schema is out of date. Run the production database setup.",
        status: 500,
      };
    case "P2025":
      return { code, message: "Record not found.", status: 404 };
    case "P2002":
      return {
        code,
        message: "A record with this value already exists.",
        status: 409,
      };
    default:
      return {
        code: code || "DB_ERROR",
        message: "Database request failed. Please try again.",
        status: 500,
      };
  }
}
