import { generateAgentOutput } from "../../../lib/generate.js";

export async function reviewArchitecture(seed: string): Promise<string> {
  const output = await generateAgentOutput("Architect Agent", "system architecture, microservices, APIs, and scalability", seed);
  return `[Architect — review] ${output}`;
}
