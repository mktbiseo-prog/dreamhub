"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Globe, AlertCircle } from "lucide-react";

interface SpeechToTextProps {
  onTranscribe: (text: string) => void;
  className?: string;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

const LANGUAGES = [
  { code: "en-US", label: "English" },
  { code: "ko-KR", label: "Korean" },
  { code: "ja-JP", label: "Japanese" },
  { code: "zh-CN", label: "Chinese" },
  { code: "es-ES", label: "Spanish" },
] as const;

export function SpeechToText({ onTranscribe, className }: SpeechToTextProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [language, setLanguage] = useState("en-US");
  const [isSupported, setIsSupported] = useState(true);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const waveformRef = useRef<number[]>(Array(20).fill(0.1));
  const animFrameRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
    }
  }, []);

  // Waveform animation loop
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const bars = waveformRef.current;
    const barWidth = width / bars.length - 2;

    bars.forEach((val, i) => {
      const barHeight = Math.max(val * height, 4);
      const x = i * (barWidth + 2);
      const y = (height - barHeight) / 2;

      const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
      gradient.addColorStop(0, "rgba(139, 92, 246, 0.9)");
      gradient.addColorStop(1, "rgba(59, 130, 246, 0.9)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 2);
      ctx.fill();
    });

    if (isRecording) {
      // Simulate waveform movement
      waveformRef.current = waveformRef.current.map(
        () => 0.15 + Math.random() * 0.7
      );
      animFrameRef.current = requestAnimationFrame(drawWaveform);
    }
  }, [isRecording]);

  useEffect(() => {
    if (isRecording) {
      animFrameRef.current = requestAnimationFrame(drawWaveform);
    } else {
      cancelAnimationFrame(animFrameRef.current);
      waveformRef.current = Array(20).fill(0.1);
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isRecording, drawWaveform]);

  function startRecording() {
    setError(null);
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = "";
      let interim = "";

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (finalText) {
        setTranscript((prev) => prev + finalText);
      }
      setInterimText(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "not-allowed") {
        setError("Microphone access denied. Please allow microphone permissions.");
      } else if (event.error === "no-speech") {
        setError("No speech detected. Try again.");
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function stopRecording() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);

    const fullText = (transcript + interimText).trim();
    if (fullText) {
      onTranscribe(fullText);
    }
  }

  function toggleRecording() {
    if (isRecording) {
      stopRecording();
    } else {
      setTranscript("");
      setInterimText("");
      startRecording();
    }
  }

  if (!isSupported) {
    return (
      <div
        className={`flex flex-col items-center gap-3 rounded-[12px] border border-amber-500/20 bg-amber-500/5 p-4 ${className ?? ""}`}
      >
        <AlertCircle className="h-6 w-6 text-amber-400" />
        <p className="text-sm text-amber-300 text-center">
          Speech recognition is not supported in this browser. Please use Chrome,
          Edge, or Safari for voice input.
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-4 ${className ?? ""}`}>
      {/* Language Selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowLangPicker(!showLangPicker)}
          disabled={isRecording}
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:bg-white/10 disabled:opacity-50"
        >
          <Globe className="h-3 w-3" />
          {LANGUAGES.find((l) => l.code === language)?.label ?? "English"}
        </button>

        {showLangPicker && (
          <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 z-10 w-36 rounded-xl border border-white/10 bg-gray-900 py-1 shadow-xl">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code);
                  setShowLangPicker(false);
                }}
                className={`w-full px-3 py-2 text-left text-xs transition-colors hover:bg-white/5 ${
                  language === lang.code
                    ? "text-violet-400 font-medium"
                    : "text-gray-400"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Waveform Canvas */}
      {isRecording && (
        <canvas
          ref={canvasRef}
          width={200}
          height={48}
          className="w-[200px] h-12"
        />
      )}

      {/* Mic Button */}
      <button
        type="button"
        onClick={toggleRecording}
        className={`relative flex h-16 w-16 items-center justify-center rounded-full transition-all ${
          isRecording
            ? "bg-red-500 shadow-lg shadow-red-500/30"
            : "bg-gradient-to-br from-violet-500 to-blue-500 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
        }`}
      >
        {/* Pulsing ring when recording */}
        {isRecording && (
          <>
            <span className="absolute inset-0 animate-ping rounded-full bg-red-500/30" />
            <span className="absolute inset-[-4px] animate-pulse rounded-full border-2 border-red-400/40" />
          </>
        )}
        {isRecording ? (
          <MicOff className="relative z-10 h-7 w-7 text-white" />
        ) : (
          <Mic className="relative z-10 h-7 w-7 text-white" />
        )}
      </button>

      <p className="text-xs text-gray-500">
        {isRecording ? "Tap to stop recording" : "Tap to start speaking"}
      </p>

      {/* Live Transcription */}
      {(transcript || interimText) && (
        <div className="w-full rounded-[12px] border border-white/10 bg-white/5 p-3">
          <p className="text-xs font-medium text-gray-500 mb-1">Transcription</p>
          <p className="text-sm text-gray-200 leading-relaxed">
            {transcript}
            {interimText && (
              <span className="text-gray-500 italic">
                {interimText}
                <span className="inline-flex gap-0.5 ml-1">
                  <span className="h-1 w-1 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: "0ms" }} />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: "150ms" }} />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: "300ms" }} />
                </span>
              </span>
            )}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 text-center">{error}</p>
      )}
    </div>
  );
}
