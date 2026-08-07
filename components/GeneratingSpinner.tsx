"use client";

import { Loader2 } from "lucide-react";

interface GeneratingSpinnerProps {
  status?: "generating" | "refining";
}

export default function GeneratingSpinner({ status = "generating" }: GeneratingSpinnerProps) {
  return (
    <div className="brutal-card p-8 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-[var(--color-accent)]" />
      <div className="text-center">
        <p className="text-sm font-bold uppercase tracking-wide">
          {status === "refining" ? "Refining naskah..." : "Menyusun naskah"}
          <span className="loading-dots" />
        </p>
        <p className="text-[0.65rem] text-black/40 mt-1 font-medium">
          {status === "refining"
            ? "Menyesuaikan panjang naskah agar sesuai target..."
            : "AI sedang menulis naskah untukmu..."}
        </p>
      </div>
      <div className="w-48 h-1.5 bg-black/10 border border-black/20 overflow-hidden">
        <div className="h-full bg-[var(--color-accent)] animate-pulse" style={{ width: "60%" }} />
      </div>
    </div>
  );
}
