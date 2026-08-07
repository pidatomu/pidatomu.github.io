// ─── Version History Manager ────────────────────────────────────────────────

import { storage } from "./storage";

export interface Version {
  id: string;
  timestamp: number;
  content: string;
  label: string;
}

const VERSIONS_KEY = "versions";
const MAX_VERSIONS = 20;

export function saveVersion(content: string, label?: string): Version {
  const versions = getVersions();
  const nextNumber = versions.length + 1;
  const newVersion: Version = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    content,
    label: label ?? `v${nextNumber}`,
  };
  const updated = [newVersion, ...versions].slice(0, MAX_VERSIONS);
  storage.set(VERSIONS_KEY, updated);
  return newVersion;
}

export function getVersions(): Version[] {
  return storage.get<Version[]>(VERSIONS_KEY) ?? [];
}

export function getVersion(id: string): Version | undefined {
  return getVersions().find((v) => v.id === id);
}

export function deleteVersion(id: string): void {
  const updated = getVersions().filter((v) => v.id !== id);
  storage.set(VERSIONS_KEY, updated);
}

export function clearVersions(): void {
  storage.set(VERSIONS_KEY, []);
}

export interface DiffLine {
  type: "added" | "removed" | "unchanged";
  line: string;
  lineNumber: number;
}

export function diffVersions(id1: string, id2: string): DiffLine[] | null {
  const v1 = getVersion(id1);
  const v2 = getVersion(id2);
  if (!v1 || !v2) return null;

  const lines1 = v1.content.split("\n");
  const lines2 = v2.content.split("\n");
  const result: DiffLine[] = [];

  const maxLen = Math.max(lines1.length, lines2.length);

  for (let i = 0; i < maxLen; i++) {
    const l1 = lines1[i];
    const l2 = lines2[i];

    if (l1 === undefined) {
      result.push({ type: "added", line: l2, lineNumber: i + 1 });
    } else if (l2 === undefined) {
      result.push({ type: "removed", line: l1, lineNumber: i + 1 });
    } else if (l1 === l2) {
      result.push({ type: "unchanged", line: l1, lineNumber: i + 1 });
    } else {
      result.push({ type: "removed", line: l1, lineNumber: i + 1 });
      result.push({ type: "added", line: l2, lineNumber: i + 1 });
    }
  }

  return result;
}
