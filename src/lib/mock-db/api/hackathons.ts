"use client";

import { STORAGE_KEYS, safeGetItem } from "../storage";
import type { PublicHackathon, PublicHackathonDetail } from "../schema";

export async function getHackathons(): Promise<PublicHackathon[]> {
  const data = safeGetItem<PublicHackathon[]>(STORAGE_KEYS.HACKATHONS);
  return data ?? [];
}

export async function getHackathonBySlug(
  slug: string
): Promise<PublicHackathonDetail | null> {
  const list = await getHackathons();
  const base = list.find((h) => h.slug === slug);
  if (!base) return null;

  const detailsMap =
    (safeGetItem<Record<string, PublicHackathonDetail>>("hackathonDetails") ??
      {}) as Record<string, PublicHackathonDetail>;

  const detail = Object.values(detailsMap).find((d) => d.id === base.id);
  if (!detail) {
    return {
      ...base,
    };
  }

  return detail;
}

