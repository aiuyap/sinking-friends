import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET /api/dashboard - Get user dashboard data
export async function GET(request: NextRequest) {
  try {
    // Get the session cookie
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('__session')

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { error: 'No session cookie found' },
        { status: 401 }
      )
    }

    // Verify the token and get user
    const user = await getCurrentUser(sessionCookie.value)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const userId = user.id

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

    // Build payment history from real data
    const paymentHistory: Array<{
      id: string;
      date: string;
      groupName: string;
      type: 'contribution' | 'loan_repayment' | 'loan_taken';
      amount: number;
      status: 'paid' | 'pending' | 'upcoming' | 'approved' | 'repaid';
      description?: string;
    }> = []

    // Get user's member IDs for all groups
    const memberIds = groupMembers.map(gm => gm.id)
    const userGroupIds = groupMembers.map(gm => gm.groupId)

    // Fetch user's contributions
    const userContributions = await prisma.contribution.findMany({
      where: {
        memberId: { in: memberIds }
      },
      include: {
        group: true
      },
      orderBy: {
        scheduledDate: 'desc'
      },
      take: 50 // Limit to recent 50
    })

    // Add contributions to payment history
    for (const contribution of userContributions) {
      const scheduledDate = new Date(contribution.scheduledDate)
      const today = new Date()
      
      let status: 'paid' | 'pending' | 'upcoming'
      if (contribution.paidDate) {
        status = 'paid'
      } else if (scheduledDate > today) {
        status = 'upcoming'
      } else {
        status = 'pending'
      }

      paymentHistory.push({
        id: `contrib-${contribution.id}`,
        date: contribution.paidDate?.toISOString().split('T')[0] || contribution.scheduledDate.toISOString().split('T')[0],
        groupName: contribution.group.name,
        type: 'contribution',
        amount: contribution.amount,
        status,
        description: contribution.note || 'Contribution'
      })
    }

    // Fetch user's loans
    const userLoans = await prisma.loan.findMany({
      where: {
        borrowerId: userId,
        groupId: { in: userGroupIds }
      },
      include: {
        group: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20 // Limit to recent 20
    })

    // Add loans to payment history
    for (const loan of userLoans) {
      let status: 'approved' | 'repaid'
      if (loan.status === 'REPAID' || loan.isFullyRepaid) {
        status = 'repaid'
      } else if (loan.status === 'APPROVED') {
        status = 'approved'
      } else {
        // Skip pending or rejected loans
        continue
      }

      paymentHistory.push({
        id: `loan-${loan.id}`,
        date: loan.approvedDate?.toISOString().split('T')[0] || loan.createdAt.toISOString().split('T')[0],
        groupName: loan.group.name,
        type: 'loan_taken',
        amount: loan.amount,
        status,
        description: `Loan - ${loan.termMonths} months term`
      })
    }

    // Fetch user's loan repayments
    const userRepayments = await prisma.loanRepayment.findMany({
      where: {
        loan: {
          borrowerId: userId,
          groupId: { in: userGroupIds }
        }
      },
      include: {
        loan: {
          include: {
            group: true
          }
        }
      },
      orderBy: {
        paymentDate: 'desc'
      },
      take: 30 // Limit to recent 30
    })

    // Add repayments to payment history
    for (const repayment of userRepayments) {
      paymentHistory.push({
        id: `repayment-${repayment.id}`,
        date: repayment.paymentDate.toISOString().split('T')[0],
        groupName: repayment.loan.group.name,
        type: 'loan_repayment',
        amount: repayment.amount,
        status: 'paid',
        description: repayment.note || 'Loan repayment'
      })
    }

    // Sort payment history by date (descending)
    paymentHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

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
      paymentHistory,
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
