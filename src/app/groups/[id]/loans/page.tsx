'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoanCard } from '@/components/loans/LoanCard';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, Plus, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';

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

// Mock data for demo
const mockLoans: Loan[] = [
  {
    id: '1',
    amount: 15000,
    borrowerName: 'John Doe',
    status: 'APPROVED',
    interestRate: 5,
    dueDate: new Date('2026-04-01'),
    totalInterest: 1500
  },
  {
    id: '2',
    amount: 8000,
    borrowerName: 'Jane Smith',
    status: 'PENDING',
    interestRate: 5,
    dueDate: new Date('2026-05-01'),
    totalInterest: 800
  },
  {
    id: '3',
    amount: 20000,
    borrowerName: 'External Borrower',
    status: 'APPROVED',
    interestRate: 10,
    dueDate: new Date('2026-03-15'),
    totalInterest: 4000
  },
  {
    id: '4',
    amount: 5000,
    borrowerName: 'Alice Brown',
    status: 'REPAID',
    interestRate: 5,
    dueDate: new Date('2026-01-15'),
    totalInterest: 500
  }
];

export default function LoanListPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  
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

  const stats = {
    pending: mockLoans.filter(l => l.status === 'PENDING').length,
    active: mockLoans.filter(l => l.status === 'APPROVED').length,
    repaid: mockLoans.filter(l => l.status === 'REPAID').length,
    totalLent: mockLoans.filter(l => l.status === 'APPROVED').reduce((sum, l) => sum + l.amount, 0),
  };

  const handleViewLoanDetails = (loanId: string) => {
    router.push(`/groups/${groupId}/loans/${loanId}`);
  };

  const tabs: { id: LoanTab; label: string; count: number }[] = [
    { id: 'ALL', label: 'All Loans', count: mockLoans.length },
    { id: 'PENDING', label: 'Pending', count: stats.pending },
    { id: 'ACTIVE', label: 'Active', count: stats.active },
    { id: 'REPAID', label: 'Repaid', count: stats.repaid },
  ];

  return (
    <DashboardLayout title="Loans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push(`/groups/${groupId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Group
          </Button>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl text-charcoal">Loans</h1>
            <p className="text-charcoal-muted">Manage all loans in this group</p>
          </div>
          <Button onClick={() => router.push(`/groups/${groupId}`)}>
            <Plus className="w-4 h-4 mr-2" />
            Request New Loan
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-charcoal-muted">Pending</p>
                <p className="font-display text-xl text-charcoal">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-sage-dim rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-sage" />
              </div>
              <div>
                <p className="text-sm text-charcoal-muted">Active</p>
                <p className="font-display text-xl text-charcoal">{stats.active}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-charcoal-muted">Repaid</p>
                <p className="font-display text-xl text-charcoal">{stats.repaid}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-terracotta-dim rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-terracotta" />
              </div>
              <div>
                <p className="text-sm text-charcoal-muted">Total Lent</p>
                <p className="font-display text-xl text-charcoal">{formatCurrency(stats.totalLent)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                selectedTab === tab.id
                  ? 'bg-sage text-white'
                  : 'bg-white text-charcoal-secondary hover:bg-black/[0.03]'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                selectedTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-black/[0.06] text-charcoal-muted'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Loans List */}
        {filteredLoans.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <DollarSign className="w-16 h-16 text-charcoal-muted mx-auto mb-4" />
              <h3 className="font-display text-xl text-charcoal mb-2">No Loans Found</h3>
              <p className="text-charcoal-muted mb-6">
                {selectedTab === 'ALL' 
                  ? 'No loans have been requested yet.'
                  : `No ${selectedTab.toLowerCase()} loans.`
                }
              </p>
              <Button onClick={() => router.push(`/groups/${groupId}`)}>
                <Plus className="w-4 h-4 mr-2" />
                Request a Loan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredLoans.map((loan, index) => (
              <motion.div
                key={loan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <LoanCard
                  id={loan.id}
                  amount={loan.amount}
                  borrowerName={loan.borrowerName}
                  status={loan.status}
                  interestRate={loan.interestRate}
                  dueDate={loan.dueDate}
                  totalInterest={loan.totalInterest}
                  onViewDetails={handleViewLoanDetails}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
