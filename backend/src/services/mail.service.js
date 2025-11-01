// backend/src/services/mail.service.js
import nodemailer from "nodemailer";
import { Resend } from "resend";

/**
 * En producción (Render) estamos usando Resend porque SMTP suele dar ETIMEDOUT.
 * Si existe RESEND_API_KEY -> usamos Resend
 * Si NO existe -> caemos a Nodemailer como antes
 */

// cache simple de Resend (para no recrearlo)
let resendClient = null;

/**
 * Obtiene una instancia de Resend si hay API key
 */
function getResend() {
  const { RESEND_API_KEY } = process.env;
  if (!RESEND_API_KEY) return null;

  // import dinámico para no romper si no está instalado
  if (!resendClient) {
    // eslint-disable-next-line global-require
    resendClient = new Resend(RESEND_API_KEY);
  }
  return resendClient;
}

/**
 * Transporter global único (solo si usamos SMTP)
 */
let transporter;

/**
 * Retorna un transporter configurado a partir de variables .env
 */
function getTransporter() {
  if (!transporter) {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      throw new Error("Faltan variables SMTP en .env");
    }

    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: Number(SMTP_PORT) === 465, // true solo para 465 (SSL)
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  return transporter;
}

/**
 * Envía un correo HTML simple.
 * Firma compatible con el resto del proyecto.
 */
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

  // 1) Intentar con Resend primero
  const resend = getResend();
  if (resend) {
    // Resend espera un array de destinatarios o string
    const payload = {
      from,
      to,
      subject,
      html,
    };

    // algunos campos no son estándar en Resend, así que los ignoramos o los mapeamos
    if (text) payload.text = text;

    // Resend no tiene "alternatives" como Nodemailer, así que los omitimos
    // Adjuntos: Resend los soporta, pero habría que mapearlos.
    // Para mantenerlo simple, los ignoramos aquí.

    const result = await resend.emails.send(payload);
    console.log(`[mail] (Resend) Enviado a ${to}: ${subject} (${result?.id || "sin-id"})`);
    return result;
  }

  // 2) Si no hay RESEND_API_KEY -> usar SMTP como antes
  const tx = getTransporter();

  const mailOptions = {
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
  };

  const info = await tx.sendMail(mailOptions);

  console.log(`[mail] (SMTP) Enviado a ${to}: ${subject} (${info.messageId})`);
  return info;
}
