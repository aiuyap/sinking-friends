import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/dashboard - Get user dashboard data
export async function GET(request: Request) {
  try {
    // Get user from auth header (simplified for MVP)
    const userId = request.headers.get('x-user-id') || 'mock-user-id'

    // Get user's groups
    const groupMembers = await prisma.groupMember.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            members: true,
            contributions: true,
            loans: {
              include: {
                coMakers: true,
              },
            },
          },
        },
      },
    })

    const groups = groupMembers.map(gm => ({
      id: gm.group.id,
      name: gm.group.name,
      description: gm.group.description,
      memberCount: gm.group.members.length,
      totalPool: gm.group.contributions.reduce((sum, c) => sum + c.amount, 0),
      loanInterestRateMember: gm.group.loanInterestRateMember,
      loanInterestRateNonMember: gm.group.loanInterestRateNonMember,
      role: gm.role,
    }))

    // Get user's personal stats
    const activeGroups = groups.filter(g => g.memberCount > 0)
    const myGroupIds = activeGroups.map(g => g.id)

    // Calculate total pool across all groups
    const totalPool = groups.reduce((sum, g) => sum + g.totalPool, 0)

    // Calculate total interest earned (from repaid loans only)
    let totalInterestEarned = 0
    for (const gm of groupMembers) {
      const repaidLoans = gm.group.loans.filter(
        loan => loan.status === 'REPAID' || (loan.status === 'DEFAULTED' && loan.repaidAmount >= (loan.amount + loan.totalInterest))
      )
      const interestFromGroup = repaidLoans.reduce((sum, l) => sum + l.totalInterest, 0)
      totalInterestEarned += interestFromGroup
    }

    // Get user's total contributions
    const myContributions = groups.reduce((sum, g) => sum + g.totalPool, 0)

    // Count upcoming contributions (next 7 days)
    const today = new Date()
    const oneWeekLater = new Date(today)
    oneWeekLater.setDate(oneWeekLater.getDate() + 7)

    let upcomingContributions = 0
    for (const gm of groupMembers) {
      const contributions = gm.group.contributions.filter(
        c => !c.paidDate && c.scheduledDate <= oneWeekLater
      )
      upcomingContributions += contributions.length
    }

    // Count active loans
    let activeLoans = 0
    for (const gm of groupMembers) {
      const activeOrPendingLoans = gm.group.loans.filter(
        loan => loan.borrowerId === userId && (loan.status === 'APPROVED' || loan.status === 'PENDING')
      )
      activeLoans += activeOrPendingLoans.length
    }

    return NextResponse.json({
      stats: {
        totalPool,
        totalInterestEarned,
        activeGroups: activeGroups.length,
        upcomingContributions,
        activeLoans,
        myContributions,
      },
      groups,
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
