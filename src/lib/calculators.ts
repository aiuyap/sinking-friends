export interface LoanEligibility {
  maxLoan: number
  monthlyContribution: number
  avgAnnualSavings: number
  activeMonths: number
  breakdown: {
    option1: number
    option2: number
    method: string
  }
}

export interface RepaymentSplit {
  principal: number
  interest: number
  total: number
}

export interface MemberDistribution {
  memberId: string
  memberName?: string
  contributionAmount: number
  interestShare: number
  totalPayout: number
  reason: string
}

/**
 * Calculate the maximum loan amount a member can borrow
 * 
 * Rule (Updated February 2026):
 * - < 6 months active: Total contributions made so far
 * - >= 6 months active: 50% of annual savings (bi-weekly contribution × 24)
 * 
 * @param member - The group member requesting loan
 * @param group - The group with loan settings
 */
export function calculateMaxLoanAmount(
  member: { biWeeklyContribution: number; totalContributions: number; joinedAt: Date },
  group: { maxLoanPercent: number }
): LoanEligibility {
  const monthlyContribution = member.biWeeklyContribution * 2
  const activeMonths = getMonthsActive(member.joinedAt)
  
  const totalContributions = member.totalContributions || 0
  
  let maxLoan: number
  let calculationMethod: string
  
  if (activeMonths < 6) {
    // Less than 6 months: Total contributions made so far
    maxLoan = totalContributions
    calculationMethod = 'total_contributions'
  } else {
    // 6 months or more: 50% of annual savings (bi-weekly × 24)
    const annualSavings = member.biWeeklyContribution * 24
    maxLoan = annualSavings * (group.maxLoanPercent / 100)
    calculationMethod = 'annual_savings_percentage'
  }
  
  return {
    maxLoan,
    monthlyContribution,
    avgAnnualSavings: activeMonths < 6 ? 0 : member.biWeeklyContribution * 24,
    activeMonths,
    breakdown: { 
      option1: totalContributions, 
      option2: activeMonths < 6 ? 0 : member.biWeeklyContribution * 24 * (group.maxLoanPercent / 100),
      method: calculationMethod
    }
  }
}

/**
 * Calculate number of months from joined date to now
 */
function getMonthsActive(joinedAt: Date): number {
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - joinedAt.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.ceil(diffDays / 30)
}

/**
 * Calculate how to split a loan repayment between principal and interest
 * 
 * Rule: Split proportionally based on total due amount
 * 
 * @param loan - The loan with amount, interest, and repaid amount
 * @param paymentAmount - The payment being made
 */
export function calculateRepayment(
  loan: { amount: number; totalInterest: number; repaidAmount: number },
  paymentAmount: number
): RepaymentSplit {
  const totalDue = loan.amount + loan.totalInterest
  const remainingTotal = totalDue - loan.repaidAmount
  const effectivePayment = Math.min(paymentAmount, remainingTotal)
  
  // Proportional split
  const ratio = effectivePayment / totalDue
  
  const principal = loan.amount * ratio
  const interest = loan.totalInterest * ratio
  
  return {
    principal: Math.round(principal * 100) / 100,
    interest: Math.round(interest * 100) / 100,
    total: effectivePayment
  }
}

/**
 * Calculate year-end distribution for all members
 * 
 * Rule:
 * - Active members: Contributions + Proportional interest share
 * - Inactive members: Contributions only (no interest)
 * 
 * Interest share = (member_contributions / total_pool) × total_interest_earned
 * 
 * @param group - Group with members, contributions, and loans
 */
export function calculateYearEndDistribution(
  group: {
    members: Array<{
      id: string;
      user?: { name?: string };
      isActive: boolean;
      contributions: Array<{ amount: number }>;
    }>;
    contributions: Array<{ amount: number }>;
    loans: Array<{ status: string; totalInterest: number }>;
  }
): MemberDistribution[] {
  const totalPool = group.contributions.reduce((sum, c) => sum + c.amount, 0)
  const totalInterestEarned = group.loans
    .filter(l => l.status === 'REPAID')
    .reduce((sum, l) => sum + l.totalInterest, 0)
  
  return group.members.map(member => {
    const memberContributions = member.contributions.reduce((sum, c) => sum + c.amount, 0)
    
    if (!member.isActive) {
      // Inactive: only return contributions
      return {
        memberId: member.id,
        memberName: member.user?.name,
        contributionAmount: memberContributions,
        interestShare: 0,
        totalPayout: memberContributions,
        reason: 'Inactive member (no interest share)'
      }
    }
    
    // Active: proportional interest share
    const contributionPercent = totalPool > 0 ? memberContributions / totalPool : 0
    const interestShare = totalInterestEarned * contributionPercent
    
    return {
      memberId: member.id,
      memberName: member.user?.name,
      contributionAmount: memberContributions,
      interestShare: Math.round(interestShare * 100) / 100,
      totalPayout: memberContributions + Math.round(interestShare * 100) / 100,
      reason: 'Active member (proportional interest share)'
    }
  })
}

/**
 * Generate contribution schedule for a member
 * 
 * @param member - Group member with bi-weekly amount and payday
 * @param group - Group with term start/end dates
 * @param gracePeriodDays - Grace period in days
 */
export function generateContributionSchedule(
  member: {
    id: string;
    biWeeklyContribution: number;
    personalPayday: number;
    joinedAt: Date;
  },
  group: {
    id: string;
    termStartDate: Date;
    termEndDate: Date;
  },
  gracePeriodDays: number = 7
): Array<{
  memberId: string;
  scheduledDate: Date;
  amount: number;
  gracePeriodEnd: Date;
}> {
  const schedule: Array<{
    memberId: string;
    scheduledDate: Date;
    amount: number;
    gracePeriodEnd: Date;
  }> = []
  
  const startDate = member.joinedAt > group.termStartDate 
    ? member.joinedAt 
    : group.termStartDate
  
  let currentDate = getNextPayday(startDate, member.personalPayday)
  
  while (currentDate <= group.termEndDate) {
    const gracePeriodEnd = new Date(currentDate)
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + gracePeriodDays)
    
    schedule.push({
      memberId: member.id,
      scheduledDate: new Date(currentDate),
      amount: member.biWeeklyContribution,
      gracePeriodEnd
    })
    
    // Next bi-weekly
    currentDate = new Date(currentDate)
    currentDate.setDate(currentDate.getDate() + 14)
  }
  
  return schedule
}

/**
 * Get the next payday based on a day of month
 */
function getNextPayday(startDate: Date, paydayDay: number): Date {
  const date = new Date(startDate)
  
  // Find next payday day
  const currentDay = date.getDate()
  if (currentDay > paydayDay) {
    // Move to next month
    date.setMonth(date.getMonth() + 1)
  }
  
  date.setDate(paydayDay)
  
  return date
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

/**
 * Generate a random invite token
 */
export function generateInviteToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}
