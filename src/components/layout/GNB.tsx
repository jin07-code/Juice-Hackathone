"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import clsx from "clsx";
import { useAuth } from "@/contexts/AuthContext";
import { STORAGE_KEYS, safeGetItem } from "@/lib/mock-db/storage";
import type { User } from "@/lib/mock-db/schema";

const navItems = [
  { href: "/", label: "메인" },
  { href: "/hackathons", label: "해커톤 목록" },
  { href: "/camp", label: "팀 찾기 (Camp)" },
  { href: "/rankings", label: "랭킹 보기" },
];

function UserSwitcher() {
  const { user, login, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const allUsers = safeGetItem<User[]>(STORAGE_KEYS.USERS) ?? [];
    setUsers(allUsers);
  }, []);

  const handleUserSelect = async (userId: string) => {
    await login(userId);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-700"
      >
        <span className="text-lg">
          {user?.avatar || "👤"}
        </span>
        <span className="text-xs">
          {user ? user.name : "로그인 필요"}
        </span>
        <span className="text-xs text-slate-400">▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-slate-700 bg-slate-900 shadow-lg">
          <div className="p-2">
            <div className="mb-2 px-2 py-1 text-xs font-medium text-slate-400">
              유저 선택
            </div>
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => handleUserSelect(u.id)}
                className={clsx(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                  user?.id === u.id
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "text-slate-300 hover:bg-slate-800"
                )}
              >
                <span>{u.avatar}</span>
                <div className="flex-1">
                  <div className="font-medium">{u.name}</div>
                  <div className="text-[10px] text-slate-400">
                    {u.role} · {u.email}
                  </div>
                </div>
              </button>
            ))}
            
            {user && (
              <>
                <div className="my-1 border-t border-slate-700" />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-red-400 hover:bg-slate-800"
                >
                  <span>🚪</span>
                  로그아웃
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
        <div className="flex items-center gap-4">
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
          <UserSwitcher />
        </div>
      </div>
    </header>
  );
}

