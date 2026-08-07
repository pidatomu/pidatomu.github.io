"use client";

import { useMemo } from "react";
import { Gauge } from "lucide-react";

interface DifficultyScoreProps {
  text: string;
}

const FORMAL_WORDS = new Set([
  "adalah", "ialah", "yaitu", "yakni", "oleh", "karena", "sehingga",
  "meskipun", "walaupun", "bagaimanapun", "sebaliknya", "selain",
  "tersebut", "demikian", "sangat", "lebih", "paling", "antara",
  "lain", "bahkan", "serta", "maupun", "apabila", "jikalau",
  "apabila", "manakala", "setelah", "sebelum", "sementara",
  "ketika", "sewaktu", "selagi", "hingga", "sampai", "sejak",
  "daripada", "mengenai", "berkenaan", "menurut", "sebagaimana",
  "berdasarkan", "atas", "bagi", "kepada", "dalam", "melalui",
]);

function countSyllables(word: string): number {
  word = word.toLowerCase().trim();
  if (word.length <= 3) return 1;
  let count = 0;
  const vowels = "aeiou";
  let prevVowel = false;
  for (const char of word) {
    const isVowel = vowels.includes(char);
    if (isVowel && !prevVowel) count++;
    prevVowel = isVowel;
  }
  return Math.max(1, count);
}

function splitIntoSentences(text: string): string[] {
  return text
    .replace(/\*\*[^*]+\*\*\s*/g, "")
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 0);
}

function splitIntoWords(text: string): string[] {
  return text
    .replace(/\*\*[^*]+\*\*\s*/g, "")
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

export default function DifficultyScore({ text }: DifficultyScoreProps) {
  const analysis = useMemo(() => {
    if (!text.trim()) return null;

    const words = splitIntoWords(text);
    const sentences = splitIntoSentences(text);
    const wordCount = words.length;
    const sentenceCount = Math.max(1, sentences.length);

    // Average word length (characters)
    const avgWordLength = wordCount > 0 ? words.reduce((sum, w) => sum + w.length, 0) / wordCount : 0;

    // Average syllables per word
    const avgSyllables = wordCount > 0 ? words.reduce((sum, w) => sum + countSyllables(w), 0) / wordCount : 0;

    // Average words per sentence
    const avgWordsPerSentence = wordCount / sentenceCount;

    // Formal word ratio
    const formalCount = words.filter((w) => FORMAL_WORDS.has(w.toLowerCase())).length;
    const formalRatio = wordCount > 0 ? formalCount / wordCount : 0;

    // Long words (>= 7 chars)
    const longWordRatio = wordCount > 0 ? words.filter((w) => w.length >= 7).length / wordCount : 0;

    // Complex sentences (> 20 words)
    const complexSentences = sentences.filter((s) => s.split(/\s+/).length > 20).length;
    const complexSentenceRatio = complexSentences / sentenceCount;

    // Score 1-10
    let score = 1;

    // Word length factor (1-3 points)
    if (avgWordLength >= 7) score += 3;
    else if (avgWordLength >= 5.5) score += 2;
    else if (avgWordLength >= 4) score += 1;

    // Syllable factor (0-2 points)
    if (avgSyllables >= 3) score += 2;
    else if (avgSyllables >= 2.5) score += 1;

    // Sentence length factor (0-2 points)
    if (avgWordsPerSentence >= 25) score += 2;
    else if (avgWordsPerSentence >= 15) score += 1;

    // Formal word ratio (0-2 points)
    if (formalRatio >= 0.1) score += 2;
    else if (formalRatio >= 0.05) score += 1;

    // Complex sentence ratio (0-1 points)
    if (complexSentenceRatio >= 0.3) score += 1;

    score = Math.min(10, Math.max(1, score));

    // Target audience
    let targetAudience: string;
    if (score <= 2) targetAudience = "SD";
    else if (score <= 4) targetAudience = "SMP";
    else if (score <= 6) targetAudience = "SMA";
    else if (score <= 8) targetAudience = "Umum";
    else targetAudience = "Intelektual";

    const scoreLabel =
      score <= 2 ? "Sangat Mudah" :
      score <= 4 ? "Mudah" :
      score <= 6 ? "Sedang" :
      score <= 8 ? "Sulit" :
      "Sangat Sulit";

    return {
      score,
      scoreLabel,
      targetAudience,
      avgWordLength: Math.round(avgWordLength * 10) / 10,
      avgSyllables: Math.round(avgSyllables * 10) / 10,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      formalRatio: Math.round(formalRatio * 100),
      longWordRatio: Math.round(longWordRatio * 100),
      wordCount,
      sentenceCount,
    };
  }, [text]);

  if (!analysis) {
    return (
      <div className="brutal-card p-4 text-center text-sm text-black/40 font-semibold">
        Belum ada teks
      </div>
    );
  }

  const gaugeColor =
    analysis.score <= 2 ? "text-[#22c55e]" :
    analysis.score <= 4 ? "text-[var(--color-accent-2)]" :
    analysis.score <= 6 ? "text-[var(--color-accent)]" :
    analysis.score <= 8 ? "text-orange-500" :
    "text-[var(--color-danger)]";

  return (
    <div className="brutal-card p-4">
      <h4 className="text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2">
        <Gauge className="w-3 h-3" />
        Skor Kesulitan Bicara
      </h4>

      <div className="flex items-center gap-4 mb-4">
        {/* Gauge */}
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-black/10" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke={analysis.score <= 2 ? "#22c55e" : analysis.score <= 4 ? "#b4f461" : analysis.score <= 6 ? "#ffd400" : analysis.score <= 8 ? "#f97316" : "#ff5470"}
                strokeWidth="2.5"
                strokeDasharray={`${(analysis.score / 10) * 100} ${100 - (analysis.score / 10) * 100}`}
                strokeLinecap="butt"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-xl font-bold ${gaugeColor}`}>{analysis.score}</span>
              <span className="text-[0.5rem] text-black/40 font-semibold">/ 10</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-1.5">
          <div className="text-sm font-bold">{analysis.scoreLabel}</div>
          <div className="flex items-center gap-1.5">
            <span className="text-[0.65rem] font-semibold text-black/50">Target:</span>
            <span className="text-xs font-bold border-2 border-[var(--color-ink)] px-2 py-0.5 bg-[var(--color-accent)]">
              {analysis.targetAudience}
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-1">
        <MetricRow label="Panjang kata rata-rata" value={`${analysis.avgWordLength} karakter`} />
        <MetricRow label="Suku kata per kata" value={`${analysis.avgSyllables}`} />
        <MetricRow label="Kata per kalimat" value={`${analysis.avgWordsPerSentence}`} />
        <MetricRow label="Rasio kata formal" value={`${analysis.formalRatio}%`} />
        <MetricRow label="Kata panjang (≥7 huruf)" value={`${analysis.longWordRatio}%`} />
      </div>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-xs py-1 border-b border-black/5 last:border-0">
      <span className="text-black/60 font-medium">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
