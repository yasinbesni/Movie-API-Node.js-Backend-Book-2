import { env } from "./config/env.js";
import { initMongoConnection } from "./db/initMongoConnection.js";
import { logger } from "./logging/logger.js";
import { app } from "./server.js";

const startServer = async () => {
  try {
    await initMongoConnection();

    app.listen(
      env.port,
      "0.0.0.0",
      () => {
        logger.info(
          { port: env.port },
          "Server çalışmaya başladı.",
        );
      },
    );
  } catch (error) {
    logger.error(
      { err: error },
      "Uygulama başlatılamadı.",
    );
  }
};

startServer();
