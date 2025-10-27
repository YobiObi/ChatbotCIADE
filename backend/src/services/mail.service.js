// backend/src/services/mail.service.js
import nodemailer from "nodemailer";

/**
 * Transporter global único (para no recrearlo en cada envío)
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
 * Envía un correo HTML simple, con opción de adjuntos o alternativas.
 * @param {object} opts
 * @param {string|string[]} opts.to - destinatario(s)
 * @param {string} opts.subject - asunto
 * @param {string} opts.html - cuerpo HTML
 * @param {string} [opts.text] - cuerpo plano alternativo
 * @param {string|string[]} [opts.cc] - CC opcional
 * @param {string|string[]} [opts.bcc] - BCC opcional
 * @param {string} [opts.replyTo] - dirección de respuesta
 * @param {Array} [opts.alternatives] - versiones alternativas (p. ej., calendario)
 * @param {Array} [opts.attachments] - archivos adjuntos
 * @returns {Promise<object>} info - información devuelta por Nodemailer
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
  const tx = getTransporter();

  const mailOptions = {
    from: process.env.MAIL_FROM,
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

  console.log(`[mail] Enviado a ${to}: ${subject} (${info.messageId})`);
  return info;
}
