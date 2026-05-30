import { useEffect } from "react";

/**
 * Holds a Screen Wake Lock while `active`, so the display doesn't dim mid-breath.
 * Re-acquires on visibility change (the lock is dropped when the tab is hidden).
 * Silently no-ops where the API is unavailable.
 */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;

    let lock: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        lock = await navigator.wakeLock.request("screen");
      } catch {
        // User gesture missing, low battery, etc. — not critical.
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible" && !cancelled) acquire();
    };

    acquire();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      lock?.release().catch(() => {});
    };
  }, [active]);
}
