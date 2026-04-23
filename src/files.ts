import { randomUUID } from "crypto";

const BASE_URL = (process.env.BASE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`).replace(/\/$/, "");

export const fileStore = new Map<string, { filename: string; content: string }>();

function toHtml(content: string): string {
  const urlRegex = /(https?:\/\/[^\s|]+)/g;
  const escaped = content
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(urlRegex, '<a href="$1" target="_blank" style="color:#58a6ff">$1</a>');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Itachi Output</title>
  <style>
    body { font-family: monospace; background: #0d1117; color: #c9d1d9; padding: 2rem; line-height: 1.8; }
    pre { white-space: pre-wrap; word-break: break-word; }
  </style>
</head>
<body><pre>${escaped}</pre></body>
</html>`;
}

export function saveFile(toolName: string, content: string): string {
  const id = randomUUID();
  const filename = `${toolName}_${Date.now()}.html`;
  fileStore.set(id, { filename, content: toHtml(content) });
  return `${BASE_URL}/files/${id}`;
}
