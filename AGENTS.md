# AGENTS.md

Agent guidelines for the Sinking Fund Platform repository.

## Build & Development Commands

```bash
# Development
npm run dev              # Start development server on localhost:3000

# Build & Production
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint (Next.js built-in)

# Database (Prisma)
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema changes to database
npm run db:migrate       # Run database migrations
npm run db:studio        # Open Prisma Studio GUI
```

**Note**: No test framework is currently configured.

## Technology Stack

- **Framework**: Next.js 15 (App Router) + React 18
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS 3.4 with custom design system
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Firebase Auth (Google OAuth)
- **UI**: Framer Motion for animations, Lucide React for icons

## Code Style Guidelines

### Imports

- Use `@/*` path alias for all internal imports (e.g., `@/components/ui/Button`)
- Group imports: 1) React/Next, 2) External libraries, 3) Internal modules, 4) Types
- Use `type` keyword for type-only imports

```typescript
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import type { PaymentHistoryItem } from '@/types/payment'
```

### Formatting

- **Quotes**: Single quotes for strings
- **Semicolons**: Optional (not used in this codebase)
- **Indentation**: 2 spaces
- **Line length**: ~100 characters (soft limit)
- **Trailing commas**: Use in multi-line objects/arrays

### Naming Conventions

- **Components**: PascalCase (e.g., `DashboardLayout`, `LoanCard`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth`, `useToast`)
- **Functions**: camelCase (e.g., `formatCurrency`, `calculateLoanAmount`)
- **Variables**: camelCase (e.g., `isLoading`, `userData`)
- **Types/Interfaces**: PascalCase (e.g., `PaymentHistoryItem`, `LoanStatus`)
- **Database models**: PascalCase matching Prisma schema

### TypeScript

- Enable strict mode (configured in tsconfig.json)
- Always type function parameters and return types for exported functions
- Use interfaces for object shapes, type for unions/aliases
- Use explicit types for API route handlers

### React Components

- Use functional components with hooks
- Client components must include `'use client'` directive at top
- Server components are default (no directive needed)
- Use `React.FC` sparingly; prefer explicit props typing

### Styling (Tailwind CSS)

- Use `cn()` utility from `@/lib/utils` for conditional classes
- Follow existing custom color palette:
  - Background: `cream` (#F6F5EC)
  - Primary: `sage` (#6B8E6B)
  - Secondary: `terracotta` (#C4956A)
  - Text: `charcoal` (#1A1A1A)

### Error Handling

- Use try-catch for async operations
- Log errors to console with descriptive messages
- Return appropriate HTTP status codes in API routes
- Use toast notifications for user-facing errors (via `useToast()`)

### API Routes

- Use Next.js App Router convention: `app/api/[route]/route.ts`
- Export HTTP method handlers (GET, POST, PUT, DELETE)
- Always validate authentication using `getCurrentUser()`
- Use Prisma for database operations

### File Organization

```
src/
  app/              # Next.js App Router pages
  components/       # React components
    ui/             # Reusable UI components
    layout/         # Layout components
    features/       # Feature-specific components
  lib/              # Utility functions, configs
  hooks/            # Custom React hooks
  types/            # TypeScript type definitions
```

## Environment Variables

Required variables (see `.env`):
- `NEXT_PUBLIC_FIREBASE_*` - Firebase configuration
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` / `NEXTAUTH_URL` - Auth configuration

## Important Business Logic

### Loan Eligibility Calculator (Updated February 2026)

```typescript
function calculateMaxLoanAmount(member: GroupMember): number {
  const activeMonths = getMonthsActive(member.joinedAt)
  
  if (activeMonths < 6) {
    // Less than 6 months: Total contributions made so far
    return member.totalContributions
  } else {
    // 6 months or more: 50% of annual savings
    // Annual = bi-weekly × 24
    const annualSavings = member.biWeeklyContribution * 24
    return annualSavings * 0.5
  }
}
```

**Rules:**
- **< 6 months**: Total contributions made so far
- **≥ 6 months**: 50% of annual savings (bi-weekly × 24)

---

Last updated: February 2026
