"use client";

import { useMemo } from "react";

interface WordDiffProps {
  oldText: string;
  newText: string;
}

interface DiffPart {
  text: string;
  type: "added" | "removed" | "unchanged";
}

function computeDiff(oldText: string, newText: string): DiffPart[] {
  const oldWords = oldText.split(/(\s+)/);
  const newWords = newText.split(/(\s+)/);

  const maxLen = Math.max(oldWords.length, newWords.length);
  const result: DiffPart[] = [];

  for (let i = 0; i < maxLen; i++) {
    const o = oldWords[i];
    const n = newWords[i];

    if (o === undefined) {
      result.push({ text: n, type: "added" });
    } else if (n === undefined) {
      result.push({ text: o, type: "removed" });
    } else if (o === n) {
      result.push({ text: o, type: "unchanged" });
    } else {
      result.push({ text: o, type: "removed" });
      result.push({ text: n, type: "added" });
    }
  }

  return result;
}

export default function WordDiff({ oldText, newText }: WordDiffProps) {
  const parts = useMemo(() => computeDiff(oldText, newText), [oldText, newText]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    for (const p of parts) {
      if (p.type === "added") added++;
      if (p.type === "removed") removed++;
    }
    return { added, removed };
  }, [parts]);

  return (
    <div className="brutal-card p-4 space-y-2">
      <span className="text-xs font-black uppercase tracking-tight">
        Word Diff
      </span>

      <div className="text-xs font-mono leading-relaxed whitespace-pre-wrap break-words">
        {parts.map((part, i) => {
          let cls = "";
          if (part.type === "added") cls = "bg-green-200 text-green-900";
          else if (part.type === "removed") cls = "bg-red-200 text-red-900 line-through";
          else cls = "";

          return (
            <span key={i} className={cls}>
              {part.text}
            </span>
          );
        })}
      </div>

      <div className="flex gap-3 text-[10px] font-mono opacity-60 pt-1 border-t border-black/10">
        <span className="text-green-700">+{stats.added} added</span>
        <span className="text-red-700">-{stats.removed} removed</span>
      </div>
    </div>
  );
}
