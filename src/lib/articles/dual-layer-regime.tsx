export function DualLayerRegimeContent() {
  return (
    <>
      <p>
        <strong>In one sentence:</strong> one sensor tells you what mode
        you&rsquo;re in. Another tells you you&rsquo;re leaving it. Multiply them
        so you get cautious during transitions.
      </p>

      <h2>The Problem Every Automated System Has</h2>
      <p>
        Every system that makes decisions in a changing environment runs on
        assumptions about current conditions. A recommendation engine tuned for
        normal browsing. An autoscaler calibrated for steady growth. An ML model
        trained on one data distribution. A content moderation pipeline tuned for
        English text.
      </p>
      <p>
        When conditions change, those assumptions break. The usual fix is a mode
        classifier - something that tells you which condition you&rsquo;re in so
        you can switch strategies. But here&rsquo;s the question nobody asks:{" "}
        <em>&ldquo;Are we <strong>transitioning</strong> between modes right
        now?&rdquo;</em>
      </p>
      <p>
        Transitions are where the damage happens. Your classifier still says
        &ldquo;STEADY&rdquo; because it hasn&rsquo;t seen enough data to
        reclassify, but the old mode ended a few data points ago. You&rsquo;re
        making steady-mode decisions in a system that&rsquo;s already in crisis.
      </p>
      <blockquote>
        <p>
          One detector tells you what mode you&rsquo;re in. You need a second
          detector to tell you when you&rsquo;re leaving it.
        </p>
      </blockquote>

      <h2>Why This Matters for You</h2>
      <p>
        If you run any system that adapts its behavior to conditions (scaling
        policies, model retraining triggers, feature flags, agent confidence
        thresholds), you have this problem:
      </p>
      <ul>
        <li>
          <strong>ML model monitoring</strong> - Layer 1: what distribution is
          the data in? Layer 2: is the distribution shifting right now? Catch
          drift 1-3 batches before accuracy drops.
        </li>
        <li>
          <strong>Infrastructure scaling</strong> - Layer 1: what traffic pattern
          are we in (steady, ramp, spike)? Layer 2: are we transitioning? Scale
          carefully during transitions instead of overcommitting.
        </li>
        <li>
          <strong>A/B tests and feature flags</strong> - Layer 1: what user
          behavior mode are we in? Layer 2: did conditions just change under the
          test? Pause during transitions.
        </li>
        <li>
          <strong>Autonomous agents</strong> - Layer 1: how hard is the task
          right now? Layer 2: did difficulty just shift? Lower confidence before
          the agent overcommits.
        </li>
        <li>
          <strong>Alerting systems</strong> - Layer 1: what&rsquo;s the baseline
          error rate? Layer 2: is the baseline itself changing? Prevents alert
          fatigue from threshold drift.
        </li>
      </ul>

      <hr />

      <h2>Layer 1: Classifying What Mode You&rsquo;re In</h2>

      <h3>How Much Movement Was Useful?</h3>
      <p>
        The core idea is simple: <strong>how much of the total movement was
        productive?</strong> Divide net change by total distance traveled. A
        value of 1.0 means every step moved in the same direction (clear signal).
        A value near 0 means the system went nowhere despite lots of movement
        (noise).
      </p>
      <pre><code>{`# useful_ratio = |where you ended - where you started| / total distance moved

# Over 20 data points:
# Steady increase of 10:     10/10 = 1.0   → CLEAR (strong signal)
# Up 5, down 5 repeatedly:    0/10 = 0.0   → CHAOS (pure noise)
# Slow drift up of 3 total:   3/12 = 0.25  → STEADY`}</code></pre>
      <p>
        This works for any time series - server response times, user engagement,
        error rates, model accuracy, request latency. If you can plot it on a
        line chart, you can compute it.
      </p>

      <h3>Why Five Tiers Instead of Two</h3>
      <p>
        Binary classification (signal vs noise) throws away information. Five
        graduated tiers let you respond in steps:
      </p>
      <table>
        <thead>
          <tr>
            <th>Mode</th>
            <th>Useful Ratio</th>
            <th>Confidence</th>
            <th>What It Means</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>CLEAR</code></td>
            <td>&ge; 0.35</td>
            <td>100%</td>
            <td>Strong directional signal. Full confidence in decisions.</td>
          </tr>
          <tr>
            <td><code>STEADY</code></td>
            <td>0.20 - 0.35</td>
            <td>85%</td>
            <td>Some direction but noisy. Slightly cautious.</td>
          </tr>
          <tr>
            <td><code>SWINGY</code></td>
            <td>&lt; 0.20, high variance</td>
            <td>70%</td>
            <td>Big movements, no direction. Widen safety margins.</td>
          </tr>
          <tr>
            <td><code>NOISY</code></td>
            <td>0.10 - 0.20</td>
            <td>60%</td>
            <td>Mostly noise. Block optimistic actions entirely.</td>
          </tr>
          <tr>
            <td><code>CHAOS</code></td>
            <td>&lt; 0.10</td>
            <td>50%</td>
            <td>Pure noise. Require extreme confirmation to act.</td>
          </tr>
        </tbody>
      </table>

      <h3>Defensive Actions Survive Noise; Optimistic Ones Don&rsquo;t</h3>
      <p>
        In production data, <strong>defensive actions still work in noisy modes.
        Optimistic ones don&rsquo;t</strong>. Urgency cuts through noise. Hope
        doesn&rsquo;t. So in <code>NOISY</code>, you can still act on
        &ldquo;something is wrong&rdquo; signals - but you block &ldquo;this
        looks like an opportunity&rdquo; signals.
      </p>
      <pre><code>{`MODE_CONFIG = {
    "CLEAR":  {"confidence": 1.0,  "confirms": 1},
    "STEADY": {"confidence": 0.85, "confirms": 1},
    "SWINGY": {"confidence": 0.70, "confirms": 2},
    "NOISY":  {"confidence": 0.60, "confirms": 1,
               "optimistic_confirms": 99},  # blocks optimistic actions
    "CHAOS":  {"confidence": 0.50, "confirms": 3},
}`}</code></pre>

      <hr />

      <h2>Layer 2: Catching the Moment Conditions Change</h2>

      <h3>Notice When Recent Data Stops Matching Older Data</h3>
      <p>
        That&rsquo;s all Layer 2 does. The algorithm commonly used for this is
        called ADWIN: it watches a stream and fires when the recent window looks
        statistically different from the older window. During stable periods it
        grows the window (fewer false alarms). When it detects a shift, it
        shrinks the window (reacts faster).
      </p>

      <h3>Watch the Average and the Spread</h3>
      <p>
        Conditions can change in two ways: the average moves (new baseline) or
        the variability changes (calm to wild). Run two independent detectors:
      </p>
      <ul>
        <li>
          <strong>Level detector</strong> (more sensitive) - catches shifts in
          the mean.
        </li>
        <li>
          <strong>Variance detector</strong> (less sensitive) - catches shifts in
          the spread.
        </li>
      </ul>

      <h3>Don&rsquo;t Flip Instantly - Ramp Confidence Back Up</h3>
      <p>
        When a shift fires, don&rsquo;t instantly switch behavior. Cut trust to
        60%, then ramp back to 100% over a few data points:
      </p>
      <pre><code>{`class DriftDetector:
    def confidence_modifier(self) -> float:
        """How much to trust the current strategy.
        1.0 when stable, less during transitions."""
        if self.steps_since_drift == 0:  return 0.60  # just detected
        elif self.steps_since_drift == 1: return 0.75  # still uncertain
        elif self.steps_since_drift <= 3: return 0.90  # settling
        return 1.0                                      # stable again`}</code></pre>
      <p>
        <strong>The transition period is the most dangerous time</strong>. Old
        assumptions are stale. The new mode isn&rsquo;t confirmed yet. Reducing
        confidence here prevents the biggest mistakes.
      </p>

      <hr />

      <h2>How the Two Layers Compose</h2>
      <p>
        Multiply the two scores. They stay independent. Neither needs to know
        about the other:
      </p>
      <pre><code>{`# Layer 1: what mode are we in? → base confidence
mode = classify_mode(useful_ratio, variance_percentile)
base_confidence = MODE_CONFIG[mode]["confidence"]

# Layer 2: are we transitioning? → uncertainty modifier
transition_mod = drift_detector.confidence_modifier()

# Combined
effective_confidence = base_confidence * transition_mod`}</code></pre>

      <h3>Worked Example</h3>
      <pre><code>{`# Scenario: system transitioning from STEADY to CLEAR

# Time T (drift detected):
#   Layer 1 still says STEADY     → base = 0.85
#   Layer 2 says "something changed" → mod = 0.60
#   Effective: 0.85 × 0.60 = 0.51  (conservative - good)

# Time T+1:
#   Layer 1 still STEADY          → base = 0.85
#   Layer 2 ramping               → mod = 0.75
#   Effective: 0.85 × 0.75 = 0.64  (recovering)

# Time T+3 (Layer 1 catches up):
#   Layer 1 now CLEAR             → base = 1.0
#   Layer 2 almost settled        → mod = 0.90
#   Effective: 1.0 × 0.90 = 0.90  (near full)

# Time T+4:
#   Both settled                  → 1.0 × 1.0 = 1.0`}</code></pre>
      <p>
        You end up most careful when it matters most: during transitions in noisy
        conditions. And most confident when conditions are stable and clear. No
        manual rules needed. It falls out of the multiplication.
      </p>

      <hr />

      <h2>How to Apply This to Your System</h2>
      <ol>
        <li>
          <strong>Pick a health metric</strong> - latency, model accuracy,
          engagement, error rate.
        </li>
        <li>
          <strong>Compute the useful-movement ratio</strong> over a rolling
          window. That classifies the mode (clear, steady, noisy, chaos).
        </li>
        <li>
          <strong>Run a drift detector on the same stream</strong> so you get
          early warning before the mode classifier catches up.
        </li>
        <li>
          <strong>Multiply the two</strong> and use the combined score to adjust
          behavior - scaling aggressiveness, alert thresholds, retraining
          triggers, agent autonomy.
        </li>
      </ol>

      <hr />

      <h2>What Changes in Practice</h2>
      <p>
        After adding both layers to live systems, three things showed up
        consistently:
      </p>
      <ul>
        <li>
          <strong>Fewer bad calls during noisy periods</strong> - blocking
          optimistic actions when the useful-movement ratio is low stopped the
          worst overcommits.
        </li>
        <li>
          <strong>Earlier caution on transitions</strong> - the drift layer
          usually fired 1-3 points before the mode classifier renamed the
          regime, which is exactly the window where old rules hurt most.
        </li>
        <li>
          <strong>Clearer behavior when conditions are stable</strong> - once
          both layers settled, the system stopped second-guessing itself and
          acted at full confidence.
        </li>
      </ul>
      <blockquote>
        <p>
          The dual-layer detector is the foundation other decisions build on.
          Action selection, resource allocation, and safety margins all adapt
          from the combined confidence score.
        </p>
      </blockquote>
    </>
  );
}
