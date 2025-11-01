import nodemailer from "nodemailer";

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

export async function sendMail({ to, subject, html }) {
  const tx = getTransporter();
  const info = await tx.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    html,
  });
  console.log(`[mail] Enviado a ${to}: ${subject} (${info.messageId})`);
  return info;
}
