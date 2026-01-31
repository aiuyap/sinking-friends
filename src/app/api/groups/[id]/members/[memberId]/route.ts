import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateInviteToken } from '@/lib/utils'

// GET /api/groups/[id]/members - List group members
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = params.id

    const members = await prisma.groupMember.findMany({
      where: { groupId },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true } },
        },
        contributions: true,
      },
      orderBy: { joinedAt: 'asc' },
    })

    // Check for active loans and co-maker status for each member
    const memberIds = members.map(m => m.userId)
    const activeLoans = await prisma.loan.findMany({
      where: {
        borrowerId: { in: memberIds },
        status: { in: ['APPROVED', 'PENDING'] },
      },
    })

    const activeCoMakerLoans = await prisma.coMaker.findMany({
      where: {
        userId: { in: memberIds },
        loan: {
          status: { in: ['APPROVED', 'PENDING'] },
        },
      },
    })

    const membersWithStatus = members.map(member => {
      const hasActiveLoan = activeLoans.some(l => l.borrowerId === member.userId)
      const hasActiveCoMakerRole = activeCoMakerLoans.some(cm => cm.userId === member.userId)

      return {
        ...member,
        hasActiveLoan,
        hasActiveCoMakerRole,
        canBeCoMaker: !hasActiveLoan && !hasActiveCoMakerRole,
        canBorrow: member.isActive && !hasActiveLoan && !hasActiveCoMakerRole,
      }
    })

    return NextResponse.json({ members: membersWithStatus })
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}

// PUT /api/groups/[id]/members/[memberId] - Update member settings
export async function PUT(
  request: Request,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const groupId = params.id
    const memberId = params.memberId
    const body = await request.json()
    const { biWeeklyContribution, personalPayday } = body

    // Get user from auth header
    const userId = request.headers.get('x-user-id') || 'mock-user-id'

    // Get group
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    })

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    // Get member
    const member = await prisma.groupMember.findUnique({
      where: { id: memberId },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    if (member.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Update member
    const updatedMember = await prisma.groupMember.update({
      where: { id: memberId },
      data: {
        biWeeklyContribution,
        personalPayday,
      },
    })

    return NextResponse.json({ member: updatedMember })
  } catch (error) {
    console.error('Error updating member:', error)
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    )
  }
}
