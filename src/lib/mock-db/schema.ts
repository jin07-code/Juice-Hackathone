// 공개 가능한 필드만 포함하는 DTO 타입들입니다.
// 원본 JSON에는 더 많은 필드(예: 내부 메모, 비공개 연락처)가 있을 수 있지만
// 이 타입들에 포함되지 않은 필드는 모두 버려집니다.

export type PublicHackathon = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  status: "upcoming" | "ongoing" | "ended";
  // 썸네일과 태그는 공개 가능한 정보로만 구성
  thumbnailUrl?: string | null;
  tags?: string[];
  startDate: string;
  endDate: string;
  prizeSummary: string;
};

export type EvaluationMetric = {
  id: string;
  metricName: string;
  description: string;
  type: "vote" | "score";
  weight?: number;
};

export type HackathonMilestone = {
  id: string;
  title: string;
  date: string;
};

export type PrizeItem = {
  rankLabel: string;
  name: string;
  amount: number;
  description?: string;
};

export type SubmitArtifactType = "zip" | "url" | "pdf" | "image" | "other";

export type SubmitItemConfig = {
  key: string;
  title: string;
  format: string;
};

export type SubmitConfig = {
  guide: string[];
  allowedArtifactTypes: SubmitArtifactType[];
  submissionItems?: SubmitItemConfig[];
};

export type PublicHackathonDetail = PublicHackathon & {
  overviewMarkdown?: string;
  evaluationCriteria?: string[];
  schedule?: { label: string; date: string }[];
  prizes?: { name: string; amount: number }[];
  // 상세 페이지 전용 필드들
  teamPolicy?: string;
  teamPolicyMaxTeamSize?: number;
  notice?: string;
  links?: { label: string; url: string }[];
  evaluation?: {
    metrics: EvaluationMetric[];
  };
  scheduleDetail?: {
    milestones: HackathonMilestone[];
  };
  prize?: {
    items: PrizeItem[];
  };
  submit?: SubmitConfig;
};

export type PublicTeam = {
  id: string;
  name: string;
  hackathonId: string;
  memberCount: number;
  isOpen?: boolean;
  lookingFor?: string[];
  intro?: string;
  contactUrl?: string;
  createdAt?: string;
};

export type PublicLeaderboardEntry = {
  id: string;
  hackathonId: string;
  teamId: string;
  teamName: string;
  score: number;
  rank: number;
  submittedAt?: string;
  scoreBreakdown?: Record<string, number>;
  artifacts?: Record<string, string>;
};

export type HackathonSubmission = {
  id: string;
  hackathonId: string;
  hackathonSlug?: string;
  teamId: string;
  artifacts?: Record<string, string>;
  submittedAt: string;
};

// UI 편의를 위한 가공 데이터 타입
// - participantCount: teams 정보로부터 계산 (팀 개수)
// - periodText: 날짜 정보 가공 문자열
export type HackathonWithStats = PublicHackathon & {
  participantCount: number;
  periodText: string;
};

