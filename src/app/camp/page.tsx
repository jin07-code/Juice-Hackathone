"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AsyncState } from "@/components/common/AsyncState";
import { getTeamsByHackathon, createTeam } from "@/lib/mock-db/api/camp";
import { getHackathonDetail } from "@/lib/mock-db/api/hackathons";
import { useAuth } from "@/contexts/AuthContext";
import type { PublicHackathonDetail, PublicTeam } from "@/lib/mock-db/schema";

export default function CampPage() {
  const searchParams = useSearchParams();
  const hackathonSlug = searchParams.get("hackathon");
  const { user } = useAuth(); // 현재 로그인된 유저

  const [data, setData] = useState<PublicTeam[] | null>(null);
  const [hackathon, setHackathon] = useState<PublicHackathonDetail | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [onlyOpen, setOnlyOpen] = useState<boolean>(false);

  const [isCreateOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formName, setFormName] = useState("");
  const [formIntro, setFormIntro] = useState("");
  const [formPositions, setFormPositions] = useState("");
  const [formContactUrl, setFormContactUrl] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(null);

    const slug = hackathonSlug ?? undefined;

    Promise.all([
      getTeamsByHackathon(slug),
      slug ? getHackathonDetail(slug) : Promise.resolve(null),
    ])
      .then(([teams, detail]) => {
        setData(teams);
        setHackathon(detail);
      })
      .catch((e) => setError(e as Error))
      .finally(() => setLoading(false));
  }, [hackathonSlug]);

  const filteredTeams = useMemo(() => {
    if (!data) return null;
    if (!onlyOpen) return data;
    return data.filter((t) => t.isOpen !== false);
  }, [data, onlyOpen]);

  const maxTeamSize =
    hackathon?.teamPolicyMaxTeamSize != null
      ? hackathon.teamPolicyMaxTeamSize
      : 5;

  const handleRetry = () => {
    const slug = hackathonSlug ?? undefined;
    setLoading(true);
    setError(null);
    Promise.all([
      getTeamsByHackathon(slug),
      slug ? getHackathonDetail(slug) : Promise.resolve(null),
    ])
      .then(([teams, detail]) => {
        setData(teams);
        setHackathon(detail);
      })
      .catch((e) => setError(e as Error))
      .finally(() => setLoading(false));
  };

  const handleOpenContact = (url?: string) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 디버깅을 위한 콘솔 로그 추가
    console.log('팀 생성 시도:', {
      hackathonSlug,
      formName: formName.trim(),
      formIntro: formIntro.trim(),
      formContactUrl: formContactUrl.trim(),
    });
    
    if (!formName.trim() || !formIntro.trim() || !formContactUrl.trim()) {
      console.log('폼 유효성 실패: 필수 필드가 비어있음');
      return;
    }
    
    // hackathonSlug가 없으면 전체 팀으로 생성
    const targetHackathonSlug = hackathonSlug || "general";
    
    setCreating(true);
    try {
      const lookingFor = formPositions
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      
      console.log('팀 생성 API 호출:', {
        hackathonSlug: targetHackathonSlug,
        name: formName.trim(),
        intro: formIntro.trim(),
        lookingFor,
        contactUrl: formContactUrl.trim(),
      });
      
      await createTeam({
        hackathonSlug: targetHackathonSlug,
        name: formName.trim(),
        intro: formIntro.trim(),
        lookingFor,
        contactUrl: formContactUrl.trim(),
      });
      const teams = await getTeamsByHackathon(hackathonSlug || undefined);
      setData(teams);
      setCreateOpen(false);
      setFormName("");
      setFormIntro("");
      setFormPositions("");
      setFormContactUrl("");
      console.log('팀 생성 성공');
      // TODO: 실제 API 연동 시, 팀장이 직접 팀원 가입을 수락/거절하는 프로세스가 추가되어야 하며, 연락처(contact)는 수락된 팀원에게만 노출할지 공개 모집용으로 쓸지 정책 결정 필요
    } catch (e) {
      console.error('팀 생성 에러:', e);
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className="w-full space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">팀 찾기 (Camp)</h1>
          {hackathon && (
            <p className="mt-1 text-xs text-slate-400">
              {hackathon.title} · 최대 팀원 {maxTeamSize}명
            </p>
          )}
        </div>
        <button
          type="button"
          className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-700/70"
          onClick={() => {
            if (!user) {
              alert("로그인이 필요합니다.");
              return;
            }
            setCreateOpen(true);
          }}
          disabled={!user}
        >
          {user ? "팀 생성하기" : "로그인 필요"}
        </button>
      </div>

      <div className="flex items-center justify-between text-xs">
        <label className="inline-flex cursor-pointer items-center gap-2 text-slate-300">
          <input
            type="checkbox"
            className="h-3 w-3 rounded border-slate-600 bg-slate-900"
            checked={onlyOpen}
            onChange={(e) => setOnlyOpen(e.target.checked)}
          />
          <span>모집 중인 팀만 보기</span>
        </label>
      </div>

      <AsyncState
        data={filteredTeams}
        isLoading={isLoading}
        error={error}
        isEmpty={(d) => d.length === 0}
        loadingFallback={
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse rounded-lg border border-slate-800 bg-slate-900/60 p-4"
              >
                <div className="mb-2 h-4 w-1/3 rounded bg-slate-800" />
                <div className="mb-1 h-3 w-1/4 rounded bg-slate-800" />
                <div className="mb-1 h-3 w-2/3 rounded bg-slate-800" />
                <div className="h-3 w-1/2 rounded bg-slate-800" />
              </div>
            ))}
          </div>
        }
        emptyFallback={
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-6 py-10 text-sm text-slate-400">
            <span>
              아직 개설된 팀이 없습니다. 첫 번째 팀을 만들어 보세요!
            </span>
            <button
              type="button"
              className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-emerald-400"
              onClick={() => setCreateOpen(true)}
            >
              팀 생성하기
            </button>
          </div>
        }
        errorFallback={() => (
          <div className="flex flex-col gap-3 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            <span>팀 정보를 불러오지 못했습니다.</span>
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
        {(teams) => (
          <div className="grid gap-4 md:grid-cols-2">
            {teams.map((t) => {
              const isOpen = t.isOpen !== false;
              const badgeText = isOpen ? "모집 중" : "모집 마감";
              const badgeClass = isOpen
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                : "bg-slate-700/20 text-slate-300 border-slate-600/60";
              
              // 현재 유저가 이 팀의 멤버인지 확인
              const isMyTeam = user && t.members?.includes(user.id);
              
              return (
                <div
                  key={t.id}
                  className="flex flex-col rounded-lg border border-slate-800 bg-slate-900/60 p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h2 className="text-sm font-semibold text-slate-50">
                      {t.name}
                      {isMyTeam && (
                        <span className="ml-2 text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                          내 팀
                        </span>
                      )}
                    </h2>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${badgeClass}`}
                    >
                      {badgeText}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    인원: {t.memberCount}/{maxTeamSize}명
                  </p>
                  {t.lookingFor && t.lookingFor.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {t.lookingFor.map((pos) => (
                        <span
                          key={pos}
                          className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-200"
                        >
                          #{pos}
                        </span>
                      ))}
                    </div>
                  )}
                  {t.intro && (
                    <p className="mt-2 line-clamp-2 text-xs text-slate-300">
                      {t.intro}
                    </p>
                  )}
                  <div className="mt-3 flex justify-end">
                    {isMyTeam ? (
                      <button
                        type="button"
                        className="rounded-md bg-emerald-500 px-3 py-1.5 text-[11px] font-medium text-slate-900 hover:bg-emerald-400"
                        onClick={() => {
                          alert(`내 팀 "${t.name}" 정보 페이지 (개발 예정)`);
                        }}
                      >
                        내 팀 정보 보기
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={`rounded-md px-3 py-1.5 text-[11px] ${
                          isOpen
                            ? "cursor-pointer bg-slate-800 text-emerald-300 hover:bg-slate-700"
                            : "cursor-not-allowed bg-slate-900 text-slate-500"
                        }`}
                        onClick={() => handleOpenContact(t.contactUrl)}
                        disabled={!isOpen}
                      >
                        {isOpen ? "연락하기" : "모집 마감"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AsyncState>

      {isCreateOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="mb-3 flex items-center justify-between text-xs">
              <h2 className="text-sm font-semibold text-slate-100">
                새 팀 생성하기
              </h2>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-200"
                onClick={() => setCreateOpen(false)}
              >
                닫기
              </button>
            </div>
            <form className="space-y-3" onSubmit={handleSubmitCreate}>
              <div className="space-y-1 text-xs">
                <label className="text-slate-300">팀 이름</label>
                <input
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none focus:border-emerald-500"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1 text-xs">
                <label className="text-slate-300">한줄 소개</label>
                <textarea
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none focus:border-emerald-500"
                  rows={3}
                  value={formIntro}
                  onChange={(e) => setFormIntro(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1 text-xs">
                <label className="text-slate-300">
                  구하는 포지션 (쉼표로 구분)
                </label>
                <input
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none focus:border-emerald-500"
                  placeholder="예: Frontend, Designer"
                  value={formPositions}
                  onChange={(e) => setFormPositions(e.target.value)}
                />
              </div>
              <div className="space-y-1 text-xs">
                <label className="text-slate-300">
                  연락처 URL (오픈채팅 등)
                </label>
                <input
                  type="url"
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none focus:border-emerald-500"
                  placeholder="https://"
                  value={formContactUrl}
                  onChange={(e) => setFormContactUrl(e.target.value)}
                  required
                />
              </div>
              <div className="mt-3 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  className="rounded-md border border-slate-700 px-3 py-1.5 text-slate-300 hover:bg-slate-800"
                  onClick={() => setCreateOpen(false)}
                  disabled={creating}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-emerald-500 px-3 py-1.5 font-semibold text-slate-900 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-700/70"
                  disabled={creating}
                >
                  {creating ? "생성 중..." : "생성하기"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

