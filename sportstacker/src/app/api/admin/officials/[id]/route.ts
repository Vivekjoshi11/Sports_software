import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !['SUPERADMIN', 'TOURNAMENT_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const official = await prisma.tournamentOfficial.findFirst({
      where: { userId: id },
    });

    if (!official) {
      return NextResponse.json({ tournamentId: '', groupKeys: [] });
    }

    // Check if the user has access to this tournament
    if (session.user.role === 'TOURNAMENT_ADMIN') {
      const tournament = await prisma.tournament.findUnique({
        where: { id: official.tournamentId },
      });
      if (!tournament || tournament.ownerId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json({
      tournamentId: official.tournamentId,
      groupKeys: official.groupKeys,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch official assignment' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !['SUPERADMIN', 'TOURNAMENT_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const { tournamentId, groupKeys } = await request.json();

    if (!tournamentId || !groupKeys || groupKeys.length === 0) {
      return NextResponse.json({ error: 'Tournament and groups are required' }, { status: 400 });
    }

    // Check if tournament exists and user has access
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
    });

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    if (session.user.role === 'TOURNAMENT_ADMIN' && tournament.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update the official assignment
    console.log('Updating official assignment for user:', id, 'to tournament:', tournamentId, 'groups:', groupKeys);

    // Check if official already exists for this user
    const existing = await prisma.tournamentOfficial.findFirst({
      where: { userId: id },
    });

    console.log('Existing assignment:', existing);

    if (existing) {
      // Update existing assignment
      await prisma.tournamentOfficial.update({
        where: { id: existing.id },
        data: {
          tournamentId,
          groupKeys,
        },
      });
      console.log('Updated existing assignment');
    } else {
      // Create new assignment
      await prisma.tournamentOfficial.create({
        data: {
          userId: id,
          tournamentId,
          groupKeys,
        },
      });
      console.log('Created new assignment');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to update official assignment' }, { status: 500 });
  }
}