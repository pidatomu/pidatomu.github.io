"use client";

import { useState, useMemo } from "react";
import { X, Search } from "lucide-react";
import { TEMPLATES as templates, Template } from "@/lib/templates";

interface TemplateLibraryProps {
  onSelect: (template: Template) => void;
  onClose: () => void;
}

export default function TemplateLibrary({ onSelect, onClose }: TemplateLibraryProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");

  const categories = useMemo(() => {
    const cats = Array.from(new Set(templates.map((t) => t.kategori)));
    return ["Semua", ...cats];
  }, []);

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      const matchCategory = activeCategory === "Semua" || t.kategori === activeCategory;
      const matchSearch =
        search === "" ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [search, activeCategory]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="brutal-card bg-white w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b-4 border-black">
          <h2 className="text-xl font-black uppercase tracking-tight">Pustaka Template</h2>
          <button onClick={onClose} className="brutal-btn p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b-2 border-black flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              type="text"
              placeholder="Cari template..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="brutal-input w-full pl-9 text-sm"
            />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`brutal-btn text-xs whitespace-nowrap ${
                  activeCategory === cat ? "bg-yellow-300" : ""
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <p className="text-center opacity-60 py-8">Tidak ada template ditemukan.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filtered.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => {
                    onSelect(tpl);
                    onClose();
                  }}
                  className="brutal-card p-4 text-left hover:bg-yellow-200 transition-colors cursor-pointer"
                >
                  <h3 className="font-black text-sm uppercase mb-1">{tpl.name}</h3>
                  <p className="text-xs opacity-70 mb-2 line-clamp-2">{tpl.description}</p>
                  <div className="flex items-center gap-2 text-xs opacity-50 mb-2">
                    <span>{tpl.defaultDurasi} mnt</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tpl.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-200 border border-black px-1.5 py-0.5 text-[10px] font-mono"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
