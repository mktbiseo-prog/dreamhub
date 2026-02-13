"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Brain,
  Bell,
  Monitor,
  Database,
  Download,
  Trash2,
  Check,
} from "lucide-react";
import { updateUserPreferences, exportUserData, deleteAllUserData } from "@/lib/actions/settings";
import type { UserPreferencesData } from "@/lib/queries";

interface SettingsViewProps {
  preferences: UserPreferencesData;
  isDemo: boolean;
}

function Toggle({
  enabled,
  onChange,
  disabled,
}: {
  enabled: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
        enabled ? "bg-brand-500" : "bg-white/10"
      } ${disabled ? "opacity-50" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          enabled ? "translate-x-[22px]" : "translate-x-[2px]"
        } mt-[2px]`}
      />
    </button>
  );
}

export function SettingsView({ preferences, isDemo }: SettingsViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const [aiLevel, setAiLevel] = useState(preferences.aiProcessingLevel);
  const [dailyPrompt, setDailyPrompt] = useState(preferences.dailyPromptEnabled);
  const [weeklyInsight, setWeeklyInsight] = useState(preferences.weeklyInsightEnabled);
  const [connectionAlerts, setConnectionAlerts] = useState(preferences.connectionAlerts);
  const [defaultView, setDefaultView] = useState(preferences.defaultView);
  const [thoughtsPerPage, setThoughtsPerPage] = useState(preferences.thoughtsPerPage);
  const [embeddingEnabled, setEmbeddingEnabled] = useState(preferences.embeddingEnabled);

  function handleSave() {
    startTransition(async () => {
      await updateUserPreferences({
        aiProcessingLevel: aiLevel,
        dailyPromptEnabled: dailyPrompt,
        weeklyInsightEnabled: weeklyInsight,
        connectionAlerts,
        defaultView,
        thoughtsPerPage,
        embeddingEnabled,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    });
  }

  function handleExport() {
    startTransition(async () => {
      const data = await exportUserData();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dream-brain-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  function handleDeleteAll() {
    if (
      !window.confirm(
        "Are you sure you want to delete ALL your data? This includes all thoughts, insights, and preferences. This action cannot be undone."
      )
    ) {
      return;
    }
    startTransition(async () => {
      await deleteAllUserData();
      router.push("/");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-bold text-gray-100">Settings</h1>

      {/* AI Processing */}
      <section className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-4 w-4 text-brand-400" />
          <h2 className="text-sm font-semibold text-gray-200">AI Processing</h2>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Analysis depth</label>
            <div className="flex rounded-xl bg-white/[0.04] p-1">
              {(["minimal", "standard", "detailed"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setAiLevel(level)}
                  className={`flex-1 rounded-lg py-2 text-xs font-medium capitalize transition-colors ${
                    aiLevel === level
                      ? "bg-brand-500/20 text-brand-300"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Semantic embeddings</p>
              <p className="text-xs text-gray-500">Enable AI-powered thought connections</p>
            </div>
            <Toggle enabled={embeddingEnabled} onChange={setEmbeddingEnabled} />
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-200">Notifications</h2>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Daily prompt</p>
              <p className="text-xs text-gray-500">Get a daily thought prompt</p>
            </div>
            <Toggle enabled={dailyPrompt} onChange={setDailyPrompt} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Weekly insight</p>
              <p className="text-xs text-gray-500">Receive weekly AI analysis</p>
            </div>
            <Toggle enabled={weeklyInsight} onChange={setWeeklyInsight} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Connection alerts</p>
              <p className="text-xs text-gray-500">When new thought connections are found</p>
            </div>
            <Toggle enabled={connectionAlerts} onChange={setConnectionAlerts} />
          </div>
        </div>
      </section>

      {/* Display */}
      <section className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
        <div className="flex items-center gap-2 mb-4">
          <Monitor className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-200">Display</h2>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Default view</label>
            <div className="flex rounded-xl bg-white/[0.04] p-1">
              {(["home", "timeline", "brain"] as const).map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => setDefaultView(view)}
                  className={`flex-1 rounded-lg py-2 text-xs font-medium capitalize transition-colors ${
                    defaultView === view
                      ? "bg-brand-500/20 text-brand-300"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Thoughts per page</label>
            <select
              value={thoughtsPerPage}
              onChange={(e) => setThoughtsPerPage(Number(e.target.value))}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 outline-none focus:border-brand-500/50"
            >
              {[10, 20, 30, 50].map((n) => (
                <option key={n} value={n}>
                  {n} thoughts
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={isPending || isDemo}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-blue-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-brand-500/25 transition-all hover:shadow-brand-500/40 disabled:opacity-50"
      >
        {saved ? (
          <>
            <Check className="h-4 w-4" />
            Saved
          </>
        ) : isPending ? (
          "Saving..."
        ) : (
          "Save preferences"
        )}
      </button>

      {/* Data */}
      {!isDemo && (
        <section className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-200">Data</h2>
          </div>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleExport}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export all data (JSON)
            </button>
            <button
              type="button"
              onClick={handleDeleteAll}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/5 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete all data
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
