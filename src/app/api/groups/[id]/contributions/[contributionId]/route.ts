import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; contributionId: string }> }
) {
  try {
    const { contributionId } = await params
    const userId = request.headers.get('x-user-id') || 'mock-user-id'

    const contribution = await prisma.contribution.findUnique({
      where: { id: contributionId },
      include: { member: true, group: { include: { settings: true } } },
    })

    if (!contribution) {
      return NextResponse.json({ error: 'Contribution not found' }, { status: 404 })
    }

    if (contribution.member.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updatedContribution = await prisma.contribution.update({
      where: { id: contributionId },
      data: { paidDate: new Date(), isMissed: false },
    })

    const updatedMember = await prisma.groupMember.update({
      where: { id: contribution.memberId },
      data: { missedConsecutivePayments: 0, isActive: true },
    })

    return NextResponse.json({ contribution: updatedContribution, member: updatedMember })
  } catch (error) {
    console.error('Error updating contribution:', error)
    return NextResponse.json({ error: 'Failed to update contribution' }, { status: 500 })
  }
}
