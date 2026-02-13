"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { PlannerData } from "@/lib/store";

Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZ9hiA.woff2", fontWeight: 600 },
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hiA.woff2", fontWeight: 700 },
  ],
});

const s = StyleSheet.create({
  page: { padding: 40, fontFamily: "Inter", fontSize: 10, color: "#1f2937" },
  cover: { alignItems: "center", justifyContent: "center", height: "100%" },
  coverTitle: { fontSize: 32, fontWeight: 700, color: "#8b5cf6", marginBottom: 8 },
  coverSubtitle: { fontSize: 14, color: "#6b7280", marginBottom: 40 },
  coverDream: { fontSize: 14, color: "#374151", textAlign: "center", maxWidth: 400, lineHeight: 1.6, fontStyle: "italic" },
  coverName: { fontSize: 12, color: "#8b5cf6", marginTop: 16 },
  coverDate: { fontSize: 9, color: "#9ca3af", marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: "#8b5cf6", marginBottom: 12, borderBottomWidth: 2, borderBottomColor: "#8b5cf6", paddingBottom: 4 },
  partLabel: { fontSize: 8, fontWeight: 600, color: "#8b5cf6", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  h3: { fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 },
  text: { fontSize: 10, color: "#4b5563", lineHeight: 1.5, marginBottom: 4 },
  smallText: { fontSize: 8, color: "#9ca3af", lineHeight: 1.4 },
  card: { backgroundColor: "#f9fafb", borderRadius: 6, padding: 10, marginBottom: 8 },
  cardTitle: { fontSize: 9, fontWeight: 600, color: "#6b7280", marginBottom: 4, textTransform: "uppercase" },
  row: { flexDirection: "row", gap: 8 },
  col: { flex: 1 },
  badge: { backgroundColor: "#ede9fe", color: "#7c3aed", fontSize: 8, fontWeight: 600, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  divider: { borderBottomWidth: 1, borderBottomColor: "#e5e7eb", marginVertical: 12 },
  reflectionQ: { fontSize: 9, fontWeight: 600, color: "#6b7280", marginBottom: 2 },
  reflectionA: { fontSize: 10, color: "#374151", marginBottom: 8, lineHeight: 1.5 },
  footer: { position: "absolute", bottom: 20, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: "#d1d5db" },
  quote: { fontSize: 11, color: "#7c3aed", fontStyle: "italic", textAlign: "center", lineHeight: 1.6, marginVertical: 12 },
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View>
      <Text style={s.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function PlannerPdfDocument({ data }: { data: PlannerData }) {
  const totalCompleted =
    data.completedActivities.length +
    data.part2.completedActivities.length +
    data.part3.completedActivities.length +
    data.part4.completedActivities.length;

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={s.page}>
        <View style={s.cover}>
          <Text style={s.coverTitle}>Dream Planner</Text>
          <Text style={s.coverSubtitle}>Your Journey Report</Text>
          {data.dreamStatement && (
            <Text style={s.coverDream}>&ldquo;{data.dreamStatement}&rdquo;</Text>
          )}
          {data.userName && <Text style={s.coverName}>{data.userName}</Text>}
          <Text style={s.coverDate}>
            Generated {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </Text>
          <Text style={[s.smallText, { marginTop: 8 }]}>
            {totalCompleted}/20 activities completed
          </Text>
        </View>
        <View style={s.footer}>
          <Text style={s.footerText}>Dream Planner by Dream Hub</Text>
          <Text style={s.footerText}>Inspired by Simon Squibb</Text>
        </View>
      </Page>

      {/* PART 1: Face My Reality */}
      <Page size="A4" style={s.page}>
        <Text style={s.partLabel}>Part 1</Text>
        <Section title="Face My Reality">
          {/* Skills */}
          <Card title="Skills & Experience">
            {data.skills.length > 0 ? (
              <Text style={s.text}>
                {data.skills.map((sk) => `${sk.name} (${"★".repeat(sk.proficiency)})`).join(", ")}
              </Text>
            ) : (
              <Text style={s.smallText}>No skills added yet.</Text>
            )}
          </Card>

          {/* Resources */}
          <Card title="Resource Map">
            <View style={s.row}>
              {data.resources.map((r) => (
                <View key={r.key} style={{ alignItems: "center", width: 60 }}>
                  <Text style={{ fontSize: 16, fontWeight: 700, color: r.score >= 4 ? "#22c55e" : r.score >= 2 ? "#eab308" : "#ef4444" }}>
                    {r.score}
                  </Text>
                  <Text style={{ fontSize: 7, color: "#6b7280", textAlign: "center" }}>{r.label}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Time */}
          <Card title="Time Log">
            {data.timeBlocks.length > 0 ? (
              <View>
                <Text style={s.text}>
                  {data.timeBlocks.length} blocks logged. Productive: {data.timeBlocks.filter(b => b.type === "productive").reduce((s, b) => s + b.duration, 0)}h, Consumption: {data.timeBlocks.filter(b => b.type === "consumption").reduce((s, b) => s + b.duration, 0)}h
                </Text>
              </View>
            ) : (
              <Text style={s.smallText}>No time blocks logged.</Text>
            )}
          </Card>

          {/* Money */}
          <Card title="Money Flow">
            {data.expenses.length > 0 ? (
              <Text style={s.text}>
                {data.expenses.length} expenses totaling ${data.expenses.reduce((s, e) => s + e.amount, 0).toFixed(2)}. Low satisfaction: ${data.expenses.filter(e => e.satisfaction === "low").reduce((s, e) => s + e.amount, 0).toFixed(2)}
              </Text>
            ) : (
              <Text style={s.smallText}>No expenses tracked.</Text>
            )}
          </Card>

          {/* Current State */}
          <Card title="Current State">
            {data.currentState.filter(c => c.content.trim()).map((c) => (
              <View key={c.key} style={{ marginBottom: 4 }}>
                <Text style={{ fontSize: 8, fontWeight: 600, color: "#6b7280" }}>{c.title}</Text>
                <Text style={s.text}>{c.content.slice(0, 200)}</Text>
              </View>
            ))}
            {data.currentState.filter(c => c.content.trim()).length === 0 && (
              <Text style={s.smallText}>No state cards filled.</Text>
            )}
          </Card>
        </Section>
        <View style={s.footer}>
          <Text style={s.footerText}>Dream Planner Report</Text>
          <Text style={s.footerText}>Page 2</Text>
        </View>
      </Page>

      {/* PART 2: Discover My Dream */}
      <Page size="A4" style={s.page}>
        <Text style={s.partLabel}>Part 2</Text>
        <Section title="Discover My Dream">
          <Card title="Experience Mind Map">
            <Text style={s.text}>{data.part2.mindMapNodes.length} nodes mapped</Text>
          </Card>

          <Card title="Failure Resume">
            {data.part2.failureEntries.length > 0 ? (
              data.part2.failureEntries.slice(0, 5).map((f, i) => (
                <View key={i} style={{ marginBottom: 4 }}>
                  <Text style={{ fontSize: 9, fontWeight: 600 }}>{f.year}: {f.experience.slice(0, 80)}</Text>
                  <Text style={s.text}>Lesson: {f.lesson.slice(0, 100)}</Text>
                </View>
              ))
            ) : (
              <Text style={s.smallText}>No failures recorded.</Text>
            )}
          </Card>

          <Card title="Strengths & Weaknesses">
            {data.part2.strengths.length > 0 && (
              <Text style={s.text}>Strengths: {data.part2.strengths.join(", ")}</Text>
            )}
            {data.part2.weaknesses.filter(w => w.reframed).length > 0 && (
              <Text style={s.text}>Reframed: {data.part2.weaknesses.filter(w => w.reframed).map(w => `${w.text} → ${w.reframed}`).join("; ")}</Text>
            )}
          </Card>

          <Card title="Why-What Bridge">
            {data.part2.whyWhatBridge.why && (
              <Text style={s.text}>Why: {data.part2.whyWhatBridge.why}</Text>
            )}
            {data.part2.whyWhatBridge.selectedIndex >= 0 && (
              <Text style={s.text}>Selected idea: {data.part2.whyWhatBridge.ideas[data.part2.whyWhatBridge.selectedIndex]}</Text>
            )}
          </Card>
        </Section>
        <View style={s.footer}>
          <Text style={s.footerText}>Dream Planner Report</Text>
          <Text style={s.footerText}>Page 3</Text>
        </View>
      </Page>

      {/* PART 3: Validate & Build */}
      <Page size="A4" style={s.page}>
        <Text style={s.partLabel}>Part 3</Text>
        <Section title="Validate & Build">
          <Card title="One-Line Proposal">
            {data.part3.oneLineProposal.finalProposal ? (
              <Text style={[s.text, { fontWeight: 600 }]}>{data.part3.oneLineProposal.finalProposal}</Text>
            ) : (
              <Text style={s.smallText}>No proposal created.</Text>
            )}
          </Card>

          <Card title="Hypothesis Board">
            {data.part3.hypotheses.filter(h => h.hypothesis.trim()).map((h, i) => (
              <View key={i} style={{ marginBottom: 4 }}>
                <Text style={s.text}>
                  {h.status === "success" ? "✓" : h.status === "fail" ? "✗" : "○"} {h.hypothesis.slice(0, 100)}
                </Text>
                {h.lesson && <Text style={s.smallText}>Lesson: {h.lesson.slice(0, 80)}</Text>}
              </View>
            ))}
          </Card>

          <Card title="Zero-Cost MVP">
            {data.part3.mvpPlan.mvpType && (
              <Text style={s.text}>
                Type: {data.part3.mvpPlan.mvpType.replace(/_/g, " ")}. Steps: {data.part3.mvpPlan.steps.filter(st => st.done).length}/{data.part3.mvpPlan.steps.length} completed
              </Text>
            )}
          </Card>

          <Card title="Value Ladder">
            {data.part3.valueLadder.filter(v => v.productName.trim()).map((v, i) => (
              <Text key={i} style={s.text}>
                {["Freebie", "Low", "Mid", "High"][i] || `Step ${i + 1}`}: {v.productName} (${v.price})
              </Text>
            ))}
          </Card>
        </Section>
        <View style={s.footer}>
          <Text style={s.footerText}>Dream Planner Report</Text>
          <Text style={s.footerText}>Page 4</Text>
        </View>
      </Page>

      {/* PART 4: Connect & Expand */}
      <Page size="A4" style={s.page}>
        <Text style={s.partLabel}>Part 4</Text>
        <Section title="Connect & Expand">
          <Card title="First 10 Fans">
            <Text style={s.text}>
              {data.part4.fanCandidates.length} candidates. {data.part4.fanCandidates.filter(f => f.stage === "fan").length} converted to fans.
            </Text>
          </Card>

          <Card title="Dream 5 Network">
            {data.part4.dream5Network.members.length > 0 ? (
              data.part4.dream5Network.members.map((m, i) => (
                <Text key={i} style={s.text}>{m.role}: {m.name}{m.reason ? ` — ${m.reason.slice(0, 60)}` : ""}</Text>
              ))
            ) : (
              <Text style={s.smallText}>No members added.</Text>
            )}
          </Card>

          <Card title="Rejection Collection">
            <Text style={s.text}>
              {data.part4.rejectionChallenges.filter(r => r.completed).length}/3 challenges completed
            </Text>
          </Card>

          <Card title="Sustainability Check">
            {(() => {
              const qs = data.part4.sustainabilityChecklist.questions;
              const yes = qs.filter(q => q.answer === "yes").length;
              const total = qs.length;
              return <Text style={s.text}>{yes}/{total} areas healthy ({Math.round((yes / Math.max(total, 1)) * 100)}%)</Text>;
            })()}
          </Card>
        </Section>

        <View style={s.divider} />

        {/* Final Quote */}
        <Text style={s.quote}>
          &ldquo;The biggest risk in life is not taking one. Go chase your dream.&rdquo;{"\n"}— Simon Squibb
        </Text>
        <View style={s.footer}>
          <Text style={s.footerText}>Dream Planner Report</Text>
          <Text style={s.footerText}>Page 5</Text>
        </View>
      </Page>
    </Document>
  );
}
