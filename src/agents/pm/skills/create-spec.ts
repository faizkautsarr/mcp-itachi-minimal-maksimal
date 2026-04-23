import { generateAgentOutput } from "../../../lib/generate.js";

export async function createSpec(seed: string): Promise<string> {
  const output = await generateAgentOutput("PM Agent", "product specifications, user stories, and requirements", seed);
  return `[PM — create-spec] ${output}`;
}
