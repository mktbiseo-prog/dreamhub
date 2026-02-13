"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Button, Input, cn } from "@dreamhub/ui";
import { StarRating } from "@/components/ui/StarRating";
import { usePlannerStore } from "@/lib/store";
import type { SkillItem, SkillCategory } from "@/types/planner";
import { SKILL_TABS } from "@/types/planner";

interface ValueProposition {
  title: string;
  description: string;
  skills: string[];
}

function AiValuePropositions({ skills, combinations }: { skills: SkillItem[]; combinations: string[] }) {
  const [propositions, setPropositions] = useState<ValueProposition[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/skills/combine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: skills.filter((s) => s.name.trim() && s.proficiency >= 2).map((s) => ({
            name: s.name,
            category: s.category,
            proficiency: s.proficiency,
          })),
        }),
      });
      if (res.ok) {
        const data = await res.json() as { valuePropositions: ValueProposition[] };
        setPropositions(data.valuePropositions);
        setGenerated(true);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 rounded-card border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 dark:border-emerald-800 dark:from-emerald-950 dark:to-teal-950">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">AI</span>
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
            {generated ? "Value You Can Provide" : "Your Unique Skill Combinations"}
          </span>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" /><path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" className="opacity-75" /></svg>
              Analyzing...
            </>
          ) : generated ? "Regenerate" : "Generate Value Ideas"}
        </button>
      </div>

      {!generated && (
        <>
          <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
            Cross-category skills create unique value. Click &quot;Generate Value Ideas&quot; for AI-powered suggestions.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {combinations.map((combo, i) => (
              <div key={i} className="flex items-center gap-2 rounded-[8px] bg-white px-3 py-2 dark:bg-gray-800">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">{i + 1}</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{combo}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {generated && propositions.length > 0 && (
        <div className="space-y-2">
          {propositions.map((prop, i) => (
            <div key={i} className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
              <div className="mb-1 flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">{i + 1}</span>
                <div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{prop.title}</p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{prop.description}</p>
                  {prop.skills.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {prop.skills.map((s) => (
                        <span key={s} className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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

// AI skill suggestion map: when user types a skill, suggest related ones
const SKILL_SUGGESTIONS: Record<string, string[]> = {
  excel: ["Data Analysis", "Pivot Tables", "VBA Macros", "Financial Modeling"],
  python: ["Data Science", "Machine Learning", "Web Scraping", "Automation"],
  design: ["UI/UX Design", "Figma", "Prototyping", "User Research"],
  marketing: ["SEO", "Content Strategy", "Social Media", "Email Marketing"],
  writing: ["Copywriting", "Blog Writing", "Technical Writing", "Storytelling"],
  sales: ["Negotiation", "CRM Management", "Lead Generation", "Cold Outreach"],
  cooking: ["Recipe Development", "Food Styling", "Nutrition", "Meal Planning"],
  photography: ["Photo Editing", "Lightroom", "Composition", "Studio Lighting"],
  teaching: ["Curriculum Design", "Public Speaking", "Mentoring", "Workshop Facilitation"],
  coding: ["Web Development", "API Design", "Database Management", "Testing"],
  management: ["Project Management", "Team Leadership", "Agile/Scrum", "Stakeholder Communication"],
  music: ["Audio Production", "Songwriting", "Music Theory", "Sound Design"],
  video: ["Video Editing", "Premiere Pro", "YouTube Strategy", "Thumbnails"],
  fitness: ["Personal Training", "Nutrition Coaching", "Program Design", "Body Assessment"],
  language: ["Translation", "Interpretation", "Tutoring", "Cultural Consulting"],
};

function getSkillSuggestions(skillName: string): string[] {
  const lower = skillName.toLowerCase().trim();
  if (!lower) return [];
  for (const [key, suggestions] of Object.entries(SKILL_SUGGESTIONS)) {
    if (lower.includes(key) || key.includes(lower)) return suggestions;
  }
  return [];
}

function getSkillCombinations(skills: SkillItem[]): string[] {
  const named = skills.filter((s) => s.name.trim() && s.proficiency >= 3);
  if (named.length < 2) return [];
  const combos: string[] = [];
  const categories = {
    work: named.filter((s) => s.category === "work").map((s) => s.name),
    personal: named.filter((s) => s.category === "personal").map((s) => s.name),
    learning: named.filter((s) => s.category === "learning").map((s) => s.name),
  };
  // Cross-category combinations
  for (const a of categories.work.slice(0, 2)) {
    for (const b of categories.personal.slice(0, 2)) {
      combos.push(`${a} + ${b}`);
    }
  }
  for (const a of categories.work.slice(0, 2)) {
    for (const b of categories.learning.slice(0, 2)) {
      combos.push(`${a} + ${b}`);
    }
  }
  for (const a of categories.personal.slice(0, 2)) {
    for (const b of categories.learning.slice(0, 2)) {
      combos.push(`${a} + ${b}`);
    }
  }
  return combos.slice(0, 6);
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

  // AI Suggestions based on recent skill input
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const lastSkill = filteredSkills[filteredSkills.length - 1];

  useEffect(() => {
    if (lastSkill?.name) {
      const s = getSkillSuggestions(lastSkill.name);
      const existingNames = skills.map((sk) => sk.name.toLowerCase());
      setSuggestions(s.filter((sug) => !existingNames.includes(sug.toLowerCase())));
    } else {
      setSuggestions([]);
    }
  }, [lastSkill?.name, skills]);

  const addSuggested = useCallback((name: string) => {
    store.setSkills([...skills, { id: crypto.randomUUID(), name, description: "", proficiency: 0, category: tab }]);
    setSuggestions((prev) => prev.filter((s) => s !== name));
  }, [tab, skills, store]);

  // AI Combination Engine
  const combinations = useMemo(() => getSkillCombinations(skills), [skills]);

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

      {/* AI Skill Suggestions */}
      {suggestions.length > 0 && (
        <div className="mt-4 rounded-card border border-brand-200 bg-gradient-to-r from-brand-50 to-blue-50 p-4 dark:border-brand-800 dark:from-brand-950 dark:to-blue-950">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-md bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-300">AI</span>
            <span className="text-xs font-medium text-brand-700 dark:text-brand-300">Related skills you might have</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button key={s} type="button" onClick={() => addSuggested(s)} className="flex items-center gap-1 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-brand-700 transition-all hover:bg-brand-100 dark:border-brand-700 dark:bg-gray-800 dark:text-brand-300 dark:hover:bg-brand-900">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI Value Proposition Engine */}
      {combinations.length > 0 && (
        <AiValuePropositions skills={skills} combinations={combinations} />
      )}

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
