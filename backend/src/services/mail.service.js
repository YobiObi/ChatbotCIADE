// backend/src/services/mail.service.js
import nodemailer from "nodemailer";
import { Resend } from "resend";

// cache
let resendClient = null;

function getResend() {
  const { RESEND_API_KEY } = process.env;
  if (!RESEND_API_KEY) return null;
  if (!resendClient) {
    resendClient = new Resend(RESEND_API_KEY);
  }
  return resendClient;
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
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
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
  const from = process.env.MAIL_FROM || "CIADE <onboarding@resend.dev>";

  // 1) intentar con Resend
  const resend = getResend();
  if (resend) {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("[mail] Resend devolvió error:", error);
      // dejamos seguir al fallback SMTP por si estás en local
    } else {
      console.log(
        `[mail] (Resend) Enviado a ${to}: ${subject} (${data?.id || "sin-id"})`
      );
      return { messageId: data?.id || null };
    }
  }

  // 2) fallback a SMTP (solo si no hubo Resend o hubo error)
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
  console.log(`[mail] (SMTP) Enviado a ${to}: ${subject} (${info.messageId})`);
  return info;
}
