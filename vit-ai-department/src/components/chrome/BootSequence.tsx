/**
 * The first-load boot sequence — a 1.5-second terminal handshake.
 *
 * Pure CSS: it plays and dismisses itself without JavaScript, so it can
 * never strand a visitor behind it. An inline head script marks the session
 * as booted, so it plays once per visit rather than on every page; reduced
 * motion removes it entirely. Decorative, so hidden from assistive tech.
 */
const LINES = [
  { text: "VIT-PUNE :: CSE(AI) :: NEURAL CORE v3", tone: "text-frost" },
  { text: "loading weights ............... ok", tone: "text-haze" },
  { text: "calibrating 360 neurons ...... ok", tone: "text-haze" },
  { text: "opening synapses ............. ok", tone: "text-haze" },
  { text: "signal acquired.", tone: "text-cyan" },
];

export default function BootSequence() {
  return (
    <div aria-hidden="true" className="boot fixed inset-0 z-[200] grid place-items-center bg-void">
      <div className="w-[min(88vw,30rem)] font-mono text-small">
        {LINES.map((l, i) => (
          <p key={l.text} className={`boot__line ${l.tone}`} style={{ ["--d" as string]: `${120 + i * 210}ms` }}>
            <span className="mr-2 text-violet">❯</span>
            {l.text}
          </p>
        ))}
        <div className="mt-6 h-px w-full overflow-hidden bg-line">
          <div className="boot__bar h-full w-full bg-gradient-to-r from-cyan via-violet to-magenta" />
        </div>
      </div>
    </div>
  );
}
