import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { calculateYearEndDistribution } from '@/lib/calculators'
import { formatCurrency, formatDate } from '@/lib/utils'

// GET /api/groups/[id]/year-end - Calculate distribution
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = params.id

    // Get group with all related data
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        settings: true,
        members: {
          include: {
            user: { select: { name: true, image: true } },
            contributions: true,
          },
        },
        contributions: true,
        loans: {
          include: {
            coMakers: true,
          },
        },
      },
    })

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    // Filter only REPAID loans
    const repaidLoans = group.loans.filter(loan => loan.status === 'REPAID')

    // Calculate distribution
    const distributions = calculateYearEndDistribution({
      members: group.members,
      contributions: group.contributions,
      loans: repaidLoans,
    })

    // Calculate totals
    const totalPool = group.contributions.reduce((sum, c) => sum + c.amount, 0)
    const totalInterestEarned = repaidLoans.reduce((sum, l) => sum + l.totalInterest, 0)
    const totalPayout = distributions.reduce((sum, d) => sum + d.totalPayout, 0)

    // Active vs inactive counts
    const activeMembers = distributions.filter(d => d.reason.includes('Active'))
    const inactiveMembers = distributions.filter(d => d.reason.includes('Inactive'))

    return NextResponse.json({
      distributions,
      totals: {
        totalPool,
        totalInterestEarned,
        totalPayout,
        totalMembers: distributions.length,
        activeMembers: activeMembers.length,
        inactiveMembers: inactiveMembers.length,
      },
      group: {
        id: group.id,
        name: group.name,
        yearEndDate: group.settings?.yearEndDate,
      },
    })
  } catch (error) {
    console.error('Error calculating year-end distribution:', error)
    return NextResponse.json(
      { error: 'Failed to calculate distribution' },
      { status: 500 }
    )
  }
}

// POST /api/groups/[id]/year-end/distribute - Execute distribution
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = params.id

    // Get group
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        settings: true,
        members: true,
        contributions: true,
        loans: {
          include: {
            coMakers: true,
          },
        },
      },
    })

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    // Verify year-end date has passed
    const yearEndDate = group.settings?.yearEndDate
    if (yearEndDate && new Date() < yearEndDate) {
      return NextResponse.json(
        { error: 'Year-end date has not passed yet' },
        { status: 400 }
      )
    }

    // Check if all loans are settled
    const activeOrPendingLoans = group.loans.filter(
      loan => loan.status === 'APPROVED' || loan.status === 'PENDING'
    )

    if (activeOrPendingLoans.length > 0) {
      return NextResponse.json(
        { error: 'Cannot distribute while there are active or pending loans' },
        { status: 400 }
      )
    }

    // Calculate distribution
    const repaidLoans = group.loans.filter(loan => loan.status === 'REPAID')
    const distributions = calculateYearEndDistribution({
      members: group.members,
      contributions: group.contributions,
      loans: repaidLoans,
    })

    // Send notifications to all members
    for (const distribution of distributions) {
      await prisma.notification.create({
        data: {
          userId: distribution.memberId,
          type: 'YEAR_END_DISTRIBUTION',
          title: 'Year-End Distribution Ready',
          message: `Your year-end payout is ${formatCurrency(distribution.totalPayout)}. ${distribution.reason}`,
          actionUrl: `/groups/${groupId}`,
        },
      })
    }

    return NextResponse.json({
      message: 'Year-end distribution notifications sent',
      distributions,
    })
  } catch (error) {
    console.error('Error executing year-end distribution:', error)
    return NextResponse.json(
      { error: 'Failed to execute distribution' },
      { status: 500 }
    )
  }
}
