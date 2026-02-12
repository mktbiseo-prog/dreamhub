"use client";

import { create } from "zustand";
import type { DreamerProfile, MatchResult, Conversation, ChatMessage } from "@/types";
import type { DreamProfileFormData } from "@/types/onboarding";
import {
  CURRENT_USER,
  CURRENT_USER_ID,
  MOCK_MATCHES,
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES,
} from "@/data/mockData";

interface DreamStore {
  // Auth / Current user
  currentUser: DreamerProfile;
  isOnboarded: boolean;

  // Discover
  discoverFeed: MatchResult[];
  skippedIds: Set<string>;

  // Matches
  matches: MatchResult[];

  // Messages
  conversations: Conversation[];
  messagesByMatch: Record<string, ChatMessage[]>;

  // Actions — Profile
  completeOnboarding: (data: DreamProfileFormData) => void;

  // Actions — Discover
  expressInterest: (matchId: string) => void;
  skipMatch: (matchId: string) => void;

  // Actions — Matches
  acceptMatch: (matchId: string) => void;
  declineMatch: (matchId: string) => void;

  // Actions — Messages
  sendMessage: (matchId: string, content: string) => void;
}

export const useDreamStore = create<DreamStore>((set, get) => ({
  // Initial state
  currentUser: CURRENT_USER,
  isOnboarded: false,

  discoverFeed: MOCK_MATCHES,
  skippedIds: new Set(),

  matches: MOCK_MATCHES.slice(0, 3).map((m) => ({
    ...m,
    status: "accepted" as const,
  })),

  conversations: MOCK_CONVERSATIONS,
  messagesByMatch: MOCK_MESSAGES,

  // Profile
  completeOnboarding: (data) => {
    set((state) => ({
      isOnboarded: true,
      currentUser: {
        ...state.currentUser,
        dreamStatement: data.dreamStatement,
        skillsOffered: data.skillsOffered,
        skillsNeeded: data.skillsNeeded,
        city: data.location.city,
        country: data.location.country,
        bio: data.bio,
        avatarUrl: data.avatarPreview,
      },
    }));
  },

  // Discover
  expressInterest: (matchId) => {
    const match = get().discoverFeed.find((m) => m.id === matchId);
    if (!match) return;

    set((state) => ({
      discoverFeed: state.discoverFeed.filter((m) => m.id !== matchId),
      matches: [
        ...state.matches,
        { ...match, status: "pending" as const },
      ],
    }));
  },

  skipMatch: (matchId) => {
    set((state) => ({
      discoverFeed: state.discoverFeed.filter((m) => m.id !== matchId),
      skippedIds: new Set([...state.skippedIds, matchId]),
    }));
  },

  // Matches
  acceptMatch: (matchId) => {
    set((state) => {
      const match = state.matches.find((m) => m.id === matchId);
      if (!match || match.status === "accepted") return state;

      const updatedMatches = state.matches.map((m) =>
        m.id === matchId ? { ...m, status: "accepted" as const } : m
      );

      const newConversation: Conversation = {
        matchId,
        partner: match.profile,
        lastMessage: "You are now connected! Start chatting.",
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0,
      };

      return {
        matches: updatedMatches,
        conversations: [newConversation, ...state.conversations],
        messagesByMatch: {
          ...state.messagesByMatch,
          [matchId]: [],
        },
      };
    });
  },

  declineMatch: (matchId) => {
    set((state) => ({
      matches: state.matches.map((m) =>
        m.id === matchId ? { ...m, status: "declined" as const } : m
      ),
    }));
  },

  // Messages
  sendMessage: (matchId, content) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      matchId,
      senderId: CURRENT_USER_ID,
      content,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      messagesByMatch: {
        ...state.messagesByMatch,
        [matchId]: [...(state.messagesByMatch[matchId] ?? []), newMsg],
      },
      conversations: state.conversations.map((c) =>
        c.matchId === matchId
          ? { ...c, lastMessage: content, lastMessageAt: newMsg.createdAt }
          : c
      ),
    }));
  },
}));
