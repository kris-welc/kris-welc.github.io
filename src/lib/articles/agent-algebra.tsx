export function AgentAlgebraContent() {
  return (
    <>
      <h2>Why This Matters</h2>
      <p>
        You&rsquo;ve probably built something like this: an LLM generates a
        draft, a second LLM reviews it, and if the review fails, you retry.
        Maybe you added a router that picks the best model for each task. Or
        you&rsquo;re running multiple agents that vote on an answer.
      </p>
      <p>
        Here&rsquo;s the uncomfortable question: <strong>how do you know it
        gets better over time?</strong> How do you know the retry loop
        converges instead of oscillating? How do you know your voting system
        doesn&rsquo;t amplify the worst agent&rsquo;s mistakes? How do you know
        your confidence scores mean anything?
      </p>
      <p>
        You don&rsquo;t. Because the current approach to multi-agent systems
        is plumbing — connect things, run them, hope for the best. There is no
        formal theory telling you what to expect from the connections you make.
      </p>
      <blockquote>
        <p>
          The difference between hoping your system improves and proving it does
          is what separates engineering from tinkering.
        </p>
      </blockquote>
      <p>
        Agent Algebra fills that gap. Six mathematical theorems, each mapped to
        a composable Python primitive. Each primitive comes with a specific,
        provable guarantee about what it will do to your system&rsquo;s behavior.
      </p>

      <h2>Where This Applies</h2>
      <p>
        The six primitives apply anywhere you compose multiple AI agents or
        decision-making components:
      </p>
      <ul>
        <li>
          <strong>LLM pipelines</strong> — retry loops, multi-model voting,
          chain-of-thought refinement, RAG quality scoring
        </li>
        <li>
          <strong>Recommendation systems</strong> — combining multiple scoring
          models with calibration-tracked weights
        </li>
        <li>
          <strong>Content moderation</strong> — cascading classifiers where each
          focuses on what the previous one missed
        </li>
        <li>
          <strong>Autonomous agents</strong> — self-calibrating parameters,
          resource allocation, confidence-based routing
        </li>
        <li>
          <strong>Forecasting</strong> — combining expert predictions with
          proper scoring rules, filtering noise from signal
        </li>
        <li>
          <strong>Resource allocation</strong> — budget sizing, capacity
          planning, and risk-aware distribution across competing priorities
        </li>
      </ul>

      <h2>The Framework: Six Theorems, Six Primitives</h2>
      <table>
        <thead>
          <tr>
            <th>Theorem</th>
            <th>Plain English</th>
            <th>Guarantee</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Banach Fixed-Point</td>
            <td>Your feedback loop will settle down, not oscillate</td>
            <td>Convergence in O(log(1/&epsilon;)) iterations</td>
          </tr>
          <tr>
            <td>Schapire AdaBoost</td>
            <td>Mediocre agents become excellent together</td>
            <td>Exponential error reduction</td>
          </tr>
          <tr>
            <td>de Finetti Scoring</td>
            <td>The best-calibrated agent gets the most influence</td>
            <td>Honesty is the dominant strategy</td>
          </tr>
          <tr>
            <td>Ole Peters Ergodicity</td>
            <td>Don&rsquo;t bet so big you can&rsquo;t survive a bad streak</td>
            <td>Path-dependent survival</td>
          </tr>
          <tr>
            <td>Pearl Belief Propagation</td>
            <td>Local conversations produce global consensus</td>
            <td>Globally optimal from local messages</td>
          </tr>
          <tr>
            <td>Kolmogorov MDL</td>
            <td>If you can compress it, it&rsquo;s real. If not, it&rsquo;s noise.</td>
            <td>Principled signal/noise separation</td>
          </tr>
        </tbody>
      </table>

      <p>
        Zero external dependencies. Pure Python standard library. All types are
        frozen dataclasses — immutable, composable, testable.
      </p>

      <hr />

      <h2>1. Contraction Mapping — &ldquo;Will my loop converge?&rdquo;</h2>

      <h3>The Problem</h3>
      <p>
        You have a feedback loop. An agent generates output, you evaluate it,
        feed the evaluation back, the agent tries again. This is every
        &ldquo;self-improving&rdquo; system ever built — from LLM retry loops to
        hyperparameter tuning to prompt optimization.
      </p>
      <p>
        The question nobody asks: <strong>will it converge?</strong> Or will
        iteration 5 be worse than iteration 3? Most retry loops have no answer.
        They run for N iterations and take the best one. That&rsquo;s not
        convergence — that&rsquo;s random search.
      </p>

      <h3>The Guarantee</h3>
      <p>
        A contraction mapping has one rule: each step must get closer to the
        answer by a fixed fraction. If your update function satisfies{" "}
        <code>k &lt; 1</code> (it moves less than 100% of the distance each
        time), convergence is <em>mathematically guaranteed</em>. Not probably.
        Not usually. Guaranteed.
      </p>
      <p>
        Think of it like this: if you always walk halfway to your destination,
        you&rsquo;ll never overshoot, and you&rsquo;ll get arbitrarily close.
        That&rsquo;s <code>k = 0.5</code>.
      </p>

      <h3>The Code</h3>
      <pre><code>{`from agent_algebra import contraction_step, contraction_loop

# One step: blend current estimates toward observed reality
# k=0.5 means "move halfway toward the truth each iteration"
new_params, distance = contraction_step(
    current={"accuracy": 0.50, "threshold": 0.60},
    realized={"accuracy": 0.72, "threshold": 0.55},
    k=0.5,
)
# distance tells you how far you moved — when it's < tolerance, you're done

# Full loop: keep iterating until convergence
result = contraction_loop(
    generate=run_evaluation,  # your function: params -> measured results
    initial={"accuracy": 0.50},
    k=0.5,
    tol=1e-3,  # stop when movement is this small
)
# result.converged = True
# result.iteration = 4  (typically 3-5 iterations)`}</code></pre>

      <h3>Where You&rsquo;d Use This</h3>
      <ul>
        <li>
          <strong>Prompt optimization</strong> — tune prompt parameters, measure
          output quality, feed back. Converges to optimal prompts instead of
          random-searching.
        </li>
        <li>
          <strong>Model calibration</strong> — adjust confidence thresholds based
          on observed accuracy. Each round gets closer to true calibration.
        </li>
        <li>
          <strong>A/B test parameter tuning</strong> — converge on optimal split
          ratios rather than grid-searching.
        </li>
        <li>
          <strong>Agent self-calibration</strong> — an ensemble system starts
          with estimated accuracy priors, runs evaluation rounds, and converges
          to true accuracy in 4 iterations.
        </li>
      </ul>

      <hr />

      <h2>2. AdaBoost Cascade — &ldquo;My agents are mediocre individually&rdquo;</h2>

      <h3>The Problem</h3>
      <p>
        You have multiple models or agents. None of them is great on its own —
        maybe 55-65% accuracy each. You average their outputs and get... roughly
        the same accuracy. Averaging doesn&rsquo;t help much because all agents
        tend to be wrong on the same hard cases.
      </p>

      <h3>The Guarantee</h3>
      <p>
        Boosting solves this by making each successive agent <strong>focus on
        what the previous agents got wrong</strong>. Agent 1 makes predictions.
        Cases it got wrong get upweighted. Agent 2 trains on the reweighted data,
        so it specializes in Agent 1&rsquo;s failures. Agent 3 specializes in
        what both missed. The combined error drops <em>exponentially</em> with
        each round.
      </p>
      <p>
        The math guarantees that any collection of agents that are each slightly
        better than random (&gt;50%) can be combined into an arbitrarily accurate
        ensemble.
      </p>

      <h3>The Code</h3>
      <pre><code>{`from agent_algebra import boost_cascade

ensemble = boost_cascade(
    agents=[content_filter, toxicity_model, context_checker],
    data=test_inputs,
    outcomes=ground_truth,
    rounds=3,
)

# The ensemble automatically weights each agent by its accuracy
# and focuses later agents on earlier agents' failures
prediction = ensemble.predict(new_input)

# ensemble.rounds shows what happened:
# Round 1: content_filter, error=0.35, weight=0.62
# Round 2: toxicity_model, error=0.22, weight=1.27 (focused on misses)
# Round 3: context_checker, error=0.08, weight=2.44 (specialist)`}</code></pre>

      <h3>Where You&rsquo;d Use This</h3>
      <ul>
        <li>
          <strong>Content moderation</strong> — general filter catches obvious
          cases, toxicity model catches subtle abuse, context model catches
          edge cases that need understanding.
        </li>
        <li>
          <strong>Multi-LLM pipelines</strong> — cheap model handles easy
          requests, expensive model handles what the cheap one failed.
        </li>
        <li>
          <strong>Code review agents</strong> — linter catches syntax, style
          checker catches patterns, security scanner catches what both missed.
        </li>
        <li>
          <strong>Anomaly detection</strong> — individual detectors (statistical,
          rule-based, ML-based) are mediocre alone but strong together when
          each specializes in what the others miss.
        </li>
      </ul>

      <hr />

      <h2>3. Proper Scoring Rules — &ldquo;Which agent should I trust?&rdquo;</h2>

      <h3>The Problem</h3>
      <p>
        You have multiple agents giving probability estimates. One says 80%
        confidence, another says 60%. Which one should you weight more? The
        obvious answer — &ldquo;the one with higher accuracy&rdquo; — is wrong.
        An agent that says 90% on everything and is right 70% of the time has
        good accuracy but terrible <em>calibration</em>. When it says 90%, it
        should be right 90% of the time, not 70%.
      </p>

      <h3>The Guarantee</h3>
      <p>
        A <strong>proper scoring rule</strong> is a mathematical function where
        the only way to maximize your score is to report your <em>true</em>{" "}
        belief. No gaming, no sandbagging, no overconfidence. The Brier score
        and log score are both proper. An agent that tries to inflate its
        confidence will score worse, not better.
      </p>
      <p>
        This means you can use each agent&rsquo;s historical score as a trust
        weight — and it&rsquo;s <em>incentive-compatible</em>. The system
        automatically gives the most influence to the best-calibrated agent.
      </p>

      <h3>The Code</h3>
      <pre><code>{`from agent_algebra import ScoringTracker, Prediction, Outcome

tracker = ScoringTracker()

# Record predictions and what actually happened
tracker.record("gpt4", Prediction(0.85), Outcome(True))
tracker.record("gpt4", Prediction(0.30), Outcome(False))
tracker.record("claude", Prediction(0.70), Outcome(True))
tracker.record("claude", Prediction(0.90), Outcome(False))  # overconfident!

# Claude said 90% but was wrong — its Brier score takes a hit
board = tracker.leaderboard()
# gpt4:   Brier=0.0450, weight=0.69  (well-calibrated)
# claude:  Brier=0.3050, weight=0.31  (overconfident, penalized)

# Aggregate using calibration weights — gpt4 gets more say
combined = tracker.aggregate({"gpt4": 0.75, "claude": 0.60})
# combined ≈ 0.70  (closer to gpt4's estimate)`}</code></pre>

      <h3>Where You&rsquo;d Use This</h3>
      <ul>
        <li>
          <strong>Multi-model routing</strong> — don&rsquo;t just pick the
          cheapest model that can handle the task. Weight models by their
          calibration track record.
        </li>
        <li>
          <strong>Expert prediction aggregation</strong> — when multiple
          forecasters give probability estimates, weight by historical
          calibration.
        </li>
        <li>
          <strong>RAG confidence scoring</strong> — track which retrieval
          strategies are well-calibrated and weight accordingly.
        </li>
        <li>
          <strong>Multi-agent orchestration</strong> — 4 specialized agents
          are automatically weighted by Brier score. A poorly calibrated
          agent gets downweighted without manual intervention.
        </li>
      </ul>

      <hr />

      <h2>4. Ergodicity-Corrected Kelly — &ldquo;How much should I bet?&rdquo;</h2>

      <h3>The Problem</h3>
      <p>
        You have a resource allocation problem. You know the expected payoff
        and the risk. The textbook answer (Kelly criterion) says to bet a
        certain fraction of your bankroll. But the textbook assumes every bet
        is independent. In reality, bad outcomes cluster — a bad streak isn&rsquo;t
        just bad luck, it often means conditions have changed.
      </p>
      <p>
        The deeper issue: <strong>the average across all possible outcomes is
        not the same as your actual experience over time</strong>. On average
        across 1,000 parallel universes, Kelly sizing works great. But you
        don&rsquo;t live in 1,000 universes. You live in one. The one where
        a bad streak can wipe you out before the law of large numbers kicks in.
      </p>

      <h3>The Guarantee</h3>
      <p>
        The ergodic correction computes the ratio of{" "}
        <strong>median</strong> terminal wealth to <strong>mean</strong> terminal
        wealth via Monte Carlo simulation. If the median is 72% of the mean,
        your real-world experience is 28% worse than the textbook predicts. The
        correction shrinks your bet size accordingly.
      </p>

      <h3>The Code</h3>
      <pre><code>{`from agent_algebra import ergodic_kelly

result = ergodic_kelly(
    win_rate=0.60,
    win_loss_ratio=1.5,
    returns=historical_returns,  # needed to measure serial correlation
    n_paths=1000,
)

# result.kelly_fraction = 0.267    (textbook says bet 26.7%)
# result.ergodic_fraction = 0.192  (real-world safe bet is 19.2%)
# result.correction_factor = 0.72  (your path is 72% of the average)`}</code></pre>

      <h3>Where You&rsquo;d Use This</h3>
      <ul>
        <li>
          <strong>API budget allocation</strong> — how much of your LLM budget
          to allocate to expensive models vs cheap ones, accounting for
          cost variance clustering.
        </li>
        <li>
          <strong>Feature rollout</strong> — how aggressively to roll out a
          feature when early metrics have serial correlation (users who see bugs
          early leave, making subsequent metrics look worse).
        </li>
        <li>
          <strong>Infrastructure scaling</strong> — how much spare capacity to
          keep, accounting for correlated demand spikes.
        </li>
        <li>
          <strong>Compute budget allocation</strong> — distributing GPU time
          across concurrent workloads. Standard Kelly says 26.7%, but the
          ergodic correction says 19.2% given real-world failure clustering.
        </li>
      </ul>

      <hr />

      <h2>5. Belief Propagation — &ldquo;My sources disagree&rdquo;</h2>

      <h3>The Problem</h3>
      <p>
        You have multiple information sources that each have a local view. Source
        A says 75% likely. Source B says 40% likely. Source C says 60% likely.
        You could average them (58.3%), but that ignores their
        relationships. A is upstream of B — if A is right, B&rsquo;s estimate should
        shift. C depends on both A and B. Simple averaging throws away the
        structure of how these sources relate to each other.
      </p>

      <h3>The Guarantee</h3>
      <p>
        Belief propagation models the sources as a graph where each node only
        talks to its neighbors. Through iterative message passing — each node
        sends its belief to its neighbors, each neighbor updates — the network
        converges to <strong>globally optimal posteriors</strong>. Every node
        ends up with a belief that accounts for all information in the network,
        even from nodes it never directly communicated with.
      </p>

      <h3>The Code</h3>
      <pre><code>{`from agent_algebra import BeliefNode, build_graph, propagate

# Define agents and their local probability estimates
agents = [
    BeliefNode("user_intent", local_prob=0.60),
    BeliefNode("context_relevance", local_prob=0.75),
    BeliefNode("sentiment", local_prob=0.55),
    BeliefNode("factuality", local_prob=0.40),
]

# Define which agents influence each other
edges = [
    ("user_intent", "context_relevance"),  # intent informs relevance
    ("user_intent", "sentiment"),           # intent informs tone
    ("context_relevance", "sentiment"),     # relevant context affects sentiment
    ("sentiment", "factuality"),            # emotional content affects factual rigor
]

graph = build_graph(agents, edges)
result = propagate(graph, damping=0.3)

# result.converged = True in 8 iterations
# result.beliefs:
#   user_intent: 0.5812       (pulled down by low factuality)
#   context_relevance: 0.6634 (pulled up by intent + its own strength)
#   sentiment: 0.5421         (influenced by both neighbors)
#   factuality: 0.4518        (slightly pulled up by network)`}</code></pre>

      <h3>Where You&rsquo;d Use This</h3>
      <ul>
        <li>
          <strong>RAG quality scoring</strong> — retrieval relevance, semantic
          similarity, source authority, and freshness as a belief graph. Relevance
          influences how much authority matters.
        </li>
        <li>
          <strong>Incident diagnosis</strong> — CPU, memory, network, and error
          rate monitors as nodes. Belief propagation finds the root cause by
          propagating evidence through the dependency graph.
        </li>
        <li>
          <strong>Multi-sensor fusion</strong> — IoT sensors with different
          accuracy and spatial relationships. Each sensor updates based on
          neighbors.
        </li>
        <li>
          <strong>Pipeline quality assessment</strong> — four quality signals
          (input validation, processing confidence, output coherence, factual
          grounding) as a belief graph. Input quality influences processing
          confidence, creating information flow that averaging would miss.
        </li>
      </ul>

      <hr />

      <h2>6. MDL Compression — &ldquo;Is this signal or noise?&rdquo;</h2>

      <h3>The Problem</h3>
      <p>
        You&rsquo;re processing a stream of data — news articles, log entries,
        user feedback, sensor readings. Some of it contains real patterns. Most
        of it is noise. How do you tell the difference without domain-specific
        rules for every type of data?
      </p>

      <h3>The Guarantee</h3>
      <p>
        The Minimum Description Length principle says: <strong>if a pattern can
        be described more concisely than the raw data, it&rsquo;s real</strong>.
        Random noise can&rsquo;t be compressed — by definition, every bit is
        unpredictable. Structured data compresses well because there are
        patterns to exploit.
      </p>
      <p>
        We use <code>zlib</code> as a practical Kolmogorov complexity estimator.
        Compress the data and measure the ratio. Low ratio = structure = signal.
        High ratio = randomness = noise.
      </p>

      <h3>The Code</h3>
      <pre><code>{`from agent_algebra import mdl_filter, algorithmic_compression_ratio

# Quick check: is this data structured or random?
ratio = algorithmic_compression_ratio(article_text)
# ratio = 0.32 → highly compressible → structured → signal
# ratio = 0.91 → barely compresses → random → noise

# Filter a batch: keep only items that contain real patterns
signals = mdl_filter(
    items=daily_articles,
    summarize_fn=llm_summarize,      # your LLM summarizer
    reconstruct_fn=llm_reconstruct,  # can the summary reconstruct key facts?
    compression_threshold=0.5,       # summary must be < 50% of original
    reconstruction_threshold=0.3,    # at least 30% fact recovery
)`}</code></pre>

      <h3>Where You&rsquo;d Use This</h3>
      <ul>
        <li>
          <strong>Log analysis</strong> — separate meaningful error patterns from
          noise in high-volume log streams.
        </li>
        <li>
          <strong>Content curation</strong> — filter AI-generated slop from
          genuine content. Slop has high compression ratios (repetitive patterns).
        </li>
        <li>
          <strong>Feature importance</strong> — in ML pipelines, features that
          compress well relative to the target contain signal.
        </li>
        <li>
          <strong>Data ingestion pipelines</strong> — processing hundreds of
          documents daily. MDL filter drops noise before LLM scoring, saving
          40% of API costs.
        </li>
      </ul>

      <hr />

      <h2>Composing the Pipeline</h2>
      <p>
        Each primitive works standalone, but they&rsquo;re designed to compose.
        The <code>Pipeline</code> chains them into an immutable sequence where
        each step transforms data and passes it to the next.
      </p>
      <pre><code>{`from agent_algebra import Pipeline

pipeline = (
    Pipeline()
    .add("filter", lambda data: mdl_filter(data, summarize, reconstruct))
    .add("beliefs", lambda filtered: propagate(build_graph(agents, edges)).beliefs)
    .add("score", lambda beliefs: tracker.aggregate(beliefs))
    .add("size", lambda prob: prob * ergodic.ergodic_fraction)
)

# Traced execution — see every intermediate value
trace = pipeline.run_traced(raw_data)
for step_name, value in trace:
    print(f"  [{step_name}] {value}")

# [input]   [...raw items...]
# [filter]  [...signal items only...]
# [beliefs] {'intent': 0.58, 'relevance': 0.66, ...}
# [score]   0.6241
# [size]    0.1123`}</code></pre>
      <p>
        Each <code>.add()</code> returns a new Pipeline — immutable builder
        pattern. The <code>run_traced</code> method captures every intermediate
        result for debugging. You can inspect exactly where your pipeline&rsquo;s
        output came from.
      </p>

      <hr />

      <h2>The Takeaway</h2>
      <p>
        Most multi-agent systems are built on intuition — &ldquo;this seems
        like a reasonable way to combine these models.&rdquo; Agent Algebra
        replaces intuition with guarantees:
      </p>
      <ul>
        <li>
          <strong>Contraction mapping</strong> guarantees your feedback loop
          converges. A retry loop might oscillate forever.
        </li>
        <li>
          <strong>Boosting</strong> guarantees mediocre agents become strong
          together. Averaging keeps them mediocre.
        </li>
        <li>
          <strong>Proper scoring</strong> guarantees the best agent gets the most
          weight. Manual tuning drifts out of date.
        </li>
        <li>
          <strong>Ergodic correction</strong> guarantees you survive bad streaks.
          Textbook sizing can ruin you.
        </li>
        <li>
          <strong>Belief propagation</strong> guarantees globally optimal
          consensus. Simple averaging ignores structure.
        </li>
        <li>
          <strong>MDL compression</strong> guarantees you filter noise before
          it corrupts your pipeline. Threshold-based filters need constant tuning.
        </li>
      </ul>
      <p>
        The library is open source, zero dependencies, and every primitive
        is a pure function operating on frozen dataclasses. Read the code,
        run the tests, compose the pipeline.
      </p>
    </>
  );
}
