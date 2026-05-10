import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let tournaments;
    if (session.user.role === 'SUPERADMIN') {
      tournaments = await prisma.tournament.findMany();
    } else if (session.user.role === 'TOURNAMENT_ADMIN') {
      tournaments = await prisma.tournament.findMany({
        where: { ownerId: session.user.id },
      });
    } else if (session.user.role === 'OFFICIAL') {
      // Get tournaments where the user is assigned as official
      const officialAssignments = await prisma.tournamentOfficial.findMany({
        where: { userId: session.user.id },
        select: { tournamentId: true },
      });
      const tournamentIds = officialAssignments.map(a => a.tournamentId);
      tournaments = await prisma.tournament.findMany({
        where: { id: { in: tournamentIds } },
      });
    } else {
      tournaments = [];
    }

    return NextResponse.json(tournaments);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch tournaments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !['TOURNAMENT_ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { name, sport } = await request.json();

    if (!name || !sport) {
      return NextResponse.json({ error: 'Name and sport are required' }, { status: 400 });
    }

    const tournament = await prisma.tournament.create({
      data: {
        name,
        sport,
        ownerId: session.user.id,
      },
    });

    return NextResponse.json({ id: tournament.id }, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to create tournament' }, { status: 500 });
  }
}