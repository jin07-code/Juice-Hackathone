"use client";

import { ReactNode } from "react";

type AsyncStateProps<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  children: (data: T) => ReactNode;
  isEmpty?: (data: T) => boolean;
  emptyFallback?: ReactNode;
  loadingFallback?: ReactNode;
  errorFallback?: (error: Error) => ReactNode;
};

export function AsyncState<T>({
  data,
  isLoading,
  error,
  children,
  isEmpty,
  emptyFallback,
  loadingFallback,
  errorFallback,
}: AsyncStateProps<T>) {
  if (isLoading) {
    return (
      <div className="flex w-full justify-center py-10 text-sm text-slate-400">
        {loadingFallback ?? "Loading..."}
      </div>
    );
  }

  if (error) {
    return (
      errorFallback?.(error) ?? (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          에러가 발생했습니다. 잠시 후 다시 시도해주세요.
        </div>
      )
    );
  }

  if (data && isEmpty?.(data)) {
    return (
      emptyFallback ?? (
        <div className="flex w-full justify-center py-10 text-sm text-slate-400">
          표시할 데이터가 없습니다.
        </div>
      )
    );
  }

  if (!data) {
    return (
      emptyFallback ?? (
        <div className="flex w-full justify-center py-10 text-sm text-slate-400">
          표시할 데이터가 없습니다.
        </div>
      )
    );
  }

  return <>{children(data)}</>;
}

