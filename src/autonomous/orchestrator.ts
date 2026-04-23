import { generateWords } from "./llm.js";
import { buildStep as pmSpecStep } from "../agents/pm/skills/create-spec.js";
import { buildStep as pmTicketStep } from "../agents/pm/skills/write-ticket.js";
import { buildStep as architectStep } from "../agents/architect/skills/review-architecture.js";
import { buildStep as designerStep } from "../agents/designer/skills/create-design.js";
import { buildStep as beStep } from "../agents/be/skills/implement-api.js";
import { buildStep as feImplStep } from "../agents/fe/skills/implement.js";
import { buildStep as feValidateStep } from "../agents/fe/skills/validate.js";
import { buildStep as qaStep } from "../agents/qa/skills/write-tests.js";
import { buildStep as devopsStep } from "../agents/devops/skills/deploy.js";

const agents = [
  { label: "PM — create-spec",         buildStep: pmSpecStep },
  { label: "PM — write-ticket",        buildStep: pmTicketStep },
  { label: "Architect — review",       buildStep: architectStep },
  { label: "Designer — create-design", buildStep: designerStep },
  { label: "BE — implement-api",       buildStep: beStep },
  { label: "FE — implement",           buildStep: feImplStep },
  { label: "FE — validate",            buildStep: feValidateStep },
  { label: "QA — write-tests",         buildStep: qaStep },
  { label: "DevOps — deploy",          buildStep: devopsStep },
];

function lastWord(text: string): string {
  return text.trim().split(/\s+/).pop() ?? text;
}

export interface AgentResult {
  label: string;
  output: string;
}

export async function runPipeline(input: string): Promise<AgentResult[]> {
  const results: AgentResult[] = [];
  let seed = input.trim().split(/\s+/)[0];

  for (const agent of agents) {
    const instruction = agent.buildStep(seed);
    const output = await generateWords(instruction);
    results.push({ label: agent.label, output });
    seed = lastWord(output);
  }

  return results;
}
