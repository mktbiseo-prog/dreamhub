/* ---------------------------------------------------------------------------
 * Life Calendar — Pure computation module
 *
 * A human life visualised as a grid of weeks:
 *   52 columns (weeks per year) × 100 rows (years) = 5,200 cells.
 * --------------------------------------------------------------------------- */

export const WEEKS_PER_YEAR = 52;
export const TOTAL_YEARS = 100;
export const TOTAL_CELLS = WEEKS_PER_YEAR * TOTAL_YEARS; // 5,200
export const DEFAULT_AGE = 30;

// ── Derived stats ────────────────────────────────────────────────────────────

export function weeksLived(age: number): number {
  return age * WEEKS_PER_YEAR;
}

export function percentLived(age: number): number {
  return Math.round((weeksLived(age) / TOTAL_CELLS) * 100);
}

export function weeksRemaining(age: number): number {
  return TOTAL_CELLS - weeksLived(age);
}

// ── Grid helpers ─────────────────────────────────────────────────────────────

export function cellToGrid(index: number): { row: number; col: number } {
  return {
    row: Math.floor(index / WEEKS_PER_YEAR),
    col: index % WEEKS_PER_YEAR,
  };
}

/**
 * Convert (row, col) → 3D world position.
 * Adds an extra gap every 10 rows to visually separate decades.
 */
export function gridToPosition(
  row: number,
  col: number,
  cellSize: number,
  gap: number,
  decadeGap: number,
): { x: number; y: number; z: number } {
  const decadeIndex = Math.floor(row / 10);
  return {
    x: col * (cellSize + gap),
    y: -(row * (cellSize + gap) + decadeIndex * decadeGap),
    z: 0,
  };
}

// ── Cell state ───────────────────────────────────────────────────────────────

export type CellState = "lived" | "current" | "remaining";

export function getCellState(index: number, age: number): CellState {
  const lived = weeksLived(age);
  if (index < lived - 1) return "lived";
  if (index === lived - 1) return "current";
  return "remaining";
}

export function cellLabel(index: number): string {
  const { row, col } = cellToGrid(index);
  return `Age ${row} · Week ${col + 1}`;
}

export function cellSubtext(index: number, age: number): string {
  const state = getCellState(index, age);
  if (state === "current") return "You are here.";
  if (state === "lived") return "You were here.";
  return "Not yet written.";
}
