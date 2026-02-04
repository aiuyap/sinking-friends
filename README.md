# Sinking Fund Platform

A collaborative savings and loan platform that helps groups pool money together, access low-interest loans, and share earnings — all while building financial discipline as a community.

**Status**: ✅ All Core Features Complete | **Last Updated**: February 2026

---

## What is a Sinking Fund?

A sinking fund (known as "paluwagan" in the Philippines) is a time-tested community savings system where groups of friends, family, or colleagues come together to:

- **Save consistently** through manageable bi-weekly contributions
- **Borrow affordably** with interest rates as low as 5% (vs. 20%+ from traditional lenders)
- **Earn together** by sharing interest from loans among active members
- **Build trust** through transparent, trackable financial cooperation

### How It Works

1. **Create or Join a Group** — Set up your sinking fund with custom rules and contribution amounts
2. **Contribute Regularly** — Add money every two weeks based on your personal payday schedule
3. **Borrow When Needed** — Request loans up to your eligible limit with co-maker support
4. **Repay on Time** — Pay back over 2 months with affordable installments
5. **Share the Rewards** — Active members receive their contributions back plus a share of earned interest at year-end

**Perfect for:**
- Families saving for future expenses
- Friend groups building emergency funds
- Colleagues creating workplace savings circles
- Communities seeking alternatives to high-interest lenders

---

## Key Features

### 🏦 Smart Loan System
- **Dynamic Eligibility** — Loan limits grow with your contribution history
- **Fair Interest Rates** — 5% for members, 10% for non-members (group-configurable)
- **Co-Maker Protection** — Larger loans backed by trusted group members
- **Flexible Repayments** — Pay in full or partial amounts that split proportionally between principal and interest

### 📅 Automated Contribution Tracking
- **Personalized Schedules** — Each member sets their own bi-weekly payday
- **Grace Periods** — 7-day buffer for unexpected delays
- **Smart Reminders** — Email and in-app notifications before due dates
- **Activity Status** — Track eligibility for year-end interest sharing

### 📊 Transparent Financial Management
- **Real-Time Dashboard** — See your groups, loans, and contributions at a glance
- **Year-End Distribution** — Automated calculation of interest shares based on contribution history
- **Complete History** — Full record of all transactions and payments
- **Admin Controls** — Group creators can manage settings, approve loans, and oversee distributions

### 🔔 Intelligent Notifications
- **Multi-Channel Alerts** — Email and in-app notifications
- **Smart Timing** — Reminders before due dates, alerts for missed payments
- **Status Updates** — Instant notifications for loan approvals, repayments, and defaults

### 🎨 Beautiful, Accessible Design
- **Modern Ledger Aesthetic** — Clean, sophisticated interface inspired by financial editorial design
- **Fully Responsive** — Works seamlessly on desktop, tablet, and mobile
- **Accessible** — WCAG AA compliant with high contrast and keyboard navigation
- **Smooth Interactions** — Delightful animations and responsive feedback

---

## Business Rules Made Simple

### Loan Eligibility

| Your Time in Group | Maximum Loan Amount |
|-------------------|-------------------|
| **Less than 6 months** | Lower of: Monthly Contribution or 50% of your average annual savings |
| **6 months or more** | Higher of: Monthly Contribution or 50% of your average annual savings |

*Example: Contributing ₱2,000 bi-weekly for 6 months could qualify you for up to ₱48,000*

### Co-Maker System
- Required for loans exceeding your monthly contribution
- Your co-maker must be an active group member with no outstanding loans
- Co-makers share responsibility for repayment
- Protects the group while enabling larger loans

### Interest & Earnings
- **Member Loans**: 5% monthly interest (10% total for 2-month term)
- **Non-Member Loans**: 10% monthly interest (20% total for 2-month term)
- **Year-End Distribution**: Active members receive contributions + proportional share of all interest earned
- **Inactive Members**: Receive contributions back only (no interest share)

### Staying Active
- Make payments within the 7-day grace period
- 3 consecutive missed payments = inactive status
- One payment resets your consecutive missed counter to zero

---

## Technology Behind the Platform

Built with modern, reliable technologies to ensure security, performance, and scalability:

- **Frontend**: [Next.js 15](https://nextjs.org/) + [React 18](https://react.dev/) — Fast, modern web experience
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) — Beautiful, responsive design system
- **Authentication**: [Firebase Auth](https://firebase.google.com/products/auth) — Secure Google sign-in
- **Database**: [PostgreSQL](https://www.postgresql.org/) + [Supabase](https://supabase.com/) — Reliable, scalable data storage
- **Animations**: [Framer Motion](https://www.framer.com/motion/) — Smooth, delightful interactions

---

## Design Philosophy

Our interface follows a "Modern Ledger" aesthetic — blending the trustworthiness of traditional financial records with contemporary design:

### Color Palette
- **Cream** (#F6F5EC) — Warm, approachable background
- **Sage Green** (#6B8E6B) — Growth, prosperity, action
- **Terracotta** (#C4956A) — Attention, warmth, secondary actions
- **Charcoal** (#1A1A1A) — Professional, high-contrast text

### Typography
- **DM Serif Display** — Elegant headers that convey trust
- **Inter** — Clean, readable body text
- **JetBrains Mono** — Precise financial figures

---

## Getting Started

### For Group Creators

1. **Sign Up** — Create an account with your Google email
2. **Create Your Group** — Set name, contribution amounts, interest rates, and term dates
3. **Invite Members** — Send invitation links via email or messaging
4. **Configure Settings** — Adjust grace periods, year-end dates, and loan terms
5. **Start Saving** — Members join, set their paydays, and begin contributing

### For Members

1. **Accept Invitation** — Click the invitation link and sign in
2. **Set Your Schedule** — Choose your bi-weekly contribution amount and payday
3. **Start Contributing** — Mark contributions as paid on your scheduled dates
4. **Borrow When Needed** — Check your eligibility and request loans with co-maker support
5. **Track Progress** — Monitor your contributions, loans, and year-end projections

---

## Project Status

### ✅ MVP Complete — All Core Features Working

- ✅ Google Authentication with secure cookies
- ✅ Group creation with full configuration
- ✅ Member invitations and management
- ✅ Bi-weekly contribution scheduling
- ✅ Dynamic loan eligibility calculator
- ✅ Co-maker system with availability filtering
- ✅ Loan request and approval workflow
- ✅ Proportional repayment tracking
- ✅ Missed payment detection with grace periods
- ✅ Default handling and notifications
- ✅ Year-end interest distribution
- ✅ Email and in-app notification system
- ✅ Toast notifications throughout
- ✅ Fully responsive mobile design

### Recent Enhancements (February 2026)

- ⭐ **Enhanced Group Creation** — Full configuration during setup
- ⭐ **Redesigned Loan Request** — Visual slider, progress bar, and lazy co-maker loading
- ⭐ **Toast Notifications** — Replaced all browser alerts with elegant toast messages
- ⭐ **Improved Settings** — Better admin access and group management
- ⭐ **Polished UI** — Fixed scrollbars and improved modal experience

### Future Roadmap

- 📊 Charts and analytics dashboards
- 📱 Mobile app (iOS/Android)
- 💱 Multi-currency support
- 📄 Export to PDF/Excel
- 🌙 Dark mode
- 🗳️ Group voting on decisions

---

## Documentation

- **[RULES.md](./RULES.md)** — Complete user guide with FAQs
- **[AGENTS.md](./AGENTS.md)** — Developer guidelines and code standards
- **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** — Firebase configuration guide

---

## Support

### Need Help?

- 📖 Read the [FAQ in RULES.md](./RULES.md#frequently-asked-questions)
- 🐛 Report issues on GitHub
- 📧 Contact your group admin for account-specific questions

---

## Built With ❤️

For communities everywhere who believe in building wealth together through trust, transparency, and mutual support.

**Version 1.0** • *February 2026*  
*All Core Features Complete & Ready for Communities Worldwide*

---

*License: MIT*
