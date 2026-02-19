"use client";

import { useState, useMemo } from "react";
import { Button, cn } from "@dreamhub/ui";
import { usePlannerStore } from "@/lib/store";
import { CrossPartRef } from "@/components/planner/CrossPartRef";
import { LADDER_TIERS } from "@/types/part3";

import type { PlannerData } from "@/lib/store";

interface ValueLadderItem {
  tier: string;
  productName: string;
  price: number;
  customerValue: string;
}

function RevenueSimulator({ ladder }: { ladder: ValueLadderItem[] }) {
  const [leads, setLeads] = useState(100);
  const [convLow, setConvLow] = useState(10);
  const [convMid, setConvMid] = useState(3);
  const [convHigh, setConvHigh] = useState(1);

  const low = ladder[1];
  const mid = ladder[2];
  const high = ladder[3];

  // Price gap alerts
  const gaps: string[] = [];
  if (low.price > 0 && ladder[0].price === 0 && low.price > 50) {
    gaps.push(`Big jump from free to $${low.price}. Consider a $${Math.round(low.price * 0.3)} option in between.`);
  }
  if (mid.price > 0 && low.price > 0 && mid.price > low.price * 5) {
    gaps.push(`${mid.productName || "Mid tier"} is ${Math.round(mid.price / low.price)}x the low tier. A 2-3x jump is more typical.`);
  }

  const lowRev = low.price * leads * (convLow / 100);
  const midRev = mid.price * leads * (convMid / 100);
  const highRev = high.price * leads * (convHigh / 100);
  const monthlyRevenue = lowRev + midRev + highRev;
  const yearlyRevenue = monthlyRevenue * 12;

  const lowCustomers = Math.round(leads * (convLow / 100));
  const midCustomers = Math.round(leads * (convMid / 100));
  const highCustomers = Math.round(leads * (convHigh / 100));

  return (
    <div className="mb-6 rounded-card border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 dark:border-blue-800 dark:from-blue-950 dark:to-cyan-950">
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">AI</span>
        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Revenue Simulator</span>
      </div>

      {gaps.length > 0 && (
        <div className="mb-3 rounded-[8px] bg-white p-3 dark:bg-gray-800">
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Pricing Gap Alert</p>
          {gaps.map((g, i) => (
            <p key={i} className="mt-1 text-xs text-gray-600 dark:text-gray-400">{g}</p>
          ))}
        </div>
      )}

      {/* Configurable Inputs */}
      <div className="mb-4 rounded-[8px] bg-white p-3 dark:bg-gray-800">
        <p className="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-300">Simulation Parameters</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 flex items-center justify-between text-[10px] text-gray-500">
              <span>Monthly Freebie Leads</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">{leads}</span>
            </label>
            <input type="range" min="10" max="1000" step="10" value={leads} onChange={(e) => setLeads(Number(e.target.value))} className="w-full accent-blue-500" />
          </div>
          <div>
            <label className="mb-1 flex items-center justify-between text-[10px] text-gray-500">
              <span>Low Tier Conversion</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">{convLow}%</span>
            </label>
            <input type="range" min="1" max="30" value={convLow} onChange={(e) => setConvLow(Number(e.target.value))} className="w-full accent-blue-500" />
          </div>
          <div>
            <label className="mb-1 flex items-center justify-between text-[10px] text-gray-500">
              <span>Mid Tier Conversion</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">{convMid}%</span>
            </label>
            <input type="range" min="1" max="15" value={convMid} onChange={(e) => setConvMid(Number(e.target.value))} className="w-full accent-blue-500" />
          </div>
          <div>
            <label className="mb-1 flex items-center justify-between text-[10px] text-gray-500">
              <span>High Tier Conversion</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">{convHigh}%</span>
            </label>
            <input type="range" min="0" max="10" value={convHigh} onChange={(e) => setConvHigh(Number(e.target.value))} className="w-full accent-blue-500" />
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
        <p className="mb-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">Revenue Projection</p>

        {/* Funnel Visualization */}
        <div className="mb-3 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-16 text-right text-[10px] text-gray-400">Freebie</span>
            <div className="h-4 flex-1 rounded-full bg-green-100 dark:bg-green-900">
              <div className="flex h-full items-center rounded-full bg-green-400 px-2 text-[10px] font-bold text-white" style={{ width: "100%" }}>
                {leads}
              </div>
            </div>
          </div>
          {low.price > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-16 text-right text-[10px] text-gray-400">${low.price}</span>
              <div className="h-4 flex-1 rounded-full bg-blue-100 dark:bg-blue-900">
                <div className="flex h-full items-center rounded-full bg-blue-400 px-2 text-[10px] font-bold text-white" style={{ width: `${Math.max(10, convLow * 3)}%` }}>
                  {lowCustomers} = ${Math.round(lowRev)}
                </div>
              </div>
            </div>
          )}
          {mid.price > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-16 text-right text-[10px] text-gray-400">${mid.price}</span>
              <div className="h-4 flex-1 rounded-full bg-purple-100 dark:bg-purple-900">
                <div className="flex h-full items-center rounded-full bg-purple-400 px-2 text-[10px] font-bold text-white" style={{ width: `${Math.max(10, convMid * 5)}%` }}>
                  {midCustomers} = ${Math.round(midRev)}
                </div>
              </div>
            </div>
          )}
          {high.price > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-16 text-right text-[10px] text-gray-400">${high.price}</span>
              <div className="h-4 flex-1 rounded-full bg-amber-100 dark:bg-amber-900">
                <div className="flex h-full items-center rounded-full bg-amber-400 px-2 text-[10px] font-bold text-white" style={{ width: `${Math.max(10, convHigh * 8)}%` }}>
                  {highCustomers} = ${Math.round(highRev)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-[6px] bg-gray-50 p-2 dark:bg-gray-900">
            <p className="text-[10px] text-gray-400">Monthly Revenue</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">${Math.round(monthlyRevenue).toLocaleString()}</p>
          </div>
          <div className="rounded-[6px] bg-gray-50 p-2 dark:bg-gray-900">
            <p className="text-[10px] text-gray-400">Yearly Revenue</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">${Math.round(yearlyRevenue).toLocaleString()}</p>
          </div>
        </div>
        <p className="mt-2 text-[10px] text-gray-400">
          Adjust the sliders above to see different scenarios. Total customers: {lowCustomers + midCustomers + highCustomers}/mo
        </p>
      </div>
    </div>
  );
}

function CustomerJourneyFlow({ ladder }: { ladder: ValueLadderItem[] }) {
  const stages = [
    { label: "Discover", icon: "eye", color: "#6b7280", description: "Finds you via social media, search, or referral" },
    { label: "Freebie", icon: "gift", color: "#22c55e", product: ladder[0] },
    { label: "Low Tier", icon: "ticket", color: "#3b82f6", product: ladder[1] },
    { label: "Mid Tier", icon: "star", color: "#8b5cf6", product: ladder[2] },
    { label: "High Tier", icon: "crown", color: "#f59e0b", product: ladder[3] },
    { label: "Fan", icon: "heart", color: "#ef4444", description: "Becomes an advocate and refers others" },
  ];

  const stageIcons: Record<string, React.ReactNode> = {
    eye: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    gift: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>,
    ticket: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 013-3h14a3 3 0 013 3M2 9v6a3 3 0 003 3h14a3 3 0 003-3V9M2 9l2.5 3L2 15M22 9l-2.5 3L22 15"/></svg>,
    star: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    crown: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M3 20h18"/></svg>,
    heart: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  };

  return (
    <div className="mb-6 rounded-card border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 dark:border-emerald-800 dark:from-emerald-950 dark:to-teal-950">
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">JOURNEY</span>
        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Customer Journey Flow</span>
      </div>
      <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
        How a stranger becomes your biggest fan through your value ladder.
      </p>

      {/* Flow Visualization */}
      <div className="flex items-start gap-1 overflow-x-auto pb-2">
        {stages.map((stage, i) => (
          <div key={stage.label} className="flex shrink-0 items-center">
            <div className="flex w-24 flex-col items-center text-center">
              {/* Icon Circle */}
              <div
                className="mb-2 flex h-10 w-10 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: stage.color }}
              >
                {stageIcons[stage.icon]}
              </div>
              {/* Label */}
              <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{stage.label}</p>
              {/* Product name or description */}
              {"product" in stage && stage.product ? (
                <p className="mt-0.5 text-[9px] text-gray-500">
                  {stage.product.productName || "—"}
                  {stage.product.price > 0 && ` ($${stage.product.price})`}
                </p>
              ) : (
                <p className="mt-0.5 text-[9px] text-gray-400">{stage.description}</p>
              )}
            </div>
            {/* Arrow */}
            {i < stages.length - 1 && (
              <svg width="20" height="16" viewBox="0 0 20 16" fill="none" className="shrink-0 text-gray-300 dark:text-gray-600">
                <path d="M2 8h14M12 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Key insight */}
      <div className="mt-3 rounded-[8px] bg-white/70 p-3 dark:bg-gray-800/70">
        <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">The Ladder Principle</p>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
          {ladder[0].productName
            ? `Your freebie "${ladder[0].productName}" attracts leads. Each tier builds trust and delivers more value, guiding customers naturally to your premium "${ladder[3].productName || "high-tier"}" offering.`
            : "Name your freebie above to see the full journey. Each tier should solve a progressively bigger problem and build trust with your audience."
          }
        </p>
      </div>
    </div>
  );
}

function AiPricingCoach({ ladder, data }: { ladder: ValueLadderItem[]; data: PlannerData }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<{ strategy: string; tips: string[]; benchmarks: string[] } | null>(null);

  const filledTiers = ladder.filter((s) => s.productName.trim());
  const hasData = filledTiers.length >= 2;

  // Generate mock pricing strategy advice based on current data
  const mockAdvice = useMemo(() => {
    const tips: string[] = [];
    const benchmarks: string[] = [];
    let strategy = "";

    const freebie = ladder[0];
    const low = ladder[1];
    const mid = ladder[2];
    const high = ladder[3];

    // Strategy based on pricing pattern
    if (high.price > 0 && low.price > 0) {
      const ratio = high.price / low.price;
      if (ratio > 20) {
        strategy = "Your high-to-low price ratio is " + Math.round(ratio) + "x. This is a premium strategy — make sure each tier jump includes a clear transformation upgrade, not just more features.";
      } else if (ratio >= 5) {
        strategy = "Solid price ratio across tiers. Your ladder follows a healthy 5-10x progression, similar to successful SaaS and coaching businesses.";
      } else {
        strategy = "Your tiers are closely priced. Consider widening the gap between mid and high tier by adding exclusive 1-on-1 access, community, or done-for-you services.";
      }
    } else if (filledTiers.length < 2) {
      strategy = "Fill in at least 2 tier prices to get personalized pricing strategy advice.";
    }

    // Tips based on data
    if (freebie.productName && !freebie.customerValue) {
      tips.push("Add a customer value for your freebie. The clearer the value, the more leads it attracts.");
    }
    if (low.price > 0 && low.price < 10) {
      tips.push(`$${low.price} is quite low. Consider whether your audience would pay $${Math.round(low.price * 2)}-$${Math.round(low.price * 3)} — many creators undercharge at the low tier.`);
    }
    if (mid.price > 0 && !mid.customerValue) {
      tips.push(`Your mid tier "${mid.productName || "product"}" needs a clear value statement. Mid tier is where most revenue comes from.`);
    }
    if (high.price > 500) {
      tips.push("For premium pricing above $500, consider adding a discovery call, guarantee, or payment plan to reduce friction.");
    }
    if (high.price > 0 && high.price < 100) {
      tips.push("Your high tier is under $100. Premium doesn't mean expensive, but consider what a VIP experience would look like.");
    }

    // Cross-reference with other parts
    const proposal = data.part3.oneLineProposal.finalProposal;
    if (proposal) {
      tips.push(`Ensure each tier connects to your proposal: "${proposal.slice(0, 60)}${proposal.length > 60 ? "..." : ""}". The freebie should solve the smallest version of the same problem.`);
    }

    const fanCount = data.part4.fanCandidates.length;
    if (fanCount > 0) {
      tips.push(`With ${fanCount} fan candidates in PART 4, consider pricing your low tier as a "no-brainer" impulse buy to convert leads quickly.`);
    }

    // Benchmarks
    if (low.price > 0) {
      benchmarks.push(`Low tier ($${low.price}): Digital products in this range typically see 5-15% conversion from free leads.`);
    }
    if (mid.price > 0) {
      benchmarks.push(`Mid tier ($${mid.price}): Group coaching or course bundles at this price point see 1-5% conversion.`);
    }
    if (high.price > 0) {
      benchmarks.push(`High tier ($${high.price}): Premium 1-on-1 or done-for-you services typically convert 0.5-2% of qualified leads.`);
    }

    return { strategy, tips, benchmarks };
  }, [ladder, data.part3.oneLineProposal.finalProposal, data.part4.fanCandidates.length, filledTiers.length]);

  const fetchAiAdvice = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityId: 14, data }),
      });
      if (res.ok) {
        const result = await res.json();
        setAiAdvice({
          strategy: result.insights?.[0] || mockAdvice.strategy,
          tips: result.suggestions || mockAdvice.tips,
          benchmarks: mockAdvice.benchmarks,
        });
      } else {
        // Fallback to mock
        setAiAdvice(mockAdvice);
      }
    } catch {
      setAiAdvice(mockAdvice);
    } finally {
      setLoading(false);
    }
  };

  const displayAdvice = aiAdvice || mockAdvice;

  if (!hasData) return null;

  return (
    <div className="mb-6 rounded-card border border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50 p-4 dark:border-cyan-800 dark:from-cyan-950 dark:to-blue-950">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-900 dark:text-purple-300">AI</span>
          <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Pricing Strategy Coach</span>
        </div>
        <button
          type="button"
          onClick={fetchAiAdvice}
          disabled={loading}
          className="flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-1 text-[10px] font-semibold text-purple-700 transition-colors hover:bg-purple-200 disabled:opacity-50 dark:bg-purple-900 dark:text-purple-300"
        >
          {loading ? (
            <>
              <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75"/></svg>
              Analyzing...
            </>
          ) : (
            <>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/></svg>
              Get AI Advice
            </>
          )}
        </button>
      </div>

      {/* Strategy */}
      {displayAdvice.strategy && (
        <div className="mb-3 rounded-[8px] bg-white p-3 dark:bg-gray-800">
          <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">Strategy Assessment</p>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{displayAdvice.strategy}</p>
        </div>
      )}

      {/* Tips */}
      {displayAdvice.tips.length > 0 && (
        <div className="mb-3 rounded-[8px] bg-white p-3 dark:bg-gray-800">
          <p className="mb-2 text-xs font-semibold text-purple-600 dark:text-purple-400">Pricing Tips</p>
          <div className="space-y-1.5">
            {displayAdvice.tips.slice(0, expanded ? undefined : 3).map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-purple-400">
                  <path d="M9 18l6-6-6-6" />
                </svg>
                <p className="text-xs text-gray-600 dark:text-gray-400">{tip}</p>
              </div>
            ))}
          </div>
          {displayAdvice.tips.length > 3 && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-[10px] font-medium text-purple-500 hover:text-purple-600"
            >
              {expanded ? "Show Less" : `+${displayAdvice.tips.length - 3} more tips`}
            </button>
          )}
        </div>
      )}

      {/* Benchmarks */}
      {displayAdvice.benchmarks.length > 0 && (
        <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
          <p className="mb-2 text-xs font-semibold text-purple-600 dark:text-purple-400">Industry Benchmarks</p>
          <div className="space-y-1.5">
            {displayAdvice.benchmarks.map((b, i) => (
              <p key={i} className="text-xs text-gray-500 dark:text-gray-400">{b}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ValueLadder({ onNext }: { onNext: () => void }) {
  const { data, store } = usePlannerStore();
  const ladder = data.part3.valueLadder;

  const updateStep = (index: number, field: string, value: string | number) => {
    const next = [...ladder];
    next[index] = { ...next[index], [field]: value };
    store.setPart3Data({ valueLadder: next });
  };

  const maxPrice = useMemo(() => {
    return Math.max(...ladder.map((s) => s.price), 100);
  }, [ladder]);

  // Reverse for visual (high at top)
  const visualLadder = [...ladder].reverse();
  const visualTiers = [...LADDER_TIERS].reverse();

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            PART 3
          </span>
          <span className="text-xs text-gray-400">Activity 14</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Value Ladder
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Design your product tiers from freebie to premium. Each step should deliver more value.
        </p>
      </div>

      <CrossPartRef context="value_ladder" />

      {/* Visual Ladder */}
      <div className="mb-6 rounded-card border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <div className="space-y-3">
          {visualLadder.map((step, vi) => {
            const tierConfig = visualTiers[vi];
            const originalIndex = ladder.length - 1 - vi;
            const widthPercent = step.price > 0 ? Math.max(30, (step.price / maxPrice) * 100) : 30;

            return (
              <div key={step.tier} className="flex items-center gap-4">
                {/* Tier Label */}
                <div className="w-20 text-right">
                  <span
                    className="text-xs font-bold"
                    style={{ color: tierConfig.color }}
                  >
                    {tierConfig.label}
                  </span>
                </div>

                {/* Step Bar */}
                <div
                  className="relative flex h-16 items-center rounded-[8px] px-4 transition-all duration-300"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: tierConfig.color + "20",
                    borderLeft: `4px solid ${tierConfig.color}`,
                  }}
                >
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {step.productName || "Untitled"}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      ${step.price}
                    </p>
                  </div>
                </div>

                {/* Arrow */}
                {vi < visualLadder.length - 1 && (
                  <div className="hidden text-gray-300 sm:block">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Price Scale */}
        <div className="mt-6 ml-24">
          <div className="relative h-2 rounded-full bg-gray-100 dark:bg-gray-800">
            {ladder.map((step, i) => {
              const left = step.price > 0 ? (step.price / maxPrice) * 100 : 0;
              return (
                <div
                  key={step.tier}
                  className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm"
                  style={{
                    left: `${Math.min(left, 98)}%`,
                    backgroundColor: LADDER_TIERS[i].color,
                  }}
                />
              );
            })}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-gray-400">
            <span>$0</span>
            <span>${maxPrice}</span>
          </div>
        </div>
      </div>

      {/* Input Cards */}
      <div className="mb-6 space-y-4">
        {ladder.map((step, i) => {
          const tierConfig = LADDER_TIERS[i];
          return (
            <div
              key={step.tier}
              className="rounded-card border bg-white p-4 dark:bg-gray-900"
              style={{ borderColor: tierConfig.color + "40" }}
            >
              <h3
                className="mb-3 text-sm font-semibold"
                style={{ color: tierConfig.color }}
              >
                {tierConfig.label}
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-400">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={step.productName}
                    onChange={(e) => updateStep(i, "productName", e.target.value)}
                    placeholder="e.g. Free Guide"
                    className="w-full rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-400">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={step.price}
                    onChange={(e) =>
                      updateStep(i, "price", Math.max(0, Number(e.target.value)))
                    }
                    className="w-full rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-400">
                    Customer Value
                  </label>
                  <input
                    type="text"
                    value={step.customerValue}
                    onChange={(e) =>
                      updateStep(i, "customerValue", e.target.value)
                    }
                    placeholder="What does the customer get?"
                    className="w-full rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer Journey Flow */}
      {ladder.some((s) => s.productName.trim()) && (
        <CustomerJourneyFlow ladder={ladder} />
      )}

      {/* Revenue Simulation */}
      {ladder.some((s) => s.price > 0) && (
        <RevenueSimulator ladder={ladder} />
      )}

      {/* AI Pricing Strategy Coach */}
      <AiPricingCoach ladder={ladder} data={data} />

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
