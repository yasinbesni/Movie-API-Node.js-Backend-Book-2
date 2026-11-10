import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";

export const uploadAvatarToCloudinary = (webpBuffer) => {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
    secure: true,
  });

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "movie-api/avatars",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result?.secure_url) {
          return reject(new Error("Cloudinary adres döndürmedi."));
        }
        resolve(result.secure_url);
      },
    );

    stream.on("error", reject);
    stream.end(webpBuffer);
  });
};
