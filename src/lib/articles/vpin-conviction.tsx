export function VpinConvictionContent() {
  return (
    <>
      <p>
        <strong>In one sentence:</strong> watch what the best-informed people
        do. If they oppose you, cut your confidence harder than you raise it when
        they agree.
      </p>

      <h2>The Core Idea</h2>
      <p>
        Imagine you&rsquo;re about to make an important decision. You have your
        own analysis and you&rsquo;re 70% confident. Then you learn that the
        people with the <em>best</em> information (domain experts, experienced
        operators, the ones who usually know first) are acting in the{" "}
        <strong>opposite direction</strong>.
      </p>
      <p>
        Do you still have 70% confidence? Of course not. Your confidence should
        drop. And if those informed people were acting the <em>same</em> way as
        you? Your confidence should go up - but less than the cut, because
        overcommitting costs more than missing a good chance.
      </p>
      <p>
        That&rsquo;s the whole article: <strong>measure when experts are acting
        and which way they lean, then adjust your confidence unevenly</strong>.
        You don&rsquo;t need to know what they know. You need their direction and
        intensity.
      </p>

      <h2>Start With Domains You Already Know</h2>
      <ul>
        <li>
          <strong>Hiring</strong> - when several experienced interviewers
          independently agree, raise confidence. When a respected interviewer
          dissents, cut harder than a confirming vote boosts you.
        </li>
        <li>
          <strong>Product</strong> - your most engaged power users changing
          behavior tells you more than aggregate analytics from casual users.
        </li>
        <li>
          <strong>Content / open source</strong> - experts engaging early is a
          positive signal. Respected maintainers leaving a library is an exit
          signal.
        </li>
        <li>
          <strong>Fraud / abuse</strong> - a surge of activity from
          known-sophisticated accounts is high informed flow.
        </li>
      </ul>
      <blockquote>
        <p>
          The question isn&rsquo;t &ldquo;what do I think?&rdquo; It&rsquo;s
          &ldquo;what do the people who know best think?&rdquo; And the answer
          is in their actions, not their words.
        </p>
      </blockquote>
      <p>
        The measurement trick below comes from market research (Easley, L&oacute;pez
        de Prado, O&rsquo;Hara, 2012). The rule is general. The origin is markets.
      </p>

      <hr />

      <h2>Measuring Informed Activity</h2>
      <p>
        Estimate how likely activity is driven by informed actors from publicly
        observable flow: look at the <strong>imbalance between opposing
        sides</strong>.
      </p>
      <p>
        Balanced flow &rarr; similar information (low informed activity). One
        side dominates &rarr; someone knows something (high informed activity).
        The direction of the imbalance is the direction they favor.
      </p>
      <pre><code>{`# informed_ratio = abs(positive_flow - negative_flow) / total_flow

# 0.00 → perfectly balanced
# 0.05 → normal noise
# 0.20 → significant imbalance - informed actors present
# 0.50 → extreme - one side dominates`}</code></pre>
      <p>
        The original work was retrospective (daily buckets after the fact). The
        useful upgrade is running it live on short buckets and feeding it into
        the decision loop.
      </p>

      <hr />

      <h2>The Confidence Adjustment Rules</h2>
      <p>
        Treat confidence on a <strong>0.0-1.0</strong> scale (or any bounded
        scale you already use). Adjust asymmetrically:
      </p>
      <pre><code>{`def adjust_confidence(confidence, my_direction, informed_ratio, imbalance):
    """confidence: 0.0 to 1.0
    my_direction: +1 or -1
    informed_ratio: intensity of informed activity
    imbalance: which way informed actors lean"""

    informed_dir = +1 if imbalance > 0.05 else (-1 if imbalance < -0.05 else 0)

    if informed_ratio > 0.20:  # strong informed activity
        if informed_dir * my_direction > 0:      # they agree
            confidence += 0.08                    # modest boost
        elif informed_dir * my_direction < 0:    # they disagree
            confidence -= 0.15                    # larger cut

    elif informed_ratio > 0.10:  # moderate
        if informed_dir * my_direction > 0:
            confidence += 0.03

    return max(0.0, min(1.0, confidence))`}</code></pre>

      <h3>Why the Asymmetry?</h3>
      <ul>
        <li>
          <strong>False cut</strong> - you take a smaller action. Cost: maybe you
          under-committed on something fine.
        </li>
        <li>
          <strong>False boost</strong> - you increase commitment. Cost: a larger
          mistake.
        </li>
      </ul>
      <p>
        Missing a good opportunity is cheaper than overcommitting to a bad one.
        Same rule in hiring: a dissenting expert should move you more than a
        confirming one. Same in product: power users leaving should alarm you
        more than engagement reassures you.
      </p>

      <hr />

      <h2>Architecture: Decouple Collection from Decisions</h2>
      <p>
        The reusable part isn&rsquo;t the formula. It&rsquo;s the two-process
        layout:
      </p>
      <p>
        <strong>Process A: Collector</strong> &rarr; ingests events, aggregates
        into buckets, writes to SQLite.
      </p>
      <p>
        <strong>Process B: Decision Maker</strong> &rarr; reads enrichment with a
        short timeout. If stale or locked, proceeds without it.
      </p>
      <ul>
        <li>
          <strong>Short read timeout</strong> - never block the decision
        </li>
        <li>
          <strong>No shared mutable state</strong> - either process can restart
          alone
        </li>
        <li>
          <strong>Enrichment is additive</strong> - never a hard gate
        </li>
      </ul>
      <p>
        Same pattern for sentiment, webhooks, user behavior, or log clusters:
        independent collector, shared DB, timeout reads, graceful degradation.
      </p>

      <hr />

      <h2>Key Takeaways</h2>
      <ol>
        <li>
          <strong>Informed actors reveal information through behavior</strong>.
          Detect when and which way. You don&rsquo;t need their private
          knowledge.
        </li>
        <li>
          <strong>Cut more than you boost</strong>. Disagreement from experts
          should reduce confidence more than agreement increases it.
        </li>
        <li>
          <strong>Decouple collection from decisions</strong>. Enrichment stays
          additive and never blocks.
        </li>
      </ol>
    </>
  );
}
