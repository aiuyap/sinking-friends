'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { NotificationList, Notification } from '@/components/notifications/NotificationList';
import { Bell, CheckCheck, Inbox } from 'lucide-react';

// Mock notifications for demo
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'LOAN_APPROVED',
    title: 'Loan Approved',
    message: 'Your loan request for $15,000 has been approved. The funds will be available soon.',
    actionUrl: '/groups/1/loans/1',
    createdAt: new Date('2026-02-01T10:30:00'),
    isRead: false
  },
  {
    id: '2',
    type: 'CONTRIBUTION_DUE',
    title: 'Contribution Reminder',
    message: 'Your bi-weekly contribution of $2,500 is due in 2 days.',
    actionUrl: '/groups/1/contributions',
    createdAt: new Date('2026-02-01T08:00:00'),
    isRead: false
  },
  {
    id: '3',
    type: 'LOAN_DUE_SOON',
    title: 'Loan Payment Approaching',
    message: 'Your loan payment of $8,250 is due on February 15th.',
    actionUrl: '/groups/1/loans/2',
    createdAt: new Date('2026-01-31T15:45:00'),
    isRead: true
  },
  {
    id: '4',
    type: 'CONTRIBUTION_MISSED',
    title: 'Missed Contribution',
    message: 'Bob Johnson missed their contribution on January 30th.',
    actionUrl: '/groups/1/contributions',
    createdAt: new Date('2026-01-31T09:00:00'),
    isRead: true
  },
  {
    id: '5',
    type: 'YEAR_END_DISTRIBUTION',
    title: 'Year-End Distribution Reminder',
    message: 'The year-end distribution is scheduled for December 20, 2026. Ensure all loans are settled.',
    actionUrl: '/groups/1/year-end',
    createdAt: new Date('2026-01-29T09:15:00'),
    isRead: true
  },
  {
    id: '6',
    type: 'LOAN_REPAID',
    title: 'Loan Fully Repaid',
    message: 'Alice Brown has fully repaid their loan of $5,000. Thank you for your prompt payment!',
    actionUrl: '/groups/1/loans/3',
    createdAt: new Date('2026-01-28T14:30:00'),
    isRead: true
  }
];

export default function NotificationCenterPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
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

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <DashboardLayout title="Notifications">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Notifications">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl text-charcoal">Notifications</h1>
            <p className="text-charcoal-muted">
              {unreadCount > 0 
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                : 'All caught up!'
              }
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark All as Read
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-sage-dim rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-sage" />
              </div>
              <div>
                <p className="text-sm text-charcoal-muted">Unread</p>
                <p className="font-display text-xl text-charcoal">{unreadCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-terracotta-dim rounded-lg flex items-center justify-center">
                <Inbox className="w-5 h-5 text-terracotta" />
              </div>
              <div>
                <p className="text-sm text-charcoal-muted">Total</p>
                <p className="font-display text-xl text-charcoal">{notifications.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Bell className="w-16 h-16 text-charcoal-muted mx-auto mb-4" />
              <h3 className="font-display text-xl text-charcoal mb-2">No Notifications</h3>
              <p className="text-charcoal-muted">
                You don&apos;t have any notifications yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <NotificationList 
            notifications={notifications} 
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
          />
        )}
      </motion.div>
    </DashboardLayout>
  );
}
