import { runPipeline } from "./orchestrator.js";
import { sendTelegram } from "./telegram.js";
import { saveFile } from "../files.js";

function lastWord(text: string): string {
  return text.trim().split(/\s+/).pop() ?? text;
}

export interface JiraWebhookPayload {
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

function extractDescription(payload: JiraWebhookPayload): string | null {
  const items = payload.changelog?.items ?? [];
  const descChange = items.find(i => i.field === "description");
  if (descChange) return descChange.toString;

  const raw = payload.issue?.fields?.description;
  if (!raw) return null;
  if (typeof raw === "string") return raw;

  // Jira doc format (Atlassian Document Format)
  return raw.content
    ?.flatMap(b => b.content ?? [])
    .map(n => n.text ?? "")
    .join(" ") ?? null;
}

export async function handleJiraWebhook(body: string): Promise<{ status: string }> {
  const payload = JSON.parse(body) as JiraWebhookPayload;
  const issueKey = payload.issue?.key ?? "unknown";
  const summary = payload.issue?.fields?.summary ?? "";
  const description = extractDescription(payload);

  if (!description) {
    return { status: "skipped: no description" };
  }

  const seed = lastWord(description);

  await sendTelegram(
    `🚀 <b>Itachi Pipeline Dimulai</b>\n\n` +
    `📋 Issue: <b>${issueKey}</b>\n` +
    `📝 Summary: ${summary}\n` +
    `🌱 Seed word: <b>${seed}</b>\n\n` +
    `⏳ Memproses 9 agent...`
  );

  const results = await runPipeline(seed);

  const summary2 = results.map(r => {
    const url = saveFile(r.label.replace(/[\s—]+/g, "_"), `[${r.label}] ${r.output}`);
    return { agent: r.label, output: r.output, url };
  });

  const finalContent = [
    `=== Pipeline Selesai ===`,
    `Issue: ${issueKey} — ${summary}`,
    `Seed: "${seed}"`,
    ``,
    ...summary2.map(s => `[${s.agent}] ${s.output} | ${s.url}`),
  ].join("\n");

  const finalUrl = saveFile("run_pipeline", finalContent);

  await sendTelegram(
    `✅ <b>Pipeline Selesai!</b>\n\n` +
    `📋 Issue: <b>${issueKey}</b>\n` +
    `🔗 Hasil lengkap: ${finalUrl}\n\n` +
    results.map((r, i) => `${i + 1}. [${r.label}] ${r.output}`).join("\n")
  );

  return { status: "ok" };
}
