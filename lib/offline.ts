const CACHE_PREFIX = "pidatomu_naskah_";
const CACHE_INDEX_KEY = "pidatomu_naskah_index";
const MAX_CACHE = 20;

interface CachedNaskah {
  id: string;
  data: any;
  lastAccessed: number;
}

function getCacheIndex(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CACHE_INDEX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setCacheIndex(index: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(index));
  } catch {
    // Storage full
  }
}

function touchIndex(id: string): string[] {
  const index = getCacheIndex().filter((i) => i !== id);
  index.unshift(id);
  if (index.length > MAX_CACHE) {
    const evicted = index.pop()!;
    localStorage.removeItem(CACHE_PREFIX + evicted);
  }
  setCacheIndex(index);
  return index;
}

export function registerServiceWorker(): void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  navigator.serviceWorker
    .register("/sw.js")
    .catch(() => {
      // SW registration failed silently
    });
}

export function cacheNaskah(id: string, data: any): void {
  if (typeof window === "undefined") return;
  try {
    const item: CachedNaskah = { id, data, lastAccessed: Date.now() };
    localStorage.setItem(CACHE_PREFIX + id, JSON.stringify(item));
    touchIndex(id);
  } catch {
    // Storage full — evict oldest and retry
    const index = getCacheIndex();
    if (index.length > 0) {
      const oldest = index.pop()!;
      localStorage.removeItem(CACHE_PREFIX + oldest);
      setCacheIndex(index);
      try {
        const item: CachedNaskah = { id, data, lastAccessed: Date.now() };
        localStorage.setItem(CACHE_PREFIX + id, JSON.stringify(item));
        touchIndex(id);
      } catch {
        // Still failing
      }
    }
  }
}

export function getCachedNaskah(id: string): any | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + id);
    if (!raw) return null;
    const item: CachedNaskah = JSON.parse(raw);
    touchIndex(id);
    item.lastAccessed = Date.now();
    localStorage.setItem(CACHE_PREFIX + id, JSON.stringify(item));
    return item.data;
  } catch {
    return null;
  }
}

export function getCachedNaskahList(): CachedNaskah[] {
  if (typeof window === "undefined") return [];
  const index = getCacheIndex();
  const items: CachedNaskah[] = [];
  for (const id of index) {
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + id);
      if (raw) items.push(JSON.parse(raw));
    } catch {
      // Skip corrupted entries
    }
  }
  return items;
}

export function removeCachedNaskah(id: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CACHE_PREFIX + id);
    setCacheIndex(getCacheIndex().filter((i) => i !== id));
  } catch {
    // Silent fail
  }
}

export function isOnline(): boolean {
  if (typeof window === "undefined") return true;
  return navigator.onLine;
}
