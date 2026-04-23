import { generateAgentOutput } from "../../../lib/generate.js";

export async function writeTests(seed: string): Promise<string> {
  const output = await generateAgentOutput("QA Engineer Agent", "test cases, unit tests, integration tests, and assertions", seed);
  return `[QA — write-tests] ${output}`;
}
