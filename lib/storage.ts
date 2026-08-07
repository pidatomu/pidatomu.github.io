// ─── LocalStorage Helpers with TTL & Type Safety ─────────────────────────────

interface StorageItem<T> {
  value: T;
  expires?: number;
  createdAt: number;
}

const PREFIX = "pidatomu_";

export const storage = {
  get<T>(key: string): T | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (!raw) return null;
      const item: StorageItem<T> = JSON.parse(raw);
      if (item.expires && Date.now() > item.expires) {
        localStorage.removeItem(PREFIX + key);
        return null;
      }
      return item.value;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T, ttlMs?: number): void {
    if (typeof window === "undefined") return;
    const item: StorageItem<T> = {
      value,
      createdAt: Date.now(),
      expires: ttlMs ? Date.now() + ttlMs : undefined,
    };
    localStorage.setItem(PREFIX + key, JSON.stringify(item));
  },

  remove(key: string): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(PREFIX + key);
  },

  has(key: string): boolean {
    return this.get(key) !== null;
  },

  clear(): void {
    if (typeof window === "undefined") return;
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(PREFIX));
    keys.forEach((k) => localStorage.removeItem(k));
  },
};

// ─── Draft Management ───────────────────────────────────────────────────────

export interface Draft {
  id: string;
  kategori: string;
  tema: string;
  durasi: number;
  gayaBahasa: string;
  namaPenceramah?: string;
  namaLokasi?: string;
  tanggal?: string;
  targetAudiens?: string;
  tujuanPidato?: string;
  nadaEmosi?: number;
  kutipanHadits?: boolean;
  kutipanQuran?: boolean;
  ceritaPengantar?: boolean;
  savedAt: number;
}

const DRAFTS_KEY = "drafts";
const MAX_DRAFTS = 10;

export function saveDraft(draft: Omit<Draft, "id" | "savedAt">): Draft {
  const existing = getDrafts();
  const newDraft: Draft = {
    ...draft,
    id: crypto.randomUUID(),
    savedAt: Date.now(),
  };
  const updated = [newDraft, ...existing].slice(0, MAX_DRAFTS);
  storage.set(DRAFTS_KEY, updated);
  return newDraft;
}

export function getDrafts(): Draft[] {
  return storage.get<Draft[]>(DRAFTS_KEY) ?? [];
}

export function deleteDraft(id: string): void {
  const drafts = getDrafts().filter((d) => d.id !== id);
  storage.set(DRAFTS_KEY, drafts);
}

// ─── Favorite Themes ────────────────────────────────────────────────────────

const FAVORITES_KEY = "favorite_themes";
const MAX_FAVORITES = 20;

export function getFavoriteThemes(): string[] {
  return storage.get<string[]>(FAVORITES_KEY) ?? [];
}

export function toggleFavoriteTheme(theme: string): string[] {
  const current = getFavoriteThemes();
  const idx = current.indexOf(theme);
  const updated = idx >= 0 ? current.filter((t) => t !== theme) : [theme, ...current].slice(0, MAX_FAVORITES);
  storage.set(FAVORITES_KEY, updated);
  return updated;
}

// ─── Recent Themes ──────────────────────────────────────────────────────────

const RECENT_KEY = "recent_themes";
const MAX_RECENT = 15;

export function getRecentThemes(): string[] {
  return storage.get<string[]>(RECENT_KEY) ?? [];
}

export function addRecentTheme(theme: string): string[] {
  const current = getRecentThemes().filter((t) => t !== theme);
  const updated = [theme, ...current].slice(0, MAX_RECENT);
  storage.set(RECENT_KEY, updated);
  return updated;
}

// ─── Settings ───────────────────────────────────────────────────────────────

export interface AppSettings {
  darkMode: boolean;
  defaultKategori: string;
  defaultGaya: string;
  defaultDurasi: number;
  autoSave: boolean;
  soundEnabled: boolean;
  fontSize: "sm" | "md" | "lg";
  showReadingLevel: boolean;
  showKeywordDensity: boolean;
  showSentiment: boolean;
  showAdvancedStats: boolean;
}

const SETTINGS_KEY = "settings";

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  defaultKategori: "Khutbah Jumat",
  defaultGaya: "formal",
  defaultDurasi: 10,
  autoSave: true,
  soundEnabled: false,
  fontSize: "md",
  showReadingLevel: true,
  showKeywordDensity: true,
  showSentiment: true,
  showAdvancedStats: false,
};

export function getSettings(): AppSettings {
  return { ...DEFAULT_SETTINGS, ...storage.get<AppSettings>(SETTINGS_KEY) };
}

export function updateSettings(partial: Partial<AppSettings>): AppSettings {
  const current = getSettings();
  const updated = { ...current, ...partial };
  storage.set(SETTINGS_KEY, updated);
  return updated;
}

// ─── Statistics ─────────────────────────────────────────────────────────────

export interface UserStats {
  totalGenerated: number;
  totalWords: number;
  totalChars: number;
  byCategory: Record<string, number>;
  byStyle: Record<string, number>;
  lastGeneratedAt: number | null;
}

const STATS_KEY = "user_stats";

const DEFAULT_STATS: UserStats = {
  totalGenerated: 0,
  totalWords: 0,
  totalChars: 0,
  byCategory: {},
  byStyle: {},
  lastGeneratedAt: null,
};

export function getStats(): UserStats {
  return { ...DEFAULT_STATS, ...storage.get<UserStats>(STATS_KEY) };
}

export function updateStats(data: { words: number; chars: number; category: string; style: string }): UserStats {
  const current = getStats();
  const updated: UserStats = {
    totalGenerated: current.totalGenerated + 1,
    totalWords: current.totalWords + data.words,
    totalChars: current.totalChars + data.chars,
    byCategory: {
      ...current.byCategory,
      [data.category]: (current.byCategory[data.category] || 0) + 1,
    },
    byStyle: {
      ...current.byStyle,
      [data.style]: (current.byStyle[data.style] || 0) + 1,
    },
    lastGeneratedAt: Date.now(),
  };
  storage.set(STATS_KEY, updated);
  return updated;
}

// ─── Keyboard Shortcuts State ────────────────────────────────────────────────

const SHORTCUTS_KEY = "shortcuts_enabled";

export function getShortcutsEnabled(): boolean {
  return storage.get<boolean>(SHORTCUTS_KEY) ?? true;
}

export function setShortcutsEnabled(enabled: boolean): void {
  storage.set(SHORTCUTS_KEY, enabled);
}
