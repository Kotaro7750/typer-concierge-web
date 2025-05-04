import { useState } from "react";

export type NotificationSeverity = 'success' | 'warning' | 'error';
export type Notification = {
  id: string;
  message: string;
  severity: NotificationSeverity;
  timeoutId: number;
}

export function useNotification(timeout: number): [Notification[], (message: string, severity: NotificationSeverity) => void, (id: string) => void] {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unregister = (id: string) => {
    setNotifications((prev) => {
      prev.filter((n) => n.id === id).forEach((n) => {
        clearTimeout(n.timeoutId);
      });

      return prev.filter((n) => n.id !== id);
    });

  }

  const register = (message: string, severity: NotificationSeverity) => {
    const id = self.crypto.randomUUID();

    setNotifications((prev) => {
      const newNotification: Notification = {
        id: id,
        message: message,
        severity: severity,
        timeoutId: setTimeout(() => {
          unregister(id);
        }, timeout)
      };
      return [...prev, newNotification];
    });
  };

  return [notifications, register, unregister];
}

