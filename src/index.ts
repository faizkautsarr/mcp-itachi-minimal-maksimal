import { createServer, IncomingMessage } from "http";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer } from "./consumers/mcp/server.js";
import { handlePipelineApi } from "./consumers/autonomous/handlers/api/pipeline.js";
import { handleJiraWebhook } from "./consumers/autonomous/handlers/webhook/jira.js";
import { fileStore } from "./files.js";

const PORT = process.env.PORT ?? 3000;
const BASE_URL = (process.env.BASE_URL ?? `http://localhost:${PORT}`).replace(/\/$/, "");

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

  // MCP Streamable HTTP (untuk Smithery)
  if (url.pathname === "/mcp") {
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    const server = createMcpServer();
    await server.connect(transport);
    await transport.handleRequest(req, res, await readBody(req));

  // MCP SSE (untuk Claude Code langsung — tidak diubah)
  } else if (req.method === "GET" && url.pathname === "/sse") {
    const transport = new SSEServerTransport("/message", res);
    transports.set(transport.sessionId, transport);
    res.on("close", () => transports.delete(transport.sessionId));
    await createMcpServer().connect(transport);

  } else if (req.method === "POST" && url.pathname === "/message") {
    const sessionId = url.searchParams.get("sessionId");
    const transport = sessionId ? transports.get(sessionId) : undefined;
    if (!transport) { res.writeHead(400); res.end("Session not found"); return; }
    await transport.handlePostMessage(req, res);

  // Files
  } else if (req.method === "GET" && url.pathname.startsWith("/files/")) {
    const id = url.pathname.slice("/files/".length);
    const file = fileStore.get(id);
    if (!file) { res.writeHead(404); res.end("File not found"); return; }
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(file.content);

  // Autonomous API
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
      const result = await handlePipelineApi(input);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: String(err) }));
    }

  // Webhooks
  } else if (req.method === "POST" && url.pathname === "/webhooks/jira") {
    const body = await readBody(req);
    try {
      const result = await handleJiraWebhook(body);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: String(err) }));
    }

  // Smithery server card
  } else if (req.method === "GET" && url.pathname === "/.well-known/mcp/server-card.json") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      name: "itachi",
      description: "Pipeline agentic 9-agent dengan teknik last-word chaining dalam Bahasa Indonesia. PM → Architect → Designer → BE → FE → QA → DevOps.",
      version: "1.0.0",
      transport: ["sse"]
    }));

  // Health
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
