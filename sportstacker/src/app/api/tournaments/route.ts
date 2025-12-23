import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function POST(request: NextRequest) {
  console.log('API called');
  const DATABASE_URL = "postgresql://postgres:Vivek%401123vivek@db.jjzrklsxpuznkagsqjxb.supabase.co:5432/postgres";
  const prisma = new PrismaClient({ datasourceUrl: DATABASE_URL });
  try {
    const { name, sport } = await request.json();
    console.log('Data:', { name, sport });

    if (!name || !sport) {
      return NextResponse.json({ error: 'Name and sport are required' }, { status: 400 });
    }

    const tournament = await prisma.tournament.create({
      data: {
        name,
        sport,
      },
    });

    console.log('Created:', tournament);
    return NextResponse.json({ id: tournament.id }, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to create tournament' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}