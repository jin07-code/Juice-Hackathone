"use client";

import { STORAGE_KEYS, safeGetItem } from "../storage";
import type {
  HackathonWithStats,
  PublicHackathon,
  PublicHackathonDetail,
  PublicTeam,
} from "../schema";

function buildPeriodText(startDate: string, endDate: string): string {
  // 날짜 포맷은 단순 문자열로 처리 (실제 서비스에서 dayjs/date-fns 도입 가능)
  return `${startDate} ~ ${endDate}`;
}

/**
 * 해커톤 목록을 가져오면서 각 해커톤별 참가 팀 수를 계산합니다.
 * 참가 팀 수 = 해당 해커톤에 속한 팀들의 개수
 */
export async function getHackathons(): Promise<HackathonWithStats[]> {
  const hackathons =
    safeGetItem<PublicHackathon[]>(STORAGE_KEYS.HACKATHONS) ?? [];
  const teams = safeGetItem<PublicTeam[]>(STORAGE_KEYS.TEAMS) ?? [];

  const byHackathon: Record<string, number> = {};
  for (const team of teams) {
    // 팀 정보에는 비공개 정보가 있을 수 있지만,
    // 여기서는 팀 개수만 세므로 개인정보는 접근하지 않습니다.
    const current = byHackathon[team.hackathonId] ?? 0;
    byHackathon[team.hackathonId] = current + 1; // 팀 1개로 카운트
  }

  const withStats: HackathonWithStats[] = hackathons.map((h) => ({
    ...h,
    participantCount: byHackathon[h.id] ?? 0,
    periodText: buildPeriodText(h.startDate, h.endDate),
  }));

  return withStats;
}

export async function getHackathonBySlug(
  slug: string
): Promise<PublicHackathonDetail | null> {
  const list = safeGetItem<PublicHackathon[]>(STORAGE_KEYS.HACKATHONS) ?? [];
  const base = list.find((h) => h.slug === slug);
  if (!base) return null;

  const detailsMap =
    (safeGetItem<Record<string, PublicHackathonDetail>>("hackathon_detail") ??
      {}) as Record<string, PublicHackathonDetail>;

  const detail = Object.values(detailsMap).find((d) => d.id === base.id);
  if (!detail) {
    return {
      ...base,
    };
  }

  return detail;
}

// 상세 페이지 전용 Mock API
export async function getHackathonDetail(
  slug: string
): Promise<PublicHackathonDetail | null> {
  return getHackathonBySlug(slug);
}

