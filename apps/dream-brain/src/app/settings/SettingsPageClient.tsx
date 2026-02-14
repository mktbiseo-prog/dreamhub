"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Monitor,
  Sun,
  Moon,
  Laptop,
  Check,
  Shield,
  Database,
} from "lucide-react";
import { DataExport } from "@/components/settings/DataExport";
import { PrivacyControls } from "@/components/settings/PrivacyControls";
import { updateUserPreferences, exportUserData, deleteAllUserData } from "@/lib/actions/settings";
import type { UserPreferencesData } from "@/lib/queries";

interface SettingsPageClientProps {
  preferences: UserPreferencesData;
  isDemo: boolean;
  userId: string;
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

type ThemeMode = "system" | "light" | "dark";

export function SettingsPageClient({
  preferences,
  isDemo,
  userId,
}: SettingsPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  // Notifications
  const [dailyPrompt, setDailyPrompt] = useState(preferences.dailyPromptEnabled);
  const [weeklyInsight, setWeeklyInsight] = useState(preferences.weeklyInsightEnabled);
  const [connectionAlerts, setConnectionAlerts] = useState(preferences.connectionAlerts);

  // Appearance
  const [theme, setTheme] = useState<ThemeMode>("system");

  function handleSave() {
    startTransition(async () => {
      await updateUserPreferences({
        ...preferences,
        dailyPromptEnabled: dailyPrompt,
        weeklyInsightEnabled: weeklyInsight,
        connectionAlerts,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    });
  }

  function handleDownloadData() {
    startTransition(async () => {
      const data = await exportUserData();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dream-brain-data-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  function handleDeleteAll() {
    startTransition(async () => {
      await deleteAllUserData();
      router.push("/");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-bold text-gray-100">Settings</h1>

      {/* Notifications */}
      <section className="rounded-[12px] border border-white/[0.06] bg-white/[0.03] p-4">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-200">Notifications</h2>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Daily prompts</p>
              <p className="text-[11px] text-gray-600">
                Get a daily thought prompt to keep your brain active
              </p>
            </div>
            <Toggle
              enabled={dailyPrompt}
              onChange={setDailyPrompt}
              disabled={isDemo}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Weekly insights</p>
              <p className="text-[11px] text-gray-600">
                Receive AI-generated weekly analysis of your thoughts
              </p>
            </div>
            <Toggle
              enabled={weeklyInsight}
              onChange={setWeeklyInsight}
              disabled={isDemo}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Connection alerts</p>
              <p className="text-[11px] text-gray-600">
                Get notified when AI discovers new thought connections
              </p>
            </div>
            <Toggle
              enabled={connectionAlerts}
              onChange={setConnectionAlerts}
              disabled={isDemo}
            />
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="rounded-[12px] border border-white/[0.06] bg-white/[0.03] p-4">
        <PrivacyControls
          onDownloadData={handleDownloadData}
          onDeleteAllData={handleDeleteAll}
        />
      </section>

      {/* Data Export */}
      <section className="rounded-[12px] border border-white/[0.06] bg-white/[0.03] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Database className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-200">Data Export</h2>
        </div>
        <DataExport userId={userId} />
      </section>

      {/* Appearance */}
      <section className="rounded-[12px] border border-white/[0.06] bg-white/[0.03] p-4">
        <div className="flex items-center gap-2 mb-4">
          <Monitor className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-200">Appearance</h2>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-2 block">Theme</label>
          <div className="flex rounded-xl bg-white/[0.04] p-1">
            {([
              { value: "system" as const, label: "System", icon: Laptop },
              { value: "light" as const, label: "Light", icon: Sun },
              { value: "dark" as const, label: "Dark", icon: Moon },
            ]).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors ${
                  theme === value
                    ? "bg-brand-500/20 text-brand-300"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
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

      {isDemo && (
        <p className="text-center text-xs text-gray-600">
          Settings are read-only in demo mode.{" "}
          <a href="/auth/sign-in" className="text-brand-400 hover:underline">
            Sign in
          </a>{" "}
          to customize.
        </p>
      )}
    </div>
  );
}
