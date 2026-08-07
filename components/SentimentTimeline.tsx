"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SentimentTimelineProps {
  sections: { label: string; text: string }[];
}

const POSITIVE_WORDS = [
  "baik", "indah", "cinta", "kasih", "sayang", "bahagia", "suka", "senang",
  "berkah", "rahmat", "surga", "pahala", "amal", "sholeh", "taqwa", "ikhlas",
  "sabar", "syukur", "jannah", "ridho", "barokah", "sakinah", "damai", "sejahtera",
  "sukses", "berhasil", "menang", "mulia", "hebat", "luar biasa", "sempurna",
  "selamat", "sembuh", "puas", "lega", "tenang", "tentram", "mudah", "cepat",
];

const NEGATIVE_WORDS = [
  "buruk", "jelek", "benci", "marah", "sedih", "takut", "khawatir", "cemas",
  "dosa", "azab", "neraka", "siksa", "murka", "jahat", "kejam", "keras",
  "berat", "susah", "sulit", "masalah", "gagal", "kalah", "hancur", "rusak",
  "hilang", "mati", "miskin", "sakit", "lemah", "malu", "hina", "rendah",
  "gelap", "dingin", "kering", "kosong", "hampa", "sunyi",
];

function analyzeSentiment(text: string) {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  let positive = 0;
  let negative = 0;

  for (const word of words) {
    if (POSITIVE_WORDS.some((pw) => word.includes(pw))) positive++;
    if (NEGATIVE_WORDS.some((nw) => word.includes(nw))) negative++;
  }

  const total = positive + negative || 1;
  const score = Math.round(((positive - negative) / total) * 100);

  let dominant: "positif" | "negatif" | "netral" = "netral";
  if (score > 15) dominant = "positif";
  else if (score < -15) dominant = "negatif";

  return { score, positive, negative, dominant };
}

export default function SentimentTimeline({ sections }: SentimentTimelineProps) {
  const results = useMemo(
    () => sections.map((s) => ({ ...s, sentiment: analyzeSentiment(s.text) })),
    [sections]
  );

  if (results.length === 0) {
    return (
      <div className="brutal-card p-4 text-center text-sm text-black/40 font-semibold">
        Belum ada section
      </div>
    );
  }

  const overallScore = results.reduce((sum, r) => sum + r.sentiment.score, 0) / results.length;

  return (
    <div className="brutal-card p-4">
      <h4 className="text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2">
        <span className="inline-block w-2 h-2 bg-[var(--color-accent)]" />
        Timeline Sentimen
      </h4>

      {/* Overall score */}
      <div className="flex items-center gap-3 mb-4 p-2 bg-black/[0.03] border border-black/10">
        <div className="text-center">
          <div className="text-2xl font-bold">{Math.round(overallScore)}</div>
          <div className="text-[0.6rem] text-black/40 font-semibold">Skor Global</div>
        </div>
        <div className="flex-1 h-3 bg-black/5 overflow-hidden border border-black/10">
          <div
            className={`h-full transition-all duration-500 ${
              overallScore > 0 ? "bg-[#22c55e]" : overallScore < 0 ? "bg-[var(--color-danger)]" : "bg-black/20"
            }`}
            style={{ width: `${Math.min(100, Math.abs(overallScore))}%` }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {results.map((section, i) => {
          const { score, dominant } = section.sentiment;
          const colorMap = {
            positif: { bg: "bg-[#22c55e]", border: "border-[#22c55e]", icon: <TrendingUp className="w-3 h-3" />, label: "Positif" },
            negatif: { bg: "bg-[var(--color-danger)]", border: "border-[var(--color-danger)]", icon: <TrendingDown className="w-3 h-3" />, label: "Negatif" },
            netral: { bg: "bg-black/20", border: "border-black/20", icon: <Minus className="w-3 h-3" />, label: "Netral" },
          };
          const c = colorMap[dominant];

          return (
            <div key={i} className="flex items-stretch gap-0">
              {/* Timeline line */}
              <div className="flex flex-col items-center w-6">
                <div className={`w-3 h-3 border-2 ${c.border} bg-white ${c.bg} z-10`} />
                {i < results.length - 1 && <div className="w-0.5 flex-1 bg-black/10" />}
              </div>

              {/* Content */}
              <div className={`flex-1 border-l-2 ${c.border} pl-3 pb-3 ${i === results.length - 1 ? "" : "mb-1"}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{section.label}</span>
                  <div className={`flex items-center gap-1 text-[0.65rem] font-bold ${c.bg} border-2 border-[var(--color-ink)] px-1.5 py-0.5`}>
                    {c.icon}
                    {score > 0 ? "+" : ""}{score}
                  </div>
                </div>
                <div className="text-[0.65rem] font-semibold text-black/50 mt-0.5">
                  {c.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
