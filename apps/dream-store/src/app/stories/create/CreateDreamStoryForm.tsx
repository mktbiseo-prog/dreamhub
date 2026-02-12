"use client";

import { useState, useRef, type ChangeEvent, type FormEvent } from "react";
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
import {
  createDreamStorySchema,
  type CreateDreamStoryInput,
} from "@/lib/validations";

interface MilestoneField {
  title: string;
  targetDate: string;
}

const EMPTY_MILESTONES: MilestoneField[] = [
  { title: "", targetDate: "" },
  { title: "", targetDate: "" },
  { title: "", targetDate: "" },
];

const MILESTONE_LABELS = [
  {
    step: "1",
    heading: "First Step",
    description: "What's the first milestone on your journey?",
  },
  {
    step: "2",
    heading: "Building Momentum",
    description: "What comes next after your first win?",
  },
  {
    step: "3",
    heading: "The Dream",
    description: "Where does this journey lead?",
  },
] as const;

export function CreateDreamStoryForm() {
  const [title, setTitle] = useState("");
  const [statement, setStatement] = useState("");
  const [milestones, setMilestones] =
    useState<MilestoneField[]>(EMPTY_MILESTONES);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleCoverChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        coverImage: "Please upload an image file (JPG, PNG, WebP)",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        coverImage: "Image must be smaller than 5MB",
      }));
      return;
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.coverImage;
      return next;
    });
  }

  function removeCover() {
    setCoverFile(null);
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
      setCoverPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function updateMilestone(
    index: number,
    field: keyof MilestoneField,
    value: string
  ) {
    setMilestones((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});

    const data: CreateDreamStoryInput = {
      title,
      statement,
      milestones,
    };

    const result = createDreamStorySchema.safeParse(data);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join(".");
        fieldErrors[path] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    // TODO: API call — upload cover image, then POST /api/stories
    // For now, log the validated data
    console.log("Dream Story data:", { ...result.data, coverFile });

    // Simulate async
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);

    alert("Dream story created! (API not connected yet)");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ── Dream Title ── */}
      <Card>
        <CardHeader>
          <CardTitle>Dream Title</CardTitle>
          <CardDescription>
            Give your dream a name that inspires. This is the first thing
            supporters will see.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder='e.g. "Handcrafted Ceramics from My Home Studio"'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
            />
            <div className="flex justify-between text-xs text-gray-400">
              {errors.title ? (
                <span className="text-red-500">{errors.title}</span>
              ) : (
                <span />
              )}
              <span>{title.length}/120</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Dream Statement ── */}
      <Card>
        <CardHeader>
          <CardTitle>Dream Statement</CardTitle>
          <CardDescription>
            Tell the world what you dream of and why it matters. Be authentic
            &mdash; your story is what connects you with supporters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="statement">Your Dream</Label>
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
              {errors.statement ? (
                <span className="text-red-500">{errors.statement}</span>
              ) : (
                <span />
              )}
              <span>{statement.length}/2,000</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Cover Image ── */}
      <Card>
        <CardHeader>
          <CardTitle>Cover Image</CardTitle>
          <CardDescription>
            Upload a cover image that represents your dream. This will be the
            hero image on your Dream Story page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {coverPreview ? (
              <div className="relative">
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="h-64 w-full rounded-card object-cover"
                />
                <button
                  type="button"
                  onClick={removeCover}
                  className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-black/80"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-64 w-full flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-brand-400 hover:bg-brand-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-brand-600 dark:hover:bg-gray-800"
              >
                <svg
                  className="h-10 w-10 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Click to upload a cover image
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    JPG, PNG or WebP &middot; Max 5MB
                  </p>
                </div>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleCoverChange}
              className="hidden"
            />
            {errors.coverImage && (
              <p className="text-sm text-red-500">{errors.coverImage}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Journey Timeline ── */}
      <Card>
        <CardHeader>
          <CardTitle>Journey Timeline</CardTitle>
          <CardDescription>
            Set 3 milestones for your dream journey. Supporters love seeing
            where you&apos;re headed &mdash; it makes them part of the story.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {milestones.map((milestone, index) => {
              const label = MILESTONE_LABELS[index];
              return (
                <div
                  key={index}
                  className="relative rounded-card border border-gray-200 p-5 dark:border-gray-800"
                >
                  {/* Step indicator */}
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-orange-400 text-sm font-bold text-white">
                      {label.step}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {label.heading}
                      </p>
                      <p className="text-xs text-gray-500">
                        {label.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`milestone-title-${index}`}>
                        Milestone
                      </Label>
                      <Input
                        id={`milestone-title-${index}`}
                        placeholder='e.g. "Launch first collection"'
                        value={milestone.title}
                        onChange={(e) =>
                          updateMilestone(index, "title", e.target.value)
                        }
                        maxLength={100}
                      />
                      {errors[`milestones.${index}.title`] && (
                        <p className="text-xs text-red-500">
                          {errors[`milestones.${index}.title`]}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`milestone-date-${index}`}>
                        Target Date
                      </Label>
                      <Input
                        id={`milestone-date-${index}`}
                        type="date"
                        value={milestone.targetDate}
                        onChange={(e) =>
                          updateMilestone(index, "targetDate", e.target.value)
                        }
                      />
                      {errors[`milestones.${index}.targetDate`] && (
                        <p className="text-xs text-red-500">
                          {errors[`milestones.${index}.targetDate`]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {errors.milestones && (
            <p className="mt-3 text-sm text-red-500">{errors.milestones}</p>
          )}
        </CardContent>
      </Card>

      {/* ── Submit ── */}
      <div className="flex flex-col items-center gap-4 pt-2">
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-brand-600 to-orange-500 text-white shadow-lg hover:from-brand-700 hover:to-orange-600 sm:w-auto sm:min-w-[240px]"
        >
          {isSubmitting ? "Creating Your Dream..." : "Launch My Dream"}
        </Button>
        <p className="text-center text-xs text-gray-500">
          You can always edit your dream story later. Just get started!
        </p>
      </div>
    </form>
  );
}
