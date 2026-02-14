// ---------------------------------------------------------------------------
// Dream Place — Event Handlers
//
// PUBLISHES:
//   dream.place.match_created     → consumed by Planner (team composition)
//   dream.cafe.doorbell_rung      → consumed by self (trust update)
//
// SUBSCRIBES:
//   dream.cafe.doorbell_rung      → update user trust score (§4.2)
//   dream.store.purchase_verified → update project execution index (§4.3)
//   dream.planner.stage_changed   → recalculate matching weights (§8.5)
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §4.2, §4.3, §8.5
// ---------------------------------------------------------------------------

import { eventBus } from "@dreamhub/event-bus";
import type { EventBus, Subscription } from "@dreamhub/event-bus";
import { STAGE_WEIGHTS, type StageWeights } from "@dreamhub/shared-types";
import type { ProjectStage } from "@dreamhub/shared-types";
import { processDoorbellSignal, resetOfflineSignalState } from "./offline-signals";
import {
  recordTeamSuccess,
  resetTeamPerformanceState,
  type ProjectMetrics,
  type MemberTrait,
} from "./team-performance";

// ═══════════════════════════════════════════════════════════════════════════
// DB persistence (write-through)
// ═══════════════════════════════════════════════════════════════════════════

let trustSignalRepo: {
  create: (data: Record<string, unknown>) => Promise<unknown>;
  getAggregatedTrust: (userId: string, service?: string) => Promise<number>;
  createCafeVisit: (data: Record<string, unknown>) => Promise<unknown>;
} | null = null;

let userRepo: {
  create: (data: Record<string, unknown>) => Promise<unknown>;
  update: (id: string, data: Record<string, unknown>) => Promise<unknown>;
  deleteWithCascade: (id: string) => Promise<void>;
  upsertDreamProfile: (userId: string, data: Record<string, unknown>) => Promise<unknown>;
} | null = null;

function tryLoadRepos(): void {
  if (trustSignalRepo || !process.env.DATABASE_URL) return;
  try {
    const db = require("@dreamhub/database");
    trustSignalRepo = db.trustSignalRepo;
    userRepo = db.userRepo;
  } catch {
    // DB not available
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// §4.2  Doorbell signal weights
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Signal weights from §4.2:
 *   online click (view)  = 1.0
 *   digital doorbell (app) = 1.5
 *   physical doorbell (NFC) = 3.0
 */
export const DOORBELL_WEIGHTS = {
  online: 1.0,
  app: 1.5,
  physical: 3.0,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// In-memory state (fast cache, backed by DB when available)
// ═══════════════════════════════════════════════════════════════════════════

/** Per-user accumulated trust signal score */
const userTrustSignals = new Map<string, number>();

/** Per-project accumulated execution score (from purchases) */
const projectExecutionScores = new Map<string, number>();

/** Per-project current matching weights (updated on stage change) */
const projectWeights = new Map<string, StageWeights>();

/** Per-project metadata needed for §4.3 success pattern evaluation */
const projectMetadata = new Map<
  string,
  {
    category: string;
    goalAmount: number;
    memberTraits: MemberTrait[];
    responseRate: number;
    averageRating: number;
  }
>();

// ═══════════════════════════════════════════════════════════════════════════
// Accessors (for testing and downstream use)
// ═══════════════════════════════════════════════════════════════════════════

export function getTrustSignal(userId: string): number {
  return userTrustSignals.get(userId) ?? 0;
}

export function getExecutionScore(projectId: string): number {
  return projectExecutionScores.get(projectId) ?? 0;
}

export function getProjectWeights(projectId: string): StageWeights | undefined {
  return projectWeights.get(projectId);
}

/**
 * Register project metadata so the PURCHASE_VERIFIED handler can
 * evaluate §4.3 success criteria and record success patterns.
 */
export function registerProjectMetadata(
  projectId: string,
  metadata: {
    category: string;
    goalAmount: number;
    memberTraits: MemberTrait[];
    responseRate: number;
    averageRating: number;
  },
): void {
  projectMetadata.set(projectId, metadata);
}

/** Reset all in-memory state (for testing) */
export function resetState(): void {
  userTrustSignals.clear();
  projectExecutionScores.clear();
  projectWeights.clear();
  projectMetadata.clear();
  placeUsers.clear();
  resetOfflineSignalState();
  resetTeamPerformanceState();
}

// ═══════════════════════════════════════════════════════════════════════════
// Publishers
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Publish a match-created event after the stable matching algorithm runs.
 * Planner consumes this to update team composition.
 */
export async function publishMatchCreated(
  projectId: string,
  matchedUsers: string[],
  matchScore: number,
  bus: EventBus = eventBus,
) {
  return bus.publish("dream.place.match_created", {
    projectId,
    matchedUsers,
    matchScore,
  });
}

/**
 * Publish a doorbell-rung event from the Café module.
 * Place itself consumes this to update trust scores.
 */
export async function publishDoorbellRung(
  sourceUserId: string,
  targetDreamId: string,
  isPhysicalButton: boolean,
  bus: EventBus = eventBus,
) {
  return bus.publish("dream.cafe.doorbell_rung", {
    sourceUserId,
    targetDreamId,
    isPhysicalButton,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Subscriber: DOORBELL_RUNG (from Café → Place)  §4.2
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Handle doorbell-rung events.
 *
 * Physical button presses carry 3.0× weight (§4.2) because physical
 * actions have higher energy cost and are harder to fake.
 *
 * This handler:
 * 1. Accumulates the raw trust signal (for cross-service trust)
 * 2. Delegates to processDoorbellSignal for EWMA preference vector update
 */
function handleDoorbellRung(
  event: { payload: { sourceUserId: string; targetDreamId: string; isPhysicalButton: boolean } },
): void {
  const { sourceUserId, targetDreamId, isPhysicalButton } = event.payload;
  const weight = isPhysicalButton
    ? DOORBELL_WEIGHTS.physical
    : DOORBELL_WEIGHTS.app;
  const current = userTrustSignals.get(sourceUserId) ?? 0;
  userTrustSignals.set(sourceUserId, current + weight);

  // Update user's preference vector via EWMA (§4.2 + §13.1)
  processDoorbellSignal({
    userId: sourceUserId,
    targetDreamId,
    doorbellType: isPhysicalButton ? "PHYSICAL" : "APP",
  });

  // Write-through to DB: persist trust signal and cafe visit
  tryLoadRepos();
  if (trustSignalRepo) {
    const doorbellType = isPhysicalButton ? "PHYSICAL" : "APP";
    trustSignalRepo
      .create({
        user: { connect: { id: sourceUserId } },
        service: "cafe",
        signalType: "doorbell",
        value: weight,
      })
      .catch(() => {});
    trustSignalRepo
      .createCafeVisit({
        user: { connect: { id: sourceUserId } },
        cafeId: targetDreamId,
        doorbellType,
        weight,
      })
      .catch(() => {});
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Subscriber: PURCHASE_VERIFIED (from Store → Place)  §4.3
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Handle purchase-verified events.
 *
 * Each verified purchase increases the project's execution score,
 * validating the team's market performance (§4.3).
 *
 * After accumulating the score, checks if the project has reached
 * success criteria and records the team's vector combination as a
 * success pattern if so.
 */
function handlePurchaseVerified(
  event: { payload: { projectId: string; amount: number } },
): void {
  const { projectId, amount } = event.payload;
  const current = projectExecutionScores.get(projectId) ?? 0;
  const newScore = current + amount;
  projectExecutionScores.set(projectId, newScore);

  // §4.3: Check success criteria and record pattern if met
  const meta = projectMetadata.get(projectId);
  if (meta && meta.goalAmount > 0) {
    const metrics: ProjectMetrics = {
      projectId,
      category: meta.category,
      goalAchievementRate: newScore / meta.goalAmount,
      responseRate: meta.responseRate,
      averageRating: meta.averageRating,
      memberTraits: meta.memberTraits,
    };
    recordTeamSuccess(metrics);
  }

  // Write-through to DB: persist trust signal for purchase
  tryLoadRepos();
  if (trustSignalRepo) {
    trustSignalRepo
      .create({
        user: { connect: { id: projectId } },
        service: "store",
        signalType: "purchase",
        value: amount,
      })
      .catch(() => {});
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Subscriber: STAGE_CHANGED (from Planner → Place)  §8.5
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Handle stage-changed events.
 *
 * When a project transitions lifecycle stages, the matching weights
 * must be recalculated (§8.5):
 *   IDEATION  → vision=0.5, skill=0.1, trust=0.1, psych=0.3
 *   BUILDING  → vision=0.2, skill=0.5, trust=0.2, psych=0.1
 *   SCALING   → vision=0.1, skill=0.3, trust=0.5, psych=0.1
 */
function handleStageChanged(
  event: { payload: { projectId: string; newStage: ProjectStage } },
): void {
  const { projectId, newStage } = event.payload;
  projectWeights.set(projectId, STAGE_WEIGHTS[newStage]);
}

// ═══════════════════════════════════════════════════════════════════════════
// SSO state — Dream Place user records
// ═══════════════════════════════════════════════════════════════════════════

interface PlaceUserRecord {
  userId: string;
  name: string;
  dnaInitialized: boolean;
  coldStartStrategy: string;
  createdAt: string;
}

const placeUsers = new Map<string, PlaceUserRecord>();

export function getPlaceUser(userId: string): PlaceUserRecord | undefined {
  return placeUsers.get(userId);
}

export function getAllPlaceUsers(): Map<string, PlaceUserRecord> {
  return placeUsers;
}

// ═══════════════════════════════════════════════════════════════════════════
// Subscriber: USER_REGISTERED (from Auth → Place)
// ═══════════════════════════════════════════════════════════════════════════

function handleUserRegistered(
  event: { payload: { userId: string; name: string } },
): void {
  const { userId, name } = event.payload;
  placeUsers.set(userId, {
    userId,
    name,
    dnaInitialized: false,
    coldStartStrategy: "CONTENT_INIT",
    createdAt: new Date().toISOString(),
  });

  // Write-through: create Dream Profile in DB
  tryLoadRepos();
  if (userRepo) {
    userRepo
      .upsertDreamProfile(userId, { dreamStatement: "" })
      .catch(() => {});
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Subscriber: USER_UPDATED (from Auth → Place)
// ═══════════════════════════════════════════════════════════════════════════

function handleUserUpdated(
  event: { payload: { userId: string; changes: { name?: string } } },
): void {
  const record = placeUsers.get(event.payload.userId);
  if (!record) return;

  const { changes } = event.payload;
  if (changes.name !== undefined) record.name = changes.name;

  tryLoadRepos();
  if (userRepo) {
    userRepo.update(event.payload.userId, changes).catch(() => {});
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Subscriber: USER_DELETED (from Auth → Place)
// ═══════════════════════════════════════════════════════════════════════════

function handleUserDeleted(
  event: { payload: { userId: string } },
): void {
  placeUsers.delete(event.payload.userId);
  userTrustSignals.delete(event.payload.userId);

  tryLoadRepos();
  if (userRepo) {
    userRepo.deleteWithCascade(event.payload.userId).catch(() => {});
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Team member join → auto-add to project chat room
// ═══════════════════════════════════════════════════════════════════════════

let chatIntegration: {
  addTeamMember: (
    teamId: string,
    userId: string,
    userName: string,
    roomManager: unknown,
    messageHandler: unknown,
    io: unknown,
  ) => void;
} | null = null;

/**
 * Call this when a new member joins a team to auto-add them to the
 * team's PROJECT_TEAM chat room with a system message.
 */
export function handleTeamMemberJoined(
  teamId: string,
  userId: string,
  userName: string,
): void {
  if (!chatIntegration) {
    try {
      const cs = require("@dreamhub/chat-service");
      chatIntegration = new cs.ChatEventIntegration();
    } catch {
      // chat-service not available
    }
  }
  // Chat integration requires a running server context;
  // this is a placeholder for when the chat server is embedded.
  // For now, the DB write-through is the primary integration path.
  tryLoadRepos();
  let chatRepoLocal: {
    findRoomByTeamId: (teamId: string) => Promise<{ id: string; participants: string[] } | null>;
    addParticipant: (roomId: string, userId: string) => Promise<unknown>;
    createMessage: (data: {
      roomId: string;
      senderId: string;
      content: string;
      type?: string;
      readBy?: string[];
    }) => Promise<unknown>;
  } | null = null;
  try {
    const db = require("@dreamhub/database");
    chatRepoLocal = db.chatRepo;
  } catch {
    // DB not available
  }
  if (chatRepoLocal) {
    chatRepoLocal
      .findRoomByTeamId(teamId)
      .then((room) => {
        if (!room) return;
        return Promise.all([
          chatRepoLocal!.addParticipant(room.id, userId),
          chatRepoLocal!.createMessage({
            roomId: room.id,
            senderId: "system",
            content: `${userName} joined the team!`,
            type: "SYSTEM",
            readBy: [],
          }),
        ]);
      })
      .catch(() => {});
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Registration
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Register all Place event subscriptions (including SSO auth events).
 * Call once at service startup.
 *
 * @returns Array of subscriptions (for cleanup in tests)
 */
export function registerPlaceEventHandlers(
  bus: EventBus = eventBus,
): Subscription[] {
  return [
    bus.subscribe("dream.cafe.doorbell_rung", handleDoorbellRung),
    bus.subscribe("dream.store.purchase_verified", handlePurchaseVerified),
    bus.subscribe("dream.planner.stage_changed", handleStageChanged),
    bus.subscribe("dream.auth.user_registered", handleUserRegistered),
    bus.subscribe("dream.auth.user_updated", handleUserUpdated),
    bus.subscribe("dream.auth.user_deleted", handleUserDeleted),
  ];
}
