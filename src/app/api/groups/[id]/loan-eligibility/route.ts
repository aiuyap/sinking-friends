import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { calculateMaxLoanAmount } from '@/lib/calculators'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params

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

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { settings: true },
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
      include: { contributions: true },
    })

    if (!member) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 })
    }

    const activeLoans = await prisma.loan.findMany({
      where: { borrowerId: userId, status: { in: ['APPROVED', 'PENDING'] } },
    })

    const hasActiveLoan = activeLoans.length > 0

    const activeCoMakerLoans = await prisma.coMaker.findMany({
      where: { userId, loan: { status: { in: ['APPROVED', 'PENDING'] } } },
      include: { loan: true },
    })

    const hasActiveCoMakerRole = activeCoMakerLoans.length > 0

    const totalContributions = member.contributions.reduce((sum, c) => sum + c.amount, 0)

    const eligibility = calculateMaxLoanAmount(
      { biWeeklyContribution: member.biWeeklyContribution, totalContributions, joinedAt: member.joinedAt },
      { maxLoanPercent: group.maxLoanPercent }
    )

    const isEligibleForBorrowing = member.isActive && !hasActiveLoan && !hasActiveCoMakerRole

    return NextResponse.json({ eligibility, hasActiveLoan, hasActiveCoMakerRole, isEligibleForBorrowing })
  } catch (error) {
    console.error('Error fetching loan eligibility:', error)
    return NextResponse.json({ error: 'Failed to fetch loan eligibility' }, { status: 500 })
  }
}
