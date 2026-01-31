import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { addDays } from '@/lib/utils'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params
    const body = await request.json()
    const { scheduledDate, amount, note } = body

    const userId = request.headers.get('x-user-id') || 'mock-user-id'

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { settings: true },
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    })

    if (!member) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 })
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
        paidDate: new Date(),
      },
    })

    const updatedMember = await prisma.groupMember.update({
      where: { id: member.id },
      data: {
        totalContributions: { increment: amount },
        missedConsecutivePayments: 0,
        isActive: true,
      },
    })

    return NextResponse.json({ contribution, member: updatedMember }, { status: 201 })
  } catch (error) {
    console.error('Error creating contribution:', error)
    return NextResponse.json({ error: 'Failed to create contribution' }, { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params

    const contributions = await prisma.contribution.findMany({
      where: { groupId },
      include: {
        member: {
          include: { user: { select: { id: true, name: true, image: true } } },
        },
      },
      orderBy: { scheduledDate: 'asc' },
    })

    return NextResponse.json({ contributions })
  } catch (error) {
    console.error('Error fetching contributions:', error)
    return NextResponse.json({ error: 'Failed to fetch contributions' }, { status: 500 })
  }
}
