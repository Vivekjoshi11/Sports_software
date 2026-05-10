import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, userId } = await params;

  // Only allow if the session user is the one requesting or admin
  if (session.user.id !== userId && session.user.role !== 'SUPERADMIN' && session.user.role !== 'TOURNAMENT_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const official = await prisma.tournamentOfficial.findUnique({
      where: { userId_tournamentId: { userId, tournamentId: id } },
    });

    if (!official) {
      return NextResponse.json({ groupKeys: [] });
    }

    return NextResponse.json({ groupKeys: official.groupKeys });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch assigned groups' }, { status: 500 });
  }
}