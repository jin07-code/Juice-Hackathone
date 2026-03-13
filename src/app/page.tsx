"use client";

import Link from "next/link";

export default function HomePage() {
  const cards = [
    {
      href: "/hackathons",
      title: "해커톤 목록",
      desc: "현재/예정된 해커톤을 둘러보세요.",
    },
    {
      href: "/camp",
      title: "팀 찾기 (Camp)",
      desc: "함께 도전할 팀원을 모집하거나 찾아보세요.",
    },
    {
      href: "/rankings",
      title: "글로벌 랭킹",
      desc: "전 세계 해커톤 결과를 확인해보세요.",
    },
  ];

  return (
    <section className="grid w-full gap-6 md:grid-cols-3">
      {cards.map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-950/40 transition hover:-translate-y-1 hover:border-emerald-500/60 hover:bg-slate-900/90"
        >
          <div>
            <h2 className="mb-2 text-lg font-semibold text-slate-50">
              {card.title}
            </h2>
            <p className="text-sm text-slate-400">{card.desc}</p>
          </div>
          <span className="mt-4 text-xs font-medium text-emerald-400">
            바로 가기 →
          </span>
        </Link>
      ))}
    </section>
  );
}

