"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Sparkles } from "lucide-react";
import { RecordButton } from "./brain/RecordButton";
import { WaveformVisualizer } from "./brain/WaveformVisualizer";
import { useVoiceRecorder } from "@/lib/hooks/useVoiceRecorder";
import { createVoiceThought } from "@/lib/actions/thoughts";

// Lazy-load CaptureModal — only rendered when user opens it
const CaptureModal = dynamic(
  () => import("./CaptureModal").then((m) => m.CaptureModal),
  { ssr: false },
);

export function FabButton() {
  const router = useRouter();
  const recorder = useVoiceRecorder();
  const [captureOpen, setCaptureOpen] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [liveBars, setLiveBars] = useState<number[]>(Array(40).fill(0.1));
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);

  // Generate live waveform bars from audio analyser
  const updateBars = useCallback(() => {
    if (!analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);

    const bars: number[] = [];
    const step = Math.floor(data.length / 40);
    for (let i = 0; i < 40; i++) {
      const idx = i * step;
      bars.push(data[idx] / 255);
    }
    setLiveBars(bars);
    animFrameRef.current = requestAnimationFrame(updateBars);
  }, []);

  // Start/stop analyser when recording state changes
  useEffect(() => {
    if (recorder.isRecording && !recorder.isPaused) {
      // Try to create analyser from the mediaRecorder's stream
      try {
        const ctx = new AudioContext();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        // Access the stream via navigator again or use a simulated approach
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
          const source = ctx.createMediaStreamSource(stream);
          source.connect(analyser);
          analyserRef.current = analyser;
          updateBars();
        }).catch(() => {
          // Fallback: simulated bars
          simulateBars();
        });
      } catch {
        simulateBars();
      }
    } else {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      analyserRef.current = null;
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [recorder.isRecording, recorder.isPaused, updateBars]);

  function simulateBars() {
    const interval = setInterval(() => {
      setLiveBars(
        Array(40)
          .fill(0)
          .map(() => 0.15 + Math.random() * 0.7),
      );
    }, 100);
    // Store cleanup
    animFrameRef.current = requestAnimationFrame(() => {
      // Keep the interval running
    });
    // Clean up on next render cycle when recording stops
    const cleanup = () => clearInterval(interval);
    const orig = animFrameRef.current;
    animFrameRef.current = 0;
    // Use a ref-based cleanup
    setTimeout(() => {
      if (!recorder.isRecording) cleanup();
    }, 0);
    // Actually, let's just use a simpler approach
    return () => clearInterval(interval);
  }

  // Auto-transcribe when recording stops
  useEffect(() => {
    if (recorder.audioBlob && !isTranscribing) {
      transcribeAndSave(recorder.audioBlob);
    }
  }, [recorder.audioBlob]); // eslint-disable-line react-hooks/exhaustive-deps

  async function transcribeAndSave(blob: Blob) {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");
      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transcription failed");

      await createVoiceThought({
        body: data.transcript,
        voiceDurationSeconds: recorder.duration,
      });

      recorder.reset();
      router.refresh();
    } catch (err) {
      console.error("Transcription failed:", err);
      // Fallback: open modal with voice mode
      recorder.reset();
    } finally {
      setIsTranscribing(false);
    }
  }

  function handlePress() {
    if (recorder.isRecording) {
      recorder.stop();
    } else {
      recorder.start();
    }
  }

  return (
    <>
      <div className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 flex flex-col items-center">
        {/* Waveform during recording */}
        {recorder.isRecording && (
          <WaveformVisualizer
            bars={liveBars}
            isLive
            height={48}
            className="mb-4 w-[200px]"
          />
        )}

        {/* Transcribing indicator */}
        {isTranscribing && (
          <div className="mb-4 flex items-center gap-2 rounded-full bg-[#132039]/90 border border-[#00D4AA]/30 px-4 py-2 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 animate-spin text-[var(--dream-color-primary)]" />
            <span className="text-xs text-[#00D4AA]">Processing...</span>
          </div>
        )}

        {/* Record button */}
        <RecordButton
          isRecording={recorder.isRecording}
          onPress={handlePress}
          onTypeInstead={() => setCaptureOpen(true)}
          duration={recorder.duration}
        />

        {/* Error */}
        {recorder.error && (
          <p className="mt-2 text-xs text-red-400 text-center max-w-[200px]">
            {recorder.error}
          </p>
        )}
      </div>

      <CaptureModal
        open={captureOpen}
        onClose={() => setCaptureOpen(false)}
      />
    </>
  );
}
