"use client";

import { useState, useCallback, useMemo } from "react";
import { Button, cn } from "@dreamhub/ui";

// ── Types ──
type RingType = "core" | "advisors" | "community";
type NodeType = "people" | "organizations" | "tools";

interface SupportNode {
  id: string;
  name: string;
  role: string;
  ring: RingType;
  nodeType: NodeType;
  strength: number; // 1-5
}

const RINGS: { key: RingType; label: string; description: string; color: string; radius: number }[] = [
  { key: "core", label: "Core Team", description: "Closest supporters", color: "#3b82f6", radius: 80 },
  { key: "advisors", label: "Advisors & Mentors", description: "Guidance and expertise", color: "#8b5cf6", radius: 140 },
  { key: "community", label: "Community & Resources", description: "Extended network", color: "#22c55e", radius: 200 },
];

const NODE_TYPE_CONFIG: Record<NodeType, { label: string; color: string }> = {
  people: { label: "People", color: "#3b82f6" },
  organizations: { label: "Organizations", color: "#8b5cf6" },
  tools: { label: "Tools", color: "#22c55e" },
};

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="text-gray-300 transition-colors hover:text-amber-400"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={star <= value ? "#fbbf24" : "none"}
            stroke={star <= value ? "#fbbf24" : "currentColor"}
            strokeWidth="2"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function NetworkVisualization({ nodes, onSelectNode }: { nodes: SupportNode[]; onSelectNode: (id: string) => void }) {
  const centerX = 220;
  const centerY = 220;
  const size = 440;

  // Calculate node positions around each ring
  const positionedNodes = useMemo(() => {
    const result: { node: SupportNode; x: number; y: number }[] = [];

    for (const ring of RINGS) {
      const ringNodes = nodes.filter((n) => n.ring === ring.key);
      ringNodes.forEach((node, index) => {
        const angle = (2 * Math.PI * index) / Math.max(ringNodes.length, 1) - Math.PI / 2;
        const x = centerX + ring.radius * Math.cos(angle);
        const y = centerY + ring.radius * Math.sin(angle);
        result.push({ node, x, y });
      });
    }

    return result;
  }, [nodes]);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto h-full w-full max-w-md"
    >
      {/* Concentric rings */}
      {[...RINGS].reverse().map((ring) => (
        <circle
          key={ring.key}
          cx={centerX}
          cy={centerY}
          r={ring.radius}
          fill="none"
          stroke={ring.color}
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.3"
        />
      ))}

      {/* Ring labels */}
      {RINGS.map((ring) => (
        <text
          key={`label-${ring.key}`}
          x={centerX}
          y={centerY - ring.radius - 6}
          textAnchor="middle"
          className="fill-gray-400"
          fontSize="9"
          fontWeight="500"
        >
          {ring.label}
        </text>
      ))}

      {/* Connection lines */}
      {positionedNodes.map(({ node, x, y }) => (
        <line
          key={`line-${node.id}`}
          x1={centerX}
          y1={centerY}
          x2={x}
          y2={y}
          stroke={NODE_TYPE_CONFIG[node.nodeType].color}
          strokeWidth={node.strength * 0.4}
          opacity="0.2"
        />
      ))}

      {/* Center node */}
      <circle
        cx={centerX}
        cy={centerY}
        r="24"
        className="fill-gray-900 dark:fill-gray-100"
      />
      <text
        x={centerX}
        y={centerY + 4}
        textAnchor="middle"
        className="fill-white dark:fill-gray-900"
        fontSize="10"
        fontWeight="bold"
      >
        You
      </text>

      {/* Nodes */}
      {positionedNodes.map(({ node, x, y }) => (
        <g
          key={node.id}
          className="cursor-pointer"
          onClick={() => onSelectNode(node.id)}
        >
          <circle
            cx={x}
            cy={y}
            r="16"
            fill={NODE_TYPE_CONFIG[node.nodeType].color}
            opacity="0.9"
          />
          <text
            x={x}
            y={y + 3}
            textAnchor="middle"
            fill="white"
            fontSize="7"
            fontWeight="600"
          >
            {node.name.slice(0, 4)}
          </text>
          {/* Strength indicator */}
          {Array.from({ length: node.strength }).map((_, i) => (
            <circle
              key={`str-${node.id}-${i}`}
              cx={x - (node.strength - 1) * 2.5 + i * 5}
              cy={y + 22}
              r="1.5"
              fill="#fbbf24"
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

export function SupportSystemMap({ onNext }: { onNext: () => void }) {
  const [nodes, setNodes] = useState<SupportNode[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formRing, setFormRing] = useState<RingType>("core");
  const [formNodeType, setFormNodeType] = useState<NodeType>("people");
  const [formStrength, setFormStrength] = useState(3);

  const addNode = useCallback(() => {
    if (!formName.trim()) return;
    const newNode: SupportNode = {
      id: crypto.randomUUID(),
      name: formName.trim(),
      role: formRole.trim(),
      ring: formRing,
      nodeType: formNodeType,
      strength: formStrength,
    };
    setNodes((prev) => [...prev, newNode]);
    setFormName("");
    setFormRole("");
    setFormStrength(3);
    setShowAddForm(false);
  }, [formName, formRole, formRing, formNodeType, formStrength]);

  const deleteNode = useCallback((id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    if (selectedNode === id) setSelectedNode(null);
  }, [selectedNode]);

  const selected = nodes.find((n) => n.id === selectedNode);

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900 dark:text-amber-300">
            PART 4
          </span>
          <span className="text-xs text-gray-400">Support System Map</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Support System Map
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Map the people, organizations, and resources that support your dream. Build your network visually.
        </p>
      </div>

      {/* Network Visualization */}
      <div className="mb-6 rounded-[12px] border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="h-80">
          <NetworkVisualization
            nodes={nodes}
            onSelectNode={(id) => setSelectedNode(selectedNode === id ? null : id)}
          />
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap justify-center gap-4">
          {Object.entries(NODE_TYPE_CONFIG).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: config.color }} />
              <span className="text-[10px] text-gray-500">{config.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Node Detail */}
      {selected && (
        <div className="mb-6 rounded-[12px] border border-brand-200 bg-brand-50/30 p-4 dark:border-brand-800 dark:bg-brand-950/20">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: NODE_TYPE_CONFIG[selected.nodeType].color }}
                />
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{selected.name}</h4>
              </div>
              <p className="mt-1 text-xs text-gray-500">{selected.role || "No role specified"}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] text-gray-400">Ring:</span>
                <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400">
                  {RINGS.find((r) => r.key === selected.ring)?.label}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[10px] text-gray-400">Connection Strength:</span>
                <StarRating value={selected.strength} onChange={() => {}} />
              </div>
            </div>
            <button
              type="button"
              onClick={() => deleteNode(selected.id)}
              className="rounded-[8px] bg-red-100 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Add Form */}
      <div className="mb-6">
        {!showAddForm ? (
          <Button onClick={() => setShowAddForm(true)} variant="outline" className="w-full gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            Add to Network
          </Button>
        ) : (
          <div className="rounded-[12px] border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Add to Your Network</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-400">Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Person, org, or tool name"
                  className="w-full rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-400">Role / Description</label>
                <input
                  type="text"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  placeholder="How they help..."
                  className="w-full rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-400">Ring</label>
                <select
                  value={formRing}
                  onChange={(e) => setFormRing(e.target.value as RingType)}
                  className="w-full rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  {RINGS.map((ring) => (
                    <option key={ring.key} value={ring.key}>
                      {ring.label} - {ring.description}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-400">Type</label>
                <select
                  value={formNodeType}
                  onChange={(e) => setFormNodeType(e.target.value as NodeType)}
                  className="w-full rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  {Object.entries(NODE_TYPE_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-400">Connection Strength</label>
                <StarRating value={formStrength} onChange={setFormStrength} />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={addNode}>Add</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </div>

      {/* Node List */}
      {nodes.length > 0 && (
        <div className="mb-6 rounded-[12px] border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Network ({nodes.length} connections)</h4>
          <div className="space-y-2">
            {RINGS.map((ring) => {
              const ringNodes = nodes.filter((n) => n.ring === ring.key);
              if (ringNodes.length === 0) return null;
              return (
                <div key={ring.key}>
                  <p className="mb-1 text-[10px] font-semibold" style={{ color: ring.color }}>
                    {ring.label} ({ringNodes.length})
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {ringNodes.map((node) => (
                      <div
                        key={node.id}
                        className={cn(
                          "group flex items-center gap-2 rounded-[8px] border border-gray-100 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800",
                          selectedNode === node.id && "ring-2 ring-brand-500"
                        )}
                      >
                        <span
                          className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: NODE_TYPE_CONFIG[node.nodeType].color }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-gray-700 dark:text-gray-300">{node.name}</p>
                          <p className="truncate text-[10px] text-gray-400">{node.role}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteNode(node.id)}
                          className="shrink-0 text-gray-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Next Button */}
      <div className="flex justify-end">
        <Button onClick={onNext} className="gap-2">
          Next Activity
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
