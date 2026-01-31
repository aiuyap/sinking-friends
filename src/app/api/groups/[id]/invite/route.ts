import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyIdToken } from '@/lib/firebase-admin';
import { isGroupAdmin } from '@/lib/auth';
import { nanoid } from 'nanoid';

export async function POST(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.headers.get('authorization')?.split('Bearer ')[1] ||
                req.headers.get('x-auth-token');
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: groupId } = await params;
    const decodedToken = await verifyIdToken(token);
    const userId = decodedToken.uid;

    // Verify user is group admin
    const isAdmin = await isGroupAdmin(userId, groupId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Validate request body
    const { email } = await req.json();
    
    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Check if email already in group
    const existingMember = await prisma.groupMember.findFirst({
      where: { 
        groupId, 
        user: { email }
      }
    });

    if (existingMember) {
      return NextResponse.json({ error: 'User already in group' }, { status: 400 });
    }

    // Check if invite already exists and is pending
    const existingInvite = await prisma.invite.findFirst({
      where: { 
        groupId, 
        email,
        status: 'PENDING'
      }
    });

    if (existingInvite) {
      return NextResponse.json({ 
        message: 'Invite already sent', 
        token: existingInvite.token 
      });
    }

    // Generate unique invite token
    const inviteToken = nanoid(32);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create invite
    const invite = await prisma.invite.create({
      data: {
        groupId,
        email,
        token: inviteToken,
        invitedById: userId,
        expiresAt,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ 
      message: 'Invite created', 
      token: invite.token,
      expiresAt: invite.expiresAt 
    });

  } catch (error) {
    console.error('Invite generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.nextUrl.searchParams.get('token');
  
  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 400 });
  }

  try {
    // Find invite by token
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
