"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AsyncState } from "@/components/common/AsyncState";
import { getHackathons } from "@/lib/mock-db/api/hackathons";
import type { PublicHackathon } from "@/lib/mock-db/schema";

export default function HackathonsPage() {
  const [data, setData] = useState<PublicHackathon[] | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getHackathons()
      .then((res) => setData(res))
      .catch((e) => setError(e as Error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="w-full space-y-4">
      <h1 className="text-xl font-semibold">해커톤 목록</h1>
      <AsyncState
        data={data}
        isLoading={isLoading}
        error={error}
        isEmpty={(d) => d.length === 0}
      >
        {(hackathons) => (
          <ul className="space-y-3">
            {hackathons.map((h) => (
              <li
                key={h.id}
                className="rounded-lg border border-slate-800 bg-slate-900/60 p-4"
              >
                <Link
                  href={`/hackathons/${h.slug}`}
                  className="text-sm font-medium text-emerald-400"
                >
                  {h.title}
                </Link>
                <p className="mt-1 text-xs text-slate-400">{h.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </AsyncState>
    </section>
  );
}

