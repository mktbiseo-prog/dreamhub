"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Mic, MicOff, Send, Sparkles, Square, Pause, Play } from "lucide-react";
import { cn } from "@dreamhub/ui";
import { createThought, createVoiceThought } from "@/lib/actions/thoughts";
import { useVoiceRecorder } from "@/lib/hooks/useVoiceRecorder";

interface CaptureModalProps {
  open: boolean;
  onClose: () => void;
  initialMode?: "text" | "voice";
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function CaptureModal({ open, onClose, initialMode = "text" }: CaptureModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"text" | "voice">(initialMode);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Voice
  const recorder = useVoiceRecorder();
  const [transcript, setTranscript] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setTitle("");
      setBody("");
      setError(null);
      setTranscript(null);
      setIsTranscribing(false);
      recorder.reset();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-transcribe when recording stops
  useEffect(() => {
    if (recorder.audioBlob && !isTranscribing && transcript === null) {
      transcribeAudio(recorder.audioBlob);
    }
  }, [recorder.audioBlob]); // eslint-disable-line react-hooks/exhaustive-deps

  async function transcribeAudio(blob: Blob) {
    setIsTranscribing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");
      const res = await fetch("/api/transcribe", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transcription failed");
      setTranscript(data.transcript);
    } catch (err) {
      setError("Failed to transcribe audio. Please try again.");
      console.error(err);
    } finally {
      setIsTranscribing(false);
    }
  }

  if (!open) return null;

  async function handleTextSubmit() {
    if (!body.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await createThought({ title: title.trim() || undefined, body: body.trim() });
      setTitle("");
      setBody("");
      onClose();
      router.refresh();
    } catch (err) {
      setError("Failed to save thought. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVoiceSubmit() {
    if (!transcript?.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await createVoiceThought({
        body: transcript.trim(),
        voiceDurationSeconds: recorder.duration,
      });
      onClose();
      router.refresh();
    } catch (err) {
      setError("Failed to save thought. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-t-2xl sm:rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-400" />
            <h2 className="text-lg font-semibold text-gray-100">
              New Thought
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="mb-4 flex rounded-xl bg-white/5 p-1">
          <button
            type="button"
            onClick={() => setMode("text")}
            className={cn(
              "flex-1 rounded-lg py-2 text-sm font-medium transition-colors",
              mode === "text"
                ? "bg-white/10 text-gray-100"
                : "text-gray-500 hover:text-gray-300"
            )}
          >
            Text
          </button>
          <button
            type="button"
            onClick={() => setMode("voice")}
            className={cn(
              "flex-1 rounded-lg py-2 text-sm font-medium transition-colors",
              mode === "voice"
                ? "bg-white/10 text-gray-100"
                : "text-gray-500 hover:text-gray-300"
            )}
          >
            Voice
          </button>
        </div>

        {mode === "text" ? (
          <>
            {/* Title input */}
            <input
              type="text"
              placeholder="Title (optional — AI will generate one)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mb-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-colors"
            />

            {/* Body textarea */}
            <textarea
              placeholder="What's on your mind?"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              autoFocus
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-colors"
            />

            <p className="mt-2 text-xs text-gray-500">
              AI will automatically categorize, tag, and summarize your thought.
            </p>

            {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

            {/* Actions */}
            <div className="mt-5 flex items-center justify-end">
              <button
                type="button"
                onClick={handleTextSubmit}
                disabled={!body.trim() || isSubmitting}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all",
                  body.trim() && !isSubmitting
                    ? "bg-gradient-to-r from-brand-500 to-blue-500 text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40"
                    : "bg-white/5 text-gray-500 cursor-not-allowed"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin" />
                    AI Processing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Capture
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          /* Voice mode */
          <div className="flex flex-col items-center">
            {!recorder.audioBlob ? (
              /* Recording phase */
              <>
                {/* Timer */}
                <div className="mb-4 text-3xl font-mono text-gray-200">
                  {formatTimer(recorder.duration)}
                </div>

                {/* Recording indicator */}
                {recorder.isRecording && !recorder.isPaused && (
                  <div className="mb-4 flex items-center gap-2">
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
                    <span className="text-sm text-red-400">Recording...</span>
                  </div>
                )}
                {recorder.isPaused && (
                  <div className="mb-4 flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                    <span className="text-sm text-yellow-400">Paused</span>
                  </div>
                )}

                {/* Controls */}
                <div className="flex items-center gap-4">
                  {!recorder.isRecording ? (
                    <button
                      type="button"
                      onClick={recorder.start}
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/30 transition-all hover:bg-red-600 hover:scale-105 active:scale-95"
                    >
                      <Mic className="h-7 w-7" />
                    </button>
                  ) : (
                    <>
                      {recorder.isPaused ? (
                        <button
                          type="button"
                          onClick={recorder.resume}
                          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-gray-300 transition-colors hover:bg-white/20"
                        >
                          <Play className="h-5 w-5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={recorder.pause}
                          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-gray-300 transition-colors hover:bg-white/20"
                        >
                          <Pause className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={recorder.stop}
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/30 transition-all hover:bg-red-600"
                      >
                        <Square className="h-6 w-6 fill-white" />
                      </button>
                    </>
                  )}
                </div>

                {!recorder.isRecording && (
                  <p className="mt-4 text-xs text-gray-500">
                    Tap to start recording (max 5 minutes)
                  </p>
                )}
              </>
            ) : (
              /* Transcript phase */
              <>
                {isTranscribing ? (
                  <div className="flex flex-col items-center py-6">
                    <Sparkles className="h-8 w-8 animate-spin text-brand-400 mb-3" />
                    <p className="text-sm text-gray-400">Transcribing your audio...</p>
                  </div>
                ) : transcript ? (
                  <>
                    <div className="w-full mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Mic className="h-3.5 w-3.5 text-purple-400" />
                        <span className="text-xs font-medium text-purple-300">
                          Transcript ({formatTimer(recorder.duration)})
                        </span>
                      </div>
                      <textarea
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        rows={5}
                        className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300 leading-relaxed outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-colors"
                      />
                    </div>
                    <p className="mb-4 text-xs text-gray-500">
                      Edit the transcript if needed, then capture.
                    </p>
                  </>
                ) : null}
              </>
            )}

            {recorder.error && (
              <p className="mt-3 text-xs text-red-400">{recorder.error}</p>
            )}
            {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

            {/* Voice submit actions */}
            {transcript && !isTranscribing && (
              <div className="mt-4 flex w-full items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setTranscript(null);
                    recorder.reset();
                  }}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-400 transition-colors hover:bg-white/5"
                >
                  Re-record
                </button>
                <button
                  type="button"
                  onClick={handleVoiceSubmit}
                  disabled={!transcript.trim() || isSubmitting}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all",
                    transcript.trim() && !isSubmitting
                      ? "bg-gradient-to-r from-brand-500 to-blue-500 text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40"
                      : "bg-white/5 text-gray-500 cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Sparkles className="h-4 w-4 animate-spin" />
                      AI Processing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Capture
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
