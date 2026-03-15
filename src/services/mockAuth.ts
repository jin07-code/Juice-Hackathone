"use client";

import { STORAGE_KEYS, safeGetItem, safeSetItem } from "@/lib/mock-db/storage";
import type { User } from "@/lib/mock-db/schema";

/**
 * Mock Auth API
 * localStorage를 활용한 간단한 인증 시스템
 */

export async function login(userId: string): Promise<User | null> {
  const users = safeGetItem<User[]>(STORAGE_KEYS.USERS) ?? [];
  const user = users.find((u) => u.id === userId);
  
  if (user) {
    // 현재 로그인한 유저를 localStorage에 저장
    safeSetItem(STORAGE_KEYS.CURRENT_USER, user);
    console.log(`로그인 성공: ${user.name} (${user.id})`);
  } else {
    console.error(`유저를 찾을 수 없음: ${userId}`);
  }
  
  return user || null;
}

export async function logout(): Promise<void> {
  // localStorage에서 현재 유저 삭제
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  console.log("로그아웃 완료");
}

export function getCurrentUser(): User | null {
  return safeGetItem<User>(STORAGE_KEYS.CURRENT_USER);
}

/**
 * 현재 로그인된 유저가 특정 팀에 속해있는지 확인
 */
export function isUserTeamMember(teamId: string): boolean {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;
  
  const teams = safeGetItem<any[]>(STORAGE_KEYS.TEAMS) ?? [];
  const team = teams.find((t) => t.id === teamId);
  
  return team?.members?.includes(currentUser.id) ?? false;
}

/**
 * 현재 로그인된 유저가 특정 해커톤에 속한 팀이 있는지 확인
 */
export function hasUserTeamInHackathon(hackathonId: string): boolean {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;
  
  const teams = safeGetItem<any[]>(STORAGE_KEYS.TEAMS) ?? [];
  const userTeams = teams.filter((team) => 
    team.hackathonId === hackathonId && 
    team.members?.includes(currentUser.id)
  );
  
  return userTeams.length > 0;
}

/**
 * 현재 로그인된 유저가 특정 해커톤의 팀 목록 가져오기
 */
export function getUserTeamsInHackathon(hackathonId: string): any[] {
  const currentUser = getCurrentUser();
  if (!currentUser) return [];
  
  const teams = safeGetItem<any[]>(STORAGE_KEYS.TEAMS) ?? [];
  return teams.filter((team) => 
    team.hackathonId === hackathonId && 
    team.members?.includes(currentUser.id)
  );
}
