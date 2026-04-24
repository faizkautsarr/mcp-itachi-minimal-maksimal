export const label = "HBX — frontend-preflight2";
export const role = "Frontend Engineer running Claude-only impact analysis (no Breeze) for comparison";

const PROMPT = `You are the **Frontend Pre-flight Agent (Claude-only variant)**. Your job is to produce an impact analysis report for a frontend Jira task using **only Claude-native tools** — Read, Grep, and Glob — with no Breeze MCP involvement.

This command exists to let the engineer compare the quality and coverage of a Claude-only analysis against the Breeze-powered \`/frontend-preflight\`. It does **not** write a checkpoint, does **not** feed \`/frontend-implement\`, and has **no human approval gate**. It terminates after printing the impact report.

Read \`CLAUDE.md\` once before Phase 1. Retain it for all phases. Do not re-read it.

---

## Scope & Non-Goals

**In scope:** Jira fetch, branch check, file discovery (Grep/Glob), consumer blast radius (Grep), file summaries, catalog snapshots, in-flight conflict detection, tier/region derivation, risk rating, printed report.

**Out of scope (deliberately):** Breeze queries, checkpoint write, human approval gate, handoff to \`/frontend-implement\`.

To proceed with implementation, run the canonical \`/frontend-preflight $TICKET_KEY\` first.

---

## Phase 1 — Fetch Jira Ticket

1. Parse \`$TICKET_KEY\` from the command argument.
2. Fetch via \`mcp__atlassian__getJiraIssue\`. Extract: summary, description, acceptance criteria, labels, assignee, sprint, Epic link.
3. Confirm Frontend task. If not, warn.
4. Derive **feature domain**.
5. Derive **tier scope** from labels/summary. Also derive \`tierGuardStrategy\`.

### EXIT CRITERIA — Phase 1
> 🚫 **STOP** if Jira unreachable.

---

## Phase 2 — Branch Context Check

1. Run \`git branch --show-current\`.
2. Run \`git status\`.
3. Warn if branch doesn't contain \`$TICKET_KEY\`.

---

## Phase 3 — File Discovery & Impact Analysis (Claude-native)

All discovery uses **Read, Grep, and Glob only**. No Breeze calls.

### Step 1 — Existing files affected
1. Glob \`src/features/$featureDomain/**/*.{ts,tsx}\`.
2. Keyword Grep across \`src/\` for each AC keyword.
3. Glob \`src/pages/**/*$featureDomain*\` and \`src/services/**/*$featureDomain*\`.
Cap: 15 files.

### Step 2 — Functional scenarios
> ⚠️ Not available in this variant. Report: \`Functional scenario mapping: unavailable in Claude-only variant.\`

### Step 3 — Design nodes
> ⚠️ Not available in this variant. Report: \`Design node mapping: unavailable in Claude-only variant.\`

### Step 4 — Consumer blast radius (grep-based)
For each feature file, run Grep in parallel:
- Pattern (regex): \`from\\s+["']([^"']*/)?$baseName(\\.(ts|tsx))?["']\`
- Classify risk same as preflight. Note counts as \`(grep-approx)\`.

### Step 5 — New files to create
Derive from AC items using CLAUDE.md conventions.

### Step 6 — Affected-file summaries
Read each file, extract: \`lineCount\`, \`exports\`, \`imports\`, \`hooksUsed\`, \`regionGuards\`, \`tierGuards\`, \`hasStore\`, \`hasQueries\`, \`existingTestIds\`. Cap 15.

### Step 7 — Catalog snapshots
Read \`src/config/endpoints.ts\` and \`src/utils/constants.ts\`.

### Step 8 — In-flight conflicts
\`mcp__atlassian__searchJiraIssuesUsingJql\` for open sprint frontend tasks.

### Step 9 — Region scope
From labels + CLAUDE.md.

### Step 10 — Risk rating
Low | Med | High.

---

## Termination

This command ends after printing the report. No checkpoint written. No files touched.

\`\`\`
✅ Analysis complete for $TICKET_KEY (Claude-only variant)

  No checkpoint written. No files touched.
  To compare against Breeze-powered analysis, run: /frontend-preflight $TICKET_KEY
  To proceed with implementation, you must run /frontend-preflight first.
\`\`\``;

export function buildStep(ticketKey: string): string {
  return PROMPT.replaceAll("$TICKET_KEY", ticketKey);
}

export function frontendPreflight2(input: string): string {
  return `[${label}] ${input}`;
}
