"use client";

import { X, Clock, Tag } from "lucide-react";

interface TemplatePreviewProps {
  template: {
    id: string;
    name: string;
    description: string;
    kategori: string;
    defaultDurasi: number;
    prompt: string;
    tags: string[];
  };
  onUse: () => void;
  onClose: () => void;
}

export default function TemplatePreview({
  template,
  onUse,
  onClose,
}: TemplatePreviewProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="brutal-card bg-white w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b-4 border-black">
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight">
              {template.name}
            </h2>
            <p className="text-xs opacity-60 mt-0.5">{template.kategori}</p>
          </div>
          <button onClick={onClose} className="brutal-btn p-1">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <p className="text-sm">{template.description}</p>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1 opacity-70">
              <Clock size={14} />
              <span>{template.defaultDurasi} menit</span>
            </div>
            <div className="flex items-center gap-1 opacity-70">
              <Tag size={14} />
              <span>{template.tags.join(", ")}</span>
            </div>
          </div>

          <div className="border-2 border-black p-3 bg-gray-50">
            <p className="text-[10px] font-black uppercase tracking-tight opacity-50 mb-1">
              Prompt / Instruksi
            </p>
            <p className="text-xs leading-relaxed whitespace-pre-wrap">
              {template.prompt}
            </p>
          </div>
        </div>

        <div className="p-4 border-t-4 border-black flex gap-2">
          <button onClick={onClose} className="brutal-btn flex-1 py-2 text-sm">
            Close
          </button>
          <button
            onClick={onUse}
            className="brutal-btn bg-yellow-300 flex-1 py-2 text-sm"
          >
            Use Template
          </button>
        </div>
      </div>
    </div>
  );
}
