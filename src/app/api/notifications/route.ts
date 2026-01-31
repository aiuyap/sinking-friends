import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id') || 'mock-user-id'

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id') || 'mock-user-id'
    const body = await request.json()
    const { type, title, message, actionUrl } = body

    const notification = await prisma.notification.create({
      data: {
        userId,
        type: type || 'GENERAL',
        title,
        message,
        actionUrl,
      },
    })

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
  }
}
