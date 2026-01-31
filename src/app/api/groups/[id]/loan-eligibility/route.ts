import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { calculateMaxLoanAmount } from '@/lib/calculators'
import { auth } from '@/lib/firebase'

// GET /api/groups/[id]/loan-eligibility - Get user's loan eligibility
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = params.id
    
    // Get user from auth header (simplified for MVP)
    // In production, verify Firebase token
    const userId = request.headers.get('x-user-id') || 'mock-user-id'

    // Get group and member data
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

    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
      include: {
        contributions: true,
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Not a member of this group' },
        { status: 403 }
      )
    }

    // Check if member has active loans
    const activeLoans = await prisma.loan.findMany({
      where: {
        borrowerId: userId,
        status: { in: ['APPROVED', 'PENDING'] },
      },
    })

    const hasActiveLoan = activeLoans.length > 0

    // Check if member is co-maker on active loan
    const activeCoMakerLoans = await prisma.coMaker.findMany({
      where: {
        userId,
        loan: {
          status: { in: ['APPROVED', 'PENDING'] },
        },
      },
      include: {
        loan: true,
      },
    })

    const hasActiveCoMakerRole = activeCoMakerLoans.length > 0

    // Calculate total contributions
    const totalContributions = member.contributions.reduce(
      (sum, c) => sum + c.amount,
      0
    )

    // Calculate eligibility
    const eligibility = calculateMaxLoanAmount(
      {
        biWeeklyContribution: member.biWeeklyContribution,
        totalContributions,
        joinedAt: member.joinedAt,
      },
      {
        maxLoanPercent: group.maxLoanPercent,
      }
    )

    // Check if eligible for borrowing
    const isEligibleForBorrowing =
      member.isActive && !hasActiveLoan && !hasActiveCoMakerRole

    return NextResponse.json({
      eligibility,
      hasActiveLoan,
      hasActiveCoMakerRole,
      isEligibleForBorrowing,
    })
  } catch (error) {
    console.error('Error fetching loan eligibility:', error)
    return NextResponse.json(
      { error: 'Failed to fetch loan eligibility' },
      { status: 500 }
    )
  }
}
