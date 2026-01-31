import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const funds = [
      {
        id: '1',
        name: 'Emergency Fund',
        memberName: 'John Doe',
        amount: 15000,
        groupId: id,
      },
      {
        id: '2',
        name: 'Car Savings',
        memberName: 'Jane Doe',
        amount: 25000,
        groupId: id,
      },
    ]

    return NextResponse.json({ funds })
  } catch (error) {
    console.error('Error fetching funds:', error)
    return NextResponse.json({ error: 'Failed to fetch funds' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { name, memberName, amount } = await request.json()

    const newFund = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      memberName,
      amount: amount || 0,
      groupId: id,
      createdAt: new Date(),
    }

    return NextResponse.json(newFund, { status: 201 })
  } catch (error) {
    console.error('Error creating fund:', error)
    return NextResponse.json({ error: 'Failed to create fund' }, { status: 500 })
  }
}
