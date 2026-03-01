import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = new PrismaClient();
  try {
    const { id } = await params;
    await prisma.tournament.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to delete tournament' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
