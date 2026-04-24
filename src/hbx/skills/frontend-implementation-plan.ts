export const label = "HBX Skill — frontend-implementation-plan";

export const content = `# Frontend Implementation Plan

The implementation plan is a **code-ready blueprint**. Its audience is two downstream agents (code-writer, test-writer) that transcribe it into files in parallel.

**Rule of thumb**: if a detail is missing from the plan, the downstream agent must STOP and request revision — not guess.

---

## Document Location

\`.claude/plans/$TICKET_KEY-plan.md\` — one file per ticket. Never regenerate from scratch if the file already exists.

---

## Checkpoint Inputs

| Plan section | Source field(s) in checkpoint |
|---|---|
| Summary, AC list | \`jiraSummary\`, \`acceptanceCriteria\` |
| AC Coverage Matrix | \`acceptanceCriteria\` + \`affectedFiles\` + \`affectedFileSummaries[].exports\` |
| Files to Modify / Create | \`affectedFiles\`, \`filesToCreate\` |
| Per-File Imports | \`affectedFileSummaries[i].imports\` + \`catalogs\` |
| Per-File Types | \`breezeContext.codeNodes[].signatureHint\` |
| Per-File data-testid | \`affectedFileSummaries[i].existingTestIds\` |
| Region/Tier guards | \`regionScope\`, \`tierScope\`, \`tierGuardStrategy\` |
| Endpoints | \`catalogs.usEndpoints\` |
| Query keys | \`catalogs.queriesList\` |

---

## Metadata Tag Taxonomy

| Tag | Meaning |
|---|---|
| \`[ref: AC#]\` | Points to an acceptance criterion |
| \`[ref: $path:$line]\` | Points to a specific line |
| \`[ref: breeze:$nodeId]\` | Points to a Breeze node |
| \`[parallel: true]\` | May run concurrently |
| \`[region: us|apac|both]\` | Region scope |
| \`[layer: $layer]\` | CLAUDE.md layer |
| \`[agent: code|test]\` | Which agent owns this task |
| \`[deviation: $reason]\` | Deliberate departure from CLAUDE.md |

---

## Plan Document Structure (Required Sections in Order)

1. **Summary** — what, why, user-facing outcome
2. **Acceptance Criteria** — verbatim from checkpoint
3. **AC Coverage Matrix** — every AC → owner file + function
4. **Files to Modify** — table
5. **Files to Create** — table
6. **Imports Manifest** — new deps + new i18n keys + coverage.include additions + server.ts handler registrations
7. **Shared Test Infrastructure** — MSW handlers, fixtures, server.ts deltas, vitest.config.ts deltas
8. **Per-File Blueprint** — one block per file (types → services → store → queries → hooks → helpers → components → widgets → pages)
9. **Out-of-Scope / Do Not Touch**
10. **Deviation Protocol Invocations**
11. **Decision Log** — append-only

---

## Per-File Blueprint — Required Subsections

Each file must have:
- **Imports** (exact statements, copy-paste ready)
- **Types** (full declarations, no \`any\`, no TODO)
- **Edits** (MODIFY: anchor + replace with exact anchor lines) or **Skeleton** (CREATE: full file)
- **data-testid table** (all interactive elements per L10-1)
- **i18n strings** (\`t()\` call → English literal; flat-key convention — key IS the English copy)
- **Region guards** (list of \`__APP_US__\` / \`__APP_APAC__\` / tier flags)
- **Test contract** (fixtures, MSW handlers, Vitest path, AC refs, L1-L10 layers, it-blocks)

---

## Hotfix Escape Hatch

If ALL: risk=low, 1 file modified, ≤10 lines, no new i18n/guards/deps → use terse format.

---

## Deviation Protocol

If a blueprint cannot satisfy rules without compromise:
1. Add \`[deviation: $reason]\` tag at the point of deviation.
2. Add a row to the Deviation Protocol Invocations section.
3. Surface prominently at Human Gate 1.
4. After APPROVE, it becomes ratified; validate/reviewer commands honor it.

---

## Validation Checklist (before Human Gate 1)

### Structural
- [ ] Plan file exists at \`.claude/plans/$TICKET_KEY-plan.md\`
- [ ] All required sections present
- [ ] Every AC has a row in AC Coverage Matrix with exactly one owner

### Per-File
- [ ] Imports block present — ordered, complete, no \`$placeholder\` tokens
- [ ] Types declared in full
- [ ] MODIFY: every edit has Anchor + Replace snippets
- [ ] CREATE: skeleton is complete — no \`// ...\` omissions
- [ ] data-testid table covers every interactive element per L10-1
- [ ] i18n strings table present (or explicit \`None\`)
- [ ] Region guards present (or explicit \`None\`)
- [ ] Test contract with ≥1 it-block per AC

### Test infrastructure
- [ ] Shared Test Infrastructure lists every fixture factory
- [ ] Every MSW handler referenced by test contracts is declared
- [ ] server.ts registration declared for new handlers
- [ ] vitest.config.ts coverage.include declared for new feature folders

### Scope integrity
- [ ] No file in both Modify and Create
- [ ] src/pages/ files: MODIFY only, no Test contract (mark N/A)`;
