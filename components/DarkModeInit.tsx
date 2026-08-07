"use client";

import { useEffect } from "react";

export default function DarkModeInit() {
  useEffect(() => {
    const saved = localStorage.getItem("pidatomu_dark_mode");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = saved === "true" || (saved === null && prefersDark);
    document.documentElement.classList.toggle("dark", shouldBeDark);
  }, []);

  return null;
}
