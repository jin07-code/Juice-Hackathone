// 공개 가능한 필드만 포함하는 DTO 타입들입니다.
// 원본 JSON에는 더 많은 필드(예: 내부 메모, 비공개 연락처)가 있을 수 있지만
// 이 타입들에 포함되지 않은 필드는 모두 버려집니다.

export type PublicHackathon = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  status: "upcoming" | "ongoing" | "ended";
  startDate: string;
  endDate: string;
  prizeSummary: string;
};

export type PublicHackathonDetail = PublicHackathon & {
  overviewMarkdown?: string;
  evaluationCriteria?: string[];
  schedule?: { label: string; date: string }[];
  prizes?: { name: string; amount: number }[];
};

export type PublicTeam = {
  id: string;
  name: string;
  hackathonId: string;
  memberCount: number;
};

export type PublicLeaderboardEntry = {
  id: string;
  hackathonId: string;
  teamId: string;
  teamName: string;
  score: number;
  rank: number;
};

export type HackathonSubmission = {
  id: string;
  hackathonId: string;
  teamId: string;
  title: string;
  submittedAt: string;
};

