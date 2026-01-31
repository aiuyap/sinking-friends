import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/invites/[token] - Validate invitation
export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    // Mock invite validation - replace with actual database query
    const invite = {
      id: '1',
      token,
      email: 'invited@example.com',
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      group: {
        id: '1',
        name: 'Family Savings',
      },
    }

    if (!invite || invite.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 400 }
      )
    }

    return NextResponse.json({ invite })
  } catch (error) {
    console.error('Error validating invite:', error)
    return NextResponse.json(
      { error: 'Failed to validate invitation' },
      { status: 500 }
    )
  }
}
