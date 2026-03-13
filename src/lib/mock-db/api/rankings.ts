"use client";

import { STORAGE_KEYS, safeGetItem } from "../storage";
import type { PublicLeaderboardEntry } from "../schema";

export async function getLeaderboardByHackathonId(
  hackathonId?: string
): Promise<PublicLeaderboardEntry[]> {
  const board =
    safeGetItem<PublicLeaderboardEntry[]>(STORAGE_KEYS.LEADERBOARDS) ?? [];
  if (!hackathonId) return board;
  return board.filter((e) => e.hackathonId === hackathonId);
}

