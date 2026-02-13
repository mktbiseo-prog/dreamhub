"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface VoiceRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  error: string | null;
}

interface VoiceRecorderActions {
  start: () => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

const MAX_DURATION = 5 * 60; // 5 minutes
const PREFERRED_MIME = "audio/webm;codecs=opus";

function getSupportedMimeType(): string {
  if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(PREFERRED_MIME)) {
    return PREFERRED_MIME;
  }
  if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("audio/webm")) {
    return "audio/webm";
  }
  return "";
}

export function useVoiceRecorder(): VoiceRecorderState & VoiceRecorderActions {
  const [state, setState] = useState<VoiceRecorderState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: null,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopAllTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(async () => {
    try {
      setState((s) => ({ ...s, error: null, audioBlob: null, duration: 0 }));
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        setState((s) => ({
          ...s,
          isRecording: false,
          isPaused: false,
          audioBlob: blob,
        }));
        clearTimer();
      };

      recorder.start(1000); // chunks every 1s

      timerRef.current = setInterval(() => {
        setState((s) => {
          const next = s.duration + 1;
          if (next >= MAX_DURATION) {
            mediaRecorderRef.current?.stop();
            stopAllTracks();
            return { ...s, duration: next };
          }
          return { ...s, duration: next };
        });
      }, 1000);

      setState((s) => ({ ...s, isRecording: true, isPaused: false }));
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Microphone permission denied. Please allow access to record."
          : "Failed to start recording. Please check your microphone.";
      setState((s) => ({ ...s, error: message }));
    }
  }, [clearTimer, stopAllTracks]);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    stopAllTracks();
    clearTimer();
  }, [stopAllTracks, clearTimer]);

  const pause = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      clearTimer();
      setState((s) => ({ ...s, isPaused: true }));
    }
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      timerRef.current = setInterval(() => {
        setState((s) => {
          const next = s.duration + 1;
          if (next >= MAX_DURATION) {
            mediaRecorderRef.current?.stop();
            stopAllTracks();
            return { ...s, duration: next };
          }
          return { ...s, duration: next };
        });
      }, 1000);
      setState((s) => ({ ...s, isPaused: false }));
    }
  }, [stopAllTracks]);

  const reset = useCallback(() => {
    stop();
    chunksRef.current = [];
    setState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioBlob: null,
      error: null,
    });
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllTracks();
      clearTimer();
    };
  }, [stopAllTracks, clearTimer]);

  return { ...state, start, stop, pause, resume, reset };
}
