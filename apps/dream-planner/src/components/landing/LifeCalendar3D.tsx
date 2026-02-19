"use client";

import { useRef, useMemo, useCallback, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  TOTAL_CELLS,
  WEEKS_PER_YEAR,
  TOTAL_YEARS,
  cellToGrid,
  gridToPosition,
  getCellState,
  cellLabel,
  type CellState,
} from "@/lib/life-calendar";

/* ── Color palette ────────────────────────────────────────────────────────── */

// Decade-based gradient for lived weeks (warm progression)
const DECADE_COLORS = [
  new THREE.Color("#FFCDB2"), // 0-9   — soft peach (childhood)
  new THREE.Color("#FFB088"), // 10-19 — light salmon
  new THREE.Color("#FF9966"), // 20-29 — warm orange
  new THREE.Color("#FF6B35"), // 30-39 — vivid orange (prime)
  new THREE.Color("#E85A24"), // 40-49 — deep orange
  new THREE.Color("#C44A1A"), // 50-59 — burnt orange
  new THREE.Color("#A03A15"), // 60-69 — dark rust
  new THREE.Color("#7C2D10"), // 70-79 — deep brown
  new THREE.Color("#5C2108"), // 80-89 — dark brown
  new THREE.Color("#3D1505"), // 90-99 — near black
];

const COLOR_REMAINING = new THREE.Color("#E8E8E8");
const COLOR_REMAINING_DARK = new THREE.Color("#2A2A2A");

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
  const glowRingRef = useRef<THREE.Mesh>(null);
  const visibleCount = useRef(reducedMotion ? TOTAL_CELLS : 0);
  const animComplete = useRef(reducedMotion);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const { gl } = useThree();

  const colorRemaining = darkMode ? COLOR_REMAINING_DARK : COLOR_REMAINING;

  // Pre-compute grid data with height based on state
  const cellData = useMemo(() => {
    const data: Array<{
      x: number;
      y: number;
      z: number;
      state: CellState;
      decade: number;
    }> = [];
    for (let i = 0; i < TOTAL_CELLS; i++) {
      const { row, col } = cellToGrid(i);
      const pos = gridToPosition(row, col, CELL_SIZE, GAP, DECADE_GAP);
      const state = getCellState(i, age);
      // Lived cells get slight Z elevation — more recent = taller
      const z = state === "remaining" ? 0 : 0.1 + (row / TOTAL_YEARS) * 0.4;
      data.push({ ...pos, z, state, decade: Math.floor(row / 10) });
    }
    return data;
  }, [age]);

  // Center offset
  const centerOffset = useMemo(() => {
    const first = cellData[0];
    const last = cellData[TOTAL_CELLS - 1];
    return {
      x: -(last.x + first.x) / 2,
      y: -(last.y + first.y) / 2,
    };
  }, [cellData]);

  // Current week position (for glow ring)
  const currentWeekPos = useMemo(() => {
    const idx = age * WEEKS_PER_YEAR - 1;
    if (idx < 0 || idx >= TOTAL_CELLS) return null;
    const cell = cellData[idx];
    return new THREE.Vector3(
      cell.x + centerOffset.x,
      cell.y + centerOffset.y,
      cell.z + 0.3,
    );
  }, [age, cellData, centerOffset]);

  // Initialise instance matrices & colours
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const colorArr = new Float32Array(TOTAL_CELLS * 3);

    for (let i = 0; i < TOTAL_CELLS; i++) {
      const cell = cellData[i];
      dummy.position.set(
        cell.x + centerOffset.x,
        cell.y + centerOffset.y,
        cell.z,
      );
      const visible = reducedMotion || i < visibleCount.current;
      dummy.scale.set(visible ? 1 : 0, visible ? 1 : 0, visible ? 1 : 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      // Color: decade gradient for lived, neutral for remaining
      let color: THREE.Color;
      if (cell.state === "remaining") {
        color = colorRemaining;
      } else {
        color = DECADE_COLORS[Math.min(cell.decade, DECADE_COLORS.length - 1)];
      }
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

    // Fill animation (~2.5 s)
    if (!animComplete.current) {
      const perFrame = Math.ceil(TOTAL_CELLS / (2.5 / Math.min(delta, 0.05)));
      const prev = visibleCount.current;
      visibleCount.current = Math.min(TOTAL_CELLS, visibleCount.current + perFrame);

      for (let i = prev; i < visibleCount.current; i++) {
        const cell = cellData[i];
        dummy.position.set(
          cell.x + centerOffset.x,
          cell.y + centerOffset.y,
          cell.z,
        );
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }

      if (visibleCount.current >= TOTAL_CELLS) animComplete.current = true;
      mesh.instanceMatrix.needsUpdate = true;
    }

    // Glow ring pulse + slow rotation
    if (glowRingRef.current) {
      const t = _state.clock.getElapsedTime();
      const s = 1.0 + Math.sin(t * 2) * 0.15;
      glowRingRef.current.scale.set(s, s, 1);
      glowRingRef.current.rotation.z = t * 0.5;
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
        cell.z + 0.4,
      );
      dummy.scale.set(1.4, 1.4, 1.8);
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
      dummy.position.set(
        cell.x + centerOffset.x,
        cell.y + centerOffset.y,
        cell.z,
      );
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(ev.instanceId, dummy.matrix);
      mesh.instanceMatrix.needsUpdate = true;
    },
    [cellData, centerOffset, dummy, onHoverCell, gl],
  );

  return (
    <>
      {/* 5,200 cells — single draw call, rounded cubes with depth */}
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, TOTAL_CELLS]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[CELL_SIZE * 0.82, CELL_SIZE * 0.82, 0.5]} />
        <meshPhysicalMaterial
          vertexColors
          toneMapped={false}
          roughness={0.35}
          metalness={0.05}
          clearcoat={0.3}
          clearcoatRoughness={0.4}
        />
      </instancedMesh>

      {/* Pulsing glow ring on current week */}
      {currentWeekPos && (
        <mesh ref={glowRingRef} position={currentWeekPos}>
          <ringGeometry args={[0.6, 0.9, 32]} />
          <meshBasicMaterial
            color="#FF6B35"
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Current week beacon light */}
      {currentWeekPos && (
        <pointLight
          position={[currentWeekPos.x, currentWeekPos.y, 3]}
          color="#FF6B35"
          intensity={5}
          distance={12}
        />
      )}

      {/* Decade labels — thin line markers on left edge */}
      {Array.from({ length: 10 }, (_, decade) => {
        const row = decade * 10;
        const pos = gridToPosition(row, 0, CELL_SIZE, GAP, DECADE_GAP);
        return (
          <mesh
            key={decade}
            position={[
              pos.x + centerOffset.x - CELL_SIZE * 1.5,
              pos.y + centerOffset.y,
              0,
            ]}
          >
            <planeGeometry args={[0.4, CELL_SIZE * 0.5]} />
            <meshBasicMaterial
              color={DECADE_COLORS[decade]}
              transparent
              opacity={0.6}
            />
          </mesh>
        );
      })}

      {/* Lighting — cinematic 3-point setup */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[30, 40, 50]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-20, -10, 20]} intensity={0.3} color="#B4D4FF" />
      <pointLight position={[0, 0, 60]} intensity={0.2} color="#FFF5EE" />
    </>
  );
}
