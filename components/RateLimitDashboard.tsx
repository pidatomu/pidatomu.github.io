"use client";

import { Activity, AlertTriangle } from "lucide-react";

interface RateLimitDashboardProps {
  remaining: number | null;
  limit: number;
}

export default function RateLimitDashboard({ remaining, limit }: RateLimitDashboardProps) {
  const used = remaining !== null ? limit - remaining : 0;
  const pct = limit > 0 ? Math.round((used / limit) * 100) : 0;
  const isLow = remaining !== null && remaining < 3;

  const resetTime = () => {
    const now = new Date();
    const next = new Date(now);
    next.setUTCHours(24, 0, 0, 0);
    const diff = next.getTime() - now.getTime();
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hours > 0) return `${hours}j ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="brutal-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wide flex items-center gap-2">
          <Activity className="w-3 h-3" />
          Kuota Hari Ini
        </h4>
        {isLow && (
          <span className="flex items-center gap-1 text-[0.6rem] font-bold text-[var(--color-danger)]">
            <AlertTriangle className="w-3 h-3" />
            Habis
          </span>
        )}
      </div>

      <div className="flex items-end gap-2">
        <span className="text-3xl font-black leading-none">
          {remaining !== null ? remaining : "—"}
        </span>
        <span className="text-xs font-semibold text-black/50 mb-0.5">
          / {limit}
        </span>
      </div>

      <div className="h-3 bg-black/5 border-2 border-[var(--color-ink)] overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            isLow ? "bg-[var(--color-danger)]" : "bg-[var(--color-accent)]"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[0.65rem] font-semibold text-black/50">
        <span>
          {isLow ? "Tinggal sedikit!" : `${used} terpakai hari ini`}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
          Reset dalam {resetTime()}
        </span>
      </div>

      {isLow && (
        <button className="brutal-btn w-full py-2 text-xs font-bold uppercase tracking-wide bg-[var(--color-accent-2)]">
          Upgrade
        </button>
      )}
    </div>
  );
}
