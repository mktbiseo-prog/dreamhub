import type { EmotionType } from "@dreamhub/ai";

const EMOTION_CONFIG: Record<
  EmotionType,
  { emoji: string; label: string; color: string; bgColor: string }
> = {
  excited: { emoji: "\u{1F525}", label: "Excited", color: "text-orange-300", bgColor: "bg-orange-500/15" },
  grateful: { emoji: "\u{1F49C}", label: "Grateful", color: "text-pink-300", bgColor: "bg-pink-500/15" },
  anxious: { emoji: "\u{1F630}", label: "Anxious", color: "text-yellow-300", bgColor: "bg-yellow-500/15" },
  frustrated: { emoji: "\u{1F624}", label: "Frustrated", color: "text-red-300", bgColor: "bg-red-500/15" },
  curious: { emoji: "\u{1F9D0}", label: "Curious", color: "text-cyan-300", bgColor: "bg-cyan-500/15" },
  calm: { emoji: "\u{1F33F}", label: "Calm", color: "text-green-300", bgColor: "bg-green-500/15" },
  determined: { emoji: "\u{1F4AA}", label: "Determined", color: "text-blue-300", bgColor: "bg-blue-500/15" },
  confused: { emoji: "\u{1F914}", label: "Confused", color: "text-amber-300", bgColor: "bg-amber-500/15" },
  hopeful: { emoji: "\u{2B50}", label: "Hopeful", color: "text-indigo-300", bgColor: "bg-indigo-500/15" },
  melancholic: { emoji: "\u{1F327}\uFE0F", label: "Melancholic", color: "text-slate-300", bgColor: "bg-slate-500/15" },
};

interface EmotionBadgeProps {
  emotion: EmotionType;
  confidence?: number;
  size?: "sm" | "md";
}

export function EmotionBadge({ emotion, confidence, size = "sm" }: EmotionBadgeProps) {
  const config = EMOTION_CONFIG[emotion];
  if (!config) return null;

  const sizeClasses = size === "md"
    ? "px-3 py-1.5 text-sm gap-1.5"
    : "px-2 py-0.5 text-xs gap-1";

  return (
    <span
      className={`inline-flex items-center rounded-full ${config.bgColor} ${config.color} ${sizeClasses} font-medium`}
    >
      <span>{config.emoji}</span>
      <span>{config.label}</span>
      {confidence != null && confidence > 0 && (
        <span className="opacity-60">{Math.round(confidence * 100)}%</span>
      )}
    </span>
  );
}
