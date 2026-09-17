"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 border-b border-waste-border/30 bg-waste-bg/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="glow-amber font-mono text-sm tracking-[0.2em] text-waste-amber"
        >
          KRIS WELC
        </Link>
        <Link
          href="/#articles"
          className={cn(
            "link-underline text-xs tracking-wide transition-colors md:text-sm",
            isHome
              ? "text-waste-amber"
              : "text-waste-dim hover:text-waste-bone"
          )}
        >
          NOTES
        </Link>
      </div>
    </nav>
  );
}
