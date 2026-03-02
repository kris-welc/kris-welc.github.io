"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type StarStatus = "loading" | "ready" | "starred" | "starring";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "";

const STORAGE_KEY = "gh-starred-agent-algebra";

interface GitHubStarButtonProps {
  readonly variant?: "compact" | "full";
  readonly className?: string;
}

export function GitHubStarButton({
  variant = "full",
  className,
}: GitHubStarButtonProps) {
  const [status, setStatus] = useState<StarStatus>("loading");
  const [authenticated, setAuthenticated] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check URL param (returning from OAuth redirect)
    const params = new URLSearchParams(window.location.search);
    if (params.get("starred") === "1") {
      localStorage.setItem(STORAGE_KEY, "true");
      // Clean up URL
      const clean = window.location.pathname;
      window.history.replaceState({}, "", clean);
      setStatus("starred");
      return;
    }

    // Check localStorage first (works on GitHub Pages without API)
    if (localStorage.getItem(STORAGE_KEY) === "true") {
      setStatus("starred");
      return;
    }

    // If API is available (Vercel deployment), check server-side
    if (!API_BASE) {
      fetch("/api/star")
        .then((res) => res.json())
        .then((data: { starred: boolean; authenticated: boolean }) => {
          setAuthenticated(data.authenticated);
          if (data.starred) {
            localStorage.setItem(STORAGE_KEY, "true");
          }
          setStatus(data.starred ? "starred" : "ready");
        })
        .catch(() => setStatus("ready"));
    } else {
      setStatus("ready");
    }
  }, []);

  const handleClick = async () => {
    if (status === "starred" || status === "starring") return;

    // On GitHub Pages OR unauthenticated: redirect through Vercel OAuth
    if (API_BASE || !authenticated) {
      const returnTo = API_BASE
        ? window.location.href
        : pathname;
      window.location.href = `${API_BASE}/api/auth/github?returnTo=${encodeURIComponent(returnTo)}`;
      return;
    }

    // On Vercel, already authenticated: star directly
    setStatus("starring");
    const res = await fetch("/api/star", { method: "PUT" });
    if (res.ok) {
      localStorage.setItem(STORAGE_KEY, "true");
      setStatus("starred");
    } else {
      window.location.href = `/api/auth/github?returnTo=${encodeURIComponent(pathname)}`;
    }
  };

  const isCompact = variant === "compact";
  const isStarred = status === "starred";

  return (
    <button
      onClick={handleClick}
      disabled={isStarred}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border font-mono tracking-wider transition-all",
        isCompact ? "px-2.5 py-1.5 text-[0.65rem]" : "px-4 py-2 text-xs",
        isStarred
          ? "cursor-default border-waste-amber/60 bg-waste-amber/20 text-waste-amber-light"
          : "border-waste-amber/40 bg-waste-amber/10 text-waste-amber hover:border-waste-amber hover:bg-waste-amber/20 hover:text-waste-amber-light",
        className,
      )}
    >
      <svg
        className={cn(
          "fill-current",
          isCompact ? "h-3.5 w-3.5" : "h-4 w-4",
        )}
        viewBox="0 0 24 24"
      >
        <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 19.771l-7.416 3.642 1.48-8.279L0 9.306l8.332-1.151z" />
      </svg>
      {status === "starring"
        ? "STARRING..."
        : isStarred
          ? "STARRED"
          : isCompact
            ? "STAR"
            : "STAR ON GITHUB"}
    </button>
  );
}
