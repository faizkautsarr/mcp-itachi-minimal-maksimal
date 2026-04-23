import { runPipeline } from "../../orchestrator.js";
import { saveFile } from "../../../../files.js";

export async function handlePipelineApi(input: string): Promise<{ url: string; agents: Array<{ agent: string; output: string; url: string }> }> {
  const results = await runPipeline(input);

  const agents = results.map(r => {
    const url = saveFile(r.label.replace(/[\s—]+/g, "_"), `[${r.label}] ${r.output}`);
    return { agent: r.label, output: r.output, url };
  });

  const finalContent = [
    `=== Pipeline Selesai ===`,
    `Input: "${input}"`,
    ``,
    ...agents.map(a => `[${a.agent}] ${a.output} | ${a.url}`),
  ].join("\n");

  const url = saveFile("run_pipeline", finalContent);

  return { url, agents };
}
