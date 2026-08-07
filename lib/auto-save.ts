const PREFIX = "pidatomu_autosave_";
const TIMESTAMP_SUFFIX = "_timestamp";
const DEFAULT_INTERVAL = 30000;

const intervals = new Map<string, ReturnType<typeof setInterval>>();

export function startAutoSave(
  key: string,
  getter: () => string,
  intervalMs: number = DEFAULT_INTERVAL
): () => void {
  stopAutoSave(key);

  const save = () => {
    const current = getter();
    const stored = getAutoSaveData(key);
    if (current !== stored) {
      saveData(key, current);
    }
  };

  const id = setInterval(save, intervalMs);
  intervals.set(key, id);

  return () => stopAutoSave(key);
}

export function stopAutoSave(key: string): void {
  const id = intervals.get(key);
  if (id) {
    clearInterval(id);
    intervals.delete(key);
  }
}

export function getLastSaveTime(key: string): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PREFIX + key + TIMESTAMP_SUFFIX);
    return raw ? Number(raw) : null;
  } catch {
    return null;
  }
}

export function getAutoSaveData(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

function saveData(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFIX + key, value);
    localStorage.setItem(PREFIX + key + TIMESTAMP_SUFFIX, String(Date.now()));
  } catch {
    // Silently fail if storage is full
  }
}
