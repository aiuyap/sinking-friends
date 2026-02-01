'use client';

import React, { useState } from 'react';
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
  DollarSign, 
  Calendar, 
  User, 
  Users, 
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  CreditCard
} from 'lucide-react';

export default function LoanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { success } = useToast();
  const groupId = params.id as string;
  const loanId = params.loanId as string;

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loanStatus, setLoanStatus] = useState<'PENDING' | 'APPROVED' | 'REPAID' | 'REJECTED'>('PENDING');

  // Mock loan details - replace with actual data fetching
  const loanDetails = {
    id: loanId,
    borrowerName: 'Jane Doe',
    borrowerEmail: 'jane@example.com',
    amount: 15000,
    status: loanStatus,
    interestRate: 5,
    approvedDate: loanStatus !== 'PENDING' ? new Date('2026-01-15') : null,
    dueDate: new Date('2026-03-15'),
    totalInterest: 1500,
    repaidAmount: 5000,
    isNonMember: false,
    coMakers: [
      { id: '1', name: 'John Smith', email: 'john@example.com' },
    ],
    repaymentHistory: [
      { 
        id: '1',
        date: new Date('2026-02-01'), 
        amount: 2500, 
        principalPaid: 2250, 
        interestPaid: 250 
      },
      { 
        id: '2',
        date: new Date('2026-02-15'), 
        amount: 2500, 
        principalPaid: 2250, 
        interestPaid: 250 
      }
    ]
  };

  const totalDue = loanDetails.amount + loanDetails.totalInterest;
  const remainingBalance = totalDue - loanDetails.repaidAmount;
  const progressPercent = (loanDetails.repaidAmount / totalDue) * 100;

  const handleApprove = async () => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoanStatus('APPROVED');
    setIsProcessing(false);
    setShowApproveModal(false);
    success('Loan Approved', 'The loan has been approved successfully.');
  };

  const handleReject = async () => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoanStatus('REJECTED');
    setIsProcessing(false);
    setShowRejectModal(false);
    success('Loan Rejected', 'The loan request has been rejected.');
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsProcessing(false);
    setShowPaymentModal(false);
    success('Payment Recorded', 'The payment has been recorded successfully.');
  };

  const statusConfig = {
    PENDING: { color: 'warning', icon: Clock, label: 'Pending Approval' },
    APPROVED: { color: 'default', icon: CheckCircle, label: 'Active' },
    REPAID: { color: 'success', icon: CheckCircle, label: 'Fully Repaid' },
    REJECTED: { color: 'danger', icon: XCircle, label: 'Rejected' },
  };

  const StatusIcon = statusConfig[loanDetails.status].icon;

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
                {formatCurrency(loanDetails.amount)}
              </h1>
              <Badge variant={statusConfig[loanDetails.status].color as any}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig[loanDetails.status].label}
              </Badge>
            </div>
            <p className="text-charcoal-muted">
              Loan #{loanId} &middot; {loanDetails.borrowerName}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            {loanDetails.status === 'PENDING' && (
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
            {loanDetails.status === 'APPROVED' && (
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
                  <DollarSign className="w-5 h-5 text-sage" />
                  Loan Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-cream-dim rounded-lg">
                    <p className="text-sm text-charcoal-muted mb-1">Principal Amount</p>
                    <p className="font-display text-xl text-charcoal">{formatCurrency(loanDetails.amount)}</p>
                  </div>
                  <div className="p-4 bg-cream-dim rounded-lg">
                    <p className="text-sm text-charcoal-muted mb-1">Interest Rate</p>
                    <p className="font-display text-xl text-charcoal">{loanDetails.interestRate}% / month</p>
                  </div>
                  <div className="p-4 bg-cream-dim rounded-lg">
                    <p className="text-sm text-charcoal-muted mb-1">Total Interest</p>
                    <p className="font-display text-xl text-terracotta">{formatCurrency(loanDetails.totalInterest)}</p>
                  </div>
                  <div className="p-4 bg-cream-dim rounded-lg">
                    <p className="text-sm text-charcoal-muted mb-1">Total Due</p>
                    <p className="font-display text-xl text-charcoal">{formatCurrency(totalDue)}</p>
                  </div>
                </div>

                {loanDetails.status === 'APPROVED' && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-charcoal-muted">Repayment Progress</span>
                      <span className="font-mono text-sage">{progressPercent.toFixed(0)}%</span>
                    </div>
                    <div className="h-3 bg-cream-dim rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-sage rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-sm">
                      <span className="text-charcoal-muted">Paid: {formatCurrency(loanDetails.repaidAmount)}</span>
                      <span className="text-charcoal-muted">Remaining: {formatCurrency(remainingBalance)}</span>
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
                {loanDetails.repaymentHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="w-12 h-12 text-charcoal-muted mx-auto mb-3" />
                    <p className="text-charcoal-muted">No repayments recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {loanDetails.repaymentHistory.map((payment, index) => (
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
                            <p className="font-medium text-charcoal">{formatDate(payment.date)}</p>
                            <p className="text-sm text-charcoal-muted">
                              Principal: {formatCurrency(payment.principalPaid)} &middot; Interest: {formatCurrency(payment.interestPaid)}
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
                    {loanDetails.borrowerName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-charcoal">{loanDetails.borrowerName}</p>
                    <p className="text-sm text-charcoal-muted">{loanDetails.borrowerEmail}</p>
                  </div>
                </div>
                {loanDetails.isNonMember && (
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
                {loanDetails.coMakers.length === 0 ? (
                  <p className="text-charcoal-muted text-sm">No co-makers required</p>
                ) : (
                  <div className="space-y-3">
                    {loanDetails.coMakers.map((coMaker) => (
                      <div key={coMaker.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-terracotta-dim flex items-center justify-center text-terracotta font-semibold">
                          {coMaker.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-charcoal">{coMaker.name}</p>
                          <p className="text-xs text-charcoal-muted">{coMaker.email}</p>
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
                {loanDetails.approvedDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal-muted">Approved</span>
                    <span className="text-charcoal">{formatDate(loanDetails.approvedDate)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal-muted">Due Date</span>
                  <span className="font-medium text-charcoal">{formatDate(loanDetails.dueDate)}</span>
                </div>
                {loanDetails.status === 'APPROVED' && remainingBalance > 0 && (
                  <div className="pt-3 border-t border-black/[0.06]">
                    <div className="flex items-center gap-2 text-yellow-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">{formatCurrency(remainingBalance)} remaining</span>
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
              Are you sure you want to approve this loan of <strong>{formatCurrency(loanDetails.amount)}</strong> for <strong>{loanDetails.borrowerName}</strong>?
            </p>
            <div className="bg-sage-dim rounded-lg p-4">
              <p className="text-sm text-sage">
                The borrower will be notified and the loan will be marked as active. The due date will be set to {formatDate(loanDetails.dueDate)}.
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
              Are you sure you want to reject this loan request from <strong>{loanDetails.borrowerName}</strong>?
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
                <span className="font-mono text-charcoal">{formatCurrency(remainingBalance)}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Payment Amount</label>
              <input
                type="number"
                placeholder="Enter amount"
                className="w-full px-4 py-3 rounded-lg border border-black/[0.08] bg-white focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage"
                defaultValue={remainingBalance}
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
