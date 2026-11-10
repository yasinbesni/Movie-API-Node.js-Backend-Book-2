import { env } from "../config/env.js";
import { sendEmail } from "./email.js";

export const submitSupportRequest = async ({ user, message }) => {
  if (!env.supportEmailTo) {
    const error = new Error("Destek e-posta hizmeti şu anda kullanılamıyor.");
    error.status = 503;
    throw error;
  }

  // Önce destek posta kutusuna ilet. Başarısızsa istek hata verir.
  await sendEmail({
    to: env.supportEmailTo,
    replyTo: user.email,
    subject: "Movie API | Yeni yardım talebi",
    text: [
      "Yeni yardım talebi",
      `Kullanıcı kimliği: ${user._id}`,
      `Kayıtlı e-posta: ${user.email}`,
      "",
      "Kullanıcının mesajı:",
      message,
    ].join("\n"),
  });

  // Destek ekibine bildirim gitti; Ada'ya alındı e-postası dene.
  try {
    await sendEmail({
      to: user.email,
      subject: "Movie API | Yardım talebiniz alındı",
      text: [
        "Merhaba,",
        "",
        "Yardım talebiniz alınmıştır. İnceleme gerektiğinde",
        "kayıtlı e-posta adresiniz üzerinden iletişime geçebiliriz.",
        "Bu otomatik bildirim, sorunun çözüldüğü anlamına gelmez.",
      ].join("\n"),
    });
  } catch (error) {
    // Alındı bildirimi başarısız diye ilk e-postayı yeniden yollamayız.
    console.error("Destek alındı e-postası gönderilemedi:", {
      code: error?.code ?? "unknown",
    });
  }
};
