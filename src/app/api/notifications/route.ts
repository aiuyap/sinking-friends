import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/notifications - Get user notifications
export async function GET(request: Request) {
  try {
    // Get user from auth header
    const userId = request.headers.get('x-user-id') || 'mock-user-id'

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// PUT /api/notifications/[id]/read - Mark notification as read
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const notificationId = params.id

    // Get user from auth header
    const userId = request.headers.get('x-user-id') || 'mock-user-id'

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    if (notification.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    })

    return NextResponse.json({ notification })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    )
  }
}

// POST /api/notifications/send - Send notification
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, type, title, message, actionUrl } = body

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        actionUrl,
      },
    })

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}
