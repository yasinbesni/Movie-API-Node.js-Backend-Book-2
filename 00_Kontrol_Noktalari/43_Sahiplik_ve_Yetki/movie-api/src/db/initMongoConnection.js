import mongoose from "mongoose";

import { env } from "../config/env.js";
import { logger } from "../logging/logger.js";

export const initMongoConnection = async () => {
  try {
    await mongoose.connect(env.mongodbUrl);

    logger.info(
      "MongoDB bağlantısı başarılı.",
    );
  } catch (error) {
    logger.error(
      { err: error },
      "MongoDB bağlantısı kurulamadı.",
    );

    throw error;
  }
};
