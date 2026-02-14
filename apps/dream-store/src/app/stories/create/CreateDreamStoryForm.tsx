"use client";

import { useState, useTransition, type FormEvent } from "react";
import {
  Button,
  Input,
  Label,
  Textarea,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@dreamhub/ui";
import { createDreamStorySchema } from "@/lib/validations";
import { createDreamStory } from "@/lib/actions/stories";
import { SingleImageUpload, ImageUpload } from "@/components/ImageUpload";
import { AiStoryAssistant } from "@/components/AiStoryAssistant";

interface MilestoneField {
  title: string;
  targetDate: string;
}

const STEPS = [
  { label: "Dream Declaration", desc: "What's your dream?" },
  { label: "Origin Story", desc: "How did it start?" },
  { label: "Your Journey", desc: "Key milestones" },
  { label: "Impact", desc: "Why it matters" },
  { label: "Review", desc: "Launch your dream" },
] as const;

const MILESTONE_LABELS = [
  { step: "1", heading: "First Step", description: "What's the first milestone on your journey?" },
  { step: "2", heading: "Building Momentum", description: "What comes next after your first win?" },
  { step: "3", heading: "The Dream", description: "Where does this journey lead?" },
] as const;

const STAGE_OPTIONS = [
  { value: "early", label: "Early Dreamer", desc: "Just getting started" },
  { value: "growing", label: "Growing", desc: "Building momentum" },
  { value: "established", label: "Established", desc: "Dream is taking shape" },
] as const;

export function CreateDreamStoryForm() {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [statement, setStatement] = useState("");
  const [originStory, setOriginStory] = useState("");
  const [impactStatement, setImpactStatement] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [creatorStage, setCreatorStage] = useState("early");
  const [status, setStatus] = useState<"ACTIVE" | "PREVIEW">("ACTIVE");
  const [milestones, setMilestones] = useState<MilestoneField[]>([
    { title: "", targetDate: "" },
    { title: "", targetDate: "" },
    { title: "", targetDate: "" },
  ]);
  const [coverImage, setCoverImage] = useState("");
  const [processImages, setProcessImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function updateMilestone(index: number, field: keyof MilestoneField, value: string) {
    setMilestones((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  }

  function next() {
    setErrors({});
    if (step === 0 && (!title.trim() || statement.length < 10)) {
      setErrors({ title: !title.trim() ? "Required" : "", statement: statement.length < 10 ? "At least 10 characters" : "" });
      return;
    }
    if (step === 2) {
      const emptyMs = milestones.some((m) => !m.title.trim() || !m.targetDate);
      if (emptyMs) { setErrors({ milestones: "All milestones need a title and date" }); return; }
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});

    const data = { title, statement, originStory, impactStatement, creatorStage, videoUrl, status, milestones, coverImage, processImages };
    const result = createDreamStorySchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) fieldErrors[issue.path.join(".")] = issue.message;
      setErrors(fieldErrors);
      setStep(0);
      return;
    }

    startTransition(async () => {
      try {
        await createDreamStory(result.data);
      } catch (err) {
        setErrors({ _form: err instanceof Error ? err.message : "Something went wrong." });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-gray-500">
          {STEPS.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => i < step && setStep(i)}
              className={`flex flex-col items-center gap-1 ${i <= step ? "text-amber-600 font-medium" : ""}`}
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                i < step ? "bg-amber-600 text-white" : i === step ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" : "bg-gray-200 text-gray-500 dark:bg-gray-800"
              }`}>
                {i < step ? "\u2713" : i + 1}
              </span>
              <span className="hidden sm:block">{s.label}</span>
            </button>
          ))}
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
      </div>

      {/* Step 1: Dream Declaration */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>What&apos;s your dream?</CardTitle>
            <CardDescription>Give your dream a name and tell the world what you&apos;re building.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Dream Title</Label>
              <Input id="title" placeholder='e.g. "Handcrafted Ceramics from My Home Studio"' value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
              <div className="flex justify-between text-xs text-gray-400">
                {errors.title ? <span className="text-red-500">{errors.title}</span> : <span />}
                <span>{title.length}/120</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="statement">Dream Statement</Label>
              <Textarea id="statement" placeholder="I dream of... because..." rows={6} value={statement} onChange={(e) => setStatement(e.target.value)} maxLength={2000} className="resize-y text-base leading-relaxed" />
              <div className="flex justify-between text-xs text-gray-400">
                {errors.statement ? <span className="text-red-500">{errors.statement}</span> : <span />}
                <span>{statement.length}/2,000</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Where are you on your journey?</Label>
              <div className="grid gap-3 sm:grid-cols-3">
                {STAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCreatorStage(opt.value)}
                    className={`rounded-card border p-3 text-left transition-colors ${
                      creatorStage === opt.value
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30"
                        : "border-gray-200 hover:border-gray-300 dark:border-gray-800"
                    }`}
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{opt.label}</p>
                    <p className="text-xs text-gray-500">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <SingleImageUpload
              value={coverImage}
              onChange={setCoverImage}
              label="Cover Image"
              hint="This will be the hero image for your dream page"
            />
            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL (optional)</Label>
              <Input
                id="videoUrl"
                placeholder="https://youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
              <p className="text-xs text-gray-400">
                Supports YouTube and Vimeo links
              </p>
              {errors.videoUrl && <p className="text-xs text-red-500">{errors.videoUrl}</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Origin Story */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>How did this dream start?</CardTitle>
            <CardDescription>
              Tell your origin story. Supporters love knowing the &quot;why&quot; behind the dream. (Optional but highly recommended)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-card bg-amber-50 p-4 text-sm text-amber-700 dark:bg-amber-950/20 dark:text-amber-300">
              Template: &quot;Everything started when I [did X]. That&apos;s when I realized...&quot;
            </div>
            <div className="space-y-2">
              <Label htmlFor="origin">Your Origin Story</Label>
              <Textarea
                id="origin"
                placeholder="It all started when..."
                rows={8}
                value={originStory}
                onChange={(e) => setOriginStory(e.target.value)}
                maxLength={3000}
                className="resize-y text-base leading-relaxed"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <AiStoryAssistant
                  context={{ title, statement, creatorStage }}
                  field="originStory"
                  onSuggestion={(text) => setOriginStory(text)}
                />
                <span>{originStory.length}/3,000</span>
              </div>
            </div>
            <ImageUpload
              value={processImages}
              onChange={setProcessImages}
              max={5}
              label="Behind-the-Scenes Photos (optional)"
              hint="Show your creative process — 3 to 5 photos recommended"
            />
          </CardContent>
        </Card>
      )}

      {/* Step 3: Journey Milestones */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Journey Milestones</CardTitle>
            <CardDescription>Set 3 milestones. Supporters love seeing where you&apos;re headed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {milestones.map((milestone, index) => {
              const label = MILESTONE_LABELS[index];
              return (
                <div key={index} className="rounded-card border border-gray-200 p-5 dark:border-gray-800">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-400 text-sm font-bold text-white">
                      {label.step}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{label.heading}</p>
                      <p className="text-xs text-gray-500">{label.description}</p>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Milestone</Label>
                      <Input placeholder='e.g. "Launch first collection"' value={milestone.title} onChange={(e) => updateMilestone(index, "title", e.target.value)} maxLength={100} />
                    </div>
                    <div className="space-y-2">
                      <Label>Target Date</Label>
                      <Input type="date" value={milestone.targetDate} onChange={(e) => updateMilestone(index, "targetDate", e.target.value)} />
                    </div>
                  </div>
                </div>
              );
            })}
            {errors.milestones && <p className="text-sm text-red-500">{errors.milestones}</p>}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Impact */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>What impact does each sale create?</CardTitle>
            <CardDescription>
              Tell supporters what their purchase means for your dream. This is what transforms a transaction into a meaningful act of support.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-card bg-amber-50 p-4 text-sm text-amber-700 dark:bg-amber-950/20 dark:text-amber-300">
              Example: &quot;Every purchase funds my dream of opening a community studio. One mug = one step closer.&quot;
            </div>
            <div className="space-y-2">
              <Label htmlFor="impact">Impact Statement</Label>
              <Textarea
                id="impact"
                placeholder="Each purchase helps me..."
                rows={4}
                value={impactStatement}
                onChange={(e) => setImpactStatement(e.target.value)}
                maxLength={1000}
                className="resize-y text-base leading-relaxed"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <AiStoryAssistant
                  context={{ title, statement, creatorStage }}
                  field="impactStatement"
                  onSuggestion={(text) => setImpactStatement(text)}
                />
                <span>{impactStatement.length}/1,000</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Review */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Review Your Dream</CardTitle>
            <CardDescription>Everything looks great? Launch your dream!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500">Dream Title</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{title}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Dream Statement</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{statement}</p>
              </div>
              {originStory && (
                <div>
                  <p className="text-xs font-medium text-gray-500">Origin Story</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{originStory.slice(0, 200)}{originStory.length > 200 ? "..." : ""}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-gray-500">Milestones</p>
                <ol className="mt-1 space-y-1">
                  {milestones.map((m, i) => (
                    <li key={i} className="text-sm text-gray-700 dark:text-gray-300">
                      {i + 1}. {m.title} — {m.targetDate}
                    </li>
                  ))}
                </ol>
              </div>
              {impactStatement && (
                <div>
                  <p className="text-xs font-medium text-gray-500">Impact</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{impactStatement}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-gray-500">Creator Stage</p>
                <p className="text-sm capitalize text-gray-700 dark:text-gray-300">{creatorStage}</p>
              </div>
              {coverImage && (
                <div>
                  <p className="text-xs font-medium text-gray-500">Cover Image</p>
                  <img src={coverImage} alt="Cover" className="mt-1 h-32 w-48 rounded-lg object-cover" />
                </div>
              )}
              {processImages.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500">Process Images</p>
                  <div className="mt-1 flex gap-2">
                    {processImages.map((img, i) => (
                      <img key={i} src={img} alt={`Process ${i + 1}`} className="h-16 w-16 rounded-lg object-cover" />
                    ))}
                  </div>
                </div>
              )}
              {videoUrl && (
                <div>
                  <p className="text-xs font-medium text-gray-500">Video URL</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{videoUrl}</p>
                </div>
              )}
            </div>

            {/* Launch mode toggle */}
            <div className="mt-6">
              <p className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                How would you like to launch?
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setStatus("ACTIVE")}
                  className={`rounded-card border p-4 text-left transition-colors ${
                    status === "ACTIVE"
                      ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-800"
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Launch now
                  </p>
                  <p className="text-xs text-gray-500">
                    Your dream goes live immediately with products ready to sell
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("PREVIEW")}
                  className={`rounded-card border p-4 text-left transition-colors ${
                    status === "PREVIEW"
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-800"
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Preview mode
                  </p>
                  <p className="text-xs text-gray-500">
                    Collect followers first — launch products when you are ready
                  </p>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form error */}
      {errors._form && (
        <div className="rounded-card border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {errors._form}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="outline" onClick={back} disabled={step === 0}>
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={next}>
            Continue
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={isPending}
            className="bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-lg hover:from-amber-700 hover:to-orange-600"
          >
            {isPending ? "Creating Your Dream..." : "Launch My Dream"}
          </Button>
        )}
      </div>
    </form>
  );
}
