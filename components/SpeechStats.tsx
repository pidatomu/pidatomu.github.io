"use client";

import { useMemo } from "react";
import { FileText, Clock, BookOpen, File, BarChart3, Key, AlertTriangle } from "lucide-react";
import { analyzeReadability, getSentiment, getKeywordDensity, getSentenceComplexity, type ReadabilityResult } from "@/lib/readability";

interface SpeechStatsProps {
  text: string;
  provider?: string | null;
  remaining?: number | null;
  showReadingLevel?: boolean;
  showKeywordDensity?: boolean;
  showSentiment?: boolean;
  showAdvanced?: boolean;
  expanded?: boolean;
}

function SentimentBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-16 text-right font-medium text-black/60">{label}</span>
      <div className="flex-1 h-2 bg-black/5 border border-black/10 overflow-hidden">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${value}%` }} />
      </div>
      <span className="w-8 font-bold">{value}%</span>
    </div>
  );
}

function ReadabilityGauge({ score, label }: { score: number; label: string }) {
  const hue = Math.round((score / 100) * 120);
  return (
    <div className="text-center">
      <div className="relative w-16 h-16 mx-auto">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2" className="text-black/10" />
          <circle
            cx="18" cy="18" r="15.9" fill="none" stroke={`hsl(${hue}, 70%, 45%)`} strokeWidth="2"
            strokeDasharray={`${score} ${100 - score}`} strokeLinecap="butt"
            className="transition-all duration-700"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
          {Math.round(score)}
        </span>
      </div>
      <span className="text-[0.65rem] font-semibold text-black/50 mt-1 block">{label}</span>
    </div>
  );
}

function ScoreRow({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="flex justify-between items-center text-xs py-1 border-b border-black/5 last:border-0">
      <span className="text-black/60 font-medium">{label}</span>
      <div className="flex items-center gap-1">
        <span className="font-bold">{value}</span>
        {hint && <span className="text-[0.6rem] text-black/40">({hint})</span>}
      </div>
    </div>
  );
}

export default function SpeechStats({
  text,
  provider,
  remaining,
  showReadingLevel = true,
  showKeywordDensity = true,
  showSentiment = true,
  showAdvanced = false,
  expanded = false,
}: SpeechStatsProps) {
  const stats = useMemo(() => analyzeReadability(text), [text]);
  const sentiment = useMemo(() => getSentiment(text), [text]);
  const keywords = useMemo(() => getKeywordDensity(text, 8), [text]);
  const complexity = useMemo(() => getSentenceComplexity(text), [text]);

  if (!expanded) {
    return (
      <div className="no-print flex items-center gap-3 mb-3 flex-wrap">
        <StatBadge value={stats.wordCount.toLocaleString("id")} label="kata" icon={<FileText className="w-3 h-3" />} />
        <StatBadge value={`${Math.round(stats.wordCount / 130)} mnt`} icon={<Clock className="w-3 h-3" />} />
        <StatBadge value={stats.sentenceCount.toLocaleString("id")} label="kalimat" icon={<BookOpen className="w-3 h-3" />} />
        <StatBadge value={`${stats.paragraphCount}`} label="paragraf" icon={<File className="w-3 h-3" />} />
        {provider && <StatBadge value={provider === "groq" ? "Groq AI" : "Gemini AI"} />}
        {remaining !== null && remaining !== undefined && (
          <StatBadge value={`${remaining}/hari`} label="sisa" />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <QuickStat icon={<FileText className="w-5 h-5" />} value={stats.wordCount.toLocaleString("id")} label="Kata" />
        <QuickStat icon={<BookOpen className="w-5 h-5" />} value={stats.sentenceCount.toLocaleString("id")} label="Kalimat" />
        <QuickStat icon={<File className="w-5 h-5" />} value={`${stats.paragraphCount}`} label="Paragraf" />
        <QuickStat icon={<Clock className="w-5 h-5" />} value={`${Math.round(stats.wordCount / 130)} mnt`} label="Waktu Baca" />
      </div>

      {/* Reading Level */}
      {showReadingLevel && (
        <div className="brutal-card p-4">
          <h4 className="text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-[var(--color-accent)]" />
            Level Keterbacaan
          </h4>
          <div className="flex justify-around mb-3">
            <ReadabilityGauge score={stats.readingEase} label="Reading Ease" />
            <div className="text-center">
              <div className="w-16 h-16 mx-auto border-[3px] border-[var(--color-ink)] bg-[var(--color-accent)] flex items-center justify-center">
                <span className="text-sm font-bold">{stats.gradeLevel}</span>
              </div>
              <span className="text-[0.65rem] font-semibold text-black/50 mt-1 block">Target</span>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto border-[3px] border-[var(--color-ink)] bg-white flex items-center justify-center">
                <span className="text-sm font-bold">{stats.readingLevel}</span>
              </div>
              <span className="text-[0.65rem] font-semibold text-black/50 mt-1 block">Level</span>
            </div>
          </div>
          {showAdvanced && (
            <div className="grid grid-cols-2 gap-x-4 mt-2 pt-2 border-t-2 border-black/10">
              <ScoreRow label="Flesch-Kincaid" value={stats.fleschKincaid} hint="grade" />
              <ScoreRow label="Gunning Fog" value={stats.gunningFog} hint="index" />
              <ScoreRow label="Coleman-Liau" value={stats.colemanLiau} hint="index" />
              <ScoreRow label="SMOG" value={stats.smog} hint="index" />
              <ScoreRow label="ARI" value={stats.ari} hint="index" />
              <ScoreRow label="Kata Kompleks" value={stats.complexWords} hint={`${Math.round((stats.complexWords / stats.wordCount) * 100)}%`} />
              <ScoreRow label="Avg Kata/Kalimat" value={stats.avgWordsPerSentence} hint="words" />
              <ScoreRow label="Avg Suku Kata/Kata" value={stats.avgSyllablesPerWord} hint="syl" />
            </div>
          )}
        </div>
      )}

      {/* Sentence Complexity */}
      <div className="brutal-card p-4">
        <h4 className="text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-[var(--color-accent-2)]" />
          Kompleksitas Kalimat
        </h4>
        <div className="flex gap-1 h-4 overflow-hidden border border-black/10">
          <div className="bg-[#22c55e] transition-all duration-500" style={{ width: `${complexity.simple}%` }} />
          <div className="bg-[var(--color-accent)] transition-all duration-500" style={{ width: `${complexity.medium}%` }} />
          <div className="bg-[var(--color-danger)] transition-all duration-500" style={{ width: `${complexity.complex}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-[0.65rem] font-semibold">
          <span className="text-[#22c55e]">Sederhana {complexity.simple}%</span>
          <span className="text-[var(--color-accent)]">Sedang {complexity.medium}%</span>
          <span className="text-[var(--color-danger)]">Kompleks {complexity.complex}%</span>
        </div>
      </div>

      {/* Sentiment */}
      {showSentiment && (
        <div className="brutal-card p-4">
          <h4 className="text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-[#22c55e]" />
            Analisis Sentimen
            <span className="ml-auto text-[0.65rem] font-bold px-2 py-0.5 bg-black/5">{sentiment.label}</span>
          </h4>
          <div className="space-y-1.5">
            <SentimentBar label="Positif" value={sentiment.positive} color="bg-[#22c55e]" />
            <SentimentBar label="Negatif" value={sentiment.negative} color="bg-[var(--color-danger)]" />
            <SentimentBar label="Netral" value={sentiment.neutral} color="bg-[var(--color-accent)]" />
          </div>
        </div>
      )}

      {/* Keyword Density */}
      {showKeywordDensity && keywords.length > 0 && (
        <div className="brutal-card p-4">
          <h4 className="text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2">
            <Key className="w-3 h-3" />
            Kata Kunci Teratas
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {keywords.map((kw) => (
              <span
                key={kw.word}
                className="inline-flex items-center gap-1 px-2 py-0.5 border border-black/20 text-xs font-semibold bg-black/[0.03]"
              >
                {kw.word}
                <span className="text-[0.6rem] text-black/40">{kw.count}×</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Provider */}
      {(provider || remaining !== null) && (
        <div className="flex items-center gap-2 text-xs text-black/50 font-medium">
          {provider && <span>Dioleh: {provider === "groq" ? "Groq AI" : "Gemini AI"}</span>}
          {remaining !== null && remaining !== undefined && <span>· Sisa kuota: {remaining}/hari</span>}
        </div>
      )}
    </div>
  );
}

function StatBadge({ value, label, icon }: { value: string; label?: string; icon?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border-2 border-[var(--color-ink)] bg-white text-xs font-bold">
      {icon}
      {value}
      {label && <span className="font-semibold text-black/50">{label}</span>}
    </span>
  );
}

function QuickStat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="brutal-card p-3 text-center">
      <div className="flex justify-center text-[var(--color-accent)]">{icon}</div>
      <div className="text-sm font-bold mt-1">{value}</div>
      <div className="text-[0.6rem] font-semibold text-black/40 uppercase">{label}</div>
    </div>
  );
}
