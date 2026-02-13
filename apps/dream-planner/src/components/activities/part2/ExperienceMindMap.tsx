"use client";

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@dreamhub/ui";
import { usePlannerStore } from "@/lib/store";
import { DEFAULT_MIND_MAP_BRANCHES } from "@/types/part2";

function createInitialNodes(userName: string): Node[] {
  const center: Node = {
    id: "root",
    position: { x: 300, y: 250 },
    data: { label: userName || "Me" },
    style: {
      background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
      color: "#fff",
      fontWeight: 700,
      borderRadius: 999,
      padding: "12px 24px",
      border: "none",
    },
  };

  const branches: Node[] = DEFAULT_MIND_MAP_BRANCHES.map((label, i) => {
    const angle = (i / DEFAULT_MIND_MAP_BRANCHES.length) * 2 * Math.PI - Math.PI / 2;
    const radius = 200;
    return {
      id: `branch-${i}`,
      position: {
        x: 300 + Math.cos(angle) * radius,
        y: 250 + Math.sin(angle) * radius,
      },
      data: { label },
      style: {
        background: "#f3f4f6",
        borderRadius: 8,
        padding: "8px 16px",
        border: "1px solid #e5e7eb",
        fontSize: 13,
      },
    };
  });

  return [center, ...branches];
}

function createInitialEdges(): Edge[] {
  return DEFAULT_MIND_MAP_BRANCHES.map((_, i) => ({
    id: `e-root-branch-${i}`,
    source: "root",
    target: `branch-${i}`,
    type: "smoothstep",
    style: { stroke: "#d1d5db" },
  }));
}

export function ExperienceMindMap({ onNext }: { onNext: () => void }) {
  const { data, store } = usePlannerStore();
  const p2 = data.part2;

  const initial = useMemo(() => {
    if (p2.mindMapNodes.length > 0) {
      return { nodes: p2.mindMapNodes, edges: p2.mindMapEdges };
    }
    return {
      nodes: createInitialNodes(data.userName),
      edges: createInitialEdges(),
    };
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, style: { stroke: "#d1d5db" } }, eds));
    },
    [setEdges]
  );

  const addChildNode = useCallback(
    (parentId: string) => {
      const parent = nodes.find((n) => n.id === parentId);
      if (!parent) return;

      const newId = `node-${Date.now()}`;
      const newNode: Node = {
        id: newId,
        position: {
          x: parent.position.x + 60 + Math.random() * 80,
          y: parent.position.y + 60 + Math.random() * 80,
        },
        data: { label: "New experience..." },
        style: {
          background: "#faf5ff",
          borderRadius: 8,
          padding: "6px 12px",
          border: "1px solid #ddd6fe",
          fontSize: 12,
        },
      };

      const newEdge: Edge = {
        id: `e-${parentId}-${newId}`,
        source: parentId,
        target: newId,
        type: "smoothstep",
        style: { stroke: "#d1d5db" },
      };

      setNodes((nds) => [...nds, newNode]);
      setEdges((eds) => [...eds, newEdge]);
    },
    [nodes, setNodes, setEdges]
  );

  const saveAndNext = () => {
    store.setPart2Data({ mindMapNodes: nodes, mindMapEdges: edges });
    onNext();
  };

  const handleNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      addChildNode(node.id);
    },
    [addChildNode]
  );

  const handleNodeChange = useCallback(
    (id: string, label: string) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label } } : n))
      );
    },
    [setNodes]
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-md bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
            PART 2
          </span>
          <span className="text-xs text-gray-400">Activity 6</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Experience Mind Map
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Double-click any node to add a child. Drag to reorganize. Map out your life experiences.
        </p>
      </div>

      {/* Mind Map */}
      <div className="mb-6 h-[500px] overflow-hidden rounded-card border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDoubleClick={handleNodeDoubleClick}
          fitView
          className="bg-gray-50 dark:bg-gray-900"
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      {/* AI Pattern Analysis */}
      {nodes.filter((n) => n.id !== "root" && (n.data.label as string) !== "New experience...").length >= 5 && (() => {
        const labels = nodes
          .filter((n) => n.id !== "root")
          .map((n) => (n.data.label as string).toLowerCase())
          .filter((l) => l !== "new experience...");
        // Find repeated keywords
        const words = labels.flatMap((l) => l.split(/\s+/).filter((w) => w.length > 3));
        const freq: Record<string, number> = {};
        words.forEach((w) => { freq[w] = (freq[w] || 0) + 1; });
        const repeated = Object.entries(freq)
          .filter(([, c]) => c >= 2)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);
        // Count per branch category
        const branchChildren: Record<string, number> = {};
        edges.forEach((e) => {
          if (e.source !== "root" && !e.source.startsWith("node-")) {
            branchChildren[e.source] = (branchChildren[e.source] || 0) + 1;
          }
        });
        const densest = Object.entries(branchChildren).sort((a, b) => b[1] - a[1])[0];
        const densestLabel = densest ? nodes.find((n) => n.id === densest[0])?.data.label as string : null;

        return (
          <div className="mb-6 rounded-card border border-brand-200 bg-gradient-to-r from-brand-50 to-blue-50 p-4 dark:border-brand-800 dark:from-brand-950 dark:to-blue-950">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-md bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-300">AI</span>
              <span className="text-xs font-medium text-brand-700 dark:text-brand-300">Mind Map Pattern Analysis</span>
            </div>
            <div className="space-y-2">
              {repeated.length > 0 && (
                <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                  <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">Recurring themes</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {repeated.map(([word, count]) => (
                      <span key={word} className="rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-700 dark:bg-brand-900 dark:text-brand-300">{word} ({count}x)</span>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    These recurring themes might reveal what truly energizes you.
                  </p>
                </div>
              )}
              {densestLabel && (
                <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">Richest branch: {densestLabel}</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    This area has the most experiences — it could be a clue to your passion.
                  </p>
                </div>
              )}
              <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Map size: {nodes.length - 1} nodes</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {nodes.length > 15 ? "Impressive depth! Look for connections between distant branches." : "Keep adding — the more detailed your map, the clearer your patterns become."}
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Editable Labels */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Edit Node Labels
        </h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {nodes
            .filter((n) => n.id !== "root")
            .map((node) => (
              <input
                key={node.id}
                type="text"
                value={node.data.label as string}
                onChange={(e) => handleNodeChange(node.id, e.target.value)}
                className="rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              />
            ))}
        </div>
      </div>

      {/* Next */}
      <div className="flex justify-end">
        <Button onClick={saveAndNext} className="gap-2">
          Next Activity
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
