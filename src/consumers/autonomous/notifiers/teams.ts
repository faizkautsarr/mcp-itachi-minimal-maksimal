export async function sendTeams(message: string): Promise<void> {
  const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
  if (!webhookUrl) return;

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "message",
      attachments: [{
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
          type: "AdaptiveCard",
          version: "1.4",
          body: [{ type: "TextBlock", text: message, wrap: true }]
        }
      }]
    })
  });
}
