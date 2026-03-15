/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!prisma) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const groupKey = request.nextUrl.searchParams.get('group');
    
    const where: any = { tournamentId: id };
    if (groupKey) {
      where.groupKey = groupKey;
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
  const { id } = await params;

  if (!prisma) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { groupKey, winners, isFinalized } = body;

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
  const { id } = await params;

  if (!prisma) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const groupKey = searchParams.get('group');

    if (!groupKey) {
      return NextResponse.json({ error: 'Group key is required' }, { status: 400 });
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
