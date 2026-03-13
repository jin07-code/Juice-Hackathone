"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AsyncState } from "@/components/common/AsyncState";
import { getHackathonBySlug } from "@/lib/mock-db/api/hackathons";
import type { PublicHackathonDetail } from "@/lib/mock-db/schema";

export default function HackathonDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PublicHackathonDetail | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!slug) return;
    getHackathonBySlug(slug as string)
      .then((res) => setData(res))
      .catch((e) => setError(e as Error))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <section className="w-full space-y-6">
      <AsyncState
        data={data}
        isLoading={isLoading}
        error={error}
        emptyFallback={
          <div className="text-sm text-slate-400">
            해당 해커톤을 찾을 수 없습니다.
          </div>
        }
      >
        {(hackathon) => (
          <>
            <header>
              <h1 className="text-xl font-semibold">{hackathon.title}</h1>
              <p className="mt-1 text-sm text-slate-400">
                {hackathon.summary}
              </p>
            </header>

            <div className="grid gap-4 md:grid-cols-2">
              <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                <h2 className="mb-2 text-sm font-semibold">개요</h2>
                <p className="text-xs text-slate-400">
                  개요 섹션 콘텐츠가 들어갈 영역입니다.
                </p>
              </section>

              <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                <h2 className="mb-2 text-sm font-semibold">평가</h2>
                <p className="text-xs text-slate-400">
                  평가 기준 및 안내가 들어갈 영역입니다.
                </p>
              </section>

              <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                <h2 className="mb-2 text-sm font-semibold">일정</h2>
                <p className="text-xs text-slate-400">
                  타임라인/스케줄이 들어갈 영역입니다.
                </p>
              </section>

              <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                <h2 className="mb-2 text-sm font-semibold">상금</h2>
                <p className="text-xs text-slate-400">
                  상금 구조 및 수상 정보가 들어갈 영역입니다.
                </p>
              </section>

              <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                <h2 className="mb-2 text-sm font-semibold">팀</h2>
                <p className="text-xs text-slate-400">
                  참가 팀 리스트 및 팀 관리 UI 영역입니다.
                </p>
              </section>

              <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                <h2 className="mb-2 text-sm font-semibold">제출</h2>
                <p className="text-xs text-slate-400">
                  산출물 제출/수정 폼이 들어갈 영역입니다.
                </p>
              </section>

              <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 md:col-span-2">
                <h2 className="mb-2 text-sm font-semibold">리더보드</h2>
                <p className="text-xs text-slate-400">
                  해당 해커톤에 대한 팀별 순위표가 들어갈 영역입니다.
                </p>
              </section>
            </div>
          </>
        )}
      </AsyncState>
    </section>
  );
}

