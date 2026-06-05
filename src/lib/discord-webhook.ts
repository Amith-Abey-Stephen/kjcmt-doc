const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

export async function sendDiscordWebhook(
  event: string,
  fields: { name: string; value: string; inline?: boolean }[],
  color: number = 0x5865f2
) {
  if (!WEBHOOK_URL) return;
  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title: event,
            color,
            fields,
            timestamp: new Date().toISOString(),
            footer: { text: "KJCMT DOC" },
          },
        ],
      }),
    });
  } catch (error) {
    console.error("Failed to send Discord webhook:", error);
  }
}
