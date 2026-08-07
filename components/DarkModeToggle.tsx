"use client";

import { useState, useEffect, useCallback } from "react";
import { Sun, Moon } from "lucide-react";

interface DarkModeToggleProps {
  className?: string;
  compact?: boolean;
}

export default function DarkModeToggle({ className = "", compact = false }: DarkModeToggleProps) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
    setMounted(true);
  }, []);

  const toggle = useCallback(() => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("pidatomu_dark_mode", String(next));
  }, [dark]);

  return (
    <button
      onClick={toggle}
      className={`brutal-btn px-2.5 py-1.5 text-xs flex items-center gap-1.5 ${className}`}
      title={dark ? "Mode Terang" : "Mode Gelap"}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
      {!compact && <span className="hidden sm:inline">{dark ? "Terang" : "Gelap"}</span>}
    </button>
  );
}
