"use client";

import { useRef, useEffect, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  size: number;
  baseOpacity: number;
  isCore: boolean;
  pulsePhase: number;
  fadeInDelay: number;
}

interface NeuronParticleCanvasProps {
  className?: string;
}

function getParticleCount(): number {
  if (typeof window === "undefined") return 100;
  const w = window.innerWidth;
  if (w < 768) return 40;
  if (w < 1024) return 70;
  return 100;
}

function createParticles(w: number, h: number): Particle[] {
  const count = getParticleCount();
  const coreCount = Math.min(5, Math.max(3, Math.floor(count * 0.05)));
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const isCore = i < coreCount;
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.random(),
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: isCore ? 8 : 2 + Math.random() * 3,
      baseOpacity: isCore ? 1 : 0.3 + Math.random() * 0.7,
      isCore,
      pulsePhase: Math.random() * Math.PI * 2,
      fadeInDelay: 300 + i * 30,
    });
  }

  return particles;
}

export function NeuronParticleCanvas({ className }: NeuronParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    mouse: { x: -1000, y: -1000 },
    particles: [] as Particle[],
    startTime: 0,
    animFrame: 0,
    camera: { x: 0, y: 0, targetX: 0, targetY: 0 },
  });

  const updateCameraTarget = useCallback(() => {
    const s = stateRef.current;
    s.camera.targetX = (Math.random() - 0.5) * 20;
    s.camera.targetY = (Math.random() - 0.5) * 20;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const s = stateRef.current;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isMobile = window.innerWidth < 768;

    // Resize handler
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (s.particles.length === 0) {
        s.particles = createParticles(w, h);
      }
    };

    resize();
    window.addEventListener("resize", resize);

    // Mouse tracking (desktop only)
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      s.mouse.x = e.clientX - rect.left;
      s.mouse.y = e.clientY - rect.top;
    };
    const onMouseLeave = () => {
      s.mouse.x = -1000;
      s.mouse.y = -1000;
    };

    if (!isMobile) {
      canvas.addEventListener("mousemove", onMouseMove);
      canvas.addEventListener("mouseleave", onMouseLeave);
    }

    s.startTime = performance.now();
    updateCameraTarget();
    const cameraInterval = setInterval(updateCameraTarget, 8000);

    // Main render loop
    const animate = (now: number) => {
      const elapsed = now - s.startTime;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const { particles, mouse, camera } = s;

      ctx.clearRect(0, 0, w, h);

      // Camera drift
      camera.x += (camera.targetX - camera.x) * 0.002;
      camera.y += (camera.targetY - camera.y) * 0.002;

      const edgeFadeIn = Math.min(1, Math.max(0, (elapsed - 800) / 500));

      // Update particle positions
      if (!reducedMotion) {
        for (const p of particles) {
          // Mouse attraction (desktop)
          if (!isMobile && mouse.x > 0) {
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200 && dist > 1) {
              const force = ((200 - dist) / 200) * 0.3;
              p.x += (dx / dist) * force;
              p.y += (dy / dist) * force;
            }
          }

          // Velocity + camera parallax
          p.x += p.vx + camera.x * 0.01 * p.z;
          p.y += p.vy + camera.y * 0.01 * p.z;

          // Wrap around
          if (p.x < -30) p.x = w + 30;
          if (p.x > w + 30) p.x = -30;
          if (p.y < -30) p.y = h + 30;
          if (p.y > h + 30) p.y = -30;

          if (p.isCore) p.pulsePhase += 0.02;
        }
      }

      // Draw edges
      if (edgeFadeIn > 0) {
        ctx.lineWidth = 1;
        for (let i = 0; i < particles.length; i++) {
          const a = particles[i];
          const aFade = Math.min(
            1,
            Math.max(0, (elapsed - a.fadeInDelay) / 300)
          );
          if (aFade === 0) continue;

          for (let j = i + 1; j < particles.length; j++) {
            const b = particles[j];
            const bFade = Math.min(
              1,
              Math.max(0, (elapsed - b.fadeInDelay) / 300)
            );
            if (bFade === 0) continue;

            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 150) {
              let opacity =
                (1 - dist / 150) * 0.3 * edgeFadeIn * Math.min(aFade, bFade);

              // Brighten edges near mouse
              if (!isMobile && mouse.x > 0) {
                const midX = (a.x + b.x) / 2;
                const midY = (a.y + b.y) / 2;
                const md = Math.sqrt(
                  (mouse.x - midX) ** 2 + (mouse.y - midY) ** 2
                );
                if (md < 200) {
                  opacity *= 1 + ((200 - md) / 200) * 2;
                }
              }

              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `rgba(0,212,170,${Math.min(opacity, 0.8)})`;
              ctx.stroke();
            }
          }
        }
      }

      // Draw nodes
      for (const p of particles) {
        const fade = Math.min(
          1,
          Math.max(0, (elapsed - p.fadeInDelay) / 300)
        );
        if (fade === 0) continue;

        const depthScale = 0.5 + p.z * 0.5;
        const size = p.size * depthScale;
        let opacity = p.baseOpacity * depthScale * fade;

        // Core node glow
        if (p.isCore) {
          const pulse = 0.7 + 0.3 * Math.sin(p.pulsePhase);
          opacity *= pulse;

          const grad = ctx.createRadialGradient(
            p.x,
            p.y,
            0,
            p.x,
            p.y,
            size * 4
          );
          grad.addColorStop(
            0,
            `rgba(0,212,170,${opacity * 0.3 * fade})`
          );
          grad.addColorStop(1, "rgba(0,212,170,0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, size * 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Node dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,212,170,${opacity})`;
        ctx.fill();
      }

      // Mouse proximity glow
      if (!isMobile && mouse.x > 0 && mouse.y > 0) {
        const grad = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          120
        );
        grad.addColorStop(0, "rgba(0,212,170,0.06)");
        grad.addColorStop(1, "rgba(0,212,170,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 120, 0, Math.PI * 2);
        ctx.fill();
      }

      s.animFrame = requestAnimationFrame(animate);
    };

    s.animFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(s.animFrame);
      clearInterval(cameraInterval);
      window.removeEventListener("resize", resize);
      if (!isMobile) {
        canvas.removeEventListener("mousemove", onMouseMove);
        canvas.removeEventListener("mouseleave", onMouseLeave);
      }
    };
  }, [updateCameraTarget]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
      aria-hidden="true"
    />
  );
}
