"use client";

import { useState } from "react";
import {
  User,
  MapPin,
  Wrench,
  CheckSquare,
  Square,
  CheckCircle2,
} from "lucide-react";

interface ExtractedEntitiesProps {
  actionItems: string[];
  people: string[];
  places: string[];
  skills: string[];
  className?: string;
}

interface EntitySectionProps {
  icon: React.ReactNode;
  label: string;
  items: string[];
  colorClass: string;
  bgClass: string;
}

function EntitySection({
  icon,
  label,
  items,
  colorClass,
  bgClass,
}: EntitySectionProps) {
  if (items.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className={`text-xs font-medium ${colorClass}`}>{label}</span>
        <span className="text-[10px] text-gray-600">{items.length}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item}
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${bgClass} ${colorClass} transition-colors hover:brightness-125 cursor-default`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function ActionItemsList({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  if (items.length === 0) return null;

  function toggleItem(index: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <CheckSquare className="h-3.5 w-3.5 text-amber-400" />
        <span className="text-xs font-medium text-amber-400">Action Items</span>
        <span className="text-[10px] text-gray-600">{items.length}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {items.map((item, idx) => {
          const isChecked = checked.has(idx);
          return (
            <button
              key={idx}
              type="button"
              onClick={() => toggleItem(idx)}
              className="group flex items-start gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/[0.03]"
            >
              {isChecked ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <Square className="mt-0.5 h-4 w-4 shrink-0 text-amber-400/60 group-hover:text-amber-400" />
              )}
              <span
                className={`text-xs leading-relaxed transition-all ${
                  isChecked
                    ? "text-gray-600 line-through"
                    : "text-gray-300"
                }`}
              >
                {item}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ExtractedEntities({
  actionItems,
  people,
  places,
  skills,
  className,
}: ExtractedEntitiesProps) {
  const hasAny =
    actionItems.length > 0 ||
    people.length > 0 ||
    places.length > 0 ||
    skills.length > 0;

  if (!hasAny) return null;

  return (
    <div
      className={`rounded-[12px] border border-white/[0.06] bg-white/[0.03] p-4 ${className ?? ""}`}
    >
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Extracted Entities
      </h4>

      <div className="flex flex-col gap-4">
        <ActionItemsList items={actionItems} />

        <EntitySection
          icon={<User className="h-3.5 w-3.5 text-blue-400" />}
          label="People"
          items={people}
          colorClass="text-blue-400"
          bgClass="bg-blue-400/10"
        />

        <EntitySection
          icon={<MapPin className="h-3.5 w-3.5 text-emerald-400" />}
          label="Places"
          items={places}
          colorClass="text-emerald-400"
          bgClass="bg-emerald-400/10"
        />

        <EntitySection
          icon={<Wrench className="h-3.5 w-3.5 text-purple-400" />}
          label="Skills"
          items={skills}
          colorClass="text-purple-400"
          bgClass="bg-purple-400/10"
        />
      </div>
    </div>
  );
}
