'use server';

import { PrismaClient } from '@prisma/client';

export async function registerPlayer(data: {
  name: string;
  gender: string;
  ageCategory: string;
  weightClass?: string;
  belt?: string;
  tournamentId: string;
}) {
  const DATABASE_URL = "postgresql://postgres:Vivek%401123vivek@db.jjzrklsxpuznkagsqjxb.supabase.co:5432/postgres";
  const prisma = new PrismaClient({ datasourceUrl: DATABASE_URL });

  try {
    const player = await prisma.player.create({
      data: {
        name: data.name,
        gender: data.gender,
        ageCategory: data.ageCategory,
        weightClass: data.weightClass,
        belt: data.belt,
        tournamentId: data.tournamentId,
      },
    });

    return { success: true, id: player.id };
  } catch (error) {
    console.error('Error registering player:', error);
    return { success: false, error: 'Failed to register player' };
  } finally {
    await prisma.$disconnect();
  }
}