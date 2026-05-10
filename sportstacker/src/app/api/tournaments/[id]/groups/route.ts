import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Player {
  gender: string;
  ageCategory: string;
  weightClass?: string | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const players = await prisma.player.findMany({
      where: { tournamentId: id },
      select: { gender: true, ageCategory: true, weightClass: true },
    });

    const groups = players.reduce((acc: { [key: string]: boolean }, player: Player) => {
      const key = `${player.gender}-${player.ageCategory}-${player.weightClass || 'No Weight'}`;
      acc[key] = true;
      return acc;
    }, {});

    return NextResponse.json(Object.keys(groups));
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
  }
}