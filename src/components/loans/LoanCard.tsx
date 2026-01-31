import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface LoanCardProps {
  id: string;
  amount: number;
  borrowerName: string;
  status: 'PENDING' | 'APPROVED' | 'REPAID' | 'DEFAULTED' | 'REJECTED';
  interestRate: number;
  dueDate: Date;
  totalInterest: number;
  onViewDetails?: (loanId: string) => void;
}

const statusVariants = {
  PENDING: 'warning',
  APPROVED: 'default',
  REPAID: 'success',
  DEFAULTED: 'danger',
  REJECTED: 'danger'
} as const;

export function LoanCard({
  id,
  amount,
  borrowerName,
  status,
  interestRate,
  dueDate,
  totalInterest,
  onViewDetails
}: LoanCardProps) {
  const totalAmount = amount + totalInterest;
  const statusVariant = statusVariants[status];

  return (
    <Card>
      <div className="p-4 flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-charcoal">
              ${amount.toFixed(2)}
            </h3>
            <Badge variant={statusVariant}>
              {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
            </Badge>
          </div>
          
          <div className="text-sm text-charcoal/70 space-y-1">
            <p>Borrower: {borrowerName}</p>
            <p>Interest Rate: {interestRate}%</p>
            <p>Total Due: ${totalAmount.toFixed(2)}</p>
            <p>Due Date: {dueDate.toLocaleDateString()}</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onViewDetails?.(id)}
        >
          View Details
        </Button>
      </div>
    </Card>
  );
}