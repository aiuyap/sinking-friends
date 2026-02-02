import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isGroupAdmin } from '@/lib/auth';

// GET /api/groups/[id]/loans - List all loans for a group
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params;

    // Get the session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session');

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { error: 'No session cookie found' },
        { status: 401 }
      );
    }

    // Verify the token and get user
    const user = await getCurrentUser(sessionCookie.value);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Check if user is a member or admin of this group
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: user.id
        }
      }
    });

    const isAdmin = await isGroupAdmin(user.id, groupId);

    if (!membership && !isAdmin) {
      return NextResponse.json(
        { error: 'You do not have access to this group' },
        { status: 403 }
      );
    }

    // Fetch all loans with borrower and co-maker info
    const loans = await prisma.loan.findMany({
      where: { groupId },
      include: {
        borrower: { select: { id: true, name: true, email: true, image: true } },
        coMakers: { include: { user: { select: { id: true, name: true, image: true } } } },
        repayments: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format loans for the UI
    const formattedLoans = loans.map(loan => {
      const totalRepaid = loan.repayments.reduce((sum, r) => sum + r.amount, 0);
      const remainingBalance = (loan.amount + loan.totalInterest) - totalRepaid;
      const isFullyRepaid = remainingBalance <= 0 || loan.isFullyRepaid;

      return {
        id: loan.id,
        amount: loan.amount,
        borrowerId: loan.borrowerId,
        borrowerName: loan.isNonMember 
          ? loan.nonMemberName 
          : (loan.borrower?.name || 'Unknown'),
        borrowerAvatar: loan.isNonMember ? null : loan.borrower?.image,
        status: loan.status,
        interestRate: loan.interestRate,
        totalInterest: loan.totalInterest,
        termMonths: loan.termMonths,
        totalDue: loan.amount + loan.totalInterest,
        dueDate: loan.dueDate,
        approvedDate: loan.approvedDate,
        repaidAmount: totalRepaid,
        remainingBalance: Math.max(0, remainingBalance),
        isFullyRepaid,
        isNonMember: loan.isNonMember,
        coMakers: loan.coMakers.map(cm => ({
          id: cm.userId,
          name: cm.user?.name || 'Unknown'
        })),
        isMyLoan: loan.borrowerId === user.id,
        canApprove: isAdmin && loan.status === 'PENDING',
        createdAt: loan.createdAt
      };
    });

    // Calculate stats
    const stats = {
      total: loans.length,
      pending: loans.filter(l => l.status === 'PENDING').length,
      active: loans.filter(l => l.status === 'APPROVED').length,
      repaid: loans.filter(l => l.status === 'REPAID').length,
      defaulted: loans.filter(l => l.status === 'DEFAULTED').length,
      rejected: loans.filter(l => l.status === 'REJECTED').length,
      totalLent: loans
        .filter(l => l.status === 'APPROVED')
        .reduce((sum, l) => sum + l.amount, 0),
      totalRepaid: loans
        .filter(l => l.status === 'REPAID')
        .reduce((sum, l) => sum + l.amount + l.totalInterest, 0),
      outstanding: loans
        .filter(l => l.status === 'APPROVED')
        .reduce((sum, l) => sum + l.amount + l.totalInterest, 0)
    };

    return NextResponse.json({ loans: formattedLoans, stats });
  } catch (error) {
    console.error('Error fetching loans:', error);
    return NextResponse.json({ error: 'Failed to fetch loans' }, { status: 500 });
  }
}

// POST /api/groups/[id]/loans - Create a new loan request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params;

    // Get the session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session');

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { error: 'No session cookie found' },
        { status: 401 }
      );
    }

    // Verify the token and get user
    const user = await getCurrentUser(sessionCookie.value);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, isNonMember, nonMemberName, coMakerId, purpose } = body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid loan amount' }, { status: 400 });
    }

    if (isNonMember && !nonMemberName) {
      return NextResponse.json({ error: 'Non-member name is required' }, { status: 400 });
    }

    // Get group details
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { members: true }
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Check if user is an active member (only required for member loans)
    if (!isNonMember) {
      const membership = await prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId, userId: user.id } }
      });

      if (!membership) {
        return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
      }

      if (!membership.isActive) {
        return NextResponse.json({ error: 'Member is not eligible (inactive)' }, { status: 403 });
      }

      // Check for existing active loans
      const activeLoans = await prisma.loan.findMany({
        where: { 
          borrowerId: user.id, 
          status: { in: ['APPROVED', 'PENDING'] }
        }
      });

      if (activeLoans.length > 0) {
        return NextResponse.json({ error: 'You already have an active loan' }, { status: 403 });
      }
    }

    // Validate co-maker if provided
    if (coMakerId) {
      const coMaker = await prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId, userId: coMakerId } }
      });

      if (!coMaker) {
        return NextResponse.json({ error: 'Co-maker is not a member of this group' }, { status: 400 });
      }

      if (!coMaker.isActive) {
        return NextResponse.json({ error: 'Co-maker is not active' }, { status: 400 });
      }

      if (coMaker.userId === user.id) {
        return NextResponse.json({ error: 'Cannot add yourself as co-maker' }, { status: 400 });
      }
    }

    // Calculate interest and due dates
    const interestRate = isNonMember 
      ? group.loanInterestRateNonMember 
      : group.loanInterestRateMember;
    const totalInterest = (amount * interestRate / 100) * group.termDuration;

    const approvedDate = new Date();
    const dueDate = new Date(approvedDate);
    dueDate.setMonth(dueDate.getMonth() + group.termDuration);

    // Create the loan
    const loan = await prisma.loan.create({
      data: {
        groupId,
        borrowerId: user.id,
        isNonMember: isNonMember || false,
        nonMemberName: isNonMember ? nonMemberName : null,
        amount,
        interestRate,
        totalInterest,
        termMonths: group.termDuration,
        status: 'PENDING',
        approvedDate,
        dueDate,
      },
    });

    // Add co-maker if provided
    if (coMakerId) {
      await prisma.coMaker.create({
        data: { loanId: loan.id, userId: coMakerId }
      });
    }

    // Notify group admin
    await prisma.notification.create({
      data: {
        userId: group.ownerId,
        type: 'LOAN_APPROVED',
        title: 'New Loan Request',
        message: `${isNonMember ? nonMemberName : user.name} requested a loan of ${amount}`,
        actionUrl: `/groups/${groupId}/loans/${loan.id}`,
      },
    });

    // Notify co-maker
    if (coMakerId) {
      await prisma.notification.create({
        data: {
          userId: coMakerId,
          type: 'LOAN_APPROVED',
          title: 'Co-Maker Request',
          message: `You've been added as a co-maker for a ₱${amount} loan`,
          actionUrl: `/groups/${groupId}/loans/${loan.id}`,
        },
      });
    }

    return NextResponse.json({ loan }, { status: 201 });
  } catch (error) {
    console.error('Error creating loan:', error);
    return NextResponse.json({ error: 'Failed to create loan' }, { status: 500 });
  }
}
