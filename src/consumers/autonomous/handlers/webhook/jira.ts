import { runPipeline } from "../../orchestrator.js";
import { saveFile } from "../../../../files.js";
import { sendTelegram } from "../../notifiers/telegram.js";

function lastWord(text: string): string {
  return text.trim().split(/\s+/).pop() ?? text;
}

interface JiraPayload {
  issue?: {
    key?: string;
    fields?: {
      summary?: string;
      description?: string | { content?: Array<{ content?: Array<{ text?: string }> }> };
    };
  };
  changelog?: {
    items?: Array<{ field: string; toString: string }>;
  };
}

function extractDescription(payload: JiraPayload): string | null {
  const descChange = payload.changelog?.items?.find(i => i.field === "description");
  if (descChange) return descChange.toString;

  const raw = payload.issue?.fields?.description;
  if (!raw) return null;
  if (typeof raw === "string") return raw;

  return raw.content
    ?.flatMap(b => b.content ?? [])
    .map(n => n.text ?? "")
    .join(" ") ?? null;
}

export async function handleJiraWebhook(body: string): Promise<{ status: string }> {
  const payload = JSON.parse(body) as JiraPayload;
  const issueKey = payload.issue?.key ?? "unknown";
  const summary = payload.issue?.fields?.summary ?? "";
  const description = extractDescription(payload);

  if (!description) return { status: "skipped: no description" };

  const seed = lastWord(description);

  await sendTelegram(`🚀 <b>Pipeline Dimulai</b>\n📋 <b>${issueKey}</b>: ${summary}\n🌱 Seed: <b>${seed}</b>\n⏳ Memproses 9 agent...`);

  const results = await runPipeline(seed);

  const agents = results.map(r => {
    const url = saveFile(r.label.replace(/[\s—]+/g, "_"), `[${r.label}] ${r.output}`);
    return { agent: r.label, output: r.output, url };
  });

  const finalContent = [
    `=== Pipeline Selesai ===`,
    `Issue: ${issueKey} — ${summary}`,
    `Seed: "${seed}"`,
    ``,
    ...agents.map(a => `[${a.agent}] ${a.output} | ${a.url}`),
  ].join("\n");

  const finalUrl = saveFile("run_pipeline", finalContent);

  await sendTelegram(`✅ <b>Pipeline Selesai!</b>\n📋 <b>${issueKey}</b>\n🔗 ${finalUrl}`);

  return { status: "ok" };
}
