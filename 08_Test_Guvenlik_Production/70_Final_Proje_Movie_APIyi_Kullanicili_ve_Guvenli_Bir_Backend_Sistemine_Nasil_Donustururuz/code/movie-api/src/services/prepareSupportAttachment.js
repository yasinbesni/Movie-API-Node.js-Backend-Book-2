import { randomUUID } from "node:crypto";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import { scanSupportAttachment } from "./scanSupportAttachment.js";

const allowed = new Set([
  "image/jpeg", "image/png", "image/webp", "application/pdf",
]);

const invalidType = () => {
  const error = new Error("Dosya türü veya içeriği desteklenmiyor.");
  error.status = 415;
  return error;
};

export const prepareSupportAttachment = async (file) => {
  if (!file) return []; // Yalnız mesaj gönderen Ada'yı engellemiyoruz.

  const detected = await fileTypeFromBuffer(file.buffer);
  if (!detected || !allowed.has(detected.mime) ||
      detected.mime !== file.mimetype) {
    throw invalidType();
  }

  // Özgün dosya zararlıysa hiçbir e-postaya ekleme.
  await scanSupportAttachment(file.buffer);

  if (detected.mime === "application/pdf") {
    return [{
      filename: `destek-${randomUUID()}.pdf`,
      content: file.buffer,
      contentType: "application/pdf",
      contentDisposition: "attachment",
    }];
  }

  let safeImage;
  try {
    safeImage = await sharp(file.buffer, {
      limitInputPixels: 16_000_000,
      failOn: "error",
    })
      .rotate()
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    throw invalidType();
  }

  // Yeniden kodlanmış baytlar da tarama denetiminden geçsin.
  await scanSupportAttachment(safeImage);
  return [{
    filename: `destek-${randomUUID()}.webp`,
    content: safeImage,
    contentType: "image/webp",
    contentDisposition: "attachment",
  }];
};
