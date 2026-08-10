/**
 * Renders a JSON-LD block.
 *
 * The payload is built by `src/lib/jsonld.ts` from typed site data, never from
 * user input, so serialising it is safe. `undefined` values are dropped by
 * JSON.stringify, which is how optional schema fields (an unknown duration,
 * for instance) simply disappear rather than emitting null.
 */
export default function JsonLd({
  id,
  data,
}: {
  id: string;
  data: Record<string, unknown>;
}) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
