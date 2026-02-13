"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeTypes,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { categories, type CategoryId } from "@/lib/categories";
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

interface ThoughtNodeData extends Record<string, unknown> {
  label: string;
  shortTitle: string;
  category: CategoryId;
  size: number;
  importance: number;
}

function ThoughtNode({ data }: { data: ThoughtNodeData }) {
  const cat = categories[data.category];
  const color = categoryColors[data.category] || "#8b5cf6";
  const Icon = cat.icon;

  return (
    <div
      className="group relative cursor-pointer"
      style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
    >
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-0 !h-0" />
      <div
        className="flex flex-col items-center justify-center rounded-full border-2 transition-transform hover:scale-110"
        style={{
          width: data.size,
          height: data.size,
          borderColor: color,
          background: `${color}15`,
        }}
      >
        <Icon
          className="mb-0.5"
          style={{ color, width: data.size * 0.3, height: data.size * 0.3 }}
        />
        <span
          className="text-center font-medium leading-tight text-gray-200 px-1"
          style={{ fontSize: Math.max(8, data.size * 0.14) }}
        >
          {data.shortTitle}
        </span>
      </div>
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-[10px] text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none border border-white/10 z-10">
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 !w-0 !h-0" />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  thought: ThoughtNode as NodeTypes[string],
};

interface BrainGraphProps {
  thoughts: ThoughtData[];
  connections: ConnectionData[];
}

function buildGraphData(thoughts: ThoughtData[], connections: ConnectionData[]) {
  const centerX = 400;
  const centerY = 300;
  const radius = 250;

  const nodes: Node[] = thoughts.map((thought, i) => {
    const angle = (i / thoughts.length) * 2 * Math.PI - Math.PI / 2;
    const size = 50 + thought.importance * 12;
    const shortTitle =
      thought.title.length > 12
        ? thought.title.slice(0, 12) + "..."
        : thought.title;

    return {
      id: thought.id,
      type: "thought",
      position: {
        x: centerX + Math.cos(angle) * radius - size / 2,
        y: centerY + Math.sin(angle) * radius - size / 2,
      },
      data: {
        label: thought.title,
        shortTitle,
        category: thought.category,
        size,
        importance: thought.importance,
      },
    };
  });

  const thoughtMap = new Map(thoughts.map((t) => [t.id, t]));

  const edges: Edge[] = connections.map((conn, i) => ({
    id: `e-${i}`,
    source: conn.sourceId,
    target: conn.targetId,
    animated: conn.score > 0.85,
    style: {
      stroke: categoryColors[thoughtMap.get(conn.sourceId)?.category || "ideas"] || "#8b5cf6",
      strokeWidth: Math.max(1, conn.score * 3),
      opacity: 0.3 + conn.score * 0.4,
    },
  }));

  return { nodes, edges };
}

export function BrainGraph({ thoughts, connections }: BrainGraphProps) {
  const router = useRouter();
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildGraphData(thoughts, connections),
    [thoughts, connections]
  );

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      router.push(`/thoughts/${node.id}`);
    },
    [router]
  );

  if (thoughts.length === 0) {
    return (
      <div className="flex h-full items-center justify-center" style={{ minHeight: "calc(100vh - 140px)" }}>
        <div className="text-center">
          <p className="text-sm text-gray-500">No thoughts yet</p>
          <p className="mt-1 text-xs text-gray-600">Capture your first thought to see your brain map</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full" style={{ minHeight: "calc(100vh - 140px)" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
        className="bg-gray-950"
      >
        <Background color="#ffffff08" gap={30} size={1} />
        <Controls
          className="!bg-gray-900 !border-white/10 !rounded-xl !shadow-xl [&>button]:!bg-gray-800 [&>button]:!border-white/10 [&>button]:!text-gray-400 [&>button:hover]:!bg-gray-700"
        />
      </ReactFlow>
    </div>
  );
}
