// ---------------------------------------------------------------------------
// Batch Scheduler — manages daily batch matching rate limits
//
// Uses localStorage for demo persistence. In production, this would be
// backed by a database/Redis store.
// ---------------------------------------------------------------------------

const STORAGE_KEY_PREFIX = "dp-batch-scheduler-";
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

function getStorageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

export class BatchScheduler {
  /**
   * Store the next allowed run timestamp for a user.
   * Sets the next run time to 24 hours from now.
   */
  scheduleDaily(userId: string): void {
    if (typeof window === "undefined") return;
    try {
      const now = Date.now();
      const data = {
        lastRunTime: now,
        nextRunTime: now + TWENTY_FOUR_HOURS_MS,
      };
      localStorage.setItem(getStorageKey(userId), JSON.stringify(data));
    } catch {
      // Storage unavailable
    }
  }

  /**
   * Check if 24 hours have passed since the last batch run.
   * Returns true if the user can run a new batch.
   */
  canRunBatch(userId: string): boolean {
    if (typeof window === "undefined") return true;
    try {
      const stored = localStorage.getItem(getStorageKey(userId));
      if (!stored) return true;

      const data = JSON.parse(stored) as { nextRunTime: number };
      return Date.now() >= data.nextRunTime;
    } catch {
      return true;
    }
  }

  /**
   * Returns the ISO string of the last batch run time, or null if never run.
   */
  getLastRunTime(userId: string): string | null {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(getStorageKey(userId));
      if (!stored) return null;

      const data = JSON.parse(stored) as { lastRunTime: number };
      return new Date(data.lastRunTime).toISOString();
    } catch {
      return null;
    }
  }

  /**
   * Returns the remaining cooldown time in milliseconds, or 0 if ready.
   */
  getRemainingCooldown(userId: string): number {
    if (typeof window === "undefined") return 0;
    try {
      const stored = localStorage.getItem(getStorageKey(userId));
      if (!stored) return 0;

      const data = JSON.parse(stored) as { nextRunTime: number };
      const remaining = data.nextRunTime - Date.now();
      return Math.max(0, remaining);
    } catch {
      return 0;
    }
  }

  /**
   * Format remaining cooldown as a human-readable string.
   */
  formatCooldown(userId: string): string {
    const remaining = this.getRemainingCooldown(userId);
    if (remaining <= 0) return "Ready";

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
}

/** Singleton instance for convenience */
export const batchScheduler = new BatchScheduler();
