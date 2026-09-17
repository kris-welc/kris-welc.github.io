// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (c) 2026 Kris Welc. All rights reserved.
// Commercial license: see /COMMERCIAL-LICENSE.md

interface Row {
  readonly label: string;
  /** Bar fill, 0–100. Ignored when the layer renders a tally. */
  readonly percent: number;
  readonly display: string;
  readonly tone: "terra" | "astra";
  /** Tally cells: total tested, and how many passed. */
  readonly tested?: number;
  readonly passed?: number;
}

interface Layer {
  readonly index: string;
  readonly question: string;
  readonly measure: string;
  readonly sample: string;
  readonly kind: "bars" | "tally";
  readonly rows: readonly Row[];
  readonly verdict: string;
  readonly won: boolean;
  readonly note: string;
}

const LAYERS: readonly Layer[] = [
  {
    index: "01",
    question: "Can it fix code?",
    measure: "Frozen tests passed",
    sample: "1 matched bug-fix pair · 16 tests frozen beforehand",
    kind: "bars",
    rows: [
      { label: "GPT-5.6 Terra", percent: 100, display: "16/16", tone: "terra" },
      { label: "GPT-6 Astra", percent: 100, display: "16/16", tone: "astra" },
    ],
    verdict: "TIE",
    won: false,
    note: "Both passed all 16. Terra then broke two edge cases the suite never checked; Astra did not.",
  },
  {
    index: "02",
    question: "Can it judge?",
    measure: "Balanced accuracy on accept / reject",
    sample: "50 review packets × 3 repeats × 2 models · 300 API calls",
    kind: "bars",
    rows: [
      { label: "GPT-5.6 Terra", percent: 90.6, display: "90.6%", tone: "terra" },
      { label: "GPT-6 Astra", percent: 96.7, display: "96.7%", tone: "astra" },
    ],
    verdict: "ASTRA +6.1 pp",
    won: true,
    note: "Astra wrongly blocked 0% of sound proposals; Terra wrongly blocked 16.7%.",
  },
  {
    index: "03",
    question: "Does the system improve?",
    measure: "Hypotheses tested vs promoted",
    sample: "3 independent resets × 4 days × 2 arms · 24 branch-days · Luna/Terra vs Astra/Astra",
    kind: "tally",
    rows: [
      {
        label: "Luna + Terra",
        percent: 0,
        display: "0 of 12",
        tone: "terra",
        tested: 12,
        passed: 0,
      },
      {
        label: "Astra + Astra",
        percent: 0,
        display: "0 of 12",
        tone: "astra",
        tested: 12,
        passed: 0,
      },
    ],
    verdict: "TOO SHORT",
    won: false,
    note: "Each arm tested 12 hypotheses and each got 0 promotions - expected for a short research loop. Astra reached the same candidates with 25% fewer calls, but both its roles changed together, so this layer ranks nothing on judgment.",
  },
];

const BAR_TONE = {
  terra: "bg-waste-sand/45",
  astra: "bg-waste-amber",
} as const;

export function ThreeLayerScoreboard() {
  return (
    <figure className="my-10 overflow-hidden rounded-lg border border-waste-border bg-waste-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-waste-border px-5 py-3">
        <span className="font-mono text-sm tracking-wider text-waste-amber">
          THREE LAYERS, THREE ANSWERS
        </span>
        <span className="font-mono text-xs tracking-widest text-waste-ash">
          GPT-5.6 TERRA vs GPT-6 ASTRA
        </span>
      </div>

      <div className="divide-y divide-waste-border">
        {LAYERS.map((layer) => (
          <div key={layer.index} className="px-5 py-5">
            <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-mono text-xs text-waste-ash">
                {layer.index}
              </span>
              <span className="font-display text-base font-semibold tracking-wide text-waste-bone">
                {layer.question}
              </span>
              <span
                className={`ml-auto rounded border px-2 py-0.5 font-mono text-xs tracking-widest ${
                  layer.won
                    ? "border-waste-toxic/30 bg-waste-toxic/10 text-waste-toxic"
                    : "border-waste-border bg-waste-bg/60 text-waste-dim"
                }`}
              >
                {layer.verdict}
              </span>
            </div>

            <div className="mb-1 font-mono text-xs uppercase tracking-widest text-waste-dim">
              {layer.measure}
            </div>
            <div className="mb-4 font-mono text-xs text-waste-ash">
              {layer.sample}
            </div>

            <div className="space-y-2">
              {layer.rows.map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 font-mono text-xs text-waste-sand">
                    {row.label}
                  </span>

                  {layer.kind === "bars" ? (
                    <span className="h-2.5 flex-1 overflow-hidden rounded-sm bg-waste-bg">
                      <span
                        className={`block h-full rounded-sm ${BAR_TONE[row.tone]}`}
                        style={{ width: `${row.percent}%` }}
                      />
                    </span>
                  ) : (
                    <span className="flex flex-1 gap-1">
                      {Array.from({ length: row.tested ?? 0 }, (_, i) => (
                        <span
                          key={i}
                          className={`h-2.5 flex-1 rounded-sm border ${
                            i < (row.passed ?? 0)
                              ? `border-transparent ${BAR_TONE[row.tone]}`
                              : "border-waste-ash/40 bg-transparent"
                          }`}
                        />
                      ))}
                    </span>
                  )}

                  <span className="w-16 shrink-0 text-right font-mono text-xs text-waste-bone">
                    {row.display}
                  </span>
                </div>
              ))}
            </div>

            {layer.kind === "tally" && (
              <p className="mt-2 font-mono text-xs text-waste-ash">
                Each cell is one branch-day. Outlined = tested and rejected.
                Filled = promoted.
              </p>
            )}

            <p className="mt-3 text-sm leading-relaxed text-waste-sand">
              {layer.note}
            </p>
          </div>
        ))}
      </div>

      <figcaption className="border-t border-waste-border bg-waste-bg/40 px-5 py-3 font-mono text-xs leading-relaxed text-waste-ash">
        Identical prompts, identical source snapshots, one attempt per model, no
        corrective prompts mid-run. Each row is scaled to its own measure.
      </figcaption>
    </figure>
  );
}
