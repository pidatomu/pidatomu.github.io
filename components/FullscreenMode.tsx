"use client";

import { useEffect, useCallback } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

interface FullscreenModeProps {
  children: React.ReactNode;
  isFullscreen: boolean;
  onToggle: () => void;
}

export default function FullscreenMode({
  children,
  isFullscreen,
  onToggle,
}: FullscreenModeProps) {
  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        onToggle();
      }
    },
    [isFullscreen, onToggle]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [handleEsc]);

  return (
    <>
      <button onClick={onToggle} className="brutal-btn p-2" title="Toggle fullscreen">
        {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
      </button>

      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) onToggle();
          }}
        >
          <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] w-full h-full max-w-6xl max-h-[90vh] overflow-auto p-6 transition-all duration-300">
            {children}
          </div>
        </div>
      )}
    </>
  );
}
