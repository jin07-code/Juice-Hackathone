"use client";

import { useEffect, useState } from "react";
import { AsyncState } from "@/components/common/AsyncState";
import { getLeaderboardByHackathonId } from "@/lib/mock-db/api/rankings";
import type { PublicLeaderboardEntry } from "@/lib/mock-db/schema";

export default function RankingsPage() {
  const [data, setData] = useState<PublicLeaderboardEntry[] | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getLeaderboardByHackathonId(undefined)
      .then((res) => setData(res))
      .catch((e) => setError(e as Error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="w-full space-y-4">
      <h1 className="text-xl font-semibold">글로벌 랭킹</h1>
      <AsyncState
        data={data}
        isLoading={isLoading}
        error={error}
        isEmpty={(d) => d.length === 0}
      >
        {(rows) => (
          <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900/60">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-300">
                <tr>
                  <th className="px-4 py-2">순위</th>
                  <th className="px-4 py-2">팀</th>
                  <th className="px-4 py-2">점수</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-slate-800">
                    <td className="px-4 py-2">{r.rank}</td>
                    <td className="px-4 py-2 text-emerald-400">
                      {r.teamName}
                    </td>
                    <td className="px-4 py-2">{r.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AsyncState>
    </section>
  );
}

