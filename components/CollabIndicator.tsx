"use client";

import { useState } from "react";
import { Users, Share2, Copy, Check } from "lucide-react";

interface Collaborator {
  id: string;
  name: string;
  color: string;
}

interface CollabIndicatorProps {
  sessionId: string;
  collaborators: Collaborator[];
}

export default function CollabIndicator({ sessionId, collaborators }: CollabIndicatorProps) {
  const [copied, setCopied] = useState(false);

  const sessionLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/collab/${sessionId}`
      : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sessionLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="brutal-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wide flex items-center gap-2">
          <Users className="w-3 h-3" />
          Kolaborasi
        </h4>
        <span className="text-[0.6rem] font-bold bg-[var(--color-accent-2)] border-2 border-[var(--color-ink)] px-2 py-0.5 uppercase">
          {collaborators.length} online
        </span>
      </div>

      {/* Collaborator avatars */}
      <div className="flex items-center gap-1">
        {collaborators.map((c) => (
          <div
            key={c.id}
            className="relative group"
            title={c.name}
          >
            <div
              className="w-8 h-8 border-2 border-[var(--color-ink)] flex items-center justify-center text-[0.6rem] font-black uppercase"
              style={{ backgroundColor: c.color }}
            >
              {c.name.charAt(0)}
            </div>
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
              style={{ backgroundColor: "#22c55e" }}
            />
          </div>
        ))}
        {collaborators.length === 0 && (
          <p className="text-[0.65rem] font-semibold text-black/40">
            Belum ada kolaborator
          </p>
        )}
      </div>

      {/* Share link */}
      <div className="flex gap-2">
        <button
          onClick={handleCopyLink}
          className="brutal-btn flex-1 py-2 text-xs font-bold flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              Disalin!
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Salin Link Sesi
            </>
          )}
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(
            `Ayo kolaborasi naskah pidato! Bergabung di: ${sessionLink}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="brutal-btn px-3 py-2 text-xs font-bold flex items-center gap-2 bg-white"
        >
          <Share2 className="w-3 h-3" />
        </a>
      </div>

      <p className="text-[0.6rem] font-medium text-black/40 text-center">
        Bagikan link ini untuk mengundang kolaborator
      </p>
    </div>
  );
}
