import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, isGroupAdmin } from '@/lib/auth'

// Helper function to format loan data consistently
async function formatLoanResponse(loan: any, userId: string, isAdmin: boolean) {
  const totalRepaid = loan.repayments?.reduce((sum: number, r: any) => sum + r.amount, 0) || 0;
  const totalDue = loan.amount + loan.totalInterest;
  const remainingBalance = Math.max(0, totalDue - totalRepaid);
  const isBorrower = loan.borrowerId === userId;
  const isCoMaker = loan.coMakers?.some((cm: any) => cm.userId === userId) || false;

  return {
    id: loan.id,
    amount: loan.amount,
    interestRate: loan.interestRate,
    totalInterest: loan.totalInterest,
    termMonths: loan.termMonths,
    status: loan.status,
    totalDue,
    dueDate: loan.dueDate,
    approvedDate: loan.approvedDate,
    createdAt: loan.createdAt,
    
    // Borrower info
    borrowerId: loan.borrowerId,
    borrowerName: loan.isNonMember 
      ? loan.nonMemberName 
      : (loan.borrower?.name || 'Unknown'),
    borrowerEmail: loan.isNonMember ? null : loan.borrower?.email,
    borrowerAvatar: loan.isNonMember ? null : loan.borrower?.image,
    isNonMember: loan.isNonMember,
    
    // Group info
    groupId: loan.groupId,
    groupName: loan.group?.name || 'Unknown',
    
    // Co-makers
    coMakers: (loan.coMakers || []).map((cm: any) => ({
      id: cm.userId,
      name: cm.user?.name || 'Unknown',
      avatar: cm.user?.image
    })),
    
    // Repayments
    repayments: (loan.repayments || []).map((r: any) => ({
      id: r.id,
      amount: r.amount,
      interest: r.interest,
      principal: r.principal,
      paymentDate: r.paymentDate,
      note: r.note
    })),
    
    // Calculated fields
    totalRepaid,
    remainingBalance,
    progress: totalDue > 0 ? Math.min(100, (totalRepaid / totalDue) * 100) : 0,
    
    // Permissions
    isMyLoan: isBorrower,
    isCoMaker,
    canApprove: isAdmin && loan.status === 'PENDING',
    canRepay: (isBorrower || isAdmin) && loan.status === 'APPROVED' && remainingBalance > 0,
    canEdit: isAdmin && loan.status === 'PENDING'
  };
}

// GET /api/loans/[id] - Get loan details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: loanId } = await params;

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

    // Fetch loan with all related data
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        group: true,
        borrower: { select: { id: true, name: true, email: true, image: true } },
        coMakers: { include: { user: { select: { id: true, name: true, image: true } } } },
        repayments: { orderBy: { paymentDate: 'desc' } }
      }
    });

    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    // Check if user has access to this loan (member of group or admin)
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: loan.groupId,
          userId: user.id
        }
      }
    });

    const isAdmin = await isGroupAdmin(user.id, loan.groupId);
    const isBorrower = loan.borrowerId === user.id;
    const isCoMaker = loan.coMakers.some(cm => cm.userId === user.id);

    if (!membership && !isAdmin && !isBorrower && !isCoMaker) {
      return NextResponse.json(
        { error: 'You do not have access to this loan' },
        { status: 403 }
      );
    }

    // Format the response using helper function
    const formattedLoan = await formatLoanResponse(loan, user.id, isAdmin);

    return NextResponse.json({ loan: formattedLoan });
  } catch (error) {
    console.error('Error fetching loan:', error);
    return NextResponse.json({ error: 'Failed to fetch loan' }, { status: 500 });
  }
}

// POST /api/loans/[id] - Create repayment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: loanId } = await params
    const body = await request.json()
    const { amount, note, action } = body

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

    // Fetch loan
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        group: true,
        repayments: true,
        coMakers: true
      }
    });

    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    // Check permissions
    const isAdmin = await isGroupAdmin(user.id, loan.groupId);
    const isBorrower = loan.borrowerId === user.id;

    if (!isAdmin && !isBorrower) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this loan' },
        { status: 403 }
      );
    }

    // Handle repayment
    if (action === 'repay') {
      if (loan.status !== 'APPROVED') {
        return NextResponse.json({ error: 'Loan is not active' }, { status: 400 });
      }

      const totalRepaid = loan.repayments.reduce((sum, r) => sum + r.amount, 0);
      const totalDue = loan.amount + loan.totalInterest;
      const remaining = totalDue - totalRepaid;

      if (amount <= 0 || amount > remaining) {
        return NextResponse.json({ error: 'Invalid repayment amount' }, { status: 400 });
      }

      // Calculate interest and principal portions
      const interestPortion = Math.min(amount, loan.totalInterest - loan.repayments.reduce((sum, r) => sum + r.interest, 0));
      const principalPortion = amount - interestPortion;

      // Create repayment record
      const repayment = await prisma.loanRepayment.create({
        data: {
          loanId,
          amount,
          interest: interestPortion,
          principal: principalPortion,
          paymentDate: new Date(),
          note: note || null
        }
      });

      // Check if fully repaid
      const newTotalRepaid = totalRepaid + amount;
      if (newTotalRepaid >= totalDue) {
        await prisma.loan.update({
          where: { id: loanId },
          data: { 
            status: 'REPAID',
            isFullyRepaid: true,
            repaidAmount: newTotalRepaid
          }
        });

        // Send notification
        await prisma.notification.create({
          data: {
            userId: loan.borrowerId,
            type: 'LOAN_REPAID',
            title: 'Loan Fully Repaid',
            message: `Your loan of ₱${loan.amount} has been fully repaid`,
            actionUrl: `/groups/${loan.groupId}/loans/${loanId}`
          }
        });
      } else {
        await prisma.loan.update({
          where: { id: loanId },
          data: { repaidAmount: newTotalRepaid }
        });
      }

      // Fetch updated loan with all relations and format
      const updatedLoanWithRelations = await prisma.loan.findUnique({
        where: { id: loanId },
        include: {
          group: true,
          borrower: { select: { id: true, name: true, email: true, image: true } },
          coMakers: { include: { user: { select: { id: true, name: true, image: true } } } },
          repayments: { orderBy: { paymentDate: 'desc' } }
        }
      });

      const isAdmin = await isGroupAdmin(user.id, updatedLoanWithRelations?.groupId || '');
      const formattedLoan = await formatLoanResponse(updatedLoanWithRelations, user.id, isAdmin);
      
      return NextResponse.json({ 
        repayment, 
        loan: formattedLoan,
        message: 'Repayment recorded successfully' 
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing loan:', error);
    return NextResponse.json({ error: 'Failed to process loan' }, { status: 500 });
  }
}

// PUT /api/loans/[id] - Approve or reject loan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: loanId } = await params
    const body = await request.json()
    const { action, rejectionReason } = body

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

    // Fetch loan
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: { group: true, coMakers: true }
    });

    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    // Check if user is admin
    const isAdmin = await isGroupAdmin(user.id, loan.groupId);

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only group admins can approve or reject loans' },
        { status: 403 }
      );
    }

    if (loan.status !== 'PENDING') {
      return NextResponse.json({ error: 'Loan is not pending' }, { status: 400 });
    }

    if (action === 'approve') {
      await prisma.loan.update({
        where: { id: loanId },
        data: { 
          status: 'APPROVED', 
          adminApprovalId: user.id,
          adminApprovedAt: new Date() 
        },
      });

      await prisma.notification.create({
        data: {
          userId: loan.borrowerId,
          type: 'LOAN_APPROVED',
          title: 'Loan Approved',
          message: `Your loan of ₱${loan.amount} has been approved`,
          actionUrl: `/groups/${loan.groupId}/loans/${loanId}`,
        },
      });

      for (const coMaker of loan.coMakers) {
        await prisma.notification.create({
          data: {
            userId: coMaker.userId,
            type: 'LOAN_APPROVED',
            title: 'Co-Maker Loan Approved',
            message: `A loan you are co-making for has been approved`,
            actionUrl: `/groups/${loan.groupId}/loans/${loanId}`,
          },
        });
      }

      // Fetch updated loan with all relations and format
      const updatedLoanWithRelations = await prisma.loan.findUnique({
        where: { id: loanId },
        include: {
          group: true,
          borrower: { select: { id: true, name: true, email: true, image: true } },
          coMakers: { include: { user: { select: { id: true, name: true, image: true } } } },
          repayments: { orderBy: { paymentDate: 'desc' } }
        }
      });

      const formattedLoan = await formatLoanResponse(updatedLoanWithRelations, user.id, isAdmin);
      return NextResponse.json({ loan: formattedLoan });
    } else if (action === 'reject') {
      await prisma.loan.update({
        where: { id: loanId },
        data: { status: 'REJECTED' },
      });

      await prisma.notification.create({
        data: {
          userId: loan.borrowerId,
          type: 'LOAN_REJECTED',
          title: 'Loan Rejected',
          message: `Your loan request has been rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
          actionUrl: `/groups/${loan.groupId}`,
        },
      });

      for (const coMaker of loan.coMakers) {
        await prisma.notification.create({
          data: {
            userId: coMaker.userId,
            type: 'LOAN_REJECTED',
            title: 'Co-Maker Loan Rejected',
            message: `A loan you were co-making for has been rejected`,
            actionUrl: `/groups/${loan.groupId}`,
          },
        });
      }

      // Fetch updated loan with all relations and format
      const updatedLoanWithRelations = await prisma.loan.findUnique({
        where: { id: loanId },
        include: {
          group: true,
          borrower: { select: { id: true, name: true, email: true, image: true } },
          coMakers: { include: { user: { select: { id: true, name: true, image: true } } } },
          repayments: { orderBy: { paymentDate: 'desc' } }
        }
      });

      const formattedLoan = await formatLoanResponse(updatedLoanWithRelations, user.id, isAdmin);
      return NextResponse.json({ loan: formattedLoan });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating loan:', error);
    return NextResponse.json({ error: 'Failed to update loan' }, { status: 500 });
  }
}
