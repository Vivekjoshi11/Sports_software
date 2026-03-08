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
  console.log('Registering player:', data);
  const prisma = new PrismaClient();

  try {
    const player = await prisma.player.create({
      data: {
        name: data.name,
        gender: data.gender,
        ageCategory: data.ageCategory,
        weightClass: data.weightClass || null,
        belt: data.belt || null,
        tournamentId: data.tournamentId,
      },
    });

    console.log('Player registered successfully:', player);
    return { success: true, id: player.id };
  } catch (error) {
    console.error('Error registering player:', error);
    return { success: false, error: 'Failed to register player' };
  } finally {
    await prisma.$disconnect();
  }
}