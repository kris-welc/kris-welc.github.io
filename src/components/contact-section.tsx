"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/section-label";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { SOCIAL_LINKS } from "@/lib/data";
import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

const ICON_MAP = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
} as const;

const HOVER_BORDER = {
  github: "hover:border-waste-amber/40",
  linkedin: "hover:border-waste-toxic/40",
} as const;

type FormStatus = "idle" | "sending" | "sent" | "error";

export function ContactSection() {
  const headerRef = useReveal();
  const formRef = useReveal();
  const linksRef = useReveal();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim() || !email.trim() || !message.trim()) return;

      setStatus("sending");
      try {
        const res = await fetch(`${API_BASE}/api/contact`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
        });
        if (res.ok) {
          setStatus("sent");
          setName("");
          setEmail("");
          setMessage("");
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    },
    [name, email, message],
  );

  return (
    <section id="contact" className="relative px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div ref={headerRef} className="reveal mb-12 text-center">
          <SectionLabel code="SEC_05" label="COMMS" />
          <h2 className="gradient-bone mb-4 font-display text-3xl font-bold tracking-wide md:text-4xl">
            Establish Contact
          </h2>
          <p className="mx-auto max-w-lg text-waste-sand">
            Open to collaboration on AI systems, autonomous agents, and
            infrastructure engineering. Messages go directly to my inbox.
          </p>
        </div>

        <div className="mx-auto max-w-2xl">
          <div ref={formRef} className="reveal mb-10">
            {status === "sent" ? (
              <div className="rounded-lg border border-waste-amber/30 bg-waste-amber/5 px-6 py-8 text-center">
                <p className="font-mono text-sm tracking-wider text-waste-amber">
                  MESSAGE RECEIVED
                </p>
                <p className="mt-2 text-sm text-waste-sand">
                  Thanks for reaching out. I&rsquo;ll get back to you soon.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-4 font-mono text-xs tracking-wider text-waste-dim transition-colors hover:text-waste-amber"
                >
                  SEND ANOTHER
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="mb-1.5 block font-mono text-[0.65rem] tracking-wider text-waste-dim"
                    >
                      NAME
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-md border border-waste-border bg-waste-panel px-4 py-2.5 font-mono text-sm text-waste-bone placeholder-waste-ash/50 outline-none transition-colors focus:border-waste-amber/60"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="mb-1.5 block font-mono text-[0.65rem] tracking-wider text-waste-dim"
                    >
                      EMAIL
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-md border border-waste-border bg-waste-panel px-4 py-2.5 font-mono text-sm text-waste-bone placeholder-waste-ash/50 outline-none transition-colors focus:border-waste-amber/60"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="contact-message"
                    className="mb-1.5 block font-mono text-[0.65rem] tracking-wider text-waste-dim"
                  >
                    MESSAGE
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    maxLength={2000}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full resize-none rounded-md border border-waste-border bg-waste-panel px-4 py-2.5 font-mono text-sm text-waste-bone placeholder-waste-ash/50 outline-none transition-colors focus:border-waste-amber/60"
                    placeholder="What's on your mind?"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[0.6rem] text-waste-ash">
                    {message.length}/2000
                  </span>
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className={cn(
                      "rounded-md border px-6 py-2.5 font-mono text-xs tracking-wider transition-all",
                      status === "sending"
                        ? "cursor-wait border-waste-border bg-waste-panel text-waste-dim"
                        : status === "error"
                          ? "border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                          : "border-waste-amber/40 bg-waste-amber/10 text-waste-amber hover:border-waste-amber hover:bg-waste-amber/20",
                    )}
                  >
                    {status === "sending"
                      ? "TRANSMITTING..."
                      : status === "error"
                        ? "FAILED — RETRY"
                        : "SEND MESSAGE"}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div ref={linksRef} className="reveal flex items-center justify-center gap-6">
            {SOCIAL_LINKS.map((link) => {
              const Icon = ICON_MAP[link.type];
              return (
                <Button
                  key={link.type}
                  variant="outline"
                  asChild
                  className={`gap-3 border-waste-border bg-waste-panel px-6 py-3 transition-all duration-300 ${HOVER_BORDER[link.type]}`}
                >
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="text-waste-bone" />
                    <span className="font-mono text-sm tracking-wider text-waste-sand">
                      {link.name}
                    </span>
                  </a>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
