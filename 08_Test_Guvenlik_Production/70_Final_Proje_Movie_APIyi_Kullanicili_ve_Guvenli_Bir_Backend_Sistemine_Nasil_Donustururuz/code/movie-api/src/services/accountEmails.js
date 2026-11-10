import { sendEmail } from "./email.js";
import { verificationLink, passwordResetLink } from "../utils/accountEmails.js";
export const sendVerificationEmail = (to, rawToken) =>
  sendEmail({
    to,
    subject: "E-posta adresini doğrula",
    text: `Adresini doğrulamak için: ${verificationLink(rawToken)}`,
  });

export const sendPasswordResetEmail = (to, rawToken) =>
  sendEmail({
    to,
    subject: "Parolanı yenile",
    text: `Yeni parola belirlemek için: ${passwordResetLink(rawToken)}`,
  });
export const sendEmailChangeCode = (to, rawToken) =>
  sendEmail({
    to,
    subject: "Yeni e-posta adresini doğrula",
    text: [
      "Movie API hesabınızın e-posta adresi için değişiklik istendi.",
      "Doğrulama kodunuz:",
      rawToken,
      "Bu kodu e-posta değişikliği onay isteğinde kullanın.",
      "İsteği siz yapmadıysanız bu mesajı yok sayın.",
    ].join("\n"),
  });
