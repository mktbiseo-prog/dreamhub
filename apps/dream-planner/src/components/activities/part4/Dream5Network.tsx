"use client";

import { useCallback, useState } from "react";
import { Button, cn } from "@dreamhub/ui";
import { usePlannerStore } from "@/lib/store";
import { CrossPartRef } from "@/components/planner/CrossPartRef";
import type { Dream5Member, Dream5Role } from "@/types/part4";

const ROLE_CONFIG: Record<Dream5Role, { label: string; color: string; slots: number }> = {
  mentor: { label: "Mentor", color: "#f59e0b", slots: 1 },
  peer: { label: "Peer", color: "#3b82f6", slots: 2 },
  partner: { label: "Partner", color: "#8b5cf6", slots: 2 },
};

export function Dream5Network({ onNext }: { onNext: () => void }) {
  const { data, store } = usePlannerStore();
  const network = data.part4.dream5Network;
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [journalNote, setJournalNote] = useState("");

  const addMember = useCallback(
    (role: Dream5Role) => {
      const roleCount = network.members.filter((m) => m.role === role).length;
      if (roleCount >= ROLE_CONFIG[role].slots) return;

      store.setPart4Data({
        dream5Network: {
          members: [
            ...network.members,
            {
              id: crypto.randomUUID(),
              name: "",
              role,
              reason: "",
              valueExchange: "",
              contact: "",
              journalEntries: [],
            },
          ],
        },
      });
    },
    [network, store]
  );

  const updateMember = useCallback(
    (id: string, partial: Partial<Dream5Member>) => {
      store.setPart4Data({
        dream5Network: {
          members: network.members.map((m) =>
            m.id === id ? { ...m, ...partial } : m
          ),
        },
      });
    },
    [network, store]
  );

  const deleteMember = useCallback(
    (id: string) => {
      store.setPart4Data({
        dream5Network: {
          members: network.members.filter((m) => m.id !== id),
        },
      });
    },
    [network, store]
  );

  const addJournalEntry = useCallback(
    (memberId: string) => {
      if (!journalNote.trim()) return;
      const member = network.members.find((m) => m.id === memberId);
      if (!member) return;

      updateMember(memberId, {
        journalEntries: [
          ...member.journalEntries,
          { date: new Date().toISOString().split("T")[0], note: journalNote },
        ],
      });
      setJournalNote("");
    },
    [journalNote, network, updateMember]
  );

  const roles: Dream5Role[] = ["mentor", "peer", "partner"];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
            PART 4
          </span>
          <span className="text-xs text-gray-400">Activity 16</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Dream 5 Network
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Build your core 5: 1 Mentor + 2 Peers + 2 Partners.
        </p>
      </div>

      <CrossPartRef context="network" />

      {/* Network Map */}
      <div className="mb-6 flex items-center justify-center">
        <div className="relative h-[200px] w-[200px]">
          {/* Center: Me */}
          <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-blue-500 text-xs font-bold text-white shadow-lg">
            Me
          </div>
          {/* Members around */}
          {network.members.map((member, i) => {
            const angle = (i / Math.max(network.members.length, 5)) * 2 * Math.PI - Math.PI / 2;
            const r = 80;
            const x = 100 + Math.cos(angle) * r - 16;
            const y = 100 + Math.sin(angle) * r - 16;
            const config = ROLE_CONFIG[member.role];
            return (
              <div
                key={member.id}
                className="absolute flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 text-[9px] font-bold text-white transition-transform hover:scale-110"
                style={{
                  left: x,
                  top: y,
                  backgroundColor: config.color,
                  borderColor: config.color,
                }}
                onClick={() =>
                  setSelectedMemberId(
                    selectedMemberId === member.id ? null : member.id
                  )
                }
                title={member.name || config.label}
              >
                {(member.name || config.label).charAt(0).toUpperCase()}
              </div>
            );
          })}
        </div>
      </div>

      {/* Slots by Role */}
      {roles.map((role) => {
        const config = ROLE_CONFIG[role];
        const members = network.members.filter((m) => m.role === role);
        const canAdd = members.length < config.slots;

        return (
          <div key={role} className="mb-6">
            <div className="mb-2 flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {config.label} ({members.length}/{config.slots})
              </h3>
            </div>

            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className={cn(
                    "rounded-card border p-4 transition-all",
                    selectedMemberId === member.id
                      ? "border-brand-300 dark:border-brand-700"
                      : "border-gray-200 dark:border-gray-700"
                  )}
                  style={{ backgroundColor: selectedMemberId === member.id ? config.color + "10" : undefined }}
                >
                  <div className="mb-3 grid gap-2 sm:grid-cols-2">
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => updateMember(member.id, { name: e.target.value })}
                      placeholder="Name..."
                      className="rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    />
                    <input
                      type="text"
                      value={member.contact}
                      onChange={(e) => updateMember(member.id, { contact: e.target.value })}
                      placeholder="Contact info..."
                      className="rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    />
                  </div>
                  <input
                    type="text"
                    value={member.reason}
                    onChange={(e) => updateMember(member.id, { reason: e.target.value })}
                    placeholder="Why this person?"
                    className="mb-2 w-full rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  />
                  <input
                    type="text"
                    value={member.valueExchange}
                    onChange={(e) => updateMember(member.id, { valueExchange: e.target.value })}
                    placeholder="What value can you exchange?"
                    className="mb-3 w-full rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  />

                  {/* Journal */}
                  {selectedMemberId === member.id && (
                    <div className="mt-3 border-t border-gray-100 pt-3 dark:border-gray-800">
                      <h4 className="mb-2 text-xs font-semibold text-gray-500">
                        Interaction Journal
                      </h4>
                      {member.journalEntries.map((entry, i) => (
                        <div key={i} className="mb-1 text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-medium">{entry.date}:</span> {entry.note}
                        </div>
                      ))}
                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          value={journalNote}
                          onChange={(e) => setJournalNote(e.target.value)}
                          placeholder="Add a journal entry..."
                          onKeyDown={(e) => e.key === "Enter" && addJournalEntry(member.id)}
                          className="flex-1 rounded-[6px] border border-gray-200 bg-gray-50 px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
                        />
                        <Button size="sm" onClick={() => addJournalEntry(member.id)}>
                          Add
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => deleteMember(member.id)}
                      className="text-xs text-gray-400 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {canAdd && (
                <button
                  type="button"
                  onClick={() => addMember(role)}
                  className="w-full rounded-[8px] border border-dashed border-gray-300 py-3 text-xs text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                >
                  + Add {config.label}
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* AI Network Coaching */}
      {network.members.length > 0 && (() => {
        const filled = network.members.filter((m) => m.name.trim()).length;
        const hasJournal = network.members.some((m) => m.journalEntries.length > 0);
        const roleCount = { mentor: 0, peer: 0, partner: 0 };
        network.members.forEach((m) => { if (m.name.trim()) roleCount[m.role]++; });
        const missingRoles = Object.entries(roleCount).filter(([, c]) => c === 0).map(([r]) => r);
        const coachTips: Record<string, string> = {
          mentor: "A mentor can shortcut years of learning. Look for someone 2-3 steps ahead of you, not 20.",
          peer: "Peers keep you accountable and share the journey. Find someone with complementary skills.",
          partner: "Partners bring resources you lack. What skill or connection do you need most?",
        };

        return (
          <div className="mb-6 rounded-card border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 dark:border-emerald-800 dark:from-emerald-950 dark:to-teal-950">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">AI</span>
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Network Coaching</span>
            </div>
            <div className="space-y-2">
              <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{filled}/5 Dream Team Slots Filled</p>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  {filled >= 5 ? "Your Dream 5 is complete! Now focus on deepening these relationships." : filled >= 3 ? "Strong start. Fill the remaining slots to complete your support system." : "Keep building — even 1 strong connection can change everything."}
                </p>
              </div>
              {missingRoles.length > 0 && (
                <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Missing: {missingRoles.join(", ")}</p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{coachTips[missingRoles[0]]}</p>
                </div>
              )}
              {!hasJournal && filled > 0 && (
                <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">Tip: Start journaling interactions</p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    Tracking your interactions helps you give before you ask. Record your first interaction with each member.
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })()}

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
