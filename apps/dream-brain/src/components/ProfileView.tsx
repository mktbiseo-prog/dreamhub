"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X, Check, LogOut, Sparkles } from "lucide-react";
import { updateUserProfile } from "@/lib/actions/profile";

interface UserProfile {
  name: string | null;
  email: string;
  bio: string | null;
  dreamStatement: string | null;
  skills: string[];
  interests: string[];
}

interface ProfileStats {
  totalThoughts: number;
  topCategory: string | null;
}

interface ProfileViewProps {
  profile: UserProfile;
  stats: ProfileStats;
  isDemo: boolean;
}

export function ProfileView({ profile, stats, isDemo }: ProfileViewProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(profile.name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [dreamStatement, setDreamStatement] = useState(profile.dreamStatement || "");
  const [skillsInput, setSkillsInput] = useState("");
  const [skills, setSkills] = useState<string[]>(profile.skills);
  const [interestsInput, setInterestsInput] = useState("");
  const [interests, setInterests] = useState<string[]>(profile.interests);

  const initial = (profile.name || profile.email || "U").charAt(0).toUpperCase();

  function handleSave() {
    startTransition(async () => {
      await updateUserProfile({ name, bio, dreamStatement, skills, interests });
      setIsEditing(false);
      router.refresh();
    });
  }

  function handleCancel() {
    setName(profile.name || "");
    setBio(profile.bio || "");
    setDreamStatement(profile.dreamStatement || "");
    setSkills(profile.skills);
    setInterests(profile.interests);
    setIsEditing(false);
  }

  function handleAddSkill(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && skillsInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillsInput.trim())) {
        setSkills([...skills, skillsInput.trim()]);
      }
      setSkillsInput("");
    }
  }

  function handleAddInterest(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && interestsInput.trim()) {
      e.preventDefault();
      if (!interests.includes(interestsInput.trim())) {
        setInterests([...interests, interestsInput.trim()]);
      }
      setInterestsInput("");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Avatar + Name */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-blue-500 text-3xl font-bold text-white shadow-lg shadow-brand-500/25">
          {initial}
        </div>
        {isEditing ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full max-w-xs rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-center text-lg font-semibold text-gray-100 outline-none focus:border-brand-500/50"
          />
        ) : (
          <h1 className="text-xl font-bold text-gray-100">
            {profile.name || "Anonymous"}
          </h1>
        )}
        <p className="text-sm text-gray-500">{profile.email}</p>
      </div>

      {/* Edit toggle */}
      {!isDemo && !isEditing && (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="mx-auto inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-400 transition-colors hover:bg-white/5"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit profile
        </button>
      )}

      {/* Dream Statement */}
      <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-brand-400" />
          <span className="text-xs font-medium text-brand-300">Dream Statement</span>
        </div>
        {isEditing ? (
          <textarea
            value={dreamStatement}
            onChange={(e) => setDreamStatement(e.target.value)}
            placeholder="What's your dream?"
            rows={3}
            className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 outline-none focus:border-brand-500/50"
          />
        ) : (
          <p className="text-sm text-gray-300 leading-relaxed">
            {profile.dreamStatement || "No dream statement yet. Tell the world what you're building toward."}
          </p>
        )}
      </div>

      {/* Bio */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Bio</h2>
        {isEditing ? (
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself..."
            rows={3}
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300 outline-none focus:border-brand-500/50"
          />
        ) : (
          <p className="text-sm text-gray-400 leading-relaxed">
            {profile.bio || "No bio yet."}
          </p>
        )}
      </div>

      {/* Skills */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 rounded-lg bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-300"
            >
              {skill}
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setSkills(skills.filter((s) => s !== skill))}
                  className="ml-1 text-brand-400 hover:text-brand-200"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
          {skills.length === 0 && !isEditing && (
            <span className="text-xs text-gray-600">No skills added yet.</span>
          )}
        </div>
        {isEditing && (
          <input
            type="text"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            onKeyDown={handleAddSkill}
            placeholder="Type a skill and press Enter"
            className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300 outline-none focus:border-brand-500/50"
          />
        )}
      </div>

      {/* Interests */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Interests</h2>
        <div className="flex flex-wrap gap-2">
          {interests.map((interest) => (
            <span
              key={interest}
              className="inline-flex items-center gap-1 rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300"
            >
              {interest}
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setInterests(interests.filter((i) => i !== interest))}
                  className="ml-1 text-blue-400 hover:text-blue-200"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
          {interests.length === 0 && !isEditing && (
            <span className="text-xs text-gray-600">No interests added yet.</span>
          )}
        </div>
        {isEditing && (
          <input
            type="text"
            value={interestsInput}
            onChange={(e) => setInterestsInput(e.target.value)}
            onKeyDown={handleAddInterest}
            placeholder="Type an interest and press Enter"
            className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300 outline-none focus:border-brand-500/50"
          />
        )}
      </div>

      {/* Edit buttons */}
      {isEditing && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-blue-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-brand-500/25 transition-all hover:shadow-brand-500/40 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            {isPending ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isPending}
            className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-gray-400 transition-colors hover:bg-white/5"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Stats</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-bold text-gray-100">{stats.totalThoughts}</p>
            <p className="text-xs text-gray-500">Total thoughts</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-100 capitalize">
              {stats.topCategory || "—"}
            </p>
            <p className="text-xs text-gray-500">Top category</p>
          </div>
        </div>
      </div>

      {/* Sign Out */}
      {!isDemo && (
        <button
          type="button"
          onClick={() => {
            window.location.href = "/api/auth/signout";
          }}
          className="mx-auto inline-flex items-center gap-2 rounded-xl border border-red-500/20 px-5 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/5"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      )}
    </div>
  );
}
