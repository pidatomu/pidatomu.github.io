"use client";

import { Sparkles, Zap, Star } from "lucide-react";

interface ProviderPickerProps {
  value: "auto" | "groq" | "gemini";
  onChange: (v: "auto" | "groq" | "gemini") => void;
}

const PROVIDERS = [
  {
    key: "auto" as const,
    label: "Auto",
    icon: Sparkles,
    hint: "Pilih otomatis",
  },
  {
    key: "groq" as const,
    label: "Groq",
    icon: Zap,
    hint: "Cepat & Ringan",
  },
  {
    key: "gemini" as const,
    label: "Gemini",
    icon: Star,
    hint: "Paling Andal",
  },
];

export default function ProviderPicker({ value, onChange }: ProviderPickerProps) {
  return (
    <div className="brutal-card p-4 space-y-2">
      <span className="text-xs font-black uppercase tracking-tight">
        AI Provider
      </span>

      <div className="flex gap-2">
        {PROVIDERS.map(({ key, label, icon: Icon, hint }) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`brutal-btn flex-1 flex flex-col items-center gap-1 py-2 px-2 text-xs ${
              value === key ? "bg-yellow-300" : ""
            }`}
          >
            <Icon size={16} />
            <span>{label}</span>
            <span className="text-[9px] font-normal opacity-60 normal-case tracking-normal">
              {hint}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
