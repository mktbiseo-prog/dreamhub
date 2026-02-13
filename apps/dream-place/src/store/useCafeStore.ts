"use client";

import { create } from "zustand";
import type {
  Cafe,
  CafeCheckIn,
  CafeEvent,
  CafeToastMessage,
  CheckedInDreamer,
  ConnectionStatus,
  DoorbellDream,
  DoorbellRing,
  DoorbellTab,
  DoorbellCategory,
  ToastType,
} from "@/types/cafe";
import {
  MOCK_CAFE,
  MOCK_CAFE_ID,
  MOCK_CHECKED_IN_DREAMERS,
  MOCK_DOORBELL_DREAMS,
  MOCK_MY_DREAM,
  MOCK_DOORBELL_RINGS_RECEIVED,
  MOCK_DOORBELL_RINGS_SENT,
} from "@/data/mockCafe";
import { showBrowserNotification } from "@/lib/notifications";

let toastIdCounter = 0;

interface CafeStore {
  // Cafe
  currentCafe: Cafe | null;
  isCheckedIn: boolean;
  myCheckIn: CafeCheckIn | null;
  checkedInDreamers: CheckedInDreamer[];

  // Doorbell
  doorbellDreams: DoorbellDream[];
  myDream: DoorbellDream | null;
  doorbellTab: DoorbellTab;
  categoryFilter: DoorbellCategory | null;

  // Rings
  ringsReceived: DoorbellRing[];
  ringsSent: DoorbellRing[];
  pendingRingCount: number;

  // Toast (Phase 2: queue-based)
  toastQueue: CafeToastMessage[];

  // Connection (Phase 2)
  connectionStatus: ConnectionStatus;

  // Loading
  isLoadingCafe: boolean;
  isLoadingDreamers: boolean;
  isLoadingDreams: boolean;
  isLoadingRings: boolean;

  // Actions — Cafe
  fetchCafe: (cafeId: string) => Promise<void>;
  checkIn: (cafeId: string, method: string) => Promise<void>;
  checkOut: (cafeId: string) => Promise<void>;
  fetchCheckedInDreamers: (cafeId: string) => Promise<void>;

  // Actions — Doorbell
  fetchDoorbellDreams: () => Promise<void>;
  createOrUpdateMyDream: (dream: {
    dreamStatement: string;
    categories: string[];
    neededSkills: string[];
  }) => Promise<void>;
  deleteMyDream: () => Promise<void>;
  ringBell: (dreamId: string, message?: string) => Promise<void>;

  // Actions — Rings
  fetchRings: () => Promise<void>;
  respondToRing: (ringId: string, status: "accepted" | "declined") => Promise<void>;

  // Actions — UI
  setDoorbellTab: (tab: DoorbellTab) => void;
  setCategoryFilter: (category: DoorbellCategory | null) => void;
  showToast: (type: ToastType, message: string, avatarInitial?: string) => void;
  dismissToast: (id: string) => void;

  // Actions — Real-time (Phase 2)
  setConnectionStatus: (status: ConnectionStatus) => void;
  handleRealtimeEvent: (event: CafeEvent) => void;
}

export const useCafeStore = create<CafeStore>((set, get) => ({
  // Initial state
  currentCafe: null,
  isCheckedIn: false,
  myCheckIn: null,
  checkedInDreamers: [],
  doorbellDreams: [],
  myDream: null,
  doorbellTab: "all",
  categoryFilter: null,
  ringsReceived: [],
  ringsSent: [],
  pendingRingCount: 0,
  toastQueue: [],
  connectionStatus: "disconnected",
  isLoadingCafe: false,
  isLoadingDreamers: false,
  isLoadingDreams: false,
  isLoadingRings: false,

  // ─── Cafe Actions ───────────────────────────────────────────

  fetchCafe: async (cafeId) => {
    set({ isLoadingCafe: true });
    try {
      const res = await fetch(`/api/cafe/${cafeId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      set({ currentCafe: data.cafe });
    } catch {
      // Fallback to mock
      set({ currentCafe: MOCK_CAFE });
    } finally {
      set({ isLoadingCafe: false });
    }
  },

  checkIn: async (cafeId, method) => {
    try {
      const res = await fetch(`/api/cafe/${cafeId}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      set({
        isCheckedIn: true,
        myCheckIn: data.checkIn,
      });
      get().showToast("checkin", "Checked in! Your dream is now visible to others here.");
      // Refresh dreamers
      get().fetchCheckedInDreamers(cafeId);
    } catch {
      // Mock fallback
      set({
        isCheckedIn: true,
        myCheckIn: {
          id: "checkin-me",
          cafeId: MOCK_CAFE_ID,
          userId: "user-me",
          userName: "You",
          avatarUrl: "",
          method: method as "qr" | "nfc" | "manual",
          checkedInAt: new Date().toISOString(),
          checkedOutAt: null,
        },
      });
      get().showToast("checkin", "Checked in! Your dream is now visible to others here.");
    }
  },

  checkOut: async (cafeId) => {
    try {
      const res = await fetch(`/api/cafe/${cafeId}/checkout`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      set({
        isCheckedIn: false,
        myCheckIn: null,
      });
      get().showToast("success", "Checked out. See you next time!");
    } catch {
      set({
        isCheckedIn: false,
        myCheckIn: null,
      });
      get().showToast("success", "Checked out. See you next time!");
    }
  },

  fetchCheckedInDreamers: async (cafeId) => {
    set({ isLoadingDreamers: true });
    try {
      const res = await fetch(`/api/cafe/${cafeId}/current-dreamers`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      set({ checkedInDreamers: data.dreamers });
    } catch {
      set({ checkedInDreamers: MOCK_CHECKED_IN_DREAMERS });
    } finally {
      set({ isLoadingDreamers: false });
    }
  },

  // ─── Doorbell Actions ───────────────────────────────────────

  fetchDoorbellDreams: async () => {
    set({ isLoadingDreams: true });
    try {
      const res = await fetch("/api/doorbell/dreams");
      if (!res.ok) throw new Error();
      const data = await res.json();
      set({ doorbellDreams: data.dreams });

      // Fetch my dream separately
      const myRes = await fetch("/api/doorbell/dreams/mine");
      if (myRes.ok) {
        const myData = await myRes.json();
        set({ myDream: myData.dream });
      }
    } catch {
      set({ doorbellDreams: MOCK_DOORBELL_DREAMS, myDream: MOCK_MY_DREAM });
    } finally {
      set({ isLoadingDreams: false });
    }
  },

  createOrUpdateMyDream: async (dream) => {
    try {
      const res = await fetch("/api/doorbell/dreams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dream),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      set({ myDream: data.dream });
      get().showToast("success", "Your dream doorbell is now live!");
      get().fetchDoorbellDreams();
    } catch {
      // Mock fallback
      const newDream: DoorbellDream = {
        id: "dream-me",
        userId: "user-me",
        userName: "You",
        avatarUrl: "",
        dreamStatement: dream.dreamStatement,
        categories: dream.categories as DoorbellCategory[],
        neededSkills: dream.neededSkills,
        isHereNow: get().isCheckedIn,
        ringCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set({ myDream: newDream });
      get().showToast("success", "Your dream doorbell is now live!");
    }
  },

  deleteMyDream: async () => {
    const dream = get().myDream;
    if (!dream) return;
    try {
      const res = await fetch(`/api/doorbell/dreams/${dream.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      set({ myDream: null });
      get().showToast("info", "Dream doorbell removed.");
      get().fetchDoorbellDreams();
    } catch {
      set({ myDream: null });
      get().showToast("info", "Dream doorbell removed.");
    }
  },

  ringBell: async (dreamId, message) => {
    try {
      const res = await fetch("/api/doorbell/ring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dreamId, message }),
      });
      if (!res.ok) throw new Error();
      get().showToast("ring", "Bell rung! They'll be notified.");
      get().fetchDoorbellDreams();
    } catch {
      // Mock: increment ring count locally
      set((state) => ({
        doorbellDreams: state.doorbellDreams.map((d) =>
          d.id === dreamId ? { ...d, ringCount: d.ringCount + 1 } : d
        ),
      }));
      get().showToast("ring", "Bell rung! They'll be notified.");
    }
  },

  // ─── Rings Actions ──────────────────────────────────────────

  fetchRings: async () => {
    set({ isLoadingRings: true });
    try {
      const [recvRes, sentRes] = await Promise.all([
        fetch("/api/doorbell/rings/received"),
        fetch("/api/doorbell/rings/sent"),
      ]);
      if (recvRes.ok) {
        const recvData = await recvRes.json();
        const rings: DoorbellRing[] = recvData.rings;
        set({
          ringsReceived: rings,
          pendingRingCount: rings.filter((r) => r.status === "pending").length,
        });
      }
      if (sentRes.ok) {
        const sentData = await sentRes.json();
        set({ ringsSent: sentData.rings });
      }
    } catch {
      set({
        ringsReceived: MOCK_DOORBELL_RINGS_RECEIVED,
        ringsSent: MOCK_DOORBELL_RINGS_SENT,
        pendingRingCount: MOCK_DOORBELL_RINGS_RECEIVED.filter(
          (r) => r.status === "pending"
        ).length,
      });
    } finally {
      set({ isLoadingRings: false });
    }
  },

  respondToRing: async (ringId, status) => {
    try {
      const res = await fetch(`/api/doorbell/rings/${ringId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      get().showToast(
        "success",
        status === "accepted"
          ? "Ring accepted! You can now connect."
          : "Ring declined."
      );
      get().fetchRings();
    } catch {
      // Mock: update locally
      set((state) => ({
        ringsReceived: state.ringsReceived.map((r) =>
          r.id === ringId ? { ...r, status } : r
        ),
        pendingRingCount: state.ringsReceived.filter(
          (r) => r.id !== ringId && r.status === "pending"
        ).length,
      }));
      get().showToast(
        "success",
        status === "accepted"
          ? "Ring accepted! You can now connect."
          : "Ring declined."
      );
    }
  },

  // ─── UI Actions ─────────────────────────────────────────────

  setDoorbellTab: (tab) => set({ doorbellTab: tab }),
  setCategoryFilter: (category) => set({ categoryFilter: category }),

  showToast: (type, message, avatarInitial) => {
    const id = `toast-${++toastIdCounter}`;
    const toast: CafeToastMessage = { id, type, message, avatarInitial };
    set((state) => ({
      toastQueue: [...state.toastQueue.slice(-2), toast], // keep max 3
    }));
  },

  dismissToast: (id) => {
    set((state) => ({
      toastQueue: state.toastQueue.filter((t) => t.id !== id),
    }));
  },

  // ─── Real-time Actions (Phase 2) ─────────────────────────────

  setConnectionStatus: (status) => set({ connectionStatus: status }),

  handleRealtimeEvent: (event) => {
    const state = get();
    const payload = event.payload;

    switch (event.type) {
      case "checkin": {
        const dreamer = payload.dreamer as CheckedInDreamer | undefined;
        if (dreamer) {
          set((s) => ({
            checkedInDreamers: [...s.checkedInDreamers, dreamer],
          }));
        }
        if (state.currentCafe) {
          set((s) => ({
            currentCafe: s.currentCafe
              ? {
                  ...s.currentCafe,
                  currentDreamerCount: s.currentCafe.currentDreamerCount + 1,
                }
              : null,
          }));
        }
        const name = (payload.userName as string) ?? "Someone";
        state.showToast("checkin", `${name} just checked in!`, name[0]);
        break;
      }

      case "checkout": {
        const userId = payload.userId as string;
        set((s) => ({
          checkedInDreamers: s.checkedInDreamers.filter(
            (d) => d.userId !== userId
          ),
          currentCafe: s.currentCafe
            ? {
                ...s.currentCafe,
                currentDreamerCount: Math.max(
                  0,
                  s.currentCafe.currentDreamerCount - 1
                ),
              }
            : null,
        }));
        break;
      }

      case "dream-created": {
        const dream = payload.dream as DoorbellDream | undefined;
        if (dream) {
          set((s) => ({
            doorbellDreams: [...s.doorbellDreams, dream],
          }));
        }
        break;
      }

      case "dream-deleted": {
        const dreamId = payload.dreamId as string;
        set((s) => ({
          doorbellDreams: s.doorbellDreams.filter((d) => d.id !== dreamId),
        }));
        break;
      }

      case "bell-rung": {
        const dreamId = payload.dreamId as string;
        set((s) => ({
          doorbellDreams: s.doorbellDreams.map((d) =>
            d.id === dreamId ? { ...d, ringCount: d.ringCount + 1 } : d
          ),
        }));
        // If it's my dream, show toast + browser notification
        if (state.myDream && state.myDream.id === dreamId) {
          const ringerName = (payload.ringerName as string) ?? "Someone";
          const ring = payload.ring as DoorbellRing | undefined;
          if (ring) {
            set((s) => ({
              ringsReceived: [...s.ringsReceived, ring],
              pendingRingCount: s.pendingRingCount + 1,
            }));
          }
          state.showToast("ring", `${ringerName} rang your doorbell!`, ringerName[0]);
          showBrowserNotification("Dream Doorbell", {
            body: `${ringerName} rang your doorbell!`,
            tag: `ring-${dreamId}`,
          });
        }
        break;
      }

      case "ring-responded": {
        const ringId = payload.ringId as string;
        const newStatus = payload.status as "accepted" | "declined";
        const dreamOwnerName = (payload.dreamOwnerName as string) ?? "Someone";

        set((s) => ({
          ringsSent: s.ringsSent.map((r) =>
            r.id === ringId ? { ...r, status: newStatus } : r
          ),
        }));

        if (newStatus === "accepted") {
          state.showToast("success", `${dreamOwnerName} accepted your ring!`);
          showBrowserNotification("Ring Accepted!", {
            body: `${dreamOwnerName} accepted your ring! You can now connect.`,
            tag: `ring-accepted-${ringId}`,
          });
        }
        break;
      }

      case "dreamer-count-updated": {
        const count = payload.count as number;
        if (state.currentCafe) {
          set((s) => ({
            currentCafe: s.currentCafe
              ? { ...s.currentCafe, currentDreamerCount: count }
              : null,
          }));
        }
        break;
      }
    }
  },
}));
