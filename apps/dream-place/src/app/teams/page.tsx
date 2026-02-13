"use client";

import { useEffect, useState } from "react";
import { Button } from "@dreamhub/ui";
import { TeamCard } from "@/components/teams/TeamCard";
import { CreateTeamModal } from "@/components/teams/CreateTeamModal";
import { useDreamStore } from "@/store/useDreamStore";
import { MOCK_TEAMS } from "@/data/mockTeams";

export default function TeamsPage() {
  const storeTeams = useDreamStore((s) => s.teams);
  const fetchTeams = useDreamStore((s) => s.fetchTeams);
  const createTeam = useDreamStore((s) => s.createTeam);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const teams = storeTeams.length > 0 ? storeTeams : MOCK_TEAMS;

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            My Teams
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Your Dream Teams and collaborations
          </p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          New Team
        </Button>
      </div>

      <div className="space-y-4">
        {teams.map((t) => (
          <TeamCard key={t.id} team={t} />
        ))}
      </div>

      {teams.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-lg font-medium text-gray-400">No teams yet</p>
          <p className="mt-1 text-sm text-gray-400">
            Match with dreamers to form your first team
          </p>
        </div>
      )}

      <CreateTeamModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={createTeam}
      />
    </div>
  );
}
