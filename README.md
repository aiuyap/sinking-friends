# Sinking Fund Platform

A collaborative savings and loan platform where groups pool money together through bi-weekly contributions, members can borrow against pooled funds with interest, and active members receive proportional interest share at year-end.

**Last Updated**: February 2, 2026  
**Status**: ✅ All Core Features Complete  
**Build Status**: ✅ PASSING

---

## What is a Sinking Fund?

A sinking fund is a **collaborative savings system** (known in the Philippines as "paluwagan") where:

- Members pool their money through regular bi-weekly contributions
- Members can borrow against pooled money with co-maker support
- Loans accrue interest (5% for members, 10% for non-members)
- Active members share interest earned from loans at year-end
- Everyone gets their contributions back (plus interest share if active)

**Perfect for:**
- Groups of friends, family, or colleagues
- Building financial discipline together
- Accessing low-interest loans
- Earning interest through collective savings

---

## Features

### Core Functionality
- **Google Authentication** - Secure login with Google accounts
- **Bi-Weekly Contributions** - Personalized contribution schedules based on individual paydays
- **Loan Eligibility Calculator** - Dynamic limits based on contribution history and time in group
- **Co-Maker System** - Joint liability for larger loans
- **Loan Approval Workflow** - Admin review and approval process
- **Proportional Repayments** - Split between principal and interest
- **Missed Payment Tracking** - Grace periods and consecutive missed counter
- **Year-End Distribution** - Interest share calculated proportionally
- **Default Handling** - Auto-detection and notifications

### Member Management
- **Contribution Scheduling** - Auto-generate bi-weekly payment dates
- **Payday Customization** - Each member sets their own schedule
- **Active/Inactive Status** - Eligibility tracking for interest share
- **Contribution History** - Complete record of all payments

### Loan System
- **Loan Request Form** - Shows eligible amount with calculation breakdown
- **Co-Maker Selection** - Filters members with no active loans
- **Interest Rate Configuration** - Per group (members 5%, non-members 10%)
- **2-Month Fixed Term** - Consistent repayment schedule
- **Partial Repayments** - Flexible payment options
- **Default Detection** - Auto-notification after 2 months past-due

### Notifications
- **Email + In-App** - Dual notification system
- **Contribution Reminders** - 2 days before scheduled date
- **Missed Payment Alerts** - After grace period expiration
- **Loan Status Updates** - Approved, repaid, defaulted notifications
- **Year-End Notifications** - Distribution breakdown and payout

### Design & UX
- **Modern Ledger Aesthetic** - Sophisticated editorial-inspired interface
- **Light Theme** - Warm cream (#F6F5EC) with sage green and terracotta accents
- **Responsive Design** - Works seamlessly on all devices
- **Smooth Animations** - Framer Motion for delightful interactions
- **Accessible** - WCAG AA compliant with high contrast

---

## Business Rules Summary

### Loan Eligibility

| Time in Group | Maximum Loan |
|---------------|---------------|
| **Less than 6 months** | MIN(Monthly Contribution, 50% of Avg Annual Savings) |
| **6 months or more** | MAX(Monthly Contribution, 50% of Avg Annual Savings) |

**Where:**
- Monthly Contribution = Bi-weekly × 2
- Avg Annual Savings = (Total Contributions ÷ Active Months) × 12

### Co-Maker Rules
- Required for loans > monthly contribution amount
- Co-maker cannot have active loans
- Co-maker blocked from borrowing until loan is repaid
- Co-maker jointly liable for repayment

### Interest Rates
- **Members**: 5% per month (configurable per group)
- **Non-Members**: 10% per month (configurable per group)
- Fixed term: 2 months

### Repayment Rules
- Can pay fully or partially
- Partial payments split proportionally (principal + interest)
- Example: ₱55,000 total (₱50K + ₱5K interest), pay ₱20,000 → ₱18,182 principal + ₱1,818 interest

### Missed Payments
- **Grace Period**: 7 days after scheduled date
- After grace period → Marked as missed, increment consecutive counter
- **3 Consecutive Missed** → Set inactive (no interest share)
- Payment made → Reset counter to 0

### Loan Defaults
- After 2 months past due → Mark as DEFAULTED
- Notify borrower and admin via email + in-app
- Disable borrower's future loans
- Co-maker remains jointly liable

### Year-End Distribution
- **Active Members**: Contributions + Proportional interest share
- **Inactive Members**: Contributions only (no interest)
- Interest Share = (Member Contributions ÷ Total Pool) × Total Interest Earned
- Distribution Date: December 20-24 (configurable per group)

---

## Tech Stack

- **Frontend**: Next.js 15 + React 18 + TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Authentication**: Firebase Auth (Google OAuth)
- **Database**: PostgreSQL with Prisma ORM
- **Animations**: Framer Motion
- **Notifications**: Email + In-app alerts

---

## Design System

### Color Palette
```css
--color-cream: #F6F5EC (Primary background)
--color-sage: #6B8E6B (Accent - CTAs, highlights)
--color-terracotta: #C4956A (Secondary - alerts, warnings)
--color-charcoal: #1A1A1A (Text - high contrast)
```

### Typography
- **Display**: DM Serif Display (sophisticated, financial)
- **Body**: Inter (readable, clean)
- **Monospace**: JetBrains Mono (tabular-nums for financial data)

### Design Aesthetic
- Modern Ledger style - Editorial-inspired, clean, refined
- Card-based layouts with subtle top border accents
- Generous spacing (16px-24px)
- Soft shadows (no harsh outlines)
- Hover lift effects for interactivity

---

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Firebase project
- SMTP email server (for notifications)

### Installation

1. **Clone repository**
```bash
cd /Users/irine/Documents/Aiu/sinking-friends
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/sinking_fund_db"

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Email (for notifications)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASSWORD=your_password
SMTP_FROM=noreply@sinkingfund.com

# NextAuth
NEXTAUTH_SECRET=your_random_secret_key
NEXTAUTH_URL=http://localhost:3000
```

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Google Authentication** in Authentication → Sign-in method
4. Add authorized domain: `localhost:3000`
5. Go to **Project Settings** → **Your apps** → **Web (</>)**
6. Register your app and copy `firebaseConfig`
7. Paste values into `.env.local`

### Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# Or run migrations (recommended for production)
npm run db:migrate
```

### Running the App

```bash
# Development server
npm run dev

# Visit http://localhost:3000
```

---

## Project Structure

```
sinking-fund-platform/
├── prisma/
│   └── schema.prisma           # Complete database schema
├── SKILLS/                        # Skill documentation
│   ├── SKILLS.md                # Skills index
│   └── frontend-design.md        # Frontend design skill
├── src/
│   ├── app/                     # Next.js app router
│   │   ├── api/               # API routes
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── groups/
│   │   │   ├── loans/
│   │   │   ├── contributions/
│   │   │   ├── notifications/
│   │   │   └── cron/
│   │   ├── dashboard/          # Dashboard page
│   │   ├── groups/             # Group management pages
│   │   │   ├── new/
│   │   │   └── [id]/
│   │   ├── invite/             # Invitation acceptance
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── ui/                # UI components (Button, Card, Input, etc.)
│   │   ├── layout/            # Layout components (Sidebar, Header)
│   │   ├── groups/             # Group-related components
│   │   ├── members/            # Member management components
│   │   ├── contributions/       # Contribution tracking components
│   │   ├── loans/             # Loan system components
│   │   └── notifications/       # Notification components
│   ├── lib/
│   │   ├── firebase.ts         # Firebase configuration
│   │   ├── prisma.ts          # Prisma client
│   │   ├── utils.ts           # Utility functions
│   │   ├── calculators/        # Business logic calculators
│   │   └── email.ts           # Email notification service
│   └── hooks/
│       └── useAuth.ts         # Authentication hook
├── AGENT.md                    # Implementation guide for agents
├── RULES.md                    # User-facing rules documentation
├── FIREBASE_SETUP.md           # Firebase setup instructions
├── .env.example
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## API Routes

### Authentication
- `POST /api/auth/google` - Google sign-in

### Dashboard
- `GET /api/dashboard` - User dashboard stats (groups, loans, contributions)

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
- `POST /api/cron/check-missed-payments` - Daily missed payment check

### Loans
- `GET /api/groups/[id]/loans` - List loans
- `POST /api/groups/[id]/loans` - Request loan
- `GET /api/loans/[id]` - Loan details
- `PUT /api/loans/[id]/approve` - Admin approve
- `PUT /api/loans/[id]/reject` - Admin reject
- `POST /api/loans/[id]/repayments` - Make repayment
- `POST /api/cron/check-loan-due-dates` - Daily loan due date check

### Year-End
- `GET /api/groups/[id]/year-end` - Calculate distribution
- `POST /api/groups/[id]/year-end/distribute` - Execute distribution

### Notifications
- `GET /api/notifications` - User notifications
- `PUT /api/notifications/[id]/read` - Mark as read
- `POST /api/notifications/send` - Send notification (email + in-app)

---

## Database Schema

See `prisma/schema.prisma` for complete schema definition.

### Key Models

- **User** - User accounts linked to Google Auth
- **Group** - Sinking fund groups with settings (loan rates, term, grace period)
- **GroupSettings** - Group-level configuration (grace period, year-end date)
- **GroupMember** - Membership with contribution amount, payday, status tracking
- **Loan** - Loans with borrower, co-maker, repayment tracking
- **CoMaker** - Joint liability for loans
- **Contribution** - Bi-weekly payment tracking with grace period
- **LoanRepayment** - Repayment records with proportional split
- **Notification** - Email + in-app alerts

---

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
  
  return { maxLoan, monthlyContribution, avgAnnualSavings, activeMonths }
}
```

### Proportional Repayment Calculator
```typescript
function calculateRepayment(loan: Loan, paymentAmount: Float): RepaymentSplit {
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
        totalPayout: memberContributions
      }
    }
    
    // Active: proportional interest share
    const contributionPercent = memberContributions / totalPool
    const interestShare = totalInterestEarned * contributionPercent
    
    return {
      memberId: member.id,
      contributionAmount: memberContributions,
      interestShare,
      totalPayout: memberContributions + interestShare
    }
  })
}
```

---

## Documentation

### For Users
- **[RULES.md](RULES.md)** - Comprehensive user guide covering:
  - What is a Sinking Fund
  - How it works
  - Membership, contribution, loan, co-maker rules
  - Repayment and penalty rules
  - Year-end distribution
  - Frequently asked questions

### For Developers/Agents
- **[AGENT.md](AGENT.md)** - Implementation guide including:
  - Complete business logic functions
  - Database schema details
  - API routes breakdown
  - Component structure
  - Testing checklist
  - Common issues & solutions

- **[SKILLS/SKILLS.md](SKILLS/SKILLS.md)** - Available skills for agents
- **[SKILLS/frontend-design.md](SKILLS/frontend-design.md)** - Frontend design guidance

---

## Deployment

### Deploy to Vercel

1. **Push code to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Connect repository to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import from GitHub

3. **Add environment variables** in Vercel dashboard
   - DATABASE_URL
   - Firebase configuration
   - SMTP credentials
   - NEXTAUTH_SECRET

4. **Deploy!** Vercel handles build and deployment automatically

### Environment Variables for Production

Make sure to set all environment variables in your hosting platform:
- Database URL (PostgreSQL connection string)
- Firebase configuration (API key, project ID, etc.)
- SMTP email credentials
- NextAuth secret

### Post-Deployment

1. Run database migrations
2. Verify Firebase authentication works
3. Test email notifications
4. Set up cron jobs (daily checks)
5. Monitor logs for errors

---

## Roadmap

### MVP ✅ COMPLETE
All core features have been implemented and are working:

- ✅ **Google Authentication** - Secure Firebase Auth with cookies
- ✅ **Group creation and management** - Full CRUD with complete configuration
- ✅ **Member invitations** - Email-based invitation system
- ✅ **Bi-weekly contribution system** - Personalized schedules based on payday
- ✅ **Loan eligibility calculator** - Dynamic limits based on time in group
- ✅ **Loan request form** - Card-based design with slider and lazy co-maker loading
- ✅ **Co-maker system** - Joint liability with availability filtering
- ✅ **Loan approval workflow** - Admin review and approval process
- ✅ **Proportional repayments** - Split between principal and interest
- ✅ **Missed payment tracking** - Grace periods and consecutive missed counter
- ✅ **Default detection** - Auto-detection after 2 months past-due
- ✅ **Year-end distribution** - Proportional interest share calculation
- ✅ **Email + in-app notifications** - Dual notification system
- ✅ **Toast notification system** - Replaced all alerts with non-blocking toasts
- ✅ **Responsive design** - Mobile-first, works on all devices

### Recent Enhancements (Feb 2, 2026)
- ⭐ **Enhanced Group Creation** - Full configuration during creation (interest rates, term, grace period, year-end date)
- ⭐ **Loan Request Form Redesign** - Card-based layout, amount slider, lazy co-maker loading, progress bar
- ⭐ **Toast Notifications** - Replaced all 11 `alert()` calls with toast system
- ⭐ **Settings Page Fix** - Fixed admin access with real API data
- ⭐ **Modal UX Improvement** - Fixed double scrollbar issue

### v2 (Future Ideas)
- [ ] Charts and visualizations (contribution trends, loan analytics)
- [ ] Advanced analytics (member performance, group health metrics)
- [ ] Multi-currency support
- [ ] Export to Excel/CSV/PDF
- [ ] Mobile app (React Native or PWA)
- [ ] Dark mode toggle
- [ ] Group voting on decisions
- [ ] Audit logs for all transactions
- [ ] Advanced loan terms (3, 6 months options)
- [ ] Automatic bank integration for contributions

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Testing

All core features have been tested and are working. Build verification:

```
✅ TypeScript compilation: PASS
✅ Production build: PASS  
✅ Zero errors
✅ All 18 static pages generated
✅ All 23 dynamic routes functional
```

### Testing Checklist - All Complete ✅

- [x] All tests pass (`npm test`)
- [x] Linting passes (`npm run lint`)
- [x] TypeScript compilation succeeds
- [x] Code follows design system guidelines
- [x] All business rules are correctly implemented
- [x] Mobile responsive design verified
- [x] Accessibility standards met (WCAG AA)
- [x] Toast notifications work correctly
- [x] Loan request form with slider tested
- [x] Lazy co-maker loading verified
- [x] Group creation with full config tested
- [x] Settings page admin access verified

---

## Troubleshooting

### Common Issues

**Issue: Firebase authentication not working**
- Check API key and project ID in `.env.local`
- Verify authorized domain includes your localhost/production URL
- Check Firebase console for authentication status

**Issue: Database connection errors**
- Verify DATABASE_URL is correct
- Ensure PostgreSQL is running
- Check database credentials

**Issue: Loan eligibility calculation seems wrong**
- Verify member's joinedAt date
- Check totalContributions is up-to-date
- Ensure activeMonths calculation is correct

**Issue: Notifications not sending**
- Verify SMTP credentials
- Check email spam folder
- Review error logs

---

## License

MIT License - see LICENSE file for details

---

## Support

### Documentation
- [User Rules](RULES.md) - How sinking fund works
- [Firebase Setup](FIREBASE_SETUP.md) - Step-by-step Firebase guide
- [Agent Guide](AGENT.md) - Implementation instructions
- [Frontend Design](SKILLS/frontend-design.md) - Design guidelines

### Getting Help
- Open an issue on GitHub
- Contact admin support (for production users)
- Read [FAQ section in RULES.md](RULES.md#frequently-asked-questions)

---

**Built with ❤️ for collaborative wealth management**

*Version 1.0 • Last Updated February 2, 2026*  
*Status: 🎉 All Core Features Complete & Ready for Production*
