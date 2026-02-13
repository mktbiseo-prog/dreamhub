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
import { updateDreamStorySchema } from "@/lib/validations";
import { updateDreamStory, deleteDreamStory } from "@/lib/actions/stories";
import type { DreamStory } from "@/lib/types";

interface MilestoneField {
  title: string;
  targetDate: string;
}

interface EditDreamStoryFormProps {
  storyId: string;
  story: DreamStory;
}

const STEPS = [
  { label: "Dream Declaration", desc: "What's your dream?" },
  { label: "Origin Story", desc: "How did it start?" },
  { label: "Your Journey", desc: "Key milestones" },
  { label: "Impact", desc: "Why it matters" },
  { label: "Review", desc: "Save your changes" },
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

export function EditDreamStoryForm({ storyId, story }: EditDreamStoryFormProps) {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState(story.title);
  const [statement, setStatement] = useState(story.statement);
  const [originStory, setOriginStory] = useState(story.originStory || "");
  const [impactStatement, setImpactStatement] = useState(story.impactStatement || "");
  const [creatorStage, setCreatorStage] = useState(story.creatorStage || "early");
  const [videoUrl, setVideoUrl] = useState(story.videoUrl || "");
  const [milestones, setMilestones] = useState<MilestoneField[]>(
    story.milestones.length === 3
      ? story.milestones.map((m) => ({ title: m.title, targetDate: m.targetDate }))
      : [
          { title: "", targetDate: "" },
          { title: "", targetDate: "" },
          { title: "", targetDate: "" },
        ]
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  function updateMilestone(index: number, field: keyof MilestoneField, value: string) {
    setMilestones((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  }

  function next() {
    setErrors({});
    if (step === 0 && (!title.trim() || statement.length < 10)) {
      setErrors({
        title: !title.trim() ? "Required" : "",
        statement: statement.length < 10 ? "At least 10 characters" : "",
      });
      return;
    }
    if (step === 2) {
      const emptyMs = milestones.some((m) => !m.title.trim() || !m.targetDate);
      if (emptyMs) {
        setErrors({ milestones: "All milestones need a title and date" });
        return;
      }
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

    const data = { title, statement, originStory, impactStatement, creatorStage, videoUrl, milestones };
    const result = updateDreamStorySchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) fieldErrors[issue.path.join(".")] = issue.message;
      setErrors(fieldErrors);
      setStep(0);
      return;
    }

    startTransition(async () => {
      try {
        await updateDreamStory(storyId, result.data);
      } catch (err) {
        setErrors({ _form: err instanceof Error ? err.message : "Something went wrong." });
      }
    });
  }

  function handleDelete() {
    startDeleteTransition(async () => {
      try {
        await deleteDreamStory(storyId);
      } catch (err) {
        setErrors({ _form: err instanceof Error ? err.message : "Failed to delete." });
        setShowDeleteConfirm(false);
      }
    });
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-gray-500">
            {STEPS.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => i < step && setStep(i)}
                className={`flex flex-col items-center gap-1 ${i <= step ? "text-brand-600 font-medium" : ""}`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    i < step
                      ? "bg-brand-600 text-white"
                      : i === step
                        ? "bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300"
                        : "bg-gray-200 text-gray-500 dark:bg-gray-800"
                  }`}
                >
                  {i < step ? "\u2713" : i + 1}
                </span>
                <span className="hidden sm:block">{s.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-orange-400 transition-all"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Dream Declaration */}
        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>What&apos;s your dream?</CardTitle>
              <CardDescription>
                Update your dream title and statement.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Dream Title</Label>
                <Input
                  id="title"
                  placeholder='e.g. "Handcrafted Ceramics from My Home Studio"'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                />
                <div className="flex justify-between text-xs text-gray-400">
                  {errors.title ? <span className="text-red-500">{errors.title}</span> : <span />}
                  <span>{title.length}/120</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="statement">Dream Statement</Label>
                <Textarea
                  id="statement"
                  placeholder="I dream of... because..."
                  rows={6}
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  maxLength={2000}
                  className="resize-y text-base leading-relaxed"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  {errors.statement ? <span className="text-red-500">{errors.statement}</span> : <span />}
                  <span>{statement.length}/2,000</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL (optional)</Label>
                <Input
                  id="videoUrl"
                  placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
                {errors.videoUrl && (
                  <p className="text-xs text-red-500">{errors.videoUrl}</p>
                )}
                <p className="text-xs text-gray-400">
                  Add a YouTube or Vimeo link to showcase your dream visually.
                </p>
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
                          ? "border-brand-500 bg-brand-50 dark:bg-brand-950/30"
                          : "border-gray-200 hover:border-gray-300 dark:border-gray-800"
                      }`}
                    >
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{opt.label}</p>
                      <p className="text-xs text-gray-500">{opt.desc}</p>
                    </button>
                  ))}
                </div>
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
              <div className="rounded-card bg-brand-50 p-4 text-sm text-brand-700 dark:bg-brand-950/20 dark:text-brand-300">
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
                <div className="flex justify-end text-xs text-gray-400">
                  <span>{originStory.length}/3,000</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Journey Milestones */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Journey Milestones</CardTitle>
              <CardDescription>
                Update your 3 milestones. Supporters love seeing where you&apos;re headed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {milestones.map((milestone, index) => {
                const label = MILESTONE_LABELS[index];
                return (
                  <div key={index} className="rounded-card border border-gray-200 p-5 dark:border-gray-800">
                    <div className="mb-4 flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-orange-400 text-sm font-bold text-white">
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
                        <Input
                          placeholder='e.g. "Launch first collection"'
                          value={milestone.title}
                          onChange={(e) => updateMilestone(index, "title", e.target.value)}
                          maxLength={100}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Target Date</Label>
                        <Input
                          type="date"
                          value={milestone.targetDate}
                          onChange={(e) => updateMilestone(index, "targetDate", e.target.value)}
                        />
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
                Tell supporters what their purchase means for your dream.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-card bg-brand-50 p-4 text-sm text-brand-700 dark:bg-brand-950/20 dark:text-brand-300">
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
                <div className="flex justify-end text-xs text-gray-400">
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
              <CardTitle>Review Your Changes</CardTitle>
              <CardDescription>Make sure everything looks right before saving.</CardDescription>
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
                {videoUrl && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">Video URL</p>
                    <p className="text-sm text-brand-600 break-all">{videoUrl}</p>
                  </div>
                )}
                {originStory && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">Origin Story</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {originStory.slice(0, 200)}{originStory.length > 200 ? "..." : ""}
                    </p>
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
              className="bg-gradient-to-r from-brand-600 to-orange-500 text-white shadow-lg hover:from-brand-700 hover:to-orange-600"
            >
              {isPending ? "Saving Changes..." : "Save Changes"}
            </Button>
          )}
        </div>
      </form>

      {/* Delete Section */}
      <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>
              Permanently delete this dream story and all its products, orders, updates, and comments.
              This action cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showDeleteConfirm ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                Delete This Dream
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="rounded-card bg-red-50 p-4 dark:bg-red-950/30">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    Are you sure you want to delete &quot;{story.title}&quot;?
                  </p>
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    All products, orders, updates, comments, and followers will be permanently removed.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    {isDeleting ? "Deleting..." : "Yes, Delete Permanently"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
