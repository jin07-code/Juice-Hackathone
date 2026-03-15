"use client";

import { STORAGE_KEYS, safeGetItem, safeSetItem } from "../storage";
import type { PublicTeam } from "../schema";

export async function getTeamsByHackathon(
  hackathonSlug?: string
): Promise<PublicTeam[]> {
  const teams = safeGetItem<PublicTeam[]>(STORAGE_KEYS.TEAMS) ?? [];
  if (!hackathonSlug) return teams;
  // hackathonId 는 slug 기반으로 매핑되어 있습니다.
  return teams.filter((t) => t.hackathonId === hackathonSlug);
}

type CreateTeamInput = {
  hackathonSlug: string;
  name: string;
  intro: string;
  lookingFor: string[];
  contactUrl: string;
};

export async function createTeam(input: CreateTeamInput): Promise<PublicTeam> {
  const teams = safeGetItem<PublicTeam[]>(STORAGE_KEYS.TEAMS) ?? [];

  const now = new Date().toISOString();
  const id = `T-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;

  const newTeam: PublicTeam = {
    id,
    name: input.name,
    hackathonId: input.hackathonSlug,
    memberCount: 1,
    isOpen: true,
    lookingFor: input.lookingFor,
    intro: input.intro,
    contactUrl: input.contactUrl,
    createdAt: now,
  };

  const next = [...teams, newTeam];
  safeSetItem(STORAGE_KEYS.TEAMS, next);
  return newTeam;
}

