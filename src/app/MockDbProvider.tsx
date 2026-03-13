"use client";

import { ReactNode, useEffect, useState } from "react";
import { ensureMockDbSeeded } from "@/lib/mock-db/seed";

export function MockDbProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureMockDbSeeded()
      .catch((e) => {
        console.error("Mock DB 초기화 실패", e);
      })
      .finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
        초기 데이터를 불러오는 중입니다...
      </div>
    );
  }

  return <>{children}</>;
}

