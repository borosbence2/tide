import type { Mode } from "../App";

/**
 * The only things on screen besides the breath. Deliberately sparse: two gentle
 * options for when breathing alone isn't enough, plus a quiet settings entry.
 */
export default function ActionBar({ onGo }: { onGo: (mode: Mode) => void }) {
  return (
    <div className="actionbar">
      <div className="actionbar__row">
        <button className="actionbar__btn" onClick={() => onGo("grounding")}>
          I feel unreal
        </button>
        <button className="actionbar__btn" onClick={() => onGo("reassurance")}>
          Tell me I'm okay
        </button>
      </div>
      <button className="actionbar__settings" onClick={() => onGo("settings")}>
        Settings
      </button>
    </div>
  );
}
