import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { id: groupId, memberId } = await params

    const member = await prisma.groupMember.findUnique({
      where: { id: memberId },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        contributions: true,
      },
    })

    if (!member || member.groupId !== groupId) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const activeLoans = await prisma.loan.findMany({
      where: { borrowerId: member.userId, status: { in: ['APPROVED', 'PENDING'] } },
    })

    const activeCoMakers = await prisma.coMaker.findMany({
      where: { userId: member.userId, loan: { status: { in: ['APPROVED', 'PENDING'] } } },
    })

    return NextResponse.json({
      member: {
        ...member,
        hasActiveLoan: activeLoans.length > 0,
        hasActiveCoMakerRole: activeCoMakers.length > 0,
      },
    })
  } catch (error) {
    console.error('Error fetching member:', error)
    return NextResponse.json({ error: 'Failed to fetch member' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { memberId } = await params
    const body = await request.json()
    const { biWeeklyContribution, personalPayday } = body

    const member = await prisma.groupMember.findUnique({
      where: { id: memberId },
      include: { contributions: true },
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const activeLoans = await prisma.loan.findMany({
      where: { borrowerId: member.userId, status: { in: ['APPROVED', 'PENDING'] } },
    })

    if (activeLoans.length > 0) {
      return NextResponse.json({ error: 'Cannot update settings while member has active loans' }, { status: 403 })
    }

    const activeCoMakerLoans = await prisma.coMaker.findMany({
      where: { userId: member.userId, loan: { status: { in: ['APPROVED', 'PENDING'] } } },
    })

    if (activeCoMakerLoans.length > 0) {
      return NextResponse.json({ error: 'Cannot update settings while member is co-maker on active loans' }, { status: 403 })
    }

    const updatedMember = await prisma.groupMember.update({
      where: { id: memberId },
      data: {
        biWeeklyContribution: biWeeklyContribution ?? member.biWeeklyContribution,
        personalPayday: personalPayday ?? member.personalPayday,
      },
    })

    return NextResponse.json({ member: updatedMember })
  } catch (error) {
    console.error('Error updating member:', error)
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 })
  }
}
