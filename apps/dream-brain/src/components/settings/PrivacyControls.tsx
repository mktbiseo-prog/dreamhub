"use client";

import { useState } from "react";
import {
  Shield,
  Download,
  Trash2,
  Brain,
  BarChart3,
  AlertTriangle,
  X,
} from "lucide-react";

interface PrivacyControlsProps {
  onDownloadData?: () => void;
  onDeleteAllData?: () => void;
  className?: string;
}

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
        enabled ? "bg-brand-500" : "bg-white/10"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          enabled ? "translate-x-[22px]" : "translate-x-[2px]"
        } mt-[2px]`}
      />
    </button>
  );
}

export function PrivacyControls({
  onDownloadData,
  onDeleteAllData,
  className,
}: PrivacyControlsProps) {
  const [aiProcessing, setAiProcessing] = useState(true);
  const [shareAnonymous, setShareAnonymous] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  function handleDeleteAll() {
    if (deleteConfirmText.toLowerCase() === "delete my data") {
      onDeleteAllData?.();
      setShowDeleteDialog(false);
      setDeleteConfirmText("");
    }
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-4 w-4 text-gray-400" />
        <h4 className="text-sm font-semibold text-gray-200">
          Privacy & Data Controls
        </h4>
      </div>

      {/* Consent Toggles */}
      <div className="flex flex-col gap-4 mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-2">
            <Brain className="mt-0.5 h-4 w-4 text-[#00D4AA]" />
            <div>
              <p className="text-sm text-gray-300">
                Allow AI processing of my thoughts
              </p>
              <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                AI analyzes your thoughts for categorization, tagging, and
                pattern discovery. Disabling this limits functionality.
              </p>
            </div>
          </div>
          <Toggle enabled={aiProcessing} onChange={setAiProcessing} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-start gap-2">
            <BarChart3 className="mt-0.5 h-4 w-4 text-blue-400" />
            <div>
              <p className="text-sm text-gray-300">
                Share anonymous data for improvements
              </p>
              <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                Aggregated, anonymized usage patterns help improve Dream Brain.
                No personal data is ever shared.
              </p>
            </div>
          </div>
          <Toggle enabled={shareAnonymous} onChange={setShareAnonymous} />
        </div>
      </div>

      {/* Data Actions */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onDownloadData}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5"
        >
          <Download className="h-4 w-4" />
          Download My Data (GDPR/CCPA)
        </button>

        <button
          type="button"
          onClick={() => setShowDeleteDialog(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/5"
        >
          <Trash2 className="h-4 w-4" />
          Delete All My Data
        </button>
      </div>

      {/* Consent Info */}
      <p className="mt-4 text-[10px] text-gray-600 leading-relaxed">
        Your data is stored securely and never sold to third parties. You have
        the right to access, export, or delete your data at any time under GDPR
        and CCPA regulations.
      </p>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteDialog(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-red-500/20 bg-[#132039] p-6 shadow-2xl mx-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-100">
                    Delete All Data
                  </h3>
                  <p className="text-xs text-red-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteDialog(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              This will permanently delete all your thoughts, insights,
              preferences, and associated data. This action is irreversible.
            </p>

            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-1.5 block">
                Type &quot;delete my data&quot; to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="delete my data"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 outline-none focus:border-red-500/50 transition-colors"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteConfirmText("");
                }}
                className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAll}
                disabled={deleteConfirmText.toLowerCase() !== "delete my data"}
                className="flex-1 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
