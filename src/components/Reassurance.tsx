import { useMemo, useState } from "react";
import { DEFAULT_REASSURANCE } from "../data/reassurance";

/**
 * Slow-fading reassurance cards. The user's own messages ("a letter from
 * calm-you") come first; built-in lines follow as a gentle fallback.
 */
export default function Reassurance({
  messages,
  onClose,
}: {
  messages: string[];
  onClose: () => void;
}) {
  const cards = useMemo(() => {
    const own = messages.map((t) => t.trim()).filter(Boolean);
    return [...own, ...DEFAULT_REASSURANCE];
  }, [messages]);

  const [i, setI] = useState(0);
  // Bump a key so each card re-triggers its fade-in animation.
  const [tick, setTick] = useState(0);

  const next = () => {
    setI((i + 1) % cards.length);
    setTick((t) => t + 1);
  };

  return (
    <div className="overlay reassurance">
      <button className="overlay__close" onClick={onClose} aria-label="Close">
        ✕
      </button>

      <button className="reassurance__card" key={tick} onClick={next}>
        <p className="reassurance__text">{cards[i]}</p>
      </button>

      <p className="reassurance__hint">Tap for another</p>
    </div>
  );
}
