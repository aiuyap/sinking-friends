import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params;
    const { 
      token, 
      biWeeklyContribution, 
      personalPayday 
    } = await req.json();

    // Validate inputs
    if (!token || !biWeeklyContribution || !personalPayday) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find the invite
    const invite = await prisma.invite.findUnique({
      where: { 
        token,
        groupId,
        status: 'PENDING',
        expiresAt: { gte: new Date() }
      },
      include: { group: true }
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 400 });
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: invite.email }
    });

    // If user doesn't exist, create user
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: invite.email,
          name: invite.email.split('@')[0]
        }
      });
    }

    // Create group member
    const groupMember = await prisma.groupMember.create({
      data: {
        groupId,
        userId: user.id,
        biWeeklyContribution: Number(biWeeklyContribution),
        personalPayday: Number(personalPayday),
        role: 'MEMBER'
      }
    });

    // Update invite status
    await prisma.invite.update({
      where: { id: invite.id },
      data: { status: 'ACCEPTED' }
    });

    return NextResponse.json({ 
      message: 'Successfully joined group',
      groupMember 
    });

  } catch (error) {
    console.error('Group join error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}