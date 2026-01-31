import { NextResponse } from 'next/server'
import { generateInviteToken } from '@/lib/utils'
import prisma from '@/lib/prisma'

// POST /api/groups/[id]/invite - Create invitation
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { email } = await request.json()

    // Create invitation token
    const token = generateInviteToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

    // Mock invitation - replace with actual database insertion
    const invite = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      token,
      groupId: id,
      status: 'PENDING',
      expiresAt,
      createdAt: new Date(),
    }

    return NextResponse.json(invite, { status: 201 })
  } catch (error) {
    console.error('Error creating invite:', error)
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    )
  }
}
