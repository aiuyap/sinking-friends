'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, Plus, DollarSign, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

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

type LoanStats = {
  total: number;
  pending: number;
  active: number;
  repaid: number;
  defaulted: number;
  totalLent: number;
  totalRepaid: number;
  outstanding: number;
};

type ApiLoan = {
  id: string;
  amount: number;
  borrowerName: string;
  borrowerAvatar: string | null;
  status: LoanStatus;
  interestRate: number;
  totalInterest: number;
  totalDue: number;
  dueDate: string;
  isNonMember: boolean;
  coMakers: Array<{ id: string; name: string }>;
  isMyLoan: boolean;
  canApprove: boolean;
  createdAt: string;
};

type ApiResponse = {
  loans: ApiLoan[];
  stats: LoanStats;
};

const statusVariants: Record<LoanStatus, { variant: 'warning' | 'default' | 'success' | 'danger'; color: string; icon: React.ElementType }> = {
  PENDING: { variant: 'warning', color: 'text-yellow-600 bg-yellow-50', icon: Clock },
  APPROVED: { variant: 'default', color: 'text-sage bg-sage/10', icon: DollarSign },
  REPAID: { variant: 'success', color: 'text-green-600 bg-green-50', icon: CheckCircle },
  DEFAULTED: { variant: 'danger', color: 'text-red-600 bg-red-50', icon: AlertCircle },
  REJECTED: { variant: 'danger', color: 'text-red-600 bg-red-50', icon: AlertCircle }
};

export default function LoanListPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  
  const [selectedTab, setSelectedTab] = useState<LoanTab>('ALL');
  const [loans, setLoans] = useState<Loan[]>([]);
  const [stats, setStats] = useState<LoanStats>({
    total: 0,
    pending: 0,
    active: 0,
    repaid: 0,
    defaulted: 0,
    totalLent: 0,
    totalRepaid: 0,
    outstanding: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLoans() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/groups/${groupId}/loans`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch loans');
        }
        
        const data: ApiResponse = await response.json();
        
        // Transform API data to match Loan interface
        const transformedLoans: Loan[] = data.loans.map(apiLoan => ({
          id: apiLoan.id,
          amount: apiLoan.amount,
          borrowerName: apiLoan.borrowerName,
          status: apiLoan.status,
          interestRate: apiLoan.interestRate,
          dueDate: new Date(apiLoan.dueDate),
          totalInterest: apiLoan.totalInterest,
        }));
        
        setLoans(transformedLoans);
        setStats(data.stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }
    
    fetchLoans();
  }, [groupId]);

  const filteredLoans = loans.filter(loan => {
    const statusMap: Record<LoanTab, (loan: Loan) => boolean> = {
      ALL: () => true,
      PENDING: loan => loan.status === 'PENDING',
      ACTIVE: loan => loan.status === 'APPROVED',
      REPAID: loan => loan.status === 'REPAID'
    };
    return statusMap[selectedTab](loan);
  });

  const handleViewLoanDetails = (loanId: string) => {
    router.push(`/groups/${groupId}/loans/${loanId}`);
  };

  const tabs: { id: LoanTab; label: string; count: number }[] = [
    { id: 'ALL', label: 'All Loans', count: stats.total },
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

        {/* Loading State */}
        {loading && (
          <Card className="text-center py-12">
            <CardContent>
              <Loader2 className="w-16 h-16 text-charcoal-muted mx-auto mb-4 animate-spin" />
              <h3 className="font-display text-xl text-charcoal mb-2">Loading Loans...</h3>
              <p className="text-charcoal-muted">Fetching loan data from the server</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="text-center py-12 border-red-200">
            <CardContent>
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="font-display text-xl text-red-600 mb-2">Error Loading Loans</h3>
              <p className="text-charcoal-muted mb-6">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
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

            {/* Loans Table */}
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
              <Card>
                <div className="overflow-x-auto">
                  <div className="min-w-[640px]">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-3 px-6 py-3 text-xs text-charcoal-muted uppercase tracking-wider font-medium border-b border-black/[0.08] bg-gray-50/50">
                      <div className="col-span-2">Borrower</div>
                      <div className="col-span-2 text-right">Amount</div>
                      <div className="col-span-1 text-center">Rate</div>
                      <div className="col-span-2 text-right">Total Due</div>
                      <div className="col-span-2">Due Date</div>
                      <div className="col-span-2">Status</div>
                      <div className="col-span-1 text-right">Action</div>
                    </div>

                    {/* Table Rows */}
                    <div className="divide-y divide-black/[0.04]">
                      {filteredLoans.map((loan, index) => {
                        const status = statusVariants[loan.status];
                        const StatusIcon = status.icon;
                        const totalDue = loan.amount + loan.totalInterest;

                        return (
                          <motion.div
                            key={loan.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="grid grid-cols-12 gap-3 px-6 py-4 text-sm items-center hover:bg-black/[0.02] transition-colors"
                          >
                            <div className="col-span-2">
                              <p className="font-medium text-charcoal">{loan.borrowerName}</p>
                            </div>
                            <div className="col-span-2 text-right font-mono text-charcoal">
                              {formatCurrency(loan.amount)}
                            </div>
                            <div className="col-span-1 text-center text-charcoal-secondary">
                              {loan.interestRate}%
                            </div>
                            <div className="col-span-2 text-right font-mono text-charcoal">
                              {formatCurrency(totalDue)}
                            </div>
                            <div className="col-span-2 text-charcoal-secondary">
                              {loan.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div className="col-span-2">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {loan.status.charAt(0) + loan.status.slice(1).toLowerCase()}
                              </span>
                            </div>
                            <div className="col-span-1 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewLoanDetails(loan.id)}
                              >
                                View
                              </Button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
