import { createServer, IncomingMessage } from "http";
import { randomUUID } from "crypto";
import { runPipeline } from "./autonomous/orchestrator.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { CallToolRequestSchema, ListToolsRequestSchema, ListPromptsRequestSchema, GetPromptRequestSchema } from "@modelcontextprotocol/sdk/types.js";

import { createSpec, buildStep as pmSpecStep } from "./agents/pm/skills/create-spec.js";
import { writeTicket, buildStep as pmTicketStep } from "./agents/pm/skills/write-ticket.js";
import { reviewArchitecture, buildStep as architectStep } from "./agents/architect/skills/review-architecture.js";
import { createDesign, buildStep as designerStep } from "./agents/designer/skills/create-design.js";
import { implementApi, buildStep as beStep } from "./agents/be/skills/implement-api.js";
import { implement, buildStep as feImplStep } from "./agents/fe/skills/implement.js";
import { validate, buildStep as feValidateStep } from "./agents/fe/skills/validate.js";
import { writeTests, buildStep as qaStep } from "./agents/qa/skills/write-tests.js";
import { deploy, buildStep as devopsStep } from "./agents/devops/skills/deploy.js";

const PORT = process.env.PORT ?? 3000;
const BASE_URL = (process.env.BASE_URL ?? `http://localhost:${PORT}`).replace(/\/$/, "");

// In-memory store for generated .txt files
const fileStore = new Map<string, { filename: string; content: string }>();

function toHtml(content: string): string {
  const urlRegex = /(https?:\/\/[^\s|]+)/g;
  const escaped = content
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(urlRegex, '<a href="$1" target="_blank" style="color:#58a6ff">$1</a>');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Itachi Output</title>
  <style>
    body { font-family: monospace; background: #0d1117; color: #c9d1d9; padding: 2rem; line-height: 1.8; }
    pre { white-space: pre-wrap; word-break: break-word; }
  </style>
</head>
<body><pre>${escaped}</pre></body>
</html>`;
}

function saveFile(toolName: string, content: string): string {
  const id = randomUUID();
  const filename = `${toolName}_${Date.now()}.html`;
  fileStore.set(id, { filename, content: toHtml(content) });
  return `${BASE_URL}/files/${id}`;
}

function createMcpServer(): Server {
  const server = new Server(
    { name: "mcp-itachi-minimal-maksimal", version: "1.0.0" },
    { capabilities: { tools: {}, prompts: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "run_pipeline",
        description: "Run full agentic pipeline: PM → Architect → Designer → BE → FE → QA → DevOps. Returns a .txt file download URL.",
        inputSchema: {
          type: "object",
          properties: { input: { type: "string", description: "Text input to process through all agents" } },
          required: ["input"]
        }
      },
      {
        name: "pm_create_spec",
        description: "PM Agent: create spec from input. Returns a .txt file download URL.",
        inputSchema: { type: "object", properties: { input: { type: "string" } }, required: ["input"] }
      },
      {
        name: "pm_write_ticket",
        description: "PM Agent: write ticket from input. Returns a .txt file download URL.",
        inputSchema: { type: "object", properties: { input: { type: "string" } }, required: ["input"] }
      },
      {
        name: "architect_review",
        description: "Architect Agent: review architecture. Returns a .txt file download URL.",
        inputSchema: { type: "object", properties: { input: { type: "string" } }, required: ["input"] }
      },
      {
        name: "designer_create_design",
        description: "Designer Agent: create design spec. Returns a .txt file download URL.",
        inputSchema: { type: "object", properties: { input: { type: "string" } }, required: ["input"] }
      },
      {
        name: "be_implement_api",
        description: "BE Agent: implement API. Returns a .txt file download URL.",
        inputSchema: { type: "object", properties: { input: { type: "string" } }, required: ["input"] }
      },
      {
        name: "fe_implement",
        description: "FE Agent: implement UI. Returns a .txt file download URL.",
        inputSchema: { type: "object", properties: { input: { type: "string" } }, required: ["input"] }
      },
      {
        name: "fe_validate",
        description: "FE Agent: validate code. Returns a .txt file download URL.",
        inputSchema: { type: "object", properties: { input: { type: "string" } }, required: ["input"] }
      },
      {
        name: "qa_write_tests",
        description: "QA Agent: write tests. Returns a .txt file download URL.",
        inputSchema: { type: "object", properties: { input: { type: "string" } }, required: ["input"] }
      },
      {
        name: "devops_deploy",
        description: "DevOps Agent: deploy. Returns a .txt file download URL.",
        inputSchema: { type: "object", properties: { input: { type: "string" } }, required: ["input"] }
      }
    ]
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const input = (args as { input: string }).input;

    let content = "";

    switch (name) {
      case "run_pipeline":             content = input; break;
      case "pm_create_spec":          content = createSpec(input); break;
      case "pm_write_ticket":         content = writeTicket(input); break;
      case "architect_review":        content = reviewArchitecture(input); break;
      case "designer_create_design":  content = createDesign(input); break;
      case "be_implement_api":        content = implementApi(input); break;
      case "fe_implement":            content = implement(input); break;
      case "fe_validate":             content = validate(input); break;
      case "qa_write_tests":          content = writeTests(input); break;
      case "devops_deploy":           content = deploy(input); break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    const downloadUrl = saveFile(name, content);
    return { content: [{ type: "text", text: `File ready: ${downloadUrl}` }] };
  });

  const prompts = [
    { name: "itachi_run_pipeline",        description: "Run full pipeline: PM → Architect → Designer → BE → FE → QA → DevOps" },
    { name: "itachi_pm_create_spec",      description: "PM Agent: create product spec" },
    { name: "itachi_pm_write_ticket",     description: "PM Agent: write ticket" },
    { name: "itachi_architect_review",    description: "Architect Agent: review architecture" },
    { name: "itachi_designer_create_design", description: "Designer Agent: create design spec" },
    { name: "itachi_be_implement_api",    description: "BE Agent: implement API" },
    { name: "itachi_fe_implement",        description: "FE Agent: implement UI" },
    { name: "itachi_fe_validate",         description: "FE Agent: validate code" },
    { name: "itachi_qa_write_tests",      description: "QA Agent: write tests" },
    { name: "itachi_devops_deploy",       description: "DevOps Agent: deploy" },
  ];

  const promptToTool: Record<string, string> = {
    itachi_run_pipeline:           "run_pipeline",
    itachi_pm_create_spec:         "pm_create_spec",
    itachi_pm_write_ticket:        "pm_write_ticket",
    itachi_architect_review:       "architect_review",
    itachi_designer_create_design: "designer_create_design",
    itachi_be_implement_api:       "be_implement_api",
    itachi_fe_implement:           "fe_implement",
    itachi_fe_validate:            "fe_validate",
    itachi_qa_write_tests:         "qa_write_tests",
    itachi_devops_deploy:          "devops_deploy",
  };

  server.setRequestHandler(ListPromptsRequestSchema, async () => ({
    prompts: prompts.map(p => ({
      name: p.name,
      description: p.description,
      arguments: [{ name: "input", description: "Text input for the agent", required: true }],
    })),
  }));

  const agentStepBuilders: Array<(seed: string) => string> = [
    pmSpecStep, pmTicketStep, architectStep, designerStep,
    beStep, feImplStep, feValidateStep, qaStep, devopsStep,
  ];

  const agentToolNames = [
    "pm_create_spec", "pm_write_ticket", "architect_review", "designer_create_design",
    "be_implement_api", "fe_implement", "fe_validate", "qa_write_tests", "devops_deploy",
  ];

  const agentRoles: Record<string, { buildStep: (s: string) => string; role: string }> = {
    pm_create_spec:         { buildStep: pmSpecStep,      role: "PM Agent writing product specs and requirements" },
    pm_write_ticket:        { buildStep: pmTicketStep,    role: "PM Agent writing development tickets" },
    architect_review:       { buildStep: architectStep,   role: "Software Architect designing system architecture" },
    designer_create_design: { buildStep: designerStep,    role: "UI/UX Designer creating design specs" },
    be_implement_api:       { buildStep: beStep,          role: "Backend Engineer implementing REST APIs" },
    fe_implement:           { buildStep: feImplStep,      role: "Frontend Engineer building UI components" },
    fe_validate:            { buildStep: feValidateStep,  role: "Frontend Engineer validating code quality" },
    qa_write_tests:         { buildStep: qaStep,          role: "QA Engineer writing test cases" },
    devops_deploy:          { buildStep: devopsStep,      role: "DevOps Engineer handling deployment" },
  };

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const tool = promptToTool[name];
    if (!tool) throw new Error(`Unknown prompt: ${name}`);
    const input = (args as Record<string, string>)?.input ?? "";

    let text: string;

    if (tool === "run_pipeline") {
      const agentSteps = [
        { tool: "pm_create_spec",         fn: pmSpecStep },
        { tool: "pm_write_ticket",        fn: pmTicketStep },
        { tool: "architect_review",       fn: architectStep },
        { tool: "designer_create_design", fn: designerStep },
        { tool: "be_implement_api",       fn: beStep },
        { tool: "fe_implement",           fn: feImplStep },
        { tool: "fe_validate",            fn: feValidateStep },
        { tool: "qa_write_tests",         fn: qaStep },
        { tool: "devops_deploy",          fn: devopsStep },
      ];

      const stepList = agentSteps.map(({ tool: t, fn }, i) => {
        const seed = i === 0 ? `kata pertama dari input "${input}"` : `kata terakhir dari output step ${i}`;
        return `Step ${i + 1}: ${fn(seed)} → panggil tool \`${t}\` dengan 10 kata tersebut sebagai \`input\`.`;
      }).join("\n\n");

      text = `Kamu adalah orkestrator pipeline pengembangan software dengan 9 agent menggunakan teknik last-word chaining dalam Bahasa Indonesia.

Input: "${input}"

Aturan:
- Setiap agent menghasilkan TEPAT 10 kata dalam Bahasa Indonesia yang relevan dengan perannya
- KATA TERAKHIR output setiap agent menjadi KATA PERTAMA (seed) agent berikutnya
- Jalankan SATU STEP, panggil tool-nya, tunggu hasilnya, baru lanjut ke step berikutnya
- Jangan generate semua step sekaligus — proses PER AGENT

${stepList}

Step 10 (FINAL): Setelah semua 9 tool dipanggil, kumpulkan semua hasilnya lalu panggil tool \`run_pipeline\` dengan format berikut sebagai \`input\`:

=== Pipeline Selesai ===
Input: "${input}"

[PM — create-spec] <10 kata step 1> | <URL step 1>
[PM — write-ticket] <10 kata step 2> | <URL step 2>
[Architect — review] <10 kata step 3> | <URL step 3>
[Designer — create-design] <10 kata step 4> | <URL step 4>
[BE — implement-api] <10 kata step 5> | <URL step 5>
[FE — implement] <10 kata step 6> | <URL step 6>
[FE — validate] <10 kata step 7> | <URL step 7>
[QA — write-tests] <10 kata step 8> | <URL step 8>
[DevOps — deploy] <10 kata step 9> | <URL step 9>

Setelah tool run_pipeline merespons, tampilkan URL hasil akhir tersebut.`;
    } else {
      const agent = agentRoles[tool];
      const stepInstruction = agent?.buildStep(input) ?? `Generate 10 words starting with "${input}"`;
      text = `${stepInstruction}

Kembalikan hanya 10 kata dalam satu baris. Kemudian panggil tool \`${tool}\` dengan 10 kata tersebut sebagai parameter \`input\`. Setelah tool merespons, tampilkan URL-nya.`;
    }

    return {
      description: prompts.find(p => p.name === name)?.description,
      messages: [{ role: "user", content: { type: "text", text } }],
    };
  });

  return server;
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

const transports = new Map<string, SSEServerTransport>();

const httpServer = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost`);

  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET" && url.pathname === "/sse") {
    const transport = new SSEServerTransport("/message", res);
    transports.set(transport.sessionId, transport);
    res.on("close", () => transports.delete(transport.sessionId));
    const server = createMcpServer();
    await server.connect(transport);

  } else if (req.method === "POST" && url.pathname === "/message") {
    const sessionId = url.searchParams.get("sessionId");
    const transport = sessionId ? transports.get(sessionId) : undefined;
    if (!transport) {
      res.writeHead(400);
      res.end("Session not found");
      return;
    }
    await transport.handlePostMessage(req, res);

  } else if (req.method === "GET" && url.pathname.startsWith("/files/")) {
    const id = url.pathname.slice("/files/".length);
    const file = fileStore.get(id);
    if (!file) {
      res.writeHead(404);
      res.end("File not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
    });
    res.end(file.content);

  } else if (req.method === "POST" && url.pathname === "/itachi/api/run-pipeline") {
    const body = await readBody(req);
    let input: string;
    try {
      input = (JSON.parse(body) as { input: string }).input;
      if (!input) throw new Error();
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Body harus berupa { input: string }" }));
      return;
    }

    try {
      const results = await runPipeline(input);
      const summary = results.map(r => {
        const url = saveFile(r.label.replace(/\s/g, "_"), `[${r.label}] ${r.output}`);
        return { agent: r.label, output: r.output, url };
      });

      const finalContent = [
        `=== Pipeline Selesai ===`,
        `Input: "${input}"`,
        ``,
        ...summary.map(s => `[${s.agent}] ${s.output} | ${s.url}`),
      ].join("\n");

      const finalUrl = saveFile("run_pipeline", finalContent);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ url: finalUrl, agents: summary }));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: String(err) }));
    }

  } else if (req.method === "GET" && url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", sessions: transports.size, files: fileStore.size }));

  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

httpServer.listen(PORT, () => {
  console.log(`MCP server running on port ${PORT}`);
  console.log(`SSE endpoint: ${BASE_URL}/sse`);
});
