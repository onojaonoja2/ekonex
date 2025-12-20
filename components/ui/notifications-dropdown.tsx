'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { fetchNotifications, markAsRead } from '@/app/notifications/actions'
import { toast } from 'sonner'
import Link from 'next/link'

type Notification = {
    id: string
    title: string
    message: string
    type: string
    is_read: boolean
    created_at: string
}

export function NotificationsDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        loadNotifications()
    }, [])

    async function loadNotifications() {
        try {
            const data = await fetchNotifications()
            setNotifications(data || []) // Ensure data is an array
            setUnreadCount(data?.filter((n: Notification) => !n.is_read).length || 0)
        } catch (error) {
            console.error('Failed to load notifications', error)
        }
    }

    async function handleMarkRead(id: string) {
        await markAsRead(id)
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    <div className="p-3 border-b dark:border-gray-800 font-semibold">
                        Notifications
                    </div>
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                            No notifications
                        </div>
                    ) : (
                        <div className="divide-y dark:divide-gray-800">
                            {notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`p-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${!notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                    onClick={() => !notification.is_read && handleMarkRead(notification.id)}
                                >
                                    <div className="font-medium text-gray-900 dark:text-gray-100">{notification.title}</div>
                                    <div className="text-gray-600 dark:text-gray-400 mt-1">{notification.message}</div>
                                    <div className="text-xs text-gray-400 mt-2">
                                        {new Date(notification.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
