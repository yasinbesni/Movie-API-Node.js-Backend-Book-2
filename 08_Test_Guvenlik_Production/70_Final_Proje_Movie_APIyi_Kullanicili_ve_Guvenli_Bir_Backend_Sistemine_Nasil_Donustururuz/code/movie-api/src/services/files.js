import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export const avatarDirectory = path.join(
  process.cwd(), "uploads", "avatars",
);

// İki saklama yönteminde de kullanılacak görsel hazırlama adımı.
const prepareAvatarWebp = async (buffer) => {
  try {
    const image = sharp(buffer, {
      limitInputPixels: 16_000_000,
      failOn: "error",
    });
    const info = await image.metadata();
    if (!["jpeg", "png", "webp"].includes(info.format)) {
      throw new Error("Desteklenmeyen görsel biçimi.");
    }

    return await image
      .rotate()
      .resize(512, 512, { fit: "cover" })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    const error = new Error("Geçerli bir görsel yükleyin.");
    error.status = 400;
    throw error;
  }
};

const saveAvatarToDisk = async ({ userId, webp }) => {
  await mkdir(avatarDirectory, { recursive: true });
  const filename = `${userId.toString()}-${randomUUID()}.webp`;
  await writeFile(path.join(avatarDirectory, filename), webp, {
    flag: "wx",
  });

  return `/uploads/avatars/${filename}`;
};

import { env } from "../config/env.js";
import { uploadAvatarToCloudinary } from "./cloudinary.js";
export const saveAvatar = async ({ userId, buffer }) => {
  const webp = await prepareAvatarWebp(buffer);

  if (env.avatarStorage === "cloudinary") {
    try {
      return await uploadAvatarToCloudinary(webp);
    } catch {
      const error = new Error("Fotoğraf buluta yüklenemedi.");
      error.status = 502;
      throw error;
    }
  }

  return saveAvatarToDisk({ userId, webp });
};
