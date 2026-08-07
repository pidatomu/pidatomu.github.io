"use client";

import { useMemo } from "react";

interface WordChartProps {
  data: { word: string; count: number }[];
}

export default function WordChart({ data }: WordChartProps) {
  const maxCount = useMemo(() => {
    if (data.length === 0) return 1;
    return Math.max(...data.map((d) => d.count));
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="brutal-card p-4 text-center text-sm text-black/40 font-semibold">
        Belum ada data kata
      </div>
    );
  }

  return (
    <div className="brutal-card p-4">
      <h4 className="text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2">
        <span className="inline-block w-2 h-2 bg-[var(--color-accent)]" />
        Frekuensi Kata
      </h4>
      <div className="space-y-1.5">
        {data.map((item) => {
          const width = Math.max(4, (item.count / maxCount) * 100);
          return (
            <div key={item.word} className="flex items-center gap-2 text-xs">
              <span className="w-24 text-right font-mono font-semibold text-black/70 truncate">
                {item.word}
              </span>
              <div className="flex-1 h-5 bg-black/5 border border-black/10 overflow-hidden relative">
                <div
                  className="h-full bg-[var(--color-accent)] transition-all duration-500"
                  style={{ width: `${width}%` }}
                />
                <span className="absolute inset-0 flex items-center px-2 font-bold text-[0.65rem]">
                  {item.count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
