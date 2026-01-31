import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/dashboard - Get user dashboard data
export async function GET(request: Request) {
  try {
    // In a real app, get user from session
    // For now, return mock data
    const groups = [
      {
        id: '1',
        name: 'Family Savings',
        description: 'Saving for family expenses',
        role: 'ADMIN',
        memberCount: 5,
        interestRate: 5,
      },
      {
        id: '2', 
        name: 'Vacation Fund',
        description: 'Trip to Japan 2025',
        role: 'MEMBER',
        memberCount: 3,
        interestRate: 3,
      },
    ]

    const stats = {
      totalBalance: 45250,
      totalGroups: 2,
      totalMembers: 8,
      pendingInvites: 1,
    }

    return NextResponse.json({ groups, stats })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
