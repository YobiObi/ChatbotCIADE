// backend/src/services/email-helpers.js
import { sendMail } from "./mail.service.js";

// En .env: EMAIL_ENABLED=true|false (por si quieres apagar correos sin tocar código)
const EMAIL_ENABLED = String(process.env.EMAIL_ENABLED ?? "true").toLowerCase() === "true";

export async function enviarSiHabilitado({ to, subject, html, cc, bcc, replyTo, headers }) {
  if (!EMAIL_ENABLED) {
    console.warn("[email] envío deshabilitado (EMAIL_ENABLED=false)");
    return null;
  }
  if (!to || !subject || !html) {
    console.warn("[email] faltan campos requeridos {to, subject, html}");
    return null;
  }
  try {
    const res = await sendMail({ to, subject, html, cc, bcc, replyTo, headers });
    console.log(`[mail] Enviado a ${to}: ${subject} (${res?.messageId || "sin-id"})`);
    return res;
  } catch (err) {
    console.error("[email] Error al enviar:", err);
    return null; // no romper flujo de negocio
  }
}
