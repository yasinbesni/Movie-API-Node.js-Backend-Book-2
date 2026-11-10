import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpPort === 465,
  ...(env.smtpUser ? { auth: { user: env.smtpUser, pass: env.smtpPass } } : {}),
  connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
});

export const sendEmail = ({ to, subject, text, html, replyTo, attachments }) => {
  if (!env.smtpHost) { const error = new Error("E-posta hizmeti yapılandırılmadı."); error.status = 503; throw error; }
  return transporter.sendMail({
    from: env.emailFrom,
    to,
    subject,
    text,
    html,
    ...(replyTo ? { replyTo } : {}),
    ...(attachments?.length ? { attachments } : {}),
  });
};
