import { generateAgentOutput } from "../../../lib/generate.js";

export async function createDesign(seed: string): Promise<string> {
  const output = await generateAgentOutput("Designer Agent", "UI/UX design, wireframes, components, and user flows", seed);
  return `[Designer — create-design] ${output}`;
}
