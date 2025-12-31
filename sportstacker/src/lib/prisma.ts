import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = (() => {
  if (!process.env.DATABASE_URL) return null;

  const client =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: ['query'],
    });

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client;

  return client;
})();