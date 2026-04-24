import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, ListPromptsRequestSchema, GetPromptRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { saveFile } from "../../files.js";

import { createSpec, buildStep as pmSpecStep } from "../../agents/pm/skills/create-spec.js";
import { writeTicket, buildStep as pmTicketStep } from "../../agents/pm/skills/write-ticket.js";
import { reviewArchitecture, buildStep as architectStep } from "../../agents/architect/skills/review-architecture.js";
import { createDesign, buildStep as designerStep } from "../../agents/designer/skills/create-design.js";
import { implementApi, buildStep as beStep } from "../../agents/be/skills/implement-api.js";
import { implement, buildStep as feImplStep } from "../../agents/fe/skills/implement.js";
import { validate, buildStep as feValidateStep } from "../../agents/fe/skills/validate.js";
import { writeTests, buildStep as qaStep } from "../../agents/qa/skills/write-tests.js";
import { deploy, buildStep as devopsStep } from "../../agents/devops/skills/deploy.js";

import { frontendPreflight, buildStep as hbxPreflightStep } from "../../hbx/commands/frontend-preflight.js";
import { frontendPreflight2, buildStep as hbxPreflight2Step } from "../../hbx/commands/frontend-preflight2.js";
import { frontendImplement, buildStep as hbxImplementStep } from "../../hbx/commands/frontend-implement.js";
import { frontendTest, buildStep as hbxTestStep } from "../../hbx/commands/frontend-test.js";
import { frontendValidate, buildStep as hbxValidateStep } from "../../hbx/commands/frontend-validate.js";
import { frontendReviewer, buildStep as hbxReviewerStep } from "../../hbx/commands/frontend-reviewer.js";
import { prCreate, buildStep as hbxPrCreateStep } from "../../hbx/commands/pr-create.js";

export function createMcpServer(): Server {
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
      },
      {
        name: "itachiitachi--hbx--frontend-preflight",
        description: "HBX: Pre-flight impact analysis for a Jira ticket (Breeze + Jira). Input: ticket key (e.g. PROJ-1234).",
        inputSchema: { type: "object", properties: { input: { type: "string", description: "Jira ticket key" } }, required: ["input"] }
      },
      {
        name: "itachi--hbx--frontend-preflight2",
        description: "HBX: Extended pre-flight with deeper Breeze graph queries. Input: ticket key.",
        inputSchema: { type: "object", properties: { input: { type: "string", description: "Jira ticket key" } }, required: ["input"] }
      },
      {
        name: "itachi--hbx--frontend-implement",
        description: "HBX: Plan-driven parallel code + test generation for a Jira ticket. Requires preflight checkpoint. Input: ticket key.",
        inputSchema: { type: "object", properties: { input: { type: "string", description: "Jira ticket key" } }, required: ["input"] }
      },
      {
        name: "itachi--hbx--frontend-test",
        description: "HBX: Run Vitest and enforce 80% coverage gate. Requires implementation checkpoint. Input: ticket key.",
        inputSchema: { type: "object", properties: { input: { type: "string", description: "Jira ticket key" } }, required: ["input"] }
      },
      {
        name: "itachi--hbx--frontend-validate",
        description: "HBX: Mechanical 13-rule violation check (DS/AB/CP/L10). Requires tests checkpoint. Input: ticket key.",
        inputSchema: { type: "object", properties: { input: { type: "string", description: "Jira ticket key" } }, required: ["input"] }
      },
      {
        name: "itachi--hbx--frontend-reviewer",
        description: "HBX: PR review against HBX code rules and architecture boundaries. Input: ticket key.",
        inputSchema: { type: "object", properties: { input: { type: "string", description: "Jira ticket key" } }, required: ["input"] }
      },
      {
        name: "itachi--hbx--pr-create",
        description: "HBX: Create enriched PR from checkpoint data (AC checklist, coverage, validation). Input: ticket key.",
        inputSchema: { type: "object", properties: { input: { type: "string", description: "Jira ticket key" } }, required: ["input"] }
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
      case "devops_deploy":                  content = deploy(input); break;
      case "itachi--hbx--frontend-preflight":      content = frontendPreflight(input); break;
      case "itachi--hbx--frontend-preflight2":     content = frontendPreflight2(input); break;
      case "itachi--hbx--frontend-implement":      content = frontendImplement(input); break;
      case "itachi--hbx--frontend-test":           content = frontendTest(input); break;
      case "itachi--hbx--frontend-validate":       content = frontendValidate(input); break;
      case "itachi--hbx--frontend-reviewer":       content = frontendReviewer(input); break;
      case "itachi--hbx--pr-create":               content = prCreate(input); break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    const downloadUrl = saveFile(name, content);
    return { content: [{ type: "text", text: `File ready: ${downloadUrl}` }] };
  });

  const prompts = [
    { name: "itachi_run_pipeline",           description: "Run full pipeline: PM → Architect → Designer → BE → FE → QA → DevOps" },
    { name: "itachi_pm_create_spec",         description: "PM Agent: create product spec" },
    { name: "itachi_pm_write_ticket",        description: "PM Agent: write ticket" },
    { name: "itachi_architect_review",       description: "Architect Agent: review architecture" },
    { name: "itachi_designer_create_design", description: "Designer Agent: create design spec" },
    { name: "itachi_be_implement_api",       description: "BE Agent: implement API" },
    { name: "itachi_fe_implement",           description: "FE Agent: implement UI" },
    { name: "itachi_fe_validate",            description: "FE Agent: validate code" },
    { name: "itachi_qa_write_tests",         description: "QA Agent: write tests" },
    { name: "itachi_devops_deploy",          description: "DevOps Agent: deploy" },
    { name: "hbx_frontend_preflight",        description: "HBX: Pre-flight impact analysis for a Jira ticket" },
    { name: "hbx_frontend_preflight2",       description: "HBX: Extended pre-flight with deeper Breeze queries" },
    { name: "hbx_frontend_implement",        description: "HBX: Plan-driven parallel code + test generation" },
    { name: "hbx_frontend_test",             description: "HBX: Run Vitest + enforce 80% coverage gate" },
    { name: "hbx_frontend_validate",         description: "HBX: Mechanical 13-rule violation check" },
    { name: "hbx_frontend_reviewer",         description: "HBX: PR review against code rules" },
    { name: "hbx_pr_create",                 description: "HBX: Create enriched PR from checkpoint" },
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
    hbx_frontend_preflight:        "itachi--hbx--frontend-preflight",
    hbx_frontend_preflight2:       "itachi--hbx--frontend-preflight2",
    hbx_frontend_implement:        "itachi--hbx--frontend-implement",
    hbx_frontend_test:             "itachi--hbx--frontend-test",
    hbx_frontend_validate:         "itachi--hbx--frontend-validate",
    hbx_frontend_reviewer:         "itachi--hbx--frontend-reviewer",
    hbx_pr_create:                 "itachi--hbx--pr-create",
  };

  server.setRequestHandler(ListPromptsRequestSchema, async () => ({
    prompts: prompts.map(p => ({
      name: p.name,
      description: p.description,
      arguments: [{ name: "input", description: "Text input for the agent", required: true }],
    })),
  }));

  const agentRoles: Record<string, { buildStep: (s: string) => string; role: string }> = {
    pm_create_spec:         { buildStep: pmSpecStep,      role: "PM Agent writing product specs and requirements" },
    pm_write_ticket:        { buildStep: pmTicketStep,    role: "PM Agent writing development tickets" },
    architect_review:       { buildStep: architectStep,   role: "Software Architect designing system architecture" },
    designer_create_design: { buildStep: designerStep,    role: "UI/UX Designer creating design specs" },
    be_implement_api:       { buildStep: beStep,          role: "Backend Engineer implementing REST APIs" },
    fe_implement:           { buildStep: feImplStep,      role: "Frontend Engineer building UI components" },
    fe_validate:            { buildStep: feValidateStep,  role: "Frontend Engineer validating code quality" },
    qa_write_tests:         { buildStep: qaStep,          role: "QA Engineer writing test cases" },
    devops_deploy:                   { buildStep: devopsStep,         role: "DevOps Engineer handling deployment" },
    "itachi--hbx--frontend-preflight":     { buildStep: hbxPreflightStep,   role: "Frontend Engineer running pre-flight impact analysis" },
    "itachi--hbx--frontend-preflight2":    { buildStep: hbxPreflight2Step,  role: "Frontend Engineer running extended pre-flight analysis" },
    "itachi--hbx--frontend-implement":     { buildStep: hbxImplementStep,   role: "Frontend Engineer implementing Jira ticket with plan-driven codegen" },
    "itachi--hbx--frontend-test":          { buildStep: hbxTestStep,        role: "Frontend Engineer running Vitest and coverage gate" },
    "itachi--hbx--frontend-validate":      { buildStep: hbxValidateStep,    role: "Frontend Engineer running mechanical violation checks" },
    "itachi--hbx--frontend-reviewer":      { buildStep: hbxReviewerStep,    role: "Frontend Engineer performing PR review" },
    "itachi--hbx--pr-create":              { buildStep: hbxPrCreateStep,    role: "Frontend Engineer creating enriched PR from checkpoint" },
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
