"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil, Check } from "lucide-react";

interface InlineEditorProps {
  content: string;
  onChange: (newContent: string) => void;
  section?: string;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function InlineEditor({ content, onChange, section }: InlineEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(content);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      const range = document.createRange();
      range.selectNodeContents(inputRef.current);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditing]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        if (isEditing) save();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  });

  function save() {
    const text = inputRef.current?.innerText ?? draft;
    onChange(text);
    setDraft(text);
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      save();
    }
    if (e.key === "Escape") {
      setDraft(content);
      setIsEditing(false);
    }
  }

  return (
    <div
      ref={ref}
      className="brutal-card p-3 group relative"
    >
      {!isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[var(--color-accent)]"
          aria-label="Edit paragraph"
        >
          <Pencil className="w-3 h-3" />
        </button>
      )}

      {isEditing ? (
        <>
          <div
            ref={inputRef}
            contentEditable
            suppressContentEditableWarning
            className="outline-none text-sm leading-relaxed min-h-[1.5rem] whitespace-pre-wrap"
            onKeyDown={handleKeyDown}
            onInput={(e) => setDraft((e.target as HTMLDivElement).innerText)}
          />
          <button
            onClick={save}
            className="mt-2 inline-flex items-center gap-1 text-[0.6rem] font-bold uppercase tracking-wide text-[var(--color-accent)]"
          >
            <Check className="w-3 h-3" />
            Simpan
          </button>
        </>
      ) : (
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
      )}

      <div className="mt-2 flex items-center gap-2">
        {section && (
          <span className="text-[0.6rem] font-semibold uppercase tracking-wide text-black/40">
            {section}
          </span>
        )}
        <span className="text-[0.6rem] font-medium text-black/30">
          {countWords(isEditing ? draft : content)} kata
        </span>
      </div>
    </div>
  );
}
