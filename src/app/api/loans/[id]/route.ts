import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params
    const body = await request.json()
    const { amount, isNonMember, nonMemberName, coMakerId } = body

    const userId = request.headers.get('x-user-id') || 'mock-user-id'

    const group = await prisma.group.findUnique({ where: { id: groupId } })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    })

    if (!member) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 })
    }

    if (!member.isActive) {
      return NextResponse.json({ error: 'Member is not eligible (inactive)' }, { status: 403 })
    }

    const activeLoans = await prisma.loan.findMany({
      where: { borrowerId: userId, status: { in: ['APPROVED', 'PENDING'] } },
    })

    if (activeLoans.length > 0) {
      return NextResponse.json({ error: 'Member already has an active loan' }, { status: 403 })
    }

    const interestRate = isNonMember ? group.loanInterestRateNonMember : group.loanInterestRateMember
    const totalInterest = (amount * interestRate / 100) * group.termDuration

    const approvedDate = new Date()
    const dueDate = new Date(approvedDate)
    dueDate.setMonth(dueDate.getMonth() + group.termDuration)

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

    if (coMakerId) {
      await prisma.coMaker.create({ data: { loanId: loan.id, userId: coMakerId } })
    }

    await prisma.notification.create({
      data: {
        userId: group.ownerId,
        type: 'LOAN_APPROVED',
        title: 'New Loan Request',
        message: `Loan request of ${amount} from ${isNonMember ? nonMemberName : 'a member'}.`,
        actionUrl: `/groups/${groupId}/loans/${loan.id}`,
      },
    })

    if (coMakerId) {
      await prisma.notification.create({
          data: {
            userId: coMakerId,
            type: 'LOAN_APPROVED',
          title: 'You Have Been Added as Co-Maker',
          message: `You have been selected as co-maker for a loan.`,
          actionUrl: `/groups/${groupId}/loans/${loan.id}`,
        },
      })
    }

    return NextResponse.json({ loan }, { status: 201 })
  } catch (error) {
    console.error('Error creating loan:', error)
    return NextResponse.json({ error: 'Failed to create loan' }, { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params

    const loans = await prisma.loan.findMany({
      where: { groupId },
      include: {
        borrower: { select: { id: true, name: true, image: true } },
        coMakers: { include: { user: { select: { id: true, name: true, image: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ loans })
  } catch (error) {
    console.error('Error fetching loans:', error)
    return NextResponse.json({ error: 'Failed to fetch loans' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: loanId } = await params
    const body = await request.json()
    const { action, rejectionReason } = body

    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: { group: true, coMakers: true },
    })

    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 })
    }

    if (loan.status !== 'PENDING') {
      return NextResponse.json({ error: 'Loan is not pending' }, { status: 400 })
    }

    if (action === 'approve') {
      const updatedLoan = await prisma.loan.update({
        where: { id: loanId },
        data: { status: 'APPROVED', adminApprovedAt: new Date() },
      })

      await prisma.notification.create({
        data: {
          userId: loan.borrowerId,
          type: 'LOAN_APPROVED',
          title: 'Loan Approved',
          message: `Your loan of ${loan.amount} has been approved.`,
          actionUrl: `/groups/${loan.groupId}/loans/${loanId}`,
        },
      })

      for (const coMaker of loan.coMakers) {
        await prisma.notification.create({
          data: {
            userId: coMaker.userId,
            type: 'LOAN_APPROVED',
            title: 'Co-Maker Loan Approved',
            message: `A loan you are co-making for has been approved.`,
            actionUrl: `/groups/${loan.groupId}/loans/${loanId}`,
          },
        })
      }

      return NextResponse.json({ loan: updatedLoan })
    } else if (action === 'reject') {
      const updatedLoan = await prisma.loan.update({
        where: { id: loanId },
        data: { status: 'REJECTED' },
      })

      await prisma.notification.create({
        data: {
          userId: loan.borrowerId,
          type: 'LOAN_REJECTED',
          title: 'Loan Rejected',
          message: `Your loan request has been rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
          actionUrl: `/groups/${loan.groupId}`,
        },
      })

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
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating loan:', error)
    return NextResponse.json({ error: 'Failed to update loan' }, { status: 500 })
  }
}
