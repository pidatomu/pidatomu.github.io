"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CustomPromptProps {
  value: string;
  onChange: (v: string) => void;
}

const MAX_CHARS = 500;

const SUGGESTIONS = [
  "Sertakan dalil Al-Quran",
  "Sertakan hadits",
  "Contoh nyata",
  "Cerita lucu",
];

export default function CustomPrompt({ value, onChange }: CustomPromptProps) {
  const [open, setOpen] = useState(false);
  const charsLeft = MAX_CHARS - value.length;
  const isOver = charsLeft < 0;

  return (
    <div className="brutal-card p-4 space-y-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between font-black text-xs uppercase tracking-tight"
      >
        <span>Prompt Kustom</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {open && (
        <div className="space-y-2 animate-fade-in">
          <textarea
            value={value}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARS + 20) {
                onChange(e.target.value);
              }
            }}
            placeholder="Contoh: Sertakan hadits dari Shahih Bukhari tentang sabar..."
            rows={3}
            className="brutal-input w-full p-3 text-sm resize-none"
          />

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    const next = value ? value + " " + s : s;
                    if (next.length <= MAX_CHARS) onChange(next);
                  }}
                  className="suggestion-chip text-[10px]"
                >
                  {s}
                </button>
              ))}
            </div>

            <span
              className={`text-xs font-mono font-bold ${
                isOver ? "text-red-500" : "opacity-50"
              }`}
            >
              {charsLeft}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
