# Sinking Fund Platform

A collaborative platform for managing sinking funds, tracking payments and interest, and achieving financial goals together with friends and family.

## Features

- **Google Authentication** - Secure login with Google accounts
- **Group Management** - Create sinking fund groups and invite members
- **Fund Tracking** - Track loans/savings for each member
- **Payment Management** - Record payments with separate interest and principal tracking
- **Configurable Interest Rates** - Set custom interest rates per group
- **Real-time Balance Updates** - Automatic balance calculations
- **Beautiful UI** - Light theme with sophisticated sage and terracotta accents

## Tech Stack

- **Frontend**: Next.js 14 + React + TypeScript + Tailwind CSS
- **Authentication**: Firebase Auth (Google OAuth)
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Firebase project

### Installation

1. **Clone the repository**
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

# NextAuth
NEXTAUTH_SECRET=your_random_secret_key
NEXTAUTH_URL=http://localhost:3000
```

4. **Set up the database**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# Or run migrations
npm run db:migrate
```

5. **Run the development server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
sinking-fund-platform/
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── app/                # Next.js app router
│   │   ├── api/           # API routes
│   │   ├── dashboard/     # Dashboard page
│   │   ├── groups/        # Group management
│   │   ├── invite/        # Invitation acceptance
│   │   ├── globals.css    # Global styles
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Landing page
│   ├── components/
│   │   ├── ui/            # UI components (Button, Card, etc.)
│   │   ├── layout/        # Layout components (Sidebar, Header)
│   │   ├── auth/          # Authentication components
│   │   ├── groups/        # Group-related components
│   │   └── funds/         # Fund-related components
│   ├── lib/
│   │   ├── firebase.ts    # Firebase configuration
│   │   ├── prisma.ts      # Prisma client
│   │   ├── supabase.ts    # Supabase client
│   │   └── utils.ts       # Utility functions
│   └── hooks/
│       └── useAuth.ts     # Authentication hook
├── .env.example
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Design System

### Colors
- **Primary**: `#F6F5EC` (Warm Cream)
- **Accent**: `#6B8E6B` (Sage Green)
- **Secondary**: `#C4956A` (Terracotta)
- **Text**: `#1A1A1A` (Charcoal)

### Typography
- **Display**: DM Serif Display
- **Body**: Inter
- **Monospace**: JetBrains Mono (for financial data)

### Key Features
- Light theme with sophisticated color palette
- Card-based layout with subtle shadows
- Animated transitions and micro-interactions
- Responsive design for all devices

## API Routes

- `GET /api/dashboard` - Get user dashboard data
- `GET /api/groups` - List user's groups
- `POST /api/groups` - Create new group
- `GET /api/groups/[id]` - Get group details
- `POST /api/groups/[id]/invite` - Invite member
- `GET /api/groups/[id]/funds` - List group funds
- `POST /api/groups/[id]/funds` - Create fund
- `GET /api/invites/[token]` - Validate invitation
- `POST /api/invites/accept` - Accept invitation
- `GET /api/payments/[fundId]` - Get fund payments
- `POST /api/payments/[fundId]` - Record payment

## Database Schema

See `prisma/schema.prisma` for complete schema definition.

Key models:
- **User** - User accounts linked to Google Auth
- **Group** - Sinking fund groups
- **GroupMember** - Group membership with roles (ADMIN/MEMBER)
- **Invite** - Invitation tokens for joining groups
- **Fund** - Individual funds/loans within groups
- **Payment** - Payment records with interest and principal

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set all environment variables in your hosting platform:
- Database URL
- Firebase configuration
- NextAuth secret

## Roadmap

### MVP (Current)
- ✅ Google Authentication
- ✅ Group creation and management
- ✅ Member invitations
- ✅ Fund tracking
- ✅ Payment recording (principal + interest)
- ✅ Dashboard overview

### v2 (Future)
- [ ] Excel/CSV export
- [ ] Charts and visualizations
- [ ] Payment reminders
- [ ] Email notifications
- [ ] Mobile app
- [ ] Dark mode

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For support or questions, please open an issue on GitHub.

---

Built with ❤️ for collaborative wealth management
