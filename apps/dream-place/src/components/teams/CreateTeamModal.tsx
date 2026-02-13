"use client";

import { useState } from "react";
import { Button } from "@dreamhub/ui";
import { Input } from "@dreamhub/ui";
import { Textarea } from "@dreamhub/ui";
import { Label } from "@dreamhub/ui";

interface CreateTeamModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, dreamStatement: string) => void;
}

export function CreateTeamModal({ open, onClose, onCreate }: CreateTeamModalProps) {
  const [name, setName] = useState("");
  const [dream, setDream] = useState("");

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !dream.trim()) return;
    onCreate(name.trim(), dream.trim());
    setName("");
    setDream("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-[16px] bg-white p-6 shadow-xl dark:bg-gray-950">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Create Dream Team
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Start a team to collaborate on your dream.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teamName">Team Name</Label>
            <Input
              id="teamName"
              placeholder="e.g., AI Education Pioneers"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="teamDream">Team Dream</Label>
            <Textarea
              id="teamDream"
              placeholder="What will this team build together?"
              value={dream}
              onChange={(e) => setDream(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || !dream.trim()}>
              Create Team
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
