"use client";

import { useState } from "react";
import { Button, cn } from "@dreamhub/ui";
import { usePlannerStore } from "@/lib/store";
import { PART4_REFLECTION_QUESTIONS } from "@/types/part4";
import { AiSummary } from "@/components/planner/AiSummary";
import { ExportButton } from "@/components/planner/ExportButton";

export function Part4Reflection() {
  const { data, store } = usePlannerStore();
  const answers = data.part4.reflectionAnswers;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const handleNext = () => {
    if (currentIndex < PART4_REFLECTION_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const updateAnswer = (value: string) => {
    const next = [...answers];
    next[currentIndex] = value;
    store.setPart4Data({ reflectionAnswers: next });
  };

  if (isComplete) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-card border border-gray-200 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-900">
          {/* Enhanced Celebration */}
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 via-brand-100 to-blue-100 dark:from-emerald-900 dark:via-brand-900 dark:to-blue-900">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 dark:text-emerald-400">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>

          <h2 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
            Dream Planner Complete!
          </h2>
          <p className="mb-2 text-lg text-brand-600 dark:text-brand-400">
            All 4 PARTs finished. You did it.
          </p>
          <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
            You&apos;ve faced reality, discovered your dream, validated your idea, and built your network.
            Now it&apos;s time to go make it happen.
          </p>

          {/* Journey Summary */}
          <div className="mb-6 grid gap-3 text-left sm:grid-cols-2">
            <div className="rounded-[8px] bg-purple-50 p-4 dark:bg-purple-950">
              <p className="text-xs font-semibold text-purple-600">PART 1 — Face My Reality</p>
              <div className="mt-2 space-y-1">
                {data.skills.length > 0 && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {data.skills.length} skills mapped
                  </p>
                )}
                {data.resources.some((r) => r.score > 0) && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Strongest: {data.resources.sort((a, b) => b.score - a.score)[0]?.label}
                  </p>
                )}
                {data.timeBlocks.length > 0 && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {data.timeBlocks.length} time blocks tracked
                  </p>
                )}
              </div>
            </div>
            <div className="rounded-[8px] bg-brand-50 p-4 dark:bg-brand-950">
              <p className="text-xs font-semibold text-brand-600">PART 2 — Discover My Dream</p>
              <div className="mt-2 space-y-1">
                {data.part2.whyWhatBridge.why && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Why: {data.part2.whyWhatBridge.why.slice(0, 60)}{data.part2.whyWhatBridge.why.length > 60 ? "..." : ""}
                  </p>
                )}
                {data.part2.failureEntries.length > 0 && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {data.part2.failureEntries.length} failures turned to lessons
                  </p>
                )}
                {data.part2.mindMapNodes.length > 0 && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {data.part2.mindMapNodes.length} mind map nodes
                  </p>
                )}
              </div>
            </div>
            <div className="rounded-[8px] bg-blue-50 p-4 dark:bg-blue-950">
              <p className="text-xs font-semibold text-blue-600">PART 3 — Validate & Build</p>
              <div className="mt-2 space-y-1">
                {data.part3.oneLineProposal.finalProposal && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Proposal: {data.part3.oneLineProposal.finalProposal.slice(0, 60)}{data.part3.oneLineProposal.finalProposal.length > 60 ? "..." : ""}
                  </p>
                )}
                {data.part3.hypotheses.some((h) => h.status !== "pending") && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {data.part3.hypotheses.filter((h) => h.status === "success").length}/{data.part3.hypotheses.length} hypotheses validated
                  </p>
                )}
                {data.part3.mvpPlan.mvpType && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    MVP: {data.part3.mvpPlan.mvpType.replace(/_/g, " ")}
                  </p>
                )}
              </div>
            </div>
            <div className="rounded-[8px] bg-emerald-50 p-4 dark:bg-emerald-950">
              <p className="text-xs font-semibold text-emerald-600">PART 4 — Connect & Expand</p>
              <div className="mt-2 space-y-1">
                {data.part4.fanCandidates.length > 0 && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {data.part4.fanCandidates.filter((f) => f.stage === "fan").length}/{data.part4.fanCandidates.length} fans converted
                  </p>
                )}
                {data.part4.dream5Network.members.length > 0 && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Dream 5: {data.part4.dream5Network.members.length}/5 slots filled
                  </p>
                )}
                {data.part4.rejectionChallenges.some((r) => r.completed) && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {data.part4.rejectionChallenges.filter((r) => r.completed).length} rejections collected
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Journey Stats */}
          <div className="mb-6 grid grid-cols-4 gap-2 text-center">
            <div className="rounded-[8px] bg-gray-50 p-3 dark:bg-gray-800">
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {data.skills.length}
              </p>
              <p className="text-[10px] text-gray-500">Skills</p>
            </div>
            <div className="rounded-[8px] bg-gray-50 p-3 dark:bg-gray-800">
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {data.part2.failureEntries.length}
              </p>
              <p className="text-[10px] text-gray-500">Lessons</p>
            </div>
            <div className="rounded-[8px] bg-gray-50 p-3 dark:bg-gray-800">
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {data.part3.hypotheses.filter((h) => h.status !== "pending").length}
              </p>
              <p className="text-[10px] text-gray-500">Tests</p>
            </div>
            <div className="rounded-[8px] bg-gray-50 p-3 dark:bg-gray-800">
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {data.part4.fanCandidates.length}
              </p>
              <p className="text-[10px] text-gray-500">Fans</p>
            </div>
          </div>

          {/* Reflections */}
          <div className="mb-8 space-y-4 text-left">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Final Reflections
            </h3>
            {PART4_REFLECTION_QUESTIONS.map((q, i) => (
              <div key={i} className="rounded-[8px] bg-gray-50 p-4 dark:bg-gray-800">
                <p className="mb-1 text-xs font-medium text-gray-400">{q}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {answers[i] || <span className="italic text-gray-400">No answer</span>}
                </p>
              </div>
            ))}
          </div>

          {/* AI Journey Report */}
          <div className="mb-8 text-left">
            <div className="mb-4 flex items-center justify-center gap-2">
              <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">AI</span>
              <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Your Journey Report</h3>
            </div>
            <div className="space-y-3">
              {/* Core Assets */}
              <div className="rounded-[8px] bg-purple-50 p-4 dark:bg-purple-950">
                <p className="mb-2 text-xs font-bold text-purple-600 dark:text-purple-400">Core Assets</p>
                <div className="space-y-1">
                  {data.skills.length > 0 && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Top skills: {data.skills.slice(0, 5).map((s) => s.name).join(", ")}
                    </p>
                  )}
                  {(() => {
                    const sorted = [...data.resources].sort((a, b) => b.score - a.score);
                    const top = sorted.filter((r) => r.score >= 4);
                    if (top.length > 0) return <p className="text-xs text-gray-600 dark:text-gray-400">Strongest resources: {top.map((r) => `${r.label} (${r.score}/5)`).join(", ")}</p>;
                    return null;
                  })()}
                  {data.part2.strengths.length > 0 && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Key strengths: {data.part2.strengths.slice(0, 3).join(", ")}
                    </p>
                  )}
                </div>
              </div>

              {/* Discovered Why */}
              <div className="rounded-[8px] bg-brand-50 p-4 dark:bg-brand-950">
                <p className="mb-2 text-xs font-bold text-brand-600 dark:text-brand-400">Your Why</p>
                {data.part2.whyWhatBridge.why ? (
                  <p className="text-xs italic text-gray-600 dark:text-gray-400">&ldquo;{data.part2.whyWhatBridge.why.slice(0, 200)}&rdquo;</p>
                ) : (
                  <p className="text-xs text-gray-400">Not yet defined</p>
                )}
                {data.part2.whyWhatBridge.selectedIndex >= 0 && (
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    Selected idea: {data.part2.whyWhatBridge.ideas[data.part2.whyWhatBridge.selectedIndex]}
                  </p>
                )}
              </div>

              {/* Validated Idea */}
              <div className="rounded-[8px] bg-blue-50 p-4 dark:bg-blue-950">
                <p className="mb-2 text-xs font-bold text-blue-600 dark:text-blue-400">Validated Idea</p>
                {data.part3.oneLineProposal.finalProposal ? (
                  <p className="text-xs italic text-gray-600 dark:text-gray-400">&ldquo;{data.part3.oneLineProposal.finalProposal}&rdquo;</p>
                ) : (
                  <p className="text-xs text-gray-400">No proposal finalized</p>
                )}
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  {data.part3.hypotheses.filter((h) => h.status === "success").length}/{data.part3.hypotheses.length} hypotheses validated
                  {data.part3.mvpPlan.mvpType && ` | MVP: ${data.part3.mvpPlan.mvpType.replace(/_/g, " ")}`}
                </p>
              </div>

              {/* Your Network */}
              <div className="rounded-[8px] bg-emerald-50 p-4 dark:bg-emerald-950">
                <p className="mb-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">Your Network</p>
                <div className="space-y-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {data.part4.fanCandidates.filter((f) => f.stage === "fan").length} fans out of {data.part4.fanCandidates.length} candidates
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Dream 5: {data.part4.dream5Network.members.filter((m) => m.name.trim()).length}/5 filled
                    ({data.part4.dream5Network.members.filter((m) => m.role === "mentor" && m.name.trim()).length} mentor,
                    {" "}{data.part4.dream5Network.members.filter((m) => m.role === "peer" && m.name.trim()).length} peers,
                    {" "}{data.part4.dream5Network.members.filter((m) => m.role === "partner" && m.name.trim()).length} partners)
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {data.part4.rejectionChallenges.filter((r) => r.completed).length} rejections collected — resilience proven
                  </p>
                </div>
              </div>

              {/* Recommended Next Steps */}
              <div className="rounded-[8px] bg-gradient-to-r from-amber-50 to-orange-50 p-4 dark:from-amber-950 dark:to-orange-950">
                <p className="mb-2 text-xs font-bold text-amber-600 dark:text-amber-400">Recommended Next Steps</p>
                <ol className="space-y-1">
                  {data.part4.fanCandidates.filter((f) => f.stage === "fan").length < 10 && (
                    <li className="text-xs text-gray-600 dark:text-gray-400">1. Keep growing your fan base to 10+</li>
                  )}
                  {data.part3.mvpPlan.retrospective.trim().length === 0 && data.part3.mvpPlan.mvpType && (
                    <li className="text-xs text-gray-600 dark:text-gray-400">2. Launch your MVP and write a retrospective</li>
                  )}
                  {data.part3.valueLadder.filter((v) => v.productName.trim()).length < 4 && (
                    <li className="text-xs text-gray-600 dark:text-gray-400">3. Complete your value ladder — all 4 tiers</li>
                  )}
                  <li className="text-xs text-gray-600 dark:text-gray-400">
                    {data.part4.fanCandidates.filter((f) => f.stage === "fan").length >= 10
                      ? "Scale your offering to Dream Store"
                      : "Connect with more dreamers on Dream Place"}
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Completion Certificate */}
          <div className="mb-8 rounded-card border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-white to-amber-50 p-8 text-center dark:border-amber-700 dark:from-amber-950 dark:via-gray-900 dark:to-amber-950">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500">Certificate of Completion</p>
            <div className="mx-auto my-4 h-px w-32 bg-amber-300 dark:bg-amber-700" />
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {data.userName || "Dreamer"}
            </p>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              has successfully completed the
            </p>
            <p className="mt-1 bg-gradient-to-r from-brand-500 to-blue-500 bg-clip-text text-xl font-bold text-transparent">
              Dream Planner
            </p>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              4 PARTs &middot; 20 Activities &middot; {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
            <div className="mx-auto my-4 h-px w-32 bg-amber-300 dark:bg-amber-700" />
            <p className="text-[10px] italic text-gray-400">Dream Hub &middot; Simon Squibb</p>
          </div>

          <div className="rounded-card bg-gradient-to-r from-emerald-50 via-brand-50 to-blue-50 p-6 dark:from-emerald-950 dark:via-brand-950 dark:to-blue-950">
            <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
              &ldquo;The biggest risk in life is not taking one. Go chase your dream.&rdquo;
            </p>
            <p className="mt-1 text-xs text-brand-500">— Simon Squibb</p>
          </div>

          <div className="my-6 flex justify-center">
            <ExportButton />
          </div>

          <AiSummary
            partNumber={4}
            dataSummary={JSON.stringify({
              journeyComplete: true,
              dreamStatement: data.dreamStatement,
              part1: {
                topSkills: data.skills.slice(0, 3).map((s) => s.name),
                strongestResource: data.resources.sort((a, b) => b.score - a.score)[0]?.label,
                timeBlocks: data.timeBlocks.length,
              },
              part2: {
                why: data.part2.whyWhatBridge.why,
                selectedIdea: data.part2.whyWhatBridge.selectedIndex >= 0 ? data.part2.whyWhatBridge.ideas[data.part2.whyWhatBridge.selectedIndex] : null,
                lessonsCount: data.part2.failureEntries.length,
              },
              part3: {
                proposal: data.part3.oneLineProposal.finalProposal,
                mvpType: data.part3.mvpPlan.mvpType,
                validatedCount: data.part3.hypotheses.filter((h) => h.status === "success").length,
              },
              part4: {
                fans: data.part4.fanCandidates.length,
                network: data.part4.dream5Network.members.length,
                rejections: data.part4.rejectionChallenges.filter((r) => r.completed).length,
                sustainability: data.part4.sustainabilityChecklist.questions.filter((q) => q.answer === "yes").length,
              },
              reflections: answers.filter((a) => a.trim()).slice(0, 3),
            }).slice(0, 2000)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
            PART 4
          </span>
          <span className="text-xs text-gray-400">Final Reflection</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          PART 4 Reflection
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          One last reflection before you complete the Dream Planner.
        </p>
      </div>

      <div className="mb-8 flex items-center justify-center gap-2">
        {PART4_REFLECTION_QUESTIONS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrentIndex(i)}
            className={cn(
              "h-2 rounded-full transition-all",
              i === currentIndex
                ? "w-8 bg-emerald-500"
                : answers[i]
                  ? "w-2 bg-emerald-300"
                  : "w-2 bg-gray-300 dark:bg-gray-600"
            )}
          />
        ))}
      </div>

      <div className="rounded-card border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-2 text-xs font-medium text-emerald-500">
          Question {currentIndex + 1} of {PART4_REFLECTION_QUESTIONS.length}
        </div>
        <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
          {PART4_REFLECTION_QUESTIONS[currentIndex]}
        </h3>
        <textarea
          value={answers[currentIndex]}
          onChange={(e) => updateAnswer(e.target.value)}
          placeholder="Take your time to think and write..."
          rows={6}
          autoFocus
          className="w-full resize-none rounded-[8px] border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" onClick={handlePrev} disabled={currentIndex === 0} className="gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Previous
        </Button>
        <Button onClick={handleNext} className="gap-2">
          {currentIndex === PART4_REFLECTION_QUESTIONS.length - 1
            ? "Complete Dream Planner"
            : "Next Question"}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
