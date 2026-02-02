'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  ArrowLeft, 
  PhilippinePeso, 
  Calendar, 
  User, 
  Users, 
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  CreditCard
} from 'lucide-react';

interface LoanData {
  id: string;
  amount: number;
  interestRate: number;
  totalInterest: number;
  termMonths: number;
  status: 'PENDING' | 'APPROVED' | 'REPAID' | 'REJECTED';
  totalDue: number;
  dueDate: string;
  approvedDate: string | null;
  createdAt: string;
  borrowerId: string;
  borrowerName: string;
  borrowerEmail: string | null;
  borrowerAvatar: string | null;
  isNonMember: boolean;
  groupId: string;
  groupName: string;
  coMakers: Array<{
    id: string;
    name: string;
    avatar: string | null;
  }>;
  repayments: Array<{
    id: string;
    amount: number;
    interest: number;
    principal: number;
    paymentDate: string;
    note: string | null;
  }>;
  totalRepaid: number;
  remainingBalance: number;
  progress: number;
  isMyLoan: boolean;
  isCoMaker: boolean;
  canApprove: boolean;
  canRepay: boolean;
  canEdit: boolean;
}

export default function LoanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { success, error: showError } = useToast();
  const groupId = params.id as string;
  const loanId = params.loanId as string;

  const [loan, setLoan] = useState<LoanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>('');

  // Fetch loan data
  useEffect(() => {
    const fetchLoanData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/loans/${loanId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Loan not found');
          } else if (response.status === 403) {
            setError('You do not have access to this loan');
          } else {
            setError('Failed to fetch loan details');
          }
          return;
        }
        
        const data = await response.json();
        setLoan(data.loan);
      } catch (err) {
        setError('Failed to fetch loan details');
        console.error('Error fetching loan:', err);
      } finally {
        setLoading(false);
      }
    };

    if (loanId) {
      fetchLoanData();
    }
  }, [loanId]);

  const handleApprove = async () => {
    try {
      setIsProcessing(true);
      const response = await fetch(`/api/loans/${loanId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' })
      });
      
      if (!response.ok) {
        const error = await response.json();
        showError('Error', error.error || 'Failed to approve loan');
        return;
      }
      
      const data = await response.json();
      setLoan(data.loan);
      setShowApproveModal(false);
      success('Loan Approved', 'The loan has been approved successfully.');
    } catch (err) {
      showError('Error', 'Failed to approve loan');
      console.error('Error approving loan:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsProcessing(true);
      const response = await fetch(`/api/loans/${loanId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' })
      });
      
      if (!response.ok) {
        const error = await response.json();
        showError('Error', error.error || 'Failed to reject loan');
        return;
      }
      
      const data = await response.json();
      setLoan(data.loan);
      setShowRejectModal(false);
      success('Loan Rejected', 'The loan request has been rejected.');
    } catch (err) {
      showError('Error', 'Failed to reject loan');
      console.error('Error rejecting loan:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      const amount = parseFloat(paymentAmount);
      
      if (!amount || amount <= 0) {
        showError('Error', 'Please enter a valid payment amount');
        return;
      }
      
      const response = await fetch(`/api/loans/${loanId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'repay', amount })
      });
      
      if (!response.ok) {
        const error = await response.json();
        showError('Error', error.error || 'Failed to record payment');
        return;
      }
      
      const data = await response.json();
      
      // Update loan data with formatted response from API
      if (data.loan) {
        setLoan(data.loan);
      }
      
      setShowPaymentModal(false);
      setPaymentAmount('');
      success('Payment Recorded', 'The payment has been recorded successfully.');
    } catch (err) {
      showError('Error', 'Failed to record payment');
      console.error('Error recording payment:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const statusConfig = {
    PENDING: { color: 'warning', icon: Clock, label: 'Pending Approval' },
    APPROVED: { color: 'default', icon: CheckCircle, label: 'Active' },
    REPAID: { color: 'success', icon: CheckCircle, label: 'Fully Repaid' },
    REJECTED: { color: 'danger', icon: XCircle, label: 'Rejected' },
  };

  if (loading) {
    return (
      <DashboardLayout title="Loan Details">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Loan Details">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-terracotta mx-auto mb-4" />
          <p className="text-charcoal-secondary mb-4">{error}</p>
          <Button onClick={() => router.push(`/groups/${groupId}/loans`)}>
            Back to Loans
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!loan) {
    return (
      <DashboardLayout title="Loan Details">
        <div className="text-center py-12">
          <p className="text-charcoal-secondary mb-4">Loan not found</p>
          <Button onClick={() => router.push(`/groups/${groupId}/loans`)}>
            Back to Loans
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const StatusIcon = statusConfig[loan.status].icon;

  return (
    <DashboardLayout title="Loan Details">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push(`/groups/${groupId}/loans`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Loans
          </Button>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-display text-3xl text-charcoal">
                {formatCurrency(loan.amount)}
              </h1>
              <Badge variant={statusConfig[loan.status].color as any}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig[loan.status].label}
              </Badge>
            </div>
            <p className="text-charcoal-muted">
              Loan #{loanId} &middot; {loan.borrowerName || 'Unknown'}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            {loan.canApprove && (
              <>
                <Button variant="success" onClick={() => setShowApproveModal(true)}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button variant="danger" onClick={() => setShowRejectModal(true)}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
            {loan.canRepay && (
              <Button onClick={() => setShowPaymentModal(true)}>
                <CreditCard className="w-4 h-4 mr-2" />
                Record Payment
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Loan Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PhilippinePeso className="w-5 h-5 text-sage" />
                  Loan Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-cream-dim rounded-lg">
                    <p className="text-sm text-charcoal-muted mb-1">Principal Amount</p>
                    <p className="font-display text-xl text-charcoal">{formatCurrency(loan.amount)}</p>
                  </div>
                  <div className="p-4 bg-cream-dim rounded-lg">
                    <p className="text-sm text-charcoal-muted mb-1">Interest Rate</p>
                    <p className="font-display text-xl text-charcoal">{loan.interestRate}% / month</p>
                  </div>
                  <div className="p-4 bg-cream-dim rounded-lg">
                    <p className="text-sm text-charcoal-muted mb-1">Total Interest</p>
                    <p className="font-display text-xl text-terracotta">{formatCurrency(loan.totalInterest)}</p>
                  </div>
                  <div className="p-4 bg-cream-dim rounded-lg">
                    <p className="text-sm text-charcoal-muted mb-1">Total Due</p>
                    <p className="font-display text-xl text-charcoal">{formatCurrency(loan.totalDue)}</p>
                  </div>
                </div>

                {(loan.status === 'APPROVED' || loan.status === 'REPAID') && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-charcoal-muted">Repayment Progress</span>
                      <span className="font-mono text-sage">{loan.progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-3 bg-cream-dim rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-sage rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${loan.progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-sm">
                      <span className="text-charcoal-muted">Paid: {formatCurrency(loan.totalRepaid)}</span>
                      <span className="text-charcoal-muted">Remaining: {formatCurrency(loan.remainingBalance)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Repayment History Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sage" />
                  Repayment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!loan.repayments || loan.repayments.length === 0 ? (
                  <div className="text-center py-8">
                    <PhilippinePeso className="w-12 h-12 text-charcoal-muted mx-auto mb-3" />
                    <p className="text-charcoal-muted">No repayments recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {loan.repayments.map((payment: LoanData['repayments'][0], index: number) => (
                      <motion.div
                        key={payment.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-cream-dim rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-charcoal">{formatDate(payment.paymentDate)}</p>
                            <p className="text-sm text-charcoal-muted">
                              Principal: {formatCurrency(payment.principal)} &middot; Interest: {formatCurrency(payment.interest)}
                            </p>
                          </div>
                        </div>
                        <p className="font-mono text-lg text-sage">{formatCurrency(payment.amount)}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Borrower Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-sage" />
                  Borrower
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-sage flex items-center justify-center text-white text-lg font-semibold">
                    {loan.borrowerName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-charcoal">{loan.borrowerName || 'Unknown'}</p>
                    <p className="text-sm text-charcoal-muted">{loan.borrowerEmail || 'No email'}</p>
                  </div>
                </div>
                {loan.isNonMember && (
                  <div className="mt-3">
                    <Badge variant="warning">Non-Member</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Co-Makers Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-sage" />
                  Co-Makers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!loan.coMakers || loan.coMakers.length === 0 ? (
                  <p className="text-charcoal-muted text-sm">No co-makers required</p>
                ) : (
                  <div className="space-y-3">
                    {loan.coMakers.map((coMaker: LoanData['coMakers'][0]) => (
                      <div key={coMaker.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-terracotta-dim flex items-center justify-center text-terracotta font-semibold">
                          {coMaker.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-charcoal">{coMaker.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Due Date Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sage" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loan.approvedDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal-muted">Approved</span>
                    <span className="text-charcoal">{formatDate(loan.approvedDate)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal-muted">Due Date</span>
                  <span className="font-medium text-charcoal">{formatDate(loan.dueDate)}</span>
                </div>
                {loan.status === 'APPROVED' && loan.remainingBalance > 0 && (
                  <div className="pt-3 border-t border-black/[0.06]">
                    <div className="flex items-center gap-2 text-yellow-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">{formatCurrency(loan.remainingBalance)} remaining</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Approve Modal */}
        <Modal isOpen={showApproveModal} onClose={() => setShowApproveModal(false)} title="Approve Loan">
          <div className="space-y-4">
            <p className="text-charcoal-secondary">
              Are you sure you want to approve this loan of <strong>{formatCurrency(loan.amount)}</strong> for <strong>{loan.borrowerName || 'Unknown'}</strong>?
            </p>
            <div className="bg-sage-dim rounded-lg p-4">
              <p className="text-sm text-sage">
                The borrower will be notified and the loan will be marked as active. The due date will be set to {formatDate(loan.dueDate)}.
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowApproveModal(false)}>
                Cancel
              </Button>
              <Button variant="success" className="flex-1" onClick={handleApprove} isLoading={isProcessing}>
                Approve Loan
              </Button>
            </div>
          </div>
        </Modal>

        {/* Reject Modal */}
        <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Reject Loan">
          <div className="space-y-4">
            <p className="text-charcoal-secondary">
              Are you sure you want to reject this loan request from <strong>{loan.borrowerName || 'Unknown'}</strong>?
            </p>
            <div className="bg-danger/5 rounded-lg p-4 border border-danger/20">
              <p className="text-sm text-danger">
                This action cannot be undone. The borrower will be notified of the rejection.
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowRejectModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" className="flex-1" onClick={handleReject} isLoading={isProcessing}>
                Reject Loan
              </Button>
            </div>
          </div>
        </Modal>

        {/* Payment Modal */}
        <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Record Payment">
          <div className="space-y-4">
            <div className="bg-cream-dim rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-charcoal-muted">Remaining Balance</span>
                <span className="font-mono text-charcoal">{formatCurrency(loan.remainingBalance)}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Payment Amount</label>
              <input
                type="number"
                placeholder="Enter amount"
                className="w-full px-4 py-3 rounded-lg border border-black/[0.08] bg-white focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowPaymentModal(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handlePayment} isLoading={isProcessing}>
                Record Payment
              </Button>
            </div>
          </div>
        </Modal>
      </motion.div>
    </DashboardLayout>
  );
}
