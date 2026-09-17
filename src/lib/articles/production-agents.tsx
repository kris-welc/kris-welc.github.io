export function ProductionAgentsContent() {
  return (
    <>
      <h2>The Problem</h2>
      <p>
        Most agent demos are chatbots with tools. They work in a terminal, look
        good in a demo, and break the moment you need them to run unsupervised at
        3am on a Tuesday. Production agents are different. They run on schedules
        or triggers. They handle failures without you. They cost cents per run,
        not dollars. The gap between &ldquo;demo agent&rdquo; and
        &ldquo;production agent&rdquo; is mostly about{" "}
        <strong>how you deploy them</strong>, not how smart the model is.
      </p>
      <p>
        This article covers four real agent architectures: two simple ones that
        need no orchestrator, and two that use a lightweight coordinator. Each
        one solves a problem people deal with every day.
      </p>

      <hr />

      <h2>When You Don&rsquo;t Need an Orchestrator</h2>
      <p>
        An orchestrator is code that decides which agent runs next, passes
        context between them, and handles retries. Most agents don&rsquo;t need
        one. If your agent does one job on a trigger, a cron job and a Python
        script are enough. Adding an orchestrator to a single-purpose agent is
        overkill.
      </p>

      <h3>Example 1: Research Brief Agent</h3>
      <p>
        <strong>The need:</strong> You need to write a report, a brief, or a
        document about a specific topic - a new technology, a competitor, a
        vendor, a regulation. Every time, you spend hours reading sources, taking
        notes, and organizing them into a structure. The reading is manual. The
        structure is always the same. The writing is repetitive.
      </p>
      <p>
        <strong>The agent:</strong> A single Python script triggered by a
        webhook or a form submission. It takes a topic and a set of requirements,
        searches the web for recent sources, pulls relevant docs from a local
        folder, and generates a structured first draft matching your preferred
        format.
      </p>
      <pre><code>{`# The entire "agent" is ~80 lines
def handle_brief_trigger(request):
    # 1. Pull context
    topic = request["topic"]
    requirements = request["requirements"]

    # 2. Research (tool calls, not reasoning)
    web_results = search(f"{topic} recent developments")
    background = search(f"{topic} overview key players")

    # 3. Load past briefs as style reference
    past = load_recent_briefs(limit=3)

    # 4. Generate draft
    draft = llm.generate(
        system="You write structured research briefs. Match the format of examples.",
        context=f"Topic: {topic}\\nRequirements: {requirements}\\n"
                f"Research: {web_results}\\nPast briefs: {past}",
        output_format="markdown"
    )

    # 5. Deliver
    save_to_drive(draft, name=f"DRAFT - {topic}")
    slack.notify(channel="#research", msg=f"Brief ready: {topic}")`}</code></pre>
      <p>
        <strong>How to deploy:</strong> A single Cloud Function (GCP) or Lambda
        (AWS) triggered by a webhook. No server to maintain. Runs in under 60
        seconds. Costs less than $0.05 per brief. The human reviews and edits the
        draft. The agent handles the 80% that was mechanical.
      </p>
      <p>
        <strong>Why no orchestrator:</strong> There&rsquo;s one job, one trigger,
        one output. The &ldquo;workflow&rdquo; is just sequential function calls.
        An orchestrator would add complexity without adding capability.
      </p>

      <h3>Example 2: Daily Operations Briefing Agent</h3>
      <p>
        <strong>The need:</strong> A team lead spends 30-45 minutes every morning
        checking five different tools: project tracker for blockers, error
        monitoring for overnight incidents, analytics for traffic anomalies,
        support queue for escalations, and deployment logs for failed releases.
        The information exists. It&rsquo;s just scattered across five dashboards.
      </p>
      <p>
        <strong>The agent:</strong> A cron job that runs at 7:00 AM. It pulls
        data from each source via API, feeds everything to the LLM with a prompt
        that says &ldquo;write a 2-minute briefing highlighting only what needs
        attention today,&rdquo; and delivers the result to Slack or email.
      </p>
      <pre><code>{`# Runs on cron: 0 7 * * 1-5
def morning_briefing():
    # Pull from each source (parallel for speed)
    data = {
        "blockers": jira.get_blocked_tickets(),
        "incidents": sentry.get_overnight_errors(severity="high"),
        "traffic": analytics.get_anomalies(period="24h"),
        "support": zendesk.get_escalated_tickets(),
        "deploys": github.get_failed_deployments(since="yesterday"),
    }

    # One LLM call - summarize what matters
    briefing = llm.generate(
        system="You write concise ops briefings. Lead with what needs "
               "action. Skip anything normal. Use bullet points.",
        context=json.dumps(data, default=str),
    )

    # Deliver
    slack.post(channel="#team-leads", text=briefing)
    if "URGENT" in briefing:
        slack.post(channel="#incidents", text=briefing)`}</code></pre>
      <p>
        <strong>How to deploy:</strong> A cron job on any server, a scheduled
        Cloud Function, or even GitHub Actions on a schedule. The agent runs for
        15-30 seconds, costs under $0.02 per run, and replaces 30 minutes of
        manual dashboard-checking every morning.
      </p>
      <p>
        <strong>Why no orchestrator:</strong> Same reason: one job, one schedule,
        one output. The sources are independent. If one API fails, the agent still
        produces a briefing with the data it got. Add a try/except around each
        source and you have built-in graceful degradation.
      </p>

      <hr />

      <h2>When You Need an Orchestrator</h2>
      <p>
        An orchestrator earns its complexity when agents need to{" "}
        <strong>pass work to each other</strong>, when the next step depends on
        what the previous step found, or when you need to run agents in parallel
        and merge their results. The orchestrator is not a framework. It&rsquo;s
        a loop with a router.
      </p>

      <h3>Example 3: Inbound Request Triage Pipeline</h3>
      <p>
        <strong>The need:</strong> You get 50-200 inbound requests per day -
        support tickets, feature requests, partnership inquiries, applications.
        Someone has to read each one, look up context, decide the priority, and
        route it to the right person. Most are low priority. The important ones
        sit in the same queue as everything else.
      </p>
      <p>
        <strong>The agents:</strong> Three specialized agents coordinated by a
        simple router:
      </p>
      <ol>
        <li>
          <strong>Research Agent</strong> - Takes a request and enriches it: who
          sent it, what&rsquo;s their history, what are they asking for, any
          related past requests. Uses search and internal APIs.
        </li>
        <li>
          <strong>Scoring Agent</strong> - Takes the enriched request and scores
          it against your priority criteria. Outputs a score (1-100) and a
          one-paragraph reasoning.
        </li>
        <li>
          <strong>Router Agent</strong> - Based on the score, routes the request:
          high scores go to a human immediately with the research attached.
          Medium scores get a personalized acknowledgment. Low scores get a
          template response.
        </li>
      </ol>
      <pre><code>{`# The orchestrator is a simple loop
def process_request(request):
    # Step 1: Research
    enriched = research_agent.run(request)

    # Step 2: Score against priority criteria
    score = scoring_agent.run(
        enriched=enriched,
        criteria=load_priority_criteria(),
        past_examples=load_recent_decisions(limit=10),
    )

    # Step 3: Route based on score
    if score.value >= 80:
        queue.escalate(request, enriched, score)
        slack.notify(f"Priority request: {request['subject']} (score: {score.value})")
        email.send_personal_response(request, enriched)
    elif score.value >= 40:
        email.send_acknowledgment(request, enriched)
    else:
        email.send_template_response(request)

    # Log everything for feedback loop
    db.log_decision(request, enriched, score)

# Triggered by webhook from form/email
# or batch-processed every hour from queue`}</code></pre>
      <p>
        <strong>How to deploy:</strong> A webhook-triggered Cloud Function for
        real-time processing, or a scheduled job that processes the queue every
        hour. Each agent is a function, not a service. The orchestrator is 30
        lines of routing logic. Total cost: $0.03-0.08 per request (depending on
        how much research the first agent does).
      </p>
      <p>
        <strong>Why an orchestrator:</strong> The scoring agent needs the output
        of the research agent. The routing decision needs the score. The steps
        are sequential and dependent. Without the orchestrator, you&rsquo;d
        either run everything in one massive prompt (worse results, no
        modularity) or manually chain them (brittle, no retry logic).
      </p>

      <h3>Example 4: Codebase Migration Agent</h3>
      <p>
        <strong>The need:</strong> A team needs to migrate a codebase - upgrading
        a framework version, replacing a deprecated library, or converting
        JavaScript to TypeScript. The changes are mechanical but numerous:
        hundreds of files, each needing the same type of transformation. A
        developer could do 20-30 files per day. The backlog has 400 files.
      </p>
      <p>
        <strong>The agents:</strong> Four agents in a loop:
      </p>
      <ol>
        <li>
          <strong>Scanner Agent</strong> - Analyzes the codebase and produces a
          manifest: which files need changes, what type of change each needs, and
          estimated complexity.
        </li>
        <li>
          <strong>Migrator Agent</strong> - Takes one file and the migration
          rules, produces the transformed version. Runs in parallel across files
          (10-20 concurrent).
        </li>
        <li>
          <strong>Validator Agent</strong> - Runs the test suite, type checker,
          and linter on each changed file. Catches regressions.
        </li>
        <li>
          <strong>Reporter Agent</strong> - Summarizes progress, flags files that
          failed validation, and produces a PR description for the batch.
        </li>
      </ol>
      <pre><code>{`# Orchestrator: scan → migrate (parallel) → validate → report
def run_migration(repo_path, migration_rules):
    # Step 1: Scan
    manifest = scanner_agent.run(repo_path, migration_rules)
    print(f"Found {len(manifest.files)} files to migrate")

    # Step 2: Migrate in parallel batches
    results = []
    for batch in chunk(manifest.files, size=10):
        batch_results = parallel_map(
            migrator_agent.run,
            [(f, migration_rules) for f in batch],
        )
        results.extend(batch_results)

    # Step 3: Validate each change
    validated = []
    for result in results:
        check = validator_agent.run(result)
        if check.passed:
            validated.append(result)
        else:
            # Retry once with error context
            retry = migrator_agent.run(
                result.file, migration_rules,
                previous_error=check.error,
            )
            recheck = validator_agent.run(retry)
            validated.append(retry if recheck.passed else result)

    # Step 4: Report
    report = reporter_agent.run(manifest, validated)
    git.create_branch("migration/batch-1")
    git.commit_changes(validated)
    github.create_pr(title=report.title, body=report.summary)`}</code></pre>
      <p>
        <strong>How to deploy:</strong> Run locally or on a CI runner. This
        isn&rsquo;t a long-running service. It&rsquo;s a batch job. You run it,
        review the PR it creates, merge or request changes. For large migrations,
        run it in batches of 50-100 files per PR so reviews stay manageable.
      </p>
      <p>
        <strong>Why an orchestrator:</strong> Parallel execution, retry logic
        with error context, and a validation loop that feeds errors back to the
        migrator. The orchestrator manages fan-out (parallel migration), fan-in
        (collecting results), and the retry loop (migrate &rarr; validate &rarr;
        retry if failed). Without it, you&rsquo;d need to manage all of that
        manually.
      </p>

      <hr />

      <h2>The Deployment Pattern</h2>
      <p>
        All four agents share the same deployment approach. The difference is
        only in the trigger:
      </p>
      <ul>
        <li>
          <strong>Webhook trigger</strong> - CRM event, form submission, GitHub
          push. Use a Cloud Function or Lambda.
        </li>
        <li>
          <strong>Schedule trigger</strong> - Daily briefing, hourly queue
          processing. Use cron, Cloud Scheduler, or GitHub Actions.
        </li>
        <li>
          <strong>Manual trigger</strong> - Migration batch, one-off analysis.
          Run from CLI or a CI pipeline.
        </li>
      </ul>
      <p>
        The stack is always the same: <strong>Python script + LLM API call +
        source/destination APIs</strong>. No agent framework needed. No LangChain,
        no CrewAI, no AutoGen. Those add abstraction layers that make demos easier
        and production harder. A function that calls an API is simpler to debug,
        deploy, and maintain than a framework that calls a function that calls an
        API.
      </p>

      <h3>Cost Reality</h3>
      <p>
        People overestimate agent costs because they think in chat terms (long
        conversations, large contexts). Production agents are different:
      </p>
      <ul>
        <li>
          <strong>Research brief</strong>: ~2,000 input tokens + ~1,500 output =
          $0.02-0.05
        </li>
        <li>
          <strong>Daily briefing</strong>: ~3,000 input + ~500 output =
          $0.01-0.02
        </li>
        <li>
          <strong>Request triage</strong>: 3 calls &times; ~1,500 tokens each =
          $0.03-0.08
        </li>
        <li>
          <strong>File migration</strong>: ~1,000 tokens per file &times; 400
          files = $3-8 total
        </li>
      </ul>
      <p>
        Compare that to the hours they replace. The research agent saves 6-10
        hours/week. The briefing saves 2.5 hours/week. Triage saves 15+
        hours/week. The migration saves 2-3 weeks of developer time. The point is
        not &ldquo;AI is cheap.&rdquo; The work these agents do is mechanical, and
        mechanical work shouldn&rsquo;t need a human staring at a screen.
      </p>

      <hr />

      <h2>What Makes These Production-Ready</h2>
      <p>
        Five things separate a demo agent from one you can trust to run
        unsupervised:
      </p>
      <ol>
        <li>
          <strong>Deterministic triggers</strong> - Webhooks, cron schedules,
          queue events. Not &ldquo;the agent decides when to run.&rdquo; You
          control when it activates.
        </li>
        <li>
          <strong>Bounded scope</strong> - Each agent does one thing. The
          proposal agent writes proposals. The briefing agent writes briefings.
          It doesn&rsquo;t &ldquo;decide&rdquo; what to do next. You decide.
        </li>
        <li>
          <strong>Graceful failure</strong> - If one data source is down, the
          agent proceeds with what it has. If the LLM returns garbage, the agent
          catches it and retries once. If everything fails, it sends an alert
          instead of silently breaking.
        </li>
        <li>
          <strong>Human in the loop where it matters</strong> - The research
          agent creates a draft, not a final document. The migration agent
          creates a PR, not a merged commit. The triage agent routes high scores
          to a person. The agent handles the bulk work. The human handles the
          judgment.
        </li>
        <li>
          <strong>Logging everything</strong> - Every input, every LLM call,
          every output, every decision. When something goes wrong (and it will),
          you can trace exactly what happened. This is the difference between
          &ldquo;the agent broke&rdquo; and &ldquo;the agent got bad data from
          the CRM API at 3:47 AM because the auth token expired.&rdquo;
        </li>
      </ol>

      <hr />

      <h2>Key Takeaways</h2>
      <ol>
        <li>
          <strong>Most agents don&rsquo;t need an orchestrator</strong>. If your
          agent does one job on a trigger, a cron job and a Python script are all
          you need. Don&rsquo;t add coordination complexity for a single-purpose
          agent.
        </li>
        <li>
          <strong>Use an orchestrator when steps depend on each other</strong>.
          If agent B needs the output of agent A, or if you need parallel
          execution with a merge step, a simple router loop earns its complexity.
        </li>
        <li>
          <strong>The orchestrator is a loop, not a framework</strong>.
          It&rsquo;s 30-50 lines of routing logic. If you need a library to write
          it, you&rsquo;re overcomplicating it.
        </li>
        <li>
          <strong>Deploy as functions, not services</strong>. Cloud Functions,
          Lambda, or cron jobs. No servers to maintain. Pay per invocation. Scale
          to zero when idle.
        </li>
        <li>
          <strong>The value is in hours reclaimed, not intelligence</strong>.
          These agents aren&rsquo;t doing anything a human can&rsquo;t do.
          They&rsquo;re doing what a human shouldn&rsquo;t have to do: the
          mechanical, repetitive, time-consuming parts that don&rsquo;t require
          judgment.
        </li>
      </ol>
    </>
  );
}
