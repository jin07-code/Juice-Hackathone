"use client";

import { STORAGE_KEYS, safeGetItem, safeSetItem } from "./storage";
import type {
  PublicHackathon,
  PublicHackathonDetail,
  PublicTeam,
  PublicLeaderboardEntry,
  HackathonSubmission,
  PrizeItem,
  EvaluationMetric,
  HackathonMilestone,
  SubmitArtifactType,
} from "./schema";

// 제공된 예시 JSON을 직접 import 해서 사용합니다.
// JSON 파일 자체는 수정하지 않고, 여기서 PublicXXX 타입으로 매핑합니다.
// 경로: ./data/예시자료/*.json
// eslint-disable-next-line @typescript-eslint/no-var-requires
import hackathonsJson from "../../../data/예시자료/public_hackathons.json";
// eslint-disable-next-line @typescript-eslint/no-var-requires
import hackathonDetailJson from "../../../data/예시자료/public_hackathon_detail.json";
// eslint-disable-next-line @typescript-eslint/no-var-requires
import teamsJson from "../../../data/예시자료/public_teams.json";
// eslint-disable-next-line @typescript-eslint/no-var-requires
import leaderboardJson from "../../../data/예시자료/public_leaderboard.json";

function mapArtifactType(raw: string): SubmitArtifactType {
  if (raw === "zip") return "zip";
  if (raw === "url") return "url";
  if (raw === "pdf") return "pdf";
  if (raw === "image") return "image";
  return "other";
}

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

  // ⚠️ 보안 정책:
  // - 원본 JSON에서 PublicXXX 타입에 정의되지 않은 필드는 이 단계에서 버립니다.
  //   (심사 메모, 비공개 연락처 등)

  // 1) 해커톤 목록 매핑 (id 는 slug 기반으로 생성)
  const hackathons: PublicHackathon[] = (hackathonsJson as any[]).map(
    (item: any): PublicHackathon => ({
      id: item.slug,
      slug: item.slug,
      title: item.title,
      summary: "", // 상세 JSON 에서 summary 를 보강
      status: item.status,
      thumbnailUrl: item.thumbnailUrl ?? null,
      tags: item.tags ?? [],
      startDate: item.period?.submissionDeadlineAt ?? "",
      endDate: item.period?.endAt ?? "",
      prizeSummary: "", // 예시 데이터에는 별도 상금 요약이 없어 비워둡니다.
    })
  );

  // 2) 상세 정보 매핑 (slug 기준)
  const detailsMap: Record<string, PublicHackathonDetail> = {};

  const primarySlug = (hackathonDetailJson as any).slug as string | undefined;
  const primarySections = (hackathonDetailJson as any).sections as any;
  const extraDetails = ((hackathonDetailJson as any).extraDetails ??
    []) as any[];

  const allDetails = [
    ...(primarySlug ? [{ slug: primarySlug, sections: primarySections }] : []),
    ...extraDetails.map((d) => ({ slug: d.slug, sections: d.sections })),
  ];

  allDetails.forEach(({ slug, sections }) => {
    const base = hackathons.find((h) => h.slug === slug);
    if (!base) return;

    const overview = sections.overview ?? {};
    const info = sections.info ?? {};
    const evalSection = sections.eval ?? {};
    const scheduleSection = sections.schedule ?? {};
    const prizeSection = sections.prize ?? {};
    const submitSection = sections.submit ?? {};

    const noticeArr: string[] = info.notice ?? [];
    const guideArr: string[] = submitSection.guide ?? [];

    const metrics: EvaluationMetric[] = [];

    // eval: 기본 메트릭
    if (evalSection.metricName) {
      metrics.push({
        id: "main",
        metricName: evalSection.metricName,
        description: evalSection.description ?? "",
        type: evalSection.scoreSource === "vote" ? "vote" : "score",
        weight: undefined,
      });
    }

    // eval: scoreDisplay.breakdown 을 vote 가중치로 변환
    const breakdown: any[] =
      evalSection.scoreDisplay?.breakdown ?? [];
    breakdown.forEach((b: any, index: number) => {
      metrics.push({
        id: `vote-${index}`,
        metricName: b.label ?? b.key ?? `metric-${index + 1}`,
        description: "",
        type: "vote",
        weight: b.weightPercent,
      });
    });

    // schedule: milestones
    const milestones: HackathonMilestone[] = (scheduleSection.milestones ??
      []
    ).map((m: any, index: number) => ({
      id: m.id ?? `${slug}-ms-${index}`,
      title: m.name,
      date: m.at,
    }));

    // prize: items
    const prizeItems: PrizeItem[] = (prizeSection.items ?? []).map(
      (p: any) => ({
        rankLabel: p.place,
        name: p.place,
        amount: p.amountKRW,
        description: undefined,
      })
    );

    // submit: allowedArtifactTypes
    const allowedArtifactTypes: SubmitArtifactType[] = (
      submitSection.allowedArtifactTypes ?? []
    ).map((t: string) => mapArtifactType(t));

    const links: { label: string; url: string }[] = [];
    if (info.links?.rules) {
      links.push({ label: "규정 보기", url: info.links.rules });
    }
    if (info.links?.faq) {
      links.push({ label: "FAQ", url: info.links.faq });
    }

    detailsMap[slug] = {
      ...base,
      overviewMarkdown: overview.summary,
      evaluationCriteria: [],
      schedule: [],
      prizes: [],
      teamPolicy: overview.teamPolicy
        ? `솔로 참가 ${
            overview.teamPolicy.allowSolo ? "가능" : "불가"
          }, 최대 ${overview.teamPolicy.maxTeamSize}명`
        : undefined,
      notice: noticeArr.join(" "),
      links,
      evaluation: {
        metrics,
      },
      scheduleDetail: {
        milestones,
      },
      prize: {
        items: prizeItems,
      },
      submit: allowedArtifactTypes.length
        ? {
            guide: guideArr.join("\n"),
            allowedArtifactTypes,
          }
        : undefined,
    };
  });

  // summary 는 overview 에서 보강
  hackathons.forEach((h) => {
    const detail = detailsMap[h.slug];
    if (detail?.overviewMarkdown) {
      h.summary = detail.overviewMarkdown;
    }
  });

  // 3) 팀 정보 매핑
  const teams: PublicTeam[] = (teamsJson as any[]).map(
    (item: any): PublicTeam => ({
      id: item.teamCode,
      name: item.name,
      // hackathonSlug 를 hackathonId 로 사용 (slug 기반)
      hackathonId: item.hackathonSlug,
      memberCount: item.memberCount,
    })
  );

  // 4) 리더보드 매핑
  const leaderboards: PublicLeaderboardEntry[] = [];

  function pushLeaderboardSet(obj: any) {
    const slug = obj.hackathonSlug as string;
    (obj.entries ?? []).forEach((entry: any) => {
      leaderboards.push({
        id: `${slug}-${entry.rank}`,
        hackathonId: slug,
        // 팀 ID 는 별도 식별자가 없어 teamName 기반으로 생성
        teamId: `${slug}-${entry.teamName}`,
        teamName: entry.teamName,
        score: entry.score,
        rank: entry.rank,
      });
    });
  }

  pushLeaderboardSet(leaderboardJson as any);
  ((leaderboardJson as any).extraLeaderboards ?? []).forEach(
    (extra: any) => pushLeaderboardSet(extra)
  );

  const submissions: HackathonSubmission[] = [];

  safeSetItem(STORAGE_KEYS.HACKATHONS, hackathons);
  safeSetItem(STORAGE_KEYS.TEAMS, teams);
  safeSetItem(STORAGE_KEYS.LEADERBOARDS, leaderboards);
  safeSetItem(STORAGE_KEYS.SUBMISSIONS, submissions);
  // 상세 정보는 별도 키로 관리합니다.
  safeSetItem("hackathon_detail", detailsMap);
}

