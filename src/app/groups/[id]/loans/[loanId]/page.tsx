'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';

export default function LoanDetailPage({ 
  params 
}: { 
  params: { id: string, loanId: string } 
}) {
  const router = useRouter();

  // Mock loan details - replace with actual data fetching
  const loanDetails = {
    id: params.loanId,
    borrowerName: 'Jane Doe',
    amount: 1500,
    status: 'PENDING',
    interestRate: 5,
    dueDate: new Date('2024-03-15'),
    totalInterest: 75,
    coMakers: [
      { name: 'John Smith', email: 'john@example.com' },
      { name: 'Alice Johnson', email: 'alice@example.com' }
    ],
    repaymentHistory: [
      { 
        date: new Date('2024-02-01'), 
        amount: 250, 
        principalPaid: 200, 
        interestPaid: 50 
      }
    ]
  };

  const renderRepaymentHistory = () => {
    if (loanDetails.repaymentHistory.length === 0) {
      return <p className="text-sm text-charcoal/70">No repayments yet</p>;
    }

    return loanDetails.repaymentHistory.map((payment, index) => (
      <div key={index} className="border-b last:border-b-0 py-2">
        <div className="flex justify-between">
          <span>{payment.date.toLocaleDateString()}</span>
          <span>${payment.amount.toFixed(2)}</span>
        </div>
        <div className="text-xs text-charcoal/70">
          Principal: ${payment.principalPaid.toFixed(2)} 
          | Interest: ${payment.interestPaid.toFixed(2)}
        </div>
      </div>
    ));
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-charcoal mb-2">
            Loan Details
          </h1>
          <p className="text-charcoal/70">
            Loan #{params.loanId}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={
            loanDetails.status === 'PENDING' ? 'warning' : 
            loanDetails.status === 'APPROVED' ? 'default' : 
            loanDetails.status === 'REPAID' ? 'success' : 'danger'
          }>
            {loanDetails.status}
          </Badge>
          {loanDetails.status === 'PENDING' && (
            <div className="space-x-2">
              <Button variant="success" size="sm">Approve</Button>
              <Button variant="danger" size="sm">Reject</Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Loan Information</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Borrower</span>
                <span>{loanDetails.borrowerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount</span>
                <span>${loanDetails.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Interest Rate</span>
                <span>{loanDetails.interestRate}%</span>
              </div>
              <div className="flex justify-between">
                <span>Total Interest</span>
                <span>${loanDetails.totalInterest.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Due</span>
                <span>
                  ${(loanDetails.amount + loanDetails.totalInterest).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Due Date</span>
                <span>{loanDetails.dueDate.toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Co-Makers</h2>
            {loanDetails.coMakers.map((coMaker, index) => (
              <div 
                key={index} 
                className="flex justify-between items-center border-b last:border-b-0 py-2"
              >
                <div>
                  <div className="font-medium">{coMaker.name}</div>
                  <div className="text-xs text-charcoal/70">{coMaker.email}</div>
                </div>
                <Badge variant="default">Co-Maker</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="md:col-span-2">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Repayment History</h2>
            {renderRepaymentHistory()}
          </div>
        </Card>
      </div>

      <div className="mt-6 flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => router.push(`/groups/${params.id}/loans`)}
        >
          Back to Loans
        </Button>
        {loanDetails.status === 'APPROVED' && (
          <Button variant="primary">
            Make Payment
          </Button>
        )}
      </div>
    </div>
  );
}