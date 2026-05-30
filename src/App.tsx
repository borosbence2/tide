import { useCallback, useState } from "react";
import BreathingPacer from "./components/BreathingPacer";
import ActionBar from "./components/ActionBar";
import Grounding from "./components/Grounding";
import Reassurance from "./components/Reassurance";
import Settings from "./components/Settings";
import { DEFAULT_PATTERN_ID, patternById, type Phase } from "./breathing/pattern";
import { usePersistedState } from "./lib/usePersistedState";
import { STORAGE_KEYS } from "./lib/storage";
import { useWakeLock } from "./lib/useWakeLock";
import { playChime } from "./lib/chime";
import "./styles/app.css";

export type Mode = "breathing" | "grounding" | "reassurance" | "settings";

export default function App() {
  // Mode is intentionally NOT persisted — every launch opens calm into breathing.
  const [mode, setMode] = useState<Mode>("breathing");
  // Bumped when returning from a coping flow, to replay the calm lead-in.
  const [restartKey, setRestartKey] = useState(0);

  const returnToBreathing = useCallback(() => {
    setMode("breathing");
    setRestartKey((k) => k + 1);
  }, []);

  const [patternId, setPatternId] = usePersistedState<string>(
    STORAGE_KEYS.patternId,
    DEFAULT_PATTERN_ID,
  );
  const [messages, setMessages] = usePersistedState<string[]>(
    STORAGE_KEYS.messages,
    [],
  );
  const [soundOn, setSoundOn] = usePersistedState<boolean>(
    STORAGE_KEYS.soundOn,
    false,
  );

  const pattern = patternById(patternId);

  // Keep the screen awake whenever the breathing orb is the focus.
  useWakeLock(mode === "breathing" || mode === "grounding");

  const onPhaseChange = useCallback(
    (phase: Phase) => {
      if (soundOn) playChime(phase);
    },
    [soundOn],
  );

  const dimmed = mode !== "breathing";

  return (
    <main className="app">
      <BreathingPacer
        pattern={pattern}
        dimmed={dimmed}
        restartKey={restartKey}
        onPhaseChange={onPhaseChange}
      />

      {mode === "breathing" && <ActionBar onGo={setMode} />}
      {mode === "grounding" && <Grounding onClose={returnToBreathing} />}
      {mode === "reassurance" && (
        <Reassurance messages={messages} onClose={returnToBreathing} />
      )}
      {mode === "settings" && (
        <Settings
          patternId={patternId}
          setPatternId={setPatternId}
          soundOn={soundOn}
          setSoundOn={setSoundOn}
          messages={messages}
          setMessages={setMessages}
          onClose={() => setMode("breathing")}
        />
      )}
    </main>
  );
}
