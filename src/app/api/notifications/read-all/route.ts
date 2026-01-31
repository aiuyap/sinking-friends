import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyIdToken } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.split('Bearer ')[1] || 
                req.headers.get('x-auth-token');
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify token
    const decodedToken = await verifyIdToken(token);
    const userId = decodedToken.uid;

    // Update all unread notifications for this user
    const result = await prisma.notification.updateMany({
      where: { 
        userId, 
        isRead: false 
      },
      data: { 
        isRead: true 
      }
    });

    return NextResponse.json({ 
      message: 'All notifications marked as read', 
      updatedCount: result.count 
    });

  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}