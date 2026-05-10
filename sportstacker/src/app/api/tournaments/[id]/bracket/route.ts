/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    const groupKey = request.nextUrl.searchParams.get('group');

    const where: any = { tournamentId: id };
    if (groupKey) {
      where.groupKey = groupKey;
    }

    // For OFFICIAL, filter to their assigned groupKeys
    if (session.user.role === 'OFFICIAL') {
      const official = await prisma.tournamentOfficial.findUnique({
        where: { userId_tournamentId: { userId: session.user.id, tournamentId: id } },
      });
      if (!official) {
        return NextResponse.json([]);
      }
      if (groupKey && !official.groupKeys.includes(groupKey)) {
        return NextResponse.json([]);
      }
      where.groupKey = { in: official.groupKeys };
    }

    const results = await prisma.bracketResult.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching bracket results:', error);
    return NextResponse.json({ error: 'Failed to fetch bracket results' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { groupKey, winners, isFinalized } = body;

    // Check permissions
    let allowed = false;
    if (session.user.role === 'TOURNAMENT_ADMIN') {
      const tournament = await prisma.tournament.findUnique({ where: { id } });
      allowed = tournament?.ownerId === session.user.id;
    } else if (session.user.role === 'SUPERADMIN') {
      allowed = true;
    } else if (session.user.role === 'OFFICIAL') {
      const official = await prisma.tournamentOfficial.findUnique({
        where: { userId_tournamentId: { userId: session.user.id, tournamentId: id } },
      });
      allowed = official?.groupKeys.includes(groupKey) || false;
    }

    if (!allowed) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if result already exists
    const existing = await prisma.bracketResult.findFirst({
      where: { tournamentId: id, groupKey },
    });

    let result;
    if (existing) {
      // Update existing
      result = await prisma.bracketResult.update({
        where: { id: existing.id },
        data: { winners, isFinalized },
      });
    } else {
      // Create new
      result = await prisma.bracketResult.create({
        data: {
          tournamentId: id,
          groupKey,
          winners,
          isFinalized: isFinalized || false,
        },
      });
    }

    // Log audit for OFFICIAL
    if (session.user.role === 'OFFICIAL') {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          userName: session.user.name || 'Unknown',
          role: session.user.role,
          action: 'UPDATE_BRACKET',
          tournamentId: id,
          groupKey,
          details: { winners, isFinalized },
        },
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving bracket result:', error);
    return NextResponse.json({ error: 'Failed to save bracket result' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { searchParams } = new URL(request.url);
    const groupKey = searchParams.get('group');

    if (!groupKey) {
      return NextResponse.json({ error: 'Group key is required' }, { status: 400 });
    }

    // Only TOURNAMENT_ADMIN or SUPERADMIN can delete
    let allowed = false;
    if (session.user.role === 'TOURNAMENT_ADMIN') {
      const tournament = await prisma.tournament.findUnique({ where: { id } });
      allowed = tournament?.ownerId === session.user.id;
    } else if (session.user.role === 'SUPERADMIN') {
      allowed = true;
    }

    if (!allowed) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete the bracket result for this tournament and group
    await prisma.bracketResult.deleteMany({
      where: {
        tournamentId: id,
        groupKey: groupKey,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bracket result:', error);
    return NextResponse.json({ error: 'Failed to delete bracket result' }, { status: 500 });
  }
}
