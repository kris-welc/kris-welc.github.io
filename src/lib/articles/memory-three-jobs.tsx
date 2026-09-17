import { MemoryThreeJobsDiagram } from "@/components/diagrams/memory-three-jobs";

export function MemoryThreeJobsContent() {
  return (
    <>
      <p>
        <strong>In one sentence:</strong> agents don&rsquo;t need more memory.
        They need memory that cannot confuse &ldquo;said it,&rdquo; &ldquo;saw
        it,&rdquo; and &ldquo;proven it.&rdquo;
      </p>

      <h2>The Expensive Mix-Up</h2>
      <p>
        Most agent stacks put everything in one place: chat history plus a vector
        store. That feels like memory. It behaves like a junk drawer.
      </p>
      <p>
        A guess, a market move, and a verified outcome all look the same once
        they are embeddings. Next week the model retrieves the guess with the
        same confidence as the outcome. You paid for a world model. You got a
        scrapbook.
      </p>

      <MemoryThreeJobsDiagram />

      <h2>Three Jobs, Three Contracts</h2>
      <p>
        Split the work by what the data is allowed to do:
      </p>
      <ol>
        <li>
          <strong>Timeline</strong> - timestamped events across domains. Answer
          &ldquo;when X fired, what else moved?&rdquo; with a query, not a hope.
        </li>
        <li>
          <strong>Lessons</strong> - short edges and failures the next prompt can
          use. Keep them small. Keep them scrubbed.
        </li>
        <li>
          <strong>Scoreboard</strong> - claims waiting for reality. Only after
          an outcome does a lesson earn a seat, and only then does authority
          move.
        </li>
      </ol>
      <p>
        The gate is the product. Lessons do not land from vibes. They land from
        verified claims. Unverified text stays out of the weight that steers the
        next decision.
      </p>

      <h3>Example: Mem0 as the Lessons Store</h3>
      <p>
        <a
          href="https://mem0.ai"
          target="_blank"
          rel="noopener noreferrer"
        >
          Mem0
        </a>{" "}
        is a memory layer for AI agents: it stores and retrieves short facts
        across sessions so the model does not start from zero every time. It fits
        this job well if you use it narrowly. Search for short edges, failures,
        and risk limits. Inject those into the next prompt. Do not dump raw chat
        turns or unverified forecasts into it.
      </p>
      <p>
        The default Mem0 demo stores every exchange. That rebuilds the junk
        drawer. The useful pattern is stricter:
      </p>
      <pre><code>{`# lessons only - not events, not unverified claims
mem0.search(query)                    # pull edges / failures / risk limits
...
# after a claim is checked against reality:
if claim.verified:
    mem0.add_lesson(
        text=f"{'Correct' if claim.was_correct else 'Incorrect'}: {claim.text}",
        kind="edge" if claim.was_correct else "failure",
    )`}</code></pre>
      <p>
        Timeline stays in an event store. The scoreboard decides what is true.
        Mem0 only keeps what the next prompt should reuse. That is the standard
        worth matching: semantic memory with a verification gate, not a second
        chat log.
      </p>

      <h2>What You Get</h2>
      <ul>
        <li>
          <strong>Less false confidence</strong> - a wrong call cannot quietly
          become permanent &ldquo;knowledge.&rdquo;
        </li>
        <li>
          <strong>Cheaper cross-domain questions</strong> - one event timeline
          instead of scraping six systems and asking the model to reconcile them.
        </li>
        <li>
          <strong>Memory that compounds the right way</strong> - authority
          follows who was right, not who wrote the longest answer.
        </li>
      </ul>

      <blockquote>
        <p>
          Chat logs remember what was said. Agents need that plus what happened
          plus what turned out true - and those must not share one store.
        </p>
      </blockquote>

      <h2>What This Is Not Claiming</h2>
      <p>
        This is a design claim, not a leaderboard claim. The value is integrity
        and reuse: prompts start from the right kind of past. Measuring how much
        that lifts forecast skill is a later article, with a filled scoreboard.
      </p>
    </>
  );
}
