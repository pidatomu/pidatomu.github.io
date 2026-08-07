"use client";

import { useMemo } from "react";
import { Clock } from "lucide-react";

interface ReadingTimeProps {
  text: string;
  wordsPerMinute?: number;
}

export default function ReadingTime({ text, wordsPerMinute = 130 }: ReadingTimeProps) {
  const analysis = useMemo(() => {
    const words = text.split(/\s+/).filter(Boolean);
    const totalWords = words.length;
    const totalSeconds = Math.round((totalWords / wordsPerMinute) * 60);

    const openWords = Math.min(Math.round(totalWords * 0.1), words.slice(0, 5).length);
    const closeWords = Math.min(Math.round(totalWords * 0.1), words.slice(-5).length);
    const bodyWords = Math.max(0, totalWords - openWords - closeWords);

    const openSec = Math.round((openWords / wordsPerMinute) * 60);
    const closeSec = Math.round((closeWords / wordsPerMinute) * 60);
    const bodySec = totalSeconds - openSec - closeSec;

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const parts = [
      { label: "Pembuka", seconds: openSec, words: openWords, color: "bg-[var(--color-accent)]" },
      { label: "Isi", seconds: bodySec, words: bodyWords, color: "bg-[var(--color-accent-2)]" },
      { label: "Penutup", seconds: closeSec, words: closeWords, color: "bg-[var(--color-danger)]" },
    ];

    return { totalWords, minutes, seconds, totalSeconds, parts };
  }, [text, wordsPerMinute]);

  if (analysis.totalWords === 0) {
    return (
      <div className="brutal-card p-4 text-center text-sm text-black/40 font-semibold">
        Belum ada teks
      </div>
    );
  }

  return (
    <div className="brutal-card p-4">
      <h4 className="text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2">
        <Clock className="w-3 h-3" />
        Estimasi Waktu Bicara
      </h4>

      <div className="text-center mb-4">
        <div className="text-3xl font-bold tracking-tight">
          {analysis.minutes > 0 && <span>{analysis.minutes} menit </span>}
          <span>{analysis.seconds} detik</span>
        </div>
        <div className="text-[0.65rem] font-semibold text-black/40 mt-1">
          {analysis.totalWords.toLocaleString("id")} kata · {wordsPerMinute} kata/menit
        </div>
      </div>

      {/* Stacked bar */}
      <div className="flex h-4 overflow-hidden border-2 border-[var(--color-ink)] mb-3">
        {analysis.parts.map((part) => (
          <div
            key={part.label}
            className={`${part.color} transition-all duration-500 relative group`}
            style={{ width: `${analysis.totalSeconds > 0 ? (part.seconds / analysis.totalSeconds) * 100 : 0}%` }}
          />
        ))}
      </div>

      <div className="space-y-1.5">
        {analysis.parts.map((part) => (
          <div key={part.label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`inline-block w-2 h-2 ${part.color}`} />
              <span className="font-semibold">{part.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-black/50">{part.words} kata</span>
              <span className="font-bold">
                {part.seconds >= 60
                  ? `${Math.floor(part.seconds / 60)}m ${part.seconds % 60}s`
                  : `${part.seconds} detik`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
