import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/invites/accept - Accept invitation
export async function POST(request: Request) {
  try {
    const { token, userId } = await request.json()

    // Mock accepting invite - replace with actual database operations
    const updatedInvite = {
      id: '1',
      token,
      status: 'ACCEPTED',
      acceptedAt: new Date(),
    }

    // Add user to group
    const membership = {
      id: Math.random().toString(36).substr(2, 9),
      groupId: '1',
      userId,
      role: 'MEMBER',
      joinedAt: new Date(),
    }

    return NextResponse.json({ invite: updatedInvite, membership })
  } catch (error) {
    console.error('Error accepting invite:', error)
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    )
  }
}
