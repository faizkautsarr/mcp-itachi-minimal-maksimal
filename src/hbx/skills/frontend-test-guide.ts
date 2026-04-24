export const label = "HBX Skill — frontend-test-guide";

export const content = `# Frontend Testing Guide

Read \`CLAUDE.md\` once before applying this guide — it defines the project's test runner command, coverage config path, and feature folder structure.

---

## Testing Stack

| Tool | Purpose |
|------|---------|
| **Vitest** | Test runner |
| **React Testing Library** | Component assertions |
| **MSW** | API mocking |
| **happy-dom** | Browser environment |
| **@testing-library/user-event** | User interaction |

Tests run in **US mode** by default. APAC-only paths need \`vi.stubGlobal\` to override.

---

## File Structure

\`\`\`
src/test/
  setup.ts
  test-utils.tsx
  mocks/
    server.ts

src/features/<feature>/
  __tests__/
    mocks/
      fixtures.ts
      handlers.ts
    store.test.ts
    services.test.ts
    helper.test.ts
    components/
      my-component.test.tsx
    widgets/
      my-widget.test.tsx
    hooks/
      my-hook.test.ts
\`\`\`

**Rules:** All tests in \`src/features/<feature>/__tests__/\` only. Never in \`src/pages/\`. One \`__tests__/\` at feature root. Feature MSW handlers must be registered in \`src/test/mocks/server.ts\`.

---

## L1–L10 Coverage Layers

| Layer | What to Test | When |
|-------|-------------|------|
| **L1 — Store** | Every action via \`getState()\`/\`setState()\`. Initial state, merges, resets. | Has \`store.ts\` |
| **L2 — Helpers** | Pure functions, direct input/output. | Has \`helper.ts\` |
| **L3 — Services** | API functions with MSW: success + error. | Has \`services.ts\` |
| **L4 — Registry** | Config lookups, validators, fallback values. | Has registry map |
| **L5 — Component rendering** | Render with different props, conditional rendering. | Has \`components/\` |
| **L6 — Component interaction** | \`userEvent\` clicks/typing. Verify callbacks + state. | Interactive elements |
| **L7 — Widget composition** | Store/query wiring to child components. | Has \`widgets/\` |
| **L8 — Hook logic** | \`renderHook\`. Effects, return values, cleanup. | Has \`hooks/\` |
| **L9 — Edge cases** | Empty data, 500 errors, missing props. | Always |
| **L10 — data-testid** | Every \`data-testid\` asserted via \`getByTestId\`. | \`.tsx\` with interactive elements |

---

## Key Patterns

### Interaction — always \`userEvent\`, never \`fireEvent\`
\`\`\`typescript
const { user } = renderWithProviders(<MyComponent />);
await user.click(getByRole("button", { name: /submit/i }));
await user.type(getByLabelText("Email"), "test@test.com");
\`\`\`

### API Mocking — always MSW
\`\`\`typescript
import { server } from "@tnlm/test/mocks/server";
import { http, HttpResponse } from "msw";
server.use(
  http.post("*/api/v1/endpoint", () => new HttpResponse(null, { status: 500 }))
);
\`\`\`

### Store reset — never pass \`true\` as second arg
\`\`\`typescript
beforeEach(() => {
  useMyStore.setState({ data: null, isLoading: false });
  // NOT: useMyStore.setState({ ... }, true) — wipes out all actions
});
\`\`\`

### Components — use \`renderWithProviders\`
\`\`\`typescript
const { user, getByRole } = renderWithProviders(<MyComponent onSubmit={vi.fn()} />);
\`\`\`

### v8 ignore — always include a reason
\`\`\`typescript
/* v8 ignore next 5 -- pagination logic requires multi-page integration test */
\`\`\`

---

## Naming Conventions

- \`describe\` → business capability: \`"Password Recovery Request"\` ✅, not \`"useForgotPassword"\` ❌
- \`it\` → observable behavior: \`"should reject passwords shorter than 6 characters"\` ✅

---

## data-testid Standards

| Component Type | Pattern |
|---|---|
| Button | \`[page]-[section]-[action]-btn\` |
| Input | \`[page]-[section]-[field]-input\` |
| Dropdown | \`[page]-[section]-[field]-dropdown\` |
| Modal | \`[feature]-[action]-modal\` |
| Tab | \`[page]-[section]-tab-[name]\` |

Rules: Never API values, database IDs, or generic names like \`"button-1"\`.

---

## What NOT to Test
- CSS/styling, visual appearance
- Third-party library internals
- Dead code / unreachable branches
- **No snapshot tests**

---

## Coverage
- Thresholds: **80%** (statements, branches, functions, lines) on files in \`coverage.include\`.
- Add new feature paths to \`vitest.config.ts\` \`coverage.include\` when writing tests for a new feature.
- Use \`/* v8 ignore next N -- reason */\` for unreachable branches.`;
