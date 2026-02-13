"use client";

import { useState, useCallback } from "react";
import { Button, cn } from "@dreamhub/ui";
import { usePlannerStore } from "@/lib/store";
import { CrossPartRef } from "@/components/planner/CrossPartRef";
import type { MvpType, MvpStep } from "@/types/part3";
import { MVP_TYPE_LABELS } from "@/types/part3";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const WIZARD_STEPS = [
  "MVP Type",
  "Execution Plan",
  "Promotions",
  "Success Criteria",
  "Challenges",
  "Retrospective",
];

const MVP_TEMPLATES: Record<MvpType, string[]> = {
  landing_page: [
    "Define your value proposition headline",
    "Write 3 key benefits",
    "Create a simple mockup (Canva/Figma)",
    "Set up a free landing page (Carrd/Notion)",
    "Add an email signup form",
    "Write a compelling CTA",
    "Share on 3 social channels",
    "Collect feedback from first 10 visitors",
    "Analyze signup conversion rate",
    "Iterate based on feedback",
  ],
  pre_signup: [
    "Write a problem statement",
    "Create a waitlist page",
    "Define early-bird incentive",
    "Set up email collection (Google Forms/Typeform)",
    "Post in 3 relevant communities",
    "DM 10 potential customers",
    "Track daily signups",
    "Send update email to signups",
    "Reach 30+ signups milestone",
    "Validate with pre-signup interviews",
  ],
  sns_campaign: [
    "Choose your primary platform",
    "Create 5 content pieces",
    "Define your content hook style",
    "Post consistently for 7 days",
    "Engage with 20 accounts daily",
    "Track engagement metrics",
    "Run a poll or question post",
    "Collaborate with 1 micro-creator",
    "Analyze best-performing content",
    "Convert followers to email list",
  ],
  manual_service: [
    "Define your service offering",
    "Set a simple pricing (or free trial)",
    "Create a 1-page service description",
    "Reach out to 5 potential clients",
    "Deliver service to first client manually",
    "Collect detailed feedback",
    "Document your process",
    "Refine based on feedback",
    "Serve 3 more clients",
    "Calculate time vs value delivered",
  ],
};

function SortableStep({
  step,
  onToggle,
  onUpdate,
  onDelete,
}: {
  step: MvpStep;
  onToggle: () => void;
  onUpdate: (text: string) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-[8px] border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
    >
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

      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all",
          step.done
            ? "border-green-500 bg-green-500"
            : "border-gray-300 dark:border-gray-600"
        )}
      >
        {step.done && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <input
        type="text"
        value={step.text}
        onChange={(e) => onUpdate(e.target.value)}
        placeholder="Describe this step..."
        className={cn(
          "flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus-visible:outline-none dark:text-gray-300",
          step.done && "line-through opacity-50"
        )}
      />

      <button type="button" onClick={onDelete} className="text-gray-400 hover:text-red-500">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

export function ZeroCostMvp({ onNext }: { onNext: () => void }) {
  const { data, store } = usePlannerStore();
  const mvp = data.part3.mvpPlan;
  const [wizardStep, setWizardStep] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const updateMvp = (partial: Partial<typeof mvp>) => {
    store.setPart3Data({ mvpPlan: { ...mvp, ...partial } });
  };

  const addStep = useCallback(() => {
    updateMvp({
      steps: [...mvp.steps, { id: crypto.randomUUID(), text: "", done: false }],
    });
  }, [mvp]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = mvp.steps.findIndex((s) => s.id === active.id);
      const newIndex = mvp.steps.findIndex((s) => s.id === over.id);
      updateMvp({ steps: arrayMove(mvp.steps, oldIndex, newIndex) });
    }
  };

  const mvpTypes: MvpType[] = ["landing_page", "pre_signup", "sns_campaign", "manual_service"];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            PART 3
          </span>
          <span className="text-xs text-gray-400">Activity 13</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Zero-Cost MVP
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Plan and execute your first product with $0 budget.
        </p>
      </div>

      <CrossPartRef context="mvp" />

      {/* Step Indicator */}
      <div className="mb-8 flex items-center gap-1">
        {WIZARD_STEPS.map((label, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setWizardStep(i)}
            className={cn(
              "flex-1 rounded-[6px] py-2 text-center text-[10px] font-medium transition-all sm:text-xs",
              i === wizardStep
                ? "bg-brand-500 text-white"
                : i < wizardStep
                  ? "bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300"
                  : "bg-gray-100 text-gray-400 dark:bg-gray-800"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mb-6 rounded-card border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        {/* Step 0: MVP Type */}
        {wizardStep === 0 && (
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Choose Your MVP Type
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {mvpTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => updateMvp({ mvpType: type })}
                  className={cn(
                    "rounded-card border-2 p-4 text-left transition-all",
                    mvp.mvpType === type
                      ? "border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-950"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                  )}
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {MVP_TYPE_LABELS[type]}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Execution Plan */}
        {wizardStep === 1 && (
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Execution Plan
            </h3>
            <p className="mb-4 text-sm text-gray-500">
              Create up to 10 steps. Drag to reorder, check when done.
            </p>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={mvp.steps.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {mvp.steps.map((step) => (
                    <SortableStep
                      key={step.id}
                      step={step}
                      onToggle={() =>
                        updateMvp({
                          steps: mvp.steps.map((s) =>
                            s.id === step.id ? { ...s, done: !s.done } : s
                          ),
                        })
                      }
                      onUpdate={(text) =>
                        updateMvp({
                          steps: mvp.steps.map((s) =>
                            s.id === step.id ? { ...s, text } : s
                          ),
                        })
                      }
                      onDelete={() =>
                        updateMvp({
                          steps: mvp.steps.filter((s) => s.id !== step.id),
                        })
                      }
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            {mvp.steps.length < 10 && (
              <button
                type="button"
                onClick={addStep}
                className="mt-3 w-full rounded-[8px] border border-dashed border-gray-300 py-2 text-xs text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                + Add Step
              </button>
            )}
          </div>
        )}

        {/* Step 2: Promotions */}
        {wizardStep === 2 && (
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Promotion Strategies
            </h3>
            <div className="space-y-3">
              {mvp.promotions.map((promo, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {i + 1}
                  </span>
                  <input
                    type="text"
                    value={promo}
                    onChange={(e) => {
                      const next = [...mvp.promotions];
                      next[i] = e.target.value;
                      updateMvp({ promotions: next });
                    }}
                    placeholder={`Promotion strategy ${i + 1}...`}
                    className="flex-1 rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Success Criteria */}
        {wizardStep === 3 && (
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Success Criteria
            </h3>
            <textarea
              value={mvp.successCriteria}
              onChange={(e) => updateMvp({ successCriteria: e.target.value })}
              placeholder="How will you know your MVP is successful? (e.g. 10 signups in 1 week)"
              rows={4}
              className="w-full resize-none rounded-[8px] border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            />
          </div>
        )}

        {/* Step 4: Challenges */}
        {wizardStep === 4 && (
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Expected Challenges & Solutions
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500">
                  Challenges
                </label>
                <textarea
                  value={mvp.challenges}
                  onChange={(e) => updateMvp({ challenges: e.target.value })}
                  placeholder="What might go wrong?"
                  rows={3}
                  className="w-full resize-none rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:border-red-900 dark:bg-red-950 dark:text-gray-300"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500">
                  Solutions
                </label>
                <textarea
                  value={mvp.solutions}
                  onChange={(e) => updateMvp({ solutions: e.target.value })}
                  placeholder="How will you handle each challenge?"
                  rows={3}
                  className="w-full resize-none rounded-[8px] border border-green-200 bg-green-50 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:border-green-900 dark:bg-green-950 dark:text-gray-300"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Retrospective */}
        {wizardStep === 5 && (
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Post-Launch Retrospective
            </h3>
            <textarea
              value={mvp.retrospective}
              onChange={(e) => updateMvp({ retrospective: e.target.value })}
              placeholder="After launching your MVP, reflect: What worked? What didn't? What would you do differently?"
              rows={6}
              className="w-full resize-none rounded-[8px] border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            />
          </div>
        )}
      </div>

      {/* AI MVP Template Library */}
      {mvp.mvpType && mvp.steps.length === 0 && (
        <div className="mb-6 rounded-card border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 dark:border-blue-800 dark:from-blue-950 dark:to-cyan-950">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">AI</span>
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Template Library</span>
          </div>
          <p className="mb-3 text-xs text-gray-600 dark:text-gray-400">
            Here&apos;s a proven 10-step template for <strong>{MVP_TYPE_LABELS[mvp.mvpType]}</strong>. Click to use it as your starting plan.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              updateMvp({
                steps: MVP_TEMPLATES[mvp.mvpType as MvpType].map((text) => ({
                  id: crypto.randomUUID(),
                  text,
                  done: false,
                })),
              });
              setWizardStep(1);
            }}
          >
            Use Template
          </Button>
        </div>
      )}

      {/* AI MVP Readiness Check */}
      {mvp.steps.length > 0 && (() => {
        const stepsCompleted = mvp.steps.filter((s) => s.done).length;
        const stepsTotal = mvp.steps.length;
        const hasType = !!mvp.mvpType;
        const hasPromotions = mvp.promotions.filter((p) => p.trim()).length;
        const hasCriteria = mvp.successCriteria.trim().length > 0;
        const hasChallenges = mvp.challenges.trim().length > 0 && mvp.solutions.trim().length > 0;
        const readinessScore = [
          hasType ? 20 : 0,
          Math.round((stepsCompleted / Math.max(stepsTotal, 1)) * 30),
          Math.min(hasPromotions * 6, 20),
          hasCriteria ? 15 : 0,
          hasChallenges ? 15 : 0,
        ].reduce((a, b) => a + b, 0);

        return (
          <div className="mb-6 rounded-card border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 dark:border-emerald-800 dark:from-emerald-950 dark:to-teal-950">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">AI</span>
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">MVP Readiness Check</span>
            </div>
            <div className="mb-3 rounded-[8px] bg-white p-3 dark:bg-gray-800">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Launch Readiness</p>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{readinessScore}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-400 via-amber-400 to-green-500 transition-all duration-700"
                  style={{ width: `${readinessScore}%` }}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              {[
                { done: hasType, label: "MVP type selected" },
                { done: stepsCompleted > 0, label: `${stepsCompleted}/${stepsTotal} steps completed` },
                { done: hasPromotions >= 3, label: `${hasPromotions}/5 promotion strategies` },
                { done: hasCriteria, label: "Success criteria defined" },
                { done: hasChallenges, label: "Challenges & solutions planned" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 rounded-[6px] bg-white px-3 py-1.5 dark:bg-gray-800">
                  <span className={cn("text-xs", item.done ? "text-emerald-500" : "text-gray-300")}>
                    {item.done ? "\u2714" : "\u25CB"}
                  </span>
                  <span className={cn("text-xs", item.done ? "text-gray-700 dark:text-gray-300" : "text-gray-400")}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            {readinessScore >= 80 && (
              <p className="mt-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Your MVP is nearly launch-ready! Move to the retrospective after your first test.
              </p>
            )}
          </div>
        );
      })()}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setWizardStep(Math.max(0, wizardStep - 1))}
          disabled={wizardStep === 0}
          className="gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Previous Step
        </Button>

        {wizardStep < WIZARD_STEPS.length - 1 ? (
          <Button onClick={() => setWizardStep(wizardStep + 1)} className="gap-2">
            Next Step
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Button>
        ) : (
          <Button onClick={onNext} className="gap-2">
            Next Activity
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Button>
        )}
      </div>
    </div>
  );
}
