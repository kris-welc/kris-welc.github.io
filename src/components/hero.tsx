export function Hero() {
  return (
    <section className="hero-glow relative flex items-center justify-center px-6 pt-28 pb-16 md:pt-36 md:pb-20">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="mb-6 font-display text-5xl font-bold tracking-tight md:text-7xl">
          <span className="gradient-hot">KRIS WELC</span>
        </h1>

        <p className="mx-auto max-w-xl text-lg leading-relaxed text-waste-sand md:text-xl">
          Field notes on AI agents and adaptive systems that hold up outside a
          demo. Patterns, numbers, and setups you can reuse.
        </p>

        <a
          href="#articles"
          className="mt-10 inline-flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-waste-amber transition-colors hover:text-waste-amber-light"
        >
          <span>Read the notes</span>
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </a>
      </div>

      <div className="absolute right-0 bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-waste-border to-transparent" />
    </section>
  );
}
