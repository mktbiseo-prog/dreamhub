// ─── Cafe Module Types ──────────────────────────────────────

export type CafeStatus = "open" | "closed" | "coming-soon";
export type CheckInMethod = "qr" | "nfc" | "manual";
export type DoorbellCategory =
  | "tech"
  | "design"
  | "business"
  | "social-impact"
  | "creative"
  | "education"
  | "other";
export type RingStatus = "pending" | "accepted" | "declined";
export type DoorbellTab = "all" | "here-now" | "my-dream";

export interface Cafe {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  status: CafeStatus;
  openHours: string;
  currentDreamerCount: number;
  maxCapacity: number;
  description: string;
  imageUrl: string;
}

export interface CafeCheckIn {
  id: string;
  cafeId: string;
  userId: string;
  userName: string;
  avatarUrl: string;
  method: CheckInMethod;
  checkedInAt: string;
  checkedOutAt: string | null;
}

export interface CheckedInDreamer {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string;
  dreamHeadline: string;
  checkedInAt: string;
}

export interface DoorbellDream {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string;
  dreamStatement: string;
  categories: DoorbellCategory[];
  neededSkills: string[];
  isHereNow: boolean;
  ringCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DoorbellRing {
  id: string;
  dreamId: string;
  dreamOwnerName: string;
  ringerId: string;
  ringerName: string;
  ringerAvatarUrl: string;
  message: string;
  status: RingStatus;
  createdAt: string;
}

// ─── Real-time Event Types (Phase 2) ────────────────────────

export type CafeEventType =
  | "checkin"
  | "checkout"
  | "dream-created"
  | "dream-deleted"
  | "bell-rung"
  | "ring-responded"
  | "dreamer-count-updated";

export interface CafeEvent {
  type: CafeEventType;
  cafeId: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export type ToastType = "success" | "info" | "ring" | "checkin";

export interface CafeToastMessage {
  id: string;
  type: ToastType;
  message: string;
  avatarInitial?: string;
}

export type ConnectionStatus = "connected" | "reconnecting" | "disconnected";
