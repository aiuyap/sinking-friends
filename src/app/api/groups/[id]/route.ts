import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/groups/[id] - Get group details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Mock data - replace with actual database queries
    const group = {
      id,
      name: 'Family Savings',
      description: 'Saving for family expenses',
      interestRate: 5,
      isAdmin: true,
    }

    const funds = [
      {
        id: '1',
        name: 'Emergency Fund',
        memberName: 'John Doe',
        amount: 15000,
      },
      {
        id: '2',
        name: 'Car Savings',
        memberName: 'Jane Doe',
        amount: 25000,
      },
    ]

    const members = [
      {
        id: '1',
        role: 'ADMIN',
        user: {
          name: 'John Doe',
          email: 'john@example.com',
          image: null,
        },
      },
      {
        id: '2',
        role: 'MEMBER',
        user: {
          name: 'Jane Doe',
          email: 'jane@example.com',
          image: null,
        },
      },
    ]

    return NextResponse.json({ group, funds, members })
  } catch (error) {
    console.error('Error fetching group:', error)
    return NextResponse.json(
      { error: 'Failed to fetch group' },
      { status: 500 }
    )
  }
}
