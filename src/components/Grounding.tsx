import { useState } from "react";
import { GROUNDING_STEPS } from "../data/grounding";

/**
 * 5-4-3-2-1 grounding. One sense at a time, large tap target, no typing — just
 * "I did it → Next". The breath keeps going dimmed behind this overlay.
 */
export default function Grounding({ onClose }: { onClose: () => void }) {
  const [i, setI] = useState(0);
  const step = GROUNDING_STEPS[i];
  const last = i === GROUNDING_STEPS.length - 1;

  const next = () => (last ? onClose() : setI(i + 1));

  return (
    <div className="overlay grounding">
      <button className="overlay__close" onClick={onClose} aria-label="Close">
        ✕
      </button>

      <div className="grounding__body">
        <div className="grounding__count" aria-hidden="true">
          {step.count}
        </div>
        <p className="grounding__prompt">{step.prompt}</p>
        <p className="grounding__hint">Take your time. There's no rush.</p>
      </div>

      <div className="grounding__dots" aria-hidden="true">
        {GROUNDING_STEPS.map((s, idx) => (
          <span
            key={s.count}
            className={`dot${idx === i ? " dot--active" : ""}${
              idx < i ? " dot--done" : ""
            }`}
          />
        ))}
      </div>

      <button className="bigbtn" onClick={next}>
        {last ? "Done" : "Next"}
      </button>
    </div>
  );
}
