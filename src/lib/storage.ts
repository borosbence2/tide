// Tiny localStorage wrapper. Everything stays on the device — nothing is ever
// uploaded. JSON export/import guards against iOS evicting site data.

const PREFIX = "tide:";

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable (e.g. private mode) — fail quietly.
  }
}

export const STORAGE_KEYS = {
  patternId: "patternId",
  messages: "messages",
  soundOn: "soundOn",
} as const;

export interface BackupShape {
  app: "tide";
  version: 1;
  exportedAt: string;
  patternId: string;
  messages: string[];
}

/** Download the user's settings + messages as a JSON file they can keep safe. */
export function exportBackup(data: Omit<BackupShape, "app" | "version" | "exportedAt">) {
  const payload: BackupShape = {
    app: "tide",
    version: 1,
    exportedAt: new Date().toISOString(),
    ...data,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tide-backup-${payload.exportedAt.slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Parse + validate an imported backup file. Returns null if it isn't ours. */
export function parseBackup(text: string): BackupShape | null {
  try {
    const data = JSON.parse(text);
    if (data?.app !== "tide" || !Array.isArray(data.messages)) return null;
    return data as BackupShape;
  } catch {
    return null;
  }
}
