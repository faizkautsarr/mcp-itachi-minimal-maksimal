# mcp-itachi

Pipeline agentic 9-agent dengan teknik last-word chaining. Setiap agent menghasilkan 10 kata dalam Bahasa Indonesia, kata terakhir menjadi seed untuk agent berikutnya.

**Pipeline:** PM (spec) → PM (ticket) → Architect → Designer → BE → FE (implement) → FE (validate) → QA → DevOps

---

## Mode

### MCP (via Claude)
Claude sebagai orchestrator — generate kata per agent, call tool, chain secara berurutan.

```bash
claude mcp add mcp-itachi --transport sse https://mcp-itachi-minimal-maksimal-production.up.railway.app/sse
```

Slash commands yang tersedia setelah install:
- `/itachi_run_pipeline` — jalankan full pipeline
- `/itachi_pm_create_spec`, `/itachi_pm_write_ticket`
- `/itachi_architect_review`, `/itachi_designer_create_design`
- `/itachi_be_implement_api`, `/itachi_fe_implement`, `/itachi_fe_validate`
- `/itachi_qa_write_tests`, `/itachi_devops_deploy`

### Autonomous (via API)
Server generate sendiri menggunakan Groq (Llama 3.1), tanpa butuh Claude.

```bash
POST /itachi/api/run-pipeline
Content-Type: application/json

{ "input": "faiz" }
```

Response:
```json
{
  "url": "https://...railway.app/files/xxx",
  "agents": [
    { "agent": "PM — create-spec", "output": "...", "url": "..." },
    ...
  ]
}
```

### Webhook Jira + Notifikasi Telegram
Trigger otomatis saat description Jira berubah — pipeline jalan, hasil dikirim ke Telegram.

```
POST /webhooks/jira
```

---

## Struktur

```
src/
├── index.ts                              ← routing only
├── files.ts                              ← shared: saveFile, fileStore
├── agents/                               ← core logic (shared)
│   └── {role}/skills/*.ts               ← buildStep() per agent
└── consumers/
    ├── mcp/server.ts                     ← MCP tools & prompts
    └── autonomous/
        ├── llm.ts                        ← Groq client
        ├── orchestrator.ts              ← chain 9 agent
        ├── handlers/api/pipeline.ts     ← POST /itachi/api/run-pipeline
        ├── handlers/webhook/jira.ts     ← POST /webhooks/jira
        └── notifiers/telegram.ts        ← kirim URL ke Telegram
```

---

## Environment Variables

| Variable | Keterangan |
|---|---|
| `PORT` | Port server (default: 3000) |
| `BASE_URL` | URL publik server (Railway auto-set) |
| `GROQ_API_KEY` | API key Groq untuk autonomous mode |
| `TELEGRAM_BOT_TOKEN` | Token bot Telegram |
| `TELEGRAM_CHAT_ID` | Chat ID tujuan notifikasi |

---

## Endpoints

| Method | Path | Keterangan |
|---|---|---|
| GET | `/sse` | MCP SSE connection |
| POST | `/message` | MCP message handler |
| GET | `/files/:id` | Serve hasil pipeline (HTML) |
| POST | `/itachi/api/run-pipeline` | Autonomous pipeline |
| POST | `/webhooks/jira` | Jira webhook trigger |
| GET | `/health` | Health check |
