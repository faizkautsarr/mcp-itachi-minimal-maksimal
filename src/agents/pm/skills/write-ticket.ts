import { generateAgentOutput } from "../../../lib/generate.js";

export async function writeTicket(seed: string): Promise<string> {
  const output = await generateAgentOutput("PM Agent", "tickets, tasks, sprint planning, and issue tracking", seed);
  return `[PM — write-ticket] ${output}`;
}
