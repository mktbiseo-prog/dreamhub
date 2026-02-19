"use client";

import { useRef, useEffect, useCallback } from "react";
import {
  TOTAL_CELLS,
  WEEKS_PER_YEAR,
  TOTAL_YEARS,
  cellToGrid,
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
const COLOR_REMAINING = "rgba(0,0,0,0.06)";
const COLOR_REMAINING_DARK = "rgba(255,255,255,0.08)";

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
  labelW: number;
  gridW: number;
  gridH: number;
  offsetX: number;
  offsetY: number;
}

function computeMetrics(
  containerW: number,
  containerH: number,
): GridMetrics {
  const labelW = 28;

  // Fit by height
  const gapRatio = 0.22;
  const decadeGapRatio = 0.6;
  const rowCount = TOTAL_YEARS;
  const decadeGaps = 9;

  // cellSize * (rowCount + gapRatio*(rowCount-1) + decadeGapRatio*decadeGaps) = containerH - padding
  const availH = containerH - 16;
  const factor =
    rowCount + gapRatio * (rowCount - 1) + decadeGapRatio * decadeGaps;
  let cellSize = availH / factor;

  // Also check width constraint
  const availW = containerW - labelW - 12;
  const wFactor = WEEKS_PER_YEAR + gapRatio * (WEEKS_PER_YEAR - 1);
  const cellSizeByW = availW / wFactor;

  cellSize = Math.min(cellSize, cellSizeByW);
  cellSize = Math.max(2, cellSize);

  const gap = cellSize * gapRatio;
  const decadeGap = cellSize * decadeGapRatio;
  const gridW = WEEKS_PER_YEAR * cellSize + (WEEKS_PER_YEAR - 1) * gap;
  const gridH =
    rowCount * cellSize + (rowCount - 1) * gap + decadeGaps * decadeGap;

  const offsetX = labelW + (containerW - labelW - gridW) / 2;
  const offsetY = (containerH - gridH) / 2;

  return { cellSize, gap, decadeGap, labelW, gridW, gridH, offsetX, offsetY };
}

function getCellXY(
  row: number,
  col: number,
  m: GridMetrics,
): { x: number; y: number } {
  const decade = Math.floor(row / 10);
  return {
    x: m.offsetX + col * (m.cellSize + m.gap),
    y: m.offsetY + row * (m.cellSize + m.gap) + decade * m.decadeGap,
  };
}

function hitTest(
  mx: number,
  my: number,
  m: GridMetrics,
): { index: number; row: number; col: number } | null {
  for (let row = 0; row < TOTAL_YEARS; row++) {
    for (let col = 0; col < WEEKS_PER_YEAR; col++) {
      const { x, y } = getCellXY(row, col, m);
      if (mx >= x && mx <= x + m.cellSize && my >= y && my <= y + m.cellSize) {
        return { index: row * WEEKS_PER_YEAR + col, row, col };
      }
    }
  }
  return null;
}

/* ── Rounded rect helper ──────────────────────────────────────────────────── */

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
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
  const animStartRef = useRef<number | null>(null);
  const revealRef = useRef(0); // 0→1
  const hoverRef = useRef<{ index: number; row: number } | null>(null);
  const rafRef = useRef(0);

  const lived = weeksLived(age);
  const maxLivedRow = Math.floor((lived - 1) / WEEKS_PER_YEAR);
  const remainColor = darkMode ? COLOR_REMAINING_DARK : COLOR_REMAINING;

  // ── Draw ──────────────────────────────────────────────────────────────
  const draw = useCallback(
    (time: number) => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      // Resize canvas if needed
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.scale(dpr, dpr);
      } else {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      const m = computeMetrics(w, h);
      metricsRef.current = m;

      ctx.clearRect(0, 0, w, h);

      // ── Reveal animation ───────────────────────────────────────────
      if (animStartRef.current === null) animStartRef.current = time;
      const elapsed = (time - animStartRef.current) / 1000;
      const animDuration = 1.8;
      const progress = Math.min(elapsed / animDuration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      revealRef.current = eased;
      onRevealProgress?.(eased);

      const revealedCells = Math.floor(eased * TOTAL_CELLS);
      const hoveredRow = hoverRef.current?.row ?? -1;
      const hoveredIdx = hoverRef.current?.index ?? -1;
      const radius = Math.max(1, m.cellSize * 0.2);

      // ── Decade labels ──────────────────────────────────────────────
      const fontSize = Math.max(7, Math.min(11, m.cellSize * 0.9));
      ctx.font = `500 ${fontSize}px ui-monospace, 'SF Mono', monospace`;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";

      for (let decade = 0; decade < 10; decade++) {
        const row = decade * 10;
        const { y } = getCellXY(row, 0, m);
        const labelY = y + m.cellSize / 2;
        const labelAlpha = revealedCells > row * WEEKS_PER_YEAR ? 1 : 0;
        ctx.fillStyle = darkMode
          ? `rgba(115,115,115,${labelAlpha})`
          : `rgba(212,212,212,${labelAlpha})`;
        ctx.fillText(`${decade * 10}`, m.offsetX - 6, labelY);
      }

      // ── Row highlight ──────────────────────────────────────────────
      if (hoveredRow >= 0) {
        const { y } = getCellXY(hoveredRow, 0, m);
        ctx.fillStyle = darkMode ? "rgba(255,255,255,0.03)" : "rgba(255,107,53,0.03)";
        ctx.fillRect(m.offsetX - 2, y - 1, m.gridW + 4, m.cellSize + 2);
      }

      // ── Cells ──────────────────────────────────────────────────────
      for (let i = 0; i < TOTAL_CELLS; i++) {
        if (i >= revealedCells) break;

        const row = Math.floor(i / WEEKS_PER_YEAR);
        const col = i % WEEKS_PER_YEAR;
        const { x, y } = getCellXY(row, col, m);
        const state = getCellState(i, age);

        // Color
        if (state === "remaining") {
          ctx.fillStyle = remainColor;
        } else if (state === "current") {
          ctx.fillStyle = "#FF6B35";
        } else {
          // Gradient: light orange (early) → vivid orange (recent)
          const t = maxLivedRow > 0 ? row / maxLivedRow : 1;
          ctx.fillStyle = lerpRGB(COLOR_START, COLOR_END, t);
        }

        // Hover: skip normal draw, will draw enlarged version after
        if (i === hoveredIdx) continue;

        drawRoundedRect(ctx, x, y, m.cellSize, m.cellSize, radius);
        ctx.fill();
      }

      // ── Current week glow ──────────────────────────────────────────
      const currentIdx = lived - 1;
      if (currentIdx >= 0 && currentIdx < revealedCells && currentIdx !== hoveredIdx) {
        const row = Math.floor(currentIdx / WEEKS_PER_YEAR);
        const col = currentIdx % WEEKS_PER_YEAR;
        const { x, y } = getCellXY(row, col, m);

        const pulsePhase = Math.sin(time / 500) * 0.5 + 0.5; // 0→1
        const glowSize = 4 + pulsePhase * 4;
        const glowAlpha = 0.3 + pulsePhase * 0.3;

        ctx.save();
        ctx.shadowColor = `rgba(255,107,53,${glowAlpha})`;
        ctx.shadowBlur = glowSize;
        ctx.fillStyle = "#FF6B35";
        drawRoundedRect(ctx, x, y, m.cellSize, m.cellSize, radius);
        ctx.fill();
        ctx.restore();
      }

      // ── Hovered cell (enlarged) ────────────────────────────────────
      if (hoveredIdx >= 0 && hoveredIdx < revealedCells) {
        const row = Math.floor(hoveredIdx / WEEKS_PER_YEAR);
        const col = hoveredIdx % WEEKS_PER_YEAR;
        const { x, y } = getCellXY(row, col, m);
        const state = getCellState(hoveredIdx, age);

        const scale = 1.6;
        const enlargedSize = m.cellSize * scale;
        const offset = (enlargedSize - m.cellSize) / 2;

        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.15)";
        ctx.shadowBlur = 6;

        if (state === "remaining") {
          ctx.fillStyle = darkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)";
        } else {
          const t = maxLivedRow > 0 ? row / maxLivedRow : 1;
          ctx.fillStyle = lerpRGB(COLOR_START, COLOR_END, Math.min(t * 1.1, 1));
        }

        drawRoundedRect(
          ctx,
          x - offset,
          y - offset,
          enlargedSize,
          enlargedSize,
          radius * scale,
        );
        ctx.fill();
        ctx.restore();
      }

      // ── Continue animation ─────────────────────────────────────────
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(draw);
      } else {
        // After initial animation, keep drawing for pulse + hover
        rafRef.current = requestAnimationFrame(draw);
      }
    },
    [age, lived, maxLivedRow, darkMode, remainColor, onRevealProgress],
  );

  // ── Start animation ───────────────────────────────────────────────────
  useEffect(() => {
    animStartRef.current = null;
    revealRef.current = 0;
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  // ── Mouse handlers ────────────────────────────────────────────────────
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const m = metricsRef.current;
      if (!m) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const hit = hitTest(mx, my, m);
      if (hit) {
        hoverRef.current = { index: hit.index, row: hit.row };
        onHoverCell({
          label: cellLabel(hit.index),
          subtext: cellSubtext(hit.index, age),
          x: e.clientX,
          y: e.clientY,
        });
      } else {
        hoverRef.current = null;
        onHoverCell(null);
      }
    },
    [age, onHoverCell],
  );

  const handleMouseLeave = useCallback(() => {
    hoverRef.current = null;
    onHoverCell(null);
  }, [onHoverCell]);

  return (
    <div ref={containerRef} className="h-full w-full">
      <canvas
        ref={canvasRef}
        className="h-full w-full cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
}
