import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !['SUPERADMIN', 'TOURNAMENT_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { name, email, password, role, tournamentId, groupKeys } = await request.json();

    if (!name || !email || !password || !role || !tournamentId || !groupKeys || groupKeys.length === 0) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    // Create tournament official assignment
    await prisma.tournamentOfficial.create({
      data: {
        userId: user.id,
        tournamentId,
        groupKeys,
      },
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to create official' }, { status: 500 });
  }
}