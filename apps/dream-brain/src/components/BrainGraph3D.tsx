"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ThoughtData, ConnectionData } from "@/lib/data";

const categoryColors: Record<string, string> = {
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

interface GraphNode {
  id: string;
  name: string;
  category: string;
  val: number;
  color: string;
}

interface GraphLink {
  source: string;
  target: string;
  score: number;
}

interface BrainGraph3DProps {
  thoughts: ThoughtData[];
  connections: ConnectionData[];
}

export function BrainGraph3D({ thoughts, connections }: BrainGraph3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graphRef = useRef<any>(null);
  const router = useRouter();

  const handleClick = useCallback(
    (node: GraphNode) => {
      router.push(`/thoughts/${node.id}`);
    },
    [router]
  );

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    let cancelled = false;

    async function init() {
      const ForceGraph3DModule = await import("3d-force-graph");
      const ForceGraph3D = ForceGraph3DModule.default;

      if (cancelled || !container) return;

      const nodes: GraphNode[] = thoughts.map((t) => ({
        id: t.id,
        name: t.title,
        category: t.category,
        val: 1 + t.importance * 2,
        color: categoryColors[t.category] || "#8b5cf6",
      }));

      const links: GraphLink[] = connections.map((c) => ({
        source: c.sourceId,
        target: c.targetId,
        score: c.score,
      }));

      const graph = new ForceGraph3D(container)
        .graphData({ nodes, links })
        .backgroundColor("#030712")
        .nodeLabel((node: object) => {
          const n = node as GraphNode;
          return `<div style="background:#1f2937;padding:6px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);font-size:12px;color:#e5e7eb;pointer-events:none;">
            <strong>${n.name}</strong><br/>
            <span style="color:${n.color};text-transform:capitalize;">${n.category}</span>
          </div>`;
        })
        .nodeColor((node: object) => (node as GraphNode).color)
        .nodeVal((node: object) => (node as GraphNode).val)
        .nodeOpacity(0.9)
        .linkWidth((link: object) => (link as GraphLink).score * 2)
        .linkOpacity(0.4)
        .linkColor(() => "rgba(255,255,255,0.2)")
        .linkDirectionalParticles((link: object) => (link as GraphLink).score > 0.85 ? 4 : 0)
        .linkDirectionalParticleWidth(1.5)
        .linkDirectionalParticleSpeed(0.006)
        .onNodeClick((node: object) => handleClick(node as GraphNode))
        .width(container.clientWidth)
        .height(container.clientHeight);

      // Apply force tuning
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (graph.d3Force("charge") as any)?.strength(-120);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (graph.d3Force("link") as any)?.distance(50);

      // Initial camera position
      setTimeout(() => {
        if (!cancelled) {
          graph.cameraPosition({ x: 0, y: 0, z: 300 });
        }
      }, 100);

      graphRef.current = graph;
    }

    init();

    const handleResize = () => {
      if (graphRef.current && container) {
        graphRef.current.width(container.clientWidth);
        graphRef.current.height(container.clientHeight);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", handleResize);
      if (graphRef.current) {
        graphRef.current.pauseAnimation();
        // Clean up the renderer
        if (graphRef.current.renderer) {
          graphRef.current.renderer().dispose();
        }
      }
      container.innerHTML = "";
    };
  }, [thoughts, connections, handleClick]);

  if (thoughts.length === 0) {
    return (
      <div
        className="flex h-full items-center justify-center"
        style={{ minHeight: "calc(100vh - 140px)" }}
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
    <div
      ref={containerRef}
      className="h-full w-full"
      style={{ minHeight: "calc(100vh - 140px)" }}
    />
  );
}
