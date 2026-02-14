"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { NotificationItem } from "./types";

// ---------------------------------------------------------------------------
// Socket abstraction
// ---------------------------------------------------------------------------

interface SocketLike {
  on(event: string, fn: (...args: unknown[]) => void): void;
  off(event: string, fn: (...args: unknown[]) => void): void;
}

// ---------------------------------------------------------------------------
// Toast state
// ---------------------------------------------------------------------------

export interface ToastItem {
  id: string;
  title: string;
  body: string;
  icon?: string;
  href?: string;
}

// ---------------------------------------------------------------------------
// Notification Context
// ---------------------------------------------------------------------------

interface NotificationContextValue {
  /** All notifications */
  notifications: NotificationItem[];
  /** Total unread count */
  unreadCount: number;
  /** Currently visible toast (null if none) */
  toast: ToastItem | null;

  /** Actions */
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  dismissToast: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface NotificationProviderProps {
  children: ReactNode;
  /** Optional Socket.IO instance for real-time notifications */
  socket?: SocketLike;
  /** Initial notifications (server-rendered or fetched) */
  initialNotifications?: NotificationItem[];
  /** API base URL for REST operations */
  apiBaseUrl?: string;
}

export function NotificationProvider({
  children,
  socket,
  initialNotifications = [],
  apiBaseUrl = "/api/notifications",
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [toast, setToast] = useState<ToastItem | null>(null);

  // Listen to real-time notifications
  useEffect(() => {
    if (!socket) return;

    const onNew = (notification: NotificationItem) => {
      setNotifications((prev) => [notification, ...prev]);

      // Show toast for HIGH/CRITICAL
      if (
        notification.priority === "HIGH" ||
        notification.priority === "CRITICAL"
      ) {
        const toastItem: ToastItem = {
          id: notification.id,
          title: notification.title,
          body: notification.body,
          icon: notification.icon,
        };
        setToast(toastItem);

        // Auto-dismiss after 4 seconds
        setTimeout(() => {
          setToast((current) =>
            current?.id === toastItem.id ? null : current
          );
        }, 4000);
      }
    };

    socket.on("notification:new", onNew as (...args: unknown[]) => void);
    return () => {
      socket.off("notification:new", onNew as (...args: unknown[]) => void);
    };
  }, [socket]);

  const markAsRead = useCallback(
    (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      // Fire-and-forget API call
      fetch(`${apiBaseUrl}/${id}/read`, { method: "POST" }).catch(() => {});
    },
    [apiBaseUrl]
  );

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    fetch(`${apiBaseUrl}/read-all`, { method: "POST" }).catch(() => {});
  }, [apiBaseUrl]);

  const deleteNotification = useCallback(
    (id: string) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      fetch(`${apiBaseUrl}/${id}`, { method: "DELETE" }).catch(() => {});
    },
    [apiBaseUrl]
  );

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toast,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        dismissToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  return ctx;
}
