"use client";

import { useEffect, useState } from "react";
import { AsyncState } from "@/components/common/AsyncState";
import { getLeaderboard } from "@/lib/mock-db/api/rankings";
import { getHackathons } from "@/lib/mock-db/api/hackathons";
import type { PublicLeaderboardEntry, HackathonWithStats } from "@/lib/mock-db/schema";

// TODO: 실제 서버 연동 시, 리더보드에 노출되는 타 팀의 제출물(artifacts) 링크는 대회 주최자의 설정(공개/비공개)에 따라 서버단에서 엄격하게 필터링하여 내려주어야 함

interface RankingRowProps {
  entry: PublicLeaderboardEntry;
  hasDetails: boolean;
}

function RankingRow({ entry, hasDetails }: RankingRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return rank;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <tr 
        className={`border-t border-slate-800 ${hasDetails ? "cursor-pointer hover:bg-slate-800/50" : ""}`}
        onClick={hasDetails ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <td className="px-4 py-3">
          <span className="text-lg font-semibold">
            {getMedalIcon(entry.rank)}
          </span>
        </td>
        <td className="px-4 py-3">
          <span className="font-medium text-emerald-400">
            {entry.teamName}
          </span>
          {hasDetails && (
            <span className="ml-2 text-xs text-slate-400">
              {isExpanded ? "▼" : "▶"}
            </span>
          )}
        </td>
        <td className="px-4 py-3 font-mono font-semibold">
          {entry.score}
        </td>
        <td className="px-4 py-3 text-slate-300">
          {formatDate(entry.submittedAt)}
        </td>
      </tr>
      
      {hasDetails && isExpanded && (
        <tr className="bg-slate-800/30">
          <td colSpan={4} className="px-4 py-4">
            <div className="space-y-4">
              {entry.scoreBreakdown && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-slate-300">상세 점수</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(entry.scoreBreakdown).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm text-slate-400">{key}</span>
                        <span className="text-sm font-medium text-slate-200">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {entry.artifacts && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-slate-300">제출물</h4>
                  <div className="space-y-2">
                    {Object.entries(entry.artifacts).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-slate-400 capitalize">{key}</span>
                        {value.startsWith("http") ? (
                          <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-emerald-400 hover:text-emerald-300 hover:underline"
                          >
                            {key === "planTitle" ? value : "링크 보기"}
                          </a>
                        ) : (
                          <span className="text-sm text-slate-300">{value}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function SkeletonTable() {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900/60">
      <table className="min-w-full text-left text-xs">
        <thead className="bg-slate-900/80 text-slate-300">
          <tr>
            <th className="px-4 py-2">순위</th>
            <th className="px-4 py-2">팀명</th>
            <th className="px-4 py-2">총점</th>
            <th className="px-4 py-2">제출일시</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5].map((i) => (
            <tr key={i} className="border-t border-slate-800">
              <td className="px-4 py-3">
                <div className="h-4 w-4 animate-pulse rounded bg-slate-700"></div>
              </td>
              <td className="px-4 py-3">
                <div className="h-4 w-24 animate-pulse rounded bg-slate-700"></div>
              </td>
              <td className="px-4 py-3">
                <div className="h-4 w-16 animate-pulse rounded bg-slate-700"></div>
              </td>
              <td className="px-4 py-3">
                <div className="h-4 w-20 animate-pulse rounded bg-slate-700"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function RankingsPage() {
  const [selectedHackathon, setSelectedHackathon] = useState<string>("");
  const [leaderboardData, setLeaderboardData] = useState<PublicLeaderboardEntry[] | null>(null);
  const [hackathons, setHackathons] = useState<HackathonWithStats[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadHackathons = async () => {
      try {
        const hackathonList = await getHackathons();
        setHackathons(hackathonList);
        
        // 기본적으로 첫 번째 해커톤 선택
        if (hackathonList.length > 0) {
          setSelectedHackathon(hackathonList[0].slug);
        }
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    };

    loadHackathons();
  }, []);

  useEffect(() => {
    if (!selectedHackathon) return;

    const loadLeaderboard = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getLeaderboard(selectedHackathon);
        setLeaderboardData(data);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [selectedHackathon]);

  const handleRetry = () => {
    if (selectedHackathon) {
      const loadLeaderboard = async () => {
        setLoading(true);
        setError(null);
        
        try {
          const data = await getLeaderboard(selectedHackathon);
          setLeaderboardData(data);
        } catch (e) {
          setError(e as Error);
        } finally {
          setLoading(false);
        }
      };

      loadLeaderboard();
    }
  };

  return (
    <section className="w-full space-y-6">
      <div>
        <h1 className="text-xl font-semibold">글로벌 랭킹</h1>
        <p className="mt-1 text-sm text-slate-400">
          해커톤별 팀 순위와 점수를 확인하세요
        </p>
      </div>

      <div className="flex items-center space-x-4">
        <label htmlFor="hackathon-select" className="text-sm font-medium text-slate-300">
          해커톤 선택:
        </label>
        <select
          id="hackathon-select"
          value={selectedHackathon}
          onChange={(e) => setSelectedHackathon(e.target.value)}
          className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          disabled={isLoading}
        >
          {hackathons.map((hackathon) => (
            <option key={hackathon.slug} value={hackathon.slug}>
              {hackathon.title} ({hackathon.status === "ongoing" ? "진행 중" : hackathon.status === "ended" ? "종료" : "예정"})
            </option>
          ))}
        </select>
      </div>

      <AsyncState
        data={leaderboardData}
        isLoading={isLoading}
        error={error}
        isEmpty={(d) => d.length === 0}
        loadingFallback={<SkeletonTable />}
        emptyFallback={
          <div className="flex w-full justify-center py-10 text-sm text-slate-400">
            아직 해당 해커톤의 랭킹 데이터가 집계되지 않았습니다.
          </div>
        }
        errorFallback={(err) => (
          <div className="space-y-4">
            <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              데이터 로드에 실패했습니다: {err.message}
            </div>
            <button
              onClick={handleRetry}
              className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              재시도
            </button>
          </div>
        )}
      >
        {(entries) => (
          <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900/60">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-900/80 text-slate-300">
                <tr>
                  <th className="px-4 py-3 font-medium">순위</th>
                  <th className="px-4 py-3 font-medium">팀명</th>
                  <th className="px-4 py-3 font-medium">총점</th>
                  <th className="px-4 py-3 font-medium">제출일시</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <RankingRow
                    key={entry.id}
                    entry={entry}
                    hasDetails={!!(entry.scoreBreakdown || entry.artifacts)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AsyncState>
    </section>
  );
}

