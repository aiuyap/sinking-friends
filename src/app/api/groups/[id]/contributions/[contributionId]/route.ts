import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, isGroupAdmin } from '@/lib/auth'

// PUT /api/groups/[id]/contributions/[contributionId] - Mark contribution as paid
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; contributionId: string }> }
) {
  try {
    const { id: groupId, contributionId } = await params;

    // Get the session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session');

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { error: 'No session cookie found' },
        { status: 401 }
      );
    }

    // Verify the token and get user
    const user = await getCurrentUser(sessionCookie.value);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const contribution = await prisma.contribution.findUnique({
      where: { id: contributionId },
      include: { 
        member: true, 
        group: { include: { settings: true } } 
      },
    })

    if (!contribution) {
      return NextResponse.json({ error: 'Contribution not found' }, { status: 404 })
    }

    // Check permissions - admin or the member themselves
    const isAdmin = await isGroupAdmin(user.id, groupId);
    const isOwner = contribution.member.userId === user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check if already paid
    if (contribution.paidDate) {
      return NextResponse.json({ error: 'Contribution already paid' }, { status: 400 })
    }

    const updatedContribution = await prisma.contribution.update({
      where: { id: contributionId },
      data: { 
        paidDate: new Date(), 
        isMissed: false 
      },
    })

    // Update member stats
    const updatedMember = await prisma.groupMember.update({
      where: { id: contribution.memberId },
      data: { 
        totalContributions: { increment: contribution.amount },
        missedConsecutivePayments: 0, 
        isActive: true 
      },
    })

    // Create notification for admin (if paid by member)
    if (isOwner && !isAdmin) {
      await prisma.notification.create({
        data: {
          userId: contribution.group.ownerId,
          type: 'CONTRIBUTION_DUE',
          title: 'Contribution Received',
          message: `${user.name} has paid their contribution of ₱${contribution.amount}`,
          actionUrl: `/groups/${groupId}/contributions`,
        },
      });
    }

    return NextResponse.json({ 
      contribution: updatedContribution, 
      member: updatedMember,
      message: 'Contribution marked as paid'
    })
  } catch (error) {
    console.error('Error updating contribution:', error)
    return NextResponse.json({ error: 'Failed to update contribution' }, { status: 500 })
  }
}
