"use client";

import { useState } from "react";
import { GripVertical } from "lucide-react";

interface Section {
  id: string;
  title: string;
  content: string;
}

interface DragReorderProps {
  sections: Section[];
  onReorder: (sections: Section[]) => void;
}

export default function DragReorder({ sections, onReorder }: DragReorderProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  function handleDragStart(e: React.DragEvent, id: string) {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id !== draggedId) setOverId(id);
  }

  function handleDragLeave() {
    setOverId(null);
  }

  function handleDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setOverId(null);
      return;
    }

    const fromIdx = sections.findIndex((s) => s.id === draggedId);
    const toIdx = sections.findIndex((s) => s.id === targetId);
    const reordered = [...sections];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    onReorder(reordered);
    setDraggedId(null);
    setOverId(null);
  }

  function handleDragEnd() {
    setDraggedId(null);
    setOverId(null);
  }

  return (
    <div className="space-y-2">
      {sections.map((section) => {
        const isDragging = section.id === draggedId;
        const isOver = section.id === overId && section.id !== draggedId;

        return (
          <div
            key={section.id}
            draggable
            onDragStart={(e) => handleDragStart(e, section.id)}
            onDragOver={(e) => handleDragOver(e, section.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, section.id)}
            onDragEnd={handleDragEnd}
            className={`brutal-card p-3 flex items-start gap-3 transition-opacity ${
              isDragging ? "opacity-40" : ""
            } ${isOver ? "border-[var(--color-accent)] shadow-[6px_6px_0_var(--color-accent)]" : ""}`}
          >
            <div className="mt-0.5 cursor-grab active:cursor-grabbing shrink-0 text-black/40 hover:text-[var(--color-ink)] transition-colors">
              <GripVertical className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold uppercase tracking-wide mb-1">{section.title}</h4>
              <p className="text-xs text-black/60 line-clamp-2 leading-relaxed">
                {section.content}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
