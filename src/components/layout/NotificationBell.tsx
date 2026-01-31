'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Bell, X, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function NotificationBell() {
  const { user } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount((data.notifications || []).filter((n: any) => !n.isRead).length)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
      })

      // Update local state
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      // Mark all as read in one go
      for (const notification of notifications) {
        if (!notification.isRead) {
          await fetch(`/api/notifications/${notification.id}`, {
            method: 'PUT',
          })
        }
      }

      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  return (
    <div className="relative">
      {/* Notification Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-black/[0.03] rounded-full transition-colors"
      >
        <Bell className="w-6 h-6 text-charcoal-secondary" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-terracotta text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-lg border border-black/[0.06] z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-black/[0.06]">
            <h3 className="font-display text-lg text-charcoal">Notifications</h3>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-sage hover:underline"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-black/[0.03] rounded-lg"
              >
                <X className="w-5 h-5 text-charcoal-secondary" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-charcoal-muted mx-auto mb-3" />
                <p className="text-charcoal-secondary">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-black/[0.06]">
                {notifications.map((notification: any, index) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-4 hover:bg-black/[0.02] transition-colors cursor-pointer',
                      !notification.isRead && 'bg-sage-dim'
                    )}
                    onClick={() => {
                      if (!notification.isRead) {
                        markAsRead(notification.id)
                      }
                      if (notification.actionUrl) {
                        router.push(notification.actionUrl)
                        setIsOpen(false)
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full flex-shrink-0">
                        {!notification.isRead && (
                          <div className="w-full h-full bg-sage rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-charcoal text-sm mb-1">
                          {notification.title}
                        </p>
                        <p className="text-charcoal-secondary text-sm">
                          {notification.message}
                        </p>
                        <p className="text-xs text-charcoal-muted mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
