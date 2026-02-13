"use client";

import { useCallback, useState } from "react";
import { Button, cn } from "@dreamhub/ui";
import { usePlannerStore } from "@/lib/store";
import type { TrafficItem, TrafficColor } from "@/types/part4";
import { TRAFFIC_COLORS } from "@/types/part4";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

function DraggableCard({
  item,
  onUpdate,
  onDelete,
}: {
  item: TrafficItem;
  onUpdate: (partial: Partial<TrafficItem>) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const config = TRAFFIC_COLORS[item.color];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("rounded-[8px] border bg-white p-3 dark:bg-gray-900", config.bg)}
    >
      <div className="mb-2 flex items-start justify-between">
        <button
          type="button"
          className="cursor-grab touch-none text-gray-400 hover:text-gray-600"
          {...attributes}
          {...listeners}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="9" cy="6" r="1.5" />
            <circle cx="15" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" />
            <circle cx="15" cy="18" r="1.5" />
          </svg>
        </button>
        <button type="button" onClick={onDelete} className="text-gray-400 hover:text-red-500">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <input
        type="text"
        value={item.text}
        onChange={(e) => onUpdate({ text: e.target.value })}
        placeholder="Activity or habit..."
        className="mb-2 w-full bg-transparent text-sm font-medium text-gray-700 placeholder:text-gray-400 focus-visible:outline-none dark:text-gray-300"
      />
      <textarea
        value={item.actionPlan}
        onChange={(e) => onUpdate({ actionPlan: e.target.value })}
        placeholder="Action plan..."
        rows={2}
        className="w-full resize-none bg-transparent text-xs text-gray-500 placeholder:text-gray-400 focus-visible:outline-none dark:text-gray-400"
      />
    </div>
  );
}

function DroppableColumn({
  color,
  children,
}: {
  color: TrafficColor;
  children: React.ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: color });
  const config = TRAFFIC_COLORS[color];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[200px] rounded-card border-2 border-dashed p-3 transition-all",
        isOver ? "border-solid bg-opacity-30" : "",
        color === "green"
          ? "border-green-300 dark:border-green-700"
          : color === "red"
            ? "border-red-300 dark:border-red-700"
            : "border-yellow-300 dark:border-yellow-700"
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <div
          className="h-4 w-4 rounded-full"
          style={{
            backgroundColor:
              color === "green" ? "#22c55e" : color === "red" ? "#ef4444" : "#eab308",
          }}
        />
        <h3 className={cn("text-sm font-semibold", config.text)}>{config.label}</h3>
        <span className="ml-auto text-[10px] text-gray-400">{config.description}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export function TrafficLightAnalysis({ onNext }: { onNext: () => void }) {
  const { data, store } = usePlannerStore();
  const traffic = data.part4.trafficLight;
  const [newItemText, setNewItemText] = useState("");

  const sensors = useSensors(useSensor(PointerSensor));

  const updateItem = useCallback(
    (id: string, partial: Partial<TrafficItem>) => {
      store.setPart4Data({
        trafficLight: {
          items: traffic.items.map((item) =>
            item.id === id ? { ...item, ...partial } : item
          ),
        },
      });
    },
    [traffic, store]
  );

  const deleteItem = useCallback(
    (id: string) => {
      store.setPart4Data({
        trafficLight: { items: traffic.items.filter((item) => item.id !== id) },
      });
    },
    [traffic, store]
  );

  const addItem = useCallback(
    (color: TrafficColor) => {
      store.setPart4Data({
        trafficLight: {
          items: [
            ...traffic.items,
            {
              id: crypto.randomUUID(),
              text: newItemText || "",
              color,
              actionPlan: "",
            },
          ],
        },
      });
      setNewItemText("");
    },
    [traffic, store, newItemText]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const targetColor = over.id as TrafficColor;
    if (["green", "red", "yellow"].includes(targetColor)) {
      updateItem(active.id as string, { color: targetColor });
    }
  };

  const colors: TrafficColor[] = ["green", "red", "yellow"];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
            PART 4
          </span>
          <span className="text-xs text-gray-400">Activity 19</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Traffic Light Analysis
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Categorize your activities. Drag cards between columns to reclassify.
        </p>
      </div>

      {/* Add New Item */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Add an activity or habit..."
          className="flex-1 rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        />
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => addItem(color)}
            className={cn(
              "rounded-[8px] px-3 py-2 text-xs font-medium transition-all",
              TRAFFIC_COLORS[color].bg,
              TRAFFIC_COLORS[color].text
            )}
          >
            {TRAFFIC_COLORS[color].label}
          </button>
        ))}
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          {colors.map((color) => {
            const columnItems = traffic.items.filter((item) => item.color === color);
            return (
              <DroppableColumn key={color} color={color}>
                {columnItems.map((item) => (
                  <DraggableCard
                    key={item.id}
                    item={item}
                    onUpdate={(partial) => updateItem(item.id, partial)}
                    onDelete={() => deleteItem(item.id)}
                  />
                ))}
              </DroppableColumn>
            );
          })}
        </div>
      </DndContext>

      {/* AI Pattern Analysis */}
      {traffic.items.length >= 3 && (() => {
        const green = traffic.items.filter((i) => i.color === "green");
        const red = traffic.items.filter((i) => i.color === "red");
        const yellow = traffic.items.filter((i) => i.color === "yellow");
        const total = traffic.items.length;
        const greenPct = Math.round((green.length / total) * 100);
        const redPct = Math.round((red.length / total) * 100);

        return (
          <div className="mb-6 rounded-card border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 dark:border-emerald-800 dark:from-emerald-950 dark:to-teal-950">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">AI</span>
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Traffic Light Analysis</span>
            </div>
            <div className="mb-3 flex gap-2">
              <div className="flex-1 rounded-[8px] bg-green-100 p-2 text-center dark:bg-green-900">
                <p className="text-sm font-bold text-green-700 dark:text-green-300">{green.length}</p>
                <p className="text-[10px] text-green-600">Continue</p>
              </div>
              <div className="flex-1 rounded-[8px] bg-yellow-100 p-2 text-center dark:bg-yellow-900">
                <p className="text-sm font-bold text-yellow-700 dark:text-yellow-300">{yellow.length}</p>
                <p className="text-[10px] text-yellow-600">Improve</p>
              </div>
              <div className="flex-1 rounded-[8px] bg-red-100 p-2 text-center dark:bg-red-900">
                <p className="text-sm font-bold text-red-700 dark:text-red-300">{red.length}</p>
                <p className="text-[10px] text-red-600">Stop</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Efficiency Score: {greenPct}% green</p>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  {greenPct >= 60 ? "Most of your activities are working well. Protect and double down on green items." : greenPct >= 40 ? "Room to improve. Moving yellow items to green should be your priority." : "Many activities need attention. Start by eliminating red items to free up energy."}
                </p>
              </div>
              {redPct > 30 && (
                <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                  <p className="text-xs font-semibold text-red-500 dark:text-red-400">Action Required</p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    {red.length} activities to stop. Eliminating these frees up time for what works. Add action plans for each.
                  </p>
                </div>
              )}
              {yellow.length > 0 && !yellow.some((y) => y.actionPlan.trim()) && (
                <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Tip</p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    Yellow items need improvement plans. Click each card and describe how you&apos;ll turn it green.
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })()}

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
