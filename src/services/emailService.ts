import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export async function sendMail({
  to,
  subject,
  text,
  html,
  from,
}: {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}) {
  const info = await transporter.sendMail({
    from: from || `"Academy CRM" <${process.env.EMAIL_USER}>`,
    to: Array.isArray(to) ? to.join(", ") : to,
    subject,
    text,
    html,
  });
  return info;
} 