import type { PlannerData } from "./store";

interface PlannerExportData {
  plannerData: PlannerData;
  visionBoardCards?: { type: string; content: string; progress?: number }[];
  passionLevel?: number;
  trafficLightItems?: { text: string; color: string }[];
  milestones?: { title: string; targetDate: string; completed: boolean }[];
  sprintTasks?: { title: string; startWeek: number; endWeek: number; priority: string }[];
  supportNodes?: { name: string; role: string; ring: string; nodeType: string; strength: number }[];
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildSection(title: string, content: string): string {
  return `
    <div class="section">
      <h2>${escapeHtml(title)}</h2>
      ${content}
    </div>
  `;
}

export function generateDreamPlanPDF(data: PlannerExportData): Blob {
  const { plannerData } = data;

  const css = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1f2937;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 24px;
      background: #ffffff;
    }
    .header {
      text-align: center;
      margin-bottom: 48px;
      padding-bottom: 24px;
      border-bottom: 3px solid #8b5cf6;
    }
    .header h1 {
      font-size: 28px;
      color: #7c3aed;
      margin-bottom: 8px;
    }
    .header p {
      font-size: 14px;
      color: #6b7280;
    }
    .dream-statement {
      background: linear-gradient(135deg, #ede9fe, #dbeafe);
      padding: 24px;
      border-radius: 12px;
      margin-bottom: 32px;
      text-align: center;
    }
    .dream-statement h3 {
      color: #7c3aed;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .dream-statement p {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }
    .section {
      margin-bottom: 32px;
      page-break-inside: avoid;
    }
    .section h2 {
      font-size: 18px;
      color: #374151;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e7eb;
    }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px;
    }
    .card-label {
      font-size: 10px;
      text-transform: uppercase;
      color: #9ca3af;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .card-value {
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
    }
    .list { list-style: none; padding: 0; }
    .list li {
      padding: 8px 12px;
      background: #f9fafb;
      border-radius: 6px;
      margin-bottom: 6px;
      font-size: 13px;
      border-left: 3px solid #8b5cf6;
    }
    .traffic-item {
      padding: 8px 12px;
      border-radius: 6px;
      margin-bottom: 6px;
      font-size: 13px;
    }
    .traffic-green { background: #f0fdf4; border-left: 3px solid #22c55e; }
    .traffic-yellow { background: #fefce8; border-left: 3px solid #eab308; }
    .traffic-red { background: #fef2f2; border-left: 3px solid #ef4444; }
    .milestone { display: flex; gap: 12px; margin-bottom: 8px; }
    .milestone-dot {
      width: 12px; height: 12px; border-radius: 50%;
      margin-top: 4px; flex-shrink: 0;
    }
    .milestone-done { background: #22c55e; }
    .milestone-pending { background: #e5e7eb; }
    .sprint-row { display: flex; align-items: center; margin-bottom: 4px; }
    .sprint-label { width: 150px; font-size: 12px; font-weight: 500; }
    .sprint-bar {
      height: 16px; border-radius: 4px; font-size: 10px;
      color: white; display: flex; align-items: center; padding: 0 6px;
    }
    .priority-high { background: #ef4444; }
    .priority-medium { background: #f59e0b; }
    .priority-low { background: #22c55e; }
    .support-node {
      display: flex; gap: 8px; align-items: center;
      padding: 8px; background: #f9fafb; border-radius: 6px; margin-bottom: 4px;
    }
    .node-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .footer {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 11px;
      color: #9ca3af;
    }
    @media print {
      body { padding: 20px; }
      .section { page-break-inside: avoid; }
    }
  `;

  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dream Plan - ${escapeHtml(plannerData.userName || "My Plan")}</title>
  <style>${css}</style>
</head>
<body>
  <div class="header">
    <h1>Dream Plan</h1>
    <p>${escapeHtml(plannerData.userName || "Dreamer")} &middot; Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
  </div>`;

  // Dream Statement
  if (plannerData.dreamStatement) {
    html += `
  <div class="dream-statement">
    <h3>Dream Statement</h3>
    <p>${escapeHtml(plannerData.dreamStatement)}</p>
  </div>`;
  }

  // Vision Board items
  if (data.visionBoardCards && data.visionBoardCards.length > 0) {
    const items = data.visionBoardCards
      .filter((c) => c.content.trim())
      .map((c) => `<li><strong>${escapeHtml(c.type)}:</strong> ${escapeHtml(c.content)}${c.progress !== undefined ? ` (${c.progress}% complete)` : ""}</li>`)
      .join("");
    html += buildSection("Vision Board", `<ul class="list">${items}</ul>`);
  }

  // Passion Level
  if (data.passionLevel !== undefined) {
    const labels: Record<number, string> = { 0: "Just Curious", 25: "Interested", 50: "Excited", 75: "Passionate", 100: "Obsessed" };
    let label = "Just Curious";
    for (const [threshold, l] of Object.entries(labels)) {
      if (data.passionLevel >= Number(threshold)) label = l;
    }
    html += buildSection("Passion Level", `
      <div class="card">
        <div class="card-label">Current Level</div>
        <div class="card-value">${data.passionLevel}% - ${escapeHtml(label)}</div>
      </div>
    `);
  }

  // Skills
  if (plannerData.skills.length > 0) {
    const skills = plannerData.skills
      .filter((s) => s.name.trim())
      .map((s) => `<li>${escapeHtml(s.name)} (${s.category}, ${"*".repeat(s.proficiency)})</li>`)
      .join("");
    html += buildSection("Skills & Experience", `<ul class="list">${skills}</ul>`);
  }

  // Resources
  const scoredResources = plannerData.resources.filter((r) => r.score > 0);
  if (scoredResources.length > 0) {
    const items = scoredResources
      .map((r) => `<div class="card"><div class="card-label">${escapeHtml(r.label)}</div><div class="card-value">${r.score}/5${r.description ? ` - ${escapeHtml(r.description)}` : ""}</div></div>`)
      .join("");
    html += buildSection("Resource Map", `<div class="grid">${items}</div>`);
  }

  // Traffic Light Analysis
  if (data.trafficLightItems && data.trafficLightItems.length > 0) {
    const items = data.trafficLightItems
      .map((i) => `<div class="traffic-item traffic-${escapeHtml(i.color)}">${escapeHtml(i.text)}</div>`)
      .join("");
    html += buildSection("Traffic Light Analysis", items);
  }

  // Revenue Projections (from value ladder)
  const filledLadder = plannerData.part3.valueLadder.filter((v) => v.productName.trim());
  if (filledLadder.length > 0) {
    const items = filledLadder
      .map((v) => `<div class="card"><div class="card-label">${escapeHtml(v.tier)}</div><div class="card-value">${escapeHtml(v.productName)} - $${v.price}</div></div>`)
      .join("");
    html += buildSection("Value Ladder & Revenue", `<div class="grid">${items}</div>`);
  }

  // Milestones
  if (data.milestones && data.milestones.length > 0) {
    const items = data.milestones
      .map((m) => `
        <div class="milestone">
          <div class="milestone-dot ${m.completed ? "milestone-done" : "milestone-pending"}"></div>
          <div>
            <div style="font-size:13px;font-weight:500;${m.completed ? "text-decoration:line-through;color:#6b7280;" : ""}">${escapeHtml(m.title)}</div>
            <div style="font-size:11px;color:#9ca3af;">${new Date(m.targetDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
          </div>
        </div>
      `)
      .join("");
    html += buildSection("Milestones", items);
  }

  // Sprint Plan
  if (data.sprintTasks && data.sprintTasks.length > 0) {
    const items = data.sprintTasks
      .map((t) => `
        <div class="sprint-row">
          <div class="sprint-label">${escapeHtml(t.title)}</div>
          <div class="sprint-bar priority-${escapeHtml(t.priority)}" style="width:${Math.max(40, (t.endWeek - t.startWeek + 1) * 40)}px;margin-left:${(t.startWeek - 1) * 40}px;">
            W${t.startWeek}-W${t.endWeek}
          </div>
        </div>
      `)
      .join("");
    html += buildSection("90-Day Sprint Plan", items);
  }

  // Support Network
  if (data.supportNodes && data.supportNodes.length > 0) {
    const typeColors: Record<string, string> = { people: "#3b82f6", organizations: "#8b5cf6", tools: "#22c55e" };
    const items = data.supportNodes
      .map((n) => `
        <div class="support-node">
          <div class="node-dot" style="background:${typeColors[n.nodeType] || "#6b7280"}"></div>
          <div>
            <div style="font-size:13px;font-weight:500;">${escapeHtml(n.name)}</div>
            <div style="font-size:11px;color:#6b7280;">${escapeHtml(n.role)} &middot; ${escapeHtml(n.ring)} &middot; ${"*".repeat(n.strength)} strength</div>
          </div>
        </div>
      `)
      .join("");
    html += buildSection("Support Network", items);
  }

  // Footer
  html += `
  <div class="footer">
    <p>Generated by Dream Hub Planner &middot; ${new Date().toLocaleDateString("en-US")}</p>
    <p>Keep dreaming. Keep building.</p>
  </div>
</body>
</html>`;

  return new Blob([html], { type: "text/html" });
}

export function generateJsonExport(data: PlannerExportData): Blob {
  const json = JSON.stringify(data, null, 2);
  return new Blob([json], { type: "application/json" });
}
