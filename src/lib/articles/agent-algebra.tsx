// SPDX-License-Identifier: AGPL-3.0-only AND CC-BY-NC-SA-4.0
// Copyright (c) 2026 Kris Welc. All rights reserved.
// Article prose: CC BY-NC-SA 4.0 | Source code: AGPL-3.0
// Commercial license: see /COMMERCIAL-LICENSE.md

import { ContractionConvergence } from "@/components/diagrams/contraction-convergence";
import { AdaBoostCascade } from "@/components/diagrams/adaboost-cascade";
import { BeliefPropagation } from "@/components/diagrams/belief-propagation";

export function AgentAlgebraContent() {
  return (
    <>
      <p>
        <strong>In one sentence:</strong> six small building blocks that make
        multi-agent systems behave predictably instead of hopefully.
      </p>

      <h2>The Problem This Solves</h2>
      <p>
        You&rsquo;ve probably built something like this: an LLM generates a
        draft, a second LLM reviews it, and if the review fails, you retry.
        Maybe you added a router that picks the best model for each task. Or
        you&rsquo;re running multiple agents that vote on an answer.
      </p>
      <p>
        Now the uncomfortable question: <strong>how do you know it actually
        gets better over time?</strong> How do you know the retry loop settles
        instead of bouncing around? How do you know your voting system
        doesn&rsquo;t amplify the worst agent&rsquo;s mistakes? How do you know
        your confidence scores mean anything?
      </p>
      <p>
        Most systems answer that with plumbing: connect things, run them, hope.
        This article gives you six primitives with a specific guarantee each. You
        can install them as pure Python (standard library only) today.
      </p>

      <h2>A Concrete Story First</h2>
      <p>
        Suppose you have a retry loop that runs five times and picks the best
        draft. Iteration 3 scored well. Iteration 5 scored worse. You shipped
        iteration 5 because &ldquo;more tries = better.&rdquo; That isn&rsquo;t
        improvement. It&rsquo;s random search with extra latency.
      </p>
      <p>
        Primitive 1 fixes that: each update must move <em>partway</em> toward
        measured reality, not jump around. After a few rounds the loop stops
        because movement got tiny. You can prove it settled. The other five
        primitives answer the next questions the same way: mediocre agents,
        trust, budget, disagreement, and noise.
      </p>

      <h2>Who Should Read This</h2>
      <ul>
        <li>
          <strong>LLM pipelines</strong> - retry loops, multi-model voting,
          refinement, RAG quality scoring
        </li>
        <li>
          <strong>Recommendation / moderation</strong> - combining scorers,
          cascading classifiers
        </li>
        <li>
          <strong>Autonomous agents</strong> - calibration, routing, resource
          limits
        </li>
        <li>
          <strong>Forecasting</strong> - combining expert probabilities without
          letting overconfidence win
        </li>
      </ul>

      <h2>Six Questions, Six Guarantees</h2>
      <table>
        <thead>
          <tr>
            <th>Question</th>
            <th>Plain English</th>
            <th>Guarantee</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Will my loop settle?</td>
            <td>Each step moves partway toward the answer</td>
            <td>Settles in a predictable number of iterations</td>
          </tr>
          <tr>
            <td>Agents are mediocre alone</td>
            <td>Each later agent focuses on earlier misses</td>
            <td>Combined error drops fast</td>
          </tr>
          <tr>
            <td>Which agent should I trust?</td>
            <td>Reward honest probabilities, not swagger</td>
            <td>Best-calibrated agent gets the most weight</td>
          </tr>
          <tr>
            <td>How much should I commit?</td>
            <td>Size for surviving a bad streak, not the average universe</td>
            <td>Safer commitment size under clustered failures</td>
          </tr>
          <tr>
            <td>My sources disagree</td>
            <td>Neighbors share beliefs until the network agrees</td>
            <td>Global consensus from local messages</td>
          </tr>
          <tr>
            <td>Signal or noise?</td>
            <td>If it compresses, it&rsquo;s structure; if not, it&rsquo;s noise</td>
            <td>Principled filter without domain rules</td>
          </tr>
        </tbody>
      </table>
      <p>
        (Under the hood these map to classic results: fixed-point contraction,
        boosting, proper scoring, path-dependent survival, belief propagation,
        minimum description length. You don&rsquo;t need the names to use the
        primitives.)
      </p>

      <hr />

      <h2>1. Will My Loop Settle?</h2>

      <h3>The Problem</h3>
      <p>
        Feedback loops are everywhere: generate, evaluate, feed back, try again.
        Most retry loops run for N iterations and take the best one. That&rsquo;s
        not settling. That&rsquo;s random search.
      </p>

      <h3>The Guarantee</h3>
      <p>
        Make each update move <strong>less than the full distance</strong> toward
        the measured result. If you always walk halfway to the destination, you
        never overshoot, and you get arbitrarily close. That simple rule is
        enough for mathematical convergence.
      </p>

      <ContractionConvergence />

      <h3>The Code</h3>
      <pre><code>{`from agent_algebra import contraction_step, contraction_loop

# k=0.5 means "move halfway toward the truth each iteration"
new_params, distance = contraction_step(
    current={"accuracy": 0.50, "threshold": 0.60},
    realized={"accuracy": 0.72, "threshold": 0.55},
    k=0.5,
)

result = contraction_loop(
    generate=run_evaluation,  # your function: params -> measured results
    initial={"accuracy": 0.50},
    k=0.5,
    tol=1e-3,  # stop when movement is this small
)
# result.converged = True after typically 3-5 iterations`}</code></pre>

      <h3>Where You&rsquo;d Use This</h3>
      <ul>
        <li>
          <strong>Prompt optimization</strong> - tune, measure, feed back until
          movement is tiny.
        </li>
        <li>
          <strong>Model calibration</strong> - adjust thresholds toward observed
          accuracy.
        </li>
        <li>
          <strong>Agent self-calibration</strong> - start with rough priors,
          converge to measured accuracy.
        </li>
      </ul>

      <hr />

      <h2>2. My Agents Are Mediocre Individually</h2>

      <h3>The Problem</h3>
      <p>
        Several models at 55-65% accuracy. Averaging them barely helps because
        they fail on the same hard cases.
      </p>

      <h3>The Guarantee</h3>
      <p>
        Make each successive agent <strong>focus on what the previous ones got
        wrong</strong>. Agent 1 predicts. Its misses get more weight. Agent 2
        specializes there. Agent 3 covers what both missed. Combined error drops
        fast - as long as each agent is a bit better than a coin flip.
      </p>

      <AdaBoostCascade />

      <h3>The Code</h3>
      <pre><code>{`from agent_algebra import boost_cascade

ensemble = boost_cascade(
    agents=[content_filter, toxicity_model, context_checker],
    data=test_inputs,
    outcomes=ground_truth,
    rounds=3,
)

prediction = ensemble.predict(new_input)
# Later agents automatically specialize on earlier misses`}</code></pre>

      <h3>Where You&rsquo;d Use This</h3>
      <ul>
        <li>
          <strong>Content moderation</strong> - general filter → toxicity →
          context edge cases.
        </li>
        <li>
          <strong>Multi-LLM pipelines</strong> - cheap model first; expensive
          model only on failures.
        </li>
        <li>
          <strong>Code review agents</strong> - lint → style → security, each on
          prior misses.
        </li>
      </ul>

      <hr />

      <h2>3. Which Agent Should I Trust?</h2>

      <h3>The Problem</h3>
      <p>
        One agent says 80%, another says 60%. Higher accuracy is the wrong
        answer. An agent that says 90% on everything and is right 70% of the time
        has terrible <em>calibration</em>. When it says 90%, it should be right
        90% of the time.
      </p>

      <h3>The Guarantee</h3>
      <p>
        Score agents so the only way to maximize the score is to report true
        belief - no swagger, no sandbagging. Historical score becomes the trust
        weight. The best-calibrated agent automatically gets the most say.
      </p>

      <h3>The Code</h3>
      <pre><code>{`from agent_algebra import ScoringTracker, Prediction, Outcome

tracker = ScoringTracker()
tracker.record("gpt4", Prediction(0.85), Outcome(True))
tracker.record("gpt4", Prediction(0.30), Outcome(False))
tracker.record("claude", Prediction(0.70), Outcome(True))
tracker.record("claude", Prediction(0.90), Outcome(False))  # overconfident

board = tracker.leaderboard()
# gpt4 gets higher weight; claude is penalized for overconfidence
combined = tracker.aggregate({"gpt4": 0.75, "claude": 0.60})`}</code></pre>

      <h3>Where You&rsquo;d Use This</h3>
      <ul>
        <li>
          <strong>Multi-model routing</strong> - weight by calibration track
          record, not just cost.
        </li>
        <li>
          <strong>Expert forecasts</strong> - combine probabilities by historical
          honesty.
        </li>
        <li>
          <strong>RAG confidence</strong> - track which retrieval strategies are
          well-calibrated.
        </li>
      </ul>

      <hr />

      <h2>4. How Much Should I Commit?</h2>

      <h3>The Problem</h3>
      <p>
        You have a budget (API spend, rollout percentage, spare capacity). The
        textbook says commit a certain fraction based on expected payoff. That
        math assumes bad outcomes are independent. In reality, failures cluster.
        A bad week often means conditions changed, not that luck will reverse
        tomorrow.
      </p>
      <p>
        You live in one timeline. A bad streak can exhaust the budget before
        &ldquo;on average it works out&rdquo; ever shows up.
      </p>

      <h3>The Guarantee</h3>
      <p>
        Simulate many paths with realistic clustering. Compare the{" "}
        <strong>typical</strong> (median) ending to the <strong>average</strong>{" "}
        ending. If the typical path is only 72% as good as the average, shrink
        your commitment by that factor. You size for survival, not for the
        fantasy average universe.
      </p>

      <h3>The Code</h3>
      <pre><code>{`from agent_algebra import ergodic_kelly

result = ergodic_kelly(
    win_rate=0.60,
    win_loss_ratio=1.5,
    returns=historical_outcomes,  # to measure how failures cluster
    n_paths=1000,
)

# textbook_fraction = 0.267   (commit 26.7% of budget)
# safe_fraction     = 0.192   (commit 19.2% after survival correction)
# correction_factor = 0.72    (typical path is 72% of the average)`}</code></pre>

      <h3>Where You&rsquo;d Use This</h3>
      <ul>
        <li>
          <strong>API budget</strong> - how much spend on expensive models vs
          cheap ones when cost spikes cluster.
        </li>
        <li>
          <strong>Feature rollout</strong> - how aggressive when early bugs cause
          correlated churn.
        </li>
        <li>
          <strong>Spare capacity</strong> - how much headroom when demand spikes
          arrive together.
        </li>
      </ul>

      <hr />

      <h2>5. My Sources Disagree</h2>

      <h3>The Problem</h3>
      <p>
        Source A says 75%. B says 40%. C says 60%. Averaging to 58% ignores that
        A feeds B, and C depends on both. Structure matters.
      </p>

      <h3>The Guarantee</h3>
      <p>
        Model sources as a graph. Each node only talks to neighbors. After a few
        rounds of message passing, every node holds a belief that accounts for
        the whole network - including nodes it never spoke to directly.
      </p>

      <BeliefPropagation />

      <h3>The Code</h3>
      <pre><code>{`from agent_algebra import BeliefNode, build_graph, propagate

agents = [
    BeliefNode("user_intent", local_prob=0.60),
    BeliefNode("context_relevance", local_prob=0.75),
    BeliefNode("sentiment", local_prob=0.55),
    BeliefNode("factuality", local_prob=0.40),
]

edges = [
    ("user_intent", "context_relevance"),
    ("user_intent", "sentiment"),
    ("context_relevance", "sentiment"),
    ("sentiment", "factuality"),
]

result = propagate(build_graph(agents, edges), damping=0.3)
# Each belief now reflects the whole network, not just its local view`}</code></pre>

      <h3>Where You&rsquo;d Use This</h3>
      <ul>
        <li>
          <strong>RAG quality</strong> - relevance, authority, freshness as a
          graph, not a flat average.
        </li>
        <li>
          <strong>Incident diagnosis</strong> - CPU, memory, network, errors
          propagate evidence to a likely root cause.
        </li>
        <li>
          <strong>Pipeline quality</strong> - validation → processing confidence
          → output coherence as linked beliefs.
        </li>
      </ul>

      <hr />

      <h2>6. Is This Signal or Noise?</h2>

      <h3>The Problem</h3>
      <p>
        Streams of articles, logs, feedback, sensors. Some contain real patterns.
        Most is noise. You don&rsquo;t want a hand-tuned rule for every type.
      </p>

      <h3>The Guarantee</h3>
      <p>
        If a pattern can be described more concisely than the raw data,
        it&rsquo;s real. Random noise doesn&rsquo;t compress. Structured data
        does. Compress, measure the ratio, keep the compressible stuff.
      </p>

      <h3>The Code</h3>
      <pre><code>{`from agent_algebra import mdl_filter, algorithmic_compression_ratio

ratio = algorithmic_compression_ratio(article_text)
# 0.32 → highly compressible → signal
# 0.91 → barely compresses → noise

signals = mdl_filter(
    items=daily_articles,
    summarize_fn=llm_summarize,
    reconstruct_fn=llm_reconstruct,
    compression_threshold=0.5,
    reconstruction_threshold=0.3,
)`}</code></pre>

      <h3>Where You&rsquo;d Use This</h3>
      <ul>
        <li>
          <strong>Log analysis</strong> - keep meaningful error patterns, drop
          chatter.
        </li>
        <li>
          <strong>Content curation</strong> - filter repetitive slop before
          scoring.
        </li>
        <li>
          <strong>Ingestion pipelines</strong> - drop noise early to cut API cost.
        </li>
      </ul>

      <hr />

      <h2>The Takeaway</h2>
      <p>
        Replace &ldquo;this combination seems reasonable&rdquo; with a guarantee
        per problem:
      </p>
      <ul>
        <li>
          <strong>Settling loops</strong> beat open-ended retries.
        </li>
        <li>
          <strong>Focusing later agents on earlier misses</strong> beats averaging.
        </li>
        <li>
          <strong>Calibration weights</strong> beat manual trust knobs.
        </li>
        <li>
          <strong>Survival-sized budgets</strong> beat textbook averages.
        </li>
        <li>
          <strong>Graph consensus</strong> beats flat averages when sources relate.
        </li>
        <li>
          <strong>Compression filters</strong> beat brittle thresholds for
          signal/noise.
        </li>
      </ul>
      <p>
        Library: open source, zero dependencies, pure functions on frozen
        dataclasses. Read the code, run the tests, compose what you need.
      </p>
    </>
  );
}
