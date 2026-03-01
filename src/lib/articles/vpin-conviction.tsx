export function VpinConvictionContent() {
  return (
    <>
      <h2>Why This Matters</h2>
      <p>
        Imagine you&rsquo;re about to make an important decision. You have your
        own analysis and you&rsquo;re 70% confident. Then you learn that the
        people with the <em>best</em> information &mdash; insiders, domain experts,
        the ones who consistently know first &mdash; are acting in the{" "}
        <strong>opposite direction</strong>.
      </p>
      <p>
        Do you still have 70% confidence? Of course not. Your confidence should
        drop. And if those informed actors were acting in the <em>same</em>{" "}
        direction as you? Your confidence should increase.
      </p>
      <p>
        This is the core idea: <strong>the actions of informed participants
        should modify your conviction in a decision, even if you don&rsquo;t
        know what they know</strong>. They reveal information through their
        behavior.
      </p>
      <p>
        VPIN (Volume-synchronized Probability of Informed Trading) measures how
        much of the activity in a system comes from participants who likely have
        better information. Originally developed for financial microstructure,
        the concept generalizes to any domain where some actors are better
        informed than others:
      </p>
      <ul>
        <li>
          In <strong>content recommendations</strong> &mdash; expert users who
          consistently find quality content early are &ldquo;informed
          participants.&rdquo; If they&rsquo;re engaging with content, it&rsquo;s
          probably good.
        </li>
        <li>
          In <strong>fraud detection</strong> &mdash; sophisticated actors who
          consistently exploit systems reveal their knowledge through behavior
          patterns.
        </li>
        <li>
          In <strong>hiring</strong> &mdash; when multiple experienced interviewers
          independently reach the same conclusion, that&rsquo;s high
          &ldquo;informed flow&rdquo; and your confidence in the signal should
          increase.
        </li>
        <li>
          In <strong>open source ecosystems</strong> &mdash; when respected
          maintainers start adopting a library, that&rsquo;s informed action.
          When they abandon one, that&rsquo;s an informed exit signal.
        </li>
      </ul>
      <blockquote>
        <p>
          The question isn&rsquo;t &ldquo;what do I think?&rdquo; It&rsquo;s
          &ldquo;what do the people who know best think?&rdquo; And the answer
          is in their actions, not their words.
        </p>
      </blockquote>

      <hr />

      <h2>The Academic Origin</h2>
      <p>
        VPIN was introduced by Easley, L&oacute;pez de Prado, and O&rsquo;Hara
        in 2012. They showed you could estimate the probability that an action
        was driven by informed actors just from publicly observable data &mdash;
        by looking at the <strong>imbalance between opposing flows</strong>.
      </p>
      <p>
        If both sides are roughly balanced, all participants have similar
        information (low VPIN). If one side dominates, someone knows something
        (high VPIN). The direction of the imbalance tells you which side the
        informed actors are on.
      </p>
      <pre><code>{`# The formula is simple:
vpin = abs(positive_flow - negative_flow) / total_flow

# VPIN = 0.0  → perfectly balanced, no informed activity
# VPIN = 0.05 → normal noise
# VPIN = 0.20 → significant imbalance, informed actors present
# VPIN = 0.50 → extreme, one side completely dominates`}</code></pre>
      <p>
        The limitation of the original research: <strong>it was
        retrospective</strong>. Studies computed VPIN over daily buckets and
        analyzed it after the fact. Useful for academic understanding, not for
        real-time decisions.
      </p>

      <hr />

      <h2>Making It Real-Time</h2>

      <h3>The Data Collection Daemon</h3>
      <p>
        A standalone process connects to a real-time event stream. Every event
        arrives with a critical field: <code>direction</code> &mdash; whether the
        action was initiated by the positive or negative side. Events are
        aggregated into 1-minute buckets:
      </p>
      <pre><code>{`# collector.py — runs as a separate process
async def on_event(msg):
    """Classify and aggregate each event."""
    direction = msg["direction"]   # "positive" or "negative"
    magnitude = float(msg["v"])    # event size

    if direction == "positive":
        bucket.positive_flow += magnitude
    else:
        bucket.negative_flow += magnitude
    bucket.total_flow += magnitude

# Every 60 seconds, compute and store:
vpin = abs(bucket.pos_flow - bucket.neg_flow) / bucket.total_flow
imbalance = (bucket.pos_flow - bucket.neg_flow) / bucket.total_flow
# → write to SQLite database`}</code></pre>
      <p>
        The daemon runs independently with its own lifecycle. It writes to
        a shared SQLite database in WAL mode (allows concurrent reads).
        It knows nothing about what reads the data or why.
      </p>

      <h3>The Conviction Modifier</h3>
      <p>
        The decision-making process reads the latest VPIN data and uses it to
        adjust its confidence. The rules are deliberately asymmetric:
      </p>
      <pre><code>{`def adjust_conviction(conviction, direction, vpin, imbalance):
    """Modify conviction based on informed flow.

    conviction: current confidence level (0.0 to 2.0)
    direction: which way we want to act (+1 or -1)
    vpin: informed flow intensity (0.0 to 1.0)
    imbalance: which side the informed actors favor"""

    # Determine informed flow direction
    informed_dir = +1 if imbalance > 0.05 else (-1 if imbalance < -0.05 else 0)

    if vpin > 0.20:  # strong informed activity (top ~5% of readings)
        if informed_dir * direction > 0:      # they agree with us
            conviction += 0.15                 # modest boost
        elif informed_dir * direction < 0:    # they disagree with us
            conviction -= 0.20                 # larger cut

    elif vpin > 0.10:  # moderate informed activity
        if informed_dir * direction > 0:
            conviction += 0.05                 # small boost

    return max(0.0, min(2.0, conviction))`}</code></pre>

      <h3>Why the Asymmetry?</h3>
      <p>
        Confirming flow boosts conviction by <code>+0.15</code>. Opposing flow
        cuts by <code>-0.20</code>. The cut is deliberately larger for a
        practical reason:
      </p>
      <ul>
        <li>
          <strong>False positive on the cut</strong> &mdash; you reduce your action
          slightly. Cost: a smaller commitment that might have been fine.
        </li>
        <li>
          <strong>False positive on the boost</strong> &mdash; you increase your
          action. Cost: a larger commitment that might go wrong.
        </li>
      </ul>
      <p>
        The asymmetry encodes a <strong>risk-management-first</strong> philosophy:
        it&rsquo;s cheaper to miss a good opportunity than to overcommit to a
        bad one. When the best-informed actors disagree with you, the smart
        response is to reduce exposure more than you increase it when they
        agree.
      </p>

      <hr />

      <h2>Contrarian Signals from Forced Exits</h2>
      <p>
        The data collector also monitors forced exit events &mdash; when
        participants are forced out of their positions due to adverse conditions.
        This reveals something about system extremes. We apply{" "}
        <strong>contrarian logic</strong>:
      </p>
      <ul>
        <li>
          <strong>A cluster of forced exits in one direction</strong> means the
          move that caused them is likely <em>overextended</em>. The
          capitulation that forces exits often marks the extreme.
        </li>
        <li>
          <strong>The implication</strong>: after a wave of forced exits,
          the move is more likely to reverse than continue. This is the
          &ldquo;cascading exhaustion&rdquo; signal.
        </li>
      </ul>
      <p>
        Combined with VPIN, this creates a two-dimensional conviction
        system: <em>are informed actors supporting this direction?</em> and{" "}
        <em>are forced exits suggesting the move is exhausted?</em>
      </p>

      <hr />

      <h2>The Decoupled Architecture</h2>
      <p>
        The most reusable part of this system isn&rsquo;t the VPIN formula &mdash;
        it&rsquo;s the <strong>two-process architecture</strong>:
      </p>
      <pre><code>{`┌─────────────────────┐     ┌──────────────────────┐
│   DATA COLLECTOR    │     │   DECISION MAKER     │
│                     │     │                      │
│  Stream connection  │     │  Reads enrichment DB │
│  Real-time ingest   ├────►│  with 2s timeout     │
│  Aggregation        │write│                      │read
│  Writes to SQLite   │     │  If stale/locked:    │
│                     │     │  proceed without it  │
└─────────────────────┘     └──────────────────────┘

Key design decisions:
• SQLite in WAL mode → concurrent reads during writes
• 2-second read timeout → graceful degradation
• No shared state → either process can restart independently
• 1-hour aggregation window → balance between signal and noise`}</code></pre>

      <h3>Why This Pattern Matters</h3>
      <p>
        The two-process pattern solves a general problem: <strong>how do you
        enrich a decision system with real-time data without coupling the data
        collection to the decision logic?</strong>
      </p>
      <p>
        The collector and the decision maker have completely different
        requirements:
      </p>
      <ul>
        <li>
          The <strong>collector</strong> needs to be always-on, handle connection
          drops, buffer during outages, and write efficiently.
        </li>
        <li>
          The <strong>decision maker</strong> needs to read quickly, handle
          missing data gracefully, and never block on I/O.
        </li>
      </ul>
      <p>
        SQLite in WAL mode is the bridge. The collector writes without
        blocking readers. The decision maker reads with a timeout &mdash;
        if the data is stale or the database is locked, it proceeds
        without the enrichment rather than waiting. This means the decision
        system is <strong>never degraded by the enrichment layer</strong>.
        It&rsquo;s always additive, never blocking.
      </p>

      <h3>Generalizing the Pattern</h3>
      <p>
        Any real-time enrichment source can use this architecture:
      </p>
      <ul>
        <li>
          <strong>Social sentiment collector</strong> &rarr; writes sentiment scores
          to SQLite &rarr; decision system reads when available
        </li>
        <li>
          <strong>Webhook event aggregator</strong> &rarr; writes event counts and
          patterns &rarr; monitoring system reads for anomaly detection
        </li>
        <li>
          <strong>User behavior tracker</strong> &rarr; writes engagement metrics &rarr;
          recommendation engine reads for real-time personalization
        </li>
        <li>
          <strong>Log pattern detector</strong> &rarr; writes error clusters &rarr;
          alerting system reads for intelligent notification
        </li>
      </ul>
      <p>
        The formula changes. The architecture stays the same: independent
        collector, shared SQLite, timeout-based reads, graceful degradation.
      </p>

      <hr />

      <h2>Key Takeaways</h2>
      <ol>
        <li>
          <strong>Informed actors reveal information through behavior</strong>.
          You don&rsquo;t need to know what they know &mdash; you just need to
          detect when they&rsquo;re acting and in which direction.
        </li>
        <li>
          <strong>Asymmetric response is risk-management-first</strong>. Cut
          more when informed actors disagree than you boost when they agree.
          Missing an opportunity is cheaper than overcommitting to a mistake.
        </li>
        <li>
          <strong>Decouple collection from decision-making</strong>. The
          two-process SQLite pattern lets you add real-time enrichment to
          any system without coupling or risk of blocking.
        </li>
        <li>
          <strong>Graceful degradation over hard dependencies</strong>. If the
          enrichment data is missing, proceed without it. The enrichment is
          additive conviction, not a gate.
        </li>
      </ol>
    </>
  );
}
