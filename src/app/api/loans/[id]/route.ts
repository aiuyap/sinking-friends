import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/firebase'
import { generateInviteToken } from '@/lib/utils'

// POST /api/groups/[id]/loans - Request a loan
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = params.id
    const body = await request.json()
    const { amount, isNonMember, nonMemberName, coMakerId } = body

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

    // Validate member status
    if (!member.isActive) {
      return NextResponse.json(
        { error: 'Member is not eligible (inactive)' },
        { status: 403 }
      )
    }

    // Check for active loans
    const activeLoans = await prisma.loan.findMany({
      where: {
        borrowerId: userId,
        status: { in: ['APPROVED', 'PENDING'] },
      },
    })

    if (activeLoans.length > 0) {
      return NextResponse.json(
        { error: 'Member already has an active loan' },
        { status: 403 }
      )
    }

    // Calculate interest rate
    const interestRate = isNonMember 
      ? group.loanInterestRateNonMember 
      : group.loanInterestRateMember

    // Calculate total interest (2 months)
    const totalInterest = (amount * interestRate / 100) * group.termDuration

    // Calculate due date (2 months from now)
    const approvedDate = new Date()
    const dueDate = new Date(approvedDate)
    dueDate.setMonth(dueDate.getMonth() + group.termDuration)

    // Create loan
    const loan = await prisma.loan.create({
      data: {
        groupId,
        borrowerId: userId,
        isNonMember,
        nonMemberName: isNonMember ? nonMemberName : null,
        amount,
        interestRate,
        totalInterest,
        termMonths: group.termDuration,
        status: 'PENDING',
        approvedDate,
        dueDate,
      },
    })

    // Add co-maker if provided
    if (coMakerId) {
      await prisma.coMaker.create({
        data: {
          loanId: loan.id,
          userId: coMakerId,
        },
      })
    }

    // Send notification to admin
    await prisma.notification.create({
      data: {
        userId: group.ownerId,
        type: 'LOAN_REQUEST',
        title: 'New Loan Request',
        message: `Loan request of ${amount} from ${isNonMember ? nonMemberName : 'a member'}. Please review.`,
        actionUrl: `/groups/${groupId}/loans/${loan.id}`,
      },
    })

    // Send notification to co-maker
    if (coMakerId) {
      await prisma.notification.create({
        data: {
          userId: coMakerId,
          type: 'LOAN_REQUEST',
          title: 'You Have Been Added as Co-Maker',
          message: `You have been selected as co-maker for a loan. You are jointly responsible for repayment.`,
          actionUrl: `/groups/${groupId}/loans/${loan.id}`,
        },
      })
    }

    return NextResponse.json({ loan }, { status: 201 })
  } catch (error) {
    console.error('Error creating loan:', error)
    return NextResponse.json(
      { error: 'Failed to create loan' },
      { status: 500 }
    )
  }
}

// GET /api/groups/[id]/loans - List group loans
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = params.id

    const loans = await prisma.loan.findMany({
      where: { groupId },
      include: {
        borrower: { select: { id: true, name: true, image: true } },
        coMakers: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ loans })
  } catch (error) {
    console.error('Error fetching loans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch loans' },
      { status: 500 }
    )
  }
}

// PUT /api/loans/[id]/approve - Admin approve loan
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const loanId = params.id

    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        group: true,
        coMakers: true,
      },
    })

    if (!loan) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      )
    }

    if (loan.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Loan is not pending' },
        { status: 400 }
      )
    }

    // Update loan status to APPROVED
    const updatedLoan = await prisma.loan.update({
      where: { id: loanId },
      data: {
        status: 'APPROVED',
        adminApprovedAt: new Date(),
      },
    })

    // Send notification to borrower
    await prisma.notification.create({
      data: {
        userId: loan.borrowerId,
        type: 'LOAN_APPROVED',
        title: 'Loan Approved',
        message: `Your loan of ${loan.amount} has been approved. Due date: ${loan.dueDate.toLocaleDateString()}.`,
        actionUrl: `/groups/${loan.groupId}/loans/${loanId}`,
      },
    })

    // Send notifications to co-makers
    for (const coMaker of loan.coMakers) {
      await prisma.notification.create({
        data: {
          userId: coMaker.userId,
          type: 'LOAN_APPROVED',
          title: 'Co-Maker Loan Approved',
          message: `A loan you are co-making for has been approved. You are now jointly responsible.`,
          actionUrl: `/groups/${loan.groupId}/loans/${loanId}`,
        },
      })
    }

    return NextResponse.json({ loan: updatedLoan })
  } catch (error) {
    console.error('Error approving loan:', error)
    return NextResponse.json(
      { error: 'Failed to approve loan' },
      { status: 500 }
    )
  }
}

// PUT /api/loans/[id]/reject - Admin reject loan
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const loanId = params.id
    const body = await request.json()
    const { rejectionReason } = body

    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        coMakers: true,
      },
    })

    if (!loan) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      )
    }

    if (loan.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Loan is not pending' },
        { status: 400 }
      )
    }

    // Update loan status to REJECTED
    const updatedLoan = await prisma.loan.update({
      where: { id: loanId },
      data: {
        status: 'REJECTED',
      },
    })

    // Send notification to borrower
    await prisma.notification.create({
      data: {
        userId: loan.borrowerId,
        type: 'LOAN_REJECTED',
        title: 'Loan Rejected',
        message: `Your loan request has been rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
        actionUrl: `/groups/${loan.groupId}`,
      },
    })

    // Send notifications to co-makers
    for (const coMaker of loan.coMakers) {
      await prisma.notification.create({
        data: {
          userId: coMaker.userId,
          type: 'LOAN_REJECTED',
          title: 'Co-Maker Loan Rejected',
          message: `A loan you were co-making for has been rejected.`,
          actionUrl: `/groups/${loan.groupId}`,
        },
      })
    }

    return NextResponse.json({ loan: updatedLoan })
  } catch (error) {
    console.error('Error rejecting loan:', error)
    return NextResponse.json(
      { error: 'Failed to reject loan' },
      { status: 500 }
    )
  }
}

// POST /api/loans/[id]/repayments - Make repayment
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const loanId = params.id
    const body = await request.json()
    const { amount, note } = body

    // Get user from auth header
    const userId = request.headers.get('x-user-id') || 'mock-user-id'

    // Get loan
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        group: true,
        coMakers: true,
      },
    })

    if (!loan) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      )
    }

    if (loan.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Loan is not active for repayment' },
        { status: 400 }
      )
    }

    // Calculate repayment split
    const remainingTotal = (loan.amount + loan.totalInterest) - loan.repaidAmount
    const effectivePayment = Math.min(amount, remainingTotal)

    // Proportional split
    const totalDue = loan.amount + loan.totalInterest
    const ratio = effectivePayment / totalDue

    const principal = Math.round(loan.amount * ratio * 100) / 100
    const interest = Math.round(loan.totalInterest * ratio * 100) / 100

    // Create repayment
    const repayment = await prisma.loanRepayment.create({
      data: {
        loanId,
        amount: effectivePayment,
        principal,
        interest,
        paymentDate: new Date(),
        note,
      },
    })

    // Update loan repaid amount
    const updatedRepaidAmount = loan.repaidAmount + effectivePayment
    const isFullyRepaid = updatedRepaidAmount >= (loan.amount + loan.totalInterest)

    const updatedLoan = await prisma.loan.update({
      where: { id: loanId },
      data: {
        repaidAmount: updatedRepaidAmount,
        isFullyRepaid,
      },
    })

    // If fully repaid, send notification
    if (isFullyRepaid) {
      // Notify borrower
      await prisma.notification.create({
        data: {
          userId: loan.borrowerId,
          type: 'LOAN_REPAID',
          title: 'Loan Fully Repaid',
          message: `Congratulations! Your loan has been fully repaid. Thank you for being on time.`,
          actionUrl: `/groups/${loan.groupId}/loans/${loanId}`,
        },
      })

      // Notify co-makers
      for (const coMaker of loan.coMakers) {
        await prisma.notification.create({
          data: {
            userId: coMaker.userId,
            type: 'LOAN_REPAID',
            title: 'Co-Maker Loan Repaid',
            message: `A loan you were co-making for has been fully repaid.`,
            actionUrl: `/groups/${loan.groupId}/loans/${loanId}`,
          },
        })
      }

      // Notify group admin
      await prisma.notification.create({
        data: {
          userId: loan.group.ownerId,
          type: 'LOAN_REPAID',
          title: 'Loan Fully Repaid',
          message: `Loan from ${loan.isNonMember ? loan.nonMemberName : 'member'} has been fully repaid.`,
          actionUrl: `/groups/${loan.groupId}/loans/${loanId}`,
        },
      })
    }

    return NextResponse.json({ repayment, loan: updatedLoan })
  } catch (error) {
    console.error('Error creating repayment:', error)
    return NextResponse.json(
      { error: 'Failed to create repayment' },
      { status: 500 }
    )
  }
}
