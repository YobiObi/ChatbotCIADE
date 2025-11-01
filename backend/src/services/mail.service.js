// backend/src/services/mail.service.js
import nodemailer from "nodemailer";

/**
 * En Render el SMTP suele dar ETIMEDOUT.
 * Con Brevo podemos usar la API HTTP v3 y así evitar puertos bloqueados.
 * Si hay BREVO_API_KEY -> usamos API
 * Si no -> caemos a SMTP (para local).
 */

async function sendWithBrevoAPI({ to, subject, html, text, from }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return null;

  const payload = {
    sender: {
      name: from?.split("<")[0]?.trim() || "CIADE",
      email: from?.match(/<(.*)>/)?.[1] || from || "no-reply@ciade.local",
    },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  };

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Brevo API error ${res.status}: ${errBody}`);
  }

  const data = await res.json();
  console.log("[mail] (Brevo API) enviado:", data);
  return data;
}

let transporter;
function getTransporter() {
  if (!transporter) {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      throw new Error("Faltan variables SMTP en .env");
    }
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

export async function sendMail({
  to,
  subject,
  html,
  text,
  cc,
  bcc,
  replyTo,
  alternatives = [],
  attachments = [],
}) {
  const from = process.env.MAIL_FROM || "CIADE <no-reply@ciade.local>";

  // 1) intentar con Brevo API (HTTPS)
  try {
    if (process.env.BREVO_API_KEY) {
      const data = await sendWithBrevoAPI({ to, subject, html, text, from });
      return { messageId: data?.messageId || data?.message || "brevo-api" };
    }
  } catch (e) {
    console.error("[mail] Brevo API falló, intento SMTP:", e.message);
    // seguimos al fallback
  }

  // 2) fallback a SMTP (para local)
  const tx = getTransporter();
  const info = await tx.sendMail({
    from,
    to,
    subject,
    html,
    text,
    cc,
    bcc,
    replyTo,
    alternatives,
    attachments,
  });
  console.log(`[mail] (SMTP) enviado a ${to}: ${subject} (${info.messageId})`);
  return info;
}
