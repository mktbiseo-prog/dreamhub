"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { useNotifications } from "./NotificationProvider";
import type { NotificationItem, NotificationAction } from "./types";
import { SERVICE_NOTIFICATION_COLORS } from "./types";
import { SERVICE_COLORS, type ServiceSource } from "../chat/types";

// ---------------------------------------------------------------------------
// Filter Tabs
// ---------------------------------------------------------------------------

type FilterKey = "all" | ServiceSource;

const FILTER_TABS: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "All" },
  { key: "place", label: "Place" },
  { key: "planner", label: "Planner" },
  { key: "brain", label: "Brain" },
  { key: "store", label: "Store" },
];

function FilterTabs({
  active,
  onChange,
  notifications,
}: {
  active: FilterKey;
  onChange: (key: FilterKey) => void;
  notifications: NotificationItem[];
}) {
  function unreadFor(key: FilterKey) {
    if (key === "all") return notifications.filter((n) => !n.read).length;
    return notifications.filter((n) => n.service === key && !n.read).length;
  }

  return (
    <div className="flex gap-1 overflow-x-auto px-4 py-2 scrollbar-hide">
      {FILTER_TABS.map((tab) => {
        const isActive = active === tab.key;
        const unread = unreadFor(tab.key);
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className="flex shrink-0 items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium transition-all"
            style={{
              backgroundColor: isActive
                ? "var(--dream-color-primary)"
                : "var(--dream-neutral-100)",
              color: isActive
                ? "var(--dream-color-on-primary, #fff)"
                : "var(--dream-neutral-600)",
            }}
          >
            {tab.label}
            {unread > 0 && (
              <span
                className="ml-0.5 text-xs font-bold"
                style={{
                  color: isActive ? "var(--dream-color-on-primary, #fff)" : "var(--dream-error)",
                }}
              >
                ({unread})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Time Group Header
// ---------------------------------------------------------------------------

function TimeGroupHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="h-px flex-1" style={{ backgroundColor: "var(--dream-neutral-200)" }} />
      <span
        className="shrink-0 text-xs font-medium"
        style={{ color: "var(--dream-neutral-400)" }}
      >
        {label}
      </span>
      <div className="h-px flex-1" style={{ backgroundColor: "var(--dream-neutral-200)" }} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Notification Card with Swipe
// ---------------------------------------------------------------------------

function NotificationCard({
  notification,
  onRead,
  onDelete,
  onTap,
}: {
  notification: NotificationItem;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  onTap?: (notification: NotificationItem) => void;
}) {
  const touchStartX = useRef(0);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const serviceColor =
    SERVICE_NOTIFICATION_COLORS[notification.service] || "#737373";
  const tagColors =
    notification.service !== "system"
      ? SERVICE_COLORS[notification.service as ServiceSource]
      : { bg: "#F5F5F5", text: "#737373", label: "System" };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const delta = e.touches[0].clientX - touchStartX.current;
    setSwipeOffset(Math.max(-80, Math.min(80, delta)));
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (swipeOffset > 50) {
      onRead(notification.id);
    } else if (swipeOffset < -50) {
      onDelete(notification.id);
    }
    setSwipeOffset(0);
  }, [swipeOffset, notification.id, onRead, onDelete]);

  return (
    <div className="relative overflow-hidden">
      {/* Swipe backgrounds */}
      <div className="absolute inset-0 flex">
        {/* Right swipe = mark read */}
        <div
          className="flex flex-1 items-center pl-4"
          style={{ backgroundColor: "var(--dream-success)" }}
        >
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        {/* Left swipe = delete */}
        <div
          className="flex flex-1 items-center justify-end pr-4"
          style={{ backgroundColor: "var(--dream-error)" }}
        >
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </div>
      </div>

      {/* Card content */}
      <div
        className="relative flex gap-3 px-4 py-3.5 transition-transform"
        style={{
          transform: `translateX(${swipeOffset}px)`,
          backgroundColor: notification.read
            ? "var(--dream-color-surface, #fff)"
            : "var(--dream-neutral-50)",
          borderBottom: "1px solid var(--dream-neutral-100)",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (!notification.read) onRead(notification.id);
          onTap?.(notification);
        }}
      >
        {/* Unread indicator bar */}
        {!notification.read && (
          <div
            className="absolute bottom-0 left-0 top-0 w-[3px] rounded-r"
            style={{ backgroundColor: serviceColor }}
          />
        )}

        {/* Icon */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] text-xl"
          style={{
            backgroundColor:
              notification.service !== "system"
                ? SERVICE_COLORS[notification.service as ServiceSource]?.bg
                : "var(--dream-neutral-100)",
          }}
        >
          {notification.icon}
        </div>

        {/* Body */}
        <div className="min-w-0 flex-1">
          <p
            className="text-sm font-semibold leading-snug"
            style={{ color: "var(--dream-neutral-900)" }}
          >
            {notification.title}
          </p>
          <p
            className="mt-0.5 text-sm leading-snug"
            style={{ color: "var(--dream-neutral-600)" }}
          >
            {notification.body}
          </p>

          {/* Meta */}
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-xs" style={{ color: "var(--dream-neutral-400)" }}>
              {formatRelativeTime(notification.createdAt)}
            </span>
            <span
              className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{ backgroundColor: tagColors.bg, color: tagColors.text }}
            >
              {tagColors.label || notification.service}
            </span>
          </div>

          {/* Inline action buttons */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="mt-2.5 flex gap-2">
              {notification.actions.map((action, i) => (
                <ActionButton key={i} action={action} serviceColor={serviceColor} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  action,
  serviceColor,
}: {
  action: NotificationAction;
  serviceColor: string;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        action.onClick?.();
      }}
      className="rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all active:scale-95"
      style={
        action.variant === "primary"
          ? {
              backgroundColor: serviceColor,
              color: "#fff",
            }
          : {
              backgroundColor: "transparent",
              border: "1px solid var(--dream-neutral-300)",
              color: "var(--dream-neutral-600)",
            }
      }
    >
      {action.label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// NotificationCenter (Main Export)
// ---------------------------------------------------------------------------

interface NotificationCenterProps {
  onNotificationTap?: (notification: NotificationItem) => void;
  onSettings?: () => void;
  onBack?: () => void;
}

export function NotificationCenter({
  onNotificationTap,
  onSettings,
  onBack,
}: NotificationCenterProps) {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, unreadCount } =
    useNotifications();
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return notifications;
    return notifications.filter((n) => n.service === filter);
  }, [notifications, filter]);

  // Group by time
  const grouped = useMemo(() => groupByTime(filtered), [filtered]);

  return (
    <div
      className="flex h-full flex-col"
      style={{ backgroundColor: "var(--dream-color-surface, #fff)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: "var(--dream-neutral-200)" }}
      >
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} style={{ color: "var(--dream-neutral-600)" }}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}
          <h1
            className="text-xl font-bold"
            style={{ color: "var(--dream-neutral-900)" }}
          >
            Notifications
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs font-medium"
              style={{ color: "var(--dream-color-primary)" }}
            >
              Mark all read
            </button>
          )}
          {onSettings && (
            <button
              onClick={onSettings}
              className="flex h-9 w-9 items-center justify-center rounded-full"
              style={{ color: "var(--dream-neutral-600)" }}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <FilterTabs
        active={filter}
        onChange={setFilter}
        notifications={notifications}
      />

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg
              className="mb-3 h-12 w-12"
              style={{ color: "var(--dream-neutral-300)" }}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <p className="text-sm" style={{ color: "var(--dream-neutral-500)" }}>
              No notifications yet
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--dream-neutral-400)" }}>
              We&apos;ll let you know when something happens
            </p>
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.label}>
              <TimeGroupHeader label={group.label} />
              {group.items.map((n) => (
                <NotificationCard
                  key={n.id}
                  notification={n}
                  onRead={markAsRead}
                  onDelete={deleteNotification}
                  onTap={onNotificationTap}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toast Notification
// ---------------------------------------------------------------------------

export function ToastNotification({
  onTap,
}: {
  onTap?: (toast: { id: string; href?: string }) => void;
}) {
  const { toast, dismissToast } = useNotifications();

  if (!toast) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-[9999]"
      style={{
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)",
        animation: "notification-toast-slide-in 300ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div
        className="mx-4 flex items-center gap-3 rounded-[16px] border p-4 shadow-lg"
        style={{
          backgroundColor: "var(--dream-color-surface, #fff)",
          borderColor: "var(--dream-neutral-200)",
          boxShadow: "var(--dream-shadow-lg)",
        }}
        onClick={() => {
          onTap?.({ id: toast.id, href: toast.href });
          dismissToast();
        }}
        onTouchStart={(e) => {
          const startY = e.touches[0].clientY;
          const el = e.currentTarget;
          const onMove = (ev: TouchEvent) => {
            const delta = ev.touches[0].clientY - startY;
            if (delta < -30) {
              dismissToast();
              document.removeEventListener("touchmove", onMove);
            } else {
              el.style.transform = `translateY(${Math.min(0, delta)}px)`;
            }
          };
          const onEnd = () => {
            el.style.transform = "";
            document.removeEventListener("touchmove", onMove);
            document.removeEventListener("touchend", onEnd);
          };
          document.addEventListener("touchmove", onMove);
          document.addEventListener("touchend", onEnd);
        }}
      >
        {toast.icon && <span className="shrink-0 text-xl">{toast.icon}</span>}
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-sm font-semibold"
            style={{ color: "var(--dream-neutral-900)" }}
          >
            {toast.title}
          </p>
          <p
            className="truncate text-sm"
            style={{ color: "var(--dream-neutral-500)" }}
          >
            {toast.body}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            dismissToast();
          }}
          className="shrink-0"
          style={{ color: "var(--dream-neutral-400)" }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes notification-toast-slide-in {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Notification Badge
// ---------------------------------------------------------------------------

export function NotificationBadge({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  if (count <= 0) return null;

  return (
    <span
      className={`absolute flex items-center justify-center rounded-full text-white ${className || "-right-1 -top-0.5"}`}
      style={{
        backgroundColor: "var(--dream-error)",
        minWidth: "16px",
        height: "16px",
        fontSize: "10px",
        fontWeight: 600,
        lineHeight: "16px",
        padding: "0 4px",
        border: "2px solid var(--dream-color-surface, #fff)",
      }}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatRelativeTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 172_800_000) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function groupByTime(
  items: NotificationItem[]
): Array<{ label: string; items: NotificationItem[] }> {
  const today: NotificationItem[] = [];
  const thisWeek: NotificationItem[] = [];
  const older: NotificationItem[] = [];

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  for (const item of items) {
    const d = new Date(item.createdAt);
    if (d >= todayStart) {
      today.push(item);
    } else if (d >= weekStart) {
      thisWeek.push(item);
    } else {
      older.push(item);
    }
  }

  const groups: Array<{ label: string; items: NotificationItem[] }> = [];
  if (today.length > 0) groups.push({ label: "Today", items: today });
  if (thisWeek.length > 0) groups.push({ label: "This Week", items: thisWeek });
  if (older.length > 0) groups.push({ label: "Earlier", items: older });

  return groups;
}
