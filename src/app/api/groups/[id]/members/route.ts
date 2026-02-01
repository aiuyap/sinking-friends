import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isGroupAdmin } from '@/lib/auth';

// GET /api/groups/[id]/members - List all members of a group
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

    // Fetch all members with their user data and contribution stats
    const members = await prisma.groupMember.findMany({
      where: { groupId },
      include: {
        user: true,
        contributions: true
      },
      orderBy: { joinedAt: 'asc' }
    });

    // Calculate stats for each member
    const formattedMembers = members.map(member => {
      const totalContributions = member.contributions.reduce((sum, c) => sum + c.amount, 0);
      const paidContributions = member.contributions.filter(c => c.paidDate);
      const missedPayments = member.contributions.filter(c => c.isMissed).length;

      // Determine next payday based on personalPayday day
      const today = new Date();
      let nextPayday = new Date(today.getFullYear(), today.getMonth(), member.personalPayday);
      if (nextPayday < today) {
        nextPayday = new Date(today.getFullYear(), today.getMonth() + 1, member.personalPayday);
      }

      return {
        id: member.id,
        userId: member.userId,
        name: member.user.name || member.user.email.split('@')[0],
        email: member.user.email,
        avatarUrl: member.user.image || '',
        role: member.role,
        status: member.isActive ? 'active' : 'inactive',
        contribution: member.biWeeklyContribution,
        totalContributions,
        nextPayday,
        joinedAt: member.joinedAt,
        missedPayments,
        isCurrentUser: member.userId === user.id
      };
    });

    // Calculate group stats
    const stats = {
      total: members.length,
      active: members.filter(m => m.isActive).length,
      inactive: members.filter(m => !m.isActive).length,
      totalContributions: formattedMembers.reduce((sum, m) => sum + m.totalContributions, 0)
    };

    return NextResponse.json({ members: formattedMembers, stats });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

// POST /api/groups/[id]/members - Accept invite and join group
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

    // Check if user is already a member
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: user.id
        }
      }
    });

    if (existingMember) {
      return NextResponse.json({ error: 'User is already a member of this group' }, { status: 400 });
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