"use client";

import { useMemo, useState } from "react";
import { DiagramShell } from "@/components/diagrams/diagram-shell";
import { cn } from "@/lib/utils";

type FixtureKind = "claim" | "event" | "verified";
type Mode = "one-bucket" | "three-jobs";
type Verdict = "pending" | "correct" | "wrong";

interface Fixture {
  readonly id: string;
  readonly kind: FixtureKind;
  readonly label: string;
  readonly text: string;
  readonly hint: string;
}

const FIXTURES: readonly Fixture[] = [
  {
    id: "claim",
    kind: "claim",
    label: "Unverified claim",
    text: "Markets will rally next week.",
    hint: "A prediction. Not a fact yet.",
  },
  {
    id: "event",
    kind: "event",
    label: "Observed event",
    text: "Regime flipped RISK_OFF at 14:02.",
    hint: "Something happened at a time.",
  },
  {
    id: "verified",
    kind: "verified",
    label: "Verified outcome",
    text: "Claim #12 was wrong - the rally call failed.",
    hint: "Reality already checked a past claim.",
  },
] as const;

type Destination = "junk" | "timeline" | "scoreboard" | "lessons";

interface RouteResult {
  readonly dest: Destination;
  readonly path: readonly string[];
  readonly why: string;
  readonly value: string;
  readonly gateOpen: boolean | null;
}

function route(
  kind: FixtureKind,
  mode: Mode,
  verdict: Verdict,
): RouteResult {
  if (mode === "one-bucket") {
    return {
      dest: "junk",
      path: ["produced", "classify", "junk"],
      why: "One store takes everything. Next week the model cannot tell a guess from a fact.",
      value: "Fast to build. Expensive later: false confidence compounds.",
      gateOpen: null,
    };
  }

  if (kind === "event") {
    return {
      dest: "timeline",
      path: ["produced", "classify", "timeline"],
      why: "Timestamped observation. Put it on the timeline so cross-domain questions stay queryable.",
      value: "You can ask \"when X fired, what else moved?\" without hoping the model remembers.",
      gateOpen: null,
    };
  }

  if (kind === "verified") {
    return {
      dest: "lessons",
      path: ["produced", "classify", "gate", "lessons"],
      why: "Outcome already known. Write a short lesson the next prompt can reuse.",
      value: "Authority and habits update from reality, not from confident wording.",
      gateOpen: true,
    };
  }

  if (verdict === "pending") {
    return {
      dest: "scoreboard",
      path: ["produced", "classify", "gate", "scoreboard"],
      why: "Park the claim. Do not write a lesson until an outcome exists.",
      value: "Stops a wrong prediction from becoming permanent \"knowledge.\"",
      gateOpen: false,
    };
  }

  return {
    dest: "lessons",
    path: ["produced", "classify", "gate", "lessons"],
    why:
      verdict === "correct"
        ? "Outcome matched the claim. Write an edge lesson."
        : "Outcome missed the claim. Write a failure lesson - still useful.",
    value: "Only verified results become reusable memory for the next run.",
    gateOpen: true,
  };
}

const FLOW_NODES = [
  { id: "produced", label: "Produced" },
  { id: "classify", label: "Classify" },
  { id: "gate", label: "Gate" },
  { id: "timeline", label: "Timeline" },
  { id: "scoreboard", label: "Scoreboard" },
  { id: "lessons", label: "Lessons" },
  { id: "junk", label: "Junk drawer" },
] as const;

export function MemoryGateDemo() {
  const [fixtureId, setFixtureId] = useState(FIXTURES[0].id);
  const [mode, setMode] = useState<Mode>("one-bucket");
  const [verdict, setVerdict] = useState<Verdict>("pending");
  const [step, setStep] = useState(0);

  const fixture = FIXTURES.find((f) => f.id === fixtureId) ?? FIXTURES[0];
  const result = useMemo(
    () => route(fixture.kind, mode, verdict),
    [fixture.kind, mode, verdict],
  );

  const showGateControls = fixture.kind === "claim" && mode === "three-jobs";
  const maxStep = showGateControls ? 3 : 2;

  const guide =
    step === 0
      ? {
          title: "What we are doing",
          body: "An agent just produced one piece of text. Your job is to decide which memory store is allowed to keep it - and whether a lesson may be written.",
        }
      : step === 1
        ? {
            title: "Why the type matters",
            body: `${fixture.hint} If you treat every string the same, a forecast becomes \"memory\" before reality checks it.`,
          }
        : step === 2
          ? {
              title: "Why the mode matters",
              body:
                mode === "one-bucket"
                  ? "One bucket is the usual RAG demo: dump chat into a vector store. Simple, and it mixes guesses with facts."
                  : "Three jobs split the contracts: events on a timeline, claims on a scoreboard, lessons only after verification.",
            }
          : {
              title: "Why the gate matters",
              body:
                verdict === "pending"
                  ? "Gate closed. The claim can wait on the scoreboard, but Mem0-style lessons stay empty until an outcome arrives."
                  : "Gate open. Only now write a short edge or failure the next prompt can reuse.",
            };

  function goNext() {
    setStep((s) => Math.min(s + 1, maxStep));
  }

  function resetGuide() {
    setFixtureId(FIXTURES[0].id);
    setMode("one-bucket");
    setVerdict("pending");
    setStep(0);
  }

  const pathSet = new Set(result.path);

  return (
    <DiagramShell title="TRY THE MEMORY GATE" interactive>
      <div className="mb-5 rounded border border-waste-border bg-waste-bg/50 px-4 py-3">
        <p className="font-mono text-[0.65rem] tracking-widest text-waste-amber">
          GUIDE · STEP {step + 1} / {maxStep + 1}
        </p>
        <p className="mt-1 font-display text-lg font-semibold text-waste-bone">
          {guide.title}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-waste-sand">
          {guide.body}
        </p>
        <p className="mt-2 font-mono text-[0.65rem] text-waste-dim">
          Fixture only - no live agent, no API, no your data.
        </p>
      </div>

      {/* Visual flow */}
      <div className="mb-6">
        <p className="mb-3 font-mono text-[0.65rem] tracking-widest text-waste-dim">
          FLOW
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {(["produced", "classify"] as const).map((id, i) => (
            <FlowChip
              key={id}
              label={FLOW_NODES.find((n) => n.id === id)!.label}
              active={pathSet.has(id)}
              dimmed={!pathSet.has(id)}
              showArrow={i > 0}
            />
          ))}
          {mode === "three-jobs" && fixture.kind !== "event" && (
            <FlowChip
              label="Gate"
              active={pathSet.has("gate")}
              dimmed={!pathSet.has("gate")}
              showArrow
              tone={
                result.gateOpen === true
                  ? "toxic"
                  : result.gateOpen === false
                    ? "rust"
                    : "amber"
              }
              badge={
                result.gateOpen === true
                  ? "OPEN"
                  : result.gateOpen === false
                    ? "CLOSED"
                    : undefined
              }
            />
          )}
          <FlowChip
            label={
              FLOW_NODES.find((n) => n.id === result.dest)?.label ?? result.dest
            }
            active
            showArrow
            tone={
              result.dest === "junk"
                ? "rust"
                : result.dest === "lessons"
                  ? "toxic"
                  : "amber"
            }
          />
        </div>
      </div>

      {/* Step controls */}
      <div className="mb-5 space-y-5">
        <div>
          <p className="mb-2 font-mono text-[0.65rem] tracking-widest text-waste-dim">
            1. PICK WHAT WAS PRODUCED
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {FIXTURES.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setFixtureId(f.id);
                  setVerdict("pending");
                  setStep(Math.max(step, 1));
                }}
                className={cn(
                  "rounded border px-3 py-3 text-left transition-colors",
                  fixtureId === f.id
                    ? "border-waste-amber bg-waste-amber/10"
                    : "border-waste-border bg-waste-bg/50 hover:border-waste-amber/40",
                )}
              >
                <span className="font-mono text-[0.65rem] tracking-wider text-waste-amber">
                  {f.label.toUpperCase()}
                </span>
                <span className="mt-1 block text-sm text-waste-bone">
                  {f.text}
                </span>
                <span className="mt-2 block text-xs text-waste-dim">{f.hint}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 font-mono text-[0.65rem] tracking-widest text-waste-dim">
            2. CHOOSE HOW MEMORY WORKS
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <ModeCard
              active={mode === "one-bucket"}
              title="One bucket"
              subtitle="Usual demo"
              body="Chat + embeddings in one store. Guesses and facts mix."
              onClick={() => {
                setMode("one-bucket");
                setStep(Math.max(step, 2));
              }}
            />
            <ModeCard
              active={mode === "three-jobs"}
              title="Three jobs"
              subtitle="Contracts"
              body="Timeline / scoreboard / lessons. Gate before reusable memory."
              onClick={() => {
                setMode("three-jobs");
                setStep(Math.max(step, 2));
              }}
            />
          </div>
        </div>

        {showGateControls && (
          <div>
            <p className="mb-2 font-mono text-[0.65rem] tracking-widest text-waste-dim">
              3. OPEN OR CLOSE THE GATE
            </p>
            <p className="mb-2 text-sm text-waste-sand">
              Claims wait here. Lessons are only written after an outcome.
            </p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["pending", "Not checked yet", "Gate closed"],
                  ["correct", "Outcome: correct", "Gate open → edge"],
                  ["wrong", "Outcome: wrong", "Gate open → failure"],
                ] as const
              ).map(([value, label, note]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setVerdict(value);
                    setStep(3);
                  }}
                  className={cn(
                    "rounded border px-3 py-2 text-left transition-colors",
                    verdict === value
                      ? "border-waste-amber bg-waste-amber/10"
                      : "border-waste-border hover:border-waste-amber/40",
                  )}
                >
                  <span className="block font-mono text-xs tracking-wider text-waste-amber">
                    {label}
                  </span>
                  <span className="mt-0.5 block text-[0.7rem] text-waste-dim">
                    {note}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Result */}
      <div
        className={cn(
          "rounded border px-4 py-4",
          result.dest === "junk" && "border-waste-rust/50 bg-waste-rust/10",
          result.dest === "lessons" && "border-waste-toxic/40 bg-waste-toxic/10",
          (result.dest === "timeline" || result.dest === "scoreboard") &&
            "border-waste-amber/40 bg-waste-amber/10",
        )}
      >
        <p className="font-mono text-[0.65rem] tracking-widest text-waste-dim">
          RESULT
        </p>
        <p className="mt-1 font-display text-xl font-bold text-waste-bone">
          Routes to{" "}
          {FLOW_NODES.find((n) => n.id === result.dest)?.label ?? result.dest}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-waste-sand">
          <span className="text-waste-bone">What happens:</span> {result.why}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-waste-sand">
          <span className="text-waste-toxic">Why it matters:</span> {result.value}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {step < maxStep ? (
          <button
            type="button"
            onClick={goNext}
            className="rounded border border-waste-amber bg-waste-amber/15 px-4 py-2 font-mono text-xs tracking-wider text-waste-amber transition-colors hover:bg-waste-amber/25"
          >
            Next guide step →
          </button>
        ) : (
          <button
            type="button"
            onClick={resetGuide}
            className="rounded border border-waste-border px-4 py-2 font-mono text-xs tracking-wider text-waste-sand transition-colors hover:border-waste-amber/40"
          >
            Reset guide
          </button>
        )}
        {mode === "one-bucket" && (
          <button
            type="button"
            onClick={() => {
              setMode("three-jobs");
              setStep(Math.max(step, 2));
            }}
            className="rounded border border-waste-toxic/50 px-4 py-2 font-mono text-xs tracking-wider text-waste-toxic transition-colors hover:bg-waste-toxic/10"
          >
            Compare with three jobs
          </button>
        )}
      </div>
    </DiagramShell>
  );
}

function FlowChip({
  label,
  active,
  dimmed,
  showArrow,
  tone = "amber",
  badge,
}: {
  label: string;
  active?: boolean;
  dimmed?: boolean;
  showArrow?: boolean;
  tone?: "amber" | "toxic" | "rust";
  badge?: string;
}) {
  return (
    <>
      {showArrow && (
        <span className="font-mono text-waste-dim" aria-hidden>
          →
        </span>
      )}
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded border px-3 py-1.5 font-mono text-xs tracking-wider transition-colors",
          dimmed && "border-waste-border/60 text-waste-dim opacity-50",
          active &&
            !dimmed &&
            tone === "amber" &&
            "border-waste-amber bg-waste-amber/15 text-waste-amber",
          active &&
            !dimmed &&
            tone === "toxic" &&
            "border-waste-toxic bg-waste-toxic/15 text-waste-toxic",
          active &&
            !dimmed &&
            tone === "rust" &&
            "border-waste-rust bg-waste-rust/15 text-waste-rust-light",
          !active &&
            !dimmed &&
            "border-waste-border text-waste-sand",
        )}
      >
        {label}
        {badge && (
          <span className="rounded bg-waste-bg/80 px-1.5 py-0.5 text-[0.55rem] tracking-widest">
            {badge}
          </span>
        )}
      </span>
    </>
  );
}

function ModeCard({
  active,
  title,
  subtitle,
  body,
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  body: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded border px-4 py-3 text-left transition-colors",
        active
          ? "border-waste-toxic bg-waste-toxic/10"
          : "border-waste-border bg-waste-bg/50 hover:border-waste-toxic/40",
      )}
    >
      <span className="font-mono text-[0.65rem] tracking-wider text-waste-dim">
        {subtitle.toUpperCase()}
      </span>
      <span
        className={cn(
          "mt-1 block font-display text-base font-semibold",
          active ? "text-waste-toxic" : "text-waste-bone",
        )}
      >
        {title}
      </span>
      <span className="mt-1 block text-sm text-waste-sand">{body}</span>
    </button>
  );
}
