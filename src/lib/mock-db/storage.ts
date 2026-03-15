"use client";

const STORAGE_KEYS = {
  HACKATHONS: "hackathons",
  TEAMS: "teams",
  SUBMISSIONS: "submissions",
  LEADERBOARDS: "leaderboards",
  USERS: "users",
  CURRENT_USER: "currentUser",
} as const;

export { STORAGE_KEYS };

export function safeGetItem<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function safeSetItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded 등은 조용히 무시
  }
}

