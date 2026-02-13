import OpenAI from "openai";
import type { PlannerData } from "@/lib/store";

export interface AiInsightResult {
  insights: string[];
  suggestions: string[];
  crossPartConnections?: string[];
}

const INSIGHT_SYSTEM_PROMPT = `You are Dream Planner's AI Analyst, inspired by Simon Squibb's entrepreneurial philosophy.

Your job: Analyze user data from their planner activities and provide personalized, actionable insights.

Rules:
- Be specific — reference their actual data, not generic advice
- Be concise — each insight should be 1-2 sentences
- Be practical — focus on what they can DO with this information
- Connect dots — find patterns the user might not see
- Challenge gently — push them to think bigger

Respond ONLY with valid JSON:
{"insights":["..."],"suggestions":["..."],"crossPartConnections":["..."]}

- "insights": 2-4 data-driven observations about their work
- "suggestions": 2-3 specific next actions they should take
- "crossPartConnections": 1-2 connections to data from other PARTs (if available)`;

function buildActivityContext(activityId: number, data: PlannerData): string {
  const parts: string[] = [];

  parts.push(`Dream Statement: ${data.dreamStatement || "Not set yet"}`);
  parts.push(`User: ${data.userName || "Dreamer"}`);

  switch (activityId) {
    case 1: { // Skills Inventory
      const workSkills = data.skills.filter((s) => s.category === "work");
      const personalSkills = data.skills.filter((s) => s.category === "personal");
      const learningSkills = data.skills.filter((s) => s.category === "learning");
      parts.push(`Work Skills (${workSkills.length}): ${workSkills.map((s) => `${s.name} (${s.proficiency}/5)`).join(", ") || "none"}`);
      parts.push(`Personal Skills (${personalSkills.length}): ${personalSkills.map((s) => `${s.name} (${s.proficiency}/5)`).join(", ") || "none"}`);
      parts.push(`Learning Skills (${learningSkills.length}): ${learningSkills.map((s) => `${s.name} (${s.proficiency}/5)`).join(", ") || "none"}`);
      parts.push("Analyze: Find hidden combinations across categories. Suggest 3-5 unique value propositions by combining skills from different categories. Also suggest related sub-skills they might have missed.");
      break;
    }
    case 2: { // Resource Map
      const scored = data.resources.filter((r) => r.score > 0);
      parts.push(`Resources: ${scored.map((r) => `${r.label}: ${r.score}/5 — "${r.description}"`).join("; ") || "not rated yet"}`);
      const strongest = scored.sort((a, b) => b.score - a.score)[0];
      const weakest = scored.sort((a, b) => a.score - b.score)[0];
      if (strongest) parts.push(`Strongest: ${strongest.label} (${strongest.score})`);
      if (weakest) parts.push(`Weakest: ${weakest.label} (${weakest.score})`);
      parts.push("Analyze: How to leverage strongest resource. How to compensate for weakest (partnerships, creative workarounds). Specific improvement actions.");
      break;
    }
    case 3: { // Time Log
      const productive = data.timeBlocks.filter((t) => t.type === "productive");
      const consumption = data.timeBlocks.filter((t) => t.type === "consumption");
      const essential = data.timeBlocks.filter((t) => t.type === "essential");
      const prodHours = productive.reduce((sum, t) => sum + t.duration, 0);
      const consHours = consumption.reduce((sum, t) => sum + t.duration, 0);
      const essHours = essential.reduce((sum, t) => sum + t.duration, 0);
      parts.push(`Productive: ${prodHours}h, Consumption: ${consHours}h, Essential: ${essHours}h`);
      // Find patterns by day
      const dayBreakdown = [0, 1, 2, 3, 4, 5, 6].map((d) => {
        const dayBlocks = data.timeBlocks.filter((t) => t.day === d);
        const dayConsumption = dayBlocks.filter((t) => t.type === "consumption").reduce((s, t) => s + t.duration, 0);
        return { day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][d], consumption: dayConsumption };
      });
      const highConsumptionDays = dayBreakdown.filter((d) => d.consumption > 2);
      if (highConsumptionDays.length > 0) {
        parts.push(`High consumption days: ${highConsumptionDays.map((d) => `${d.day} (${d.consumption}h)`).join(", ")}`);
      }
      // Find productive peak hours
      const hourCounts: Record<number, number> = {};
      productive.forEach((t) => { hourCounts[t.startHour] = (hourCounts[t.startHour] || 0) + 1; });
      const peakHours = Object.entries(hourCounts).sort(([, a], [, b]) => b - a).slice(0, 3);
      if (peakHours.length > 0) {
        parts.push(`Peak productive hours: ${peakHours.map(([h]) => `${h}:00`).join(", ")}`);
      }
      parts.push("Analyze: Identify golden time, recoverable consumption hours, daily patterns. Be specific about which time slots to convert.");
      break;
    }
    case 4: { // Money Flow
      const totalSpend = data.expenses.reduce((s, e) => s + e.amount, 0);
      const lowSat = data.expenses.filter((e) => e.satisfaction === "low");
      const lowSatTotal = lowSat.reduce((s, e) => s + e.amount, 0);
      const categories: Record<string, number> = {};
      data.expenses.forEach((e) => { categories[e.category] = (categories[e.category] || 0) + e.amount; });
      parts.push(`Total spending: $${totalSpend}`);
      parts.push(`Low satisfaction spending: $${lowSatTotal} (${totalSpend > 0 ? Math.round(lowSatTotal / totalSpend * 100) : 0}%)`);
      parts.push(`By category: ${Object.entries(categories).sort(([, a], [, b]) => b - a).map(([c, a]) => `${c}: $${a}`).join(", ")}`);
      if (lowSat.length > 0) {
        parts.push(`Low satisfaction items: ${lowSat.map((e) => `${e.item} ($${e.amount})`).join(", ")}`);
      }
      parts.push("Analyze: Spending patterns, waste areas, how to redirect low-satisfaction spending toward dream funding. Calculate potential monthly/yearly savings.");
      break;
    }
    case 5: { // Current State
      const filled = data.currentState.filter((c) => c.content.trim().length > 0);
      filled.forEach((c) => parts.push(`${c.title}: "${c.content}"`));
      parts.push("Analyze: Generate a mini SWOT analysis. Find opportunities hidden in constraints. Suggest how their current situation uniquely positions them.");
      break;
    }
    case 6: { // Experience Mind Map
      const nodes = data.part2.mindMapNodes;
      const edges = data.part2.mindMapEdges;
      parts.push(`Mind map nodes: ${nodes.length}, connections: ${edges.length}`);
      const nodeLabels = nodes.map((n) => (n.data as Record<string, string>)?.label || "").filter(Boolean);
      if (nodeLabels.length > 0) parts.push(`Node labels: ${nodeLabels.join(", ")}`);
      parts.push("Analyze: Find repeated themes/keywords across branches. Identify hidden connections between different life areas. Suggest which patterns point to their core passion.");
      break;
    }
    case 7: { // Failure Resume
      const entries = data.part2.failureEntries;
      parts.push(`Failure entries: ${entries.length}`);
      entries.forEach((e) => parts.push(`${e.year}: "${e.experience}" → Lesson: "${e.lesson}" (emotions: ${e.emotions.join(", ")})`));
      const allEmotions = entries.flatMap((e) => e.emotions);
      const emotionCounts: Record<string, number> = {};
      allEmotions.forEach((e) => { emotionCounts[e] = (emotionCounts[e] || 0) + 1; });
      parts.push(`Emotion patterns: ${Object.entries(emotionCounts).map(([e, c]) => `${e}: ${c}`).join(", ")}`);
      parts.push("Analyze: Connect lessons across failures. Identify core strengths that emerged from setbacks. Find patterns in what went wrong and how they grew.");
      break;
    }
    case 8: { // Strengths & Weaknesses Redefine
      parts.push(`Strengths: ${data.part2.strengths.join(", ") || "none listed"}`);
      const weaknesses = data.part2.weaknesses;
      weaknesses.forEach((w) => parts.push(`Weakness: "${w.text}" → Reframed: "${w.reframed}"`));
      // Reference failure resume if available
      if (data.part2.failureEntries.length > 0) {
        parts.push(`Related failure lessons: ${data.part2.failureEntries.map((f) => f.lesson).join("; ")}`);
      }
      parts.push("Analyze: Validate reframes, suggest stronger reframes where needed. Connect weakness-as-strengths to potential business advantages.");
      break;
    }
    case 9: { // Market Scan
      const scan = data.part2.marketScan;
      const allNotes = [...scan.youtube, ...scan.bookstore, ...scan.community];
      parts.push(`Market scan notes: YouTube (${scan.youtube.length}), Bookstore (${scan.bookstore.length}), Community (${scan.community.length})`);
      allNotes.forEach((n) => parts.push(`[${n.type}] "${n.text}"`));
      parts.push("Analyze: Synthesize findings into market opportunity summary. Identify gaps in the market. Assess competition level. Suggest differentiation strategies.");
      break;
    }
    case 10: { // Why-What Bridge
      const bridge = data.part2.whyWhatBridge;
      parts.push(`Why: "${bridge.why}"`);
      bridge.ideas.forEach((idea, i) => {
        const twist = bridge.twists[i];
        const score = bridge.scores[i];
        parts.push(`Idea ${i + 1}: "${idea}" — Feasibility: ${score?.feasibility}/5, Market: ${score?.market}/5, Passion: ${score?.passion}/5`);
        if (twist) parts.push(`  Twists — Subtract: "${twist.subtract}", Add: "${twist.add}", Combine: "${twist.combine}", Reverse: "${twist.reverse}"`);
      });
      if (bridge.selectedIndex >= 0) {
        parts.push(`Selected: Idea ${bridge.selectedIndex + 1} — Reason: "${bridge.selectionReason}"`);
      }
      parts.push("Analyze: Evaluate idea strength across all 3 axes. Suggest additional twists. Compare ideas using radar chart logic. Recommend which idea to pursue and why.");
      break;
    }
    case 11: { // One-Line Proposal
      const prop = data.part3.oneLineProposal;
      parts.push(`Targets: ${prop.inputs.targets.filter(Boolean).join(", ")}`);
      parts.push(`Problems: ${prop.inputs.problems.filter(Boolean).join(", ")}`);
      parts.push(`Solutions: ${prop.inputs.solutions.filter(Boolean).join(", ")}`);
      parts.push(`Differentiators: ${prop.inputs.differentiators.filter(Boolean).join(", ")}`);
      const liked = prop.combos.filter((c) => c.liked);
      if (liked.length > 0) parts.push(`Liked combos: ${liked.map((c) => `"${c.target} + ${c.problem} + ${c.solution} + ${c.differentiator}"`).join("; ")}`);
      parts.push(`Final proposal: "${prop.finalProposal}"`);
      // Reference Why from PART 2
      if (data.part2.whyWhatBridge.why) {
        parts.push(`PART 2 Why: "${data.part2.whyWhatBridge.why}"`);
      }
      parts.push("Analyze: Evaluate proposal clarity and specificity. Suggest improvements. Check alignment with their Why. Suggest how to test it.");
      break;
    }
    case 12: { // Hypothesis Board
      data.part3.hypotheses.forEach((h, i) => {
        parts.push(`Hypothesis ${i + 1}: "${h.hypothesis}" — Method: "${h.method}" — Status: ${h.status}`);
        if (h.result) parts.push(`  Result: "${h.result}" — Lesson: "${h.lesson}"`);
      });
      parts.push("Analyze: Evaluate hypothesis quality. Suggest faster validation methods. Calculate 'idea survival rate' based on results. Recommend next steps.");
      break;
    }
    case 13: { // Zero-Cost MVP
      const mvp = data.part3.mvpPlan;
      parts.push(`MVP Type: ${mvp.mvpType || "not selected"}`);
      parts.push(`Steps: ${mvp.steps.length} (${mvp.steps.filter((s) => s.done).length} completed)`);
      parts.push(`Success criteria: "${mvp.successCriteria}"`);
      // Reference resources from PART 1
      const topResources = data.resources.filter((r) => r.score >= 4).map((r) => r.label);
      if (topResources.length > 0) parts.push(`Strong resources from PART 1: ${topResources.join(", ")}`);
      // Reference skills
      const topSkills = data.skills.filter((s) => s.proficiency >= 4).map((s) => s.name);
      if (topSkills.length > 0) parts.push(`Top skills from PART 1: ${topSkills.join(", ")}`);
      parts.push("Analyze: Evaluate MVP plan quality. Suggest improvements to steps. Check if they're leveraging their PART 1 resources/skills. Recommend timeline.");
      break;
    }
    case 14: { // Value Ladder
      data.part3.valueLadder.forEach((step) => {
        parts.push(`${step.tier}: "${step.productName}" — $${step.price} — Value: "${step.customerValue}"`);
      });
      parts.push("Analyze: Check price gaps between tiers. Evaluate if each tier offers 10x value. Suggest revenue projections based on conversion assumptions.");
      break;
    }
    case 15: { // First 10 Fans
      const fans = data.part4.fanCandidates;
      parts.push(`Fan candidates: ${fans.length}`);
      fans.forEach((f) => parts.push(`${f.name} — Stage: ${f.stage} — Problem: "${f.problem}"`));
      // Reference skills and proposal
      if (data.part3.oneLineProposal.finalProposal) {
        parts.push(`Proposal: "${data.part3.oneLineProposal.finalProposal}"`);
      }
      parts.push("Analyze: Find common traits among fan candidates. Generate target persona. Suggest value to provide each candidate based on their problems and your skills.");
      break;
    }
    case 16: { // Dream 5 Network
      const members = data.part4.dream5Network.members;
      parts.push(`Dream 5 members: ${members.length}/5`);
      members.forEach((m) => parts.push(`${m.name} (${m.role}): "${m.reason}" — Value exchange: "${m.valueExchange}"`));
      parts.push("Analyze: Evaluate network balance (mentor/peer/partner). Suggest how to approach each person. Recommend relationship-building strategies.");
      break;
    }
    case 17: { // Rejection Collection
      const challenges = data.part4.rejectionChallenges;
      const completed = challenges.filter((c) => c.completed);
      parts.push(`Rejections completed: ${completed.length}/3`);
      completed.forEach((c) => parts.push(`Attempt: "${c.attempt}" — Expected: "${c.expectedReaction}" — Actual: "${c.actualReaction}" — Lesson: "${c.lesson}"`));
      parts.push("Analyze: Calculate rejection resilience score (0-100). Analyze gap between expected and actual reactions. Identify growth patterns.");
      break;
    }
    case 18: { // Sustainable System
      const sys = data.part4.sustainableSystem;
      parts.push(`Core activities: ${sys.coreActivities.length}`);
      sys.coreActivities.forEach((a) => parts.push(`"${a.name}" — Time: ${a.time}, Space: ${a.space}, Rule: ${a.rule}`));
      parts.push(`Distractions: ${sys.distractions.length}`);
      sys.distractions.forEach((d) => parts.push(`"${d.distraction}" → Blocker: "${d.blocker}"`));
      parts.push(`Rewards: ${sys.rewards.length}`);
      parts.push("Analyze: Evaluate system sustainability. Identify potential failure points. Suggest habit stacking strategies. Recommend keystone habit.");
      break;
    }
    case 19: { // Traffic Light
      const items = data.part4.trafficLight.items;
      const green = items.filter((i) => i.color === "green");
      const yellow = items.filter((i) => i.color === "yellow");
      const red = items.filter((i) => i.color === "red");
      parts.push(`Green (continue): ${green.map((i) => `"${i.text}"`).join(", ") || "none"}`);
      parts.push(`Yellow (improve): ${yellow.map((i) => `"${i.text}" → Plan: "${i.actionPlan}"`).join("; ") || "none"}`);
      parts.push(`Red (stop): ${red.map((i) => `"${i.text}"`).join(", ") || "none"}`);
      parts.push("Analyze: Evaluate distribution. Find patterns (what makes green vs red). Suggest time reallocation from red to green. Identify yellow items that need a deadline.");
      break;
    }
    case 20: { // Sustainability Checklist
      const questions = data.part4.sustainabilityChecklist.questions;
      const domains = ["financial", "mental", "social"] as const;
      domains.forEach((d) => {
        const domainQs = questions.filter((q) => q.domain === d);
        const yesCount = domainQs.filter((q) => q.answer === "yes").length;
        const noCount = domainQs.filter((q) => q.answer === "no").length;
        const needsWork = domainQs.filter((q) => q.answer === "needs_improvement");
        parts.push(`${d}: ${yesCount} yes, ${noCount} no, ${needsWork.length} needs improvement`);
        needsWork.forEach((q) => parts.push(`  Needs improvement: "${q.question}" — Plan: "${q.improvementPlan}"`));
      });
      const totalYes = questions.filter((q) => q.answer === "yes").length;
      const score = Math.round((totalYes / questions.length) * 100);
      parts.push(`Overall sustainability score: ${score}%`);
      parts.push("Analyze: Identify weakest pillar. Prioritize improvement areas. Calculate comprehensive sustainability score. Suggest which 'needs improvement' item to tackle first.");
      break;
    }
  }

  return parts.join("\n");
}

function getMockInsight(activityId: number, data: PlannerData): AiInsightResult {
  switch (activityId) {
    case 1: {
      const topSkills = data.skills.filter((s) => s.proficiency >= 4).map((s) => s.name);
      const workSkills = data.skills.filter((s) => s.category === "work");
      const personalSkills = data.skills.filter((s) => s.category === "personal");
      const combos: string[] = [];
      if (workSkills.length > 0 && personalSkills.length > 0) {
        combos.push(`${workSkills[0]?.name || "work skill"} + ${personalSkills[0]?.name || "personal skill"} = potential unique offering`);
      }
      return {
        insights: [
          topSkills.length > 0 ? `Your strongest skills (${topSkills.join(", ")}) are your foundation. These are what people would pay for.` : "Start by listing skills you use daily — even mundane ones count.",
          `You have ${data.skills.length} total skills across 3 categories. ${data.skills.length < 5 ? "Try to add more — most people have 15-20 skills they overlook." : "Good coverage!"}`,
        ],
        suggestions: [
          combos.length > 0 ? `Explore this combination: ${combos[0]}` : "Try combining one work skill with one personal skill",
          "Ask 3 friends: 'What do you always come to me for?' — their answers reveal hidden skills.",
        ],
        crossPartConnections: data.part2.whyWhatBridge.why ? [`Your Why ("${data.part2.whyWhatBridge.why.slice(0, 60)}...") connects to your ${topSkills[0] || "top"} skill.`] : undefined,
      };
    }
    case 2: {
      const strongest = [...data.resources].sort((a, b) => b.score - a.score)[0];
      const weakest = [...data.resources].sort((a, b) => a.score - b.score)[0];
      return {
        insights: [
          strongest && strongest.score > 0 ? `Your strongest resource is ${strongest.label} (${strongest.score}/5). This is your launching pad.` : "Rate your resources honestly to get personalized insights.",
          weakest && weakest.score > 0 ? `${weakest.label} (${weakest.score}/5) is your growth area. Consider finding a partner who excels here.` : "Low scores aren't failures — they show where to find collaborators.",
        ],
        suggestions: [
          strongest ? `Leverage your ${strongest.label} advantage in your MVP design.` : "Start with the resource you feel most confident about.",
          weakest ? `For ${weakest.label}: Can someone in your network fill this gap?` : "Map out people who complement your weak areas.",
        ],
      };
    }
    case 3: {
      const prodHours = data.timeBlocks.filter((t) => t.type === "productive").reduce((s, t) => s + t.duration, 0);
      const consHours = data.timeBlocks.filter((t) => t.type === "consumption").reduce((s, t) => s + t.duration, 0);
      return {
        insights: [
          `You spend ${prodHours}h on productive activities and ${consHours}h on consumption per week.`,
          consHours > 5 ? `Converting just ${Math.min(consHours, 3)}h of consumption time could give you ${Math.min(consHours, 3) * 52}h per year for your dream.` : "Great time discipline! Your productive-to-consumption ratio is healthy.",
        ],
        suggestions: [
          "Block your most productive hours for dream work — protect this time ruthlessly.",
          consHours > 0 ? "Pick one consumption block this week and replace it with dream time." : "Maintain this balance — you're on track.",
        ],
      };
    }
    case 4: {
      const lowSat = data.expenses.filter((e) => e.satisfaction === "low");
      const lowSatTotal = lowSat.reduce((s, e) => s + e.amount, 0);
      return {
        insights: [
          lowSat.length > 0 ? `${lowSat.length} expenses have low satisfaction, totaling $${lowSatTotal}. This is your dream fund waiting to be redirected.` : "No low-satisfaction spending found — your spending is well-aligned.",
          `Potential annual savings from low-satisfaction cuts: $${lowSatTotal * 12}`,
        ],
        suggestions: [
          lowSat.length > 0 ? `Start by eliminating "${lowSat[0]?.item}" ($${lowSat[0]?.amount}/month).` : "Look for subscriptions you forgot about.",
          `Redirect saved money into: learning, tools, or your first MVP.`,
        ],
      };
    }
    case 5: {
      const constraints = data.currentState.find((c) => c.key === "constraints")?.content || "";
      const opportunities = data.currentState.find((c) => c.key === "opportunities")?.content || "";
      return {
        insights: [
          constraints ? `Your constraint "${constraints.slice(0, 50)}..." is shared by many successful entrepreneurs. It's actually a market signal.` : "List your constraints — they often hide your best business ideas.",
          opportunities ? `The opportunity you see ("${opportunities.slice(0, 50)}...") aligns well with your skills.` : "Look at your constraints from a customer's perspective.",
        ],
        suggestions: [
          "SWOT Summary: Your strengths + opportunities = your strategy. Your weaknesses + threats = what to mitigate.",
          "Ask: 'Who else has my exact constraints, and how can I help them?'",
        ],
      };
    }
    case 6: { // Experience Mind Map
      const nodeCount = data.part2.mindMapNodes.length;
      const edgeCount = data.part2.mindMapEdges.length;
      const nodeLabels = data.part2.mindMapNodes
        .map((n) => (n.data as Record<string, string>)?.label || "")
        .filter(Boolean);
      const branchCount = data.part2.mindMapNodes.filter(
        (n) => n.type === "default" && data.part2.mindMapEdges.some((e) => e.source === "center" && e.target === n.id)
      ).length;
      return {
        insights: [
          nodeCount > 0
            ? `Your mind map has ${nodeCount} nodes and ${edgeCount} connections. ${nodeCount > 10 ? "Rich map! Look for clusters." : "Try adding more branches to discover hidden patterns."}`
            : "Start by adding branches for your key life experiences — school, career, travel, hobbies, relationships.",
          branchCount >= 3
            ? `You have ${branchCount} main branches. The richest branch reveals where your deepest experience lives.`
            : "Aim for at least 5 main branches to get a complete picture of your experiences.",
          nodeLabels.length > 3
            ? `Key themes: ${nodeLabels.slice(0, 5).join(", ")}. Look for repeated words across different branches.`
            : "Add descriptive labels to each node to help identify patterns.",
        ],
        suggestions: [
          "Look for the same keyword appearing in 2+ branches — that's your hidden passion signal.",
          "Add connections between nodes in different branches that share a common thread.",
          nodeCount < 8 ? "Expand your map: think about childhood hobbies, volunteer work, random projects." : "Your map is substantial. Now zoom out: what's the one theme that connects most branches?",
        ],
        crossPartConnections: data.skills.length > 0
          ? [`Your PART 1 top skills (${data.skills.filter(s => s.proficiency >= 4).map(s => s.name).join(", ") || "none yet"}) may appear as branches in your mind map.`]
          : undefined,
      };
    }
    case 7: { // Failure Resume
      const entries = data.part2.failureEntries;
      const emotionCounts: Record<string, number> = {};
      entries.forEach((e) => e.emotions.forEach((em) => { emotionCounts[em] = (emotionCounts[em] || 0) + 1; }));
      const topEmotion = Object.entries(emotionCounts).sort(([, a], [, b]) => b - a)[0];
      const hasGrowth = emotionCounts["growth"] > 0;
      const lessons = entries.map((e) => e.lesson).filter(Boolean);
      return {
        insights: [
          entries.length > 0
            ? `You've documented ${entries.length} failure${entries.length > 1 ? "s" : ""}. ${entries.length >= 3 ? "That takes courage — most people avoid looking back." : "Try adding more — 3 failures minimum reveals patterns."}`
            : "Start with your most memorable failure. It's usually the one with the biggest lesson.",
          topEmotion
            ? `Your dominant emotion across failures: ${topEmotion[0]} (${topEmotion[1]}x). ${hasGrowth ? "The growth tag shows you're already reframing." : "Try to find the growth angle in each failure."}`
            : "Tag emotions on each failure to track your emotional patterns.",
          lessons.length > 0
            ? `Core lessons: "${lessons[0]}"${lessons.length > 1 ? ` and "${lessons[1]}"` : ""}. These lessons are your competitive advantage.`
            : "Write specific lessons — not 'I learned a lot' but 'I learned to validate before building.'",
        ],
        suggestions: [
          "For each failure, ask: 'What skill did this force me to develop?'",
          entries.length >= 2 ? "Connect the dots: do your failures share a common trigger?" : "Add at least 3 failures to find meaningful patterns.",
          "Your failures are your unique story. Customers trust people who've been through real struggles.",
        ],
        crossPartConnections: data.skills.length > 0
          ? [`Failures often build hidden skills. Check if any of your PART 1 skills were actually born from these setbacks.`]
          : undefined,
      };
    }
    case 8: { // Strengths & Weaknesses Redefine
      const strengths = data.part2.strengths.filter(Boolean);
      const weaknesses = data.part2.weaknesses;
      const reframed = weaknesses.filter((w) => w.reframed.trim());
      const unreframed = weaknesses.filter((w) => w.text.trim() && !w.reframed.trim());
      return {
        insights: [
          strengths.length > 0
            ? `You've listed ${strengths.length} strengths. Your top strength "${strengths[0]}" is likely what people come to you for.`
            : "Start listing your strengths — even 'being organized' or 'good listener' counts.",
          weaknesses.length > 0
            ? `${reframed.length}/${weaknesses.length} weaknesses reframed. ${reframed.length === weaknesses.length ? "All reframed — powerful mindset shift!" : `${unreframed.length} still need reframing.`}`
            : "List your perceived weaknesses. We'll turn them into secret weapons.",
          reframed.length > 0
            ? `Best reframe: "${weaknesses[0]?.text}" → "${weaknesses[0]?.reframed}". This kind of thinking differentiates dreamers from doers.`
            : "Example reframe: 'Too cautious' → 'Thorough researcher who reduces risk for clients'.",
        ],
        suggestions: [
          unreframed.length > 0 ? `Reframe "${unreframed[0]?.text}" — ask: 'In what context is this actually an advantage?'` : "Review your reframes: could any be even bolder?",
          "Ask a friend: 'What weakness of mine do you actually appreciate?' Their answer will surprise you.",
          "Your reframed weaknesses are your unique selling points. Use them in your one-line proposal later.",
        ],
        crossPartConnections: data.part2.failureEntries.length > 0
          ? [`Your failure lessons from Activity 7 can help reframe weaknesses. Failure teaches resilience — that's a strength.`]
          : undefined,
      };
    }
    case 9: { // Market Scan
      const scan = data.part2.marketScan;
      const totalNotes = scan.youtube.length + scan.bookstore.length + scan.community.length;
      const discoveries = [...scan.youtube, ...scan.bookstore, ...scan.community].filter((n) => n.type === "discovery");
      const missed = [...scan.youtube, ...scan.bookstore, ...scan.community].filter((n) => n.type === "missed");
      return {
        insights: [
          totalNotes > 0
            ? `${totalNotes} notes across 3 channels. ${discoveries.length} discoveries, ${missed.length} missed opportunities.`
            : "Start scanning: YouTube (trending topics), Bookstore (bestsellers), Community (pain points).",
          discoveries.length > 0
            ? `Key discovery: "${discoveries[0]?.text?.slice(0, 80)}..." — this confirms market demand exists.`
            : "Focus on finding what people are ALREADY paying for. That's your demand signal.",
          missed.length > 0
            ? `You spotted ${missed.length} gap${missed.length > 1 ? "s" : ""} in the market. These are your differentiation opportunities.`
            : "Look for complaints in comments and reviews — every complaint is a business opportunity.",
        ],
        suggestions: [
          "Synthesize: What's the #1 problem people are struggling with across all 3 channels?",
          totalNotes < 5 ? "Add more notes — aim for at least 3 per channel to see real patterns." : "Great coverage! Now rank your findings by business potential.",
          "The 'missed opportunity' notes are gold. Each one is a potential unique value proposition.",
        ],
        crossPartConnections: data.part2.whyWhatBridge.why
          ? [`Does your Why ("${data.part2.whyWhatBridge.why.slice(0, 50)}...") align with the market gaps you found?`]
          : undefined,
      };
    }
    case 10: { // Why-What Bridge
      const bridge = data.part2.whyWhatBridge;
      const ideas = bridge.ideas.filter(Boolean);
      const scored = bridge.scores.filter((s) => s.feasibility > 0 || s.market > 0 || s.passion > 0);
      const hasSelection = bridge.selectedIndex >= 0 && ideas[bridge.selectedIndex];
      const bestIdea = scored.length > 0
        ? scored.reduce((best, s, i) => {
            const total = s.feasibility + s.market + s.passion;
            const bestTotal = scored[best].feasibility + scored[best].market + scored[best].passion;
            return total > bestTotal ? i : best;
          }, 0)
        : -1;
      return {
        insights: [
          bridge.why ? `Your Why: "${bridge.why.slice(0, 80)}..." — ${bridge.why.length > 20 ? "clear and compelling" : "try making it more specific"}.` : "Define your Why first — it's the foundation for everything else.",
          ideas.length > 0
            ? `${ideas.length} idea${ideas.length > 1 ? "s" : ""} generated. ${bestIdea >= 0 ? `Highest-scored: Idea ${bestIdea + 1} (${scored[bestIdea].feasibility + scored[bestIdea].market + scored[bestIdea].passion}/15).` : "Score your ideas on feasibility, market, and passion."}`
            : "Generate at least 3 ideas to compare. Quantity leads to quality.",
          hasSelection
            ? `Selected: "${ideas[bridge.selectedIndex]}" — Reason: "${bridge.selectionReason || "not specified"}". Strong choice if it aligns with your Why.`
            : "Use the twist matrix (subtract/add/combine/reverse) to generate creative variations before selecting.",
        ],
        suggestions: [
          bestIdea >= 0 && scored[bestIdea].passion < 3 ? "Your top-scored idea has low passion. Can you add an element that excites you more?" : "Score all ideas honestly — passion sustains you through hard times.",
          "Apply the twist matrix: what if you REVERSED your best idea? Sometimes the opposite is better.",
          hasSelection ? "Test your selected idea with 3 people this week. Their reactions will validate or pivot your choice." : "Don't overthink selection. Pick the one that makes you most excited to start tomorrow.",
        ],
        crossPartConnections: [
          data.skills.length > 0 ? `Your PART 1 skills can power your ideas. Top skills: ${data.skills.filter(s => s.proficiency >= 4).map(s => s.name).slice(0, 3).join(", ") || "complete Activity 1 first"}.` : "Complete PART 1 Skills Inventory to find which skills can power your ideas.",
        ],
      };
    }
    case 11: { // One-Line Proposal
      const prop = data.part3.oneLineProposal;
      const targets = prop.inputs.targets.filter(Boolean);
      const problems = prop.inputs.problems.filter(Boolean);
      const solutions = prop.inputs.solutions.filter(Boolean);
      const diffs = prop.inputs.differentiators.filter(Boolean);
      const liked = prop.combos.filter((c) => c.liked);
      const hasFinal = prop.finalProposal.trim().length > 0;
      return {
        insights: [
          `Inputs: ${targets.length} targets, ${problems.length} problems, ${solutions.length} solutions, ${diffs.length} differentiators. ${[targets, problems, solutions, diffs].filter(a => a.length === 0).length > 0 ? "Fill in all 4 to generate combinations." : "All fields populated!"}`,
          liked.length > 0
            ? `${liked.length} liked combo${liked.length > 1 ? "s" : ""}. The best proposals are short, specific, and jargon-free.`
            : "Generate combos and heart the ones that resonate. Trust your gut.",
          hasFinal
            ? `Final proposal: "${prop.finalProposal.slice(0, 80)}..." — ${prop.finalProposal.length <= 100 ? "Great length! Concise and clear." : "Consider shortening. The best proposals fit in a tweet."}`
            : "Draft your final proposal. Formula: 'I help [TARGET] solve [PROBLEM] through [SOLUTION]. It's special because [DIFF].'",
        ],
        suggestions: [
          hasFinal ? "Read your proposal out loud. If it takes more than 8 seconds, simplify it." : "Pick your best combo as a starting point and refine from there.",
          "Test: can a 10-year-old understand your proposal? If not, simpler words needed.",
          "Share your proposal with 3 people. If they ask 'how?', it's clear. If they ask 'what?', simplify.",
        ],
        crossPartConnections: data.part2.whyWhatBridge.why
          ? [`Your Why ("${data.part2.whyWhatBridge.why.slice(0, 40)}...") should echo in your proposal. Does it?`]
          : undefined,
      };
    }
    case 12: { // Hypothesis Board
      const hypotheses = data.part3.hypotheses;
      const filled = hypotheses.filter((h) => h.hypothesis.trim());
      const tested = hypotheses.filter((h) => h.status !== "pending");
      const succeeded = hypotheses.filter((h) => h.status === "success");
      const failed = hypotheses.filter((h) => h.status === "fail");
      const survivalRate = tested.length > 0 ? Math.round((succeeded.length / tested.length) * 100) : 0;
      return {
        insights: [
          filled.length > 0
            ? `${filled.length}/3 hypotheses defined. ${tested.length} tested (${succeeded.length} success, ${failed.length} fail).`
            : "Write your first hypothesis. Format: 'I believe [TARGET] will [ACTION] because [REASON].'",
          tested.length > 0
            ? `Idea survival rate: ${survivalRate}%. ${survivalRate >= 50 ? "Strong validation! Your idea has legs." : "Low survival rate is normal. Pivot based on lessons."}`
            : "Start testing! Even a simple survey or 5-minute conversation counts as validation.",
          failed.length > 0
            ? `Lessons from failed hypotheses: ${hypotheses.filter(h => h.status === "fail" && h.lesson).map(h => `"${h.lesson.slice(0, 50)}"` ).join(", ") || "Record lessons for each failure."}. These pivots are gold.`
            : "Don't fear failure in validation. A failed hypothesis saves months of wasted effort.",
        ],
        suggestions: [
          filled.length < 3 ? "Add more hypotheses. Test 3 different angles: customer, problem, and solution." : "Review your success criteria — are they specific and measurable?",
          tested.length === 0 ? "Pick the easiest hypothesis to test first. Quick wins build momentum." : "Based on results, refine your strongest hypothesis and test again.",
          "Fastest validation methods: 5-minute survey, landing page sign-ups, direct conversations.",
        ],
        crossPartConnections: data.part3.oneLineProposal.finalProposal
          ? [`Your proposal ("${data.part3.oneLineProposal.finalProposal.slice(0, 40)}...") should be validated by these hypotheses. Do they align?`]
          : undefined,
      };
    }
    case 13: { // Zero-Cost MVP
      const mvp = data.part3.mvpPlan;
      const completedSteps = mvp.steps.filter((s) => s.done).length;
      const totalSteps = mvp.steps.length;
      const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
      return {
        insights: [
          mvp.mvpType ? `MVP type: ${mvp.mvpType.replace(/_/g, " ")}. ${completedSteps}/${totalSteps} steps done (${progress}%).` : "Choose your MVP type first. Landing page is the fastest to launch.",
          mvp.successCriteria ? `Success criteria: "${mvp.successCriteria.slice(0, 80)}". Make sure it's measurable (e.g., '10 sign-ups in 7 days').` : "Define clear success criteria before you launch.",
          mvp.challenges ? `Anticipated challenge: "${mvp.challenges.slice(0, 60)}...". Having a solution ready means you won't get stuck.` : "List potential challenges now — preparation prevents paralysis.",
        ],
        suggestions: [
          totalSteps === 0 ? "Break your MVP into 5-10 concrete steps. Each step should take 1-2 hours max." : progress < 50 ? `You're ${progress}% through. Complete step ${completedSteps + 1} today.` : "Almost there! Push to launch this week.",
          "Your MVP should take less than 2 weeks to build. If it's bigger, you're over-engineering.",
          mvp.promotions.some(Boolean) ? `Your promotion channels are set. Focus on the top 2 channels first.` : "List 5 channels to promote your MVP. Start with where your target already hangs out.",
        ],
        crossPartConnections: [
          data.resources.length > 0
            ? `Leverage your PART 1 resources: ${data.resources.filter(r => r.score >= 4).map(r => r.label).join(", ") || "develop your resources first"}.`
            : "Review your PART 1 Resource Map to see what you can leverage for your MVP.",
        ],
      };
    }
    case 14: { // Value Ladder
      const filled = data.part3.valueLadder.filter((v) => v.productName.trim());
      const maxPrice = Math.max(...data.part3.valueLadder.map((v) => v.price), 0);
      const freebie = data.part3.valueLadder[0];
      const high = data.part3.valueLadder[3];
      const gaps: string[] = [];
      const prices = data.part3.valueLadder.map((v) => v.price);
      if (prices[1] > 0 && prices[0] === 0 && prices[1] > 50) gaps.push(`Big jump from free to $${prices[1]}. Consider an intermediate price point.`);
      if (prices[2] > 0 && prices[1] > 0 && prices[2] > prices[1] * 5) gaps.push(`Mid tier is ${Math.round(prices[2] / prices[1])}x the low tier. A 2-3x step is more natural.`);
      return {
        insights: [
          `${filled.length}/4 tiers defined. ${filled.length === 4 ? "Complete ladder!" : "Fill all 4 tiers to create a clear customer journey."}`,
          freebie?.productName ? `Freebie ("${freebie.productName}") is your lead magnet. It should solve one specific problem completely.` : "Start with your freebie — it's the entry point for all customers.",
          high?.price > 0 ? `Premium tier: $${high.price}. ${high.price > maxPrice * 0.3 ? "Good premium positioning." : "Consider pricing higher. Premium buyers expect premium prices."}` : "Design your premium offering first, then work backwards to create the path.",
          ...gaps.slice(0, 1),
        ],
        suggestions: [
          "Each tier should deliver 10x more value than the previous. Does yours?",
          "Name your tiers with benefit-focused names, not just 'Basic/Pro/Premium'.",
          `Test your freebie first — if people won't take it for free, they won't pay for upgrades.`,
        ],
        crossPartConnections: data.part3.oneLineProposal.finalProposal
          ? [`Your proposal ("${data.part3.oneLineProposal.finalProposal.slice(0, 40)}...") should be reflected in your freebie tier.`]
          : undefined,
      };
    }
    case 15: { // First 10 Fans
      const fans = data.part4.fanCandidates;
      const stages: Record<string, number> = {};
      fans.forEach((f) => { stages[f.stage] = (stages[f.stage] || 0) + 1; });
      const converted = (stages["fan"] || 0);
      const contacted = fans.filter((f) => f.stage !== "candidate").length;
      return {
        insights: [
          fans.length > 0
            ? `${fans.length} fan candidates. ${contacted} contacted, ${converted} converted to fans.`
            : "Start listing potential fans. Who in your network would benefit most from your offer?",
          fans.length >= 3
            ? `Common problems: ${[...new Set(fans.filter(f => f.problem).map(f => f.problem.slice(0, 30)))].slice(0, 2).join(", ")}. This is your target persona.`
            : "Add more candidates and note their specific problems — patterns reveal your ideal customer.",
          converted > 0
            ? `${converted}/10 fans — ${converted >= 5 ? "halfway there! You've got product-market fit signal." : "great start! Focus on converting more through value-first approach."}`
            : "Focus on providing value before asking anything. Give first, earn fans second.",
        ],
        suggestions: [
          contacted === 0 ? "Reach out to your first candidate today. A simple DM or message works." : "Follow up with contacted candidates. Consistent touch points build trust.",
          "For each fan, document what specific value you provided. This becomes your sales playbook.",
          fans.length < 10 ? "Aim for 10 candidates. Cast a wide net — not everyone will convert." : "10 candidates listed! Now focus on moving each one forward in the pipeline.",
        ],
        crossPartConnections: data.part3.oneLineProposal.finalProposal
          ? [`Use your proposal ("${data.part3.oneLineProposal.finalProposal.slice(0, 40)}...") when reaching out to fan candidates.`]
          : undefined,
      };
    }
    case 16: { // Dream 5 Network
      const members = data.part4.dream5Network.members;
      const roles: Record<string, number> = {};
      members.forEach((m) => { roles[m.role] = (roles[m.role] || 0) + 1; });
      const hasMentor = (roles["mentor"] || 0) > 0;
      const journalTotal = members.reduce((s, m) => s + m.journalEntries.length, 0);
      return {
        insights: [
          `${members.length}/5 Dream 5 members. ${hasMentor ? "Mentor slot filled!" : "Find a mentor first — they accelerate everything."}`,
          `Roles: ${members.length > 0 ? Object.entries(roles).map(([r, c]) => `${c} ${r}${c > 1 ? "s" : ""}`).join(", ") : "none yet"}. Ideal: 1 mentor, 2 peers, 2 partners.`,
          journalTotal > 0
            ? `${journalTotal} journal entries. Active relationships grow. ${journalTotal >= 5 ? "Great engagement!" : "Log more interactions."}`
            : "Start journaling interactions — it tracks relationship depth over time.",
        ],
        suggestions: [
          !hasMentor ? "Priority #1: Find a mentor. Look for someone 2-3 steps ahead, not 20 steps." : "Schedule a monthly check-in with your mentor. Consistency matters.",
          "For each Dream 5 member, define what you can give them FIRST before asking for anything.",
          members.length < 5 ? "Fill your remaining slots. Think: who challenges you? Who complements your weaknesses?" : "All 5 filled! Now deepen these relationships through regular value exchange.",
        ],
        crossPartConnections: data.part2.weaknesses.length > 0
          ? [`Your PART 2 weaknesses suggest looking for partners strong in: ${data.part2.weaknesses.filter(w => w.text).map(w => w.text).slice(0, 2).join(", ")}.`]
          : undefined,
      };
    }
    case 17: { // Rejection Collection
      const challenges = data.part4.rejectionChallenges;
      const completed = challenges.filter((c) => c.completed);
      const lessons = completed.map((c) => c.lesson).filter(Boolean);
      const gapAnalysis = completed.filter((c) => c.expectedReaction && c.actualReaction && c.expectedReaction !== c.actualReaction);
      const resilienceScore = completed.length === 0 ? 0 : Math.round((completed.length / 3) * 100);
      return {
        insights: [
          `${completed.length}/3 rejections collected. Resilience score: ${resilienceScore}%.`,
          gapAnalysis.length > 0
            ? `In ${gapAnalysis.length} case${gapAnalysis.length > 1 ? "s" : ""}, reality was different from expectation. The gap between fear and reality is where growth happens.`
            : completed.length > 0 ? "Compare your expected vs actual reactions — usually the reality is less scary." : "Your first rejection attempt is the hardest. After that, it gets easier.",
          lessons.length > 0
            ? `Key lesson: "${lessons[0]}". Every rejection teaches you something sales training can't.`
            : "After each attempt, write what you learned. Rejections are data, not failures.",
        ],
        suggestions: [
          completed.length === 0 ? "Start with the easiest rejection: ask for a discount at a coffee shop." : "Push your comfort zone further with each attempt.",
          "Reframe: you're not collecting rejections, you're collecting courage.",
          completed.length >= 3 ? "All 3 collected! You've proven you can handle 'no'. Now go get some 'yes's." : `${3 - completed.length} more to go. Each one makes the next easier.`,
        ],
      };
    }
    case 18: { // Sustainable System
      const sys = data.part4.sustainableSystem;
      const hasActivities = sys.coreActivities.length > 0;
      const hasDistractions = sys.distractions.length > 0;
      const hasRewards = sys.rewards.length > 0;
      const recentChecks = sys.habitChecks.filter((h) => h.completed).length;
      const totalChecks = sys.habitChecks.length;
      const sustainScore = [hasActivities, hasDistractions, hasRewards].filter(Boolean).length;
      return {
        insights: [
          `System completeness: ${sustainScore}/3 components. ${sustainScore === 3 ? "Full system designed!" : "Add missing components: " + [!hasActivities && "core activities", !hasDistractions && "distraction blockers", !hasRewards && "rewards"].filter(Boolean).join(", ")}.`,
          hasActivities ? `${sys.coreActivities.length} core activit${sys.coreActivities.length > 1 ? "ies" : "y"} defined. ${sys.coreActivities[0] ? `Primary: "${sys.coreActivities[0].name}" at ${sys.coreActivities[0].time}.` : ""}` : "Define 1-3 core activities with specific time, space, and rules.",
          totalChecks > 0
            ? `Habit tracking: ${recentChecks}/${totalChecks} check-ins completed (${totalChecks > 0 ? Math.round((recentChecks / totalChecks) * 100) : 0}%).`
            : "Start checking in daily to build the habit. Consistency beats intensity.",
        ],
        suggestions: [
          hasDistractions ? "Review your distraction blockers weekly — new distractions appear constantly." : "Identify your top 3 distractions and create a specific blocker for each.",
          hasRewards ? "Make sure rewards are proportional: daily (small), weekly (medium), monthly (big)." : "Design rewards for daily, weekly, and monthly milestones. You need all three.",
          "The best system is one you can do on your worst day. Scale down to the minimum viable habit.",
        ],
      };
    }
    case 19: { // Traffic Light
      const items = data.part4.trafficLight.items;
      const green = items.filter((i) => i.color === "green");
      const yellow = items.filter((i) => i.color === "yellow");
      const red = items.filter((i) => i.color === "red");
      const withPlan = items.filter((i) => i.actionPlan.trim());
      return {
        insights: [
          items.length > 0
            ? `${green.length} green (continue), ${yellow.length} yellow (improve), ${red.length} red (stop). ${green.length > red.length ? "Positive balance!" : "More red than green — time for big changes."}`
            : "Categorize your current activities by color. Be honest — it's a diagnostic, not a judgment.",
          red.length > 0
            ? `Red items to stop: ${red.map(i => `"${i.text}"`).join(", ")}. Stopping these frees up ${red.length * 2}+ hours weekly.`
            : "If nothing is red, you might be too gentle. What activities drain you with no return?",
          `${withPlan.length}/${items.length} items have action plans. ${withPlan.length === items.length ? "Complete coverage!" : "Add action plans for remaining items."}`,
        ],
        suggestions: [
          red.length > 0 ? `Stop "${red[0].text}" this week. Replace that time with your top green activity.` : "Look harder at yellow items — some might need to become red.",
          yellow.length > 0 ? `Improve "${yellow[0].text}" by: setting a deadline, adding accountability, or changing the approach.` : "All green or red? Great clarity! Focus on maximizing green activities.",
          "Re-do this analysis monthly. Activities shift colors as circumstances change.",
        ],
      };
    }
    case 20: { // Sustainability Checklist
      const questions = data.part4.sustainabilityChecklist.questions;
      const yesCount = questions.filter((q) => q.answer === "yes").length;
      const noCount = questions.filter((q) => q.answer === "no").length;
      const needsWork = questions.filter((q) => q.answer === "needs_improvement");
      const domains: Record<string, { yes: number; total: number }> = {};
      questions.forEach((q) => {
        if (!domains[q.domain]) domains[q.domain] = { yes: 0, total: 0 };
        domains[q.domain].total += 1;
        if (q.answer === "yes") domains[q.domain].yes += 1;
      });
      const weakestDomain = Object.entries(domains).sort(([, a], [, b]) => (a.yes / a.total) - (b.yes / b.total))[0];
      const score = questions.length > 0 ? Math.round((yesCount / questions.length) * 100) : 0;
      return {
        insights: [
          `Sustainability score: ${score}%. ${score >= 75 ? "Strong foundation!" : score >= 50 ? "Decent but needs shoring up." : "Fragile foundation — address weak areas before scaling."}`,
          `Breakdown: ${yesCount} yes, ${noCount} no, ${needsWork.length} needs improvement.`,
          weakestDomain
            ? `Weakest pillar: ${weakestDomain[0]} (${Math.round((weakestDomain[1].yes / weakestDomain[1].total) * 100)}%). ${weakestDomain[0] === "financial" ? "Build a 3-month runway before going all-in." : weakestDomain[0] === "mental" ? "Invest in rest and a support system." : "Strengthen your social network of supporters."}`
            : "Answer all questions to get your sustainability assessment.",
        ],
        suggestions: [
          needsWork.length > 0 ? `Priority fix: "${needsWork[0].question}" — write a specific improvement plan.` : noCount > 0 ? "Focus on converting your 'no' answers to 'yes' over the next 30 days." : "All green! You're ready to scale.",
          "Re-check this monthly. Sustainability is dynamic, not static.",
          `Overall: ${score >= 70 ? "You can pursue your dream with confidence." : "Stabilize your foundation first. A strong base supports big dreams."}`,
        ],
        crossPartConnections: data.expenses.length > 0
          ? [`PART 1 Money Flow data shows $${data.expenses.filter(e => e.satisfaction === "low").reduce((s, e) => s + e.amount, 0)} in low-satisfaction spending that could fund your financial sustainability.`]
          : undefined,
      };
    }
    default: {
      return {
        insights: [
          "You're making solid progress. Keep going — each activity builds on the last.",
          "Your data across PARTs is starting to tell a story. Patterns are emerging.",
        ],
        suggestions: [
          "Review your previous activities — you'll spot connections you missed.",
          "Complete this activity fully before moving on.",
        ],
      };
    }
  }
}

export async function generateInsight(
  activityId: number,
  data: PlannerData
): Promise<AiInsightResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return getMockInsight(activityId, data);
  }

  try {
    const openai = new OpenAI({ apiKey });
    const context = buildActivityContext(activityId, data);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: INSIGHT_SYSTEM_PROMPT },
        { role: "user", content: context },
      ],
      temperature: 0.7,
      max_tokens: 600,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response");

    const parsed = JSON.parse(content) as AiInsightResult;

    return {
      insights: Array.isArray(parsed.insights) ? parsed.insights.slice(0, 4).map(String) : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 3).map(String) : [],
      crossPartConnections: Array.isArray(parsed.crossPartConnections) ? parsed.crossPartConnections.slice(0, 2).map(String) : undefined,
    };
  } catch (error) {
    console.error("[AI Insights] OpenAI call failed, using mock:", error);
    return getMockInsight(activityId, data);
  }
}

// ── Journey Report Generation ──
const REPORT_SYSTEM_PROMPT = `You are Dream Planner's Journey Report Generator. Create a comprehensive, personalized summary of the user's entire dream planning journey across all 4 PARTs.

The report should feel like a personal coach's assessment — encouraging but honest, specific not generic.

Respond ONLY with valid JSON:
{
  "title": "Your Dream Journey Report",
  "coreAssets": ["..."],
  "discoveredWhy": "...",
  "validatedIdea": "...",
  "network": "...",
  "keyInsights": ["..."],
  "nextSteps": ["..."],
  "overallScore": 0-100,
  "pillarScores": {"reality": 0-100, "discovery": 0-100, "validation": 0-100, "connection": 0-100},
  "encouragement": "..."
}`;

export interface JourneyReportData {
  title: string;
  coreAssets: string[];
  discoveredWhy: string;
  validatedIdea: string;
  network: string;
  keyInsights: string[];
  nextSteps: string[];
  overallScore: number;
  pillarScores: {
    reality: number;
    discovery: number;
    validation: number;
    connection: number;
  };
  encouragement: string;
}

export async function generateJourneyReport(data: PlannerData): Promise<JourneyReportData> {
  const context: string[] = [];

  context.push(`User: ${data.userName || "Dreamer"}`);
  context.push(`Dream Statement: "${data.dreamStatement}"`);
  context.push(`Started: ${data.startedAt || "unknown"}, Streak: ${data.streak} days, Max Streak: ${data.maxStreak} days`);

  // PART 1 Summary
  context.push("\n--- PART 1: Face My Reality ---");
  context.push(`Skills: ${data.skills.length} total`);
  const topSkills = data.skills.filter((s) => s.proficiency >= 4).map((s) => s.name);
  if (topSkills.length > 0) context.push(`Top skills: ${topSkills.join(", ")}`);
  const strongResources = data.resources.filter((r) => r.score >= 4).map((r) => r.label);
  if (strongResources.length > 0) context.push(`Strong resources: ${strongResources.join(", ")}`);
  const prodHours = data.timeBlocks.filter((t) => t.type === "productive").reduce((s, t) => s + t.duration, 0);
  const consHours = data.timeBlocks.filter((t) => t.type === "consumption").reduce((s, t) => s + t.duration, 0);
  context.push(`Time: ${prodHours}h productive, ${consHours}h consumption per week`);
  const lowSatTotal = data.expenses.filter((e) => e.satisfaction === "low").reduce((s, e) => s + e.amount, 0);
  context.push(`Low-satisfaction spending: $${lowSatTotal}/month`);
  const stateEntries = data.currentState.filter((c) => c.content.trim()).map((c) => `${c.title}: "${c.content.slice(0, 100)}"`);
  if (stateEntries.length > 0) context.push(`Current state: ${stateEntries.join("; ")}`);

  // PART 2 Summary
  context.push("\n--- PART 2: Discover My Dream ---");
  context.push(`Mind map nodes: ${data.part2.mindMapNodes.length}`);
  context.push(`Failures documented: ${data.part2.failureEntries.length}`);
  const lessons = data.part2.failureEntries.map((f) => f.lesson).filter(Boolean);
  if (lessons.length > 0) context.push(`Key lessons: ${lessons.join("; ")}`);
  context.push(`Strengths: ${data.part2.strengths.join(", ") || "none listed"}`);
  context.push(`Why: "${data.part2.whyWhatBridge.why}"`);
  const selectedIdea = data.part2.whyWhatBridge.selectedIndex >= 0
    ? data.part2.whyWhatBridge.ideas[data.part2.whyWhatBridge.selectedIndex]
    : "";
  if (selectedIdea) context.push(`Selected idea: "${selectedIdea}"`);

  // PART 3 Summary
  context.push("\n--- PART 3: Validate & Build ---");
  context.push(`Proposal: "${data.part3.oneLineProposal.finalProposal}"`);
  const testedHypotheses = data.part3.hypotheses.filter((h) => h.status !== "pending");
  const successfulHypotheses = testedHypotheses.filter((h) => h.status === "success");
  context.push(`Hypotheses: ${testedHypotheses.length} tested, ${successfulHypotheses.length} succeeded`);
  context.push(`MVP type: ${data.part3.mvpPlan.mvpType || "not selected"}`);
  const completedSteps = data.part3.mvpPlan.steps.filter((s) => s.done).length;
  context.push(`MVP progress: ${completedSteps}/${data.part3.mvpPlan.steps.length} steps`);
  const ladder = data.part3.valueLadder.filter((v) => v.productName);
  if (ladder.length > 0) context.push(`Value ladder: ${ladder.map((v) => `${v.tier}: "${v.productName}" $${v.price}`).join(", ")}`);

  // PART 4 Summary
  context.push("\n--- PART 4: Connect & Expand ---");
  const fans = data.part4.fanCandidates;
  const activeFans = fans.filter((f) => f.stage !== "candidate");
  context.push(`Fan candidates: ${fans.length}, active: ${activeFans.length}`);
  context.push(`Dream 5 members: ${data.part4.dream5Network.members.length}/5`);
  const completedRejections = data.part4.rejectionChallenges.filter((r) => r.completed);
  context.push(`Rejections collected: ${completedRejections.length}/3`);
  const sustainChecklist = data.part4.sustainabilityChecklist.questions;
  const yesCount = sustainChecklist.filter((q) => q.answer === "yes").length;
  context.push(`Sustainability score: ${Math.round((yesCount / sustainChecklist.length) * 100)}%`);

  // Completions
  const totalActivities = data.completedActivities.length + data.part2.completedActivities.length + data.part3.completedActivities.length + data.part4.completedActivities.length;
  context.push(`\nTotal activities completed: ${totalActivities}/20`);

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // Mock report
    return {
      title: `${data.userName || "Dreamer"}'s Dream Journey Report`,
      coreAssets: [
        topSkills.length > 0 ? `Top skills: ${topSkills.join(", ")}` : "Skills inventory in progress",
        strongResources.length > 0 ? `Strong resources: ${strongResources.join(", ")}` : "Resource assessment needed",
        `${prodHours}h productive time per week available`,
      ],
      discoveredWhy: data.part2.whyWhatBridge.why || "Still discovering your Why — that's okay!",
      validatedIdea: data.part3.oneLineProposal.finalProposal || "Idea validation in progress",
      network: `${data.part4.dream5Network.members.length}/5 Dream 5 members, ${activeFans.length} active fan connections`,
      keyInsights: [
        topSkills.length > 0 ? `Your ${topSkills[0]} skill is your strongest asset` : "Complete PART 1 to discover your core assets",
        lowSatTotal > 0 ? `$${lowSatTotal * 12}/year recoverable from low-satisfaction spending` : "Your spending is well-aligned with your values",
        selectedIdea ? `Your selected idea "${selectedIdea}" has the most potential` : "Keep exploring ideas in PART 2",
      ],
      nextSteps: [
        totalActivities < 20 ? "Complete remaining activities for a fuller picture" : "Review and refine your strongest areas",
        data.part3.oneLineProposal.finalProposal ? "Test your proposal with 5 real people this week" : "Craft your one-line proposal in PART 3",
        activeFans.length < 3 ? "Focus on reaching out to fan candidates" : "Deepen relationships with your most engaged fans",
      ],
      overallScore: Math.round((totalActivities / 20) * 100),
      pillarScores: {
        reality: Math.round((data.completedActivities.length / 5) * 100),
        discovery: Math.round((data.part2.completedActivities.length / 5) * 100),
        validation: Math.round((data.part3.completedActivities.length / 4) * 100),
        connection: Math.round((data.part4.completedActivities.length / 6) * 100),
      },
      encouragement: totalActivities >= 15
        ? "You're almost there! The finish line is in sight. Your dream has never been more real."
        : totalActivities >= 10
          ? "You're past the halfway mark! The hard work of self-discovery is paying off."
          : "Every activity you complete brings you closer to your dream. Keep going!",
    };
  }

  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: REPORT_SYSTEM_PROMPT },
        { role: "user", content: context.join("\n") },
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response");

    return JSON.parse(content) as JourneyReportData;
  } catch (error) {
    console.error("[Journey Report] Error:", error);
    // Fall back to mock
    return generateJourneyReport({ ...data }); // recursion is fine since no apiKey on retry
  }
}
