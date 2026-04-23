import { generateAgentOutput } from "../../../lib/generate.js";

export async function implementApi(seed: string): Promise<string> {
  const output = await generateAgentOutput("Backend Engineer Agent", "REST APIs, controllers, database models, and middleware", seed);
  return `[BE — implement-api] ${output}`;
}
