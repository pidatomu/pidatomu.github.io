// ─── Keyboard Shortcut Definitions ──────────────────────────────────────────

export interface Shortcut {
  id: string;
  keys: string;
  label: string;
  description: string;
  category: string;
}

export const SHORTCUTS: Shortcut[] = [
  { id: "generate", keys: "Ctrl+Enter", label: "Generate", description: "Buat naskah baru", category: "Aksi" },
  { id: "save-draft", keys: "Ctrl+S", label: "Save Draft", description: "Simpan draft saat ini", category: "Aksi" },
  { id: "export-txt", keys: "Ctrl+Shift+T", label: "Export TXT", description: "Download sebagai TXT", category: "Export" },
  { id: "export-pdf", keys: "Ctrl+Shift+P", label: "Export PDF", description: "Download sebagai PDF", category: "Export" },
  { id: "export-docx", keys: "Ctrl+Shift+W", label: "Export DOCX", description: "Download sebagai Word", category: "Export" },
  { id: "copy-text", keys: "Ctrl+Shift+C", label: "Copy Teks", description: "Salin teks naskah", category: "Aksi" },
  { id: "toggle-edit", keys: "Ctrl+E", label: "Edit Mode", description: "Toggle mode edit", category: "Editor" },
  { id: "find-replace", keys: "Ctrl+H", label: "Find & Replace", description: "Cari dan ganti teks", category: "Editor" },
  { id: "print", keys: "Ctrl+P", label: "Print", description: "Cetak naskah", category: "Export" },
  { id: "focus-theme", keys: "/", label: "Focus Tema", description: "Fokus ke input tema", category: "Navigasi" },
  { id: "escape", keys: "Escape", label: "Close", description: "Tutup panel/return", category: "Navigasi" },
  { id: "toggle-dark", keys: "Ctrl+D", label: "Dark Mode", description: "Toggle mode gelap", category: "Tampilan" },
  { id: "font-up", keys: "Ctrl+=", label: "Font +", description: "Perbesar font", category: "Tampilan" },
  { id: "font-down", keys: "Ctrl+-", label: "Font -", description: "Perkecil font", category: "Tampilan" },
  { id: "undo", keys: "Ctrl+Z", label: "Undo", description: "Urungkan perubahan", category: "Editor" },
  { id: "redo", keys: "Ctrl+Y", label: "Redo", description: "Ulangi perubahan", category: "Editor" },
];

export function parseShortcut(keys: string): { ctrl: boolean; shift: boolean; alt: boolean; key: string } {
  const parts = keys.split("+");
  return {
    ctrl: parts.includes("Ctrl"),
    shift: parts.includes("Shift"),
    alt: parts.includes("Alt"),
    key: parts[parts.length - 1].toLowerCase(),
  };
}

export function matchShortcut(
  e: KeyboardEvent,
  shortcut: Shortcut
): boolean {
  const parsed = parseShortcut(shortcut.keys);
  return (
    e.ctrlKey === parsed.ctrl &&
    e.shiftKey === parsed.shift &&
    e.altKey === parsed.alt &&
    e.key.toLowerCase() === parsed.key
  );
}

export function findMatchingShortcut(e: KeyboardEvent): Shortcut | null {
  return SHORTCUTS.find((s) => matchShortcut(e, s)) ?? null;
}
