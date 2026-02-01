import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, isGroupAdmin } from '@/lib/auth'
import { addDays } from '@/lib/utils'

// GET /api/groups/[id]/contributions - List all contributions for a group
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params;

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

    // Check if user is a member or admin of this group
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: user.id
        }
      }
    });

    const isAdmin = await isGroupAdmin(user.id, groupId);

    if (!membership && !isAdmin) {
      return NextResponse.json(
        { error: 'You do not have access to this group' },
        { status: 403 }
      );
    }

    // Fetch contributions with member info
    const contributions = await prisma.contribution.findMany({
      where: { groupId },
      include: {
        member: {
          include: { user: { select: { id: true, name: true, image: true } } },
        },
      },
      orderBy: { scheduledDate: 'desc' },
    });

    // Calculate stats
    const stats = {
      total: contributions.reduce((sum, c) => sum + c.amount, 0),
      paid: contributions.filter(c => c.paidDate).reduce((sum, c) => sum + c.amount, 0),
      pending: contributions.filter(c => !c.paidDate && !c.isMissed).reduce((sum, c) => sum + c.amount, 0),
      missed: contributions.filter(c => c.isMissed).length,
      totalCount: contributions.length,
      paidCount: contributions.filter(c => c.paidDate).length,
      pendingCount: contributions.filter(c => !c.paidDate && !c.isMissed).length,
      missedCount: contributions.filter(c => c.isMissed).length,
    };

    // Format contributions
    const formattedContributions = contributions.map(c => ({
      id: c.id,
      memberId: c.memberId,
      memberName: c.member?.user?.name || 'Unknown',
      memberAvatar: c.member?.user?.image,
      scheduledDate: c.scheduledDate,
      paidDate: c.paidDate,
      amount: c.amount,
      isMissed: c.isMissed,
      gracePeriodEnd: c.gracePeriodEnd,
      note: c.note,
      isMyContribution: c.member?.userId === user.id,
      canMarkPaid: isAdmin || c.member?.userId === user.id
    }));

    return NextResponse.json({ 
      contributions: formattedContributions, 
      stats 
    });
  } catch (error) {
    console.error('Error fetching contributions:', error);
    return NextResponse.json({ error: 'Failed to fetch contributions' }, { status: 500 });
  }
}

// POST /api/groups/[id]/contributions - Create a new contribution (admin only for manual entries)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params
    const body = await request.json()
    const { scheduledDate, amount, note, memberId } = body

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

    // Get group details
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { settings: true },
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Check if user is admin or the member themselves
    const isAdmin = await isGroupAdmin(user.id, groupId);
    const targetMemberId = memberId || user.id;
    const isSelf = targetMemberId === user.id;

    if (!isAdmin && !isSelf) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get the member record
    let member;
    if (isSelf) {
      member = await prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId, userId: user.id } },
      });
    } else {
      member = await prisma.groupMember.findUnique({
        where: { id: memberId },
      });
    }

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const existingContribution = await prisma.contribution.findFirst({
      where: { memberId: member.id, scheduledDate: new Date(scheduledDate) },
    })

    if (existingContribution) {
      return NextResponse.json({ error: 'Contribution already exists for this date' }, { status: 400 })
    }

    const scheduledDateObj = new Date(scheduledDate)
    const gracePeriodEnd = addDays(scheduledDateObj, group.settings?.gracePeriodDays || 7)

    const contribution = await prisma.contribution.create({
      data: {
        groupId,
        memberId: member.id,
        scheduledDate: scheduledDateObj,
        amount,
        gracePeriodEnd,
        note,
      },
    })

    return NextResponse.json({ contribution }, { status: 201 })
  } catch (error) {
    console.error('Error creating contribution:', error)
    return NextResponse.json({ error: 'Failed to create contribution' }, { status: 500 })
  }
}
