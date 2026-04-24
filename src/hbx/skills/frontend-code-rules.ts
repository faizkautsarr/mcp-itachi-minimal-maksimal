export const label = "HBX Skill — frontend-code-rules";

export const content = `# Frontend Code Rules — Violation Checklist

This skill is the single source of truth for what constitutes a code violation in this project.

**Scope:** Every rule below applies **only to files in \`implementedFiles\`** — never to the repo at large.

**Project toolkit:**
- HTTP: \`fetchGet\` / \`fetchPost\` from \`@tnlm/utils/fetch\`
- Import alias: \`@tnlm/*\` for cross-feature imports
- Utilities: \`@tnlm/utils/core-utils\` (never \`lodash\` directly)
- i18n: \`useTranslation\` from \`react-i18next\`; strings wrapped as \`t("key")\`
- State: Zustand stores named \`use___Store\`, include \`clearAll\` action
- Query keys: \`queriesList\` from \`@tnlm/utils/constants\`
- Region flags: \`__APP_US__\` / \`__APP_APAC__\`

---

## 🎨 Design System Rules

### DS-1 — No hardcoded colors \`[CRITICAL]\`
**Pattern**: \`#[0-9a-fA-F]{3,6}\` | \`rgb(\` | \`rgba(\` | \`hsl(\`
**Fix**: Replace with MUI theme tokens via \`sx\` prop or \`theme.palette.*\`.

### DS-2 — No hardcoded user-facing strings \`[CRITICAL]\`
**Pattern**: JSX text / \`label=\`, \`placeholder=\`, \`title=\`, \`aria-label=\` with string literal NOT wrapped in \`t("...")\`
**Fix**: \`import { useTranslation } from "react-i18next"\`, replace with \`t("$key")\`.

### DS-3 — Styles extracted to const \`[WARNING]\`
**Pattern**: \`style=\\{\\{\` without \`const styles\` in the same file
**Fix**: Extract to \`const styles = { ... }\` and use \`sx={styles.x}\`.

### DS-4 — No direct lodash import \`[CRITICAL]\`
**Pattern**: \`from 'lodash'\` | \`from "lodash"\` | \`from 'lodash/\` | \`from "lodash/\`
**Fix**: Use \`@tnlm/utils/core-utils\` instead.

### DS-5 — No raw fetch or axios \`[CRITICAL]\`
**Pattern**: \`\\bfetch(\` | \`axios\\.\`
**Fix**: Use \`fetchGet\` / \`fetchPost\` from \`@tnlm/utils/fetch\`.

### DS-6 — No \`any\` type \`[CRITICAL]\`
**Pattern**: \`: any\` | \`as any\` | \`<any>\` | \`Array<any>\` | \`Promise<any>\`
**Fix**: Use \`unknown\` and narrow, or define explicit type in \`types.ts\`.

### DS-7 — UI component files should stay under ~200 lines \`[WARNING]\`
**Fix**: Extract to custom hooks, helpers, or child components.

---

## 🏗 Architecture Boundary Rules

### AB-1 — No relative cross-feature imports \`[CRITICAL]\`
**Pattern**: \`from '\\.\\./../\` crossing out of current feature folder
**Fix**: Use \`@tnlm/*\` alias.

### AB-2 — Components must not import store or queries \`[CRITICAL]\`
**Pattern**: \`import.*store\` | \`import.*queries\` | \`import.*useQuery\` inside \`/components/\`
**Fix**: Move wiring to parent widget.

### AB-3 — No new \`.jsx\` or \`.js\` files \`[CRITICAL]\`
**Fix**: Use \`.tsx\` or \`.ts\`.

### AB-4 — Region guards present where required \`[WARNING]\`
**Condition**: Region-specific scope + region-divergent UI → \`__APP_US__\` / \`__APP_APAC__\` required.

### AB-5 — Feature structure correct \`[WARNING]\`
Correct layers: \`types.ts\`, \`services.ts\`, \`queries.ts\`, \`store.ts\`, \`helper.ts\`, \`widgets/\`, \`components/\`, \`hooks/\`.

---

## 💻 Code Pattern Rules

### CP-1 — Store pattern correct \`[WARNING]\`
- Export name: \`use___Store\`
- Includes \`clearAll\` action resetting to \`initialState\`
- Multi-value selects via \`useShallow\`

### CP-2 — Query key pattern \`[WARNING]\`
- Keys from \`queriesList\` in \`@tnlm/utils/constants\` — not inline strings.

### CP-3 — Export convention \`[WARNING]\`
- \`export default\` for page/widget components; named exports for hooks, types, utilities, services, stores.

### CP-4 — Service return types match region pattern \`[WARNING]\`
- APAC: \`Promise<ResponseApiType<T>>\` · US: \`Promise<ResponseFormat<T>>\`

---

## 💻 Interactive Element Rules (L10 — data-testid)

### L10-1 — All interactive elements must have \`data-testid\` \`[CRITICAL]\`

Run with \`multiline: true\`. Elements requiring data-testid:

| Element | Pattern |
|---|---|
| \`<button\` | \`<button\\b(?:(?!data-testid\\|</button>)[\\s\\S])*?>\` |
| \`<input\` | \`<input\\b(?:(?!data-testid\\|/>)[\\s\\S])*?/?>\` |
| \`<a \` | \`<a\\s(?:(?!data-testid\\|</a>)[\\s\\S])*?>\` |
| \`<select\` | \`<select\\b(?:(?!data-testid\\|</select>)[\\s\\S])*?>\` |
| \`<Modal\` | \`<Modal\\b(?:(?!data-testid\\|/>\\|</Modal>)[\\s\\S])*?>\` |
| \`<Dialog\` | \`<Dialog\\b(?:(?!data-testid\\|/>\\|</Dialog>)[\\s\\S])*?>\` |
| \`<Tooltip\` | \`<Tooltip\\b(?:(?!data-testid\\|/>\\|</Tooltip>)[\\s\\S])*?>\` |
| \`<Accordion\` | \`<Accordion\\b(?:(?!data-testid\\|/>\\|</Accordion>)[\\s\\S])*?>\` |
| \`<Tab\` | \`<Tab\\b(?:(?!data-testid\\|/>\\|</Tab>)[\\s\\S])*?>\` |
| \`<Snackbar\` | \`<Snackbar\\b(?:(?!data-testid\\|/>\\|</Snackbar>)[\\s\\S])*?>\` |
| \`<iframe\` | \`<iframe\\b(?:(?!data-testid\\|/>\\|</iframe>)[\\s\\S])*?>\` |

**Naming convention**: kebab-case, descriptive (e.g. \`"login-submit-btn"\`, \`"search-filter-input"\`). Never API IDs, database values, or generic names.

---

Verdict: \`BLOCKED\` = any critical present · \`PASS_WITH_WARNINGS\` = warnings only · \`PASS\` = zero findings.`;
