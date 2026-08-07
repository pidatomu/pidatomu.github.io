"use client";

import { Bold, Heading1, Heading2, List, Quote, Minus, Search } from "lucide-react";

interface EditorToolbarProps {
  onAction: (action: string) => void;
  wordCount: number;
  charCount: number;
  findVisible: boolean;
  onToggleFind: () => void;
}

interface ToolbarButton {
  id: string;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
}

const BUTTONS: ToolbarButton[] = [
  { id: "bold", icon: <Bold className="w-3 h-3" />, label: "Bold" },
  { id: "heading1", icon: <Heading1 className="w-3 h-3" />, label: "Heading 1" },
  { id: "heading2", icon: <Heading2 className="w-3 h-3" />, label: "Heading 2" },
  { id: "list", icon: <List className="w-3 h-3" />, label: "List" },
  { id: "quote", icon: <Quote className="w-3 h-3" />, label: "Quote" },
  { id: "divider", icon: <Minus className="w-3 h-3" />, label: "Divider" },
  { id: "find", icon: <Search className="w-3 h-3" />, label: "Find & Replace", shortcut: "Ctrl+H" },
];

export default function EditorToolbar({ onAction, wordCount, charCount, findVisible, onToggleFind }: EditorToolbarProps) {
  return (
    <div className="flex items-center gap-1 px-3 py-2 border-b-[3px] border-[var(--color-ink)] bg-[var(--color-bg)] flex-wrap">
      {BUTTONS.map((btn) => (
        <button
          key={btn.id}
          onClick={() => {
            if (btn.id === "find") onToggleFind();
            else onAction(btn.id);
          }}
          className={`w-7 h-7 flex items-center justify-center border border-black/20 text-xs font-bold hover:bg-[var(--color-accent)] transition-colors ${
            btn.id === "find" && findVisible ? "bg-[var(--color-accent)]" : ""
          }`}
          title={btn.shortcut ? `${btn.label} (${btn.shortcut})` : btn.label}
        >
          {btn.icon}
        </button>
      ))}
      <div className="ml-auto flex items-center gap-3 text-[0.65rem] font-semibold text-black/40">
        <span>{wordCount} kata</span>
        <span>{charCount} karakter</span>
      </div>
    </div>
  );
}

export function FindReplaceBar({
  visible,
  findText,
  replaceText,
  onFindChange,
  onReplaceChange,
  onReplace,
  onReplaceAll,
  onClear,
  matchCount,
}: {
  visible: boolean;
  findText: string;
  replaceText: string;
  onFindChange: (v: string) => void;
  onReplaceChange: (v: string) => void;
  onReplace: () => void;
  onReplaceAll: () => void;
  onClear: () => void;
  matchCount: number;
}) {
  if (!visible) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b-2 border-black/10 bg-[var(--color-bg)] flex-wrap">
      <input
        type="text"
        value={findText}
        onChange={(e) => onFindChange(e.target.value)}
        placeholder="Cari..."
        className="brutal-input px-2 py-1 text-xs flex-1 min-w-[120px]"
        autoFocus
      />
      <span className="text-[0.65rem] text-black/40 font-semibold">{matchCount} ditemukan</span>
      <input
        type="text"
        value={replaceText}
        onChange={(e) => onReplaceChange(e.target.value)}
        placeholder="Ganti dengan..."
        className="brutal-input px-2 py-1 text-xs flex-1 min-w-[120px]"
      />
      <button onClick={onReplace} className="brutal-btn px-2 py-1 text-[0.65rem]">
        Ganti
      </button>
      <button onClick={onReplaceAll} className="brutal-btn px-2 py-1 text-[0.65rem]">
        Ganti Semua
      </button>
      <button onClick={onClear} className="text-black/40 hover:text-black text-sm px-1 cursor-pointer">
        ×
      </button>
    </div>
  );
}
