import { useEffect, useState } from "react";
import { loadJSON, saveJSON } from "./storage";

/** Like useState, but transparently persisted to localStorage under `key`. */
export function usePersistedState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => loadJSON(key, initial));
  useEffect(() => {
    saveJSON(key, value);
  }, [key, value]);
  return [value, setValue] as const;
}
