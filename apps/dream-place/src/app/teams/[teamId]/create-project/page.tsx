"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@dreamhub/ui";
import { Input } from "@dreamhub/ui";
import { Textarea } from "@dreamhub/ui";
import { Label } from "@dreamhub/ui";
import { cn } from "@dreamhub/ui";
import { TagSelector } from "@/components/onboarding/TagSelector";
import { useDreamStore } from "@/store/useDreamStore";

const TRIAL_DURATIONS = [
  { value: 2, label: "2 weeks" },
  { value: 3, label: "3 weeks" },
  { value: 4, label: "4 weeks" },
];

export default function CreateProjectPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = use(params);
  const router = useRouter();
  const createProject = useDreamStore((s) => s.createProject);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [isTrial, setIsTrial] = useState(false);
  const [trialDuration, setTrialDuration] = useState(3);
  const [evaluationCriteria, setEvaluationCriteria] = useState<string[]>([""]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    createProject(teamId, name.trim(), description.trim(), skills, {
      isTrial,
      trialDurationWeeks: isTrial ? trialDuration : undefined,
      evaluationCriteria: isTrial
        ? evaluationCriteria.filter((c) => c.trim() !== "")
        : undefined,
    });
    router.push(`/teams/${teamId}`);
  }

  function updateCriteria(index: number, value: string) {
    setEvaluationCriteria((prev) =>
      prev.map((c, i) => (i === index ? value : c))
    );
  }

  function addCriteria() {
    if (evaluationCriteria.length < 3) {
      setEvaluationCriteria((prev) => [...prev, ""]);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
        Create Project
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="projName">Project Name</Label>
          <Input
            id="projName"
            placeholder="e.g., AI Tutor MVP"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="projDesc">Description</Label>
          <Textarea
            id="projDesc"
            placeholder="What will this project accomplish?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label>Skills Needed</Label>
          <TagSelector
            selected={skills}
            onChange={setSkills}
            maxTags={10}
          />
        </div>

        {/* Trial project toggle */}
        <div className="rounded-[12px] border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
          <label className="flex cursor-pointer items-center gap-3">
            <div className="relative">
              <input
                type="checkbox"
                checked={isTrial}
                onChange={(e) => setIsTrial(e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-5 w-9 rounded-full bg-gray-200 transition-colors peer-checked:bg-brand-500 dark:bg-gray-700" />
              <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Start as trial project
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Run a 2-4 week trial before full commitment
              </p>
            </div>
          </label>

          {isTrial && (
            <div className="mt-4 space-y-4">
              {/* Duration */}
              <div className="space-y-2">
                <Label>Trial Duration</Label>
                <div className="flex gap-2">
                  {TRIAL_DURATIONS.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setTrialDuration(d.value)}
                      className={cn(
                        "flex-1 rounded-[8px] border px-3 py-2 text-sm font-medium transition-colors",
                        trialDuration === d.value
                          ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-900/20 dark:text-brand-300"
                          : "border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400"
                      )}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Evaluation criteria */}
              <div className="space-y-2">
                <Label>Success Criteria (up to 3)</Label>
                {evaluationCriteria.map((c, i) => (
                  <Input
                    key={i}
                    placeholder={`Criterion ${i + 1}...`}
                    value={c}
                    onChange={(e) => updateCriteria(i, e.target.value)}
                  />
                ))}
                {evaluationCriteria.length < 3 && (
                  <button
                    type="button"
                    onClick={addCriteria}
                    className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400"
                  >
                    + Add criterion
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!name.trim()}>
            Create Project
          </Button>
        </div>
      </form>
    </div>
  );
}
