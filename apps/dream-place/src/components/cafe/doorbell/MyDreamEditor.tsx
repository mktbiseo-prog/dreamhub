"use client";

import { useState, useEffect } from "react";
import { Button } from "@dreamhub/ui";
import { cn } from "@dreamhub/ui";
import { useCafeStore } from "@/store/useCafeStore";
import type { DoorbellCategory } from "@/types/cafe";

const CATEGORIES: { id: DoorbellCategory; label: string }[] = [
  { id: "tech", label: "Tech" },
  { id: "design", label: "Design" },
  { id: "business", label: "Business" },
  { id: "social-impact", label: "Social Impact" },
  { id: "creative", label: "Creative" },
  { id: "education", label: "Education" },
  { id: "other", label: "Other" },
];

const SKILL_SUGGESTIONS = [
  "React / Next.js",
  "Node.js / Express",
  "Machine Learning",
  "UI Design",
  "Growth Hacking",
  "Business Strategy",
  "Data Science / Analytics",
  "Mobile (React Native)",
  "Blockchain / Web3",
  "Content Marketing",
];

export function MyDreamEditor() {
  const { myDream, createOrUpdateMyDream, deleteMyDream } = useCafeStore();

  const [dreamStatement, setDreamStatement] = useState(
    myDream?.dreamStatement ?? ""
  );
  const [categories, setCategories] = useState<DoorbellCategory[]>(
    (myDream?.categories as DoorbellCategory[]) ?? []
  );
  const [neededSkills, setNeededSkills] = useState<string[]>(
    myDream?.neededSkills ?? []
  );
  const [isEditing, setIsEditing] = useState(!myDream);

  useEffect(() => {
    if (myDream) {
      setDreamStatement(myDream.dreamStatement);
      setCategories(myDream.categories);
      setNeededSkills(myDream.neededSkills);
    }
  }, [myDream]);

  const toggleCategory = (cat: DoorbellCategory) => {
    setCategories((prev) =>
      prev.includes(cat)
        ? prev.filter((c) => c !== cat)
        : prev.length < 3
          ? [...prev, cat]
          : prev
    );
  };

  const toggleSkill = (skill: string) => {
    setNeededSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : prev.length < 5
          ? [...prev, skill]
          : prev
    );
  };

  const handleSave = () => {
    if (dreamStatement.length < 10 || categories.length === 0 || neededSkills.length === 0) return;
    createOrUpdateMyDream({ dreamStatement, categories, neededSkills });
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteMyDream();
    setDreamStatement("");
    setCategories([]);
    setNeededSkills([]);
    setIsEditing(true);
  };

  // View mode — show existing dream
  if (myDream && !isEditing) {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Your Dream Doorbell
            </h3>
            <div className="flex items-center gap-1 text-sm text-neutral-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              {myDream.ringCount} rings
            </div>
          </div>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
            &ldquo;{myDream.dreamStatement}&rdquo;
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {myDream.categories.map((cat) => (
              <span
                key={cat}
                className="rounded-full bg-[#F5F1FF] px-2 py-0.5 text-[10px] font-medium text-[#5429C7] dark:bg-[#6C3CE1]/10 dark:text-[#B4A0F0]"
              >
                {cat}
              </span>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-red-500 hover:text-red-600"
              onClick={handleDelete}
            >
              Remove
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Edit / Create mode
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {myDream ? "Edit Your Dream" : "Share Your Dream"}
        </h3>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Tell the cafe what you&apos;re dreaming of building. Others can ring your bell to connect!
        </p>

        {/* Dream statement */}
        <textarea
          value={dreamStatement}
          onChange={(e) => setDreamStatement(e.target.value)}
          placeholder="I'm looking for someone to help me build..."
          maxLength={500}
          rows={3}
          className="mt-3 w-full resize-none rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-[#6C3CE1] focus:outline-none focus:ring-1 focus:ring-[#6C3CE1] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
        />
        <p className="mt-1 text-right text-xs text-neutral-400">
          {dreamStatement.length}/500
        </p>

        {/* Categories */}
        <div className="mt-3">
          <p className="mb-2 text-xs font-medium text-neutral-700 dark:text-neutral-300">
            Categories (up to 3)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  categories.includes(cat.id)
                    ? "border-[#6C3CE1] bg-[#F5F1FF] text-[#5429C7] dark:bg-[#6C3CE1]/10 dark:text-[#B4A0F0]"
                    : "border-neutral-200 text-neutral-500 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-400"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Needed skills */}
        <div className="mt-3">
          <p className="mb-2 text-xs font-medium text-neutral-700 dark:text-neutral-300">
            Skills you need (up to 5)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SKILL_SUGGESTIONS.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  neededSkills.includes(skill)
                    ? "border-[#6C3CE1] bg-[#F5F1FF] text-[#5429C7] dark:bg-[#6C3CE1]/10 dark:text-[#B4A0F0]"
                    : "border-neutral-200 text-neutral-500 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-400"
                )}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          {myDream && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          )}
          <Button
            className="flex-1"
            onClick={handleSave}
            disabled={
              dreamStatement.length < 10 ||
              categories.length === 0 ||
              neededSkills.length === 0
            }
          >
            {myDream ? "Update Dream" : "Share Dream"}
          </Button>
        </div>
      </div>
    </div>
  );
}
