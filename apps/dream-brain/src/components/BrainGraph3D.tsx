"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { CategoryId } from "@/lib/categories";
import type { ThoughtData, ConnectionData } from "@/lib/data";

// ─── Category colors ───────────────────────────────────────────────
const categoryColors: Record<string, number> = {
  work: 0x60a5fa,
  ideas: 0xfacc15,
  emotions: 0xf472b6,
  daily: 0xfb923c,
  learning: 0x34d399,
  relationships: 0xa78bfa,
  health: 0x4ade80,
  finance: 0xfbbf24,
  dreams: 0xc084fc,
};

const categoryColorStrings: Record<string, string> = {
  work: "#60a5fa",
  ideas: "#facc15",
  emotions: "#f472b6",
  daily: "#fb923c",
  learning: "#34d399",
  relationships: "#a78bfa",
  health: "#4ade80",
  finance: "#fbbf24",
  dreams: "#c084fc",
};

// ─── Category → brain-region mapping ───────────────────────────────
interface BrainRegion {
  position: THREE.Vector3;
  radius: number;
  label: string;
}

const brainRegions: Record<CategoryId, BrainRegion> = {
  work: {
    position: new THREE.Vector3(0, 3.0, 4.5),
    radius: 1.8,
    label: "Prefrontal Cortex",
  },
  finance: {
    position: new THREE.Vector3(-3.0, 2.5, 3.5),
    radius: 1.5,
    label: "Left Prefrontal",
  },
  relationships: {
    position: new THREE.Vector3(3.0, 2.5, 3.5),
    radius: 1.5,
    label: "Right Frontal",
  },
  learning: {
    position: new THREE.Vector3(-4.0, 0, 0),
    radius: 1.8,
    label: "Left Temporal",
  },
  ideas: {
    position: new THREE.Vector3(4.0, 0, 0),
    radius: 1.8,
    label: "Right Temporal",
  },
  daily: {
    position: new THREE.Vector3(0, 4.5, 0),
    radius: 1.5,
    label: "Motor Cortex",
  },
  health: {
    position: new THREE.Vector3(0, 3.0, -2.5),
    radius: 1.5,
    label: "Parietal Lobe",
  },
  dreams: {
    position: new THREE.Vector3(0, 1.5, -5.0),
    radius: 1.8,
    label: "Occipital Lobe",
  },
  emotions: {
    position: new THREE.Vector3(0, -0.5, 1.0),
    radius: 1.5,
    label: "Limbic System",
  },
};

// ─── Fibonacci sphere distribution ─────────────────────────────────
function fibonacciSphere(index: number, total: number, radius: number): THREE.Vector3 {
  if (total === 1) return new THREE.Vector3(0, 0, 0);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - (index / (total - 1)) * 2;
  const radiusAtY = Math.sqrt(1 - y * y);
  const theta = goldenAngle * index;
  return new THREE.Vector3(
    Math.cos(theta) * radiusAtY * radius,
    y * radius,
    Math.sin(theta) * radiusAtY * radius
  );
}

// ─── Create glow texture ───────────────────────────────────────────
function createGlowTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  );
  gradient.addColorStop(0, "rgba(255,255,255,0.6)");
  gradient.addColorStop(0.3, "rgba(255,255,255,0.2)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// ─── Create text sprite for region labels ──────────────────────────
function createTextSprite(text: string): THREE.Sprite {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  canvas.width = 256;
  canvas.height = 64;

  ctx.font = "bold 24px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(180, 170, 210, 0.7)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 128, 32);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(4, 1, 1);
  return sprite;
}

// ─── 3D value noise for organic fold generation ────────────────────
function hash3(ix: number, iy: number, iz: number): number {
  let h = (ix * 374761393 + iy * 668265263 + iz * 1274126177) | 0;
  h = ((h ^ (h >> 13)) * 1274126177) | 0;
  h = h ^ (h >> 16);
  return (h & 0x7fffffff) / 0x7fffffff;
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function noise3D(x: number, y: number, z: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fx = smoothstep(x - ix);
  const fy = smoothstep(y - iy);
  const fz = smoothstep(z - iz);

  return lerp(
    lerp(
      lerp(hash3(ix, iy, iz), hash3(ix + 1, iy, iz), fx),
      lerp(hash3(ix, iy + 1, iz), hash3(ix + 1, iy + 1, iz), fx),
      fy
    ),
    lerp(
      lerp(hash3(ix, iy, iz + 1), hash3(ix + 1, iy, iz + 1), fx),
      lerp(hash3(ix, iy + 1, iz + 1), hash3(ix + 1, iy + 1, iz + 1), fx),
      fy
    ),
    fz
  );
}

/** Fractal Brownian Motion — layered noise for organic detail */
function fbm(x: number, y: number, z: number, octaves: number): number {
  let value = 0;
  let amplitude = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * (noise3D(x * freq, y * freq, z * freq) - 0.5) * 2;
    amplitude *= 0.5;
    freq *= 2.2;
  }
  return value;
}

// ─── Deform sphere to look like a brain hemisphere ─────────────────
function createHemisphere(isLeft: boolean): THREE.BufferGeometry {
  // High-resolution sphere so folds are smooth and detailed
  const geometry = new THREE.SphereGeometry(5, 96, 96);
  const positions = geometry.attributes.position;
  const sign = isLeft ? -1 : 1;

  for (let i = 0; i < positions.count; i++) {
    let x = positions.getX(i);
    let y = positions.getY(i);
    let z = positions.getZ(i);

    const len = Math.sqrt(x * x + y * y + z * z);
    if (len === 0) continue;
    const nx = x / len;
    const ny = y / len;
    const nz = z / len;

    // ── Base shape: elongated front-to-back ──
    z *= 1.3;
    x *= 0.92;
    y *= 0.82;

    // ── Flatten bottom (brain base is flat) ──
    if (ny < -0.2) {
      const flatAmt = Math.pow(Math.abs(ny) - 0.2, 0.8) * 0.6;
      y += flatAmt * len;
    }

    // ── Longitudinal fissure: deep medial groove ──
    const medialDist = Math.abs(x);
    const fissureDepth = Math.exp(-medialDist * 3.0) * 2.2;
    x += sign * fissureDepth;

    // ── Frontal lobe: rounded bulge at front ──
    if (nz > 0.2) {
      const frontalStr = Math.pow(Math.max(0, nz - 0.2), 1.2);
      z += frontalStr * 1.0;
      // Frontal lobe rounds outward
      x *= 1.0 + frontalStr * 0.15;
      y *= 1.0 + frontalStr * 0.05;
    }

    // ── Temporal lobe: prominent downward & outward bulge ──
    const temporalZone = Math.max(0, (1 - Math.abs(nz)) * Math.max(0, -ny + 0.15) * Math.abs(nx));
    if (temporalZone > 0) {
      x += sign * temporalZone * 2.0;
      y -= temporalZone * 1.5;
      z += nz * temporalZone * 0.3;
    }

    // ── Occipital lobe: tapers at back ──
    if (nz < -0.5) {
      const occStr = Math.pow(-nz - 0.5, 1.5) * 0.5;
      x *= 1 - occStr * 0.35;
    }

    // ── Parietal dome: raised top-back ──
    if (ny > 0.2 && nz < 0.2) {
      const parStr = Math.max(0, ny - 0.2) * Math.max(0, 0.2 - nz) * 1.2;
      y += parStr;
    }

    // ── Deep sulci & gyri using 3D noise (the key to realistic look) ──
    // Use the original sphere normal for consistent noise sampling
    const noiseX = nx * 3.2 + (isLeft ? 0 : 7.7);
    const noiseY = ny * 3.2;
    const noiseZ = nz * 3.2;

    // Large-scale folds (major sulci) — deep valleys between gyri
    const largeFold = fbm(noiseX * 1.0, noiseY * 1.0, noiseZ * 1.0, 3) * 0.45;
    // Medium-scale wrinkles
    const medFold = fbm(noiseX * 2.1 + 5.3, noiseY * 2.1, noiseZ * 2.1, 3) * 0.2;
    // Fine surface texture
    const fineFold = fbm(noiseX * 4.5 + 11.1, noiseY * 4.5, noiseZ * 4.5, 2) * 0.08;

    // Central sulcus (Rolandic fissure) — prominent groove running top to side
    const centralSulcus =
      Math.exp(-Math.pow(nz + 0.05, 2) * 40) *
      Math.max(0, ny + 0.2) * 0.35;

    // Lateral sulcus (Sylvian fissure) — deep horizontal groove on side
    const lateralSulcus =
      Math.exp(-Math.pow(ny + 0.15, 2) * 25) *
      Math.max(0, Math.abs(nx) - 0.3) *
      Math.max(0, 1 - Math.abs(nz) * 0.8) * 0.3;

    const totalFold = largeFold + medFold + fineFold - centralSulcus - lateralSulcus;

    // Apply fold as radial displacement
    const currentLen = Math.sqrt(x * x + y * y + z * z);
    if (currentLen > 0) {
      const displace = 1 + totalFold;
      x *= displace;
      y *= displace;
      z *= displace;
    }

    positions.setXYZ(i, x, y, z);
  }

  geometry.computeVertexNormals();
  return geometry;
}

// ─── Create cerebellum geometry ────────────────────────────────────
function createCerebellum(): THREE.BufferGeometry {
  const geometry = new THREE.SphereGeometry(2.2, 48, 48);
  const positions = geometry.attributes.position;

  for (let i = 0; i < positions.count; i++) {
    let x = positions.getX(i);
    let y = positions.getY(i);
    let z = positions.getZ(i);

    const len = Math.sqrt(x * x + y * y + z * z);
    if (len === 0) continue;
    const nx = x / len;
    const ny = y / len;

    // Flatten vertically, widen
    y *= 0.5;
    x *= 1.25;
    z *= 0.85;

    // Two-lobe shape: deep medial vermis groove
    const medialGroove = Math.exp(-Math.abs(nx) * 5) * 0.4;
    y -= medialGroove;

    // Characteristic horizontal folia — tight layered ridges
    const folia =
      Math.sin(ny * 25.0) * 0.1 +
      Math.sin(ny * 18.0 + nx * 2.0) * 0.07 +
      Math.sin(ny * 12.0 + nx * 4.0 + len * 3.0) * 0.05;

    x *= 1 + folia;
    y *= 1 + folia;
    z *= 1 + folia;

    // Flatten top where it meets cerebrum
    if (y > 0) y *= 0.5;

    positions.setXYZ(i, x, y, z);
  }

  geometry.computeVertexNormals();
  return geometry;
}

// ─── Helpers ───────────────────────────────────────────────────────
interface NodeUserData {
  thoughtId: string;
  title: string;
  category: string;
}

interface BrainGraph3DProps {
  thoughts: ThoughtData[];
  connections: ConnectionData[];
}

export function BrainGraph3D({ thoughts, connections }: BrainGraph3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleNodeClick = useCallback(
    (id: string) => {
      router.push(`/thoughts/${id}`);
    },
    [router]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── Scene setup ──────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);

    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 8, 22);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // ── Lighting — multiple angles to reveal fold depth ────────
    const ambient = new THREE.AmbientLight(0x404060, 0.6);
    scene.add(ambient);

    // Key light — front-above, warm purple
    const keyLight = new THREE.DirectionalLight(0xb8a0e8, 1.2);
    keyLight.position.set(5, 10, 8);
    scene.add(keyLight);

    // Fill light — opposite side, cooler
    const fillLight = new THREE.DirectionalLight(0x4a6fa5, 0.6);
    fillLight.position.set(-8, -3, -8);
    scene.add(fillLight);

    // Top rim for parietal/top highlight
    const rimLight = new THREE.PointLight(0xa78bfa, 0.5);
    rimLight.position.set(0, 14, 0);
    scene.add(rimLight);

    // Side light to catch sulci shadows
    const sideLight = new THREE.DirectionalLight(0x7060b0, 0.4);
    sideLight.position.set(-10, 2, 3);
    scene.add(sideLight);

    // ── OrbitControls ────────────────────────────────────────────
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 8;
    controls.maxDistance = 35;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Auto-rotation pause/resume on interaction
    let idleTimeout: ReturnType<typeof setTimeout> | null = null;

    function pauseAutoRotate() {
      controls.autoRotate = false;
      if (idleTimeout) clearTimeout(idleTimeout);
      idleTimeout = setTimeout(() => {
        controls.autoRotate = true;
      }, 5000);
    }

    controls.addEventListener("start", pauseAutoRotate);

    // ── Brain materials ──────────────────────────────────────────
    // Solid lit surface — shows fold depth via shading
    const brainSolidMaterial = new THREE.MeshStandardMaterial({
      color: 0x9080c0,
      transparent: true,
      opacity: 0.18,
      roughness: 0.7,
      metalness: 0.05,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    // Wireframe overlay — subtle structural lines
    const brainWireMaterial = new THREE.MeshBasicMaterial({
      color: 0xb0a0e0,
      wireframe: true,
      transparent: true,
      opacity: 0.06,
      depthWrite: false,
    });

    // Emissive Fresnel-like rim — glowing edges for x-ray look
    const brainGlowMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x6050a0,
      emissive: 0x8b7cb8,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.12,
      roughness: 1.0,
      metalness: 0.0,
      side: THREE.BackSide,
      depthWrite: false,
    });

    // Cerebellum materials (denser ridges visible)
    const cerebellumSolid = new THREE.MeshStandardMaterial({
      color: 0x8070b0,
      transparent: true,
      opacity: 0.2,
      roughness: 0.6,
      metalness: 0.05,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const cerebellumWire = new THREE.MeshBasicMaterial({
      color: 0xa090d0,
      wireframe: true,
      transparent: true,
      opacity: 0.07,
      depthWrite: false,
    });

    // Left hemisphere — 3 layers: solid + wireframe + glow
    const leftGeo = createHemisphere(true);
    scene.add(new THREE.Mesh(leftGeo, brainSolidMaterial));
    scene.add(new THREE.Mesh(leftGeo, brainWireMaterial));
    scene.add(new THREE.Mesh(leftGeo, brainGlowMaterial));

    // Right hemisphere — 3 layers
    const rightGeo = createHemisphere(false);
    scene.add(new THREE.Mesh(rightGeo, brainSolidMaterial));
    scene.add(new THREE.Mesh(rightGeo, brainWireMaterial));
    scene.add(new THREE.Mesh(rightGeo, brainGlowMaterial));

    // Cerebellum — positioned snug under occipital lobe
    const cerebellumGeo = createCerebellum();
    const cbPos = new THREE.Vector3(0, -3.0, -5.0);
    const cbSolid = new THREE.Mesh(cerebellumGeo, cerebellumSolid);
    cbSolid.position.copy(cbPos);
    const cbWire = new THREE.Mesh(cerebellumGeo, cerebellumWire);
    cbWire.position.copy(cbPos);
    const cbGlow = new THREE.Mesh(cerebellumGeo, brainGlowMaterial.clone());
    cbGlow.position.copy(cbPos);
    scene.add(cbSolid);
    scene.add(cbWire);
    scene.add(cbGlow);

    // Brain stem — tapered cylinder angled slightly back
    const stemGeo = new THREE.CylinderGeometry(0.7, 0.4, 3.5, 16);
    const stemPos = new THREE.Vector3(0, -5.5, -4.0);
    const stemSolid = new THREE.Mesh(stemGeo, cerebellumSolid.clone());
    stemSolid.position.copy(stemPos);
    stemSolid.rotation.x = 0.15;
    const stemWireM = new THREE.Mesh(stemGeo, cerebellumWire.clone());
    stemWireM.position.copy(stemPos);
    stemWireM.rotation.x = 0.15;
    scene.add(stemSolid);
    scene.add(stemWireM);

    // ── Shared geometries / textures ─────────────────────────────
    const sharedNodeGeo = new THREE.SphereGeometry(1, 16, 16);
    const glowTexture = createGlowTexture();

    // ── Place thought nodes ──────────────────────────────────────
    const nodeMeshes: THREE.Mesh[] = [];
    const nodeGlows: THREE.Sprite[] = [];
    const thoughtPositions = new Map<string, THREE.Vector3>();

    // Group thoughts by category
    const categoryGroups = new Map<CategoryId, ThoughtData[]>();
    for (const t of thoughts) {
      const cat = t.category as CategoryId;
      if (!categoryGroups.has(cat)) categoryGroups.set(cat, []);
      categoryGroups.get(cat)!.push(t);
    }

    for (const [category, items] of categoryGroups) {
      const region = brainRegions[category];
      if (!region) continue;

      // Sort by importance descending — higher importance → closer to center
      const sorted = [...items].sort((a, b) => b.importance - a.importance);

      for (let i = 0; i < sorted.length; i++) {
        const thought = sorted[i];
        const color = categoryColors[category] || 0x8b5cf6;

        // Fibonacci distribution, higher importance closer to center
        const importanceFactor = 1 - thought.importance / 10;
        const offset = fibonacciSphere(i, sorted.length, region.radius * importanceFactor);
        const worldPos = region.position.clone().add(offset);
        thoughtPositions.set(thought.id, worldPos);

        // Node sphere
        const nodeRadius = 0.15 + thought.importance * 0.06;
        const nodeMat = new THREE.MeshPhysicalMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.4,
          roughness: 0.3,
          metalness: 0.1,
          transparent: true,
          opacity: 0.9,
        });

        const nodeMesh = new THREE.Mesh(sharedNodeGeo, nodeMat);
        nodeMesh.position.copy(worldPos);
        nodeMesh.scale.setScalar(nodeRadius);
        nodeMesh.userData = {
          thoughtId: thought.id,
          title: thought.title,
          category: thought.category,
        } as NodeUserData;

        scene.add(nodeMesh);
        nodeMeshes.push(nodeMesh);

        // Glow sprite
        const glowMat = new THREE.SpriteMaterial({
          map: glowTexture,
          color,
          transparent: true,
          opacity: 0.4,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        const glow = new THREE.Sprite(glowMat);
        glow.position.copy(worldPos);
        glow.scale.setScalar(nodeRadius * 4);
        scene.add(glow);
        nodeGlows.push(glow);
      }
    }

    // ── Connections ──────────────────────────────────────────────
    const connectionLines: THREE.Line[] = [];
    const particleSystems: {
      sprite: THREE.Sprite;
      from: THREE.Vector3;
      to: THREE.Vector3;
      speed: number;
      progress: number;
    }[] = [];

    for (const conn of connections) {
      const from = thoughtPositions.get(conn.sourceId);
      const to = thoughtPositions.get(conn.targetId);
      if (!from || !to) continue;

      const lineGeo = new THREE.BufferGeometry().setFromPoints([from, to]);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.08 + conn.score * 0.15,
        depthWrite: false,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      scene.add(line);
      connectionLines.push(line);

      // High-score connections get animated particles
      if (conn.score > 0.85) {
        const particleCount = 2;
        for (let p = 0; p < particleCount; p++) {
          const pMat = new THREE.SpriteMaterial({
            map: glowTexture,
            color: 0xffffff,
            transparent: true,
            opacity: 0.6,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          });
          const pSprite = new THREE.Sprite(pMat);
          pSprite.scale.setScalar(0.15);
          pSprite.position.copy(from);
          scene.add(pSprite);

          particleSystems.push({
            sprite: pSprite,
            from: from.clone(),
            to: to.clone(),
            speed: 0.003 + Math.random() * 0.003,
            progress: p / particleCount,
          });
        }
      }
    }

    // ── Region labels ───────────────────────────────────────────
    const regionLabels: THREE.Sprite[] = [];
    const activeCategories = new Set(thoughts.map((t) => t.category));

    for (const cat of activeCategories) {
      const region = brainRegions[cat as CategoryId];
      if (!region) continue;

      const label = createTextSprite(region.label);
      label.position.copy(region.position);
      label.position.y += 2.2;
      scene.add(label);
      regionLabels.push(label);
    }

    // ── Ambient particle field ──────────────────────────────────
    const particleCount = 250;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities: THREE.Vector3[] = [];

    for (let i = 0; i < particleCount; i++) {
      // Distribute within brain-ish volume
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.random() * 6;
      particlePositions[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
      particlePositions[i * 3 + 1] = Math.cos(phi) * r * 0.8;
      particlePositions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * r * 1.1;

      particleVelocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.005,
          (Math.random() - 0.5) * 0.005,
          (Math.random() - 0.5) * 0.005
        )
      );
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );
    const particleMat = new THREE.PointsMaterial({
      color: 0x8b7cb8,
      size: 0.06,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const particleField = new THREE.Points(particleGeo, particleMat);
    scene.add(particleField);

    // ── Raycasting (hover/click) ─────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredNode: THREE.Mesh | null = null;
    let pointerDownPos = { x: 0, y: 0 };

    function onPointerMove(e: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        renderer.domElement.style.cursor = "pointer";

        // Scale up hovered node
        if (hoveredNode && hoveredNode !== hit) {
          const prevData = hoveredNode.userData as NodeUserData;
          const prevThought = thoughts.find((t) => t.id === prevData.thoughtId);
          if (prevThought) {
            const prevRadius = 0.15 + prevThought.importance * 0.06;
            hoveredNode.scale.setScalar(prevRadius);
          }
        }

        hoveredNode = hit;
        const data = hit.userData as NodeUserData;
        const thought = thoughts.find((t) => t.id === data.thoughtId);
        if (thought) {
          const hoverRadius = (0.15 + thought.importance * 0.06) * 1.4;
          hit.scale.setScalar(hoverRadius);
        }

        // Show tooltip
        if (tooltipRef.current) {
          const colorStr = categoryColorStrings[data.category] || "#8b5cf6";
          tooltipRef.current.innerHTML = `
            <strong>${data.title}</strong><br/>
            <span style="color:${colorStr};text-transform:capitalize;">${data.category}</span>
          `;
          tooltipRef.current.style.display = "block";
          const rect2 = container!.getBoundingClientRect();
          tooltipRef.current.style.left = `${e.clientX - rect2.left + 12}px`;
          tooltipRef.current.style.top = `${e.clientY - rect2.top - 10}px`;
        }
      } else {
        renderer.domElement.style.cursor = "default";
        if (hoveredNode) {
          const prevData = hoveredNode.userData as NodeUserData;
          const prevThought = thoughts.find((t) => t.id === prevData.thoughtId);
          if (prevThought) {
            const prevRadius = 0.15 + prevThought.importance * 0.06;
            hoveredNode.scale.setScalar(prevRadius);
          }
          hoveredNode = null;
        }
        if (tooltipRef.current) {
          tooltipRef.current.style.display = "none";
        }
      }
    }

    function onPointerDown(e: PointerEvent) {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    }

    function onPointerUp(e: PointerEvent) {
      const dx = e.clientX - pointerDownPos.x;
      const dy = e.clientY - pointerDownPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Only treat as click if pointer didn't move much (not a drag)
      if (dist < 5 && hoveredNode) {
        const data = hoveredNode.userData as NodeUserData;
        handleNodeClick(data.thoughtId);
      }
    }

    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);

    // ── Resize handler ──────────────────────────────────────────
    function onResize() {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }

    window.addEventListener("resize", onResize);

    // ── Animation loop ──────────────────────────────────────────
    let animFrameId = 0;

    function animate() {
      animFrameId = requestAnimationFrame(animate);
      controls.update();

      // Animate connection particles
      for (const ps of particleSystems) {
        ps.progress += ps.speed;
        if (ps.progress > 1) ps.progress -= 1;
        ps.sprite.position.lerpVectors(ps.from, ps.to, ps.progress);
      }

      // Animate ambient particles
      const positions = particleField.geometry.attributes.position;
      for (let i = 0; i < particleCount; i++) {
        const vel = particleVelocities[i];
        let px = positions.getX(i) + vel.x;
        let py = positions.getY(i) + vel.y;
        let pz = positions.getZ(i) + vel.z;

        // Keep within bounds
        const d = Math.sqrt(px * px + py * py + pz * pz);
        if (d > 7) {
          vel.negate();
          px += vel.x * 2;
          py += vel.y * 2;
          pz += vel.z * 2;
        }

        positions.setXYZ(i, px, py, pz);
      }
      (positions as THREE.BufferAttribute).needsUpdate = true;

      // Fade region labels based on camera distance
      for (const label of regionLabels) {
        const dist = camera.position.distanceTo(label.position);
        const opacity = THREE.MathUtils.clamp(1 - (dist - 10) / 20, 0.1, 0.7);
        (label.material as THREE.SpriteMaterial).opacity = opacity;
      }

      renderer.render(scene, camera);
    }

    animate();

    // ── Cleanup ──────────────────────────────────────────────────
    const cleanup = () => {
      cancelAnimationFrame(animFrameId);
      if (idleTimeout) clearTimeout(idleTimeout);
      controls.removeEventListener("start", pauseAutoRotate);
      controls.dispose();

      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", onResize);

      // Dispose geometries
      leftGeo.dispose();
      rightGeo.dispose();
      cerebellumGeo.dispose();
      stemGeo.dispose();
      sharedNodeGeo.dispose();
      particleGeo.dispose();

      // Dispose materials
      brainSolidMaterial.dispose();
      brainWireMaterial.dispose();
      brainGlowMaterial.dispose();
      cerebellumSolid.dispose();
      cerebellumWire.dispose();
      particleMat.dispose();

      for (const mesh of nodeMeshes) {
        (mesh.material as THREE.Material).dispose();
      }
      for (const glow of nodeGlows) {
        (glow.material as THREE.SpriteMaterial).map?.dispose();
        glow.material.dispose();
      }
      for (const line of connectionLines) {
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
      }
      for (const ps of particleSystems) {
        (ps.sprite.material as THREE.SpriteMaterial).map?.dispose();
        ps.sprite.material.dispose();
      }
      for (const label of regionLabels) {
        (label.material as THREE.SpriteMaterial).map?.dispose();
        label.material.dispose();
      }

      glowTexture.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };

    cleanupRef.current = cleanup;

    return () => {
      cleanup();
      cleanupRef.current = null;
    };
  }, [thoughts, connections, handleNodeClick]);

  if (thoughts.length === 0) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height: "calc(100vh - 140px)" }}
      >
        <div className="text-center">
          <p className="text-sm text-gray-500">No thoughts yet</p>
          <p className="mt-1 text-xs text-gray-600">
            Capture your first thought to see your 3D brain map
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height: "calc(100vh - 140px)" }}>
      <div ref={containerRef} className="h-full w-full" />
      <div
        ref={tooltipRef}
        className="pointer-events-none absolute z-10 hidden rounded-lg border border-white/10 bg-[#132039]/95 px-3 py-2 text-xs text-gray-200 shadow-xl backdrop-blur-sm"
        style={{ maxWidth: 220 }}
      />
    </div>
  );
}
