import { useState } from "react";

export type NotificationSeverity = 'success' | 'warning' | 'error';
export type Notification = {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  timeoutId: number;
}

export type NotificationRegisterer = (title: string, message: string) => void;
export type NotificationRegistererMap = Map<NotificationSeverity, NotificationRegisterer>;
export type NotificationUnregisterer = (id: string) => void;

export function useNotification(timeout: number): [Notification[], NotificationRegistererMap, NotificationUnregisterer] {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unregister = (id: string) => {
    setNotifications((prev) => {
      prev.filter((n) => n.id === id).forEach((n) => {
        clearTimeout(n.timeoutId);
      });

      return prev.filter((n) => n.id !== id);
    });

  }

  const register = (title: string, message: string, severity: NotificationSeverity) => {
    const id = self.crypto.randomUUID();

    setNotifications((prev) => {
      const newNotification: Notification = {
        id: id,
        title: title,
        message: message,
        severity: severity,
        timeoutId: setTimeout(() => {
          unregister(id);
        }, timeout)
      };
      return [...prev, newNotification];
    });
  };

  const registererMap: NotificationRegistererMap = new Map(
    [
      ['success', (title: string, message: string) => register(title, message, 'success')],
      ['warning', (title: string, message: string) => register(title, message, 'warning')],
      ['error', (title: string, message: string) => register(title, message, 'error')],
    ]
  );

  return [notifications, registererMap, unregister];
}

