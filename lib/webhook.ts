interface WebhookResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function sendToTelegram(
  text: string,
  botToken: string,
  chatId: string
): Promise<WebhookResult> {
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
        }),
      }
    );
    if (!res.ok) {
      return { success: false, error: `HTTP ${res.status}: ${res.statusText}` };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export function sendToWhatsApp(
  text: string,
  phoneNumber: string
): WebhookResult {
  const encoded = encodeURIComponent(text);
  const cleanPhone = phoneNumber.replace(/[^0-9+]/g, "");
  const url = `https://wa.me/${cleanPhone}?text=${encoded}`;
  return { success: true, url };
}

export function sendToEmail(
  text: string,
  subject: string,
  to: string
): WebhookResult {
  const encodedBody = encodeURIComponent(text);
  const encodedSubject = encodeURIComponent(subject);
  const url = `mailto:${to}?subject=${encodedSubject}&body=${encodedBody}`;
  return { success: true, url };
}
