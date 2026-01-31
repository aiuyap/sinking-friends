import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateContributionSchedule } from '@/lib/calculators'
import { auth } from '@/lib/firebase'
import { addDays } from '@/lib/utils'

// POST /api/groups/[id]/contributions - Record contribution
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = params.id
    const body = await request.json()
    const { scheduledDate, amount, note } = body

    // Get user from auth header
    const userId = request.headers.get('x-user-id') || 'mock-user-id'

    // Get group
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { settings: true },
    })

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    // Get member
    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Not a member of this group' },
        { status: 403 }
      )
    }

    // Find existing contribution for this scheduled date
    const existingContribution = await prisma.contribution.findFirst({
      where: {
        memberId: member.id,
        scheduledDate: new Date(scheduledDate),
      },
    })

    if (existingContribution) {
      return NextResponse.json(
        { error: 'Contribution already exists for this date' },
        { status: 400 }
      )
    }

    // Calculate grace period end
    const scheduledDateObj = new Date(scheduledDate)
    const gracePeriodEnd = addDays(scheduledDateObj, group.settings?.gracePeriodDays || 7)

    // Create contribution
    const contribution = await prisma.contribution.create({
      data: {
        groupId,
        memberId: member.id,
        scheduledDate: scheduledDateObj,
        amount,
        gracePeriodEnd,
        note,
        paidDate: new Date(), // Mark as paid immediately
      },
    })

    // Update member's total contributions
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
    return NextResponse.json(
      { error: 'Failed to create contribution' },
      { status: 500 }
    )
  }
}

// PUT /api/groups/[id]/contributions/[id] - Mark contribution as paid
export async function PUT(
  request: Request,
  { params }: { params: { id: string; contributionId: string } }
) {
  try {
    const contributionId = params.contributionId
    const groupId = params.id

    // Get user from auth header
    const userId = request.headers.get('x-user-id') || 'mock-user-id'

    // Get contribution
    const contribution = await prisma.contribution.findUnique({
      where: { id: contributionId },
      include: {
        member: true,
        group: { include: { settings: true } },
      },
    })

    if (!contribution) {
      return NextResponse.json(
        { error: 'Contribution not found' },
        { status: 404 }
      )
    }

    // Verify user owns this contribution
    if (contribution.member.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Update contribution as paid
    const updatedContribution = await prisma.contribution.update({
      where: { id: contributionId },
      data: {
        paidDate: new Date(),
        isMissed: false,
      },
    })

    // Update member's missed consecutive payments (reset to 0)
    const updatedMember = await prisma.groupMember.update({
      where: { id: contribution.memberId },
      data: {
        missedConsecutivePayments: 0,
        isActive: true,
      },
    })

    return NextResponse.json({ contribution: updatedContribution, member: updatedMember })
  } catch (error) {
    console.error('Error updating contribution:', error)
    return NextResponse.json(
      { error: 'Failed to update contribution' },
      { status: 500 }
    )
  }
}

// GET /api/groups/[id]/contributions - List contributions
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = params.id

    const contributions = await prisma.contribution.findMany({
      where: { groupId },
      include: {
        member: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
      },
      orderBy: { scheduledDate: 'asc' },
    })

    return NextResponse.json({ contributions })
  } catch (error) {
    console.error('Error fetching contributions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contributions' },
      { status: 500 }
    )
  }
}

// POST /api/cron/generate-contributions - Generate scheduled contributions
export async function POST(request: Request) {
  try {
    // This would run daily/weekly as a cron job
    const groups = await prisma.group.findMany({
      where: {
        termEndDate: { gte: new Date() },
      },
      include: {
        settings: true,
        members: {
          where: { isActive: true },
          include: {
            contributions: true,
          },
        },
      },
    })

    let generatedCount = 0

    for (const group of groups) {
      const gracePeriodDays = group.settings?.gracePeriodDays || 7

      for (const member of group.members) {
        // Check if contribution for next scheduled date already exists
        const lastContribution = member.contributions.sort(
          (a, b) => b.scheduledDate.getTime() - a.scheduledDate.getTime()
        )[0]

        let nextScheduledDate: Date

        if (lastContribution) {
          // Calculate next bi-weekly date
          nextScheduledDate = new Date(lastContribution.scheduledDate)
          nextScheduledDate.setDate(nextScheduledDate.getDate() + 14)
        } else {
          // Start from member's joined date or group start date
          const startDate = member.joinedAt > group.termStartDate 
            ? member.joinedAt 
            : group.termStartDate
          nextScheduledDate = getNextPayday(startDate, member.personalPayday)
        }

        // Don't generate if past year-end
        if (nextScheduledDate > group.termEndDate) {
          continue
        }

        // Check if already exists
        const existing = await prisma.contribution.findFirst({
          where: {
            memberId: member.id,
            scheduledDate: nextScheduledDate,
          },
        })

        if (!existing) {
          const gracePeriodEnd = addDays(nextScheduledDate, gracePeriodDays)

          await prisma.contribution.create({
            data: {
              groupId: group.id,
              memberId: member.id,
              scheduledDate: nextScheduledDate,
              amount: member.biWeeklyContribution,
              gracePeriodEnd,
            },
          })

          generatedCount++
        }
      }
    }

    return NextResponse.json({ 
      message: 'Contributions generated',
      generatedCount 
    })
  } catch (error) {
    console.error('Error generating contributions:', error)
    return NextResponse.json(
      { error: 'Failed to generate contributions' },
      { status: 500 }
    )
  }
}

// Helper function to get next payday
function getNextPayday(startDate: Date, paydayDay: number): Date {
  const date = new Date(startDate)
  
  const currentDay = date.getDate()
  if (currentDay > paydayDay) {
    date.setMonth(date.getMonth() + 1)
  }
  
  date.setDate(paydayDay)
  return date
}

// POST /api/cron/check-missed-payments - Daily job to check for missed payments
export async function POST(request: Request) {
  try {
    const today = new Date()

    // Find contributions that are past grace period and not marked as missed
    const missedContributions = await prisma.contribution.findMany({
      where: {
        paidDate: null,
        gracePeriodEnd: { lt: today },
        isMissed: false,
      },
      include: {
        member: true,
        group: { include: { settings: true } },
      },
    })

    let processedCount = 0

    for (const contribution of missedContributions) {
      // Update member's consecutive missed counter
      const newMissedCount = contribution.member.missedConsecutivePayments + 1
      const isNowInactive = newMissedCount >= 3

      const updatedMember = await prisma.groupMember.update({
        where: { id: contribution.memberId },
        data: {
          missedConsecutivePayments: newMissedCount,
          isActive: !isNowInactive,
        },
      })

      // Mark contribution as missed
      await prisma.contribution.update({
        where: { id: contribution.id },
        data: { isMissed: true },
      })

      // Send notification to user
      if (newMissedCount >= 3 && !contribution.member.isActive !== updatedMember.isActive) {
        await prisma.notification.create({
          data: {
            userId: contribution.member.userId,
            type: 'CONTRIBUTION_MISSED',
            title: 'Became Inactive',
            message: `You have missed 3 consecutive payments and are now inactive. You will not receive interest share at year-end.`,
            actionUrl: `/groups/${contribution.groupId}`,
          },
        })
      } else if (newMissedCount <= 3) {
        await prisma.notification.create({
          data: {
            userId: contribution.member.userId,
            type: 'CONTRIBUTION_MISSED',
            title: 'Payment Missed',
            message: `Your contribution for ${contribution.scheduledDate.toLocaleDateString()} was not paid within the grace period.`,
            actionUrl: `/groups/${contribution.groupId}`,
          },
        })
      }

      processedCount++
    }

    return NextResponse.json({ 
      message: 'Missed payments checked',
      processedCount 
    })
  } catch (error) {
    console.error('Error checking missed payments:', error)
    return NextResponse.json(
      { error: 'Failed to check missed payments' },
      { status: 500 }
    )
  }
}

// POST /api/cron/check-loan-due-dates - Daily job to check for due loans
export async function POST(request: Request) {
  try {
    const today = new Date()

    // Find loans that are APPROVED and past due date
    const overdueLoans = await prisma.loan.findMany({
      where: {
        status: 'APPROVED',
        dueDate: { lt: today },
        defaultNotified: false,
      },
      include: {
        borrower: true,
        coMakers: {
          include: {
            user: true,
          },
        },
      },
    })

    let processedCount = 0

    for (const loan of overdueLoans) {
      // Check if 2 months past due (defaulted)
      const dueDate = new Date(loan.dueDate)
      const twoMonthsAfterDue = new Date(dueDate)
      twoMonthsAfterDue.setMonth(twoMonthsAfterDue.getMonth() + loan.termMonths)

      if (today > twoMonthsAfterDue) {
        // Mark as DEFAULTED
        await prisma.loan.update({
          where: { id: loan.id },
          data: {
            status: 'DEFAULTED',
          },
        })

        // Notify borrower
        await prisma.notification.create({
          data: {
            userId: loan.borrowerId,
            type: 'LOAN_DEFAULTED',
            title: 'Loan Defaulted',
            message: `Your loan has been defaulted for more than ${loan.termMonths} months. Please contact admin to arrange repayment.`,
            actionUrl: `/groups/${loan.groupId}/loans/${loan.id}`,
          },
        })

        // Notify co-makers
        for (const coMaker of loan.coMakers) {
          await prisma.notification.create({
            data: {
              userId: coMaker.userId,
              type: 'LOAN_DEFAULTED',
              title: 'Co-Maker Loan Defaulted',
            message: `A loan you are co-making for has been defaulted. You are now jointly responsible for repayment.`,
            actionUrl: `/groups/${loan.groupId}/loans/${loan.id}`,
          },
          })
        }

        // Notify group admin
        await prisma.notification.create({
          data: {
            userId: await prisma.group.findUnique({ 
              where: { id: loan.groupId } 
            }).then(g => g?.ownerId || ''),
            type: 'LOAN_DEFAULTED',
            title: 'Loan Defaulted',
            message: `Loan from ${loan.isNonMember ? loan.nonMemberName : 'member'} has been defaulted.`,
            actionUrl: `/groups/${loan.groupId}/loans/${loan.id}`,
          },
        })
      } else {
        // Just mark as notified
        await prisma.loan.update({
          where: { id: loan.id },
          data: {
            defaultNotified: true,
          },
        })

        // Notify borrower it's due soon/overdue
        const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))

        await prisma.notification.create({
          data: {
            userId: loan.borrowerId,
            type: 'LOAN_OVERDUE',
            title: daysOverdue <= 0 ? 'Loan Due Soon' : 'Loan Overdue',
            message: `Your loan is ${daysOverdue <= 0 ? 'due soon' : `${Math.abs(daysOverdue)} days overdue`}. Please make a payment.`,
            actionUrl: `/groups/${loan.groupId}/loans/${loan.id}`,
          },
        })
      }

      processedCount++
    }

    return NextResponse.json({ 
      message: 'Loan due dates checked',
      processedCount 
    })
  } catch (error) {
    console.error('Error checking loan due dates:', error)
    return NextResponse.json(
      { error: 'Failed to check loan due dates' },
      { status: 500 }
    )
  }
}
