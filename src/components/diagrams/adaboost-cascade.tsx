// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (c) 2026 Kris Welc. All rights reserved.
// Commercial license: see /COMMERCIAL-LICENSE.md

"use client";

import { useState } from "react";
import { DiagramShell } from "./diagram-shell";

interface AgentRound {
  readonly name: string;
  readonly error: number;
  readonly weight: number;
}

interface RoundData {
  readonly agents: readonly AgentRound[];
  readonly combinedError: number;
}

const ROUNDS: readonly RoundData[] = [
  {
    agents: [
      { name: "content_filter", error: 0.35, weight: 0 },
      { name: "toxicity_model", error: 0.35, weight: 0 },
      { name: "context_checker", error: 0.35, weight: 0 },
    ],
    combinedError: 0.35,
  },
  {
    agents: [
      { name: "content_filter", error: 0.35, weight: 0.62 },
      { name: "toxicity_model", error: 0.35, weight: 0 },
      { name: "context_checker", error: 0.35, weight: 0 },
    ],
    combinedError: 0.35,
  },
  {
    agents: [
      { name: "content_filter", error: 0.35, weight: 0.62 },
      { name: "toxicity_model", error: 0.22, weight: 1.27 },
      { name: "context_checker", error: 0.35, weight: 0 },
    ],
    combinedError: 0.18,
  },
  {
    agents: [
      { name: "content_filter", error: 0.35, weight: 0.62 },
      { name: "toxicity_model", error: 0.22, weight: 1.27 },
      { name: "context_checker", error: 0.08, weight: 2.44 },
    ],
    combinedError: 0.05,
  },
];

const ROUND_LABELS = [
  "INITIAL - all agents untrained, equal error",
  "ROUND 1 - content_filter trained, baseline established",
  "ROUND 2 - toxicity_model focuses on content_filter's misses",
  "ROUND 3 - context_checker specializes in remaining errors",
] as const;

export function AdaBoostCascade() {
  const [currentRound, setCurrentRound] = useState(0);

  const round = ROUNDS[currentRound];
  const isLastRound = currentRound >= ROUNDS.length - 1;

  const advance = () => {
    if (isLastRound) {
      setCurrentRound(0);
    } else {
      setCurrentRound((r) => r + 1);
    }
  };

  return (
    <DiagramShell title="ADABOOST CASCADE">
      {/* Round label */}
      <div className="mb-5 font-mono text-xs text-waste-dim">
        {ROUND_LABELS[currentRound]}
      </div>

      {/* Agent rows */}
      <div className="mb-4 space-y-3">
        {round.agents.map((agent) => (
          <AgentRow
            key={agent.name}
            name={agent.name}
            error={agent.error}
            weight={agent.weight}
            active={agent.weight > 0}
          />
        ))}
      </div>

      {/* Combined error */}
      <div className="mt-5 border-t border-waste-border pt-4">
        <div className="mb-1 flex items-center justify-between font-mono text-xs">
          <span className="text-waste-bone">COMBINED ERROR</span>
          <span
            className={
              round.combinedError <= 0.1
                ? "text-waste-toxic"
                : "text-waste-rust-light"
            }
          >
            {(round.combinedError * 100).toFixed(1)}%
          </span>
        </div>
        <div className="relative h-5 overflow-hidden rounded bg-waste-bg">
          <div
            className="absolute inset-y-0 left-0 rounded transition-all duration-700"
            style={{
              width: `${round.combinedError * 100}%`,
              backgroundColor:
                round.combinedError <= 0.1
                  ? "var(--color-waste-toxic)"
                  : "var(--color-waste-rust)",
              opacity: 0.5,
            }}
          />
        </div>
        {currentRound > 0 && (
          <div className="mt-1 font-mono text-[0.6rem] text-waste-dim">
            {currentRound === 3
              ? "86% error reduction from initial"
              : `${Math.round((1 - round.combinedError / 0.35) * 100)}% error reduction so far`}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={advance}
          className="rounded border border-waste-amber/40 bg-waste-amber/10 px-3 py-1.5 font-mono text-xs tracking-wider text-waste-amber transition-all hover:border-waste-amber hover:bg-waste-amber/20 hover:text-waste-amber-light"
        >
          {isLastRound ? "RESET" : "NEXT ROUND"}
        </button>
      </div>
    </DiagramShell>
  );
}

function AgentRow({
  name,
  error,
  weight,
  active,
}: {
  readonly name: string;
  readonly error: number;
  readonly weight: number;
  readonly active: boolean;
}) {
  return (
    <div className={active ? "opacity-100" : "opacity-40"}>
      <div className="mb-1 flex items-center justify-between font-mono text-xs">
        <span className={active ? "text-waste-amber" : "text-waste-dim"}>
          {name}
        </span>
        <span className="flex gap-3">
          <span className="text-waste-dim">
            err:{" "}
            <span className={active ? "text-waste-rust-light" : "text-waste-ash"}>
              {(error * 100).toFixed(0)}%
            </span>
          </span>
          {active && (
            <span className="text-waste-dim">
              w: <span className="text-waste-toxic">{weight.toFixed(2)}</span>
            </span>
          )}
        </span>
      </div>
      <div className="relative h-4 overflow-hidden rounded bg-waste-bg">
        <div
          className="absolute inset-y-0 left-0 rounded transition-all duration-500"
          style={{
            width: `${error * 100}%`,
            backgroundColor: active
              ? "var(--color-waste-rust)"
              : "var(--color-waste-ash)",
            opacity: active ? 0.5 : 0.3,
          }}
        />
      </div>
    </div>
  );
}
