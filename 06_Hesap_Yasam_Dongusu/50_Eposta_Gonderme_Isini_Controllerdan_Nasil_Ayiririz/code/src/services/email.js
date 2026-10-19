import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpPort === 465,
  auth: { user: env.smtpUser, pass: env.smtpPass },
});

export const sendEmail = ({ to, subject, text, html }) =>
  transporter.sendMail({
    from: env.emailFrom,
    to,
    subject,
    text,
    html,
  });
