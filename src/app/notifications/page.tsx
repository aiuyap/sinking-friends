'use client';

import React, { useState, useEffect } from 'react';
import { NotificationList, Notification } from '@/components/notifications/NotificationList';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export default function NotificationCenterPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Mock notifications fetching - replace with real API call
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // TODO: Replace with actual API call
        const mockNotifications: Notification[] = [
          {
            id: '1',
            type: 'LOAN_APPROVED',
            title: 'Loan Approved',
            message: 'Your loan request for $1,500 has been approved.',
            actionUrl: '/groups/group1/loans/loan1',
            createdAt: new Date('2024-02-01T10:30:00'),
            isRead: false
          },
          {
            id: '2',
            type: 'CONTRIBUTION_DUE',
            title: 'Contribution Reminder',
            message: 'Your bi-weekly contribution of $100 is due soon.',
            actionUrl: '/groups/group1/contributions',
            createdAt: new Date('2024-01-31T15:45:00'),
            isRead: true
          },
          {
            id: '3',
            type: 'LOAN_DUE_SOON',
            title: 'Loan Payment Approaching',
            message: 'Your loan payment of $250 is due on February 15th.',
            actionUrl: '/groups/group1/loans/loan2',
            createdAt: new Date('2024-01-29T09:15:00'),
            isRead: false
          }
        ];

        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div className="container mx-auto p-4">
      <NotificationList 
        notifications={notifications} 
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
    </div>
  );
}