"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@dreamhub/ui";
import { cn } from "@dreamhub/ui";

interface VideoProfileProps {
  /** "record" for camera + recording, "view" for playback */
  mode: "record" | "view";
  /** Video source URL for view mode */
  videoUrl?: string;
  /** Poster frame URL for view mode */
  posterUrl?: string;
  /** Callback when recording is saved */
  onSave?: (blob: Blob) => void;
  /** Max recording duration in seconds */
  maxDuration?: number;
}

type RecordingState = "idle" | "previewing" | "recording" | "recorded";

export function VideoProfile({
  mode,
  videoUrl,
  posterUrl,
  onSave,
  maxDuration = 30,
}: VideoProfileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(maxDuration);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [recordedUrl]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        await videoRef.current.play();
      }
      setRecordingState("previewing");
      setCameraError(null);
    } catch {
      setCameraError(
        "Camera access denied or unavailable. Please check your browser permissions.",
      );
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current, {
      mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm",
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setRecordedBlob(blob);
      const url = URL.createObjectURL(blob);
      setRecordedUrl(url);
      setRecordingState("recorded");

      // Stop camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      // Show recorded video
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = url;
        videoRef.current.muted = false;
      }
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setRecordingState("recording");
    setCountdown(maxDuration);

    // Countdown timer
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          recorder.stop();
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [maxDuration]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
  }, []);

  const retake = useCallback(() => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }
    setRecordedBlob(null);
    setRecordedUrl(null);
    setRecordingState("idle");
    setCountdown(maxDuration);
    startCamera();
  }, [recordedUrl, maxDuration, startCamera]);

  const handleSave = useCallback(() => {
    if (recordedBlob && onSave) {
      onSave(recordedBlob);
    }
  }, [recordedBlob, onSave]);

  const togglePlayback = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // View mode
  if (mode === "view") {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl}
          className="aspect-video w-full object-cover"
          onEnded={() => setIsPlaying(false)}
          playsInline
        />
        <button
          type="button"
          onClick={togglePlayback}
          className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity hover:bg-black/30"
        >
          {!isPlaying && (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg">
              <svg className="ml-1 h-6 w-6 text-neutral-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}
        </button>
      </div>
    );
  }

  // Record mode
  return (
    <div className="space-y-4">
      {/* Video frame */}
      <div className="relative overflow-hidden rounded-2xl bg-neutral-900">
        {recordingState === "idle" && !cameraError && (
          <div className="flex aspect-video items-center justify-center bg-neutral-900">
            <div className="text-center">
              <svg
                className="mx-auto mb-3 h-12 w-12 text-neutral-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                />
              </svg>
              <p className="text-sm text-neutral-400">Record a {maxDuration}-second video profile</p>
            </div>
          </div>
        )}

        {cameraError && (
          <div className="flex aspect-video items-center justify-center bg-neutral-900 p-6">
            <div className="text-center">
              <svg
                className="mx-auto mb-3 h-12 w-12 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
              <p className="text-sm text-red-400">{cameraError}</p>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          className={cn(
            "aspect-video w-full object-cover",
            recordingState === "idle" && "hidden",
            cameraError && "hidden",
          )}
          playsInline
          onEnded={() => setIsPlaying(false)}
        />

        {/* Recording indicator */}
        {recordingState === "recording" && (
          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-sm">
            <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
            <span className="text-sm font-medium text-white">
              {countdown}s
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        {recordingState === "idle" && !cameraError && (
          <Button onClick={startCamera}>
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
            Open Camera
          </Button>
        )}

        {recordingState === "previewing" && (
          <Button onClick={startRecording}>
            <div className="mr-2 h-3 w-3 rounded-full bg-red-500" />
            Record
          </Button>
        )}

        {recordingState === "recording" && (
          <Button variant="outline" onClick={stopRecording}>
            <div className="mr-2 h-3 w-3 rounded-sm bg-red-500" />
            Stop
          </Button>
        )}

        {recordingState === "recorded" && (
          <>
            <Button variant="outline" onClick={retake}>
              Retake
            </Button>
            <Button variant="outline" onClick={togglePlayback}>
              {isPlaying ? "Pause" : "Preview"}
            </Button>
            <Button onClick={handleSave}>
              Save Video
            </Button>
          </>
        )}

        {cameraError && (
          <Button variant="outline" onClick={startCamera}>
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
