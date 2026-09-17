import { DiagramShell } from "@/components/diagrams/diagram-shell";

const LAYERS = [
  {
    job: "Timeline",
    stores: "What happened, when, across domains",
    value: "Cross-domain questions become a timeline, not a scavenger hunt",
    gate: "Events only - not opinions",
  },
  {
    job: "Lessons",
    stores: "Short reusable edges and failures",
    value: "The next prompt starts wiser without replaying the whole chat",
    gate: "Only after a claim is verified",
  },
  {
    job: "Scoreboard",
    stores: "Claims matched to outcomes",
    value: "Authority follows who was right, not who sounded sure",
    gate: "Unverified guesses never become weight",
  },
] as const;

export function MemoryThreeJobsDiagram() {
  return (
    <DiagramShell title="THREE MEMORY JOBS" interactive={false}>
      <div className="mb-5 grid gap-3 md:grid-cols-3">
        {LAYERS.map((layer) => (
          <div
            key={layer.job}
            className="rounded border border-waste-border bg-waste-bg/60 p-4"
          >
            <div className="font-mono text-xs tracking-widest text-waste-amber">
              {layer.job.toUpperCase()}
            </div>
            <p className="mt-2 text-sm font-medium text-waste-bone">
              {layer.stores}
            </p>
            <p className="mt-3 text-sm leading-snug text-waste-sand">
              <span className="text-waste-toxic">Value:</span> {layer.value}
            </p>
            <p className="mt-2 font-mono text-[0.7rem] leading-snug text-waste-dim">
              Gate: {layer.gate}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded border border-waste-rust/40 bg-waste-rust/5 px-4 py-3">
        <p className="font-mono text-[0.7rem] tracking-widest text-waste-rust">
          ONE BUCKET COST
        </p>
        <p className="mt-1 text-sm text-waste-sand">
          Mix the three jobs and a wrong prediction stays in &ldquo;memory&rdquo;
          forever. Confidence compounds. Reality does not.
        </p>
      </div>
    </DiagramShell>
  );
}
