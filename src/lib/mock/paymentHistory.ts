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

export const mockPaymentHistory: PaymentHistoryItem[] = [
  {
    id: 'pay-1',
    date: '2026-02-15',
    groupName: 'Family Savings',
    type: 'contribution',
    amount: 500,
    status: 'paid',
    description: 'February contribution'
  },
  {
    id: 'pay-2',
    date: '2026-02-14',
    groupName: 'Office Group',
    type: 'loan_taken',
    amount: 5000,
    status: 'approved',
    description: 'Loan approved - 2 months term'
  },
  {
    id: 'pay-3',
    date: '2026-02-10',
    groupName: 'Office Group',
    type: 'contribution',
    amount: 300,
    status: 'paid',
    description: 'February contribution'
  },
  {
    id: 'pay-4',
    date: '2026-02-08',
    groupName: 'Family Savings',
    type: 'loan_repayment',
    amount: 550,
    status: 'paid',
    description: 'Repayment for loan #FS-2026-001'
  },
  {
    id: 'pay-5',
    date: '2026-02-01',
    groupName: 'Travel Fund',
    type: 'contribution',
    amount: 200,
    status: 'paid',
    description: 'February contribution'
  },
  {
    id: 'pay-6',
    date: '2026-01-28',
    groupName: 'Office Group',
    type: 'contribution',
    amount: 300,
    status: 'paid',
    description: 'January contribution'
  },
  {
    id: 'pay-7',
    date: '2026-01-25',
    groupName: 'Family Savings',
    type: 'contribution',
    amount: 500,
    status: 'paid',
    description: 'January contribution'
  },
  {
    id: 'pay-8',
    date: '2026-01-20',
    groupName: 'Family Savings',
    type: 'loan_taken',
    amount: 3000,
    status: 'repaid',
    description: 'Loan fully repaid'
  },
  {
    id: 'pay-9',
    date: '2026-01-18',
    groupName: 'Family Savings',
    type: 'loan_repayment',
    amount: 1575,
    status: 'paid',
    description: 'Final repayment'
  },
  {
    id: 'pay-10',
    date: '2026-01-15',
    groupName: 'Travel Fund',
    type: 'contribution',
    amount: 200,
    status: 'paid',
    description: 'January contribution'
  },
  {
    id: 'pay-11',
    date: '2026-03-01',
    groupName: 'Office Group',
    type: 'contribution',
    amount: 300,
    status: 'upcoming',
    description: 'Due in 5 days'
  },
  {
    id: 'pay-12',
    date: '2026-03-05',
    groupName: 'Family Savings',
    type: 'contribution',
    amount: 500,
    status: 'upcoming',
    description: 'Due in 9 days'
  }
];
