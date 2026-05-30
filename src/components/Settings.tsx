import { useRef } from "react";
import { PRESETS } from "../breathing/pattern";
import { exportBackup, parseBackup } from "../lib/storage";

/**
 * Calm-moment configuration: breathing preset, sound, and the "letter from
 * calm-you" message editor. Tucked away so it's never in the way mid-attack.
 */
export default function Settings({
  patternId,
  setPatternId,
  soundOn,
  setSoundOn,
  messages,
  setMessages,
  onClose,
}: {
  patternId: string;
  setPatternId: (id: string) => void;
  soundOn: boolean;
  setSoundOn: (on: boolean) => void;
  messages: string[];
  setMessages: (m: string[]) => void;
  onClose: () => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const updateMessage = (idx: number, text: string) =>
    setMessages(messages.map((m, i) => (i === idx ? text : m)));
  const removeMessage = (idx: number) =>
    setMessages(messages.filter((_, i) => i !== idx));
  const addMessage = () => setMessages([...messages, ""]);

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const backup = parseBackup(await file.text());
    if (!backup) {
      alert("That doesn't look like a Tide backup file.");
      return;
    }
    setMessages(backup.messages);
    if (backup.patternId) setPatternId(backup.patternId);
    e.target.value = "";
  };

  return (
    <div className="overlay settings">
      <header className="settings__head">
        <h1>Settings</h1>
        <button className="overlay__close" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </header>

      <div className="settings__scroll">
        <section className="settings__section">
          <h2>Breathing rhythm</h2>
          {PRESETS.map((p) => (
            <label key={p.id} className="row">
              <input
                type="radio"
                name="pattern"
                checked={patternId === p.id}
                onChange={() => setPatternId(p.id)}
              />
              <span>{p.name}</span>
            </label>
          ))}
        </section>

        <section className="settings__section">
          <h2>Sound</h2>
          <label className="row">
            <input
              type="checkbox"
              checked={soundOn}
              onChange={(e) => setSoundOn(e.target.checked)}
            />
            <span>Gentle tone with each breath</span>
          </label>
        </section>

        <section className="settings__section">
          <h2>A letter from calm-you</h2>
          <p className="settings__hint">
            Words you'd want to hear mid-panic. These appear first under “Tell me
            I'm okay”.
          </p>
          {messages.map((m, i) => (
            <div className="msg" key={i}>
              <textarea
                value={m}
                rows={2}
                placeholder="Write something kind to your future self…"
                onChange={(e) => updateMessage(i, e.target.value)}
              />
              <button
                className="msg__del"
                onClick={() => removeMessage(i)}
                aria-label="Delete message"
              >
                ✕
              </button>
            </div>
          ))}
          <button className="linkbtn" onClick={addMessage}>
            + Add a message
          </button>
        </section>

        <section className="settings__section">
          <h2>Backup</h2>
          <p className="settings__hint">
            Your messages live only on this device. Save a copy so you never lose
            them.
          </p>
          <div className="settings__buttons">
            <button
              className="linkbtn"
              onClick={() => exportBackup({ patternId, messages })}
            >
              Export backup
            </button>
            <button className="linkbtn" onClick={() => fileRef.current?.click()}>
              Import backup
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              hidden
              onChange={onImport}
            />
          </div>
        </section>

        <p className="settings__footer">
          Tide is a companion, not a substitute for care. If panic attacks are
          frequent or severe, please reach out to a doctor or therapist.
        </p>
      </div>
    </div>
  );
}
