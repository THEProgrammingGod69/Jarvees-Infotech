export type TerminalLine = { kind: "cmd" | "out" | "ok"; text: string };

const tone = { cmd: "text-frost", out: "text-haze", ok: "text-cyan" } as const;

/**
 * A terminal that types itself the first time it scrolls into view
 * (motion/text.ts). Every line is rendered in full on the server — the
 * untyped remainder is merely transparent while it types — so the box has
 * its final size from the first paint, and crawlers, screen readers and
 * visitors without JavaScript get all of it.
 */
export default function Terminal({ title, lines }: { title: string; lines: TerminalLine[] }) {
  return (
    <div data-terminal className="holo hud-corners overflow-hidden font-mono text-small">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-magenta/80" />
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-violet/80" />
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-cyan/80" />
        <span className="label ml-3 text-haze">{title}</span>
      </div>
      <div className="space-y-1.5 p-5 sm:p-6">
        {lines.map((line, i) => (
          <p key={i} data-line className={`${tone[line.kind]} break-words`}>
            {line.kind === "cmd" && (
              <span aria-hidden="true" className="mr-2 text-violet select-none">
                ❯
              </span>
            )}
            <span data-typed>{line.text}</span>
            <span data-rest className="text-transparent" />
          </p>
        ))}
      </div>
    </div>
  );
}
