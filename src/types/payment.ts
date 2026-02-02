export type PaymentStatus = 'paid' | 'pending' | 'upcoming' | 'approved' | 'repaid';
export type PaymentType = 'contribution' | 'loan_repayment' | 'loan_taken';

export interface PaymentHistoryItem {
  id: string;
  date: string;
  groupName: string;
  type: PaymentType;
  amount: number;
  status: PaymentStatus;
  description?: string;
}
