import { runPipeline } from "../../orchestrator.js";
import { saveFile } from "../../../../files.js";
import { sendTelegram } from "../../notifiers/telegram.js";
import { sendTeams } from "../../notifiers/teams.js";

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
    items?: Array<{ field: string; fromString?: string; toString: string }>;
  };
}

function extractDescriptionChange(payload: JiraPayload): { before: string; after: string } | null {
  const descChange = payload.changelog?.items?.find(i => i.field === "description");
  if (descChange) return { before: descChange.fromString ?? "-", after: descChange.toString };

  const raw = payload.issue?.fields?.description;
  if (!raw) return null;
  const text = typeof raw === "string" ? raw : (raw.content
    ?.flatMap(b => b.content ?? [])
    .map(n => n.text ?? "")
    .join(" ") ?? "");
  return text ? { before: "-", after: text } : null;
}

function jakartaTime(): string {
  return new Date().toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  }) + " WIB";
}

export async function handleJiraWebhook(body: string): Promise<{ status: string }> {
  const payload = JSON.parse(body) as JiraPayload;
  const issueKey = payload.issue?.key ?? "unknown";
  const summary = payload.issue?.fields?.summary ?? "";
  const change = extractDescriptionChange(payload);

  if (!change) return { status: "skipped: no description" };

  const seed = lastWord(change.after);

  const startMsg = `🚀 Pipeline Dimulai\n\nIssue       : ${issueKey} — ${summary}\nSebelum     : ${change.before}\nSesudah     : ${change.after}\nKata diambil: ${seed}\nTimestamp   : ${jakartaTime()}\n\n⏳ Memproses 9 agent...`;

  await Promise.all([
    sendTelegram(startMsg.replace(`Kata diambil: ${seed}`, `Kata diambil: <b>${seed}</b>`)),
    sendTeams(startMsg),
  ]);

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

  await Promise.all([
    sendTelegram(`✅ <b>Pipeline Selesai!</b>\n📋 <b>${issueKey}</b>\n🔗 ${finalUrl}`),
    sendTeams(`✅ Pipeline Selesai!\n📋 ${issueKey}\n🔗 ${finalUrl}`),
  ]);

  return { status: "ok" };
}
