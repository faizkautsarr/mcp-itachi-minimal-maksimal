export const label = "HBX Skill — checkpoint-protocol";

export const content = `# Checkpoint Protocol

Every frontend task has exactly one checkpoint file at \`.claude/state/$TICKET_KEY.json\`.

---

## Stage Machine

\`lastStage\` transitions in order. **No stage may be skipped.**

\`\`\`
null
  → "preflight_approved"      set by: /frontend-preflight
  → "implementation_complete" set by: /frontend-implement
  → "validation_approved"     set by: /frontend-validate
  → "tests_passed"            set by: /frontend-test
\`\`\`

Only **commands with human gates** advance \`lastStage\`.

---

## Redirect Table

| You are | Expected \`lastStage\` | If earlier | If same | If later |
|---|---|---|---|---|
| frontend-preflight command | \`null\` | EXIT | continue | SKIP |
| frontend-implement command | \`preflight_approved\` | EXIT → run preflight first | continue | SKIP† |
| frontend-test command | \`implementation_complete\` | EXIT → run implement first | continue | SKIP |
| frontend-validate command | \`tests_passed\` | EXIT → run test first | continue | SKIP |
| pr-create command | \`validation_approved\` | warn (incomplete tasks) | continue | — |
| frontend-reviewer command | any / none | create stub | append | append |

**Stage order**: \`null\` → \`preflight_approved\` → \`implementation_complete\` → \`tests_passed\` → \`validation_approved\`. \`/frontend-implement\` writes both source and tests (via parallel code-writer and test-writer subagents) and relies on typecheck + lint as the agent-divergence guard before advancing to \`implementation_complete\`. \`/frontend-test\` then runs the full-suite + coverage gate. \`/frontend-validate\` runs post-write rule validation after tests are green.

† **Reviewer re-run exception**: if \`reviewerOutput\` is present in the checkpoint with \`resolvedAt: null\` and \`lastStage\` is \`"implementation_complete"\` or later, \`frontend-implement\` may re-enter to apply fixes. It resets \`lastStage\` to \`"preflight_approved"\` at the start of Phase 3 (code generation), preserving all other checkpoint fields.

---

## Breeze Context Ownership

\`breezeContext\` and \`consumerImpact\` are **written live** only by \`/frontend-preflight\`. All other workflow commands — \`/frontend-implement\`, \`/frontend-test\`, \`/frontend-validate\` — are **read-only consumers**: they MUST use the cached values verbatim and MUST NOT call Breeze MCP tools directly.

**Exception — \`/frontend-reviewer\`:** may call Breeze MCP tools directly. Reviewer is designed to be invoked ad-hoc on arbitrary PRs (including PRs authored by teammates who did not run \`/frontend-preflight\`), so it retains both a cache-first read path and a live fallback.

**Missing vs. empty semantics** (consumers MUST distinguish):

| Checkpoint state | Meaning | Consumer behavior |
|---|---|---|
| Field absent | Preflight has not run, or ran before this field was added | **EXIT** with a directive to run \`/frontend-preflight\` |
| Field present, value \`[]\` | Preflight consulted Breeze and Breeze returned no matches | **Proceed** with an empty reuse set — do not re-query |
| Field present, non-empty array | Preflight consulted Breeze and cached the results | **Use the cached data verbatim** |

---

## Schema Reference

Fields grouped by which command writes them. Always merge — never overwrite the full file.

**frontend-preflight command** writes on first run:
\`\`\`json
{
  "ticket": "PROJ-XXXX",
  "lastStage": "preflight_approved",
  "timestamp": "<ISO>",
  "jiraSummary": "",
  "epicKey": "", "epicSummary": "", "sprintName": "",
  "acceptanceCriteria": [],
  "featureDomain": "",
  "regionScope": "apac|us|both|n/a",
  "tierScope": "all|lite|core|tall|grande|venti",
  "tierGuardStrategy": "inline __TIER_X__|separate file|none",
  "affectedFiles": [],
  "filesToCreate": [],
  "inFlightConflicts": [],
  "overallRisk": "low|med|high",
  "affectedFileSummaries": [],
  "catalogs": {
    "usEndpoints": {},
    "usEndpointsFullShapeOmittedDueToSize": false,
    "apacEndpointsNote": "",
    "queriesList": []
  },
  "consumerImpact": { "checkedAt": "<ISO>", "source": "breeze", "files": [] },
  "breezeContext": {
    "projectUuid": "",
    "functionalScenarios": [],
    "designNodes": [],
    "codeNodes": []
  },
  "implementationNotes": ""
}
\`\`\`

**frontend-implement command** appends:
\`\`\`json
{
  "lastStage": "implementation_complete",
  "implementedFiles": [],
  "testFiles": [],
  "lintResult": "pass",
  "typecheckResult": "pass",
  "revisionCycles": 0,
  "implementationTimestamp": "<ISO>",
  "postGenerationValidation": {
    "timestamp": "<ISO>",
    "rulesRun": ["DS-1","DS-2","DS-3","DS-4","DS-5","DS-6","DS-7","AB-1","AB-2","AB-3","AB-4","AB-5","L10-1"],
    "verdict": "PASS|PASS_WITH_WARNINGS|BLOCKED",
    "findings": []
  }
}
\`\`\`

**frontend-validate command** appends:
\`\`\`json
{
  "lastStage": "validation_approved",
  "validationResult": "pass|pass_with_warnings|blocked_overridden",
  "criticalCount": 0, "warningCount": 0,
  "overrideReason": null,
  "validationTimestamp": "<ISO>"
}
\`\`\`

**frontend-test command** appends:
\`\`\`json
{
  "lastStage": "tests_passed",
  "testRunResult": { "total": 0, "passed": 0, "failed": 0, "skipped": 0, "durationMs": 0 },
  "coverage": { "statements": 0, "branches": 0, "functions": 0, "lines": 0 },
  "v8IgnoresAdded": [],
  "overrideReason": null,
  "testTimestamp": "<ISO>"
}
\`\`\`

**frontend-reviewer command** appends:
\`\`\`json
{
  "reviewerOutput": {
    "reviewedAt": "<ISO>",
    "verdict": "BLOCKED|NEEDS_ATTENTION|READY_TO_MERGE",
    "acGaps": [],
    "violations": [],
    "resolvedAt": null
  }
}
\`\`\`

---

## Write Rules

1. Always merge into the existing file — never overwrite the entire JSON from scratch.
2. Write only the fields your role owns.
3. Create \`.claude/state/\` if it does not exist before first write.
4. Timestamps are ISO 8601: \`new Date().toISOString()\` format.
5. After writing, read back \`lastStage\` to confirm the write succeeded.`;
