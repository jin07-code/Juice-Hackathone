"use client";

import { STORAGE_KEYS, safeGetItem } from "../storage";
import type { PublicTeam } from "../schema";

export async function getTeamsByHackathonId(
  hackathonId?: string
): Promise<PublicTeam[]> {
  const teams = safeGetItem<PublicTeam[]>(STORAGE_KEYS.TEAMS) ?? [];
  if (!hackathonId) return teams;
  return teams.filter((t) => t.hackathonId === hackathonId);
}

