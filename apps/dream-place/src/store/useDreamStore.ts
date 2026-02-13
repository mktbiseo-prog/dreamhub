"use client";

import { create } from "zustand";
import type {
  DreamerProfile,
  MatchResult,
  Conversation,
  ChatMessage,
  DreamTeam,
  DreamProject,
  ProjectTask,
  SavedFilter,
  TeamCheckIn,
} from "@/types";
import type { DreamProfileFormData } from "@/types/onboarding";
import type { DiscoverFilterState } from "@/types";
import {
  CURRENT_USER,
  CURRENT_USER_ID,
  MOCK_MATCHES,
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES,
} from "@/data/mockData";
import { MOCK_CHECK_INS } from "@/data/mockTeams";

// ─── localStorage helpers ───────────────────────────────────

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
}

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

  // Teams & Projects
  teams: DreamTeam[];
  projects: DreamProject[];

  // Saved profiles & filters
  savedProfiles: string[];
  savedFilters: SavedFilter[];

  // Team check-ins
  teamCheckIns: TeamCheckIn[];

  // Loading states
  isLoadingDiscover: boolean;
  isLoadingMatches: boolean;
  isLoadingMessages: boolean;
  isLoadingTeams: boolean;
  isLoadingProjects: boolean;

  // Actions — Profile
  completeOnboarding: (data: DreamProfileFormData) => void;

  // Actions — Discover
  expressInterest: (matchId: string, resonatedWith?: string[]) => void;
  skipMatch: (matchId: string) => void;

  // Actions — Matches
  acceptMatch: (matchId: string) => void;
  declineMatch: (matchId: string) => void;

  // Actions — Messages
  sendMessage: (matchId: string, content: string) => void;

  // Actions — Teams
  createTeam: (name: string, dreamStatement: string) => void;
  addTeamMember: (teamId: string, userId: string) => void;

  // Actions — Projects
  createProject: (teamId: string, name: string, description: string, skillsNeeded: string[], options?: { isTrial?: boolean; trialDurationWeeks?: number; evaluationCriteria?: string[] }) => void;
  updateTaskStatus: (projectId: string, taskId: string, status: ProjectTask["status"]) => void;
  upvoteProject: (projectId: string) => void;

  // Actions — Save / Filter
  toggleSaveProfile: (profileId: string) => void;
  saveFilter: (name: string, filters: DiscoverFilterState) => void;
  deleteFilter: (filterId: string) => void;

  // Actions — Team Check-in
  addTeamCheckIn: (checkIn: Omit<TeamCheckIn, "id">) => void;

  // Actions — Fetch from API
  fetchDiscoverFeed: (search?: string, minScore?: number) => Promise<void>;
  fetchMatches: () => Promise<void>;
  fetchMessages: (matchId: string) => Promise<void>;
  fetchProfile: () => Promise<void>;
  fetchTeams: () => Promise<void>;
  fetchProjects: () => Promise<void>;

  // Actions — Set data (for hydration from API)
  setDiscoverFeed: (feed: MatchResult[]) => void;
  setMatches: (matches: MatchResult[]) => void;
  setConversations: (conversations: Conversation[]) => void;
  setMessages: (matchId: string, messages: ChatMessage[]) => void;
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

  teams: [],
  projects: [],

  savedProfiles: loadFromStorage<string[]>("dp-savedProfiles", []),
  savedFilters: loadFromStorage<SavedFilter[]>("dp-savedFilters", []),
  teamCheckIns: MOCK_CHECK_INS,

  isLoadingDiscover: false,
  isLoadingMatches: false,
  isLoadingMessages: false,
  isLoadingTeams: false,
  isLoadingProjects: false,

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
        intent: data.intent || undefined,
        workStyle: data.workStyle,
        preferences: data.preferences,
      },
    }));

    // Fire-and-forget API call
    fetch("/api/dream-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(() => {});
  },

  // Discover
  expressInterest: (matchId, resonatedWith) => {
    const match = get().discoverFeed.find((m) => m.id === matchId);
    if (!match) return;

    set((state) => ({
      discoverFeed: state.discoverFeed.filter((m) => m.id !== matchId),
      matches: [
        ...state.matches,
        { ...match, status: "pending" as const, resonatedWith },
      ],
    }));

    fetch(`/api/matches/${matchId}/interest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchScore: match.matchScore,
        dreamScore: match.dreamScore,
        skillScore: match.skillScore,
        valueScore: match.valueScore,
        resonatedWith,
      }),
    }).catch(() => {});
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

    fetch(`/api/matches/${matchId}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "accept" }),
    }).catch(() => {});
  },

  declineMatch: (matchId) => {
    set((state) => ({
      matches: state.matches.map((m) =>
        m.id === matchId ? { ...m, status: "declined" as const } : m
      ),
    }));

    fetch(`/api/matches/${matchId}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "decline" }),
    }).catch(() => {});
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

    fetch(`/api/messages/${matchId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    }).catch(() => {});
  },

  // Teams
  createTeam: (name, dreamStatement) => {
    const team: DreamTeam = {
      id: `team-${Date.now()}`,
      name,
      dreamStatement,
      createdById: CURRENT_USER_ID,
      createdAt: new Date().toISOString(),
      formationStage: "FORMING",
      members: [
        {
          id: `tm-${Date.now()}`,
          teamId: `team-${Date.now()}`,
          userId: CURRENT_USER_ID,
          name: get().currentUser.name,
          avatarUrl: get().currentUser.avatarUrl,
          role: "LEADER",
          joinedAt: new Date().toISOString(),
        },
      ],
      projects: [],
    };

    set((state) => ({
      teams: [...state.teams, team],
    }));

    fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, dreamStatement }),
    }).catch(() => {});
  },

  addTeamMember: (teamId, userId) => {
    set((state) => ({
      teams: state.teams.map((t) => {
        if (t.id !== teamId) return t;
        return {
          ...t,
          members: [
            ...t.members,
            {
              id: `tm-${Date.now()}`,
              teamId,
              userId,
              name: "New Member",
              avatarUrl: "",
              role: "CONTRIBUTOR" as const,
              joinedAt: new Date().toISOString(),
            },
          ],
        };
      }),
    }));
  },

  // Projects
  createProject: (teamId, name, description, skillsNeeded, options) => {
    const project: DreamProject = {
      id: `proj-${Date.now()}`,
      teamId,
      name,
      description,
      stage: "IDEATION",
      skillsNeeded,
      maxTeamSize: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: [],
      isTrial: options?.isTrial ?? false,
      trialDurationWeeks: options?.trialDurationWeeks,
      evaluationCriteria: options?.evaluationCriteria,
      upvotes: 0,
      upvotedBy: [],
    };

    set((state) => ({
      projects: [...state.projects, project],
    }));

    fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, name, description, skillsNeeded, ...options }),
    }).catch(() => {});
  },

  updateTaskStatus: (projectId, taskId, status) => {
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          tasks: p.tasks.map((t) =>
            t.id === taskId ? { ...t, status } : t
          ),
        };
      }),
    }));
  },

  upvoteProject: (projectId) => {
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== projectId) return p;
        const alreadyUpvoted = p.upvotedBy?.includes(CURRENT_USER_ID);
        return {
          ...p,
          upvotes: alreadyUpvoted ? (p.upvotes ?? 1) - 1 : (p.upvotes ?? 0) + 1,
          upvotedBy: alreadyUpvoted
            ? (p.upvotedBy ?? []).filter((id) => id !== CURRENT_USER_ID)
            : [...(p.upvotedBy ?? []), CURRENT_USER_ID],
        };
      }),
    }));
  },

  // Save / Filter
  toggleSaveProfile: (profileId) => {
    set((state) => {
      const saved = state.savedProfiles.includes(profileId)
        ? state.savedProfiles.filter((id) => id !== profileId)
        : [...state.savedProfiles, profileId];
      saveToStorage("dp-savedProfiles", saved);
      return { savedProfiles: saved };
    });
  },

  saveFilter: (name, filters) => {
    const newFilter: SavedFilter = {
      id: `sf-${Date.now()}`,
      name,
      filters,
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const updated = [...state.savedFilters, newFilter];
      saveToStorage("dp-savedFilters", updated);
      return { savedFilters: updated };
    });
  },

  deleteFilter: (filterId) => {
    set((state) => {
      const updated = state.savedFilters.filter((f) => f.id !== filterId);
      saveToStorage("dp-savedFilters", updated);
      return { savedFilters: updated };
    });
  },

  // Team Check-in
  addTeamCheckIn: (checkIn) => {
    const newCheckIn: TeamCheckIn = {
      ...checkIn,
      id: `checkin-${Date.now()}`,
    };
    set((state) => ({
      teamCheckIns: [newCheckIn, ...state.teamCheckIns],
    }));

    fetch(`/api/teams/${checkIn.teamId}/check-ins`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(checkIn),
    }).catch(() => {});
  },

  // Fetch actions
  fetchDiscoverFeed: async (search, minScore) => {
    set({ isLoadingDiscover: true });
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (minScore) params.set("minScore", String(minScore));
      const res = await fetch(`/api/matches/discover?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      set({ discoverFeed: data.matches });
    } catch {
      // Keep existing mock data on failure
    } finally {
      set({ isLoadingDiscover: false });
    }
  },

  fetchMatches: async () => {
    set({ isLoadingMatches: true });
    try {
      const res = await fetch("/api/matches");
      if (!res.ok) return;
      const data = await res.json();
      set({ matches: data.matches });
    } catch {
      // Keep existing mock data on failure
    } finally {
      set({ isLoadingMatches: false });
    }
  },

  fetchMessages: async (matchId) => {
    set({ isLoadingMessages: true });
    try {
      const res = await fetch(`/api/messages/${matchId}`);
      if (!res.ok) return;
      const data = await res.json();
      set((state) => ({
        messagesByMatch: {
          ...state.messagesByMatch,
          [matchId]: data.messages,
        },
      }));
    } catch {
      // Keep existing mock data on failure
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  fetchProfile: async () => {
    try {
      const res = await fetch("/api/dream-profile");
      if (!res.ok) return;
      const data = await res.json();
      if (data.profile) {
        set((state) => ({
          isOnboarded: data.profile.onboardingCompleted ?? false,
          currentUser: {
            ...state.currentUser,
            id: data.profile.id,
            dreamStatement:
              data.profile.dreamStatement ?? state.currentUser.dreamStatement,
            skillsOffered:
              data.profile.skillsOffered ?? state.currentUser.skillsOffered,
            skillsNeeded:
              data.profile.skillsNeeded ?? state.currentUser.skillsNeeded,
            city: data.profile.city ?? state.currentUser.city,
            country: data.profile.country ?? state.currentUser.country,
            bio: data.profile.bio ?? state.currentUser.bio,
            avatarUrl: data.profile.avatarUrl ?? state.currentUser.avatarUrl,
            dreamHeadline:
              data.profile.dreamHeadline ?? state.currentUser.dreamHeadline,
            dreamCategory:
              data.profile.dreamCategory ?? state.currentUser.dreamCategory,
          },
        }));
      }
    } catch {
      // Keep existing mock data on failure
    }
  },

  fetchTeams: async () => {
    set({ isLoadingTeams: true });
    try {
      const res = await fetch("/api/teams");
      if (!res.ok) return;
      const data = await res.json();
      set({ teams: data.teams });
    } catch {
      // Keep mock data
    } finally {
      set({ isLoadingTeams: false });
    }
  },

  fetchProjects: async () => {
    set({ isLoadingProjects: true });
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) return;
      const data = await res.json();
      set({ projects: data.projects });
    } catch {
      // Keep mock data
    } finally {
      set({ isLoadingProjects: false });
    }
  },

  // Set actions
  setDiscoverFeed: (feed) => set({ discoverFeed: feed }),
  setMatches: (matches) => set({ matches }),
  setConversations: (conversations) => set({ conversations }),
  setMessages: (matchId, messages) =>
    set((state) => ({
      messagesByMatch: {
        ...state.messagesByMatch,
        [matchId]: messages,
      },
    })),
}));
