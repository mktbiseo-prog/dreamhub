"use client";

import { useState, useCallback, useMemo } from "react";
import { Button, Input, cn } from "@dreamhub/ui";
import { StarRating } from "@/components/ui/StarRating";
import { usePlannerStore } from "@/lib/store";
import type { SkillItem, SkillCategory } from "@/types/planner";
import { SKILL_TABS } from "@/types/planner";

function TagCloud({ skills }: { skills: SkillItem[] }) {
  const namedSkills = skills.filter((s) => s.name.trim());
  if (namedSkills.length === 0) return null;

  const categoryColors: Record<SkillCategory, string> = {
    work: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    personal: "bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300",
    learning: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  };
  const sizeClasses = ["text-xs px-2 py-0.5", "text-xs px-2 py-0.5", "text-sm px-2.5 py-1", "text-sm px-3 py-1", "text-base px-3 py-1.5 font-semibold", "text-lg px-4 py-1.5 font-bold"];

  return (
    <div className="mb-6 rounded-card border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Skill Cloud</h4>
      <div className="flex flex-wrap items-center gap-2">
        {namedSkills.map((skill) => (
          <span key={skill.id} className={cn("rounded-full transition-all", categoryColors[skill.category], sizeClasses[skill.proficiency] ?? sizeClasses[0])}>
            {skill.name}
          </span>
        ))}
      </div>
      <div className="mt-3 flex gap-4">
        {SKILL_TABS.map((tab) => (
          <div key={tab.key} className="flex items-center gap-1.5">
            <span className={cn("inline-block h-2 w-2 rounded-full", tab.key === "work" ? "bg-blue-500" : tab.key === "personal" ? "bg-brand-500" : "bg-emerald-500")} />
            <span className="text-xs text-gray-400">{tab.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillCard({ skill, onUpdate, onDelete }: { skill: SkillItem; onUpdate: (id: string, updates: Partial<SkillItem>) => void; onDelete: (id: string) => void }) {
  return (
    <div className="group rounded-card border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-4 flex items-start justify-between">
        <Input value={skill.name} onChange={(e) => onUpdate(skill.id, { name: e.target.value })} placeholder="Skill name" className="border-none bg-transparent p-0 text-base font-semibold shadow-none focus-visible:ring-0 focus-visible:ring-offset-0" />
        <button type="button" onClick={() => onDelete(skill.id)} className="ml-2 shrink-0 rounded-md p-1 text-gray-400 opacity-0 transition-opacity hover:bg-gray-100 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-gray-800" aria-label="Delete skill">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      </div>
      <textarea value={skill.description} onChange={(e) => onUpdate(skill.id, { description: e.target.value })} placeholder="Describe this skill or experience..." rows={2} className="mb-4 w-full resize-none rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300" />
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Proficiency</span>
        <StarRating value={skill.proficiency} onChange={(v) => onUpdate(skill.id, { proficiency: v })} />
      </div>
    </div>
  );
}

export function SkillsInventory({ onNext }: { onNext: () => void }) {
  const { data, store } = usePlannerStore();
  const [tab, setTab] = useState<SkillCategory>("work");
  const skills = data.skills;
  const filteredSkills = skills.filter((s) => s.category === tab);

  const addSkill = useCallback(() => {
    store.setSkills([...skills, { id: crypto.randomUUID(), name: "", description: "", proficiency: 0, category: tab }]);
  }, [tab, skills, store]);

  const updateSkill = useCallback((id: string, updates: Partial<SkillItem>) => {
    store.setSkills(skills.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }, [skills, store]);

  const deleteSkill = useCallback((id: string) => {
    store.setSkills(skills.filter((s) => s.id !== id));
  }, [skills, store]);

  const tabCounts = useMemo(() => SKILL_TABS.map((t) => skills.filter((s) => s.category === t.key).length), [skills]);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-md bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-300">PART 1</span>
          <span className="text-xs text-gray-400">Activity 1 of 5</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Skills & Experience Inventory</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">List everything you know and have done. Don&apos;t filter — include hobbies, side projects, and life experiences.</p>
      </div>

      <TagCloud skills={skills} />

      <div className="mb-6 flex gap-1 rounded-card border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800">
        {SKILL_TABS.map((t, i) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)} className={cn("flex-1 rounded-[8px] px-3 py-2 text-sm font-medium transition-all", tab === t.key ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-gray-100" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300")}>
            {t.label}
            {tabCounts[i] > 0 && <span className={cn("ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs", tab === t.key ? "bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300" : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400")}>{tabCounts[i]}</span>}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filteredSkills.map((skill) => (<SkillCard key={skill.id} skill={skill} onUpdate={updateSkill} onDelete={deleteSkill} />))}
        {filteredSkills.length === 0 && (
          <div className="rounded-card border-2 border-dashed border-gray-200 py-12 text-center dark:border-gray-700">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No skills added yet</p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Click the button below to add your first skill</p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <Button onClick={addSkill} className="w-full gap-2" variant="outline">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          Add Skill
        </Button>
      </div>

      <div className="mt-8 flex items-center justify-between">
        {skills.length > 0 && <p className="text-xs text-gray-500"><span className="font-semibold text-gray-700 dark:text-gray-300">{skills.length} {skills.length === 1 ? "skill" : "skills"}</span> across all categories</p>}
        <Button onClick={onNext} className="ml-auto gap-2">
          Next Activity
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </Button>
      </div>
    </div>
  );
}
