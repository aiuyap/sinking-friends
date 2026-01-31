'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { LoanCard } from '@/components/loans/LoanCard';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from 'next/navigation';

type LoanStatus = 'PENDING' | 'APPROVED' | 'REPAID' | 'DEFAULTED' | 'REJECTED';
type LoanTab = 'ALL' | 'PENDING' | 'ACTIVE' | 'REPAID';

type Loan = {
  id: string;
  amount: number;
  borrowerName: string;
  status: LoanStatus;
  interestRate: number;
  dueDate: Date;
  totalInterest: number;
};

export default function LoanListPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const router = useRouter();
  
  // Mock data - replace with actual data fetching
  const mockLoans: Loan[] = [
    {
      id: '1',
      amount: 1000,
      borrowerName: 'Jane Doe',
      status: 'PENDING',
      interestRate: 5,
      dueDate: new Date('2024-03-15'),
      totalInterest: 50
    },
    {
      id: '2',
      amount: 2000,
      borrowerName: 'John Smith',
      status: 'APPROVED',
      interestRate: 5,
      dueDate: new Date('2024-04-20'),
      totalInterest: 100
    },
    {
      id: '3',
      amount: 500,
      borrowerName: 'Alice Johnson',
      status: 'REPAID',
      interestRate: 5,
      dueDate: new Date('2024-02-01'),
      totalInterest: 25
    }
  ];

  const [selectedTab, setSelectedTab] = useState<LoanTab>('ALL');

  const filteredLoans = mockLoans.filter(loan => {
    const statusMap: Record<LoanTab, (loan: Loan) => boolean> = {
      ALL: () => true,
      PENDING: loan => loan.status === 'PENDING',
      ACTIVE: loan => loan.status === 'APPROVED',
      REPAID: loan => loan.status === 'REPAID'
    };
    return statusMap[selectedTab](loan);
  });

  const handleViewLoanDetails = (loanId: string) => {
    router.push(`/groups/${params.id}/loans/${loanId}`);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-charcoal">Group Loans</h1>
        <Button 
          variant="primary" 
          onClick={() => router.push(`/groups/${params.id}/loans/new`)}
        >
          Request New Loan
        </Button>
      </div>

      <div className="flex space-x-2 mb-4">
        {['ALL', 'PENDING', 'ACTIVE', 'REPAID'].map(tab => (
          <Badge 
            key={tab}
            variant={selectedTab === tab ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedTab(tab as LoanTab)}
          >
            {tab}
          </Badge>
        ))}
      </div>

      <div className="grid gap-4">
        {filteredLoans.map(loan => (
          <LoanCard
            key={loan.id}
            id={loan.id}
            amount={loan.amount}
            borrowerName={loan.borrowerName}
            status={loan.status}
            interestRate={loan.interestRate}
            dueDate={loan.dueDate}
            totalInterest={loan.totalInterest}
            onViewDetails={handleViewLoanDetails}
          />
        ))}
      </div>
    </div>
  );
}