// ---------------------------------------------------------------------------
// Notification UI Types — Frontend-specific types
// ---------------------------------------------------------------------------

import type { ServiceSource } from "../chat/types";

export type NotificationPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  service: ServiceSource | "system";
  priority: NotificationPriority;
  icon: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
  /** Inline action buttons */
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  variant: "primary" | "secondary";
  href?: string;
  onClick?: () => void;
}

/** Notification type → display configuration */
export const NOTIFICATION_CONFIG: Record<
  string,
  { icon: string; service: ServiceSource | "system"; priority: NotificationPriority }
> = {
  MATCH_FOUND:           { icon: "\uD83D\uDCAB", service: "place",   priority: "HIGH" },
  MATCH_ACCEPTED:        { icon: "\uD83E\uDD1D", service: "place",   priority: "HIGH" },
  CONNECTION_REQUEST:    { icon: "\uD83D\uDD14", service: "place",   priority: "HIGH" },
  TEAM_INVITE:           { icon: "\uD83D\uDC65", service: "place",   priority: "HIGH" },
  TRIAL_PROJECT_UPDATE:  { icon: "\uD83D\uDCCB", service: "place",   priority: "MEDIUM" },
  STREAK_REMINDER:       { icon: "\uD83D\uDD25", service: "planner", priority: "MEDIUM" },
  PART_COMPLETE:         { icon: "\uD83C\uDF89", service: "planner", priority: "HIGH" },
  AI_COACH_NUDGE:        { icon: "\uD83D\uDCAC", service: "planner", priority: "LOW" },
  BADGE_EARNED:          { icon: "\uD83C\uDFC5", service: "planner", priority: "MEDIUM" },
  INSIGHT_READY:         { icon: "\uD83E\uDDE0", service: "brain",   priority: "MEDIUM" },
  WEEKLY_REPORT:         { icon: "\uD83D\uDCCA", service: "brain",   priority: "LOW" },
  RELATED_THOUGHT:       { icon: "\uD83D\uDD17", service: "brain",   priority: "LOW" },
  ORDER_UPDATE:          { icon: "\uD83D\uDCE6", service: "store",   priority: "HIGH" },
  DREAMER_UPDATE:        { icon: "\uD83D\uDCDD", service: "store",   priority: "MEDIUM" },
  NEW_SUPPORTER:         { icon: "\u2764\uFE0F", service: "store",   priority: "HIGH" },
  MILESTONE_REACHED:     { icon: "\uD83C\uDFAF", service: "store",   priority: "HIGH" },
  STORE_PURCHASE:        { icon: "\uD83D\uDED2", service: "store",   priority: "HIGH" },
  FUNDING_MILESTONE:     { icon: "\uD83C\uDFAF", service: "store",   priority: "HIGH" },
  GRIT_SCORE_UP:         { icon: "\uD83D\uDCAA", service: "planner", priority: "MEDIUM" },
  NEW_MESSAGE:           { icon: "\uD83D\uDCAC", service: "place",   priority: "HIGH" },
  WELCOME:               { icon: "\uD83C\uDF1F", service: "system",  priority: "MEDIUM" },
  SYSTEM_UPDATE:         { icon: "\u2699\uFE0F", service: "system",  priority: "LOW" },
  SECURITY_ALERT:        { icon: "\uD83D\uDD12", service: "system",  priority: "CRITICAL" },
  THOUGHT_MILESTONE:     { icon: "\uD83E\uDDE0", service: "brain",   priority: "MEDIUM" },
  PROJECT_STAGE_CHANGED: { icon: "\uD83D\uDE80", service: "place",   priority: "MEDIUM" },
  TEAM_MEMBER_JOINED:    { icon: "\uD83D\uDC65", service: "place",   priority: "MEDIUM" },
  DOORBELL_RUNG:         { icon: "\uD83D\uDD14", service: "cafe",    priority: "HIGH" },
};

/** Service color bars for notifications */
export const SERVICE_NOTIFICATION_COLORS: Record<ServiceSource | "system", string> = {
  place: "#2563EB",
  store: "#E5A100",
  planner: "#FF6B35",
  brain: "#7C3AED",
  cafe: "#22C55E",
  system: "#737373",
};
