"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

interface CompareModeProps {
  original: string;
  edited: string;
  onClose: () => void;
}

interface DiffLine {
  type: "same" | "added" | "removed" | "changed";
  text: string;
  pairText?: string;
}

function computeDiff(original: string, edited: string): DiffLine[] {
  const origLines = original.split("\n");
  const editLines = edited.split("\n");
  const maxLen = Math.max(origLines.length, editLines.length);
  const result: DiffLine[] = [];

  for (let i = 0; i < maxLen; i++) {
    const o = origLines[i];
    const e = editLines[i];

    if (o === undefined) {
      result.push({ type: "added", text: e });
    } else if (e === undefined) {
      result.push({ type: "removed", text: o });
    } else if (o === e) {
      result.push({ type: "same", text: o });
    } else {
      result.push({ type: "changed", text: o, pairText: e });
    }
  }

  return result;
}

export default function CompareMode({ original, edited, onClose }: CompareModeProps) {
  const [showOnlyChanges, setShowOnlyChanges] = useState(false);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const syncing = useRef(false);

  const diff = computeDiff(original, edited);

  const stats = {
    added: diff.filter((d) => d.type === "added").length,
    removed: diff.filter((d) => d.type === "removed").length,
    changed: diff.filter((d) => d.type === "changed").length,
  };

  const filteredDiff = showOnlyChanges
    ? diff.filter((d) => d.type !== "same")
    : diff;

  const syncScroll = (source: "left" | "right") => {
    if (syncing.current) return;
    syncing.current = true;
    const src = source === "left" ? leftRef.current : rightRef.current;
    const tgt = source === "left" ? rightRef.current : leftRef.current;
    if (src && tgt) {
      tgt.scrollTop = src.scrollTop;
    }
    requestAnimationFrame(() => {
      syncing.current = false;
    });
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex flex-col">
      <div className="brutal-card bg-white flex items-center justify-between p-3 border-b-4 border-black m-0 rounded-none">
        <div className="flex items-center gap-4">
          <h2 className="font-black uppercase text-sm">Perbandingan</h2>
          <div className="flex gap-3 text-xs font-mono">
            <span className="text-green-600">+{stats.added} tambah</span>
            <span className="text-red-600">-{stats.removed} hapus</span>
            <span className="text-yellow-600">~{stats.changed} ubah</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyChanges}
              onChange={(e) => setShowOnlyChanges(e.target.checked)}
              className="accent-black"
            />
            Hanya perubahan
          </label>
          <button onClick={onClose} className="brutal-btn p-1">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 border-r-2 border-black flex flex-col">
          <div className="bg-red-100 border-b-2 border-black px-3 py-1 text-xs font-black uppercase">
            Original
          </div>
          <div
            ref={leftRef}
            onScroll={() => syncScroll("left")}
            className="flex-1 overflow-y-auto font-mono text-sm p-3"
          >
            {filteredDiff.map((line, i) => {
              const origLine = line.type === "added" ? "" : line.text;
              if (!origLine && !showOnlyChanges && line.type === "added") return null;
              return (
                <div
                  key={`l-${i}`}
                  className={`py-0.5 border-l-4 px-2 ${
                    line.type === "removed"
                      ? "bg-red-100 border-red-500"
                      : line.type === "changed"
                      ? "bg-yellow-100 border-yellow-500"
                      : "border-transparent"
                  }`}
                >
                  <span className="opacity-30 text-xs mr-2 select-none">{i + 1}</span>
                  {origLine || <span className="opacity-20">—</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="bg-green-100 border-b-2 border-black px-3 py-1 text-xs font-black uppercase">
            Edited
          </div>
          <div
            ref={rightRef}
            onScroll={() => syncScroll("right")}
            className="flex-1 overflow-y-auto font-mono text-sm p-3"
          >
            {filteredDiff.map((line, i) => {
              const editLine =
                line.type === "removed" ? "" : line.type === "changed" ? line.pairText : line.text;
              if (!editLine && !showOnlyChanges && line.type === "removed") return null;
              return (
                <div
                  key={`r-${i}`}
                  className={`py-0.5 border-l-4 px-2 ${
                    line.type === "added"
                      ? "bg-green-100 border-green-500"
                      : line.type === "changed"
                      ? "bg-yellow-100 border-yellow-500"
                      : "border-transparent"
                  }`}
                >
                  <span className="opacity-30 text-xs mr-2 select-none">{i + 1}</span>
                  {editLine || <span className="opacity-20">—</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
