import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/my-loans - Get all loans for the current user (where they are the borrower)
export async function GET(request: NextRequest) {
  try {
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

    // Fetch all loans where user is the borrower
    const loans = await prisma.loan.findMany({
      where: { borrowerId: user.id },
      include: {
        group: { select: { id: true, name: true } },
        repayments: { orderBy: { paymentDate: 'desc' } },
        coMakers: { include: { user: { select: { id: true, name: true, image: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate stats
    const stats = {
      total: loans.length,
      pending: loans.filter(l => l.status === 'PENDING').length,
      active: loans.filter(l => l.status === 'APPROVED').length,
      repaid: loans.filter(l => l.status === 'REPAID').length,
      rejected: loans.filter(l => l.status === 'REJECTED').length,
      totalBorrowed: loans.reduce((sum, l) => sum + l.amount, 0),
      totalRepaid: loans
        .filter(l => l.status === 'REPAID')
        .reduce((sum, l) => sum + l.amount + l.totalInterest, 0)
    };

    // Format loans for response
    const formattedLoans = loans.map(loan => {
      const totalRepaid = loan.repayments.reduce((sum, r) => sum + r.amount, 0);
      const totalDue = loan.amount + loan.totalInterest;
      const remainingBalance = Math.max(0, totalDue - totalRepaid);
      const progress = totalDue > 0 ? Math.min(100, (totalRepaid / totalDue) * 100) : 0;

      return {
        id: loan.id,
        groupId: loan.groupId,
        groupName: loan.group.name,
        amount: loan.amount,
        interestRate: loan.interestRate,
        totalInterest: loan.totalInterest,
        totalDue,
        totalRepaid,
        remainingBalance,
        progress,
        status: loan.status,
        termMonths: loan.termMonths,
        dueDate: loan.dueDate,
        approvedDate: loan.approvedDate,
        createdAt: loan.createdAt,
        coMakers: loan.coMakers.map(cm => ({
          id: cm.userId,
          name: cm.user?.name || 'Unknown'
        })),
        repaymentCount: loan.repayments.length
      };
    });

    return NextResponse.json({ loans: formattedLoans, stats });
  } catch (error) {
    console.error('Error fetching user loans:', error);
    return NextResponse.json({ error: 'Failed to fetch loans' }, { status: 500 });
  }
}
