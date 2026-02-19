"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import {
  TOTAL_CELLS,
  WEEKS_PER_YEAR,
  TOTAL_YEARS,
  getCellState,
  cellLabel,
  cellSubtext,
  weeksLived,
} from "@/lib/life-calendar";

/* ── Color helpers ────────────────────────────────────────────────────────── */

function lerpRGB(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r},${g},${bl})`;
}

const COLOR_START: [number, number, number] = [255, 173, 133]; // #FFAD85
const COLOR_END: [number, number, number] = [255, 107, 53]; // #FF6B35

/* ── Types ────────────────────────────────────────────────────────────────── */

export interface HoverInfo {
  label: string;
  subtext: string;
  x: number;
  y: number;
}

interface LifeCalendarGridProps {
  age: number;
  darkMode: boolean;
  onHoverCell: (info: HoverInfo | null) => void;
  onRevealProgress?: (progress: number) => void;
}

/* ── Grid metrics ─────────────────────────────────────────────────────────── */

interface GridMetrics {
  cellSize: number;
  gap: number;
  decadeGap: number;
  gridW: number;
  gridH: number;
  offsetX: number;
  offsetY: number;
}

function computeMetrics(containerW: number, containerH: number): GridMetrics | null {
  if (containerW < 10 || containerH < 10) return null;

  const labelW = 28;
  const gapRatio = 0.22;
  const decadeGapRatio = 0.6;

  const availH = containerH - 16;
  const hFactor = TOTAL_YEARS + gapRatio * (TOTAL_YEARS - 1) + decadeGapRatio * 9;
  let cellSize = availH / hFactor;

  const availW = containerW - labelW - 12;
  const wFactor = WEEKS_PER_YEAR + gapRatio * (WEEKS_PER_YEAR - 1);
  cellSize = Math.min(cellSize, availW / wFactor);
  cellSize = Math.max(2, cellSize);

  const gap = cellSize * gapRatio;
  const decadeGap = cellSize * decadeGapRatio;
  const gridW = WEEKS_PER_YEAR * cellSize + (WEEKS_PER_YEAR - 1) * gap;
  const gridH = TOTAL_YEARS * cellSize + (TOTAL_YEARS - 1) * gap + 9 * decadeGap;

  const offsetX = labelW + (containerW - labelW - gridW) / 2;
  const offsetY = (containerH - gridH) / 2;

  return { cellSize, gap, decadeGap, gridW, gridH, offsetX, offsetY };
}

function getCellXY(row: number, col: number, m: GridMetrics) {
  const decade = Math.floor(row / 10);
  return {
    x: m.offsetX + col * (m.cellSize + m.gap),
    y: m.offsetY + row * (m.cellSize + m.gap) + decade * m.decadeGap,
  };
}

function hitTest(mx: number, my: number, m: GridMetrics) {
  for (let row = 0; row < TOTAL_YEARS; row++) {
    const { y } = getCellXY(row, 0, m);
    if (my < y) continue;
    if (my > y + m.cellSize) continue;
    for (let col = 0; col < WEEKS_PER_YEAR; col++) {
      const { x } = getCellXY(row, col, m);
      if (mx >= x && mx <= x + m.cellSize) {
        return { index: row * WEEKS_PER_YEAR + col, row, col };
      }
    }
    break;
  }
  return null;
}

/* ── Drawing helpers ─────────────────────────────────────────────────────── */

function drawGrid(
  ctx: CanvasRenderingContext2D,
  m: GridMetrics,
  lived: number,
  maxLivedRow: number,
  remainColor: string,
  darkMode: boolean,
  hovIdx: number,
  hovRow: number,
) {
  // Decade labels
  const fontSize = Math.max(7, Math.min(11, m.cellSize * 0.9));
  ctx.font = `500 ${fontSize}px ui-monospace, 'SF Mono', monospace`;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  for (let decade = 0; decade < 10; decade++) {
    const row = decade * 10;
    const { y } = getCellXY(row, 0, m);
    ctx.fillStyle = darkMode ? "rgba(115,115,115,0.8)" : "#D4D4D4";
    ctx.fillText(`${decade * 10}`, m.offsetX - 6, y + m.cellSize / 2);
  }

  // Row highlight for hover
  if (hovRow >= 0) {
    const { y } = getCellXY(hovRow, 0, m);
    ctx.fillStyle = darkMode ? "rgba(255,255,255,0.03)" : "rgba(255,107,53,0.035)";
    ctx.fillRect(m.offsetX - 2, y - 1, m.gridW + 4, m.cellSize + 2);
  }

  // Remaining cells (batched)
  ctx.fillStyle = remainColor;
  for (let i = lived; i < TOTAL_CELLS; i++) {
    if (i === hovIdx) continue;
    const row = Math.floor(i / WEEKS_PER_YEAR);
    const col = i % WEEKS_PER_YEAR;
    const { x, y } = getCellXY(row, col, m);
    ctx.fillRect(x, y, m.cellSize, m.cellSize);
  }

  // Lived cells (batched by row for gradient)
  let lastRow = -1;
  for (let i = 0; i < lived - 1; i++) {
    if (i === hovIdx) continue;
    const row = Math.floor(i / WEEKS_PER_YEAR);
    const col = i % WEEKS_PER_YEAR;
    if (row !== lastRow) {
      const t = maxLivedRow > 0 ? row / maxLivedRow : 1;
      ctx.fillStyle = lerpRGB(COLOR_START, COLOR_END, Math.min(t, 1));
      lastRow = row;
    }
    const { x, y } = getCellXY(row, col, m);
    ctx.fillRect(x, y, m.cellSize, m.cellSize);
  }

  // Current week (bright, slightly larger for emphasis)
  const currentIdx = lived - 1;
  if (currentIdx >= 0 && currentIdx < TOTAL_CELLS && currentIdx !== hovIdx) {
    const row = Math.floor(currentIdx / WEEKS_PER_YEAR);
    const col = currentIdx % WEEKS_PER_YEAR;
    const { x, y } = getCellXY(row, col, m);
    const pad = m.cellSize * 0.15;
    ctx.fillStyle = "#FF6B35";
    ctx.fillRect(x - pad, y - pad, m.cellSize + pad * 2, m.cellSize + pad * 2);
  }

  // Hovered cell (enlarged)
  if (hovIdx >= 0 && hovIdx < TOTAL_CELLS) {
    const hrow = Math.floor(hovIdx / WEEKS_PER_YEAR);
    const hcol = hovIdx % WEEKS_PER_YEAR;
    const { x, y } = getCellXY(hrow, hcol, m);
    const state = getCellState(hovIdx, lived > hovIdx ? lived : hovIdx + 1);
    const scale = 1.6;
    const sz = m.cellSize * scale;
    const off = (sz - m.cellSize) / 2;

    if (state === "remaining") {
      ctx.fillStyle = darkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)";
    } else {
      const t = maxLivedRow > 0 ? hrow / maxLivedRow : 1;
      ctx.fillStyle = lerpRGB(COLOR_START, COLOR_END, Math.min(t * 1.1, 1));
    }
    ctx.fillRect(x - off, y - off, sz, sz);
  }
}

/* ── Component ────────────────────────────────────────────────────────────── */

export function LifeCalendarGrid({
  age,
  darkMode,
  onHoverCell,
  onRevealProgress,
}: LifeCalendarGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<GridMetrics | null>(null);
  const [ready, setReady] = useState(false);

  const onHoverCellRef = useRef(onHoverCell);
  onHoverCellRef.current = onHoverCell;
  const onRevealProgressRef = useRef(onRevealProgress);
  onRevealProgressRef.current = onRevealProgress;

  const lived = weeksLived(age);
  const maxLivedRow = Math.floor(Math.max(0, lived - 1) / WEEKS_PER_YEAR);
  const remainColor = darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";

  // ── Single draw (no animation loop) ─────────────────────────────────
  const renderGrid = useCallback(
    (hovIdx = -1, hovRow = -1) => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      const targetW = Math.round(w * dpr);
      const targetH = Math.round(h * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const m = computeMetrics(w, h);
      if (!m) return;
      metricsRef.current = m;

      ctx.clearRect(0, 0, w, h);
      drawGrid(ctx, m, lived, maxLivedRow, remainColor, darkMode, hovIdx, hovRow);
    },
    [lived, maxLivedRow, remainColor, darkMode],
  );

  // Initial draw + CSS reveal
  useEffect(() => {
    // Small delay so container has layout
    const timer = setTimeout(() => {
      renderGrid();
      setReady(true);
      onRevealProgressRef.current?.(1);
    }, 50);

    return () => clearTimeout(timer);
  }, [renderGrid]);

  // Resize handler
  useEffect(() => {
    const handleResize = () => renderGrid();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [renderGrid]);

  // ── Mouse handlers ─────────────────────────────────────────────────
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const m = metricsRef.current;
      if (!m) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const hit = hitTest(mx, my, m);
      if (hit) {
        renderGrid(hit.index, hit.row);
        onHoverCellRef.current({
          label: cellLabel(hit.index),
          subtext: cellSubtext(hit.index, age),
          x: e.clientX,
          y: e.clientY,
        });
      } else {
        renderGrid();
        onHoverCellRef.current(null);
      }
    },
    [age, renderGrid],
  );

  const handleMouseLeave = useCallback(() => {
    renderGrid();
    onHoverCellRef.current(null);
  }, [renderGrid]);

  return (
    <div ref={containerRef} className="h-full w-full">
      <canvas
        ref={canvasRef}
        className="h-full w-full cursor-crosshair transition-opacity duration-1000 ease-out"
        style={{ opacity: ready ? 1 : 0 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
}
