import { NextResponse } from 'next/server'
import { generateInviteToken } from '@/lib/utils'
import prisma from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { email } = await request.json()

    const token = generateInviteToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

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
    return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 })
  }
}
