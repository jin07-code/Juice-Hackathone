"use client";

import { STORAGE_KEYS, safeGetItem, safeSetItem } from "./storage";
import type {
  PublicHackathon,
  PublicHackathonDetail,
  PublicTeam,
  PublicLeaderboardEntry,
  HackathonSubmission,
} from "./schema";

export async function ensureMockDbSeeded() {
  if (typeof window === "undefined") return;

  const hasHackathons = !!safeGetItem<PublicHackathon[]>(STORAGE_KEYS.HACKATHONS);
  const hasTeams = !!safeGetItem<PublicTeam[]>(STORAGE_KEYS.TEAMS);
  const hasLeaderboards =
    !!safeGetItem<PublicLeaderboardEntry[]>(STORAGE_KEYS.LEADERBOARDS);
  const hasSubmissions =
    !!safeGetItem<HackathonSubmission[]>(STORAGE_KEYS.SUBMISSIONS);

  if (hasHackathons && hasTeams && hasLeaderboards && hasSubmissions) {
    return;
  }

  const [hackathonsRes, hackathonDetailRes, teamsRes, leaderboardRes] =
    await Promise.all([
      fetch("/public_hackathons.json"),
      fetch("/public_hackathon_detail.json"),
      fetch("/public_teams.json"),
      fetch("/public_leaderboard.json"),
    ]);

  if (!hackathonsRes.ok || !teamsRes.ok || !leaderboardRes.ok) {
    throw new Error("초기 데이터 로딩 실패");
  }

  const hackathonsRaw = await hackathonsRes.json();
  const hackathonDetailsRaw = await hackathonDetailRes.json();
  const teamsRaw = await teamsRes.json();
  const leaderboardRaw = await leaderboardRes.json();

  // ⚠️ 보안 정책:
  // - 원본 JSON에서 PublicXXX 타입에 정의되지 않은 필드는 이 단계에서 버립니다.
  //   (심사 메모, 비공개 연락처 등)
  const hackathons: PublicHackathon[] = hackathonsRaw.map(
    (item: any): PublicHackathon => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      summary: item.summary,
      status: item.status,
      startDate: item.startDate,
      endDate: item.endDate,
      prizeSummary: item.prizeSummary,
    })
  );

  // detail 은 id 기준으로 필요한 시점에 lookup 할 수 있도록 그대로 보관
  const detailsMap: Record<string, PublicHackathonDetail> = {};
  Object.entries(hackathonDetailsRaw || {}).forEach(([id, value]) => {
    const base = hackathons.find((h) => h.id === id);
    if (!base) return;
    const v: any = value;
    detailsMap[id] = {
      ...base,
      overviewMarkdown: v.overviewMarkdown,
      evaluationCriteria: v.evaluationCriteria ?? [],
      schedule: v.schedule ?? [],
      prizes: v.prizes ?? [],
    };
  });

  const teams: PublicTeam[] = teamsRaw.map(
    (item: any): PublicTeam => ({
      id: item.id,
      name: item.name,
      hackathonId: item.hackathonId,
      memberCount: item.memberCount,
    })
  );

  const leaderboards: PublicLeaderboardEntry[] = leaderboardRaw.map(
    (item: any): PublicLeaderboardEntry => ({
      id: item.id,
      hackathonId: item.hackathonId,
      teamId: item.teamId,
      teamName: item.teamName,
      score: item.score,
      rank: item.rank,
    })
  );

  const submissions: HackathonSubmission[] = [];

  safeSetItem(STORAGE_KEYS.HACKATHONS, hackathons);
  safeSetItem(STORAGE_KEYS.TEAMS, teams);
  safeSetItem(STORAGE_KEYS.LEADERBOARDS, leaderboards);
  safeSetItem(STORAGE_KEYS.SUBMISSIONS, submissions);
  safeSetItem("hackathonDetails", detailsMap);
}

