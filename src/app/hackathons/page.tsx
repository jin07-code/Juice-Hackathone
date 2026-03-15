"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AsyncState } from "@/components/common/AsyncState";
import { getHackathons } from "@/lib/mock-db/api/hackathons";
import type { HackathonWithStats } from "@/lib/mock-db/schema";

type StatusFilter = "all" | "ongoing" | "upcoming" | "ended";

const STATUS_LABEL: Record<Exclude<StatusFilter, "all">, string> = {
  ongoing: "진행중",
  upcoming: "예정",
  ended: "종료",
};

const STATUS_CLASS: Record<Exclude<StatusFilter, "all">, string> = {
  ongoing: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  upcoming: "bg-sky-500/20 text-sky-300 border-sky-500/40",
  ended: "bg-slate-600/20 text-slate-300 border-slate-500/40",
};

export default function HackathonsPage() {
  const [rawData, setRawData] = useState<HackathonWithStats[] | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");

  useEffect(() => {
    setLoading(true);
    setError(null);
    getHackathons()
      .then((res) => setRawData(res))
      .catch((e) => setError(e as Error))
      .finally(() => setLoading(false));
  }, []);

  const allTags = useMemo(() => {
    if (!rawData) return [];
    const tagSet = new Set<string>();
    rawData.forEach((h) => {
      h.tags?.forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet).sort();
  }, [rawData]);

  const filtered = useMemo(() => {
    if (!rawData) return null;
    return rawData.filter((h) => {
      const matchStatus =
        statusFilter === "all" ? true : h.status === statusFilter;
      const matchTag =
        tagFilter === "all"
          ? true
          : h.tags?.some((t) => t === tagFilter) ?? false;
      return matchStatus && matchTag;
    });
  }, [rawData, statusFilter, tagFilter]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    getHackathons()
      .then((res) => setRawData(res))
      .catch((e) => setError(e as Error))
      .finally(() => setLoading(false));
  };

  return (
    <section className="w-full space-y-4">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-xl font-semibold">해커톤 목록</h1>

        {/* 필터 영역 */}
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">상태</span>
            <select
              className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            >
              <option value="all">전체</option>
              <option value="ongoing">진행중</option>
              <option value="upcoming">예정</option>
              <option value="ended">종료</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">태그</span>
            <select
              className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1"
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
            >
              <option value="all">전체</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <AsyncState
        data={filtered}
        isLoading={isLoading}
        error={error}
        isEmpty={(d) => d.length === 0}
        loadingFallback={
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
              >
                <div className="mb-3 h-32 w-full rounded-xl bg-slate-800" />
                <div className="mb-2 h-4 w-2/3 rounded bg-slate-800" />
                <div className="mb-2 h-3 w-1/2 rounded bg-slate-800" />
                <div className="h-3 w-1/3 rounded bg-slate-800" />
              </div>
            ))}
          </div>
        }
        emptyFallback={
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-6 py-10 text-sm text-slate-400">
            <span>조건에 맞는 해커톤이 없습니다.</span>
            <button
              type="button"
              className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-emerald-500 hover:text-emerald-300"
              onClick={() => {
                setStatusFilter("all");
                setTagFilter("all");
              }}
            >
              필터 초기화
            </button>
          </div>
        }
        errorFallback={(err) => (
          <div className="flex flex-col gap-3 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            <span>데이터를 불러오는 중 오류가 발생했습니다.</span>
            <span className="text-xs text-red-200/80">
              {err.message ?? "알 수 없는 오류"}
            </span>
            <button
              type="button"
              className="self-start rounded-md border border-red-400 px-3 py-1 text-xs hover:bg-red-500/20"
              onClick={handleRetry}
            >
              다시 시도
            </button>
          </div>
        )}
      >
        {(hackathons) => (
          <div className="grid gap-4 md:grid-cols-3">
            {hackathons.map((h) => (
              <Link
                key={h.id}
                href={`/hackathons/${h.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-md shadow-slate-950/40 transition hover:-translate-y-1 hover:border-emerald-500/60 hover:bg-slate-900/90"
              >
                <div className="relative h-32 w-full overflow-hidden bg-slate-900">
                  {h.thumbnailUrl ? (
                    <Image
                      src={h.thumbnailUrl}
                      alt={h.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        // 이미지 깨질 경우 대체 배경
                        (e.currentTarget as HTMLImageElement).style.display =
                          "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-500">
                      썸네일 준비중
                    </div>
                  )}
                  <div className="pointer-events-none absolute left-3 top-3 flex gap-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                        STATUS_CLASS[h.status]
                      }`}
                    >
                      {STATUS_LABEL[h.status]}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h2 className="line-clamp-2 text-sm font-semibold text-slate-50">
                    {h.title}
                  </h2>
                  <p className="line-clamp-2 text-xs text-slate-400">
                    {h.summary}
                  </p>

                  {h.tags && h.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {h.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto flex flex-col gap-1 pt-2 text-[11px] text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">기간</span>
                      <span>{h.periodText}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">참가 팀 수</span>
                      <span>{h.participantCount.toLocaleString()}팀</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </AsyncState>
    </section>
  );
}

