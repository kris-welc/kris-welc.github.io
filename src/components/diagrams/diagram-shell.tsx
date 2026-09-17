// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (c) 2026 Kris Welc. All rights reserved.
// Commercial license: see /COMMERCIAL-LICENSE.md

import { cn } from "@/lib/utils";

interface DiagramShellProps {
  readonly title: string;
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly interactive?: boolean;
}

export function DiagramShell({
  title,
  children,
  className,
  interactive = true,
}: DiagramShellProps) {
  return (
    <div
      className={cn(
        "my-8 rounded-lg border border-waste-border bg-waste-surface",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-waste-border px-4 py-2.5">
        <span className="font-mono text-sm tracking-wider text-waste-amber">
          {title}
        </span>
        {interactive ? (
          <span className="rounded border border-waste-amber/30 bg-waste-amber/10 px-2 py-0.5 font-mono text-[0.6rem] tracking-widest text-waste-amber/70">
            INTERACTIVE
          </span>
        ) : (
          <span className="rounded border border-waste-border bg-waste-bg/40 px-2 py-0.5 font-mono text-[0.6rem] tracking-widest text-waste-dim">
            VALUE MAP
          </span>
        )}
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}
