import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/payments/[fundId] - Get all payments for a fund
export async function GET(
  request: Request,
  { params }: { params: { fundId: string } }
) {
  try {
    const { fundId } = params

    // Mock data - replace with actual database queries
    const payments = [
      {
        id: '1',
        fundId,
        amount: 1000,
        interest: 50,
        principal: 950,
        month: 1,
        year: 2025,
        note: 'January payment',
        createdAt: new Date('2025-01-15'),
      },
      {
        id: '2',
        fundId,
        amount: 1000,
        interest: 47.5,
        principal: 952.5,
        month: 2,
        year: 2025,
        note: 'February payment',
        createdAt: new Date('2025-02-15'),
      },
    ]

    return NextResponse.json({ payments })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

// POST /api/payments/[fundId] - Create new payment
export async function POST(
  request: Request,
  { params }: { params: { fundId: string } }
) {
  try {
    const { fundId } = params
    const { amount, interest, principal, month, year, note } = await request.json()

    // Mock payment creation - replace with actual database insertion
    const newPayment = {
      id: Math.random().toString(36).substr(2, 9),
      fundId,
      amount,
      interest,
      principal,
      month,
      year,
      note,
      createdAt: new Date(),
    }

    return NextResponse.json(newPayment, { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}
