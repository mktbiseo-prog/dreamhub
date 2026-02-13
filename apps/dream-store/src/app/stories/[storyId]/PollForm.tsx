"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Button, Input, Label } from "@dreamhub/ui";
import { createPoll } from "@/lib/actions/polls";

interface PollFormProps {
  storyId: string;
}

export function PollForm({ storyId }: PollFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [endsAt, setEndsAt] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function addOption() {
    if (options.length >= 5) return;
    setOptions((prev) => [...prev, ""]);
  }

  function removeOption(index: number) {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== index));
  }

  function updateOption(index: number, value: string) {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!question.trim()) {
      setError("Please enter a poll question");
      return;
    }

    const validOptions = options.filter((o) => o.trim());
    if (validOptions.length < 2) {
      setError("Please provide at least 2 options");
      return;
    }

    startTransition(async () => {
      try {
        await createPoll(storyId, {
          question: question.trim(),
          options: validOptions,
          endsAt: endsAt || undefined,
        });
        setQuestion("");
        setOptions(["", ""]);
        setEndsAt("");
        setIsOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create poll");
      }
    });
  }

  if (!isOpen) {
    return (
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        + Create Poll
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-card border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950"
    >
      <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
        Create a Community Poll
      </h4>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="poll-question">Question</Label>
          <Input
            id="poll-question"
            placeholder="What should I create next?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={200}
          />
        </div>

        <div className="space-y-2">
          <Label>Options</Label>
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                placeholder={`Option ${index + 1}`}
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                maxLength={100}
              />
              {options.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(index)}
                  className="shrink-0 text-red-500 hover:text-red-700"
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          {options.length < 5 && (
            <Button type="button" variant="ghost" size="sm" onClick={addOption}>
              + Add Option
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="poll-ends">End Date (optional)</Label>
          <Input
            id="poll-ends"
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <div className="flex items-center gap-2">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "Creating..." : "Create Poll"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setIsOpen(false);
              setError("");
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}
