'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { Clock, CheckCircle2, CircleDashed, Circle, CheckCircle } from 'lucide-react';
import type { PaymentHistoryItem, PaymentStatus, PaymentType } from '@/types/payment';

interface PaymentHistoryCardProps {
  data: PaymentHistoryItem[];
  maxItems?: number;
  variant?: 'card' | 'full-width';
}

const statusConfig: Record<PaymentStatus, { label: string; color: string; icon: React.ElementType }> = {
  paid: { label: 'Paid', color: 'text-green-600 bg-green-50', icon: CheckCircle2 },
  pending: { label: 'Pending', color: 'text-yellow-600 bg-yellow-50', icon: CircleDashed },
  upcoming: { label: 'Upcoming', color: 'text-amber-600 bg-amber-50', icon: Circle },
  approved: { label: 'Approved', color: 'text-blue-600 bg-blue-50', icon: CheckCircle },
  repaid: { label: 'Repaid', color: 'text-teal-600 bg-teal-50', icon: CheckCircle2 },
};

const typeLabels: Record<PaymentType, string> = {
  contribution: 'Contribution',
  loan_repayment: 'Repayment',
  loan_taken: 'Loan',
};

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateFull(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function PaymentTable({ 
  data, 
  showFullDates,
  maxHeight 
}: { 
  data: PaymentHistoryItem[]; 
  showFullDates: boolean;
  maxHeight?: string;
}) {
  return (
    <div className={maxHeight ? `overflow-y-auto ${maxHeight}` : undefined}>
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-3 text-xs text-charcoal-muted uppercase tracking-wider font-medium border-b border-black/[0.08] pb-2 sticky top-0 bg-white z-10">
            <div className="col-span-2">Date</div>
            <div className="col-span-4">Group</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-2 text-right">Status</div>
          </div>

          {/* Table Rows */}
          <div className="space-y-1 pt-1">
            {data.map((payment) => {
              const status = statusConfig[payment.status];
              const StatusIcon = status.icon;

              return (
                <div
                  key={payment.id}
                  className="grid grid-cols-12 gap-3 py-2.5 text-sm hover:bg-black/[0.02] rounded transition-colors items-center border-b border-black/[0.04] last:border-b-0"
                >
                  <div className="col-span-2 text-charcoal-secondary">
                    {showFullDates ? formatDateFull(payment.date) : formatDateShort(payment.date)}
                  </div>
                  <div className="col-span-4 text-charcoal font-medium truncate" title={payment.groupName}>
                    {payment.groupName}
                  </div>
                  <div className="col-span-2 text-charcoal-secondary">
                    {typeLabels[payment.type]}
                  </div>
                  <div className="col-span-2 text-right font-mono text-charcoal">
                    {formatCurrency(payment.amount)}
                  </div>
                  <div className="col-span-2 text-right">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PaymentHistoryCard({ 
  data, 
  maxItems = 6,
  variant = 'card'
}: PaymentHistoryCardProps) {
  if (variant === 'full-width') {
    // Full-width variant - show all items with scrolling
    return (
      <Card className="mb-8">
        <CardHeader className="pb-3 border-b border-black/[0.08]">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-sage" />
              Payment History
            </CardTitle>
            <span className="text-sm text-charcoal-muted">
              {data.length} transactions this year
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <PaymentTable 
            data={data} 
            showFullDates={true}
            maxHeight="max-h-[400px]"
          />
        </CardContent>
      </Card>
    );
  }

  // Card variant - limited items, compact view
  const displayData = data.slice(0, maxItems);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="w-4 h-4 text-sage" />
            Payment History
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <PaymentTable 
          data={displayData} 
          showFullDates={false}
        />
      </CardContent>
    </Card>
  );
}
