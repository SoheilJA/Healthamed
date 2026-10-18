// Notification service (in-app).
import { mutate, nextId, read } from './db'
import type { Notification, NotificationKind } from '@/types'

export interface NotifyInput {
  title: string
  body: string
  kind: NotificationKind
  link?: string
}

export const notificationService = {
  notify(userId: string, input: NotifyInput): Notification {
    return mutate((db) => {
      const n: Notification = {
        id: nextId('nt_'),
        userId,
        title: input.title,
        body: input.body,
        kind: input.kind,
        link: input.link,
        read: false,
        at: new Date().toISOString()
      }
      db.notifications.push(n)
      return n
    }, 'ارسال اعلان')
  },

  listFor(userId: string): Notification[] {
    return read((db) =>
      db.notifications
        .filter((n) => n.userId === userId)
        .sort((a, b) => (a.at < b.at ? 1 : -1))
    )
  },

  unreadCount(userId: string): number {
    return read((db) => db.notifications.filter((n) => n.userId === userId && !n.read).length)
  },

  markRead(id: string): void {
    mutate((db) => {
      const n = db.notifications.find((x) => x.id === id)
      if (n) n.read = true
    }, 'خواندن اعلان')
  },

  markAllRead(userId: string): void {
    mutate((db) => {
      db.notifications.forEach((n) => {
        if (n.userId === userId) n.read = true
      })
    }, 'خواندن همه اعلان‌ها')
  }
}
