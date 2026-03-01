export function DualLayerRegimeContent() {
  return (
    <>
      <h2>Why This Matters</h2>
      <p>
        Every system that makes decisions in a changing environment has the same
        problem: <strong>the rules that work in one condition can fail in
        another</strong>.
      </p>
      <p>
        A recommendation engine tuned for normal browsing patterns fails during
        viral events. An autoscaler calibrated for steady growth overshoots during
        spike traffic. An ML model trained on one data distribution degrades when
        the distribution shifts. A content moderation pipeline tuned for English
        text misclassifies when multilingual content surges.
      </p>
      <p>
        The standard solution is a regime detector &mdash; a classifier that tells
        you which condition you&rsquo;re currently in, so you can switch strategies.
        Hidden Markov Models, rolling statistics, clustering &mdash; all of them
        answer the question: <em>&ldquo;What mode are we in right now?&rdquo;</em>
      </p>
      <p>
        But there&rsquo;s a more important question nobody asks:{" "}
        <em>&ldquo;Are we <strong>transitioning</strong> between modes right
        now?&rdquo;</em>
      </p>
      <p>
        Transitions are where the damage happens. Your classifier says
        &ldquo;NORMAL&rdquo; because it hasn&rsquo;t seen enough data to
        reclassify, but the regime ended 3 data points ago. You&rsquo;re making
        normal-mode decisions in a system that&rsquo;s already in crisis.
      </p>
      <blockquote>
        <p>
          One detector tells you what mode you&rsquo;re in. You need a second
          detector to tell you when you&rsquo;re leaving it.
        </p>
      </blockquote>

      <h2>Where This Applies</h2>
      <p>
        The two-layer pattern &mdash; <strong>structural classification + transition
        detection</strong> &mdash; generalizes across any domain with changing
        operating conditions:
      </p>
      <ul>
        <li>
          <strong>ML model monitoring</strong> &mdash; Layer 1: what distribution is
          the data in? Layer 2: is the distribution shifting right now? Catch
          model drift 1-3 batches before accuracy drops.
        </li>
        <li>
          <strong>Infrastructure scaling</strong> &mdash; Layer 1: what traffic
          pattern are we in (steady, ramp, spike)? Layer 2: are we transitioning?
          Scale conservatively during transitions instead of overcommitting.
        </li>
        <li>
          <strong>Feature flags / A/B tests</strong> &mdash; Layer 1: what user
          behavior mode are we in? Layer 2: did a regime change just invalidate
          our test? Pause the test during transitions.
        </li>
        <li>
          <strong>Autonomous agents</strong> &mdash; Layer 1: what task complexity
          regime is the agent in? Layer 2: did the problem difficulty just shift?
          Adjust confidence thresholds before the agent overcommits.
        </li>
      </ul>

      <hr />

      <h2>Layer 1: Structural Classification (Kaufman ER)</h2>

      <h3>What It Is</h3>
      <p>
        The Kaufman Efficiency Ratio is embarrassingly simple: <strong>how much
        of the total movement was productive?</strong> Divide net displacement
        by total path length. A value of 1.0 means every step moved in the
        same direction (pure signal). A value near 0 means the system went
        nowhere despite lots of movement (noise).
      </p>
      <pre><code>{`# The formula
ER = |end_position - start_position| / sum_of_all_step_sizes

# Concrete example: metric over 20 periods
# Steady increase of 10 units:  ER = 10/10 = 1.0   → TREND (strong signal)
# Up 5, down 5:                 ER = 0/10 = 0.0    → DEEP_CHOP (pure noise)
# Slow drift up 3 total:        ER = 3/12 = 0.25   → NORMAL`}</code></pre>
      <p>
        This works for any time series &mdash; server response times, user
        engagement metrics, error rates, model accuracy over time. If you can
        plot it on a line chart, you can compute ER.
      </p>

      <h3>Graduated Classification</h3>
      <p>
        The key insight: <strong>binary classification (signal vs noise) throws
        away information</strong>. There are meaningfully different behaviors
        at different ER levels. We use five tiers:
      </p>
      <table>
        <thead>
          <tr>
            <th>Regime</th>
            <th>ER Range</th>
            <th>Confidence</th>
            <th>What It Means</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>TREND</code></td>
            <td>&ge; 0.35</td>
            <td>100%</td>
            <td>Strong directional signal. Full confidence in decisions.</td>
          </tr>
          <tr>
            <td><code>NORMAL</code></td>
            <td>0.20 &ndash; 0.35</td>
            <td>85%</td>
            <td>Some direction but noisy. Slightly cautious.</td>
          </tr>
          <tr>
            <td><code>VOLATILE</code></td>
            <td>&lt; 0.20, high variance</td>
            <td>70%</td>
            <td>Big movements, no direction. Widen safety margins.</td>
          </tr>
          <tr>
            <td><code>LIGHT_CHOP</code></td>
            <td>0.10 &ndash; 0.20</td>
            <td>60%</td>
            <td>Mostly noise. Block optimistic actions entirely.</td>
          </tr>
          <tr>
            <td><code>DEEP_CHOP</code></td>
            <td>&lt; 0.10</td>
            <td>50%</td>
            <td>Pure noise. Require extreme confirmation to act.</td>
          </tr>
        </tbody>
      </table>

      <h3>The Asymmetry Discovery</h3>
      <p>
        An interesting finding from production data: <strong>negative signals
        work in noisy regimes, positive ones don&rsquo;t</strong>. Pessimistic
        indicators during LIGHT_CHOP had significantly higher accuracy than
        optimistic ones &mdash; which were barely better than random.
      </p>
      <p>
        This makes intuitive sense: negative signals are driven by urgency,
        which is more directional than the hope that drives positive signals.
        In noise, urgency-driven actions still follow through. Hope-driven
        actions don&rsquo;t.
      </p>
      <pre><code>{`REGIME_CONFIG = {
    "TREND":      {"confidence": 1.0,  "confirms": 1},
    "NORMAL":     {"confidence": 0.85, "confirms": 1},
    "VOLATILE":   {"confidence": 0.70, "confirms": 2},
    "LIGHT_CHOP": {"confidence": 0.60, "confirms": 1,
                   "optimistic_confirms": 99},  # blocks optimistic actions
    "DEEP_CHOP":  {"confidence": 0.50, "confirms": 3},
}`}</code></pre>

      <hr />

      <h2>Layer 2: Transition Detection (ADWIN)</h2>

      <h3>What It Is</h3>
      <p>
        ADWIN (Adaptive Windowing) comes from the streaming machine learning
        library <code>river</code>. It was designed to detect concept drift &mdash;
        when the statistical distribution of a data stream changes. It
        continuously monitors a stream and fires when it detects that the
        recent data comes from a different distribution than the older data.
      </p>
      <p>
        The key advantage over rolling windows: <strong>ADWIN adapts its
        window size automatically</strong>. During stable periods, it grows the
        window (accumulating statistical power, reducing false positives).
        When it detects a shift, it shrinks the window (responding quickly
        to the new reality).
      </p>

      <h3>Why Two ADWIN Detectors?</h3>
      <p>
        We run two independent ADWIN detectors with different sensitivities:
      </p>
      <ul>
        <li>
          <strong>Level detector</strong> (<code>delta=0.002</code>, more
          sensitive) &mdash; catches shifts in the <em>mean</em>. Detects when
          the center of the distribution moves.
        </li>
        <li>
          <strong>Variance detector</strong> (<code>delta=0.02</code>, less
          sensitive) &mdash; catches shifts in the <em>variance</em>. Detects when
          the spread of the distribution changes.
        </li>
      </ul>
      <p>
        A regime can change in two ways: the average changes (new trend direction)
        or the variability changes (calm to volatile or vice versa). Separate
        detectors catch both independently.
      </p>

      <h3>The Transition Ramp</h3>
      <p>
        When ADWIN fires, we don&rsquo;t instantly switch behavior. Instead,
        we apply a <strong>graduated uncertainty haircut</strong> that ramps
        from 60% back to 100% over 3 data points:
      </p>
      <pre><code>{`class ADWINDriftDetector:
    def confidence_modifier(self) -> float:
        """How much to trust our current strategy.
        Returns 1.0 when stable, less during transitions."""
        if self.steps_since_drift == 0:  return 0.60  # just detected shift
        elif self.steps_since_drift == 1: return 0.75  # still uncertain
        elif self.steps_since_drift <= 3: return 0.90  # settling down
        return 1.0                                      # stable again`}</code></pre>
      <p>
        This is critical: <strong>the transition period is the most dangerous
        time</strong>. The old regime assumptions are stale but the new regime
        hasn&rsquo;t been confirmed yet. Reducing confidence during this window
        prevents the biggest mistakes.
      </p>

      <hr />

      <h2>Composition: Multiplying the Layers</h2>
      <p>
        The two layers compose multiplicatively. This means they&rsquo;re
        independent &mdash; neither needs to know about the other:
      </p>
      <pre><code>{`# Layer 1: what regime are we in? → base confidence
regime = classify_regime(er_value, variance_percentile)
base_confidence = REGIME_CONFIG[regime]["confidence"]

# Layer 2: are we transitioning? → uncertainty modifier
transition_mod = adwin_detector.confidence_modifier()

# Composite confidence
effective_confidence = base_confidence * transition_mod`}</code></pre>

      <h3>Worked Example</h3>
      <pre><code>{`# Scenario: system is transitioning from NORMAL to TREND

# Time T (ADWIN just fired):
#   ER still says NORMAL       → base = 0.85
#   ADWIN says "something changed" → mod = 0.60
#   Effective: 0.85 × 0.60 = 0.51  (conservative)

# Time T+1:
#   ER still says NORMAL       → base = 0.85
#   ADWIN ramping              → mod = 0.75
#   Effective: 0.85 × 0.75 = 0.64  (recovering)

# Time T+3 (ER catches up):
#   ER now says TREND           → base = 1.0
#   ADWIN almost settled        → mod = 0.90
#   Effective: 1.0 × 0.90 = 0.90  (near full confidence)

# Time T+4:
#   ER says TREND               → base = 1.0
#   ADWIN settled               → mod = 1.0
#   Effective: 1.0 × 1.0 = 1.0    (full confidence)`}</code></pre>
      <p>
        The system is naturally most conservative when it matters most:
        during regime transitions in noisy conditions. And most confident
        when conditions are stable and trending. No manual rules needed &mdash;
        this falls out of the multiplication.
      </p>

      <hr />

      <h2>Results</h2>
      <p>
        Validated across 5 walk-forward evaluation passes (no lookahead bias):
      </p>
      <table>
        <thead>
          <tr>
            <th>Metric</th>
            <th>Value</th>
            <th>Why It Matters</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Monte Carlo confidence</td>
            <td>98.3%</td>
            <td>Probability the system is effective, not lucky</td>
          </tr>
          <tr>
            <td>Avg improvement per pass</td>
            <td>+25.0%</td>
            <td>Consistent across different time windows</td>
          </tr>
          <tr>
            <td>Max drawdown</td>
            <td>17.8%</td>
            <td>Survived every regime transition</td>
          </tr>
          <tr>
            <td>CHOP regime accuracy</td>
            <td>1.84x baseline</td>
            <td>Effective in the regime most systems fail</td>
          </tr>
          <tr>
            <td>TREND regime accuracy</td>
            <td>1.98x baseline</td>
            <td>Captures trends when confirmed</td>
          </tr>
        </tbody>
      </table>
      <p>
        The CHOP accuracy of 1.84x baseline is the headline number. Traditional
        systems either perform poorly in noisy regimes or avoid them entirely.
        The graduated classification (blocking optimistic actions, requiring more
        confirmation) turns a losing regime into a cautiously effective one.
      </p>
      <p>
        The dual-layer detector is the foundation that every other decision
        builds on &mdash; action selection, resource allocation, safety margins,
        and exit rules all adapt based on the composite regime confidence.
      </p>
    </>
  );
}
