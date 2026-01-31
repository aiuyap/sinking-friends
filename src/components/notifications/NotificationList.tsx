'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export type NotificationType = 
  | 'CONTRIBUTION_DUE'
  | 'CONTRIBUTION_MISSED'
  | 'LOAN_APPROVED'
  | 'LOAN_REJECTED'
  | 'LOAN_DUE_SOON'
  | 'LOAN_OVERDUE'
  | 'LOAN_REPAID'
  | 'LOAN_DEFAULTED'
  | 'YEAR_END_DISTRIBUTION';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  createdAt: Date;
  isRead: boolean;
}

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
}

const notificationTypeLabels: Record<NotificationType, { 
  label: string, 
  variant: 'default' | 'warning' | 'danger' | 'success' 
}> = {
  CONTRIBUTION_DUE: { label: 'Contribution', variant: 'default' },
  CONTRIBUTION_MISSED: { label: 'Missed Payment', variant: 'danger' },
  LOAN_APPROVED: { label: 'Loan Approved', variant: 'success' },
  LOAN_REJECTED: { label: 'Loan Rejected', variant: 'danger' },
  LOAN_DUE_SOON: { label: 'Loan Due Soon', variant: 'warning' },
  LOAN_OVERDUE: { label: 'Loan Overdue', variant: 'danger' },
  LOAN_REPAID: { label: 'Loan Repaid', variant: 'success' },
  LOAN_DEFAULTED: { label: 'Loan Defaulted', variant: 'danger' },
  YEAR_END_DISTRIBUTION: { label: 'Year-End', variant: 'default' }
};

export function NotificationList({ 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead 
}: NotificationListProps) {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<NotificationType | 'ALL'>('ALL');

  const filterNotifications = (notifications: Notification[]) => {
    return selectedFilter === 'ALL'
      ? notifications
      : notifications.filter(n => n.type === selectedFilter);
  };

  const filteredNotifications = filterNotifications(notifications);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const renderNotifications = () => {
    if (filteredNotifications.length === 0) {
      return (
        <div className="text-center py-8 text-charcoal/70">
          No notifications found
        </div>
      );
    }

    return filteredNotifications.map(notification => (
      <Card 
        key={notification.id} 
        className={`cursor-pointer hover:bg-cream/50 transition-colors ${
          !notification.isRead ? 'border-sage/30 bg-sage/5' : ''
        }`}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="p-4 flex items-start space-x-4">
          <Badge variant={notificationTypeLabels[notification.type].variant}>
            {notificationTypeLabels[notification.type].label}
          </Badge>
          
          <div className="flex-1">
            <h3 className="font-semibold text-charcoal">{notification.title}</h3>
            <p className="text-sm text-charcoal/70">{notification.message}</p>
            <div className="text-xs text-charcoal/50 mt-1">
              {notification.createdAt.toLocaleString()}
            </div>
          </div>
        </div>
      </Card>
    ));
  };

  const filterOptions: Array<NotificationType | 'ALL'> = [
    'ALL', 
    'CONTRIBUTION_DUE', 
    'CONTRIBUTION_MISSED', 
    'LOAN_APPROVED', 
    'LOAN_REJECTED', 
    'LOAN_DUE_SOON', 
    'LOAN_OVERDUE', 
    'LOAN_REPAID', 
    'YEAR_END_DISTRIBUTION'
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-charcoal">Notifications</h1>
        {notifications.some(n => !n.isRead) && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onMarkAllAsRead}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      <div className="flex space-x-2 mb-4 overflow-x-auto">
        {filterOptions.map(filter => (
          <Badge 
            key={filter}
            variant={selectedFilter === filter ? 'default' : 'outline'}
            onClick={() => setSelectedFilter(filter)}
            className="cursor-pointer"
          >
            {filter === 'ALL' ? 'All' : notificationTypeLabels[filter].label}
          </Badge>
        ))}
      </div>

      <div className="space-y-4">
        {renderNotifications()}
      </div>
    </div>
  );
}