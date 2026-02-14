import {
  Prisma,
  DreamProject,
  DreamTeam,
  ProjectTask,
  TeamMember,
  TeamCheckIn,
  ProjectStage,
  TeamRole,
} from "@prisma/client";
import { BaseRepository } from "./base";

export class ProjectRepository extends BaseRepository {
  // ── Teams ─────────────────────────────────────────────

  async createTeam(data: Prisma.DreamTeamCreateInput): Promise<DreamTeam> {
    return this.prisma.dreamTeam.create({ data });
  }

  async findTeamById(id: string) {
    return this.prisma.dreamTeam.findUnique({
      where: { id },
      include: { members: { include: { profile: true } }, projects: true },
    });
  }

  async updateTeam(id: string, data: Prisma.DreamTeamUpdateInput): Promise<DreamTeam> {
    return this.prisma.dreamTeam.update({ where: { id }, data });
  }

  async deleteTeam(id: string): Promise<DreamTeam> {
    return this.prisma.dreamTeam.delete({ where: { id } });
  }

  async listTeams(params?: {
    skip?: number;
    take?: number;
  }): Promise<DreamTeam[]> {
    return this.prisma.dreamTeam.findMany({
      include: { members: true, projects: true },
      skip: params?.skip,
      take: params?.take ?? 20,
      orderBy: { createdAt: "desc" },
    });
  }

  // ── Team Members ──────────────────────────────────────

  async addMember(
    teamId: string,
    userId: string,
    role: TeamRole = "CONTRIBUTOR",
  ): Promise<TeamMember> {
    return this.prisma.teamMember.create({
      data: {
        team: { connect: { id: teamId } },
        profile: { connect: { userId } },
        role,
      },
    });
  }

  async removeMember(teamId: string, userId: string): Promise<TeamMember> {
    return this.prisma.teamMember.delete({
      where: { teamId_userId: { teamId, userId } },
    });
  }

  async getMembers(teamId: string): Promise<TeamMember[]> {
    return this.prisma.teamMember.findMany({
      where: { teamId },
      include: { profile: true },
    });
  }

  // ── Projects ──────────────────────────────────────────

  async createProject(data: Prisma.DreamProjectCreateInput): Promise<DreamProject> {
    return this.prisma.dreamProject.create({ data });
  }

  async findProjectById(id: string) {
    return this.prisma.dreamProject.findUnique({
      where: { id },
      include: { tasks: { orderBy: { sortOrder: "asc" } }, team: true },
    });
  }

  async updateProject(
    id: string,
    data: Prisma.DreamProjectUpdateInput,
  ): Promise<DreamProject> {
    return this.prisma.dreamProject.update({ where: { id }, data });
  }

  async updateProjectStage(id: string, stage: ProjectStage): Promise<DreamProject> {
    return this.prisma.dreamProject.update({
      where: { id },
      data: { stage },
    });
  }

  async deleteProject(id: string): Promise<DreamProject> {
    return this.prisma.dreamProject.delete({ where: { id } });
  }

  async listProjects(params?: {
    teamId?: string;
    stage?: ProjectStage;
    isFeatured?: boolean;
    skip?: number;
    take?: number;
  }): Promise<DreamProject[]> {
    const where: Prisma.DreamProjectWhereInput = {};
    if (params?.teamId) where.teamId = params.teamId;
    if (params?.stage) where.stage = params.stage;
    if (params?.isFeatured !== undefined) where.isFeatured = params.isFeatured;

    return this.prisma.dreamProject.findMany({
      where,
      include: { team: true, tasks: true },
      skip: params?.skip,
      take: params?.take ?? 20,
      orderBy: { createdAt: "desc" },
    });
  }

  // ── Tasks ─────────────────────────────────────────────

  async createTask(data: Prisma.ProjectTaskCreateInput): Promise<ProjectTask> {
    return this.prisma.projectTask.create({ data });
  }

  async updateTask(id: string, data: Prisma.ProjectTaskUpdateInput): Promise<ProjectTask> {
    return this.prisma.projectTask.update({ where: { id }, data });
  }

  async deleteTask(id: string): Promise<ProjectTask> {
    return this.prisma.projectTask.delete({ where: { id } });
  }

  async listTasks(projectId: string): Promise<ProjectTask[]> {
    return this.prisma.projectTask.findMany({
      where: { projectId },
      orderBy: { sortOrder: "asc" },
    });
  }

  // ── Check-ins ─────────────────────────────────────────

  async createCheckIn(data: Prisma.TeamCheckInCreateInput): Promise<TeamCheckIn> {
    return this.prisma.teamCheckIn.create({ data });
  }

  async listCheckIns(
    teamId: string,
    params?: { skip?: number; take?: number },
  ): Promise<TeamCheckIn[]> {
    return this.prisma.teamCheckIn.findMany({
      where: { teamId },
      skip: params?.skip,
      take: params?.take ?? 20,
      orderBy: { createdAt: "desc" },
    });
  }

  // ── Transactions ──────────────────────────────────────

  /** Create team + add creator as LEADER + create project in one transaction */
  async createTeamWithProject(
    teamData: { name: string; dreamStatement: string; createdById: string },
    projectData: { name: string; description: string; skillsNeeded?: string[] },
  ) {
    return this.transaction(async (tx) => {
      const team = await tx.dreamTeam.create({
        data: {
          name: teamData.name,
          dreamStatement: teamData.dreamStatement,
          createdById: teamData.createdById,
        },
      });

      await tx.teamMember.create({
        data: {
          team: { connect: { id: team.id } },
          profile: { connect: { userId: teamData.createdById } },
          role: "LEADER",
        },
      });

      const project = await tx.dreamProject.create({
        data: {
          team: { connect: { id: team.id } },
          name: projectData.name,
          description: projectData.description,
          skillsNeeded: projectData.skillsNeeded ?? [],
        },
      });

      return { team, project };
    });
  }
}
