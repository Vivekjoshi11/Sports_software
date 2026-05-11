'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createTournament(data: { name: string; sport: string; ownerId: string }) {
  try {
    const tournament = await prisma.tournament.create({
      data: {
        name: data.name,
        sport: data.sport,
        ownerId: data.ownerId,
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