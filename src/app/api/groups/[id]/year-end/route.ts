import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { calculateYearEndDistribution } from '@/lib/calculators'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        settings: true,
        members: {
          include: {
            user: { select: { id: true, name: true, image: true } },
            contributions: true,
          },
        },
        loans: {
          where: { status: 'REPAID' },
        },
      },
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    const groupData = {
      members: group.members.map(m => ({
        id: m.id,
        user: { name: m.user.name ?? undefined },
        isActive: m.isActive,
        contributions: m.contributions.map(c => ({ amount: c.amount })),
      })),
      contributions: group.members.flatMap(m => m.contributions.map(c => ({ amount: c.amount }))),
      loans: group.loans.map(l => ({ status: l.status, totalInterest: l.totalInterest })),
    }

    const distributions = calculateYearEndDistribution(groupData)

    const totalPool = distributions.reduce((sum, d) => sum + d.contributionAmount, 0)
    const totalInterestEarned = group.loans.reduce((sum, l) => sum + l.totalInterest, 0)
    const totalPayout = distributions.reduce((sum, d) => sum + d.totalPayout, 0)

    return NextResponse.json({
      distributions,
      totalPool,
      totalInterestEarned,
      totalPayout,
    })
  } catch (error) {
    console.error('Error calculating year-end distribution:', error)
    return NextResponse.json({ error: 'Failed to calculate distribution' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        settings: true,
        members: {
          include: {
            user: { select: { id: true, name: true, image: true } },
            contributions: true,
          },
        },
        loans: {
          where: { status: 'REPAID' },
        },
      },
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    const groupData = {
      members: group.members.map(m => ({
        id: m.id,
        user: { name: m.user.name ?? undefined },
        isActive: m.isActive,
        contributions: m.contributions.map(c => ({ amount: c.amount })),
      })),
      contributions: group.members.flatMap(m => m.contributions.map(c => ({ amount: c.amount }))),
      loans: group.loans.map(l => ({ status: l.status, totalInterest: l.totalInterest })),
    }

    const distributions = calculateYearEndDistribution(groupData)

    for (const dist of distributions) {
      await prisma.notification.create({
        data: {
          userId: dist.memberId,
          type: 'YEAR_END_DISTRIBUTION',
          title: 'Year-End Distribution',
          message: `Your year-end payout: ${dist.totalPayout}. ${dist.interestShare > 0 ? 'Includes interest share.' : 'No interest (inactive member).'}`,
          actionUrl: `/groups/${groupId}`,
        },
      })
    }

    return NextResponse.json({ success: true, distributions })
  } catch (error) {
    console.error('Error executing year-end distribution:', error)
    return NextResponse.json({ error: 'Failed to execute distribution' }, { status: 500 })
  }
}
