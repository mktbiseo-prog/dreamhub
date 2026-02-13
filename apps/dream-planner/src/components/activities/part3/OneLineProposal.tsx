"use client";

import { useCallback, useMemo } from "react";
import { Button, cn } from "@dreamhub/ui";
import { usePlannerStore } from "@/lib/store";
import { CrossPartRef } from "@/components/planner/CrossPartRef";
import type { ProposalCombo } from "@/types/part3";

export function OneLineProposal({ onNext }: { onNext: () => void }) {
  const { data, store } = usePlannerStore();
  const proposal = data.part3.oneLineProposal;

  const getInputField = (field: keyof typeof proposal.inputs) => proposal.inputs[field];

  const updateInputs = (field: keyof typeof proposal.inputs, index: number, value: string) => {
    const arr = [...getInputField(field)];
    arr[index] = value;
    store.setPart3Data({
      oneLineProposal: {
        ...proposal,
        inputs: { ...proposal.inputs, [field]: arr },
      },
    });
  };

  const addInput = (field: keyof typeof proposal.inputs) => {
    const arr = [...getInputField(field), ""];
    store.setPart3Data({
      oneLineProposal: {
        ...proposal,
        inputs: { ...proposal.inputs, [field]: arr },
      },
    });
  };

  const generateCombos = useCallback(() => {
    const { targets, problems, solutions, differentiators } = proposal.inputs;
    const combos: ProposalCombo[] = [];

    for (const t of targets.filter((v) => v.trim())) {
      for (const p of problems.filter((v) => v.trim())) {
        for (const s of solutions.filter((v) => v.trim())) {
          for (const d of differentiators.filter((v) => v.trim())) {
            combos.push({
              id: crypto.randomUUID(),
              target: t,
              problem: p,
              solution: s,
              differentiator: d,
              liked: false,
            });
          }
        }
      }
    }

    store.setPart3Data({
      oneLineProposal: { ...proposal, combos },
    });
  }, [proposal, store]);

  const toggleLike = useCallback(
    (id: string) => {
      store.setPart3Data({
        oneLineProposal: {
          ...proposal,
          combos: proposal.combos.map((c) =>
            c.id === id ? { ...c, liked: !c.liked } : c
          ),
        },
      });
    },
    [proposal, store]
  );

  const likedCombos = proposal.combos.filter((c) => c.liked);

  const fields = [
    { key: "targets", label: "Target Audience", placeholder: "e.g. Young entrepreneurs" },
    { key: "problems", label: "Problem", placeholder: "e.g. Don't know where to start" },
    { key: "solutions", label: "Solution", placeholder: "e.g. Step-by-step mentoring" },
    { key: "differentiators", label: "Differentiator", placeholder: "e.g. Community-driven" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            PART 3
          </span>
          <span className="text-xs text-gray-400">Activity 11</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          One-Line Proposal
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          &ldquo;I help [TARGET] solve [PROBLEM] through [SOLUTION]. It&apos;s special because [DIFFERENTIATOR].&rdquo;
        </p>
      </div>

      <CrossPartRef context="proposal" />

      {/* Input Fields */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          const fieldKey = field.key as keyof typeof proposal.inputs;
          const values = proposal.inputs[fieldKey];
          return (
            <div
              key={field.key}
              className="rounded-card border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
            >
              <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                {field.label}
              </h3>
              <div className="space-y-2">
                {values.map((v: string, i: number) => (
                  <input
                    key={i}
                    type="text"
                    value={v}
                    onChange={(e) => updateInputs(fieldKey, i, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => addInput(fieldKey)}
                className="mt-2 text-xs text-brand-500 hover:text-brand-700"
              >
                + Add another
              </button>
            </div>
          );
        })}
      </div>

      {/* Generate Button */}
      <Button onClick={generateCombos} className="mb-6 w-full gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
        Generate Combinations
      </Button>

      {/* Combos Grid */}
      {proposal.combos.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Generated Proposals ({proposal.combos.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {proposal.combos.map((combo) => (
              <div
                key={combo.id}
                className={cn(
                  "rounded-card border p-4 transition-all",
                  combo.liked
                    ? "border-brand-300 bg-brand-50 dark:border-brand-700 dark:bg-brand-950"
                    : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
                )}
              >
                <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
                  I help <strong>{combo.target}</strong> solve{" "}
                  <strong>{combo.problem}</strong> through{" "}
                  <strong>{combo.solution}</strong>. It&apos;s special because{" "}
                  <strong>{combo.differentiator}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => toggleLike(combo.id)}
                  className={cn(
                    "text-lg transition-transform hover:scale-110",
                    combo.liked ? "text-red-500" : "text-gray-300"
                  )}
                >
                  {combo.liked ? "\u2764\ufe0f" : "\u2661"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Final Proposal */}
      {likedCombos.length > 0 && (
        <div className="mb-6 rounded-card bg-gradient-to-r from-brand-50 to-blue-50 p-5 dark:from-brand-950 dark:to-blue-950">
          <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Write Your Final Proposal
          </h3>
          <textarea
            value={proposal.finalProposal}
            onChange={(e) =>
              store.setPart3Data({
                oneLineProposal: { ...proposal, finalProposal: e.target.value },
              })
            }
            placeholder="Refine your favorite combination into a polished one-liner..."
            rows={3}
            className="w-full resize-none rounded-[8px] border border-brand-200 bg-white px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-brand-800 dark:bg-gray-900 dark:text-gray-300"
          />
        </div>
      )}

      {/* AI Proposal Polish Checklist */}
      {proposal.finalProposal.trim().length > 10 && (
        <div className="mb-6 rounded-card border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 dark:border-blue-800 dark:from-blue-950 dark:to-cyan-950">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">AI</span>
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Proposal Polish Check</span>
          </div>
          <div className="space-y-1.5">
            {[
              { check: proposal.finalProposal.length <= 140, label: "Under 140 chars (tweetable)", tip: "Shorter is stronger." },
              { check: /\[.+\]/.test(proposal.finalProposal) === false, label: "No placeholder brackets", tip: "Fill in all [blanks]." },
              { check: proposal.finalProposal.split(" ").length <= 25, label: "Under 25 words", tip: "If you can't explain it simply, simplify it." },
              { check: proposal.inputs.targets.some((t) => t.trim()) && proposal.finalProposal.toLowerCase().includes(proposal.inputs.targets[0]?.toLowerCase().slice(0, 4) || "xxx"), label: "Mentions your target audience", tip: "Make it clear who this is for." },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 rounded-[6px] bg-white px-3 py-2 dark:bg-gray-800">
                <span className={cn("text-xs", item.check ? "text-emerald-500" : "text-gray-300")}>
                  {item.check ? "\u2714" : "\u25CB"}
                </span>
                <span className={cn("text-xs", item.check ? "text-gray-700 dark:text-gray-300" : "text-gray-400")}>{item.label}</span>
                {!item.check && <span className="ml-auto text-[10px] text-gray-400">{item.tip}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

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
