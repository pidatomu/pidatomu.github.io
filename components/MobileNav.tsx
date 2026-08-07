"use client";

import { PenLine, Clock, LayoutTemplate } from "lucide-react";

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: "naskah", label: "Buat Naskah", icon: <PenLine className="w-4 h-4" /> },
  { id: "riwayat", label: "Riwayat", icon: <Clock className="w-4 h-4" /> },
  { id: "template", label: "Template", icon: <LayoutTemplate className="w-4 h-4" /> },
];

export default function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t-[3px] border-[var(--color-ink)] bg-[var(--color-card)]">
      <div className="flex">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-[0.65rem] font-bold uppercase tracking-wide transition-colors ${
              activeTab === tab.id
                ? "bg-[var(--color-accent)] text-[var(--color-ink)]"
                : "bg-[var(--color-card)] text-[var(--color-ink)] hover:bg-[var(--color-accent)]/20"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
