"use client";

import { useState, useCallback } from "react";
import { Button } from "@dreamhub/ui";

interface TrialProjectModalProps {
  open: boolean;
  onClose: () => void;
  partnerId: string;
  partnerName: string;
  onSubmit?: (data: {
    title: string;
    description: string;
    goals: string[];
    durationWeeks: number;
    deliverables: string[];
  }) => void;
}

export function TrialProjectModal({
  open,
  onClose,
  partnerName,
  onSubmit,
}: TrialProjectModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [durationWeeks, setDurationWeeks] = useState(2);
  const [deliverables, setDeliverables] = useState<string[]>([]);
  const [newDeliverable, setNewDeliverable] = useState("");

  const addGoal = useCallback(() => {
    const trimmed = newGoal.trim();
    if (trimmed && !goals.includes(trimmed)) {
      setGoals((prev) => [...prev, trimmed]);
      setNewGoal("");
    }
  }, [newGoal, goals]);

  const removeGoal = useCallback((index: number) => {
    setGoals((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addDeliverable = useCallback(() => {
    const trimmed = newDeliverable.trim();
    if (trimmed && !deliverables.includes(trimmed)) {
      setDeliverables((prev) => [...prev, trimmed]);
      setNewDeliverable("");
    }
  }, [newDeliverable, deliverables]);

  const removeDeliverable = useCallback((index: number) => {
    setDeliverables((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!title.trim()) return;
    onSubmit?.({
      title: title.trim(),
      description: description.trim(),
      goals,
      durationWeeks,
      deliverables,
    });
    // Reset
    setTitle("");
    setDescription("");
    setGoals([]);
    setNewGoal("");
    setDurationWeeks(2);
    setDeliverables([]);
    setNewDeliverable("");
    onClose();
  }, [title, description, goals, durationWeeks, deliverables, onSubmit, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Start Trial Project
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Test your collaboration with {partnerName}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* Project Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Project Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., MVP Landing Page"
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:border-[#6C3CE1] focus:outline-none focus:ring-2 focus:ring-[#E8E0FF] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you want to accomplish together..."
              rows={3}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:border-[#6C3CE1] focus:outline-none focus:ring-2 focus:ring-[#E8E0FF] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
            />
          </div>

          {/* Goals */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Goals
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addGoal()}
                placeholder="Add a goal..."
                className="flex-1 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:border-[#6C3CE1] focus:outline-none focus:ring-2 focus:ring-[#E8E0FF] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
              />
              <Button size="sm" variant="outline" onClick={addGoal}>
                Add
              </Button>
            </div>
            {goals.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {goals.map((goal, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full bg-[#E8E0FF] px-2.5 py-1 text-xs font-medium text-[#6C3CE1]"
                  >
                    {goal}
                    <button
                      type="button"
                      onClick={() => removeGoal(i)}
                      className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-[#d5c9ff]"
                    >
                      &#215;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Duration
            </label>
            <div className="flex gap-3">
              {[2, 3, 4].map((weeks) => (
                <button
                  key={weeks}
                  type="button"
                  onClick={() => setDurationWeeks(weeks)}
                  className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                    durationWeeks === weeks
                      ? "border-[#6C3CE1] bg-[#F5F1FF] text-[#6C3CE1]"
                      : "border-neutral-300 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  }`}
                >
                  {weeks} weeks
                </button>
              ))}
            </div>
          </div>

          {/* Deliverables */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Deliverables
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newDeliverable}
                onChange={(e) => setNewDeliverable(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addDeliverable()}
                placeholder="Add a deliverable..."
                className="flex-1 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:border-[#6C3CE1] focus:outline-none focus:ring-2 focus:ring-[#E8E0FF] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
              />
              <Button size="sm" variant="outline" onClick={addDeliverable}>
                Add
              </Button>
            </div>
            {deliverables.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {deliverables.map((d, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-300"
                  >
                    {d}
                    <button
                      type="button"
                      onClick={() => removeDeliverable(i)}
                      className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-green-200 dark:hover:bg-green-800"
                    >
                      &#215;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={!title.trim()}
          >
            Create Trial Project
          </Button>
        </div>
      </div>
    </div>
  );
}
