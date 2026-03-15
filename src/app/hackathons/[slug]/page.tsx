"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AsyncState } from "@/components/common/AsyncState";
import { STORAGE_KEYS, safeGetItem, safeSetItem } from "@/lib/mock-db/storage";
import { getHackathonDetail } from "@/lib/mock-db/api/hackathons";
import { getLeaderboardByHackathonId } from "@/lib/mock-db/api/rankings";
import type {
  PublicHackathonDetail,
  PublicLeaderboardEntry,
  SubmitArtifactType,
} from "@/lib/mock-db/schema";

type SectionId =
  | "overview"
  | "eval"
  | "schedule"
  | "prize"
  | "teams"
  | "submit"
  | "leaderboard";

const sectionDefs: { id: SectionId; label: string }[] = [
  { id: "overview", label: "개요/안내" },
  { id: "eval", label: "평가" },
  { id: "schedule", label: "일정" },
  { id: "prize", label: "상금" },
  { id: "teams", label: "팀" },
  { id: "submit", label: "제출" },
  { id: "leaderboard", label: "리더보드" },
];

function computeDdayLabel(detail: PublicHackathonDetail): string {
  const now = new Date();
  const start = new Date(detail.startDate);
  const end = new Date(detail.endDate);

  if (now > end) return "종료됨";
  if (now >= start && now <= end) {
    const diffMs = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return `진행중 · D-${diffDays}`;
  }
  const diffMs = start.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return `예정 · D-${diffDays}`;
}

export default function HackathonDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PublicHackathonDetail | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [leaderboardPreview, setLeaderboardPreview] = useState<
    PublicLeaderboardEntry[]
  >([]);
  const [isLeaderboardLoading, setLeaderboardLoading] = useState(false);

  const [activeSection, setActiveSection] = useState<SectionId>("overview");
  const [submitType, setSubmitType] = useState<SubmitArtifactType | null>(null);
  const [isLeaderboardModalOpen, setLeaderboardModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitErrors, setSubmitErrors] = useState<Record<string, string>>({});
  const [submitValues, setSubmitValues] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const sectionRefs = useRef<Record<SectionId, HTMLElement | null>>({
    overview: null,
    eval: null,
    schedule: null,
    prize: null,
    teams: null,
    submit: null,
    leaderboard: null,
  });

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    setNotFound(false);

    getHackathonDetail(slug as string)
      .then(async (detail) => {
        if (!detail) {
          setNotFound(true);
          return;
        }
        setData(detail);
        setSubmitType(
          detail.submit?.allowedArtifactTypes?.[0] ?? null
        );

        // 리더보드 상위 5팀 미리보기
        setLeaderboardLoading(true);
        try {
          const entries = await getLeaderboardByHackathonId(detail.id);
          const sorted = [...entries].sort((a, b) => a.rank - b.rank);
          setLeaderboardPreview(sorted.slice(0, 5));
        } finally {
          setLeaderboardLoading(false);
        }
      })
      .catch((e) => setError(e as Error))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id as SectionId;
            setActiveSection(id);
            break;
          }
        }
      },
      {
        rootMargin: "-120px 0px -60% 0px",
        threshold: 0.2,
      }
    );

    const els: HTMLElement[] = [];
    sectionDefs.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) {
        els.push(el);
        observer.observe(el);
      }
    });

    return () => {
      els.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);

  const scrollToSection = useCallback((id: SectionId) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const hasTeam = false; // 가상의 상태값으로 분기 테스트 (추후 실제 팀 상태와 연동)

  const headerSkeleton = (
    <div className="space-y-4">
      <div className="h-6 w-1/3 rounded bg-slate-800" />
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="h-40 w-full rounded-xl bg-slate-800 md:w-1/2" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded bg-slate-800" />
          <div className="h-4 w-1/2 rounded bg-slate-800" />
          <div className="h-4 w-1/3 rounded bg-slate-800" />
        </div>
      </div>
    </div>
  );

  if (notFound && !isLoading && !error) {
    return (
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 py-10 text-center">
        <h1 className="text-lg font-semibold text-slate-50">
          존재하지 않는 해커톤입니다
        </h1>
        <p className="text-sm text-slate-400">
          링크가 잘못되었거나 삭제된 해커톤일 수 있습니다.
        </p>
        <Link
          href="/hackathons"
          className="mt-2 rounded-md bg-slate-800 px-4 py-2 text-sm text-slate-100 hover:bg-emerald-500 hover:text-slate-900"
        >
          해커톤 목록으로 돌아가기
        </Link>
      </section>
    );
  }

  return (
    <section className="w-full space-y-6">
      <AsyncState
        data={data}
        isLoading={isLoading}
        error={error}
        loadingFallback={
          <div className="space-y-6">
            {headerSkeleton}
            <div className="sticky top-0 z-10 -mx-4 border-b border-slate-800 bg-slate-950/90 px-4 py-2 backdrop-blur">
              <div className="flex gap-2 overflow-x-auto text-xs text-slate-500">
                {sectionDefs.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-full bg-slate-900 px-3 py-1"
                  >
                    {s.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-32 rounded-lg border border-slate-800 bg-slate-900/60"
                />
              ))}
            </div>
          </div>
        }
      >
        {(hackathon) => {
          const ddayLabel = computeDdayLabel(hackathon);
          const submit = hackathon.submit;
          const activeSubmitType =
            submitType ?? submit?.allowedArtifactTypes?.[0] ?? null;

          const milestones =
            hackathon.scheduleDetail?.milestones ??
            hackathon.schedule?.map((s, idx) => ({
              id: String(idx),
              title: s.label,
              date: s.date,
            })) ??
            [];

          const now = new Date();

          const handleChangeSubmitValue = (key: string, value: string) => {
            setSubmitValues((prev) => ({ ...prev, [key]: value }));
            setSubmitErrors((prev) => {
              const next = { ...prev };
              delete next[key];
              return next;
            });
          };

          const handleFinalSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!submit || !slug) return;

            const items = submit.submissionItems ?? [];
            const nextErrors: Record<string, string> = {};

            items.forEach((item) => {
              const v = submitValues[item.key];
              if (!v || !v.trim()) {
                nextErrors[item.key] = "필수 항목입니다.";
              }
            });

            if (Object.keys(nextErrors).length > 0) {
              setSubmitErrors(nextErrors);
              return;
            }

            setIsSubmitting(true);
            try {
              const existing =
                safeGetItem<any[]>(STORAGE_KEYS.SUBMISSIONS) ?? [];
              const id = `sub-${Date.now().toString(36)}-${Math.random()
                .toString(36)
                .slice(2, 6)}`;
              const record = {
                id,
                hackathonId: hackathon.id,
                hackathonSlug: hackathon.slug,
                teamId: "temp-team-id",
                artifacts: { ...submitValues },
                submittedAt: new Date().toISOString(),
              };

              // TODO: 실제 서버 연동 시, 제출 권한(해당 팀의 리더인지) 확인 및 타 팀 제출물 접근 차단(CORS, 인증 토큰 등) 로직이 백엔드 단에서 반드시 이루어져야 함

              safeSetItem(STORAGE_KEYS.SUBMISSIONS, [...existing, record]);
              setIsSubmitted(true);
              setToastMessage("성공적으로 제출되었습니다.");
              setTimeout(() => setToastMessage(null), 3000);
            } finally {
              setIsSubmitting(false);
            }
          };

          const buildAcceptAttr = () => {
            if (!submit?.allowedArtifactTypes?.length) return undefined;
            const exts: string[] = [];
            submit.allowedArtifactTypes.forEach((t) => {
              if (t === "pdf") exts.push(".pdf", "application/pdf");
              if (t === "zip") exts.push(".zip", "application/zip");
              if (t === "image") exts.push("image/*");
            });
            return exts.join(",");
          };

          return (
            <>
              {/* 헤더 영역 */}
              <header className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start">
                    <div className="flex-1 space-y-2">
                      <h1 className="text-xl font-semibold text-slate-50">
                        {hackathon.title}
                      </h1>
                      <p className="text-sm text-slate-400">
                        {hackathon.summary}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-300">
                          {ddayLabel}
                        </span>
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300">
                          {hackathon.startDate} ~ {hackathon.endDate}
                        </span>
                      </div>
                    </div>
                    <div className="relative h-32 w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900 md:h-40 md:w-64">
                      {hackathon.thumbnailUrl ? (
                        <Image
                          src={hackathon.thumbnailUrl}
                          alt={hackathon.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-slate-500">
                          썸네일 준비중
                        </div>
                      )}
                    </div>
                  </div>
                  <Link
                    href="/hackathons"
                    className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:border-emerald-500 hover:text-emerald-300"
                  >
                    목록으로
                  </Link>
                </div>
              </header>

              {/* Sticky 탭 네비게이션 */}
              <nav className="sticky top-0 z-10 -mx-4 border-b border-slate-800 bg-slate-950/90 px-4 py-2 backdrop-blur">
                <div className="flex gap-2 overflow-x-auto text-xs">
                  {sectionDefs.map((section) => {
                    const active = activeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => scrollToSection(section.id)}
                        className={`whitespace-nowrap rounded-full px-3 py-1 transition-colors ${
                          active
                            ? "bg-emerald-500 text-slate-900"
                            : "bg-slate-900 text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        {section.label}
                      </button>
                    );
                  })}
                </div>
              </nav>

              <div className="space-y-6">
                {/* 1. 개요 / 안내 */}
                <section
                  id="overview"
                  ref={(el) => {
    sectionRefs.current.overview = el;
  }}
                  className="rounded-lg border border-slate-800 bg-slate-900/60 p-4"
                >
                  <h2 className="mb-3 text-sm font-semibold text-slate-50">
                    개요 / 안내
                  </h2>
                  <div className="space-y-2 text-xs text-slate-300">
                    {hackathon.teamPolicy && (
                      <p>
                        <span className="font-semibold text-slate-200">
                          팀 정책:
                        </span>{" "}
                        {hackathon.teamPolicy}
                      </p>
                    )}
                    {hackathon.notice && (
                      <p>
                        <span className="font-semibold text-slate-200">
                          공지:
                        </span>{" "}
                        {hackathon.notice}
                      </p>
                    )}
                    {hackathon.links && hackathon.links.length > 0 && (
                      <div className="pt-1">
                        <p className="mb-1 text-slate-200">관련 링크</p>
                        <div className="flex flex-wrap gap-2">
                          {hackathon.links.map((link) => (
                            <a
                              key={link.url}
                              href={link.url}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-md bg-slate-800 px-3 py-1 text-xs text-emerald-300 hover:bg-slate-700"
                            >
                              {link.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* 2. 평가 */}
                <section
                  id="eval"
                  ref={(el) => {
    sectionRefs.current.eval = el;
  }}
                  className="rounded-lg border border-slate-800 bg-slate-900/60 p-4"
                >
                  <h2 className="mb-3 text-sm font-semibold text-slate-50">
                    평가
                  </h2>
                  <div className="space-y-3 text-xs text-slate-300">
                    {hackathon.evaluation?.metrics?.length ? (
                      <>
                        <ul className="space-y-2">
                          {hackathon.evaluation.metrics.map((m) => (
                            <li
                              key={m.id}
                              className="rounded-md border border-slate-800 bg-slate-900 px-3 py-2"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-slate-100">
                                  {m.metricName}
                                </span>
                                {m.type === "vote" && m.weight != null && (
                                  <span className="text-[10px] text-emerald-300">
                                    가중치 {m.weight}%
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-[11px] text-slate-400">
                                {m.description}
                              </p>
                            </li>
                          ))}
                        </ul>
                        {/* vote 유형의 가중치 비율 미니 차트 */}
                        {hackathon.evaluation.metrics.some(
                          (m) => m.type === "vote" && m.weight
                        ) && (
                          <div className="mt-3 space-y-1">
                            <p className="text-[11px] text-slate-400">
                              투표 기반 가중치
                            </p>
                            <div className="flex h-3 overflow-hidden rounded-full bg-slate-800">
                              {hackathon.evaluation.metrics
                                .filter((m) => m.type === "vote" && m.weight)
                                .map((m) => (
                                  <div
                                    key={m.id}
                                    className="h-full bg-emerald-500"
                                    style={{ width: `${m.weight}%` }}
                                    title={`${m.metricName} ${m.weight}%`}
                                  />
                                ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-slate-400">
                        평가 기준 정보가 아직 등록되지 않았습니다.
                      </p>
                    )}
                  </div>
                </section>

                {/* 3. 일정 */}
                <section
                  id="schedule"
                  ref={(el) => {
    sectionRefs.current.schedule = el;
  }}
                  className="rounded-lg border border-slate-800 bg-slate-900/60 p-4"
                >
                  <h2 className="mb-3 text-sm font-semibold text-slate-50">
                    일정
                  </h2>
                  {milestones.length === 0 ? (
                    <p className="text-xs text-slate-400">
                      일정 정보가 아직 등록되지 않았습니다.
                    </p>
                  ) : (
                    <ol className="relative border-l border-slate-700 pl-4 text-xs">
                      {milestones.map((m) => {
                        const date = new Date(m.date);
                        const past = date < now;
                        return (
                          <li
                            key={m.id}
                            className="mb-4 last:mb-0"
                          >
                            <div
                              className={`absolute -left-[7px] mt-1 h-3 w-3 rounded-full border ${
                                past
                                  ? "border-slate-500 bg-slate-700"
                                  : "border-emerald-400 bg-emerald-500"
                              }`}
                            />
                            <p
                              className={`text-[11px] ${
                                past ? "text-slate-400" : "text-emerald-300"
                              }`}
                            >
                              {m.title}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {m.date}
                            </p>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </section>

                {/* 4. 상금 */}
                <section
                  id="prize"
                  ref={(el) => {
    sectionRefs.current.prize = el;
  }}
                  className="rounded-lg border border-slate-800 bg-slate-900/60 p-4"
                >
                  <h2 className="mb-3 text-sm font-semibold text-slate-50">
                    상금
                  </h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    {hackathon.prize?.items?.length ? (
                      hackathon.prize.items.map((item) => (
                        <div
                          key={item.rankLabel}
                          className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3"
                        >
                          <p className="text-xs font-semibold text-amber-300">
                            {item.rankLabel}
                          </p>
                          <p className="text-sm text-slate-100">
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-300">
                            {item.amount.toLocaleString()}원
                          </p>
                          {item.description && (
                            <p className="mt-1 text-[11px] text-slate-400">
                              {item.description}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400">
                        상금 정보가 아직 등록되지 않았습니다.
                      </p>
                    )}
                  </div>
                </section>

                {/* 5. 팀 */}
                <section
                  id="teams"
                  ref={(el) => {
    sectionRefs.current.teams = el;
  }}
                  className="rounded-lg border border-slate-800 bg-slate-900/60 p-4"
                >
                  <h2 className="mb-3 text-sm font-semibold text-slate-50">
                    팀
                  </h2>
                  <div className="flex flex-col gap-3 text-xs text-slate-300">
                    {hasTeam ? (
                      <>
                        <p>
                          이 해커톤에 참가 중인 내 팀이 있습니다. 팀 정보
                          페이지에서 상세 내용을 확인할 수 있습니다.
                        </p>
                        <button
                          type="button"
                          className="self-start rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-medium text-slate-900 hover:bg-emerald-400"
                        >
                          내 팀 정보 보기
                        </button>
                      </>
                    ) : (
                      <>
                        <p>
                          아직 이 해커톤에 참가 중인 팀이 없습니다. 팀을
                          구성하거나, 다른 팀에 합류해보세요.
                        </p>
                        {/* TODO: 실제 API 연동 시 타 팀의 제출물이나 내부 정보가 노출되지 않도록 서버단 권한 체크 필요 */}
                        <Link
                          href={`/camp?hackathon=${hackathon.slug}`}
                          className="inline-flex items-center justify-center rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500 hover:text-slate-900"
                        >
                          이 해커톤 팀 구성/찾기
                        </Link>
                      </>
                    )}
                  </div>
                </section>

                {/* 6. 제출 */}
                <section
                  id="submit"
                  ref={(el) => {
    sectionRefs.current.submit = el;
  }}
                  className="rounded-lg border border-slate-800 bg-slate-900/60 p-4"
                >
                  <h2 className="mb-3 text-sm font-semibold text-slate-50">
                    제출
                  </h2>
                  {submit ? (
                    <div className="space-y-4 text-xs text-slate-300">
                      {submit.guide?.length ? (
                        <ul className="list-disc space-y-1 pl-4 text-[11px] text-slate-300">
                          {submit.guide.map((g, idx) => (
                            <li key={idx}>{g}</li>
                          ))}
                        </ul>
                      ) : null}

                      {!hasTeam ? (
                        <div className="mt-3 space-y-3 rounded-md border border-slate-800 bg-slate-900 px-3 py-3">
                          <p className="text-xs text-slate-300">
                            제출하려면 먼저 팀을 구성해야 합니다.
                          </p>
                          <Link
                            href={`/camp?hackathon=${hackathon.slug}`}
                            className="inline-flex items-center justify-center rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500 hover:text-slate-900"
                          >
                            팀 구성하러 가기
                          </Link>
                        </div>
                      ) : (
                        <>
                          {submit.submissionItems &&
                            submit.submissionItems.length > 0 && (
                              <form
                                className="space-y-3"
                                onSubmit={handleFinalSubmit}
                              >
                                {submit.submissionItems.map((item) => {
                                  const value = submitValues[item.key] ?? "";
                                  const errorMsg =
                                    submitErrors[item.key] ?? "";
                                  const format = (item.format || "").toLowerCase();
                                  const isFile =
                                    format.includes("pdf") ||
                                    format.includes("file");
                                  const isUrlField =
                                    format.includes("url") ||
                                    format === "text_or_url";

                                  return (
                                    <div key={item.key} className="space-y-1">
                                      <label className="text-xs text-slate-300">
                                        {item.title}
                                      </label>
                                      {isFile ? (
                                        <input
                                          type="file"
                                          className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-[11px] text-slate-100 outline-none file:mr-2 file:rounded-md file:border-0 file:bg-slate-700 file:px-2 file:py-1 file:text-[11px] file:text-slate-100 focus:border-emerald-500"
                                          accept={buildAcceptAttr()}
                                          disabled={isSubmitting}
                                          onChange={(e) =>
                                            handleChangeSubmitValue(
                                              item.key,
                                              e.target.value
                                            )
                                          }
                                        />
                                      ) : (
                                        <input
                                          type={isUrlField ? "url" : "text"}
                                          className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none focus:border-emerald-500"
                                          value={value}
                                          onChange={(e) =>
                                            handleChangeSubmitValue(
                                              item.key,
                                              e.target.value
                                            )
                                          }
                                          disabled={isSubmitting}
                                          placeholder={
                                            isUrlField ? "https://..." : ""
                                          }
                                        />
                                      )}
                                      {errorMsg && (
                                        <p className="text-[11px] text-red-400">
                                          {errorMsg}
                                        </p>
                                      )}
                                    </div>
                                  );
                                })}
                                <button
                                  type="submit"
                                  className="mt-2 inline-flex items-center justify-center rounded-md bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-700/70"
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting
                                    ? "제출 중..."
                                    : isSubmitted
                                    ? "수정하기"
                                    : "최종 제출하기"}
                                </button>
                              </form>
                            )}
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">
                      제출 가이드가 아직 등록되지 않았습니다.
                    </p>
                  )}
                </section>

                {/* 7. 리더보드 (미리보기) */}
                <section
                  id="leaderboard"
                  ref={(el) => {
    sectionRefs.current.leaderboard = el;
  }}
                  className="rounded-lg border border-slate-800 bg-slate-900/60 p-4"
                >
                  <h2 className="mb-3 text-sm font-semibold text-slate-50">
                    리더보드 미리보기
                  </h2>
                  {isLeaderboardLoading ? (
                    <p className="text-xs text-slate-400">
                      리더보드를 불러오는 중입니다...
                    </p>
                  ) : leaderboardPreview.length === 0 ? (
                    <p className="text-xs text-slate-400">
                      아직 리더보드 정보가 없습니다.
                    </p>
                  ) : (
                    <>
                      <div className="overflow-hidden rounded-md border border-slate-800">
                        <table className="min-w-full text-left text-[11px]">
                          <thead className="bg-slate-900 text-slate-300">
                            <tr>
                              <th className="px-3 py-2">순위</th>
                              <th className="px-3 py-2">팀</th>
                              <th className="px-3 py-2">점수</th>
                            </tr>
                          </thead>
                          <tbody>
                            {leaderboardPreview.map((row) => (
                              <tr
                                key={row.id}
                                className="border-t border-slate-800"
                              >
                                <td className="px-3 py-1.5">{row.rank}</td>
                                <td className="px-3 py-1.5 text-emerald-300">
                                  {row.teamName}
                                </td>
                                <td className="px-3 py-1.5">
                                  {row.score}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <button
                        type="button"
                        className="mt-3 inline-flex items-center justify-center rounded-md border border-slate-700 px-3 py-1.5 text-[11px] text-slate-200 hover:border-emerald-500 hover:text-emerald-300"
                        onClick={() => setLeaderboardModalOpen(true)}
                      >
                        전체 리더보드 보기
                      </button>
                    </>
                  )}
                </section>
              </div>

              {/* 리더보드 전체 보기 모달 */}
              {isLeaderboardModalOpen && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
                  <div className="max-h-[80vh] w-full max-w-lg overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                    <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 text-xs">
                      <span className="font-semibold text-slate-100">
                        전체 리더보드
                      </span>
                      <button
                        type="button"
                        className="text-slate-400 hover:text-slate-200"
                        onClick={() => setLeaderboardModalOpen(false)}
                      >
                        닫기
                      </button>
                    </div>
                    <div className="max-h-[70vh] overflow-auto p-4">
                      {leaderboardPreview.length === 0 ? (
                        <p className="text-xs text-slate-400">
                          아직 리더보드 정보가 없습니다.
                        </p>
                      ) : (
                        <table className="min-w-full text-left text-[11px]">
                          <thead className="bg-slate-900 text-slate-300">
                            <tr>
                              <th className="px-3 py-2">순위</th>
                              <th className="px-3 py-2">팀</th>
                              <th className="px-3 py-2">점수</th>
                            </tr>
                          </thead>
                          <tbody>
                            {leaderboardPreview.map((row) => (
                              <tr
                                key={row.id}
                                className="border-t border-slate-800"
                              >
                                <td className="px-3 py-1.5">{row.rank}</td>
                                <td className="px-3 py-1.5 text-emerald-300">
                                  {row.teamName}
                                </td>
                                <td className="px-3 py-1.5">
                                  {row.score}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {toastMessage && (
                <div className="fixed bottom-4 right-4 z-50 rounded-md bg-slate-900 px-4 py-2 text-xs text-emerald-300 shadow-lg shadow-black/40">
                  {toastMessage}
                </div>
              )}
            </>
          );
        }}
      </AsyncState>
    </section>
  );
}

