// backend/src/services/mail.service.js
import nodemailer from "nodemailer";

async function sendWithBrevoAPI({ to, subject, html, text, from }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn("[mail] No hay BREVO_API_KEY definida");
    return null;
  }

  // log solo para debug
  console.log("[mail] usando Brevo API key (inicio):", apiKey.slice(0, 8), "...");

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

  const body = await res.text();

  if (!res.ok) {
    console.error("[mail] Brevo API respondió error:", res.status, body);
    throw new Error(`Brevo API error ${res.status}: ${body}`);
  }

  const data = JSON.parse(body);
  console.log("[mail] (Brevo API) enviado OK:", data);
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

export async function sendMail({ to, subject, html, text }) {
  const from = process.env.MAIL_FROM || "CIADE <no-reply@ciade.local>";

  // 1) intentar por Brevo API (HTTPS)
  try {
    if (process.env.BREVO_API_KEY) {
      const data = await sendWithBrevoAPI({ to, subject, html, text, from });
      return { messageId: data?.messageId || "brevo-api" };
    }
  } catch (e) {
    console.error("[mail] Brevo API falló, probando SMTP...", e.message);
  }

  // 2) fallback SMTP (local)
  const tx = getTransporter();
  const info = await tx.sendMail({ from, to, subject, html, text });
  console.log(`[mail] (SMTP) enviado a ${to}: ${subject} (${info.messageId})`);
  return info;
}
