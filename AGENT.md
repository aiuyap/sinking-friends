# Sinking Fund Platform - Agent Guide

This document provides comprehensive implementation guidance for agents working on the Sinking Fund Platform.

## Project Overview

A collaborative savings and loan fund platform where:
- Members contribute bi-weekly amounts based on personal payday
- Pool funds for borrowing with co-maker system
- Loans accrue interest (5% members, 10% non-members)
- Year-end distribution: contributions + proportional interest share
- Penalties for missed payments (no interest share)

## Technology Stack

- **Frontend**: Next.js 15 + React 18 + TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Auth**: Firebase Auth (Google OAuth)
- **Database**: PostgreSQL with Prisma ORM
- **Hosting**: Vercel

## Design System

### Colors
```css
--color-cream: #F6F5EC (primary background)
--color-sage: #6B8E6B (accent)
--color-terracotta: #C4956A (secondary)
--color-charcoal: #1A1A1A (text)
```

### Typography
- Display: DM Serif Display
- Body: Inter
- Monospace: JetBrains Mono (for financial data)

## Database Schema

See `prisma/schema.prisma` for complete schema.

Key models:
- `User` - User accounts
- `Group` - Sinking fund groups with settings
- `GroupMember` - Membership with contribution details
- `Loan` - Loans with co-maker tracking
- `CoMaker` - Joint liability for loans
- `Contribution` - Bi-weekly payment tracking
- `LoanRepayment` - Repayment records
- `Notification` - Email + in-app alerts

## Core Business Logic

### Loan Eligibility Calculator

```typescript
function calculateMaxLoanAmount(member: GroupMember, group: Group): LoanEligibility {
  const monthlyContribution = member.biWeeklyContribution * 2
  const activeMonths = getMonthsActive(member.joinedAt)
  
  const totalContributions = member.totalContributions
  const avgAnnualSavings = (totalContributions / activeMonths) * 12
  
  const option1 = monthlyContribution
  const option2 = avgAnnualSavings * (group.maxLoanPercent / 100)
  
  // Rule: <6 months = MIN, >=6 months = MAX
  const maxLoan = activeMonths < 6 
    ? Math.min(option1, option2) 
    : Math.max(option1, option2)
  
  return {
    maxLoan,
    monthlyContribution,
    avgAnnualSavings,
    activeMonths,
    breakdown: { option1, option2 }
  }
}
```

### Contribution Schedule Generator

```typescript
function generateContributionSchedule(
  member: GroupMember, 
  group: Group
): ContributionSchedule[] {
  const schedule: ContributionSchedule[] = []
  const startDate = max(member.joinedAt, group.termStartDate)
  const endDate = group.termEndDate
  
  let currentDate = getNextPayday(startDate, member.personalPayday)
  
  while (currentDate <= endDate) {
    schedule.push({
      memberId: member.id,
      scheduledDate: currentDate,
      amount: member.biWeeklyContribution,
      gracePeriodEnd: addDays(currentDate, group.settings.gracePeriodDays)
    })
    
    currentDate = addDays(currentDate, 14) // Next bi-weekly
  }
  
  return schedule
}
```

### Loan Repayment Calculator

```typescript
function calculateRepayment(
  loan: Loan, 
  paymentAmount: Float
): RepaymentSplit {
  const remainingTotal = (loan.amount + loan.totalInterest) - loan.repaidAmount
  const effectivePayment = Math.min(paymentAmount, remainingTotal)
  
  // Proportional split
  const totalDue = loan.amount + loan.totalInterest
  const ratio = effectivePayment / totalDue
  
  const principal = loan.amount * ratio
  const interest = loan.totalInterest * ratio
  
  return { principal, interest, total: effectivePayment }
}
```

### Interest Distribution Calculator

```typescript
function calculateYearEndDistribution(group: Group): MemberDistribution[] {
  const totalPool = sum(group.contributions, 'amount')
  const totalInterestEarned = sum(group.loans.filter(l => l.status === 'REPAID'), 'totalInterest')
  
  return group.members.map(member => {
    const memberContributions = sum(member.contributions, 'amount')
    
    if (!member.isActive) {
      // Inactive: only return contributions
      return {
        memberId: member.id,
        contributionAmount: memberContributions,
        interestShare: 0,
        totalPayout: memberContributions,
        reason: 'Inactive member'
      }
    }
    
    // Active: proportional interest share
    const contributionPercent = memberContributions / totalPool
    const interestShare = totalInterestEarned * contributionPercent
    
    return {
      memberId: member.id,
      contributionAmount: memberContributions,
      interestShare,
      totalPayout: memberContributions + interestShare,
      reason: 'Active member'
    }
  })
}
```

### Missed Payment Tracker

```typescript
async function checkMissedPayments() {
  const today = new Date()
  const missedContributions = await prisma.contribution.findMany({
    where: {
      paidDate: null,
      gracePeriodEnd: { lt: today },
      isMissed: false
    },
    include: { member: true, group: { include: { settings: true } } }
  })
  
  for (const contribution of missedContributions) {
    // Update member's consecutive missed counter
    const updated = await prisma.groupMember.update({
      where: { id: contribution.memberId },
      data: { 
        missedConsecutivePayments: { increment: 1 },
        isActive: { 
          set: contribution.member.missedConsecutivePayments + 1 >= 3 
            ? false 
            : true 
        }
      }
    })
    
    // Mark contribution as missed
    await prisma.contribution.update({
      where: { id: contribution.id },
      data: { isMissed: true }
    })
    
    // Send notification
    await sendNotification(
      contribution.member.userId,
      'CONTRIBUTION_MISSED',
      `Payment for ${formatDate(contribution.scheduledDate)} was missed`,
      `/groups/${contribution.groupId}`
    )
  }
}
```

## Business Rules Summary

### Loan Eligibility
- **< 6 months active**: MIN(monthly_contribution, 50% of avg_annual_savings)
- **>= 6 months active**: MAX(monthly_contribution, 50% of avg_annual_savings)
- Monthly contribution = bi-weekly × 2
- Avg annual savings = (total_contributions / active_months) × 12

### Co-Maker Rules
- Required for loans > monthly_contribution
- Co-maker cannot have active loans
- Co-maker blocked from borrowing until loan repaid
- Co-maker jointly liable for repayment

### Interest Rates
- Members: 5% per month (configurable per group)
- Non-members: 10% per month (configurable per group)
- Fixed term: 2 months

### Repayment Rules
- Can pay fully or partially
- Partial payments split proportionally (principal + interest)
- When repaid_amount >= amount + total_interest → Mark REPAID

### Default Handling
- After 2 months past due → Mark DEFAULTED
- Notify borrower and admin
- Disable borrower's future loans
- Co-maker remains liable

### Missed Payments
- Grace period: 7 days after scheduled date
- After grace period → Mark missed, increment counter
- 3 consecutive missed → Set isActive = false (no interest share)
- Payment made → Reset counter to 0

### Year-End Distribution
- Active members: Contributions + Proportional interest share
- Inactive members: Contributions only (no interest)
- Interest share = (member_contributions / total_pool) × total_interest_earned
- Distribution date: December 20-24 (configurable)

### Loan Approval Flow
1. Member submits loan request (PENDING status)
2. Admin reviews eligibility
3. Admin approves/rejects
4. Approved → Set due date (2 months from approval)
5. Borrower notified

## API Routes

### Authentication
- `POST /api/auth/google` - Google sign-in

### Dashboard
- `GET /api/dashboard` - User stats (groups, loans, contributions)

### Groups
- `GET /api/groups` - List user's groups
- `POST /api/groups` - Create new group
- `GET /api/groups/[id]` - Group details
- `PUT /api/groups/[id]` - Update group settings
- `DELETE /api/groups/[id]` - Delete group

### Members
- `GET /api/groups/[id]/members` - List members
- `POST /api/groups/[id]/members` - Add/invite member
- `PUT /api/groups/[id]/members/[id]` - Update member (contribution, payday)
- `DELETE /api/groups/[id]/members/[id]` - Remove member

### Contributions
- `GET /api/groups/[id]/contributions` - List contributions
- `POST /api/groups/[id]/contributions` - Record contribution
- `PUT /api/groups/[id]/contributions/[id]` - Mark as paid
- `POST /api/cron/generate-contributions` - Generate scheduled payments

### Loans
- `GET /api/groups/[id]/loans` - List loans
- `POST /api/groups/[id]/loans` - Request loan
- `GET /api/loans/[id]` - Loan details
- `PUT /api/loans/[id]/approve` - Admin approve
- `PUT /api/loans/[id]/reject` - Admin reject
- `POST /api/loans/[id]/repayments` - Make repayment
- `POST /api/cron/check-loan-due-dates` - Daily check

### Year-End
- `GET /api/groups/[id]/year-end` - Calculate distribution
- `POST /api/groups/[id]/year-end/distribute` - Execute distribution

### Notifications
- `GET /api/notifications` - User notifications
- `PUT /api/notifications/[id]/read` - Mark as read
- `POST /api/notifications/send` - Send notification (email + in-app)

## Component Structure

### Layout
- `DashboardLayout` - Main app layout with sidebar
- `Sidebar` - Navigation menu
- `Header` - Top bar with notifications

### UI Components
- `Button` - Primary/secondary/outline variants
- `Card` - Card with header/content/footer
- `Input` - Text input with label/error
- `Badge` - Status badges
- `Modal` - Dialog for forms

### Feature Components

#### Groups
- `GroupCard` - Summary card
- `GroupList` - Grid of groups
- `CreateGroupForm` - New group creation
- `GroupSettings` - Configure group parameters

#### Members
- `MemberList` - List with status
- `MemberCard` - Member details
- `MemberSettings` - Set contribution/payday
- `MemberStats` - Contribution history

#### Contributions
- `ContributionList` - Scheduled payments
- `ContributionForm` - Mark as paid
- `ContributionStats` - Overview metrics
- `MissedPaymentAlert` - Warning notification

#### Loans
- `LoanRequestForm` - Request with eligibility
- `EligibilityDisplay` - Show max loan amount
- `CoMakerSelector` - Filtered member list
- `LoanApprovalCard` - Admin review
- `LoanDetail` - Full loan info
- `LoanProgress` - Repayment progress bar
- `RepaymentForm` - Make payment

#### Year-End
- `DistributionReport` - Payout breakdown
- `DistributionSummary` - Overview stats
- `MemberPayoutCard` - Individual payout

## Implementation Phases

### Phase 1: Core Foundation
- Update database schema
- Set up notification system
- Create base API routes
- Business logic calculators

### Phase 2: Group & Member System
- Group creation with settings
- Member management
- Contribution schedule generator
- Member dashboard

### Phase 3: Loan System
- Loan eligibility calculator
- Loan request form
- Co-maker selection logic
- Admin approval workflow
- Loan detail page

### Phase 4: Repayment System
- Proportional repayment calculator
- Payment form
- Default detection
- Default notifications

### Phase 5: Contribution Tracking
- Contribution list
- Mark as paid functionality
- Missed payment tracking
- Auto-schedule generation

### Phase 6: Year-End Distribution
- Interest distribution calculator
- Distribution report
- Admin approval
- Notification system

### Phase 7: Polish & Testing
- Email integration
- Cron jobs (daily checks)
- Mobile responsive
- End-to-end testing

## Testing Checklist

- [ ] User can create group with custom settings
- [ ] Member can set contribution amount and payday
- [ ] Contribution schedule generates correctly
- [ ] Member can mark contribution as paid
- [ ] Missed payment detected after grace period
- [ ] Loan eligibility calculates correctly for <6 and >=6 months
- [ ] Co-maker selector shows only eligible members
- [ ] Loan request submits to pending
- [ ] Admin can approve/reject loans
- [ ] Repayments split proportionally
- [ ] Partial repayments update correctly
- [ ] Default detected after 2 months
- [ ] Default notification sent
- [ ] Interest distribution calculates correctly
- [ ] Inactive members get no interest
- [ ] Notifications (email + in-app) work
- [ ] Mobile responsive design
- [ ] All cron jobs run successfully

## Common Issues & Solutions

### Issue: Loan eligibility shows wrong amount
**Solution**: Check if active months calculation is correct. Should use joinedAt date.

### Issue: Co-maker not showing in list
**Solution**: Ensure co-maker has no active loans. Check loan status filtering.

### Issue: Missed payments not detected
**Solution**: Verify grace period is set correctly in group settings. Check cron job runs.

### Issue: Interest distribution incorrect
**Solution**: Ensure only REPAID loans contribute to total interest. Check isActive status of members.

### Issue: Partial repayment split wrong
**Solution**: Calculate ratio based on total due (principal + interest), not just principal.

## Environment Variables

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Database
DATABASE_URL=postgresql://user:password@host:5432/db

# Email (for notifications)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

## Deployment

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy
5. Run database migrations
6. Test production environment

## Support

For questions or issues, refer to:
- `RULES.md` - Business rules documentation
- `prisma/schema.prisma` - Database schema
- `README.md` - Setup instructions

---

**Last Updated**: January 2025
**Version**: 1.0
