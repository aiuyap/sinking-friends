import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  
  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 400 });
  }

  try {
    // Find the invite with group details
    const invite = await prisma.invite.findUnique({
      where: { token },
      include: { group: true }
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invalid invite' }, { status: 404 });
    }

    // Check expiration
    if (invite.expiresAt < new Date()) {
      await prisma.invite.update({
        where: { id: invite.id },
        data: { status: 'EXPIRED' }
      });
      return NextResponse.json({ error: 'Invite expired' }, { status: 400 });
    }

    // Check if already in pending status
    if (invite.status !== 'PENDING') {
      return NextResponse.json({ error: 'Invite no longer valid' }, { status: 400 });
    }

    return NextResponse.json({
      groupId: invite.groupId,
      groupName: invite.group.name,
      email: invite.email
    });

  } catch (error) {
    console.error('Invite verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}