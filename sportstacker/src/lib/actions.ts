'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createTournament(data: { name: string; sport: string }) {
  try {
    const tournament = await prisma.tournament.create({
      data: {
        name: data.name,
        sport: data.sport,
      },
    });

    return { success: true, id: tournament.id };
  } catch (error) {
    console.error('Error creating tournament:', error);
    return { success: false, error: 'Failed to create tournament' };
  } finally {
    await prisma.$disconnect();
  }
}