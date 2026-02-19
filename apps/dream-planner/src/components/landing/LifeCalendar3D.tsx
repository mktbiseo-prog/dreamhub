"use client";

import { useRef, useMemo, useCallback, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  TOTAL_CELLS,
  WEEKS_PER_YEAR,
  cellToGrid,
  gridToPosition,
  getCellState,
  cellLabel,
  type CellState,
} from "@/lib/life-calendar";

/* ── Constants ────────────────────────────────────────────────────────────── */

const COLOR_LIVED = new THREE.Color("#FF6B35");
const COLOR_REMAINING = new THREE.Color("#E5E5E5");
const COLOR_REMAINING_DARK = new THREE.Color("#404040");

const CELL_SIZE = 1;
const GAP = 0.2;
const DECADE_GAP = 0.8;

/* ── Types ────────────────────────────────────────────────────────────────── */

interface LifeCalendar3DProps {
  age?: number;
  reducedMotion: boolean;
  darkMode: boolean;
  onHoverCell: (label: string | null, screenX: number, screenY: number) => void;
}

/* ── Component ────────────────────────────────────────────────────────────── */

export function LifeCalendar3D({
  age = 30,
  reducedMotion,
  darkMode,
  onHoverCell,
}: LifeCalendar3DProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const visibleCount = useRef(reducedMotion ? TOTAL_CELLS : 0);
  const animComplete = useRef(reducedMotion);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const { gl } = useThree();

  const colorRemaining = darkMode ? COLOR_REMAINING_DARK : COLOR_REMAINING;

  // Pre-compute grid data
  const cellData = useMemo(() => {
    const data: Array<{ x: number; y: number; z: number; state: CellState }> = [];
    for (let i = 0; i < TOTAL_CELLS; i++) {
      const { row, col } = cellToGrid(i);
      const pos = gridToPosition(row, col, CELL_SIZE, GAP, DECADE_GAP);
      data.push({ ...pos, state: getCellState(i, age) });
    }
    return data;
  }, [age]);

  // Center offset so the grid is centred at origin
  const centerOffset = useMemo(() => {
    const first = cellData[0];
    const last = cellData[TOTAL_CELLS - 1];
    return {
      x: -(last.x + first.x) / 2,
      y: -(last.y + first.y) / 2,
    };
  }, [cellData]);

  // Current week position (for glow mesh)
  const currentWeekPos = useMemo(() => {
    const idx = age * WEEKS_PER_YEAR - 1;
    if (idx < 0 || idx >= TOTAL_CELLS) return null;
    const cell = cellData[idx];
    return new THREE.Vector3(
      cell.x + centerOffset.x,
      cell.y + centerOffset.y,
      0.15,
    );
  }, [age, cellData, centerOffset]);

  // Initialise instance matrices & colours
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const colorArr = new Float32Array(TOTAL_CELLS * 3);

    for (let i = 0; i < TOTAL_CELLS; i++) {
      const cell = cellData[i];
      dummy.position.set(cell.x + centerOffset.x, cell.y + centerOffset.y, 0);
      const visible = reducedMotion || i < visibleCount.current;
      dummy.scale.set(visible ? 1 : 0, visible ? 1 : 0, visible ? 1 : 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      const color = cell.state === "remaining" ? colorRemaining : COLOR_LIVED;
      colorArr[i * 3] = color.r;
      colorArr[i * 3 + 1] = color.g;
      colorArr[i * 3 + 2] = color.b;
    }

    mesh.instanceMatrix.needsUpdate = true;
    mesh.geometry.setAttribute(
      "color",
      new THREE.InstancedBufferAttribute(colorArr, 3),
    );
  }, [cellData, centerOffset, dummy, reducedMotion, colorRemaining]);

  // Animation loop
  useFrame((_state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    // Fill animation (~2 s)
    if (!animComplete.current) {
      const perFrame = Math.ceil(TOTAL_CELLS / (2.0 / Math.min(delta, 0.05)));
      const prev = visibleCount.current;
      visibleCount.current = Math.min(TOTAL_CELLS, visibleCount.current + perFrame);

      for (let i = prev; i < visibleCount.current; i++) {
        const cell = cellData[i];
        dummy.position.set(cell.x + centerOffset.x, cell.y + centerOffset.y, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }

      if (visibleCount.current >= TOTAL_CELLS) animComplete.current = true;
      mesh.instanceMatrix.needsUpdate = true;
    }

    // Glow pulse
    if (glowRef.current) {
      const t = _state.clock.getElapsedTime();
      const s = 1.2 + Math.sin(t * 3) * 0.3;
      glowRef.current.scale.set(s, s, s);
    }
  });

  // Hover handlers
  const handlePointerOver = useCallback(
    (e: THREE.Event) => {
      const ev = e as unknown as {
        instanceId?: number;
        clientX: number;
        clientY: number;
        stopPropagation: () => void;
      };
      if (ev.instanceId === undefined) return;
      ev.stopPropagation();

      onHoverCell(cellLabel(ev.instanceId), ev.clientX, ev.clientY);
      gl.domElement.style.cursor = "pointer";

      const mesh = meshRef.current;
      if (!mesh) return;
      const cell = cellData[ev.instanceId];
      dummy.position.set(
        cell.x + centerOffset.x,
        cell.y + centerOffset.y,
        0.15,
      );
      dummy.scale.set(1.5, 1.5, 1.5);
      dummy.updateMatrix();
      mesh.setMatrixAt(ev.instanceId, dummy.matrix);
      mesh.instanceMatrix.needsUpdate = true;
    },
    [cellData, centerOffset, dummy, onHoverCell, gl],
  );

  const handlePointerOut = useCallback(
    (e: THREE.Event) => {
      const ev = e as unknown as {
        instanceId?: number;
        stopPropagation: () => void;
      };
      if (ev.instanceId === undefined) return;

      onHoverCell(null, 0, 0);
      gl.domElement.style.cursor = "default";

      const mesh = meshRef.current;
      if (!mesh) return;
      const cell = cellData[ev.instanceId];
      dummy.position.set(cell.x + centerOffset.x, cell.y + centerOffset.y, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(ev.instanceId, dummy.matrix);
      mesh.instanceMatrix.needsUpdate = true;
    },
    [cellData, centerOffset, dummy, onHoverCell, gl],
  );

  return (
    <>
      {/* 5,200 cells — single draw call */}
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, TOTAL_CELLS]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={[CELL_SIZE * 0.85, CELL_SIZE * 0.85, 0.25]} />
        <meshStandardMaterial vertexColors toneMapped={false} />
      </instancedMesh>

      {/* Glow on current week */}
      {currentWeekPos && (
        <mesh ref={glowRef} position={currentWeekPos}>
          <boxGeometry args={[CELL_SIZE * 0.85, CELL_SIZE * 0.85, 0.25]} />
          <meshStandardMaterial
            color="#FF6B35"
            emissive="#FF6B35"
            emissiveIntensity={2}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}

      {/* Subtle point light near current week */}
      {currentWeekPos && (
        <pointLight
          position={[currentWeekPos.x, currentWeekPos.y, 2]}
          color="#FF6B35"
          intensity={3}
          distance={8}
        />
      )}

      {/* Scene lighting */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[20, 20, 30]} intensity={0.6} />
    </>
  );
}
