"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const navItems = [
  { href: "/", label: "메인" },
  { href: "/hackathons", label: "해커톤 목록" },
  { href: "/camp", label: "팀 찾기 (Camp)" },
  { href: "/rankings", label: "랭킹 보기" },
];

export function GNB() {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-emerald-400"
        >
          Hackathon Platform
        </Link>
        <nav className="flex gap-2 text-sm">
          {navItems.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "rounded-md px-3 py-1.5 transition-colors",
                  active
                    ? "bg-emerald-500 text-slate-900"
                    : "text-slate-200 hover:bg-slate-800"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

