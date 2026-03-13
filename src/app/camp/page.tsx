"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AsyncState } from "@/components/common/AsyncState";
import { getTeamsByHackathonId } from "@/lib/mock-db/api/camp";
import type { PublicTeam } from "@/lib/mock-db/schema";

export default function CampPage() {
  const searchParams = useSearchParams();
  const hackathonSlug = searchParams.get("hackathon");

  const [data, setData] = useState<PublicTeam[] | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // TODO: slug -> hackathonId 매핑 로직 추가 예정
    getTeamsByHackathonId(undefined)
      .then((res) => setData(res))
      .catch((e) => setError(e as Error))
      .finally(() => setLoading(false));
  }, [hackathonSlug]);

  return (
    <section className="w-full space-y-4">
      <h1 className="text-xl font-semibold">팀 찾기 (Camp)</h1>
      <AsyncState
        data={data}
        isLoading={isLoading}
        error={error}
        isEmpty={(d) => d.length === 0}
      >
        {(teams) => (
          <ul className="space-y-3">
            {teams.map((t) => (
              <li
                key={t.id}
                className="rounded-lg border border-slate-800 bg-slate-900/60 p-4"
              >
                <h2 className="text-sm font-semibold text-emerald-400">
                  {t.name}
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  인원: {t.memberCount}명
                </p>
              </li>
            ))}
          </ul>
        )}
      </AsyncState>
    </section>
  );
}

