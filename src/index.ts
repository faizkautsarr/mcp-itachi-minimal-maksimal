import { createServer } from "http";
import { randomUUID } from "crypto";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { CallToolRequestSchema, ListToolsRequestSchema, ListPromptsRequestSchema, GetPromptRequestSchema } from "@modelcontextprotocol/sdk/types.js";

import { createSpec } from "./agents/pm/skills/create-spec.js";
import { writeTicket } from "./agents/pm/skills/write-ticket.js";
import { reviewArchitecture } from "./agents/architect/skills/review-architecture.js";
import { createDesign } from "./agents/designer/skills/create-design.js";
import { implementApi } from "./agents/be/skills/implement-api.js";
import { implement } from "./agents/fe/skills/implement.js";
import { validate } from "./agents/fe/skills/validate.js";
import { writeTests } from "./agents/qa/skills/write-tests.js";
import { deploy } from "./agents/devops/skills/deploy.js";

const PORT = process.env.PORT ?? 3000;
const BASE_URL = (process.env.BASE_URL ?? `http://localhost:${PORT}`).replace(/\/$/, "");

// In-memory store for generated .txt files
const fileStore = new Map<string, { filename: string; content: string }>();

function toHtml(content: string): string {
  const escaped = content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Itachi Output</title>
  <style>
    body { font-family: monospace; background: #0d1117; color: #c9d1d9; padding: 2rem; line-height: 1.6; }
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

  const agentPrompts: Record<string, (input: string) => string> = {
    pm_create_spec: (input) => `You are a Product Manager. Based on this feature request: "${input}"

Write a concise product specification covering:
- Problem statement
- Goals & success metrics
- User stories (at least 3)
- Scope (in/out)
- Acceptance criteria

Be specific and actionable.

Then call the \`pm_create_spec\` tool with your full spec as the \`input\` parameter. After the tool responds, show the user the exact download URL.`,

    pm_write_ticket: (input) => `You are a Product Manager. Based on this context: "${input}"

Write detailed development tickets in this format for each user story:
**[TICKET-XXX] Title**
- Description
- Acceptance Criteria
- Story Points
- Priority

Create at least 3 tickets.

Then call the \`pm_write_ticket\` tool with your tickets as the \`input\` parameter. After the tool responds, show the user the exact download URL.`,

    architect_review: (input) => `You are a Software Architect. Based on this spec/context: "${input}"

Design the system architecture covering:
- High-level architecture diagram (text-based)
- Tech stack recommendations with justification
- Data models / ERD
- API design overview
- Scalability & performance considerations
- Security considerations

Then call the \`architect_review\` tool with your architecture document as the \`input\` parameter. After the tool responds, show the user the exact download URL.`,

    designer_create_design: (input) => `You are a UI/UX Designer. Based on this spec/architecture: "${input}"

Create a design specification covering:
- User flow diagram (text-based)
- Key screens/pages with layout description
- Component inventory
- Design tokens (colors, typography, spacing)
- Interaction patterns
- Accessibility considerations

Then call the \`designer_create_design\` tool with your design spec as the \`input\` parameter. After the tool responds, show the user the exact download URL.`,

    be_implement_api: (input) => `You are a Backend Engineer. Based on this spec/architecture: "${input}"

Write the API implementation plan covering:
- REST API endpoints (method, path, request/response schema)
- Database schema (tables, fields, relationships)
- Key business logic
- Authentication/authorization approach
- Sample code snippets for critical endpoints

Then call the \`be_implement_api\` tool with your API implementation as the \`input\` parameter. After the tool responds, show the user the exact download URL.`,

    fe_implement: (input) => `You are a Frontend Engineer. Based on this spec/API: "${input}"

Write the frontend implementation plan covering:
- Component tree structure
- State management approach
- Key components with props/interfaces
- API integration points
- Routing structure
- Sample code snippets for key components

Then call the \`fe_implement\` tool with your frontend implementation as the \`input\` parameter. After the tool responds, show the user the exact download URL.`,

    fe_validate: (input) => `You are a Frontend Engineer doing code review. Based on this implementation: "${input}"

Perform a validation review covering:
- Code quality assessment
- Performance concerns
- Accessibility issues
- Browser compatibility
- Bundle size considerations
- Recommended improvements with code examples

Then call the \`fe_validate\` tool with your validation report as the \`input\` parameter. After the tool responds, show the user the exact download URL.`,

    qa_write_tests: (input) => `You are a QA Engineer. Based on this implementation: "${input}"

Write a comprehensive test plan covering:
- Unit tests (with example test code)
- Integration tests
- E2E test scenarios
- Edge cases & negative tests
- Performance test scenarios
- Test data requirements

Then call the \`qa_write_tests\` tool with your test plan as the \`input\` parameter. After the tool responds, show the user the exact download URL.`,

    devops_deploy: (input) => `You are a DevOps Engineer. Based on this project: "${input}"

Write the deployment plan covering:
- CI/CD pipeline configuration (YAML example)
- Docker/containerization setup
- Environment configuration (dev/staging/prod)
- Infrastructure as code snippets
- Monitoring & alerting setup
- Rollback strategy

Then call the \`devops_deploy\` tool with your deployment plan as the \`input\` parameter. After the tool responds, show the user the exact download URL.`,
  };

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const tool = promptToTool[name];
    if (!tool) throw new Error(`Unknown prompt: ${name}`);
    const input = (args as Record<string, string>)?.input ?? "";

    let text: string;

    if (tool === "run_pipeline") {
      text = `You are orchestrating a full software development pipeline for: "${input}"

Execute each agent IN ORDER. Each agent does REAL work based on the previous agent's output. Pass the full output of each agent as context to the next.

**Step 1 — PM Agent (create-spec)**
Write a product specification for: "${input}"
Cover: problem statement, goals, user stories, acceptance criteria.

**Step 2 — PM Agent (write-ticket)**
Based on the spec from Step 1, write detailed dev tickets with title, description, acceptance criteria, and story points.

**Step 3 — Architect Agent**
Based on Steps 1-2, design the system architecture: tech stack, data models, API overview, scalability considerations.

**Step 4 — Designer Agent**
Based on Steps 1-3, create UI/UX design spec: user flows, key screens, components, design tokens.

**Step 5 — Backend Engineer**
Based on Steps 1-4, write API implementation: endpoints, DB schema, business logic, code snippets.

**Step 6 — Frontend Engineer**
Based on Steps 1-5, write frontend implementation: component tree, state management, API integration, code snippets.

**Step 7 — Frontend QA**
Based on Step 6, validate the frontend: code quality, performance, accessibility, improvements.

**Step 8 — QA Engineer**
Based on Steps 1-7, write test plan: unit tests, integration tests, E2E scenarios, edge cases.

**Step 9 — DevOps Engineer**
Based on all steps, write deployment plan: CI/CD config, Docker setup, environments, monitoring.

Format your output with clear section headers for each agent. Then call the \`run_pipeline\` tool with the complete output as the \`input\` parameter. After the tool responds, show the user the exact download URL.`;
    } else {
      text = agentPrompts[tool]?.(input) ?? `Call the ${tool} tool with input: ${input}. Show the download URL after.`;
    }

    return {
      description: prompts.find(p => p.name === name)?.description,
      messages: [{ role: "user", content: { type: "text", text } }],
    };
  });

  return server;
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
