import { env } from "../config/env.js";
import { sendEmail } from "./email.js";
import { prepareSupportAttachment } from "./prepareSupportAttachment.js";

export const submitSupportRequest = async ({ user, message, file }) => {
  if (!env.supportEmailTo) {
    const error = new Error("Destek e-posta hizmeti şu anda kullanılamıyor.");
    error.status = 503;
    throw error;
  }

  const attachments = await prepareSupportAttachment(file);

  await sendEmail({
    to: env.supportEmailTo,
    replyTo: user.email,
    subject: "Movie API | Yeni yardım talebi",
    text: [
      "Yeni yardım talebi",
      `Kullanıcı kimliği: ${user._id}`,
      `Kayıtlı e-posta: ${user.email}`,
      "",
      "Kullanıcının mesajı:", message,
    ].join("\n"),
    attachments, // Sadece destek ekibine giden e-postada var.
  });

  try {
    await sendEmail({
      to: user.email,
      subject: "Movie API | Yardım talebiniz alındı",
      text: [
        "Merhaba,", "",
        "Yardım talebiniz alınmıştır. İnceleme gerektiğinde",
        "kayıtlı e-posta adresiniz üzerinden iletişime geçebiliriz.",
        "Bu otomatik bildirim, sorunun çözüldüğü anlamına gelmez.",
      ].join("\n"),
    });
  } catch (error) {
    console.error("Destek alındı e-postası gönderilemedi:", {
      code: error?.code ?? "unknown",
    });
  }
};
